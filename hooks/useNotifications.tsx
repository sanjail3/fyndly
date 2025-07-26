import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'connection_accepted' | 'match_created' | 'connection_request' | 'connection_rejected' | 'chat_message';
  title: string;
  message: string;
  related_user_id: string | null;
  connection_request_id: string | null;
  match_id: string | null;
  is_read: boolean;
  created_at: Date;
  related_user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface RealtimePayload {
  new: {
    id: string;
    type: string;
    title: string;
    message: string;
    user_id: string;
    related_user_id: string | null;
    connection_request_id: string | null;
    match_id: string | null;
    is_read: boolean;
    created_at: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]); // includes chat_message
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setAllNotifications(data); // all notifications including chat_message
      // Exclude chat_message from notification list
      const filtered = data.filter(
        (n: Notification) =>
          n.type === "connection_accepted" ||
          n.type === "match_created" ||
          n.type === "connection_request"
      );
      setNotifications(filtered);
      setUnreadCount(filtered.filter((n: Notification) => !n.is_read).length);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: "destructive",
        title: "Failed to load notifications",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        variant: "destructive",
        title: "Failed to mark notification as read",
        description: error.message
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        variant: "destructive",
        title: "Failed to mark all notifications as read",
        description: error.message
      });
    }
  };

  // Mark all chat notifications as read for a given user (otherUserId)
  const markChatNotificationsAsRead = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await fetch(`/api/notifications?userId=${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markChatReadWithUser: otherUserId }),
      });
    } catch (error) {
      // Silent fail
    }
  };

  // Subscribe to real-time notifications
  useEffect(() => {
    let channel: any;
    let isMounted = true;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Use a unique channel name per user
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload: RealtimePayload) => {
            // Fetch the new notification
            const response = await fetch(`/api/notifications?userId=${user.id}`);
            if (!response.ok) return;

            const notifications = await response.json();
            const newNotification = notifications.find((n: Notification) => n.id === payload.new.id);

            if (newNotification) {
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      isMounted = false;
    };
    // Only run once on mount
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Get total unread chat messages
  const getUnreadChatCount = () => {
    const count = allNotifications.filter(n => n.type === 'chat_message' && !n.is_read).length;
    console.log('DEBUG: allNotifications', allNotifications);
    console.log('DEBUG: unreadChatCount', count);
    return count;
  };

  // Get unread chat messages from a specific user
  const getUnreadChatCountForUser = (userId: string) => {
    return allNotifications.filter(n => n.type === 'chat_message' && !n.is_read && n.related_user_id === userId).length;
  };

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
    markChatNotificationsAsRead,
    getUnreadChatCount,
    getUnreadChatCountForUser,
  };
};
