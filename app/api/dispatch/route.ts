import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  // 1. Autenticar
  let tenant;
  try {
    tenant = await getAuthenticatedTenant();
  } catch (e) {
    if (isAuthError(e)) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  const admin = createServerSupabase();

  // 2. Verificar instancia conectada para ESTE tenant
  const { data: instance } = await admin
    .from('tenant_whatsapp_instances')
    .select('instance_name, status')
    .eq('tenant_id', tenant.tenantId)
    .single();

  if (!instance || instance.status !== 'connected') {
    return NextResponse.json(
      { error: 'WhatsApp is not connected for this account. Please connect first.' },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { building, phoneSearch, template, selectedIds } = body;

  // 3. Consultar properties filtradas por tenant
  let query = admin
    .from('properties')
    .select('id, phone, owner_name, building_name, unit_number, rooms')
    .eq('tenant_id', tenant.tenantId);

  if (Array.isArray(selectedIds) && selectedIds.length > 0) {
    query = query.in('id', selectedIds);
  } else {
    if (building) query = query.eq('building_name', building);
    if (phoneSearch) {
      const clean = phoneSearch.trim();
      const digits = clean.replace(/\D/g, '');
      if (digits.length > 0) {
        query = query.or(`phone.ilike.%${clean}%,phone.ilike.%${digits}%`);
      } else {
        query = query.ilike('phone', `%${clean}%`);
      }
    }
  }

  // 4. Paginar (máx 2500)
  const allContacts: any[] = [];
  let page = 0;
  const PAGE_SIZE = 1000;
  while (allContacts.length < 2500) {
    const { data, error } = await query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;
    allContacts.push(...data);
    if (data.length < PAGE_SIZE) break;
    page++;
  }

  if (allContacts.length === 0) {
    return NextResponse.json({ error: 'No contacts found.' }, { status: 404 });
  }

  const leads = allContacts.map((row) => {
    let message = template || "Good day, I hope you're doing well.";
    message = message
      .replace(/{owner_name}/gi, row.owner_name || '')
      .replace(/{building_name}/gi, row.building_name || '')
      .replace(/{unit_number}/gi, row.unit_number || '')
      .replace(/{rooms}/gi, row.rooms || '')
      .replace(/[ \t]+/g, ' ')
      .trim();
    return {
      id: row.id,
      phone: row.phone,
      owner_name: row.owner_name,
      building_name: row.building_name,
      unit_number: row.unit_number,
      message,
    };
  });

  // 5. Enviar a n8n con autenticación server-to-server
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[dispatch] N8N_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
  }

  const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': webhookSecret,
    },
    body: JSON.stringify({
      instance_name: instance.instance_name,
      campaign_name: building || 'Selected Leads Campaign',
      total_leads: leads.length,
      leads,
    }),
  });

  if (!n8nResponse.ok) {
    console.error('[dispatch] n8n webhook responded with', n8nResponse.status);
    return NextResponse.json(
      { error: 'Failed to dispatch campaign. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    success: true,
    total_sent: leads.length,
    sample_message: leads[0]?.message,
  });
}
