import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// This utility function creates a Supabase client configured for Route Handlers
// It ensures that cookies are accessed asynchronously.
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  return createRouteHandlerClient({ cookies: () => cookieStore });
}; 