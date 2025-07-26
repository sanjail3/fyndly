import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// This is a simplified scoring model. In a real-world scenario, 
// this would be more complex, considering various factors.
const computeScore = (currentUser: any, candidate: any, similarity: number): number => {
  const intentOverlap = (currentUser.looking_for || []).filter((intent: string) => 
    candidate.looking_for?.includes(intent)
  ).length;
  
  const collegeBoost = currentUser.college === candidate.college ? 0.1 : 0;
  
  const recentActivityScore = candidate.updated_at 
    ? Math.max(0, 1 - (Date.now() - new Date(candidate.updated_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) 
    : 0;

  // Weighted score: 60% similarity, 20% intent, 10% college, 10% recency
  return (similarity * 0.6) + (intentOverlap * 0.2) + collegeBoost + (recentActivityScore * 0.1);
};

function calculateMatchScore(user1: any, user2: any): number {
  let score = 0;
  const commonInterests = user1.interests?.filter((i: string) => user2.interests?.includes(i)).length || 0;
  score += commonInterests * 10;
  const commonSkills = user1.tech_skills?.filter((s: string) => user2.tech_skills?.includes(s)).length || 0;
  score += commonSkills * 6;
  if (user1.college === user2.college) score += 40;
  if (user1.department === user2.department) score += 20;
  return Math.min(200, score);
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const college = searchParams.get('college');
  const department = searchParams.get('department');
  const academicYear = searchParams.get('academicYear');

  console.log('Swipe queue generation filters:', { college, department, academicYear });

  const supabase = createServerComponentClient({ cookies });

  // First, try to get user from JWT from Authorization header
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.split('Bearer ')[1];
  let session;

  if (jwt) {
    const { data: { user } } = await supabase.auth.getUser(jwt);
    if (user) {
      session = { user };
    }
  }

  // If no JWT or user not found, fall back to session from cookie
  if (!session) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      session = data.session;
    }
  }
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    await prisma.swipeQueue.deleteMany({
      where: { userId: userId },
    });

    // Exclude users who have already been swiped (LEFT or RIGHT) by the current user
    const swipedTargetIds = await prisma.swipe.findMany({
      where: { sourceId: userId },
      select: { targetId: true },
    });
    const swipedIdsSet = new Set(swipedTargetIds.map(s => s.targetId));

    const filters: any = {
      id: { not: userId },
      // Exclude users already swiped
      NOT: [
        { id: { in: Array.from(swipedIdsSet) } }
      ],
    };

    if (college) filters.college = college;
    if (department) filters.department = department;
    if (academicYear) filters.academic_year = parseInt(academicYear, 10);

    const candidates = await prisma.users.findMany({
      where: filters,
      take: 100,
    });

    if (candidates.length === 0) {
      return NextResponse.json({ message: "No new candidates found with the selected filters." });
    }

    const currentUser = await prisma.users.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    const scoredCandidates = candidates
      .map(candidate => {
        const rawScore = calculateMatchScore(currentUser, candidate);
        const normalizedScore = Math.round((rawScore / 200) * 100);
        return {
        ...candidate,
          score: normalizedScore,
        };
      })
      .sort((a, b) => b.score - a.score);

    const queueData = scoredCandidates.map((c, index) => ({
      userId: userId,
      targetId: c.id,
      score: c.score,
      position: index,
    }));

    await prisma.swipeQueue.createMany({
      data: queueData,
    });

    return NextResponse.json({ message: "Swipe queue regenerated successfully" });
  } catch (error) {
    console.error("Error generating swipe queue:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to generate swipe queue', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
} 