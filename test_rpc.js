const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zajprlwljejzxsklkqzu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphanBybHdsamVqenhza2xrcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAxNTQ0NCwiZXhwIjoyMTA1NTkxNDQ0fQ.XU6EyVtnOB0TcZcsrlvk9ndzyqdvA2rlzE9jN4Asr6M';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createTablesViaRPC() {
  console.log('Intentando ejecutar SQL a través de Supabase RPC...');
  const ddl = `
    CREATE TABLE IF NOT EXISTS landlords (
        phone VARCHAR(30) PRIMARY KEY,
        owner_name VARCHAR(255),
        email VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(30) REFERENCES landlords(phone) ON DELETE CASCADE,
        building_name VARCHAR(255) NOT NULL,
        unit_number VARCHAR(100),
        rooms VARCHAR(50),
        size_sqm NUMERIC(10, 2),
        plot_number VARCHAR(100),
        land_number VARCHAR(100),
        area_en VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_phone_building_unit UNIQUE (phone, building_name, unit_number)
    );
    CREATE INDEX IF NOT EXISTS idx_properties_phone ON properties(phone);
    CREATE INDEX IF NOT EXISTS idx_properties_building ON properties(building_name);
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: ddl });
  console.log('RPC Result:', { data, error });
}

createTablesViaRPC();
