import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function GET(request: Request) {
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
  const { searchParams } = new URL(request.url);
  const area = searchParams.get('area');
  const building = searchParams.get('building');
  const roomsParam = searchParams.get('rooms');
  const search = searchParams.get('search') || searchParams.get('phone') || searchParams.get('q');
  const action = searchParams.get('action');

  try {
    // 1. Get Distinct Areas / Zones
    if (action === 'areas') {
      try {
        const { data, error } = await supabase.rpc('get_tenant_areas', { p_tenant_id: tenant.tenantId });
        if (!error && Array.isArray(data)) {
          const areas = data.map((r: any) => r.area_en).filter(Boolean);
          return NextResponse.json({ success: true, count: areas.length, areas });
        }
      } catch (e) {
        console.warn('RPC get_tenant_areas fallback:', e);
      }

      // Safe Fallback
      const { data: rawData } = await supabase
        .from('properties')
        .select('area_en')
        .eq('tenant_id', tenant.tenantId)
        .not('area_en', 'is', null)
        .limit(2000);
      const set = new Set<string>();
      (rawData || []).forEach((r: any) => {
        if (r.area_en && r.area_en.trim()) set.add(r.area_en.trim());
      });
      const areas = Array.from(set).sort((a, b) => a.localeCompare(b));
      return NextResponse.json({ success: true, count: areas.length, areas });
    }

    // 2. Get Distinct Buildings (optionally filtered by area)
    if (action === 'buildings') {
      try {
        const { data, error } = await supabase.rpc('get_tenant_buildings', {
          p_tenant_id: tenant.tenantId,
          p_area: area && area.trim() ? area.trim() : null
        });
        if (!error && Array.isArray(data)) {
          const buildings = data.map((r: any) => r.building_name).filter(Boolean);
          return NextResponse.json({ success: true, count: buildings.length, buildings });
        }
      } catch (e) {
        console.warn('RPC get_tenant_buildings fallback:', e);
      }

      // Safe Fallback
      let query = supabase
        .from('properties')
        .select('building_name')
        .eq('tenant_id', tenant.tenantId)
        .not('building_name', 'is', null);
      if (area && area.trim()) {
        query = query.ilike('area_en', `%${area.trim()}%`);
      }
      const { data: rawData } = await query.limit(5000);
      const set = new Set<string>();
      (rawData || []).forEach((r: any) => {
        if (r.building_name && r.building_name.trim()) set.add(r.building_name.trim());
      });
      const buildings = Array.from(set).sort((a, b) => a.localeCompare(b));
      return NextResponse.json({ success: true, count: buildings.length, buildings });
    }

    // 3. Get Distinct Rooms
    if (action === 'rooms') {
      try {
        const { data, error } = await supabase.rpc('get_tenant_rooms', { p_tenant_id: tenant.tenantId });
        if (!error && Array.isArray(data)) {
          const rooms = data.map((r: any) => r.rooms).filter(Boolean);
          return NextResponse.json({ success: true, count: rooms.length, rooms });
        }
      } catch (e) {
        console.warn('RPC get_tenant_rooms fallback:', e);
      }

      // Safe Fallback
      const { data: rawData } = await supabase
        .from('properties')
        .select('rooms')
        .eq('tenant_id', tenant.tenantId)
        .not('rooms', 'is', null)
        .limit(2000);
      const set = new Set<string>();
      (rawData || []).forEach((r: any) => {
        if (r.rooms) {
          const raw = String(r.rooms).trim();
          const lower = raw.toLowerCase();
          if (
            raw &&
            lower !== 'null' &&
            lower !== 'undefined' &&
            lower !== 'none' &&
            lower !== 'n/a' &&
            lower !== '-' &&
            lower !== 'nan'
          ) {
            set.add(raw);
          }
        }
      });
      const rooms = Array.from(set).sort((a, b) => a.localeCompare(b));
      return NextResponse.json({ success: true, count: rooms.length, rooms });
    }

    // 4. Main Query for Properties
    let query = supabase
      .from('properties')
      .select('id, phone, owner_name, building_name, unit_number, rooms, size_sqm, email, area_en')
      .eq('tenant_id', tenant.tenantId)
      .order('id', { ascending: true });

    if (area && area.trim()) {
      query = query.ilike('area_en', `%${area.trim()}%`);
    }

    if (building && building.trim()) {
      query = query.eq('building_name', building.trim());
    }

    if (search && search.trim()) {
      const term = search.trim();
      const cleanPhone = term.replace(/[\s\-\(\)\.]/g, '');
      const digitsOnly = cleanPhone.replace(/^\+/, '');

      const conditions = [
        `building_name.ilike.%${term}%`,
        `owner_name.ilike.%${term}%`,
        `unit_number.ilike.%${term}%`,
        `area_en.ilike.%${term}%`
      ];

      if (digitsOnly.length > 0) {
        conditions.push(`phone.ilike.%${cleanPhone}%`);
        conditions.push(`phone.ilike.%${digitsOnly}%`);
      }

      query = query.or(conditions.join(','));
    }

    if (roomsParam && roomsParam.trim()) {
      const selectedRooms = roomsParam.split(',').map(r => r.trim()).filter(Boolean);
      if (selectedRooms.length > 0) {
        query = query.in('rooms', selectedRooms);
      }
    }

    const MAX_RESULTS = 2500;
    const allData: any[] = [];
    let page = 0;
    const pageSize = 1000;

    while (allData.length < MAX_RESULTS) {
      const { data, error } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allData.push(...data);
      if (data.length < pageSize) break;
      page++;
    }

    return NextResponse.json({ success: true, count: allData.length, data: allData });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
