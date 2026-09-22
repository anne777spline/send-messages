const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zajprlwljejzxsklkqzu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphanBybHdsamVqenhza2xrcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAxNTQ0NCwiZXhwIjoyMTA1NTkxNDQ0fQ.XU6EyVtnOB0TcZcsrlvk9ndzyqdvA2rlzE9jN4Asr6M';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanPhone(rawPhone) {
  if (!rawPhone) return '';
  let str = String(rawPhone).trim().replace(/[\s\-\(\)\.]/g, '');
  if (!str) return '';
  // Remove leading 00 international prefix
  if (str.startsWith('00')) str = str.slice(2);
  // Remove leading +
  if (str.startsWith('+')) str = str.slice(1);
  return '+' + str;
}

function parseCSVLine(text) {
  const result = [];
  let cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(cell.trim()); cell = ''; }
    else { cell += c; }
  }
  result.push(cell.trim());
  return result;
}

async function upsertBatch(rows) {
  if (!rows.length) return;
  // Deduplicate locally
  const map = new Map();
  for (const r of rows) {
    const key = `${r.phone}|${r.building_name}|${r.unit_number}`;
    if (!map.has(key)) map.set(key, r);
  }
  const unique = Array.from(map.values());
  const { error } = await supabase
    .from('properties')
    .upsert(unique, { onConflict: 'phone,building_name,unit_number', ignoreDuplicates: true });
  if (error) console.error('Upsert error:', error.message);
}

async function processBinghatti() {
  const filePath = path.join(__dirname, 'listings', 'binghatti-emerald-lanlords.csv');
  console.log(`Processing ${filePath}...`);
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  let lineCount = 0, batch = [];

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1 || !line.trim()) continue;
    const p = parseCSVLine(line);
    const phone = cleanPhone(p[2] || '');
    if (!phone || phone.length < 5) continue;
    batch.push({
      phone,
      owner_name: p[1] || '',
      email: p[3] || '',
      building_name: p[4] || 'Binghatti Emerald',
      unit_number: p[5] || '',
      rooms: p[7] || '',
    });
  }
  await upsertBatch(batch);
  console.log(`Binghatti done: ${batch.length} rows.`);
}

async function processJVC(filename) {
  const filePath = path.join(__dirname, 'listings', filename);
  console.log(`Processing ${filePath}...`);
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  let lineCount = 0, total = 0, batch = [];

  for await (const line of rl) {
    lineCount++;
    if (lineCount <= 2 || !line.trim()) continue;
    const p = parseCSVLine(line);
    if (p.length < 10) continue;
    const phone = cleanPhone(p[9] || '');
    if (!phone || phone.length < 5) continue;
    batch.push({
      phone,
      owner_name: p[8] || '',
      email: '',
      building_name: p[3] || p[1] || 'JVC Building',
      unit_number: p[4] || '',
      rooms: p[7] || '',
      size_sqm: parseFloat(p[5]) || null,
      plot_number: p[2] || '',
      land_number: p[6] || '',
      area_en: p[0] || 'JVC'
    });
    if (batch.length >= 1000) {
      await upsertBatch(batch);
      total += batch.length;
      batch = [];
      if (lineCount % 20000 === 0) console.log(`  ${lineCount} lines...`);
    }
  }
  if (batch.length) { await upsertBatch(batch); total += batch.length; }
  console.log(`${filename} done: ${total} rows.`);
}

async function main() {
  console.log('Starting import into single properties table...');
  await processBinghatti();
  await processJVC('lanlords-jvc.csv');
  await processJVC('sadiq-data-jvc.csv');
  console.log('IMPORT COMPLETE!');
}

main();
