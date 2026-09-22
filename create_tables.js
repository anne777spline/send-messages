const postgres = require('postgres');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

// Pooler con tenant identifier postgres.zajprlwljejzxsklkqzu
const DB_URL = 'postgresql://postgres.zajprlwljejzxsklkqzu:Sixtenet.8907.vane@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';
const sql = postgres(DB_URL, { ssl: 'require' });

async function createTables() {
  console.log('Conectando a Supabase Pooler...');
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS landlords (
          phone VARCHAR(30) PRIMARY KEY,
          owner_name VARCHAR(255),
          email VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('1. Tabla landlords creada.');

    await sql`
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
    `;
    console.log('2. Tabla properties creada.');

    await sql`CREATE INDEX IF NOT EXISTS idx_properties_phone ON properties(phone);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_building ON properties(building_name);`;
    console.log('3. Índices creados exitosamente en Supabase.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sql.end();
  }
}

createTables();
