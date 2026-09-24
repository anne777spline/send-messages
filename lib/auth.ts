import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabaseServer';

export type AuthenticatedTenant = {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  role: string;
};

/**
 * Resuelve el tenant del usuario autenticado desde la cookie de sesión.
 *
 * Patrón para @supabase/ssr 0.12.7 + Next.js 15:
 * - cookies() es async en Next.js 15, debe ser awaited
 * - createServerClient recibe el store ya resuelto
 * - getUser() verifica el JWT contra el servidor de Supabase Auth
 *
 * NUNCA acepta tenant_id del body del request.
 * Lanza NextResponse-compatible errors si no está autenticado.
 */
export async function getAuthenticatedTenant(): Promise<AuthenticatedTenant> {
  // Next.js 15: cookies() es async
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // En API routes de solo lectura (GET) esto puede no ejecutarse.
          // Es necesario para el callback de OAuth.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar si estamos en un Server Component de solo lectura
          }
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw { status: 401, message: 'Unauthorized' };
  }

  // Resolver tenant desde DB (service role) — NUNCA del request
  const admin = createServerSupabase();
  const { data: membership, error: membershipError } = await admin
    .from('tenant_users')
    .select('tenant_id, role, tenants(slug)')
    .eq('user_id', user.id)
    .single(); // v1: 1 usuario = 1 tenant. Si hay 0 o >1, lanza error deliberadamente.

  if (membershipError || !membership) {
    throw { status: 403, message: 'No tenant assigned to this account' };
  }

  return {
    userId: user.id,
    tenantId: membership.tenant_id,
    tenantSlug: (membership.tenants as any).slug,
    role: membership.role,
  };
}

/** Helper para capturar errores de getAuthenticatedTenant() en API routes */
export function isAuthError(e: unknown): e is { status: number; message: string } {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e;
}
