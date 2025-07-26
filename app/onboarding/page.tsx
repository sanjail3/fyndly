'use client';

import { useRouter } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleOnboardingComplete = async () => {
    try {
      // Update user metadata to mark onboarding as complete
      const { error } = await supabase.auth.updateUser({
        data: { completed_onboarding: true }
      });

      if (error) {
        console.error('Error updating user metadata:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to complete onboarding. Please try again."
        });
        return;
      }

      router.push('/explore');
      toast({
        title: "Profile Complete!",
        description: "Welcome to your campus discovery platform."
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again."
      });
    }
  };

  return <OnboardingFlow onComplete={handleOnboardingComplete} />;
} 