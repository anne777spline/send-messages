import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { building, phoneSearch, template, selectedIds } = body;

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({ success: false, error: 'N8N_WEBHOOK_URL not configured.' }, { status: 500 });
    }

    let query = supabase
      .from('properties')
      .select('id, phone, owner_name, building_name, unit_number, rooms');

    // If specific IDs were selected via checkboxes, dispatch ONLY those
    if (Array.isArray(selectedIds) && selectedIds.length > 0) {
      query = query.in('id', selectedIds);
    } else {
      if (building) query = query.eq('building_name', building);
      if (phoneSearch) {
        const cleanInput = phoneSearch.trim();
        const digitsOnly = cleanInput.replace(/\D/g, '');
        if (digitsOnly.length > 0) {
          query = query.or(`phone.ilike.%${cleanInput}%,phone.ilike.%${digitsOnly}%`);
        } else {
          query = query.ilike('phone', `%${cleanInput}%`);
        }
      }
    }

    const { data, error } = await query.limit(2000);
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'No contacts selected or found.' }, { status: 404 });
    }

    const leads = data.map((row: any) => {
      let message = template || "Good day, I hope you're doing well.";
      message = message
        .replace(/{owner_name}/gi, row.owner_name || '')
        .replace(/{building_name}/gi, row.building_name || '')
        .replace(/{unit_number}/gi, row.unit_number || '')
        .replace(/{rooms}/gi, row.rooms || '')
        .replace(/\s+/g, ' ').trim();
      return {
        id: row.id,
        phone: row.phone,
        owner_name: row.owner_name,
        building_name: row.building_name,
        unit_number: row.unit_number,
        message
      };
    });

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_name: building || 'Selected Leads Campaign',
        total_leads: leads.length,
        leads
      })
    });

    return NextResponse.json({
      success: true,
      total_sent: leads.length,
      n8n_status: n8nResponse.status,
      sample_message: leads[0]?.message
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
