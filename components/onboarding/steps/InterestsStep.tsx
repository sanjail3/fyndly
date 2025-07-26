import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Code, Heart, Music, Camera, Gamepad2, BookOpen, Coffee, Dumbbell } from "lucide-react";

interface InterestsStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const InterestsStep = ({ data, updateData, onNext, goBack }: InterestsStepProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests || []);
  const [customInterest, setCustomInterest] = useState("");
  const [activeCategory, setActiveCategory] = useState("tech");
  const [error, setError] = useState("");

  const interestCategories = {
    tech: {
      icon: Code,
      name: "Tech & Development",
      color: "from-blue-500 to-cyan-500",
      interests: [
        "Web Development", "Mobile Apps", "AI/ML", "Data Science", "Blockchain",
        "UI/UX Design", "Cybersecurity", "IoT", "Robotics", "Game Development",
        "DevOps", "Cloud Computing", "Python", "JavaScript", "React",
        "Competitive Programming"
      ]
    },
    creative: {
      icon: Camera,
      name: "Creative & Arts",
      color: "from-purple-500 to-pink-500",
      interests: [
        "Photography", "Digital Art", "Music Production", "Writing", "Film Making",
        "Graphic Design", "Animation", "Painting", "Sketching", "Video Editing",
        "3D Modeling", "Creative Writing", "Podcasting", "Blogging"
      ]
    },
    lifestyle: {
      icon: Heart,
      name: "Lifestyle & Hobbies",
      color: "from-green-500 to-emerald-500",
      interests: [
        "Fitness", "Yoga", "Cooking", "Travel", "Reading", "Gaming",
        "Board Games", "Hiking", "Cycling", "Swimming", "Dancing",
        "Meditation", "Gardening", "Fashion", "Interior Design"
      ]
    },
    social: {
      icon: Coffee,
      name: "Social & Community",
      color: "from-orange-500 to-red-500",
      interests: [
        "Volunteering", "Environment", "Social Impact", "Public Speaking",
        "Networking", "Community Service", "Mentoring", "Teaching",
        "Event Planning", "Leadership", "Debate", "Social Activism"
      ]
    },
    business: {
      icon: Dumbbell,
      name: "Business & Finance",
      color: "from-yellow-500 to-orange-500",
      interests: [
        "Entrepreneurship", "Startups", "Finance", "Marketing", "Sales",
        "Investing", "Business Strategy", "Economics", "Consulting",
        "Product Management", "Operations", "Real Estate"
      ]
    }
  };

  useEffect(() => {
    setSelectedInterests(data.interests || []);
  }, [data.interests]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("interests", selectedInterests);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests(prev => [...prev, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setSelectedInterests(prev => prev.filter(i => i !== interest));
  };

  const currentCategory = interestCategories[activeCategory as keyof typeof interestCategories];

  const handleContinue = () => {
    if (selectedInterests.length < 5) {
      setError("Please select at least 5 interests for better matches.");
      return;
    }
    setError("");
    updateData("interests", selectedInterests);
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">What interests you? 🌟</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Choose from different categories to find your tribe
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Interests */}
          {selectedInterests.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white text-sm font-medium">Selected ({selectedInterests.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedInterests.map((interest) => (
                  <Badge 
                    key={interest} 
                    className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(interestCategories).map(([key, category]) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className={`flex-col h-auto p-2 transition-all ${
                    activeCategory === key
                      ? "bg-[#CAFE33]/20 border-[#CAFE33] text-[#CAFE33]"
                      : "border-gray-700 text-gray-300 hover:border-[#CAFE33]/50"
                  }`}
                  onClick={() => setActiveCategory(key)}
                >
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color} mb-1`}>
                    <IconComponent className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-xs text-center leading-tight">{category.name.split(' & ')[0]}</span>
                </Button>
              );
            })}
          </div>

          {/* Current Category Interests */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-gradient-to-r ${currentCategory.color}`}>
                <currentCategory.icon className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-white text-sm font-medium">{currentCategory.name}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentCategory.interests.map((interest) => (
                <Badge 
                  key={interest}
                  variant={selectedInterests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedInterests.includes(interest) 
                      ? "bg-[#CAFE33] text-black" 
                      : "border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          {/* Add Custom Interest */}
          <div className="space-y-2">
            <h4 className="text-white text-sm font-medium">Add Custom Interest</h4>
            <div className="flex gap-2">
              <Input
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Type your interest..."
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-[#CAFE33]"
                onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
              />
              <Button 
                onClick={addCustomInterest}
                size="sm"
                className="bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center mb-2">{error}</div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Choose at least 5 interests across different categories for better matches ✨
        </p>
      </div>

      <Button onClick={handleContinue} className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg mt-6">
        Continue
      </Button>
    </div>
  );
};

export default InterestsStep;
