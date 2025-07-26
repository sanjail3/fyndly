import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadChats(userId: string | null) {
  const [unreadCounts, setUnreadCounts] = useState<{ [roomId: string]: number }>({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [usersWithUnread, setUsersWithUnread] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    const fetchUnread = async () => {
      // Get all unread messages for the user, grouped by chat_id
      const { data, error } = await (supabase
        .from('messages' as any) as any)
        .select('chat_id, sender_id')
        .eq('read', false)
        .neq('sender_id', userId);
      if (!isMounted) return;
      if (data) {
        // Count per room
        const counts: { [roomId: string]: number } = {};
        const userSet = new Set<string>();
        data.forEach((msg: any) => {
          counts[msg.chat_id] = (counts[msg.chat_id] || 0) + 1;
          userSet.add(msg.sender_id);
        });
        setUnreadCounts(counts);
        setTotalUnread(data.length);
        setUsersWithUnread(userSet);
      }
    };
    fetchUnread();
    // Optionally, poll every 5 seconds for real-time-ish updates
    const interval = setInterval(fetchUnread, 5000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [userId]);

  return {
    getTotalUnreadMessages: () => totalUnread,
    getTotalUsersWithUnreadMessages: () => usersWithUnread.size,
    getUnreadCountForRoom: (roomId: string) => unreadCounts[roomId] || 0,
    unreadCounts,
  };
} 