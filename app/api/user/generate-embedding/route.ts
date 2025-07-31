import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { generateAndSaveEmbeddingPrisma } from '@/lib/server/embedding-generation-prisma';

export async function POST(req: NextRequest) {
  try {
    console.log("POST: Generate embedding request received");
    
    // Get user session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Session error:", sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId || userId.trim() === '') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify the user can only generate embeddings for themselves
    if (session.user.id !== userId.trim()) {
      return NextResponse.json({ error: 'Unauthorized: Can only generate embeddings for yourself' }, { status: 403 });
    }

    // Create service client for embedding generation
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log("Generating embedding for user:", userId);
    const success = await generateAndSaveEmbeddingPrisma(userId.trim(), serviceSupabase);

    if (!success) {
      return NextResponse.json({ error: 'Failed to generate user embedding' }, { status: 500 });
    }

    console.log("Successfully generated embedding for user:", userId);
    return NextResponse.json({ success: true, message: 'Embedding generated successfully' });

  } catch (error: any) {
    console.error("Error in generate-embedding route:", error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
} 