import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServerSupabase } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar si el contexto no permite set
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('[auth/callback] Error exchanging code:', error?.message);
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  const user = data.user;
  const admin = createServerSupabase();

  // Verificar si el tenant ya existe para este usuario
  const { data: existing } = await admin
    .from('tenant_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    // Primer login: provisionar tenant automáticamente
    const slug = `tenant-${user.id.replace(/-/g, '').slice(0, 8)}`;

    const { data: tenant, error: tenantError } = await admin
      .from('tenants')
      .insert({ name: user.email ?? user.id, slug })
      .select('id')
      .single();

    if (tenantError || !tenant) {
      console.error('[auth/callback] Error creating tenant:', tenantError?.message);
      return NextResponse.redirect(`${origin}/?error=tenant_creation_failed`);
    }

    await admin.from('tenant_users').insert({
      user_id: user.id,
      tenant_id: tenant.id,
      role: 'owner',
    });
  }

  return NextResponse.redirect(origin);
}
