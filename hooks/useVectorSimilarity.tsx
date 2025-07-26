import { supabase } from '@/integrations/supabase/client';

interface SimilarUser {
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
  created_at?: string;
  matchScore: number;
  isNewUser: boolean;
  similarity?: number;
}

export const useVectorSimilarity = () => {
  const fetchSimilarUsers = async (
    userId: string, 
    limit: number = 50, 
    threshold: number = 0.1
  ): Promise<SimilarUser[]> => {
    try {
      console.log('Starting fetchSimilarUsers with userId:', userId, 'limit:', limit);
      
      // Call the new API route for vector similarity search
      const response = await fetch('/api/vector-similarity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          limit: limit,
          threshold: threshold,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error from vector similarity API:', errorData);
        return await fallbackFetchUsers(userId, limit);
      }

      const data = await response.json();

      if (!data || !data.users || data.users.length === 0) {
        console.log('No users returned from vector similarity API');
        return await fallbackFetchUsers(userId, limit);
      }

      console.log('Successfully fetched users from vector similarity API:', data.users.length);

      // Map users with scoring (API should return similarity)
      const mappedUsers = data.users.map((user: any, index: number) => ({
          id: user.id,
          full_name: user.full_name || `User ${index + 1}`,
          college: user.college || 'Unknown College',
          department: user.department || 'Unknown Department',
          academic_year: user.academic_year || 1,
          avatar_url: user.avatar_url,
          interests: Array.isArray(user.interests) ? user.interests : [],
          tech_skills: Array.isArray(user.tech_skills) ? user.tech_skills : [],
          creative_skills: Array.isArray(user.creative_skills) ? user.creative_skills : [],
          sports_skills: Array.isArray(user.sports_skills) ? user.sports_skills : [],
          leadership_skills: Array.isArray(user.leadership_skills) ? user.leadership_skills : [],
          other_skills: Array.isArray(user.other_skills) ? user.other_skills : [],
          looking_for: Array.isArray(user.looking_for) ? user.looking_for : [],
          weekly_availability: user.weekly_availability,
          time_commitment: user.time_commitment,
          about: user.about,
          place: user.place,
          personality_tags: Array.isArray(user.personality_tags) ? user.personality_tags : [],
          github: user.github,
          linkedin: user.linkedin,
          twitter: user.twitter,
          personal_website: user.personal_website,
          instagram: user.instagram,
          behance: user.behance,
          created_at: user.created_at,
        // Match score can be directly from similarity (0-1) scaled to 0-100
        matchScore: user.similarity ? Math.floor((1 - user.similarity) * 100) : Math.floor(80 + Math.random() * 20), // (1 - similarity) for distance to score
          isNewUser: user.created_at 
            ? new Date(user.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
            : false,
          similarity: user.similarity || 0.8
      }));
      
      return mappedUsers;
    } catch (error) {
      console.error('Error in fetchSimilarUsers:', error);
      return await fallbackFetchUsers(userId, limit);
    }
  };

  // Enhanced fallback function using the new /api/users endpoint
  const fallbackFetchUsers = async (userId: string, limit: number): Promise<SimilarUser[]> => {
    try {
      console.log('Using fallback to /api/users endpoint...');
      
      // Fetch current user's college for basic filtering
      const currentUserResponse = await fetch(`/api/user/profile?userId=${userId}`);
      let currentUserCollege = null;
      if (currentUserResponse.ok) {
        const currentUserData = await currentUserResponse.json();
        currentUserCollege = currentUserData.college;
      }

      let url = `/api/users?excludeUserId=${userId}&limit=${limit}`;
      if (currentUserCollege) {
        url += `&college=${currentUserCollege}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch fallback users: ${response.statusText}`);
      }
      const users: any[] = await response.json();

      if (!users || users.length === 0) {
        console.log('No users found in fallback');
        return [];
      }

      // Map users with dummy scoring for fallback
      const mappedUsers = users.map((user: any, index: number) => ({
        id: user.id,
        full_name: user.full_name || `User ${index + 1}`,
        college: user.college || 'Unknown College',
        department: user.department || 'Unknown Department',
        academic_year: user.academic_year || 1,
        avatar_url: user.avatar_url,
        interests: Array.isArray(user.interests) ? user.interests : [],
        tech_skills: Array.isArray(user.tech_skills) ? user.tech_skills : [],
        creative_skills: Array.isArray(user.creative_skills) ? user.creative_skills : [],
        sports_skills: Array.isArray(user.sports_skills) ? user.sports_skills : [],
        leadership_skills: Array.isArray(user.leadership_skills) ? user.leadership_skills : [],
        other_skills: Array.isArray(user.other_skills) ? user.other_skills : [],
        looking_for: Array.isArray(user.looking_for) ? user.looking_for : [],
        weekly_availability: user.weekly_availability,
        time_commitment: user.time_commitment,
        about: user.about,
        place: user.place,
        personality_tags: Array.isArray(user.personality_tags) ? user.personality_tags : [],
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        personal_website: user.personal_website,
        instagram: user.instagram,
        behance: user.behance,
        created_at: user.created_at,
        matchScore: Math.floor(75 + Math.random() * 25), // Slightly lower for fallback
        isNewUser: user.created_at 
          ? new Date(user.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
          : false,
        similarity: 0.6 + Math.random() * 0.4 // Random similarity between 0.6-1.0
      }));

      console.log('Fallback query returned users:', mappedUsers.length);
      return mappedUsers;
    } catch (error) {
      console.error('Error in fallback query:', error);
      return [];
    }
  };

  return { fetchSimilarUsers };
};
