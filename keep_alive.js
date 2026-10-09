const { createClient } = require('@supabase/supabase-js');

// These should be set in the environment where the script runs (e.g. GitHub Secrets)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zajprlwljejzxsklkqzu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Supabase URL and Key are required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function keepAlive() {
  console.log(`[${new Date().toISOString()}] Ping to Supabase to prevent pause...`);
  try {
    const { data, error } = await supabase.from('landlords').select('id').limit(1);
    
    if (error) {
      console.error('Error pinging Supabase:', error);
      process.exit(1);
    }
    
    console.log('Success! Supabase project is active.');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

keepAlive();
