const postgres = require('postgres');

// Formato de Supabase Session Pooler
const DB_URL = 'postgresql://postgres.zajprlwljejzxsklkqzu:Sixtenet.8907.vane@aws-0-eu-central-1.pooler.supabase.com:5432/postgres';
const sql = postgres(DB_URL, { ssl: 'require' });

async function run() {
  try {
    console.log('Creando tablas en Supabase vía Session Pooler...');
    await sql`
      CREATE TABLE IF NOT EXISTS landlords (
          phone VARCHAR(30) PRIMARY KEY,
          owner_name VARCHAR(255),
          email VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
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
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_phone ON properties(phone);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_properties_building ON properties(building_name);`;
    console.log('¡TABLAS CREADAS CORRECTAMENTE EN SUPABASE!');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sql.end();
  }
}

run();
