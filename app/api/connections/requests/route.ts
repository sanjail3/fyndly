import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const requests = await prisma.connection_requests.findMany({
      where: {
        receiver_id: userId,
        status: 'PENDING',
      },
      orderBy: { created_at: 'desc' },
    });

    // Fetch sender details for each request
    const requestsWithSender = await Promise.all(
      requests.map(async (request) => {
        const sender = await prisma.users.findUnique({
          where: { id: request.sender_id },
          select: { id: true, full_name: true, avatar_url: true, college: true, department: true },
        });
        return { ...request, sender };
      })
    );

    return NextResponse.json(requestsWithSender);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { sender_id, receiver_id } = await req.json();

  if (!sender_id || !receiver_id) {
    return NextResponse.json({ error: 'Missing sender_id or receiver_id' }, { status: 400 });
  }

  try {
    // Check for existing request (pending, accepted, or rejected)
    const existingRequest = await prisma.connection_requests.findFirst({
      where: {
        OR: [
          { sender_id: sender_id, receiver_id: receiver_id },
          { sender_id: receiver_id, receiver_id: sender_id },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json({ message: 'Connection request already pending' }, { status: 409 });
      } else if (existingRequest.status === 'ACCEPTED') {
        return NextResponse.json({ message: 'Users are already connected' }, { status: 409 });
      }
    }

    // Get sender's name for the notification
    const sender = await prisma.users.findUnique({
      where: { id: sender_id },
      select: { full_name: true },
    });

    // Create the connection request
    const newRequest = await prisma.connection_requests.create({
      data: {
        sender_id,
        receiver_id,
        status: 'PENDING',
      },
    });

    // Create notification for the receiver
    await prisma.notifications.create({
      data: {
        user_id: receiver_id,
        title: 'New Connection Request',
        message: `${sender?.full_name || 'Someone'} sent you a connection request`,
        type: 'connection_request',
        related_user_id: sender_id,
        connection_request_id: newRequest.id,
        is_read: false,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { requestId, status, currentUserId } = await req.json();

  if (!requestId || !status || !currentUserId) {
    return NextResponse.json({ error: 'Missing requestId, status, or currentUserId' }, { status: 400 });
  }

  try {
    const request = await prisma.connection_requests.findUnique({
      where: { id: requestId },
      include: {
        users_connection_requests_sender_idTousers: {
          select: {
            full_name: true,
          },
        },
        users_connection_requests_receiver_idTousers: {
          select: {
            full_name: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Ensure only the receiver or sender can update the status
    if (request.receiver_id !== currentUserId && request.sender_id !== currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedRequest = await prisma.connection_requests.update({
      where: { id: requestId },
      data: { status, updated_at: new Date().toISOString() },
    });

    if (status === 'ACCEPTED') {
      // Check if a match already exists
      const existingMatch = await prisma.matches.findFirst({
        where: {
          OR: [
            { user1_id: updatedRequest.sender_id, user2_id: updatedRequest.receiver_id },
            { user1_id: updatedRequest.receiver_id, user2_id: updatedRequest.sender_id },
          ],
        },
      });

      // Only create a new match if one doesn't exist
      let match;
      if (!existingMatch) {
        match = await prisma.matches.create({
          data: {
            user1_id: updatedRequest.sender_id,
            user2_id: updatedRequest.receiver_id,
          },
        });
      } else {
        match = existingMatch;
      }

      // --- FIX: Update the original 'connection_request' notification for the receiver ---
      // This notification was created when the request was first sent.
      // We now mark it as handled (e.g., is_read = true).
      await prisma.notifications.updateMany({
        where: {
          connection_request_id: updatedRequest.id,
          user_id: updatedRequest.receiver_id, // Ensure we only update it for the receiver
          type: 'connection_request'
        },
        data: {
          is_read: true,
          // Optional: You could also change the message or title here
          // message: `You accepted the request from ${request.users_connection_requests_sender_idTousers?.full_name || 'Someone'}.`,
        },
      });

      // Create chat room for the matched users if not exists
      const existingChatRoom = await prisma.chat_rooms.findFirst({
        where: {
          OR: [
            { user1_id: updatedRequest.sender_id, user2_id: updatedRequest.receiver_id },
            { user1_id: updatedRequest.receiver_id, user2_id: updatedRequest.sender_id },
          ],
        },
      });
      if (!existingChatRoom) {
        await prisma.chat_rooms.create({
          data: {
            user1_id: updatedRequest.sender_id,
            user2_id: updatedRequest.receiver_id,
            last_message_at: new Date().toISOString(),
          },
        });
      }

      // Notify sender: Connection Accepted!
      await prisma.notifications.create({
        data: {
          user_id: updatedRequest.sender_id,
          title: 'Connection Accepted!',
          message: `${request.users_connection_requests_receiver_idTousers?.full_name || 'Someone'} accepted your connection request`,
          type: 'connection_accepted',
          related_user_id: updatedRequest.receiver_id,
          connection_request_id: updatedRequest.id,
          is_read: false,
        },
      });

      // Notify receiver: New Connection! (type: match_created)
      await prisma.notifications.create({
        data: {
          user_id: updatedRequest.receiver_id,
          title: 'New Connection!',
          message: `You are now connected with ${request.users_connection_requests_sender_idTousers?.full_name || 'Someone'}`,
          type: 'match_created',
          related_user_id: updatedRequest.sender_id,
          connection_request_id: updatedRequest.id,
          is_read: false,
        },
      });
    } else if (status === 'REJECTED') {
      // Create notification for the sender about rejection
      await prisma.notifications.create({
        data: {
          user_id: updatedRequest.sender_id,
          title: 'Connection Request Declined',
          message: `${request.users_connection_requests_receiver_idTousers?.full_name || 'Someone'} declined your connection request`,
          type: 'connection_rejected',
          related_user_id: updatedRequest.receiver_id,
          connection_request_id: updatedRequest.id,
          is_read: false,
        },
      });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating connection request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 