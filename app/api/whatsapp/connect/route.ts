import { NextResponse } from 'next/server';
import { getAuthenticatedTenant, isAuthError } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabaseServer';
import {
  getInstanceStatus,
  createInstance,
  fetchInstanceQR,
  deleteInstance,
  EvolutionApiError,
} from '@/lib/evolutionApi';

export async function POST() {
  // 1. Autenticar y resolver tenant
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
  const instanceName = tenant.tenantSlug;

  try {
    // 2. Consultar estado real en Evolution API
    const evolutionStatus = await getInstanceStatus(instanceName);
    const evolutionState = (evolutionStatus as any)?.instance?.state;

    // 3a. Ya conectado en Evolution -> sincronizar DB y devolver
    if (evolutionState === 'open') {
      await admin.from('tenant_whatsapp_instances').upsert(
        {
          tenant_id: tenant.tenantId,
          instance_name: instanceName,
          status: 'connected',
          connected_at: new Date().toISOString(),
          qr_code: null,
          qr_expires_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id' }
      );
      return NextResponse.json({ status: 'connected', instanceName });
    }

    // 3b. Instancia no existe -> crearla
    if (evolutionStatus === null) {
      const created = await createInstance(instanceName);
      const qr = (created as any)?.qrcode?.base64 ?? (created as any)?.base64 ?? null;
      const expiresAt = new Date(Date.now() + 60_000).toISOString();

      await admin.from('tenant_whatsapp_instances').upsert(
        {
          tenant_id: tenant.tenantId,
          instance_name: instanceName,
          status: 'connecting',
          qr_code: qr,
          qr_expires_at: expiresAt,
          evolution_data: created,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id' }
      );

      return NextResponse.json({ status: 'connecting', qrCode: qr, expiresAt });
    }

    // 3c. Instancia en estado error -> intentar recrear
    if (evolutionState === 'error' || evolutionState === 'failed') {
      try {
        await deleteInstance(instanceName);
      } catch {
        // Continuar si la instancia no existía
      }
      const created = await createInstance(instanceName);
      const qr = (created as any)?.qrcode?.base64 ?? (created as any)?.base64 ?? null;
      const expiresAt = new Date(Date.now() + 60_000).toISOString();

      await admin.from('tenant_whatsapp_instances').upsert(
        {
          tenant_id: tenant.tenantId,
          instance_name: instanceName,
          status: 'connecting',
          qr_code: qr,
          qr_expires_at: expiresAt,
          evolution_data: created,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tenant_id' }
      );

      return NextResponse.json({ status: 'connecting', qrCode: qr, expiresAt });
    }

    // 3d. Existe pero desconectada -> pedir nuevo QR
    const reconnect = await fetchInstanceQR(instanceName);
    const qr = (reconnect as any)?.base64 ?? (reconnect as any)?.qrcode?.base64 ?? null;
    const expiresAt = new Date(Date.now() + 60_000).toISOString();

    await admin.from('tenant_whatsapp_instances').upsert(
      {
        tenant_id: tenant.tenantId,
        instance_name: instanceName,
        status: 'connecting',
        qr_code: qr,
        qr_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id' }
    );

    return NextResponse.json({ status: 'connecting', qrCode: qr, expiresAt });
  } catch (e) {
    if (e instanceof EvolutionApiError) {
      console.error(`[whatsapp/connect] Evolution API error ${e.statusCode}:`, e.message);
      return NextResponse.json(
        { error: 'WhatsApp service unavailable. Please try again.' },
        { status: 502 }
      );
    }
    console.error('[whatsapp/connect] Unexpected error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
