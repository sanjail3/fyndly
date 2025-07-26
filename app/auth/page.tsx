'use client';

import { useRouter } from 'next/navigation';
import AuthPageNew from '@/components/auth/AuthPageNew';

export default function AuthPage() {
  const router = useRouter();

  const handleAuthSuccess = async () => {
    // This will be handled by the auth state change listener in the root page
  };

  const handleBackToLanding = () => {
    router.push('/');
  };

  return (
    <AuthPageNew 
      onAuthSuccess={handleAuthSuccess}
      onBack={handleBackToLanding}
    />
  );
} 