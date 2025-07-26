'use client';

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ProfileFullModal from "./ProfileFullModal";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationsList from "./NotificationsList";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/integrations/supabase/client";
import { ConnectionsProvider } from "@/components/ConnectionsProvider";

export default function NotificationsPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { notifications, unreadCount } = useNotifications();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const handleViewProfile = async (userId: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}&viewerId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const profile = await response.json();
      setSelectedUser(profile);
    } catch (error) {
      console.error('Error viewing profile:', error);
    }
  };

  return (
    <ConnectionsProvider>
      <div className="min-h-screen bg-black text-white">
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-gray-800">
          <div className="px-4 py-4 flex items-center gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="ghost"
              size="icon"
              className="text-[#CAFE33] hover:bg-[#CAFE33]/10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#CAFE33]">Notifications</h1>
              <p className="text-gray-400 text-sm">
                {notifications.length} total notifications
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 space-y-4 max-w-4xl mx-auto">
          <NotificationsList onViewProfile={handleViewProfile} />
        </div>

        {/* Profile Modal */}
        {selectedUser && (
            <ProfileFullModal
              open={!!selectedUser}
              onClose={() => setSelectedUser(null)}
              profile={selectedUser}
              isMatched={false}
              onRemoveMatch={() => {}}
              onConnect={() => {}}
          />
        )}
      </div>
    </ConnectionsProvider>
  );
}
