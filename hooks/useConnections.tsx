import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client"; // Keep for getting user ID for now
import { useToast } from "@/hooks/use-toast";

interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  created_at: string;
  updated_at: string;
  sender?: any; // Include sender profile
  receiver?: any;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  user?: any; // The matched user's profile
}

export const useConnections = () => {
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchConnectionRequests = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/connections/requests?userId=${user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch connection requests: ${response.statusText}`);
      }
      const data: ConnectionRequest[] = await response.json();
      setConnectionRequests(data);
    } catch (error: any) {
      console.error('Error fetching connection requests:', error);
      toast({
        variant: "destructive",
        title: "Failed to load connection requests",
        description: error.message
      });
    }
  }, [toast]);

  const fetchMatches = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`/api/connections/matches?userId=${user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
      }
      const data: Match[] = await response.json();
      setMatches(data);
    } catch (error: any) {
      console.error('Error fetching matches:', error);
      toast({
        variant: "destructive",
        title: "Failed to load matches",
        description: error.message
      });
    }
  }, [toast]);

  // Send connection request
  const sendConnectionRequest = async (receiverId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`/api/connections/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: user.id, receiver_id: receiverId }),
      });

      if (response.status === 409) {
        toast({
          title: "Connection already exists",
          description: "You've already connected with this user."
        });
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to send connection request: ${response.statusText}`);
      }

      toast({
        title: "Connection Request Sent! 💚",
        description: "Your connection request has been sent successfully."
      });
      await fetchConnectionRequests(); // Refresh requests
      return true;
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast({
        variant: "destructive",
        title: "Failed to send request",
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Accept connection request
  const acceptConnectionRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`/api/connections/requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'ACCEPTED', currentUserId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to accept connection request: ${response.statusText}`);
      }

      toast({
        title: "Connection Accepted! ✨",
        description: "You've successfully connected! They will be notified."
      });

      await Promise.all([fetchConnectionRequests(), fetchMatches()]); // Refresh data
      return true;
    } catch (error: any) {
      console.error('Error accepting connection request:', error);
      toast({
        variant: "destructive",
        title: "Failed to accept request",
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Decline connection request
  const declineConnectionRequest = async (requestId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`/api/connections/requests`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status: 'DECLINED', currentUserId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to decline connection request: ${response.statusText}`);
      }

      toast({
        title: "Request Declined",
        description: "The connection request has been declined."
      });

      await fetchConnectionRequests(); // Refresh requests
      return true;
    } catch (error: any) {
      console.error('Error declining connection request:', error);
      toast({
        variant: "destructive",
        title: "Failed to decline request",
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if two users are already matched (simplified, consider a direct API for performance)
  const checkIfMatched = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

     
      const response = await fetch(`/api/connections/matches?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to check match status');
      const allMatches: Match[] = await response.json();

      return allMatches.some(
        (match) => (match.user1_id === user.id && match.user2_id === otherUserId) ||
                   (match.user1_id === otherUserId && match.user2_id === user.id)
      );
    } catch (error) {
      console.error('Error checking if matched:', error);
      return false;
    }
  };

  // Remove a match (if needed for UI, not a core feature for MVP usually)
  // This would require a DELETE API route for matches or a PATCH to update status
  const removeMatch = async (matchedUserId: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const response = await fetch(`/api/connections/matches?userId=${user.id}&matchedUserId=${matchedUserId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to remove match');
      }

      toast({
        title: "Match Removed",
        description: "The user has been removed from your matches."
      });
      // Optionally, refetch matches or update local state here
      await fetchMatches();
      return true;
    } catch (error: any) {
      console.error('Error removing match:', error);
      toast({
        variant: "destructive",
        title: "Failed to remove match",
        description: error.message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get connection status (PENDING, ACCEPTED, DECLINED, NONE)
  const getConnectionStatus = async (otherUserId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'NONE';

      // Fetch all requests where either user is involved
      const response = await fetch(`/api/connections/requests?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch connection status');
      const requests: ConnectionRequest[] = await response.json();

      const foundRequest = requests.find(
        (req) => (req.sender_id === user.id && req.receiver_id === otherUserId) ||
                   (req.sender_id === otherUserId && req.receiver_id === user.id)
      );

      if (foundRequest) {
        return foundRequest.status;
      }
      
      // Also check if they are already matched
      const matchResponse = await fetch(`/api/connections/matches?userId=${user.id}`);
      if (!matchResponse.ok) throw new Error('Failed to fetch match status');
      const matches: Match[] = await matchResponse.json();

      const foundMatch = matches.some(
        (match) => (match.user1_id === user.id && match.user2_id === otherUserId) ||
                   (match.user1_id === otherUserId && match.user2_id === user.id)
      );

      if (foundMatch) {
        return 'ACCEPTED'; // If they are matched, consider it accepted
      }

      return 'NONE';
    } catch (error) {
      console.error('Error getting connection status:', error);
      return 'NONE';
    }
  };

  useEffect(() => {
    fetchConnectionRequests();
    fetchMatches();
  }, [fetchConnectionRequests, fetchMatches]);

  return {
    connectionRequests,
    matches,
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    fetchConnectionRequests, // Expose for manual refresh
    fetchMatches, // Expose for manual refresh
    checkIfMatched,
    removeMatch,
    getConnectionStatus,
  };
}
