"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const TasteAnalysisHeroCTA = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleNavigate = () => {
    router.push('/taste-analysis');
  };

  return (
    <div className="mt-6 flex justify-center">
      <Button
        onClick={handleNavigate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gradient-to-r from-[#CAFE33]/20 to-purple-500/20 hover:from-[#CAFE33]/30 hover:to-purple-500/30 text-[#CAFE33] border border-[#CAFE33]/30 rounded-full px-6 py-3 font-medium transition-all duration-300 group backdrop-blur-sm"
      >
        {/* Glowing background */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-[#CAFE33]/10 to-purple-500/10 blur-sm transition-all duration-300 ${
          isHovered ? 'opacity-100 scale-110' : 'opacity-50'
        }`}></div>
        
        {/* Content */}
        <div className="relative flex items-center gap-2">
          <Brain className={`w-5 h-5 transition-all duration-300 ${
            isHovered ? 'animate-pulse text-[#CAFE33]' : ''
          }`} />
          <span className="text-sm font-semibold">
            🧬 Discover Your Taste Universe
          </span>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
              isHovered ? 'translate-x-1' : ''
            }`} />
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute -top-1 -right-1">
          <div className="w-2 h-2 bg-[#CAFE33] rounded-full animate-ping"></div>
        </div>
        <div className="absolute -bottom-1 -left-1">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
        </div>
      </Button>
    </div>
  );
};

export default TasteAnalysisHeroCTA; 