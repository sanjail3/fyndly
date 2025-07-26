import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Welcome */}
        <div className="text-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <img
                src="/icon.png"
                alt="Fyndly Logo"
                className="w-20 h-20 animate-spin-slow rounded-2xl shadow-xl mx-auto"
                style={{ animation: 'spin 1.2s linear infinite' }}
              />
              <p className="text-gray-400 mt-4">Connecting...</p>
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
          ) : (
            <div className="mx-auto w-20 h-20 bg-[#CAFE33] rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-black">F</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white">Fyndly</h1>
            <p className="text-gray-400 mt-2">Discover your campus tribe</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="bg-gray-900 border-gray-800 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-white">Get Started</CardTitle>
            <p className="text-gray-400 text-sm">
              Connect with like-minded students for projects, hackathons, and more
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? null : (
              <Button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-6 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <Chrome className="mr-3 h-5 w-5" />
                {isLoading ? "Connecting..." : "Continue with Google"}
              </Button>
            )}
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <span className="text-[#CAFE33] text-xl">👥</span>
            </div>
            <p className="text-xs text-gray-400">Discover</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <span className="text-[#CAFE33] text-xl">🤝</span>
            </div>
            <p className="text-xs text-gray-400">Connect</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-xl mx-auto mb-2 flex items-center justify-center">
              <span className="text-[#CAFE33] text-xl">🚀</span>
            </div>
            <p className="text-xs text-gray-400">Collaborate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
