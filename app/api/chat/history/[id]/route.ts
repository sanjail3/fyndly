import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Import the singleton Prisma client
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase } from "@/integrations/supabase/client";

// Helper function for safe JSON parsing
const safeJsonParse = (data: unknown): any => {
  try {
    console.log("safeJsonParse: Attempting to parse data", data);
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    console.log("safeJsonParse: Successfully parsed data", parsedData);
    return parsedData;
  } catch (err) {
    console.error("safeJsonParse: Error parsing data, returning empty object", err);
    return {};
  }
};

interface ChatMessage {
  type: string;
  content: string | object;
  isHero?: boolean;
}

export async function GET(
  req: NextRequest,
) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  console.log("GET: Received request for chat with id:", id);
  try {
    
    console.log("GET: Supabase client created.");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("GET: Session retrieved:", session);

    if (!session?.user?.email) {
      console.log("GET: Unauthorized access detected. Session does not contain a valid user email.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { 
        id: session.user.id,
        email: session.user.email 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("GET: User found:", user);
    if (!id) {
      return NextResponse.json({ error: "Chat id not found" }, { status: 404 });
    }
    const chat = await prisma.chatHistory.findUnique({
      where: { id: id},
    });

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Safely parse context and handle messages
    const contextData = safeJsonParse(chat.context);
    console.log("GET: Parsed context:", contextData);
    let messages: ChatMessage[] = [];
    if (Array.isArray(contextData)) {
      messages = contextData;
    } else if (contextData && Array.isArray(contextData.messages)) {
      messages = contextData.messages;
    }
    console.log("GET: Processed messages:", messages);

    console.log("GET: Returning chat data for chat id:", chat.id);
    return NextResponse.json({
      id: chat.id,
      messages: messages,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    console.error("GET: Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { 
        id: session.user.id,
        email: session.user.email 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!id) {
      return NextResponse.json({ error: "Chat id not found" }, { status: 404 });
    }
    const chat = await prisma.chatHistory.findUnique({
      where: { id: id || "" },
    });

    if (!chat || chat.userId !== user.id) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    await prisma.chatHistory.delete({
      where: { id: id || "" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}