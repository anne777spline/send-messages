import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const building = searchParams.get('building');
  const search = searchParams.get('search') || searchParams.get('phone') || searchParams.get('q');
  const action = searchParams.get('action');

  try {
    if (action === 'buildings') {
      // 1. Fetch ALL pages using the RPC function get_distinct_buildings
      let allBuildings: string[] = [];
      let page = 0;
      const pageSize = 1000;
      let usedRpc = false;

      while (true) {
        const { data, error } = await supabase
          .rpc('get_distinct_buildings')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error('RPC pagination error:', error.message);
          break;
        }

        if (!data || data.length === 0) {
          usedRpc = true;
          break;
        }

        usedRpc = true;
        data.forEach((r: any) => {
          const name = typeof r === 'string' ? r : r.building_name;
          if (name && name.trim()) allBuildings.push(name.trim());
        });

        if (data.length < pageSize) break;
        page++;
      }

      // 2. Fallback if RPC is not available
      if (!usedRpc || allBuildings.length === 0) {
        const set = new Set<string>();
        for (let p = 0; p < 65; p++) {
          const { data, error } = await supabase
            .from('properties')
            .select('building_name')
            .not('building_name', 'is', null)
            .range(p * 1000, (p + 1) * 1000 - 1);
          if (error || !data || data.length === 0) break;
          data.forEach((r: any) => {
            if (r.building_name && r.building_name.trim()) {
              set.add(r.building_name.trim());
            }
          });
        }
        allBuildings = Array.from(set);
      }

      const uniqueSorted = Array.from(new Set(allBuildings)).sort((a, b) => a.localeCompare(b));
      return NextResponse.json({ success: true, count: uniqueSorted.length, buildings: uniqueSorted });
    }

    let query = supabase
      .from('properties')
      .select('id, phone, owner_name, building_name, unit_number, rooms, size_sqm, email')
      .order('id', { ascending: true });

    // Exact or contains filter from the building dropdown
    if (building && building.trim()) {
      query = query.eq('building_name', building.trim());
    }

    // Flexible written search: matches building, owner, unit, or phone (contains / case-insensitive)
    if (search && search.trim()) {
      const term = search.trim();
      const cleanPhone = term.replace(/[\s\-\(\)\.]/g, '');
      const digitsOnly = cleanPhone.replace(/^\+/, '');

      const conditions = [
        `building_name.ilike.%${term}%`,
        `owner_name.ilike.%${term}%`,
        `unit_number.ilike.%${term}%`
      ];

      if (digitsOnly.length > 0) {
        conditions.push(`phone.ilike.%${cleanPhone}%`);
        conditions.push(`phone.ilike.%${digitsOnly}%`);
      }

      query = query.or(conditions.join(','));
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
