"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import { supabase } from "@/integrations/supabase/client";

function LoadingIcon({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <img
        src="/icon.png"
        alt="Fyndly Logo"
        className="rounded-2xl shadow-xl animate-spin-slow"
        style={{ width: size, height: size, animation: 'spin 1.2s linear infinite' }}
      />
      {message && <p className="text-green-300 mt-4">{message}</p>}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/explore");
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) return <LoadingIcon size={72} message="Loading Fyndly..." />;
  return <LandingPage onGetStarted={() => router.push('/auth')} />;
}
