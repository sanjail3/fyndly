import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAndUploadAvatar } from '@/lib/server/avatar-generation';
import { prisma } from '@/lib/prisma';

const MAX_REGENERATIONS = 4;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized: Missing Authorization header' }, { status: 401 });
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gender, name } = await req.json();

    if (!gender || !name) {
      return NextResponse.json({ error: 'Gender and name are required' }, { status: 400 });
    }

    // 1. Check regeneration count first
    const userProfile = await prisma.users.findUnique({
      where: { id: user.id },
      select: { avatar_regeneration_count: true },
    });

    // If user profile does not exist, allow avatar generation but do not update DB
    if (!userProfile) {
      const newAvatarUrl = await generateAndUploadAvatar(user.id, name, gender);
      return NextResponse.json({ avatarUrl: newAvatarUrl });
    }

    if (userProfile.avatar_regeneration_count >= MAX_REGENERATIONS) {
      return NextResponse.json({ error: `Regeneration limit of ${MAX_REGENERATIONS} reached.` }, { status: 400 });
    }

    // 2. Generate and upload avatar (external, slow)
    const newAvatarUrl = await generateAndUploadAvatar(user.id, name, gender);

    // 3. Update user in DB
    await prisma.users.update({
      where: { id: user.id },
      data: {
        avatar_url: newAvatarUrl.split('?')[0],
        avatar_regeneration_count: { increment: 1 },
      },
    });

    return NextResponse.json({ avatarUrl: newAvatarUrl });

  } catch (error: any) {
    console.error("Error in generate-avatar route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 