import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        user_id: userId
      },
      include: {
        users_notifications_related_user_idTousers: {
          select: {
            id: true,
            full_name: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { notificationId, isRead, markChatReadWithUser } = body;

  if (markChatReadWithUser) {
    // Mark all chat_message notifications as read for this user and related_user_id
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    await prisma.notifications.updateMany({
      where: {
        user_id: userId,
        type: 'chat_message',
        related_user_id: markChatReadWithUser,
        is_read: false,
      },
      data: { is_read: true },
    });
    return NextResponse.json({ success: true });
  }

  if (!notificationId || typeof isRead !== 'boolean') {
    return NextResponse.json(
      { error: 'Missing notificationId or isRead' },
      { status: 400 }
    );
  }

  try {
    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { is_read: isRead }
    });

    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json(
      { error: 'Missing userId' },
      { status: 400 }
    );
  }

  try {
    await prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false
      },
      data: { is_read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const notificationId = searchParams.get('notificationId');

  if (!notificationId) {
    return NextResponse.json(
      { error: 'Missing notificationId' },
      { status: 400 }
    );
  }

  try {
    await prisma.notifications.delete({
      where: { id: notificationId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 