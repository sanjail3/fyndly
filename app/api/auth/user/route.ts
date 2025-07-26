// app/api/auth/user/route.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { supabaseService } from '@/integrations/supabase/service-client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get the current user session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ user: null });
  }

  console.log(session)
  
  return NextResponse.json({ 
    user: session.user
  });
}