import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabaseServer';
import type { DetectedSchema } from './detect-schema/route';

function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cell = '',
    inQuotes = false;
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

function cleanRoomsValue(raw: any): string {
  if (!raw) return '';
  const str = String(raw).trim();
  const lower = str.toLowerCase();
  if (
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'none' ||
    lower === 'n/a' ||
    lower === '-' ||
    lower === 'nan'
  ) {
    return '';
  }
  return str.slice(0, 50);
}

function cleanUniversalPhone(rawPhone: string, defaultDialCode: string = ''): string {
  if (!rawPhone) return '';
  let str = String(rawPhone).trim();
  if (!str) return '';
  const lower = str.toLowerCase();
  if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'none' || lower === '-') {
    return '';
  }

  // Handle scientific notation if Excel exported phone as 9.71501E+11
  if (/^\d+\.\d+e\+\d+$/i.test(str)) {
    const num = Number(str);
    if (!isNaN(num)) str = String(Math.round(num));
  }

  const hadPlus = str.startsWith('+');
  // Strip all non-digit characters
  let digits = str.replace(/\D/g, '');
  if (!digits || digits.length < 6) return '';

  const dialCode = String(defaultDialCode || '').replace(/\D/g, '');

  // Remove 00 international prefix
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
    return '+' + digits;
  }

  if (hadPlus) {
    // Fix common mistake like +050... when country code is known
    if (digits.startsWith('0') && dialCode) {
      digits = dialCode + digits.slice(1);
    }
    return '+' + digits;
  }

  // Local trunk prefix starting with 0 (e.g. 050... in UAE, 07... in UK, 06... in France)
  if (digits.startsWith('0') && dialCode) {
    digits = dialCode + digits.slice(1);
    return '+' + digits;
  }

  // Local number without leading 0 and without country code (e.g. 9 digits in UAE/Spain, 10 digits in US/Mexico)
  if (dialCode && !digits.startsWith(dialCode) && digits.length <= 10) {
    digits = dialCode + digits;
  }

  return '+' + digits;
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
    .upsert(Array.from(map.values()), { onConflict: 'phone,building_name,unit_number', ignoreDuplicates: false });
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
    let text = '';
    let schema: DetectedSchema | null = null;
    let buildingFilter = '';
    let preMappedRows: any[] | null = null;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (Array.isArray(body.rows)) {
        preMappedRows = body.rows;
      } else {
        text = body.csvText || body.text || '';
        schema = body.schema || null;
        buildingFilter = (body.buildingFilter || '').trim();
      }
    } else {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
      text = await file.text();
    }

    // Mode 1: Pre-mapped universal rows from client batching engine
    if (preMappedRows) {
      const validRows: any[] = [];
      for (const r of preMappedRows) {
        const phone = cleanUniversalPhone(r.phone, r.defaultDialCode || '');
        if (!phone || phone.length < 7) continue;
        validRows.push({
          tenant_id: tenant.tenantId,
          phone,
          owner_name: String(r.owner_name || '').trim().slice(0, 255),
          email: String(r.email || '').trim().slice(0, 255),
          building_name: String(r.building_name || 'Imported Building').trim().slice(0, 255),
          unit_number: String(r.unit_number || '').trim().slice(0, 100),
          rooms: cleanRoomsValue(r.rooms),
          size_sqm: typeof r.size_sqm === 'number' && !isNaN(r.size_sqm) ? Number(r.size_sqm.toFixed(2)) : null,
          plot_number: String(r.plot_number || '').trim().slice(0, 100),
          land_number: String(r.land_number || '').trim().slice(0, 100),
          area_en: String(r.area_en || '').trim().slice(0, 255)
        });
      }

      if (validRows.length > 0) {
        await upsertBatch(supabase, validRows);
      }

      return NextResponse.json({ success: true, total_processed: validRows.length });
    }

    // Mode 2: CSV Text with AI Detected Schema (or fallback)
    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'CSV content is empty.' }, { status: 400 });
    }

    const lines = text.split(/\r?\n/);
    let batch: any[] = [];
    let total = 0;

    if (schema && schema.mapping && schema.mapping.phone !== null) {
      const m = schema.mapping;
      const dialCode = schema.defaultDialCode || '';
      const roleCol = schema.roleFilter?.columnIndex;
      const allowedRoles = (schema.roleFilter?.allowedValues || []).map(v => v.toLowerCase().trim());

      for (let i = 0; i < lines.length; i++) {
        if (i <= schema.headerRowIndex) continue;
        const line = lines[i].trim();
        if (!line || line.replace(/,/g, '').trim().length === 0) continue;

        const p = parseCSVLine(line);

        // Role filter check (e.g., Buyer vs Seller)
        if (typeof roleCol === 'number' && roleCol >= 0 && allowedRoles.length > 0) {
          const cellRole = (p[roleCol] || '').toLowerCase().trim();
          if (cellRole && !allowedRoles.some(ar => cellRole.includes(ar))) {
            continue;
          }
        }

        const rawPhone = m.phone !== null ? p[m.phone] : '';
        const phone = cleanUniversalPhone(rawPhone, dialCode);
        if (!phone || phone.length < 7) continue;

        const bldgPrimary = m.building_name !== null ? (p[m.building_name] || '').trim() : '';
        const bldgFallback = m.project_fallback !== null ? (p[m.project_fallback] || '').trim() : '';
        const building_name = bldgPrimary || bldgFallback || schema.defaultBuildingName || 'Imported Building';

        if (buildingFilter) {
          const filterUpper = buildingFilter.toUpperCase();
          if (
            !building_name.toUpperCase().includes(filterUpper) &&
            !bldgFallback.toUpperCase().includes(filterUpper)
          ) {
            continue;
          }
        }

        let sizeVal = m.size !== null ? parseFloat(p[m.size]) : null;
        if (sizeVal !== null && !isNaN(sizeVal)) {
          if (schema.sizeUnit === 'sqft') {
            sizeVal = Number((sizeVal * 0.092903).toFixed(2));
          } else {
            sizeVal = Number(sizeVal.toFixed(2));
          }
        } else {
          sizeVal = null;
        }

        const roomsRaw = m.rooms !== null ? (p[m.rooms] || '').trim() : '';

        batch.push({
          tenant_id: tenant.tenantId,
          phone,
          owner_name: (m.owner_name !== null ? p[m.owner_name] || '' : '').trim().slice(0, 255),
          email: (m.email !== null ? p[m.email] || '' : '').trim().slice(0, 255),
          building_name: (buildingFilter ? buildingFilter : building_name).slice(0, 255),
          unit_number: (m.unit_number !== null ? p[m.unit_number] || '' : '').trim().slice(0, 100),
          rooms: cleanRoomsValue(roomsRaw),
          size_sqm: sizeVal,
          plot_number: (m.plot_number !== null ? p[m.plot_number] || '' : '').trim().slice(0, 100),
          land_number: (m.land_number !== null ? p[m.land_number] || '' : '').trim().slice(0, 100),
          area_en: (m.area_en !== null ? p[m.area_en] || '' : '').trim().slice(0, 255)
        });

        if (batch.length >= 500) {
          await upsertBatch(supabase, batch);
          total += batch.length;
          batch = [];
        }
      }
    } else {
      // Legacy fallback if called without schema
      const firstLine = lines[0] || '';
      const secondLine = lines[1] || '';
      const isJVC = firstLine.startsWith('JVC') || secondLine.includes('Owner Number') || secondLine.includes('OwnerNameEn');
      const isDLD = firstLine.includes('ProcedurePartyTypeNameEn') || firstLine.includes('BuildingNameEn');

      let dldIndices: Record<string, number> = {};
      if (isDLD) {
        const headers = parseCSVLine(firstLine).map(h => h.trim());
        headers.forEach((h, idx) => {
          dldIndices[h] = idx;
        });
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.replace(/,/g, '').trim().length === 0) continue;

        if (isDLD) {
          if (i === 0) continue;
          const p = parseCSVLine(line);
          const party = p[dldIndices['ProcedurePartyTypeNameEn'] ?? 14] || '';
          if (party !== 'Buyer') continue;
          const phone = cleanUniversalPhone(p[dldIndices['Mobile'] ?? 16], '971');
          if (!phone || phone.length < 7) continue;
          const sizeVal = parseFloat(p[dldIndices['Size'] ?? 7]) || null;
          const bldgName = p[dldIndices['BuildingNameEn'] ?? 6] || p[dldIndices['Project'] ?? 3] || 'Imported Building';
          batch.push({
            tenant_id: tenant.tenantId,
            phone,
            owner_name: (p[dldIndices['NameEn'] ?? 15] || '').trim(),
            email: '',
            building_name: bldgName.trim(),
            unit_number: (p[dldIndices['UnitNumber'] ?? 8] || '').trim(),
            rooms: '',
            size_sqm: sizeVal,
            plot_number: p[dldIndices['Plot Pre Reg No'] ?? 4] || '',
            land_number: p[dldIndices['LandNumber'] ?? 12] || '',
            area_en: p[dldIndices['Master Project'] ?? 2] || ''
          });
        } else if (isJVC) {
          if (i < 2) continue;
          const p = parseCSVLine(line);
          if (p.length < 10) continue;
          const phone = cleanUniversalPhone(p[9], '971');
          if (!phone || phone.length < 7) continue;
          batch.push({
            tenant_id: tenant.tenantId,
            phone,
            owner_name: p[8] || '',
            email: '',
            building_name: p[3] || p[1] || 'Imported Building',
            unit_number: p[4] || '',
            rooms: p[7] || '',
            size_sqm: parseFloat(p[5]) || null,
            plot_number: p[2] || '',
            land_number: p[6] || '',
            area_en: p[0] || ''
          });
        } else {
          if (i === 0) continue;
          const p = parseCSVLine(line);
          const phone = cleanUniversalPhone(p[2]);
          if (!phone || phone.length < 7) continue;
          batch.push({
            tenant_id: tenant.tenantId,
            phone,
            owner_name: p[1] || '',
            email: p[3] || '',
            building_name: p[4] || 'Imported Building',
            unit_number: p[5] || '',
            rooms: p[7] || ''
          });
        }

        if (batch.length >= 500) {
          await upsertBatch(supabase, batch);
          total += batch.length;
          batch = [];
        }
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
