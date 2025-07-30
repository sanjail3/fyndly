"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Zap, 
  ArrowRight,
  Eye,
  Lightbulb,
  Star,
  BookOpen,
  Film,
  Headphones
} from "lucide-react";
import { useRouter } from "next/navigation";

const TasteAnalysisPromo = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  // Cycle through animation phases
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = () => {
    router.push('/taste-analysis');
  };

  const features = [
    { icon: Brain, text: "AI-Powered Analysis", color: "text-purple-400" },
    { icon: Target, text: "Personalized Insights", color: "text-blue-400" },
    { icon: TrendingUp, text: "Taste Evolution", color: "text-green-400" }
  ];

  const contentIcons = [BookOpen, Film, Headphones];
  const ContentIcon = contentIcons[animationPhase];

  return (
    <div className="px-4 py-6">
      <Card 
        className="relative bg-gradient-to-br from-gray-900/90 via-black/95 to-gray-900/90 border-[#CAFE33]/30 rounded-3xl overflow-hidden group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleNavigate}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#CAFE33]/5 via-purple-500/5 to-blue-500/5 opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23CAFE33\\' fill-opacity=\\'0.05\\'%3E%3Ccircle cx=30 cy=30 r=1.5/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        {/* Glowing border effect */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
          isHovered ? 'bg-gradient-to-r from-[#CAFE33]/20 to-purple-500/20 blur-sm' : ''
        }`}></div>

        <CardContent className="relative z-10 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Left Section - Branding & Hook */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#CAFE33]/20 rounded-full blur-lg animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-[#CAFE33] to-green-400 p-3 rounded-full">
                    <Brain className="w-6 h-6 text-black animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-[#CAFE33] to-purple-400 bg-clip-text text-transparent">
                    Discover Your Taste Universe
                  </h3>
                  <p className="text-gray-400 text-sm">Powered by Advanced AI</p>
                </div>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                🧬 Get <span className="text-[#CAFE33] font-semibold">deep personalized insights</span> into your unique preferences, interests, and the fascinating patterns that make you... <span className="text-purple-400 font-semibold">YOU!</span>
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700/50">
                    <feature.icon className={`w-4 h-4 ${feature.color}`} />
                    <span className="text-sm text-gray-300 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* What you'll discover */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400 font-medium">✨ What you'll discover:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#CAFE33] rounded-full"></div>
                    <span className="text-gray-300">Your personality core</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-gray-300">Content DNA analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Taste evolution timeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">AI-powered recommendations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Visual & CTA */}
            <div className="flex flex-col items-center space-y-6">
              {/* Animated content icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className={`relative bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-full border border-purple-500/30 transition-all duration-500 ${
                  isHovered ? 'scale-110 rotate-12' : ''
                }`}>
                  <ContentIcon className="w-12 h-12 text-purple-400 animate-bounce" />
                </div>
                
                {/* Floating sparkles */}
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-[#CAFE33] animate-spin" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
                <div className="absolute top-1/2 -right-4">
                  <Zap className="w-5 h-5 text-blue-400 animate-bounce" />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#CAFE33]">🧠</div>
                  <div className="text-xs text-gray-400">Brain Map</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">🎨</div>
                  <div className="text-xs text-gray-400">Content DNA</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">🚀</div>
                  <div className="text-xs text-gray-400">Evolution</div>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className={`w-full bg-gradient-to-r from-[#CAFE33] to-green-400 text-black font-bold py-3 px-6 rounded-2xl transition-all duration-300 group/btn ${
                  isHovered ? 'scale-105 shadow-lg shadow-[#CAFE33]/25' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5 group-hover/btn:animate-bounce" />
                  <span>Explore My Universe</span>
                  <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                    isHovered ? 'translate-x-1' : ''
                  }`} />
                </div>
              </Button>

              {/* Floating badge */}
              <div className="relative">
                <Badge className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 border-purple-500/30 px-3 py-1 animate-pulse">
                  ⚡ Instant Analysis
                </Badge>
              </div>
            </div>
          </div>

          {/* Bottom teaser */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#CAFE33]/5 to-purple-500/5 rounded-2xl border border-[#CAFE33]/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#CAFE33]" />
                <span className="text-sm text-gray-300">
                  <span className="text-[#CAFE33] font-semibold">Fun fact:</span> Your taste patterns reveal more about your personality than you think!
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs text-gray-500">
                <span>Free</span>
                <span>•</span>
                <span>2 min read</span>
                <span>•</span>
                <span>AI-powered</span>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-r from-[#CAFE33]/5 to-purple-500/5 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>
      </Card>
    </div>
  );
};

export default TasteAnalysisPromo; 