import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { chatRoomId, senderId, content } = await req.json();
  if (!chatRoomId || !senderId || !content) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Find the chat room and the recipient
  const chatRoom = await prisma.chat_rooms.findUnique({
    where: { id: chatRoomId },
  });
  if (!chatRoom) {
    return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
  }
  const recipientId = chatRoom.user1_id === senderId ? chatRoom.user2_id : chatRoom.user1_id;

  // Only create notification if recipient is not the sender
  if (recipientId !== senderId) {
    await prisma.notifications.create({
      data: {
        user_id: recipientId,
        title: "New Message",
        message: content.length > 60 ? content.slice(0, 60) + "..." : content,
        type: "chat_message",
        related_user_id: senderId,
        is_read: false,
      },
    });
  }

  return NextResponse.json({ success: true });
} 