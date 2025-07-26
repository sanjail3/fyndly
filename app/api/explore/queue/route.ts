import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  // Fetch ExploreQueue for user, grouped by recommendationType
  const queue = await prisma.exploreQueue.findMany({
    where: { userId },
    orderBy: [{ recommendationType: 'asc' }, { rank: 'asc' }],
    include: { users_ExploreQueue_recommendedUserIdTousers: true },
  });

  // If queue is empty or stale (older than 24h), trigger regeneration (pseudo-code)
  const now = new Date();
  const isStale = queue.length === 0 || (queue[0]?.createdAt && (now.getTime() - new Date(queue[0].createdAt).getTime()) > 24 * 60 * 60 * 1000);
  if (isStale) {
    // Optionally, call the generate endpoint here or trigger regeneration logic
    return NextResponse.json({ queue: [], needsRegeneration: true });
  }

  // Group by recommendationType
  const grouped = queue.reduce((acc: Record<string, any[]>, item) => {
    const type = item.recommendationType;
    if (!acc[type]) acc[type] = [];
    acc[type].push({
      ...item.users_ExploreQueue_recommendedUserIdTousers,
      score: item.score,
      rank: item.rank,
    });
    return acc;
  }, {} as Record<string, any[]>);

  return NextResponse.json({ queue: grouped });
} 