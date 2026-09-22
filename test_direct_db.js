const postgres = require('postgres');
const sql = postgres('postgresql://postgres:Sixtenet.8907.vane@db.zajprlwljejzxsklkqzu.supabase.co:5432/postgres', { ssl: 'require' });

async function run() {
  try {
    const res = await sql`SELECT 1 as res`;
    console.log('CONEXION EXITOSA DIRECTA A SUPABASE:', res);
    
    console.log('Creando tablas...');
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
    console.log('TABLAS E INDICES CREADOS EXITOSAMENTE.');
  } catch (e) {
    console.error('ERROR AL CONECTAR/CREAR:', e);
  } finally {
    await sql.end();
  }
}

run();
