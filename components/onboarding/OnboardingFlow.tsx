import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmbeddings } from "@/hooks/useEmbeddings";
import { analyzeFavorites } from "@/lib/analyze-favorites";
import BasicInfoStep from "./steps/BasicInfoStep";
import InterestsStep from "./steps/InterestsStep";
import FavoritesStep from "./steps/FavoritesStep";
import ExpandedSkillsStep from "./steps/ExpandedSkillsStep";
import AboutStep from "./steps/AboutStep";
import AchievementsStep from "./steps/AchievementsStep";
import SocialLinksStep from "./steps/SocialLinksStep";
import ExpandedAvailabilityStep from "./steps/ExpandedAvailabilityStep";
import FunTagsStep from "./steps/FunTagsStep";
import { useRouter } from 'next/navigation';

const loadingMessages = [
  "Consulting the digital muses...",
  "Warming up the AI's paintbrush...",
  "Generating a creative concept...",
  "Crafting your unique avatar...",
  "Adding the finishing touches...",
  "Uploading to the gallery...",
  "Saving your profile..."
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

interface BasicInfo {
  name?: string;
  college?: string;
  department?: string;
  year?: string;
  gender?: string;
  place?: string;
  state?: string;
  passOutYear?: string;
}

interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  instagram?: string;
  behance?: string;
}

interface Availability {
  weeklyHours?: string;
  timeCommitment?: string;
  lookingFor?: string[];
  preferredMeeting?: string;
}

interface Skills {
  tech: string[];
  creative: string[];
  sports: string[];
  leadership: string[];
  other: string[];
}

interface Favorites {
  books: string[];
  movies: string[];
  podcasts: string[];
  brands: string[];
}

interface FormData {
  basicInfo: BasicInfo;
  interests: string[];
  favorites: Favorites;
  skills: Skills;
  about: string;
  achievements: any[];
  socialLinks: SocialLinks;
  availability: Availability;
  funTags: string[];
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);
  const [avatarStatus, setAvatarStatus] = useState(''); // For avatar generation feedback
  const { toast } = useToast();
  const { generateEmbedding } = useEmbeddings();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {},
    interests: [],
    favorites: { books: [], movies: [], podcasts: [], brands: [] },
    skills: { tech: [], creative: [], sports: [], leadership: [], other: [] },
    about: "",
    achievements: [],
    socialLinks: {},
    availability: {},
    funTags: []
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      let i = 0;
      setLoadingText(loadingMessages[i]);
      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const steps = [
    { component: BasicInfoStep, title: "Basic Info 👤", emoji: "👤" },
    { component: InterestsStep, title: "Interests 🎯", emoji: "🎯" },
    { component: FavoritesStep, title: "Your Favorites ⭐", emoji: "⭐" },
    { component: ExpandedSkillsStep, title: "Skills & Talents 💪", emoji: "💪" },
    { component: AboutStep, title: "About You 📝", emoji: "📝" },
    { component: AchievementsStep, title: "Achievements & Work 🏆", emoji: "🏆" },
    { component: SocialLinksStep, title: "Social Links 🔗", emoji: "🔗" },
    { component: ExpandedAvailabilityStep, title: "Availability & Goals ⏰", emoji: "⏰" },
    { component: FunTagsStep, title: "Fun Tags 🎉", emoji: "🎉" }
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (stepKey: string, data: any) => {
    setFormData(prev => ({ ...prev, [stepKey]: data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get session for API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User session not found. Please log in again.");
      }

      // --- NEW: Generate Avatar via API ---
      setAvatarStatus('Generating your unique avatar...');
      let avatarUrl = '';
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 500000); // 15s timeout
        let response, errorData;
        try {
          response = await fetch('/api/user/generate-avatar', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              gender: formData.basicInfo.gender || 'other',
              name: formData.basicInfo.name || 'User'
            }),
            signal: controller.signal
          });
        } catch (err) {
          response = null;
        }
        clearTimeout(timeout);

        if (!response || !response.ok) {
          try { errorData = await response?.json(); } catch { errorData = {}; }
          throw new Error(errorData?.error || 'Failed to generate avatar.');
        }

        const { avatarUrl: generatedUrl } = await response.json();
        avatarUrl = generatedUrl;
        setAvatarStatus('Avatar generated!');
      } catch (avatarError: any) {
        console.error("Avatar generation error:", avatarError);
        toast({
          title: "Avatar Generation Failed",
          description: "Could not generate a custom avatar. A default will be used.",
          variant: "destructive"
        });
        // Fallback to a default avatar if generation fails
        avatarUrl = `https://avatar.iran.liara.run/public?username=${encodeURIComponent(formData.basicInfo.name || 'User')}`;
        setAvatarStatus('');
      }

      // --- NEW: Analyze favorites to determine interests ---
      console.log('Analyzing favorites to determine interests...');
      const analyzedInterests = analyzeFavorites(formData.favorites);
      console.log('Analyzed interests:', analyzedInterests);

      // Prepare user data for database
      const userData = {
        id: user.id,
        email: user.email,
        full_name: formData.basicInfo.name || "",
        college: formData.basicInfo.college || "",
        department: formData.basicInfo.department || "",
        academic_year: parseInt(formData.basicInfo.year?.replace(/[^\d]/g, '') || "1"),
        pass_out_year: formData.basicInfo.year === 'Passout' 
          ? parseInt(formData.basicInfo.passOutYear || '', 10) 
          : null,
        gender: formData.basicInfo.gender || 'prefer_not_to_say',
        place: formData.basicInfo.place || "",
        state: formData.basicInfo.state || null,
        avatar_url: avatarUrl,
        about: formData.about || "",
        
        // Interests and Skills
        interests: formData.interests || [],
        tech_skills: formData.skills.tech || [],
        creative_skills: formData.skills.creative || [],
        sports_skills: formData.skills.sports || [],
        leadership_skills: formData.skills.leadership || [],
        other_skills: formData.skills.other || [],
        
        // Favorites data
        favorite_books: formData.favorites.books || [],
        favorite_movies: formData.favorites.movies || [],
        favorite_podcasts: formData.favorites.podcasts || [],
        favorite_brands: formData.favorites.brands || [],
        
        // --- NEW: Auto-detected interests based on favorites ---
        book_interests: analyzedInterests.book_interests,
        movie_interests: analyzedInterests.movie_interests,
        podcast_interests: analyzedInterests.podcast_interests,
        tv_show_interests: analyzedInterests.tv_show_interests,
        
        // Social Links
        github: formData.socialLinks.github || null,
        linkedin: formData.socialLinks.linkedin || null,
        twitter: formData.socialLinks.twitter || null,
        personal_website: formData.socialLinks.website || null,
        instagram: formData.socialLinks.instagram || null,
        behance: formData.socialLinks.behance || null,
        
        // Availability & Intent
        weekly_availability: formData.availability.weeklyHours || null,
        time_commitment: formData.availability.timeCommitment || null,
        looking_for: formData.availability.lookingFor || [],
        meeting_preference: formData.availability.preferredMeeting || null,
        
        // Fun Tags
        personality_tags: formData.funTags || []
      };

      console.log('Saving user profile...');

      // Use the new API route to save profile data (bypasses RLS)
      const saveResponse = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          basicInfo: formData.basicInfo,
          interests: formData.interests,
          favorites: formData.favorites,
          analyzedInterests: analyzedInterests, // Include analyzed interests
          skills: formData.skills,
          about: formData.about,
          achievements: formData.achievements,
          socialLinks: formData.socialLinks,
          availability: formData.availability,
          funTags: formData.funTags,
          avatarUrl: avatarUrl
        })
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save profile data');
      }

      const saveResult = await saveResponse.json();
      console.log('Profile saved successfully:', saveResult);

      // Generate embedding for the user
      console.log('Generating embedding for user...');
      const success = await generateEmbedding(user.id);
      if (!success) throw new Error("Failed to generate user embedding");

      // --- NEW: Trigger swipe queue generation asynchronously ---
        fetch('/api/swipe/queue/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        .then(res => {
          if (res.ok) {
            console.log("Successfully triggered swipe queue generation for new user.");
          } else {
            console.error("Failed to trigger swipe queue generation for new user.");
          }
        })
        .catch(err => console.error("Error triggering swipe queue generation:", err));

      toast({
        title: "Profile Saved!",
        description: "Your Fyndly profile is now live with personalized recommendations.",
        variant: "default"
      });

      setTimeout(() => {
        // Navigate to /explore after onboarding
        router.push('/explore');
        if (onComplete) onComplete();
      }, 500);
    } catch (error: any) {
      console.error("Error saving onboarding data:", error);
      toast({
        title: "Error saving profile",
        description: error.message || "An error occurred while saving your onboarding data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <img
          src="/icon.png"
          alt="Fyndly Logo"
          className="w-20 h-20 rounded-2xl shadow-xl animate-spin-slow"
        />
        <p className="text-gray-400 mt-6 text-lg animate-pulse">{loadingText}</p>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin 1.5s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 bg-black border-b border-gray-800 p-4 z-10">
        <div className="mb-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#CAFE33] flex items-center justify-center gap-2">
              <span className="text-xl">{steps[currentStep].emoji}</span>
              {steps[currentStep].title}
            </h2>
            <p className="text-xs text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2 bg-gray-800" />
      </div>

      {/* Step Content */}
      <div className="p-4">
        <CurrentStepComponent 
          data={formData}
          updateData={updateFormData}
          onNext={handleNext}
          goBack={handlePrevious}
        />
      </div>
    </div>
  );
};

export default OnboardingFlow;
