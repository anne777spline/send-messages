const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zajprlwljejzxsklkqzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphanBybHdsamVqenhza2xrcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAxNTQ0NCwiZXhwIjoyMTA1NTkxNDQ0fQ.XU6EyVtnOB0TcZcsrlvk9ndzyqdvA2rlzE9jN4Asr6M';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSchema() {
  console.log('Probando si las tablas se crearon en el SQL Editor de Supabase...');
  const resLandlords = await supabase.from('landlords').select('count', { count: 'exact' });
  console.log('Estado de la tabla landlords:', resLandlords);
  
  const resProperties = await supabase.from('properties').select('count', { count: 'exact' });
  console.log('Estado de la tabla properties:', resProperties);
}

testSchema();
