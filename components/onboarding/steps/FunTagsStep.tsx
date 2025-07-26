import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FunTagsStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const FunTagsStep = ({ data, updateData, onNext, goBack }: FunTagsStepProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(data.funTags || []);
  const [warning, setWarning] = useState("");

  const funTagCategories = {
    personality: {
      title: " Personality",
      emoji: "🎭",
      tags: [
        "Introvert", "Extrovert", "Ambivert", "Creative", "Analytical", 
        "Adventurous", "Calm", "Energetic", "Optimistic", "Pragmatic",
        "Curious", "Ambitious", "Laid-back", "Organized", "Spontaneous"
      ]
    },
    interests: {
      title: " Interests",
      emoji: "🎯", 
      tags: [
        "Tech Enthusiast", "Bookworm", "Movie Buff", "Music Lover", "Foodie",
        "Travel Lover", "Gamer", "Fitness Freak", "Art Lover", "Nature Lover",
        "Coffee Addict", "Night Owl", "Early Bird", "Minimalist", "Maximalist"
      ]
    },
    lifestyle: {
      title: " Lifestyle",
      emoji: "🌟",
      tags: [
        "Workaholic", "Work-Life Balance", "Party Animal", "Homebody", 
        "Social Butterfly", "Lone Wolf", "Health Conscious", "Eco-Friendly",
        "Tech Savvy", "Old School", "Budget Conscious", "Luxury Lover",
        "DIY Enthusiast", "Brand Conscious", "Minimalist Living"
      ]
    },
    humor: {
      title: " Humor Style",
      emoji: "😄",
      tags: [
        "Sarcastic", "Witty", "Punny", "Dark Humor", "Wholesome", 
        "Memester", "Dad Jokes", "Stand-up Fan", "Roast Master", 
        "Clean Humor", "Self-deprecating", "Observational", "Physical Comedy"
      ]
    },
    quirks: {
      title: " Quirks & Fun Facts",
      emoji: "🦄", 
      tags: [
        "Perfectionist", "Procrastinator", "Multitasker", "Detail-oriented",
        "Big Picture Thinker", "List Maker", "Planner", "Spontaneous",
        "Collector", "Hoarder", "Minimalist", "Maximalist", "Researcher",
        "Question Everything", "Go with the Flow"
      ]
    }
  };

  useEffect(() => {
    setSelectedTags(data.funTags || []);
  }, [data.funTags]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("funTags", selectedTags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const isTagSelected = (tag: string) => selectedTags.includes(tag);
  const hasSelectedTags = selectedTags.length > 0;

  const handleComplete = () => {
    if (selectedTags.length === 0) {
      setWarning("You can skip, but adding some tags helps others know you better!");
    } else {
      setWarning("");
    }
    updateData("funTags", selectedTags);
    onNext();
  };

  return (
    <div className="space-y-6 pb-20">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-3xl">🎉</span>
          Show your personality!
        </h3>
        <p className="text-gray-400">Pick tags that describe you - let your personality shine!</p>
      </div>

      {warning && (
        <div className="text-yellow-400 text-sm text-center mb-2">{warning}</div>
      )}

      <div className="space-y-8">
        {Object.entries(funTagCategories).map(([category, { title, emoji, tags }]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-lg font-semibold text-[#CAFE33] flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              {title}
              {selectedTags.filter(tag => tags.includes(tag)).length > 0 && (
                <Badge variant="secondary" className="bg-[#CAFE33] text-black ml-2">
                  {selectedTags.filter(tag => tags.includes(tag)).length}
                </Badge>
              )}
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left",
                    isTagSelected(tag)
                      ? "bg-[#CAFE33] text-black border-[#CAFE33] shadow-lg transform scale-105"
                      : "bg-gray-900 text-gray-300 border-gray-600 hover:border-[#CAFE33] hover:text-[#CAFE33] hover:bg-gray-800"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasSelectedTags && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h5 className="text-[#CAFE33] font-medium mb-2 flex items-center gap-2">
              <span>🏷️</span>
              Your Selected Tags ({selectedTags.length}):
            </h5>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="border-[#CAFE33] text-[#CAFE33] bg-[#CAFE33]/10"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ✕
                </Badge>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleComplete}
            className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg"
          >
            Complete Profile 🎉
          </Button>
        </div>
      )}

      {!hasSelectedTags && (
        <Button 
          onClick={handleComplete}
          variant="outline"
          className="w-full flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold"
        >
          Skip for now
        </Button>
      )}
    </div>
  );
};

export default FunTagsStep;
