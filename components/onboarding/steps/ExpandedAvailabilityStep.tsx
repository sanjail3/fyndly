import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ExpandedAvailabilityStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const ExpandedAvailabilityStep = ({ data, updateData, onNext, goBack }: ExpandedAvailabilityStepProps) => {
  const [availability, setAvailability] = useState({
    weeklyHours: "",
    timeCommitment: "",
    lookingFor: [],
    preferredMeeting: "",
    ...data.availability
  });

  const [error, setError] = useState("");

  const weeklyHours = [
    "1-5 hours", "5-10 hours", "10-15 hours", "15-20 hours", "20+ hours"
  ];

  const timeCommitments = [
    "Just for fun", "Casual projects", "Serious commitment", "Professional level"
  ];

  const lookingForOptions = [
    // Tech & Professional
    "Hackathon partner", "Co-founder", "Startup team member", "Project collaborator",
    "Open source contributor", "Research partner", "Mentee", "Mentor",
    
    // Academic & Learning
    "Study buddy", "Study group", "Tutor", "Language exchange partner",
    "Skill learning partner", "Book club member", "Research collaborator",
    
    // Social & Friendship
    "Making friends", "Roommate", "Travel buddy", "Event companion",
    "Social meetups", "Campus hangouts", "Coffee chats", "Lunch buddies",
    
    // Hobbies & Activities
    "Hobby partners", "Sports partner", "Gym buddy", "Running partner",
    "Music jam partner", "Gaming partner", "Photography buddy", "Art collaborator",
    
    // Events & Community
    "Event planning team", "Club activities", "Volunteer work", "Community service",
    "Cultural events", "Festival celebrations", "Workshop partner", "Networking"
  ];

  const meetingPreferences = [
    "In-person only", "Virtual only", "Hybrid (both)", "No preference"
  ];

  useEffect(() => {
    setAvailability({
      weeklyHours: "",
      timeCommitment: "",
      lookingFor: [],
      preferredMeeting: "",
      ...data.availability
    });
  }, [data.availability]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("availability", availability);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    if (!availability.weeklyHours || !availability.timeCommitment || availability.lookingFor.length === 0) {
      setError("Please fill weekly hours, commitment, and select at least one goal.");
      return;
    }
    setError("");
    updateData("availability", availability);
    onNext();
  };

  const toggleLookingFor = (option: string) => {
    setAvailability((prev: { lookingFor: string[]; }) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter(item => item !== option)
        : [...prev.lookingFor, option]
    }));
  };

  const getLookingForCategory = (option: string) => {
    if (["Hackathon partner", "Co-founder", "Startup team member", "Project collaborator", "Open source contributor", "Research partner", "Mentee", "Mentor"].includes(option)) {
      return { category: "Tech & Professional", color: "bg-blue-600", icon: "💼" };
    }
    if (["Study buddy", "Study group", "Tutor", "Language exchange partner", "Skill learning partner", "Book club member", "Research collaborator"].includes(option)) {
      return { category: "Academic & Learning", color: "bg-green-600", icon: "📚" };
    }
    if (["Making friends", "Roommate", "Travel buddy", "Event companion", "Social meetups", "Campus hangouts", "Coffee chats", "Lunch buddies"].includes(option)) {
      return { category: "Social & Friendship", color: "bg-pink-600", icon: "👥" };
    }
    if (["Hobby partners", "Sports partner", "Gym buddy", "Running partner", "Music jam partner", "Gaming partner", "Photography buddy", "Art collaborator"].includes(option)) {
      return { category: "Hobbies & Activities", color: "bg-purple-600", icon: "🎯" };
    }
    return { category: "Events & Community", color: "bg-orange-600", icon: "🎉" };
  };

  const groupedOptions = lookingForOptions.reduce((acc, option) => {
    const { category } = getLookingForCategory(option);
    if (!acc[category]) acc[category] = [];
    acc[category].push(option);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">Your availability & goals</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Help others understand your time and what you're looking for
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Hours */}
          <div className="space-y-3">
            <Label className="text-white">Weekly availability for connections</Label>
            <div className="flex flex-wrap gap-2">
              {weeklyHours.map((hours) => (
                <Badge 
                  key={hours}
                  variant={availability.weeklyHours === hours ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    availability.weeklyHours === hours 
                      ? "bg-[#CAFE33] text-black" 
                      : "border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
                  }`}
                  onClick={() => setAvailability((prev: any) => ({ ...prev, weeklyHours: hours }))}
                >
                  {hours}
                </Badge>
              ))}
            </div>
          </div>

          {/* Time Commitment */}
          <div className="space-y-3">
            <Label className="text-white">Preferred commitment level</Label>
            <div className="flex flex-wrap gap-2">
              {timeCommitments.map((commitment) => (
                <Badge 
                  key={commitment}
                  variant={availability.timeCommitment === commitment ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    availability.timeCommitment === commitment 
                      ? "bg-[#CAFE33] text-black" 
                      : "border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
                  }`}
                  onClick={() => setAvailability((prev: any) => ({ ...prev, timeCommitment: commitment }))}
                >
                  {commitment}
                </Badge>
              ))}
            </div>
          </div>

          {/* Looking For - Categorized */}
          <div className="space-y-4">
            <Label className="text-white">What are you looking for? (Select all that apply)</Label>
            
            {Object.entries(groupedOptions).map(([category, options]) => {
              const { color, icon } = getLookingForCategory(options[0]);
              return (
                <div key={category} className="space-y-2">
                  <h4 className="text-white text-sm font-medium flex items-center gap-2">
                    <span>{icon}</span>
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 pl-6">
                    {options.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={availability.lookingFor.includes(option)}
                          onCheckedChange={() => toggleLookingFor(option)}
                          className="border-gray-600 data-[state=checked]:bg-[#CAFE33] data-[state=checked]:border-[#CAFE33]"
                        />
                        <Label 
                          htmlFor={option}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meeting Preference */}
          <div className="space-y-3">
            <Label className="text-white">Meeting preference</Label>
            <div className="flex flex-wrap gap-2">
              {meetingPreferences.map((preference) => (
                <Badge 
                  key={preference}
                  variant={availability.preferredMeeting === preference ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    availability.preferredMeeting === preference 
                      ? "bg-[#CAFE33] text-black" 
                      : "border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
                  }`}
                  onClick={() => setAvailability((prev: any) => ({ ...prev, preferredMeeting: preference }))}
                >
                  {preference}
                </Badge>
              ))}
            </div>
          </div>

          {availability.lookingFor.length > 0 && (
            <div className="bg-gray-800 p-3 rounded-lg">
              <h4 className="text-white text-sm font-medium mb-2">Your selections ({availability.lookingFor.length})</h4>
              <div className="flex flex-wrap gap-1">
                {availability.lookingFor.map((item: string) => {
                  const { color } = getLookingForCategory(item);
                  return (
                    <Badge key={item} className={`${color} text-white text-xs`}>
                      {item}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-sm text-center mb-2">{error}</div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          This helps us match you with people who have similar availability and goals
        </p>
      </div>

      <Button onClick={handleContinue} className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg mt-6">
        Continue
      </Button>
    </div>
  );
};

export default ExpandedAvailabilityStep;
