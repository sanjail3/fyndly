import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const viewerId = searchParams.get('viewerId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { achievements: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let isMatched = false;
    if (viewerId && viewerId !== userId) {
      const match = await prisma.matches.findFirst({
        where: {
          OR: [
            { user1_id: userId, user2_id: viewerId },
            { user1_id: viewerId, user2_id: userId },
          ],
        },
      });
      isMatched = !!match;
    }

    return NextResponse.json({ ...user, isMatched });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 