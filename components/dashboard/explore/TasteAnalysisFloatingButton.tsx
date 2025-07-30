"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";

const TasteAnalysisFloatingButton = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Show FAB after user scrolls down a bit
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300 && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  // Check if user has dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('taste-analysis-fab-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleNavigate = () => {
    router.push('/taste-analysis');
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem('taste-analysis-fab-dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Main FAB */}
        <div className="relative">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 z-10 border border-gray-600"
          >
            <X className="w-3 h-3" />
          </button>

          {/* Main button */}
          <Button
            onClick={handleNavigate}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative bg-gradient-to-r from-[#CAFE33] to-green-400 hover:from-[#CAFE33]/90 hover:to-green-400/90 text-black rounded-full p-4 shadow-lg transition-all duration-300 ${
              isHovered ? 'scale-110 shadow-2xl shadow-[#CAFE33]/25' : ''
            }`}
          >
            {/* Pulsing ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#CAFE33] to-green-400 animate-ping opacity-20"></div>
            
            {/* Content */}
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <Brain className="w-6 h-6 animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                isHovered ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
              }`}>
                <span className="text-sm font-bold whitespace-nowrap">
                  Discover Your Taste Universe
                </span>
              </div>
            </div>
          </Button>

          {/* Tooltip on hover */}
          {isHovered && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-gray-700">
              🧬 Get personalized AI insights about your preferences
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        {/* Fun fact bubble (appears after some time) */}
        <div className={`absolute bottom-full right-0 mb-4 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg max-w-48 border border-purple-500/50">
            <div className="flex items-center gap-2">
              <span className="text-yellow-300">💡</span>
              <span>Your taste patterns reveal hidden personality traits!</span>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasteAnalysisFloatingButton; 