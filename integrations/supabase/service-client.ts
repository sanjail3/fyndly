import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Service role client that bypasses RLS
// This should only be used in server-side API routes
export const createServiceSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for service client');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Export a singleton instance for convenience
export const supabaseService = createServiceSupabaseClient(); 