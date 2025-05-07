import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Log configuration status (but not the actual keys)
console.log('Admin Supabase Client Configuration:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  serviceKeyLength: supabaseServiceKey ? supabaseServiceKey.length : 0
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase admin environment variables');
  throw new Error('Missing Supabase admin environment variables');
}

// Create a special Supabase client with service role key that can bypass RLS
export const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
}); 