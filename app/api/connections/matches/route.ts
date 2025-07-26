import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const matches = await prisma.matches.findMany({
      where: {
        OR: [
          { user1_id: userId },
          { user2_id: userId },
        ],
      },
      orderBy: { matched_at: 'desc' },
    });

    // Fetch user profiles for each match
    const matchesWithProfiles = await Promise.all(
      matches.map(async (match) => {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        const userProfile = await prisma.users.findUnique({
          where: { id: otherUserId },
        });
        return { ...match, user: userProfile };
      })
    );

    return NextResponse.json(matchesWithProfiles);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const matchedUserId = searchParams.get('matchedUserId');

  if (!userId || !matchedUserId) {
    return NextResponse.json({ error: 'Missing userId or matchedUserId' }, { status: 400 });
  }

  try {
    // Use a transaction to delete match, chat room, and connection request atomically
    await prisma.$transaction([
      // Delete the match
      prisma.matches.deleteMany({
        where: {
          OR: [
            { user1_id: userId, user2_id: matchedUserId },
            { user1_id: matchedUserId, user2_id: userId },
          ],
        },
      }),
      // Delete the chat room
      prisma.chat_rooms.deleteMany({
        where: {
          OR: [
            { user1_id: userId, user2_id: matchedUserId },
            { user1_id: matchedUserId, user2_id: userId },
          ],
        },
      }),
      // Delete the connection request (either direction)
      prisma.connection_requests.deleteMany({
        where: {
          OR: [
            { sender_id: userId, receiver_id: matchedUserId },
            { sender_id: matchedUserId, receiver_id: userId },
          ],
        },
      }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 