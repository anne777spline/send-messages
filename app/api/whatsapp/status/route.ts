import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabaseServer';
import { getInstanceStatus, EvolutionApiError } from '@/lib/evolutionApi';

export async function GET() {
  let tenant;
  try {
    tenant = await getAuthenticatedTenant();
  } catch (e) {
    if (isAuthError(e)) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  try {
    const instanceName = tenant.tenantSlug;
    const evolutionStatus = await getInstanceStatus(instanceName);

    const newStatus =
      evolutionStatus === null
        ? 'not_created'
        : (evolutionStatus as any)?.instance?.state === 'open'
        ? 'connected'
        : 'disconnected';

    // Sincronizar DB con estado real de Evolution
    if (evolutionStatus !== null) {
      const admin = createServerSupabase();
      await admin
        .from('tenant_whatsapp_instances')
        .update({
          status: newStatus,
          last_checked_at: new Date().toISOString(),
          ...(newStatus === 'connected' ? { qr_code: null, qr_expires_at: null } : {}),
        })
        .eq('tenant_id', tenant.tenantId);
    }

    return NextResponse.json({ status: newStatus, instanceName });
  } catch (e) {
    if (e instanceof EvolutionApiError) {
      return NextResponse.json(
        { error: 'WhatsApp service unavailable' },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
