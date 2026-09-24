import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabaseServer';

function cleanPhone(rawPhone: string) {
  if (!rawPhone) return '';
  let str = String(rawPhone).trim().replace(/[\s\-\(\)\.]/g, '');
  if (!str) return '';
  if (str.startsWith('00')) str = str.slice(2);
  if (str.startsWith('+')) str = str.slice(1);
  return '+' + str;
}

function parseCSVLine(text: string) {
  const result: string[] = [];
  let cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

async function upsertBatch(supabase: any, rows: any[]) {
  if (!rows.length) return;
  const map = new Map();
  for (const r of rows) {
    const key = `${r.phone}|${r.building_name}|${r.unit_number}`;
    if (!map.has(key)) map.set(key, r);
  }
  const { error } = await supabase
    .from('properties')
    .upsert(Array.from(map.values()), { onConflict: 'phone,building_name,unit_number', ignoreDuplicates: true });
  if (error) {
    console.error('Upsert error:', error.message);
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  let tenant;
  try {
    tenant = await getAuthenticatedTenant();
  } catch (e) {
    if (isAuthError(e)) {
      return NextResponse.json({ success: false, error: e.message }, { status: e.status });
    }
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/);

    const firstLine = lines[0] || '';
    const secondLine = lines[1] || '';
    const isJVC = firstLine.startsWith('JVC') || secondLine.includes('Owner Number') || secondLine.includes('OwnerNameEn');

    let batch: any[] = [];
    let total = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (isJVC) {
        if (i < 2) continue;
        const p = parseCSVLine(line);
        if (p.length < 10) continue;
        const phone = cleanPhone(p[9]);
        if (!phone || phone.length < 5) continue;
        batch.push({
          tenant_id: tenant.tenantId,
          phone,
          owner_name: p[8] || '',
          email: '',
          building_name: p[3] || p[1] || 'JVC Building',
          unit_number: p[4] || '',
          rooms: p[7] || '',
          size_sqm: parseFloat(p[5]) || null,
          plot_number: p[2] || '',
          land_number: p[6] || '',
          area_en: p[0] || 'JVC'
        });
      } else {
        if (i === 0) continue;
        const p = parseCSVLine(line);
        const phone = cleanPhone(p[2]);
        if (!phone || phone.length < 5) continue;
        batch.push({
          tenant_id: tenant.tenantId,
          phone,
          owner_name: p[1] || '',
          email: p[3] || '',
          building_name: p[4] || 'Binghatti Emerald',
          unit_number: p[5] || '',
          rooms: p[7] || '',
        });
      }

      if (batch.length >= 500) {
        await upsertBatch(supabase, batch);
        total += batch.length;
        batch = [];
      }
    }

    if (batch.length) {
      await upsertBatch(supabase, batch);
      total += batch.length;
    }

    return NextResponse.json({ success: true, total_processed: total });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
