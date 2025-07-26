import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const userPublicProfileSelect = {
  id: true,
  full_name: true,
  avatar_url: true,
  college: true,
  department: true,
  academic_year: true,
  interests: true,
  tech_skills: true,
  creative_skills: true,
  sports_skills: true,
  leadership_skills: true,
  other_skills: true,
  looking_for: true,
  personality_tags: true,
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  try {
    // Find all matches for the user
    const matches = await prisma.matches.findMany({
      where: {
        OR: [
          { user1_id: userId },
          { user2_id: userId },
        ],
      },
    });
    const matchedUserIds = matches.map((m: any) => m.user1_id === userId ? m.user2_id : m.user1_id);
    const matchedUsers = await prisma.users.findMany({
      where: { id: { in: matchedUserIds } },
      select: userPublicProfileSelect,
    });
    return NextResponse.json({ matchedUsers });
  } catch (error) {
    console.error('Error in matched-users API:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 