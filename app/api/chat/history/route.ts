// app/api/chat/history/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { supabaseService } from '@/integrations/supabase/service-client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  type?: string;
  role?: string;
  content: string | any;
  isHero?: boolean;
  suggestions?: any[];
  isFormatted?: boolean;
}

// Helper function to safely parse JSON
const safeJsonParse = (data: any): any => {
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return {};
  }
};

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const authHeader = req.headers.get('Authorization');
    const jwt = authHeader?.split('Bearer ')[1];
    let session;
    if (jwt) {
      // Use the Supabase client to get the user from the JWT
      const { data: { user } } = await supabase.auth.getUser(jwt);
      if (user) {
        session = { user };
      }
    }
    // If no JWT or user not found, fall back to session from cookie
    if (!session) {
      const { data } = await supabaseService.auth.getSession();
      if (data.session) {
        session = data.session;
      }
    }
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id,
        email: session.user.email,
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const chatHistory = await prisma.chatHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    const formattedHistory = chatHistory.map((chat: any) => ({
      id: chat.id,
      title: chat.title,
      subtitle: chat.subtitle,
      preview: typeof chat.context === 'string' ? chat.context.substring(0, 60) + '...' : '',
      timestamp: chat.createdAt.toLocaleString(),
    }));
    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

// Helper function to normalize a message for comparison
const normalizeMessage = (message: ChatMessage): string => {
  try {
    // Create normalized representation based on type and content
    const contentStr = typeof message.content === 'string'
      ? message.content
      : JSON.stringify(message.content);

    return `${message.type || message.role || "unknown"}-${contentStr.substring(0, 50)}`;
  } catch (error) {
    console.error("Error normalizing message:", error);
    return `${message.type || message.role || "unknown"}-error`;
  }
};

// Helper function to properly merge message arrays
const mergeMessages = (
  currentMessages: ChatMessage[],
  newMessages: ChatMessage[]
): ChatMessage[] => {
  // Initialize result with hero message if present
  const heroMessage = currentMessages.find(msg => msg.isHero);
  let result: ChatMessage[] = heroMessage ? [heroMessage] : [];

  // Track processed messages to avoid duplicates
  const processedMessages = new Set<string>();
  if (heroMessage) {
    processedMessages.add(normalizeMessage(heroMessage));
  }

  // First add all user messages from both arrays in proper order
  // (user messages should never be deduplicated to preserve conversation flow)
  const allUserMessages: ChatMessage[] = [];

  // Add existing user messages
  currentMessages
    .filter(msg => (msg.type === "user" || msg.role === "user") && !msg.isHero)
    .forEach(msg => {
      allUserMessages.push(msg);
      processedMessages.add(normalizeMessage(msg));
    });

  // Add new user messages (only if they don't already exist)
  newMessages
    .filter(msg => (msg.type === "user" || msg.role === "user") && !msg.isHero)
    .forEach(msg => {
      const key = normalizeMessage(msg);
      if (!processedMessages.has(key)) {
        allUserMessages.push(msg);
        processedMessages.add(key);
      }
    });

  // Add user messages to result
  result = [...result, ...allUserMessages];

  // Now handle bot messages - they should alternate with user messages
  // For each user message, find the next bot response
  for (let i = 0; i < result.length; i++) {
    const currentMsg = result[i];

    // Skip if not a user message
    if (currentMsg.type !== "user" && currentMsg.role !== "user") continue;

    // Find bot response in both arrays, preferring newer responses
    let botResponse: ChatMessage | undefined;

    // First try to find in new messages
    const newBotResponse = newMessages.find(msg =>
      (msg.type === "bot" || msg.role === "assistant") &&
      !msg.isHero &&
      !processedMessages.has(normalizeMessage(msg))
    );

    // If not found in new messages, look in current messages
    if (!newBotResponse) {
      botResponse = currentMessages.find(msg =>
        (msg.type === "bot" || msg.role === "assistant") &&
        !msg.isHero &&
        !processedMessages.has(normalizeMessage(msg))
      );
    } else {
      botResponse = newBotResponse;
    }

    // If found, add to result and mark as processed
    if (botResponse) {
      result.splice(i + 1, 0, botResponse);
      processedMessages.add(normalizeMessage(botResponse));
      i++; // Skip the bot message we just added
    }
  }

  // Finally, add any remaining bot messages that weren't paired with user messages
  // First from current messages
  currentMessages
    .filter(msg =>
      (msg.type === "bot" || msg.role === "assistant") &&
      !msg.isHero &&
      !processedMessages.has(normalizeMessage(msg))
    )
    .forEach(msg => {
      result.push(msg);
      processedMessages.add(normalizeMessage(msg));
    });

  // Then from new messages
  newMessages
    .filter(msg =>
      (msg.type === "bot" || msg.role === "assistant") &&
      !msg.isHero &&
      !processedMessages.has(normalizeMessage(msg))
    )
    .forEach(msg => {
      result.push(msg);
      processedMessages.add(normalizeMessage(msg));
    });

  return result;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

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
      const { data } = await supabaseService.auth.getSession();
      if (data.session) {
        session = data.session;
      }
    }

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Get user record
    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id,
        email: session.user.email
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle updating existing chat
    if (body.chatId) {
      const { chatId, messages, title, subtitle } = body;

      // Fetch the existing chat history
      const existingChat = await prisma.chatHistory.findUnique({
        where: { id: chatId }
      });

      if (!existingChat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      // Parse existing context
      let currentContext: ChatMessage[] = [];
      if (existingChat.context) {
        try {
          currentContext = JSON.parse(existingChat.context as string);
        } catch (e) {
          console.error('Error parsing existing context:', e);
        }
      }

      // Merge messages using our helper function
      const mergedMessages = mergeMessages(currentContext, messages);

      // Find the first user message and first bot response post-hero
      const nonHeroMessages = mergedMessages.filter(m => !m.isHero);
      const firstUserMessage = nonHeroMessages.find(
        (m: ChatMessage) => m.type === "user" || m.role === "user"
      );
      const firstBotResponse = nonHeroMessages.find(
        (m: ChatMessage) => (m.type === "bot" || m.role === "assistant") && !m.isHero
      );

      // Prepare update data
      let updateData: any = {
        context: JSON.stringify(mergedMessages),
        message: firstUserMessage ?
          (typeof firstUserMessage.content === 'string' ?
            firstUserMessage.content :
            JSON.stringify(firstUserMessage.content)) :
          existingChat.message,
        response: firstBotResponse ?
          (typeof firstBotResponse.content === 'string' ?
            firstBotResponse.content :
            JSON.stringify(firstBotResponse.content)) :
          existingChat.response
      };

      // Only update title/subtitle if non-empty values are provided
      if (title && title.trim() !== "") {
        updateData.title = title;
      }

      if (subtitle && subtitle.trim() !== "") {
        updateData.subtitle = subtitle;
      }

      // Save to database
      const updatedChat = await prisma.chatHistory.update({
        where: { id: chatId },
        data: updateData,
      });

      return NextResponse.json(updatedChat);
    }

    // Handle new chat creation
    const { messages, title, subtitle } = body;

    // Find hero message and conversation parts
    const heroMessage = messages.find((m: ChatMessage) => m.isHero);
    const nonHeroMessages = messages.filter((m: ChatMessage) => !m.isHero);

    // Find the first user message and first bot response
    const firstUserMessage = nonHeroMessages.find(
      (m: ChatMessage) => m.type === "user" || m.role === "user"
    );
    const firstBotResponse = nonHeroMessages.find(
      (m: ChatMessage) => (m.type === "bot" || m.role === "assistant")
    );

    // Prepare chat data
    const chatData = {
      title: (title && title.trim() !== "") ? title : (
        heroMessage ? (
          typeof heroMessage.content === 'string' ?
            heroMessage.content.substring(0, 50) :
            (typeof heroMessage.content === 'object' && heroMessage.content.title ?
              heroMessage.content.title :
              "New Chat")
        ) : "New Chat"
      ),
      subtitle: (subtitle && subtitle.trim() !== "") ? subtitle : (
        heroMessage ? (
          typeof heroMessage.content === 'object' && heroMessage.content.subtitle ?
            heroMessage.content.subtitle :
            ""
        ) : ""
      ),
      message: firstUserMessage ?
        (typeof firstUserMessage.content === 'string' ?
          firstUserMessage.content :
          JSON.stringify(firstUserMessage.content)) :
        "",
      response: firstBotResponse ?
        (typeof firstBotResponse.content === 'string' ?
          firstBotResponse.content :
          JSON.stringify(firstBotResponse.content)) :
        "",
      context: JSON.stringify(messages),
      userId: session.user.id
    };

    // Create new chat
    const newChat = await prisma.chatHistory.create({
      data: chatData,
    });

    return NextResponse.json(newChat);
  } catch (error: any) {
    console.error("Error in chat history API:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}