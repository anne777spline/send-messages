const net = require('net');
const postgres = require('postgres');

// Resolvemos IPv4 de db.zajprlwljejzxsklkqzu.supabase.co
const socket = net.connect(5432, 'db.zajprlwljejzxsklkqzu.supabase.co', () => {
  console.log('Conectado por socket TCP');
});
socket.on('error', (e) => console.log('Socket error:', e));

const sql = postgres({
  host: 'db.zajprlwljejzxsklkqzu.supabase.co',
  port: 5432,
  database: 'postgres',
  username: 'postgres',
  password: 'Sixtenet.8907.vane',
  ssl: 'require'
});

async function main() {
  try {
    console.log('Creando tablas vía postgres JS direct...');
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
    console.log('¡TABLAS CREADAS EN SUPABASE DE FORMA EXITOSA!');
  } catch (e) {
    console.error('Error al crear tablas:', e.message);
  } finally {
    await sql.end();
  }
}

main();
