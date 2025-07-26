import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  gender: string;
  avatar_url: string;
  about: string;
  interests: string[];
  tech_skills: string[];
  creative_skills: string[];
  sports_skills: string[];
  leadership_skills: string[];
  other_skills: string[];
  github: string;
  linkedin: string;
  twitter: string;
  personal_website: string;
  instagram: string;
  behance: string;
  weekly_availability: string;
  time_commitment: string;
  looking_for: string[];
  meeting_preference: string;
  personality_tags: string[];
  state: string;
  achievements: Achievement[];
  onboarding_complete?: boolean; // Changed to optional
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  link: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Fetch achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (achievementsError) {
        throw achievementsError;
      }

      setProfile({
        ...userProfile,
        gender: userProfile.gender ?? "",
        avatar_url: userProfile.avatar_url ?? "",
        about: userProfile.about ?? "",
        github: userProfile.github ?? "",
        linkedin: userProfile.linkedin ?? "",
        twitter: userProfile.twitter ?? "",
        personal_website: userProfile.personal_website ?? "",
        instagram: userProfile.instagram ?? "",
        behance: userProfile.behance ?? "",
        weekly_availability: userProfile.weekly_availability ?? "",
        time_commitment: userProfile.time_commitment ?? "",
        meeting_preference: userProfile.meeting_preference ?? "",
        state: userProfile.state ?? "",
        interests: userProfile.interests ?? [],
        tech_skills: userProfile.tech_skills ?? [],
        creative_skills: userProfile.creative_skills ?? [],
        sports_skills: userProfile.sports_skills ?? [],
        leadership_skills: userProfile.leadership_skills ?? [],
        other_skills: userProfile.other_skills ?? [],
        looking_for: userProfile.looking_for ?? [],
        onboarding_complete: userProfile.onboarding_complete ?? false, // Add this line
        personality_tags: userProfile.personality_tags ?? [],
        achievements: (achievements || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          link: a.link ?? "",
        })),
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "✅ Profile Updated!",
        description: "Your profile has been successfully updated.",
        variant: "default"
      });

      await fetchProfile(); // Refresh profile data
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: "⚠️ Update Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "👋 Logged Out",
        description: "You have been successfully logged out.",
        variant: "default"
      });
    } catch (err: any) {
      console.error('Error logging out:', err);
      toast({
        title: "⚠️ Logout Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    logout,
    refetch: fetchProfile
  };
};
