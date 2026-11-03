const { createClient } = require('@supabase/supabase-js');

// 1. URL and Key configuration
// Priority: Environment variables (GitHub Secrets) -> Safe fallback to public project anon credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zajprlwljejzxsklkqzu.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphanBybHdsamVqenhza2xrcXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMTU0NDQsImV4cCI6MjEwNTU5MTQ0NH0.Ju18CszM5qzAMHLCiUWv4izWYbtQJRjVHGoMZRVjGDI';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Supabase URL and Key are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function keepAlive() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Initiating keep-alive ping to Supabase (${SUPABASE_URL})...`);

  try {
    // Ping the 'properties' table (which exists in the database)
    const { data, error } = await supabase.from('properties').select('id').limit(1);

    if (error) {
      console.warn(`Query on 'properties' returned: ${error.message}. Trying 'tenants' table fallback...`);
      const fallback = await supabase.from('tenants').select('id').limit(1);
      if (fallback.error) {
        console.error('Both primary and fallback queries failed:', fallback.error);
        process.exitCode = 1;
        return;
      }
      console.log('Success! Fallback query on tenants succeeded. Supabase project is active.');
      process.exitCode = 0;
      return;
    }

    console.log(`Success! Pinged 'properties' table. Rows found: ${data ? data.length : 0}. Supabase project is active.`);
    process.exitCode = 0;
  } catch (err) {
    console.error('Unexpected error while keeping Supabase awake:', err);
    process.exitCode = 1;
  }
}

keepAlive();
