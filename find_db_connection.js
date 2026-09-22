const postgres = require('postgres');

// Probar puerto 5432 y 6543 en pooler sin prefijo y con prefijos de pooler habituales
async function testPooler(connectionString, label) {
  console.log('Testing connection string:', label);
  const sql = postgres(connectionString, { ssl: 'require', connect_timeout: 8 });
  try {
    const res = await sql`SELECT 1 as connected`;
    console.log(`SUCCESS [${label}]:`, res);
    return sql;
  } catch(e) {
    console.log(`FAILED [${label}]:`, e.message);
    await sql.end();
    return null;
  }
}

async function main() {
  const configs = [
    { label: 'Direct db (5432)', url: 'postgresql://postgres:Sixtenet.8907.vane@db.zajprlwljejzxsklkqzu.supabase.co:5432/postgres' },
    { label: 'Pooler 5432 postgres.zajprlwljejzxsklkqzu', url: 'postgresql://postgres.zajprlwljejzxsklkqzu:Sixtenet.8907.vane@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' },
    { label: 'Pooler 6543 postgres.zajprlwljejzxsklkqzu', url: 'postgresql://postgres.zajprlwljejzxsklkqzu:Sixtenet.8907.vane@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' },
    { label: 'Pooler 5432 postgres', url: 'postgresql://postgres:Sixtenet.8907.vane@aws-0-eu-central-1.pooler.supabase.com:5432/postgres' },
    { label: 'Pooler 6543 postgres', url: 'postgresql://postgres:Sixtenet.8907.vane@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' }
  ];

  for (const cfg of configs) {
    const activeSql = await testPooler(cfg.url, cfg.label);
    if (activeSql) {
      console.log('--- CREANDO TABLAS CON CONEXION EXITOSA ---');
      await activeSql`
        CREATE TABLE IF NOT EXISTS landlords (
            phone VARCHAR(30) PRIMARY KEY,
            owner_name VARCHAR(255),
            email VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await activeSql`
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
      await activeSql`CREATE INDEX IF NOT EXISTS idx_properties_phone ON properties(phone);`;
      await activeSql`CREATE INDEX IF NOT EXISTS idx_properties_building ON properties(building_name);`;
      console.log('¡TABLAS CREADAS DE FORMA SPECTACULAR!');
      await activeSql.end();
      break;
    }
  }
}

main();
