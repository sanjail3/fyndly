"use client";
import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { Send, ArrowLeft } from "lucide-react";
import { useUnreadChats } from "@/hooks/useUnreadChats";
import { encodeMessage, decodeMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";


const supabase = createClientComponentClient();

const safeDecode = (msg: string) => {
  try {
    return decodeMessage(msg);
  } catch {
    return msg;
  }
};

// Add a mobile check utility
function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export default function ChatPage() {
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { markChatNotificationsAsRead } = useNotifications();
  const inputRef = useRef<HTMLInputElement>(null);
  const { getUnreadCountForRoom } = useUnreadChats(user?.id || null);
  const router = useRouter();

  useEffect(() => {
    // Get current user from Supabase auth
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Fetch chat rooms for the user, including last message
    const fetchChatRooms = async () => {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(`*,
          user1:users!chat_rooms_user1_id_fkey(id, full_name, avatar_url),
          user2:users!chat_rooms_user2_id_fkey(id, full_name, avatar_url),
          messages:messages(chat_id, content, created_at, sender_id)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
      if (data) {
        // For each room, find the latest message
        const roomsWithLastMsg = data.map((room: any) => {
          let lastMsg = null;
          if (room.messages && room.messages.length > 0) {
            lastMsg = room.messages.reduce((latest: any, msg: any) => {
              return !latest || new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest;
            }, null);
          }
          return {
            ...room,
            last_message: lastMsg ? safeDecode(lastMsg.content) : '',
            last_message_at: lastMsg ? lastMsg.created_at : room.last_message_at,
          };
        });
        setChatRooms(roomsWithLastMsg);
      }
    };
    fetchChatRooms();
  }, [user]);

  useEffect(() => {
    if (!selectedRoom) return;
    // Fetch messages for the selected chat room
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:users(id, full_name, avatar_url)")
        .eq("chat_id", selectedRoom.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data.map((msg: any) => ({ ...msg, content: safeDecode(msg.content) })));
    };
    fetchMessages();
    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${selectedRoom.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${selectedRoom.id}` },
        (payload) => {
          const newMessage = {
            ...payload.new,
            content: safeDecode(payload.new.content)
          };
          setMessages((msgs) => [...msgs, newMessage]);
        }
      )
      .subscribe();
    // Mark chat notifications as read for this chat
    if (user) {
      const otherUserId = selectedRoom.user1_id === user.id ? selectedRoom.user2_id : selectedRoom.user1_id;
      markChatNotificationsAsRead(otherUserId);
    }
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user) return;
    // Always encode before storing
    await supabase.from("messages").insert({
      chat_id: selectedRoom.id,
      sender_id: user.id,
      content: encodeMessage(newMessage.trim()),
    });
    setNewMessage("");
    inputRef.current?.focus();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getOtherUser = (room: any) => {
    if (!user) return null;
    return room.user1_id === user.id ? room.user2 : room.user1;
  };

  // Mark all messages as read when chat is open and user is recipient
  useEffect(() => {
    if (!selectedRoom || !user) return;
    const markMessagesRead = async () => {
      await supabase.from("messages")
        .update({ read: true })
        .eq("chat_id", selectedRoom.id)
        .neq("sender_id", user.id)
        .eq("read", false);
    };
    markMessagesRead();
  }, [selectedRoom, user, messages]);

  // Before rendering messages, add a debug log
  console.log('DEBUG: messages', messages);

  return (
    <div className="flex h-screen md:min-h-screen bg-black text-white md:rounded-2xl md:shadow-2xl overflow-hidden md:m-4 md:border md:border-gray-800">
      {/* Sidebar: Matched Users (Desktop) */}
      <div className="w-80 max-w-full border-r border-gray-800 bg-gray-900/80 flex flex-col min-h-0 hidden md:flex">
        <div className="p-4 border-b border-gray-800 text-lg font-bold text-[#CAFE33]">Chats</div>
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 && (
            <div className="p-6 text-gray-500 text-center">No chats yet</div>
          )}
          {chatRooms.map((room) => {
            const other = getOtherUser(room);
            const unreadCount = getUnreadCountForRoom(room.id);
            // Always decode last_message for preview
            const lastMsg = room.last_message ? safeDecode(room.last_message) : '';
            return (
              <div
                key={room.id}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/60 transition ${selectedRoom?.id === room.id ? "bg-gray-800/80" : ""}`}
                onClick={() => setSelectedRoom(room)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-[#CAFE33]/40">
                    <AvatarImage src={other?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-bold text-lg">
                      {other?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full">
                      {unreadCount > 4 ? '4+' : unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{other?.full_name}</div>
                  <div className={`text-xs truncate ${unreadCount > 0 ? 'font-bold text-[#CAFE33]' : 'text-gray-400'}`}>{lastMsg || 'No messages yet'}</div>
                </div>
                <div className="text-xs text-gray-500 min-w-[60px] text-right">
                  {room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Mobile: Full-screen chat list if no chat selected */}
      {!selectedRoom && (
        <div className="flex flex-col w-full h-full md:hidden">
          <div className="flex items-center gap-2 p-4 border-b border-gray-800 text-lg font-bold text-[#CAFE33]">
            {/* Back button to /explore on chat list */}
            <button
              className="mr-2 text-[#CAFE33] hover:text-[#B8E62E] p-1 rounded-full focus:outline-none"
              onClick={() => router.push('/explore')}
              aria-label="Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <span>Chats</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-black">
            {chatRooms.length === 0 && (
              <div className="p-6 text-gray-500 text-center">No chats yet</div>
            )}
            {chatRooms.map((room) => {
              const other = getOtherUser(room);
              const unreadCount = getUnreadCountForRoom(room.id);
              const lastMsg = room.last_message ? safeDecode(room.last_message) : '';
              return (
                <div
                  key={room.id}
                  className="flex items-center gap-3 p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/60 transition"
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-[#CAFE33]/40">
                      <AvatarImage src={other?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-bold text-lg">
                        {other?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full">
                        {unreadCount > 4 ? '4+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{other?.full_name}</div>
                    <div className={`text-xs truncate ${unreadCount > 0 ? 'font-bold text-[#CAFE33]' : 'text-gray-400'}`}>{lastMsg || 'No messages yet'}</div>
                  </div>
                  <div className="text-xs text-gray-500 min-w-[60px] text-right">
                    {room.last_message_at ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Chat Window */}
      {selectedRoom && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10">
            {/* Back button: on mobile, go to chat list; on desktop, go to /explore */}
            <button
              className="mr-2 md:hidden text-[#CAFE33] hover:text-[#B8E62E] p-1 rounded-full focus:outline-none"
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setSelectedRoom(null);
                } else {
                  router.push('/explore');
                }
              }}
              aria-label="Back"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <Avatar className="h-10 w-10 border-2 border-[#CAFE33]/40">
              <AvatarImage src={getOtherUser(selectedRoom)?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-bold text-sm">
                {getOtherUser(selectedRoom)?.full_name?.split(" ").map((n: string) => n[0]).join("") || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="font-semibold text-white text-lg">{getOtherUser(selectedRoom)?.full_name}</div>
          </div>
          {/* Messages */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center">No messages yet. Say hi!</div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.sender_id === user?.id ? "justify-end" : ""}`}
              >
                {msg.sender_id !== user?.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>{msg.sender?.full_name?.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                    msg.sender_id === user?.id
                      ? "bg-[#CAFE33] text-black"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {/* Message Input */}
          <form
            className="flex items-center gap-2 p-2 sm:p-4 border-t border-gray-800 bg-gray-900/80 sticky bottom-0 z-10"
            onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                className="w-full rounded-full bg-black text-white border border-gray-700 focus:border-[#CAFE33] px-4 py-2 shadow-inner outline-none transition placeholder-gray-500 pr-12"
                placeholder="Type your message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                style={{ minHeight: 40 }}
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold px-3 py-2 rounded-full shadow-lg hover:from-[#B8E62E] hover:to-[#CAFE33] transition"
                disabled={!newMessage.trim()}
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 