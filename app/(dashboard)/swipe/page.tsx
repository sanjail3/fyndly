'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Dashboard from '@/components/dashboard/Dashboard';
import SwipePage from '@/components/dashboard/SwipePage';
import ProfileFullModal from '@/components/dashboard/ProfileFullModal';
import ProductRecommender from '@/components/dashboard/swipe/ProductRecommender';
import { useUserProfile, UserProfile } from '@/hooks/useUserProfile';

// Custom pill-style toggle component
function ThemeToggle({ isProductMode, setIsProductMode }: { isProductMode: boolean; setIsProductMode: (v: boolean) => void }) {
  return (
    <div className="flex bg-black rounded-full p-1 border border-[#CAFE32]/40 w-fit mx-auto mb-6 shadow-md">
      <button
        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 text-sm md:text-base
          ${!isProductMode ? 'bg-[#CAFE32] text-black shadow' : 'text-[#CAFE32] hover:bg-[#CAFE32]/10'}
        `}
        onClick={() => setIsProductMode(false)}
        type="button"
      >
        People
      </button>
      <button
        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 text-sm md:text-base
          ${isProductMode ? 'bg-[#CAFE32] text-black shadow' : 'text-[#CAFE32] hover:bg-[#CAFE32]/10'}
        `}
        onClick={() => setIsProductMode(true)}
        type="button"
      >
        Products
      </button>
    </div>
  );
}

type User = UserProfile;

export default function SwipeTab() {
  const [isProductMode, setIsProductMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { profile: userProfileData, loading: userProfileLoading } = useUserProfile();

  useEffect(() => {
    // DEBUG: Log the user profile data to see the onboarding status
    if (userProfileData) {
      console.log("Swipe Page User Profile:", JSON.stringify(userProfileData, null, 2));
      console.log("Onboarding Complete Status:", userProfileData.onboarding_complete);
    }

    if (userProfileData && userProfileData.onboarding_complete === false) {
      router.push('/onboarding');
    }
  }, [userProfileData, router]);

  if (userProfileLoading) {
    return <p className="text-center text-gray-500">Loading profile...</p>;
  }

  if (!userProfileData) {
    return <p className="text-center text-gray-500">Profile data not available.</p>;
  }

  return (
    <Dashboard>
      <div className="flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto">
        <ThemeToggle isProductMode={isProductMode} setIsProductMode={setIsProductMode} />
        {!isProductMode ? (
          <SwipePage />
        ) : (
          <ProductRecommender />
        )}
        {selectedUser && (
          <ProfileFullModal
            profile={selectedUser}
            open={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            isMatched={false}
            onRemoveMatch={() => {}}
            onConnect={() => {}}
          />
        )}
      </div>
    </Dashboard>
  );
} 