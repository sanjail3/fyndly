import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchedUser {
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
  weekly_availability?: string;
  time_commitment?: string;
  about?: string;
  place?: string;
  personality_tags?: string[];
  github?: string;
  linkedin?: string;
  twitter?: string;
  personal_website?: string;
  instagram?: string;
  behance?: string;
  matchScore?: number;
  isNewUser?: boolean;
  similarity?: number;
  intentOverlap?: number;
  hotScore?: number;
}

type FilterConditions = {
  college?: string;
  department?: string;
  academic_year?: string;
  availability?: string;
  intent?: string[];
  tech_skills?: string[];
  creative_skills?: string[];
  business_skills?: string[];
  personality?: string[];
  skills?: string[];
  gender?: string[];
  search?: string;
};

export const useMatchingAlgorithm = () => {
  const [perfectMatches, setPerfectMatches] = useState<MatchedUser[]>([]);
  const [hotMatches, setHotMatches] = useState<MatchedUser[]>([]);
  const [collegeMatches, setCollegeMatches] = useState<MatchedUser[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<MatchedUser[]>([]);
  const [filteredResults, setFilteredResults] = useState<MatchedUser[]>([]);
  const [filters, setFilters] = useState<FilterConditions>({});
  const [loading, setLoading] = useState(true);
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);

  const { toast } = useToast();

  const fetchMatches = async (filterObj?: FilterConditions) => {
    // Only fetch if filters are present
    const hasFilters = filterObj && Object.keys(filterObj).length > 0;
    if (!hasFilters) {
      setPerfectMatches([]);
      setHotMatches([]);
      setCollegeMatches([]);
      setRecommendedMatches([]);
      setFilteredResults([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPerfectMatches([]); setHotMatches([]); setCollegeMatches([]); setRecommendedMatches([]); setFilteredResults([]); setMatchedUsers([]);
        return;
      }
      const queryParams = new URLSearchParams();
      queryParams.append('userId', user.id);
      if (filterObj && Object.keys(filterObj).length > 0) {
        queryParams.append('filters', JSON.stringify(filterObj));
      }
      const response = await fetch(`/api/matching?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
      }
      const data = await response.json();
      setPerfectMatches(data.perfectMatches || []);
      setHotMatches(data.hotMatches || []);
      setCollegeMatches(data.collegeMatches || []);
      setRecommendedMatches(data.recommendedMatches || []);
      setFilteredResults(data.filteredResults || []);
      setMatchedUsers(data.matchedUsers || []);
    } catch (err: any) {
      setPerfectMatches([]); setHotMatches([]); setCollegeMatches([]); setRecommendedMatches([]); setFilteredResults([]); setMatchedUsers([]);
      console.error('Error in fetchMatches:', err);
      toast({
        variant: "destructive",
        title: "Failed to load matches",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle homepage filters
  const applyFilters = (filterObj: FilterConditions) => {
    setFilters(filterObj);
    fetchMatches(filterObj);
  };

  useEffect(() => {
    // Only fetch if filters are present
    if (filters && Object.keys(filters).length > 0) {
      fetchMatches(filters);
    } else {
      setPerfectMatches([]);
      setHotMatches([]);
      setCollegeMatches([]);
      setRecommendedMatches([]);
      setFilteredResults([]);
      setLoading(false);
    }
  }, [filters]);

  return {
    perfectMatches,
    hotMatches,
    collegeMatches,
    recommendedMatches,
    filteredResults,
    loading,
    filters,
    applyFilters,
    refetch: fetchMatches,
    matchedUsers,
  };
};

export const useExploreQueue = () => {
  const [queue, setQueue] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setQueue({});
        return;
      }
      let response = await fetch(`/api/explore/queue?userId=${user.id}`);
      let data = await response.json();
      if (data.needsRegeneration) {
        await fetch(`/api/explore/queue/generate?userId=${user.id}`, { method: 'POST' });
        response = await fetch(`/api/explore/queue?userId=${user.id}`);
        data = await response.json();
      }
      setQueue(data.queue || {});
    } catch (err: any) {
      setQueue({});
      toast({
        variant: "destructive",
        title: "Failed to load explore queue",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  return {
    queue,
    loading,
    refetch: fetchQueue,
  };
};
