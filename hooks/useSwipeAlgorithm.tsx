import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useConnections } from './useConnections';
import { Prisma } from '@/lib/generated/prisma';

interface SwipeUser {
  id: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  avatar_url?: string;
  interests: string[];
  tech_skills: string[];
  creative_skills: string[];
  sports_skills: string[];
  leadership_skills: string[];
  other_skills: string[];
  looking_for: string[];
  weekly_availability: string;
  time_commitment: string;
  about: string;
  place: string;
  personality_tags: string[];
  github?: string;
  linkedin?: string;
  twitter?: string;
  personal_website?: string;
  instagram?: string;
  behance?: string;
  matchScore?: number;
}

export const useSwipeAlgorithm = () => {
  const [swipeQueue, setSwipeQueue] = useState<SwipeUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isQueueRefilling, setIsQueueRefilling] = useState(false);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('swipedIds');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const { toast } = useToast();
  const { matches, sendConnectionRequest } = useConnections();

  const fetchFromQueue = async (): Promise<SwipeUser[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      let response = await fetch(`/api/swipe/queue?userId=${user.id}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch swipe queue');
      let queueItems = await response.json();

      // If queue is empty, trigger queue generation and re-fetch
      if (queueItems.length === 0) {
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/swipe/queue/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({ userId: user.id })
        });
        // Wait a moment for the queue to be generated
        await new Promise(res => setTimeout(res, 1000));
        response = await fetch(`/api/swipe/queue?userId=${user.id}&limit=50`);
        if (!response.ok) throw new Error('Failed to fetch swipe queue after generation');
        queueItems = await response.json();
        // Clear swipedIds after queue generation to sync frontend and backend
        setSwipedIds(new Set());
        if (typeof window !== 'undefined') {
          localStorage.removeItem('swipedIds');
        }
      }

      return queueItems.map((item: any) => item.target);
    } catch (error) {
      console.error("Error fetching from queue:", error);
      return [];
    }
  };

  const refillQueueIfNeeded = async () => {
    if (swipeQueue.length === 0 && !isQueueRefilling) {
      setIsQueueRefilling(true);
      const newUsers = await fetchFromQueue();
      if (newUsers.length > 0) {
        setSwipeQueue(newUsers);
      }
      setIsQueueRefilling(false);
    }
  };

  const initializeQueue = async () => {
    setLoading(true);
    try {
      const initialUsers = await fetchFromQueue();
      setSwipeQueue(initialUsers);
      setCurrentIndex(0);
      if (!initialUsers || initialUsers.length === 0) {
        setSwipeQueue([]);
      }
    } catch (e) {
      setSwipeQueue([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeQueue();
  }, []); 

  useEffect(() => {
    if (!loading) {
      refillQueueIfNeeded();
    }
  }, [currentIndex, swipeQueue.length, loading]);

  // Persist swipedIds to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('swipedIds', JSON.stringify(Array.from(swipedIds)));
    }
  }, [swipedIds]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (swipeQueue.length === 0) return;

    const swipedUser = swipeQueue[0];
    if (!swipedUser) return;

    // Remove the first user from the queue (FIFO)
    setSwipeQueue(prev => prev.slice(1));
    setSwipedIds(prev => new Set(prev).add(swipedUser.id));
    // Do not increment currentIndex, as the next user will now be at the first index

    // Fire-and-forget backend update
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        await fetch('/api/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: user.id,
            targetId: swipedUser.id,
            direction: direction.toUpperCase(),
          }),
        });
        if (direction === 'right') {
          await sendConnectionRequest(swipedUser.id);
        }
      } catch (error) {
        console.error("Error logging swipe:", error);
        toast({
          variant: "destructive",
          title: "Swipe Error",
          description: "Could not save your swipe. Please try again."
        });
      }
    })();
  };

  const applyFilters = async (filters: { college: string; department: string; academicYear: string }) => {
    setLoading(true);
    setSwipeQueue([]); // Clear the queue before generating a new one
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/swipe/queue/generate?${query}`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to apply filters and regenerate queue');
      }
      // After generating, fetch the new queue and explicitly replace the old one
      const newUsers = await fetchFromQueue();
      setSwipeQueue(newUsers);
      setCurrentIndex(0);
      // Clear swipedIds after queue generation to sync frontend and backend
      setSwipedIds(new Set());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('swipedIds');
      }
    } catch (error) {
      console.error("Error applying filters:", error);
      setSwipeQueue([]); // Clear queue on error
    } finally {
      setLoading(false);
    }
  };

  const refreshQueue = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Securely call the generation endpoint to refresh the queue
      await fetch(`/api/swipe/queue/generate`, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      // Fetch the newly generated queue
      const newUsers = await fetchFromQueue();
      setSwipeQueue(newUsers);
      setCurrentIndex(0);
      // Clear swipedIds after queue generation to sync frontend and backend
      setSwipedIds(new Set());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('swipedIds');
      }
    } catch (error) {
      console.error("Error refreshing queue:", error);
      setSwipeQueue([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear swipe queue and swipedIds (for periodic cleanup)
  const clearSwipeQueue = async () => {
    setSwipeQueue([]);
    setCurrentIndex(0);
    setSwipedIds(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('swipedIds');
    }
    // Optionally, call backend to clear queue for this user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetch(`/api/swipe/queue/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    }
  };

  return {
    swipeQueue,
    currentUser: swipeQueue[currentIndex] || null,
    loading,
    handleSwipe,
    refreshQueue,
    hasMoreUsers: currentIndex < swipeQueue.length - 1,
    applyFilters,
    clearSwipeQueue, // expose for periodic/manual cleanup
  };
};
