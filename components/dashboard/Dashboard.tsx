'use client';

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, RefreshCcw, User, Bell, MessageCircle, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import ExploreFeed from "./ExploreFeed";
import { supabase } from "@/integrations/supabase/client";
import { useUnreadChats } from "@/hooks/useUnreadChats";
import AiButton from '@/components/animata/button/ai-button';

interface DashboardProps {
  children?: React.ReactNode;
}

function LoadingIcon({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <img
        src="/icon.png"
        alt="Fyndly Logo"
        className="rounded-2xl shadow-xl animate-spin-slow"
        style={{ width: size, height: size, animation: 'spin 1.2s linear infinite' }}
      />
      {message && <p className="text-green-300 mt-4">{message}</p>}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Super Large, Modern, Rotating AI Assistant Icon (cbfd33 theme)
const AIAssistantIcon = () => (
  <div className="relative group">
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="w-16 h-16 animate-spin-slow drop-shadow-2xl group-hover:scale-110 transition-transform duration-300"
        style={{ color: "#cbfd33" }}
      >
        <g>
          {/* Main starburst shape */}
          <path
            d="M32 8 L36 32 L56 32 L36 36 L32 56 L28 36 L8 32 L28 32 Z"
            fill="currentColor"
            opacity="0.98"
          />
          {/* Inner sparkle */}
          <circle
            cx="32"
            cy="32"
            r="9"
            fill="white"
            opacity="0.85"
          />
        </g>
      </svg>
      {/* Strong glowing effect */}
      <div className="absolute inset-0 rounded-full bg-[#cbfd33] opacity-50 blur-2xl pointer-events-none" />
    </div>
  </div>
);

// CSS (add to your global styles or Tailwind config):
// @keyframes spin-slow { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
// .animate-spin-slow { animation: spin-slow 2.5s linear infinite; }

export default function Dashboard({ children }: DashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount, getUnreadChatCount } = useNotifications();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalUsersWithUnreadMessages } = useUnreadChats(userId);
  
  const notificationCount = unreadCount;
  const unreadChatUserCount = getTotalUsersWithUnreadMessages();
  console.log('DEBUG: Dashboard unreadChatUserCount', unreadChatUserCount);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: userProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (userProfile) {
          // Profile exists, allow dashboard access
          setIsLoading(false);
          if (pathname === '/dashboard') {
            router.replace('/explore');
          }
        } else {
          // No profile, force onboarding
          router.replace('/onboarding');
        }
      } else {
        // No authenticated user, force login
        router.replace('/auth');
      }
    };

    checkUserAndRedirect();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <LoadingIcon size={72} message="Loading your profile..." />
    );
  }

  const handleNotificationsClick = () => {
    router.push('/notifications');
  };

  const handleChatClick = () => {
    router.push("/chat");
  };

  const handleAIChatClick = () => {
    router.push("/ai-chat");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Only render bottom nav if not on /chat
  const showBottomNav = pathname !== '/chat' && pathname !== '/ai-chat';

  // If we're at the root dashboard, show ExploreFeed
  if (pathname === '/dashboard') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Top Navigation Bar with Notifications */}
        <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Fyndly Logo" 
                className="h-8 w-auto"
              />
            </div>
            {/* Right side: Chat, AI Assistant, and Notifications */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleChatClick}
                variant="ghost"
                size="icon"
                className="relative text-gray-400 hover:text-[#CAFE33] hover:bg-gray-800/50 rounded-full"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadChatUserCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full">
                    {unreadChatUserCount > 99 ? '99+' : unreadChatUserCount}
                  </Badge>
                )}
              </Button>
              {/* Removed AI Assistant Icon from top navbar */}
              <Button
                onClick={handleNotificationsClick}
                variant="ghost"
                size="icon"
                className="relative text-gray-400 hover:text-[#CAFE33] hover:bg-gray-800/50 rounded-full"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20">
          <ExploreFeed />
        </div>

        {/* Bottom Navigation */}
        {showBottomNav && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-[#CAFE33]/20 z-50">
            <div className="grid grid-cols-4 w-full h-20 bg-transparent p-0">
              <button 
                onClick={() => handleNavigation('/explore')}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${String(pathname) === '/explore' ? 'text-[#CAFE33]' : 'text-gray-400'}`}
              >
                <Home className="h-6 w-6" />
                <span>Home</span>
              </button>
              <div className="flex flex-col items-center gap-1 py-2 text-xs -mt-6 cursor-pointer" onClick={handleAIChatClick}>
                <AiButton />
                <span className="text-[#cbfd33] font-semibold">Leo AI</span>
              </div>
              <button 
                onClick={() => handleNavigation('/swipe')}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${String(pathname) === '/swipe' ? 'text-[#CAFE33]' : 'text-gray-400'}`}
              >
                <RefreshCcw className="h-6 w-6" />
                <span>Swipe</span>
              </button>
              <button 
                onClick={() => handleNavigation('/profile')}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${String(pathname) === '/profile' ? 'text-[#CAFE33]' : 'text-gray-400'}`}
              >
                <User className="h-6 w-6" />
                <span>Profile</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation Bar with Notifications */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="Fyndly Logo" 
              className="h-8 w-auto"
            />
          </div>
          {/* Right side: Chat, AI Assistant, and Notifications */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleChatClick}
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-[#CAFE33] hover:bg-gray-800/50 rounded-full"
            >
              <MessageCircle className="h-5 w-5" />
              {unreadChatUserCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full">
                  {unreadChatUserCount > 99 ? '99+' : unreadChatUserCount}
                </Badge>
              )}
            </Button>
            {/* Removed AI Assistant Icon from top navbar */}
            <Button
              onClick={handleNotificationsClick}
              variant="ghost"
              size="icon"
              className="relative text-gray-400 hover:text-[#CAFE33] hover:bg-gray-800/50 rounded-full"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[18px] h-4 flex items-center justify-center rounded-full">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-[#CAFE33]/20 z-50">
          <div className="grid grid-cols-4 w-full h-20 bg-transparent p-0">
            <button 
              onClick={() => handleNavigation('/explore')}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${String(pathname) === '/explore' ? 'text-[#CAFE33]' : 'text-gray-400'}`}
            >
              <Home className="h-6 w-6" />
              <span>Home</span>
            </button>
            <div className="flex flex-col items-center gap-1 py-2 text-xs -mt-6 cursor-pointer" onClick={handleAIChatClick}>
              <AiButton />
              <span className="text-[#cbfd33] font-semibold">AI</span>
            </div>
            <button 
              onClick={() => handleNavigation('/swipe')}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${String(pathname) === '/swipe' ? 'text-[#CAFE33]' : 'text-gray-400'}`}
            >
              <RefreshCcw className="h-6 w-6" />
              <span>Swipe</span>
            </button>
            <button 
              onClick={() => handleNavigation('/profile')}
              className={`flex flex-col items-center gap-1 py-2 text-xs ${String(pathname) === '/profile' ? 'text-[#CAFE33]' : 'text-gray-400'}`}
            >
              <User className="h-6 w-6" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
