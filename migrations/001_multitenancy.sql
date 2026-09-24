-- ============================================================
-- Migración 001: Arquitectura Multi-Tenant SaaS
-- Proyecto: send-messages (Sixtenet)
-- ============================================================

-- PASO 1: Crear tablas de tenancy
CREATE TABLE IF NOT EXISTS tenants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenant_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS tenant_whatsapp_instances (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  instance_name    TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'not_created',
  qr_code          TEXT,
  qr_expires_at    TIMESTAMPTZ,
  connected_at     TIMESTAMPTZ,
  last_checked_at  TIMESTAMPTZ,
  evolution_data   JSONB,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id),
  UNIQUE(instance_name)
);

-- PASO 2: Agregar tenant_id a properties de forma NULLABLE (seguro para las 60,135 filas existentes)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON properties(tenant_id);

-- PASO 3: Activar Row Level Security (RLS)
ALTER TABLE tenants                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties                ENABLE ROW LEVEL SECURITY;

-- Política de lectura para tenant_users (necesaria para el cliente del browser)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenant_users' AND policyname = 'users_see_own_memberships'
  ) THEN
    CREATE POLICY "users_see_own_memberships"
      ON tenant_users FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;
