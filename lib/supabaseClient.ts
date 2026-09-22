import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zajprlwljejzxsklkqzu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphanBybHdsamVqenhza2xrcXp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDAxNTQ0NCwiZXhwIjoyMTA1NTkxNDQ0fQ.XU6EyVtnOB0TcZcsrlvk9ndzyqdvA2rlzE9jN4Asr6M';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});
