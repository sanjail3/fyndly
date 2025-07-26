
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailabilityStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
}

const AvailabilityStep = ({ data, updateData, onNext }: AvailabilityStepProps) => {
  const [availability, setAvailability] = useState({
    weeklyHours: "",
    timeCommitment: "",
    lookingFor: [],
    preferredMeeting: "",
    ...data.availability
  });

  const weeklyHours = [
    "1-5 hours", "5-10 hours", "10-15 hours", "15-20 hours", "20+ hours"
  ];

  const timeCommitments = [
    "Just for fun", "Casual projects", "Serious commitment", "Professional level"
  ];

  const lookingForOptions = [
    "Hackathon partner", "Co-founder", "Study buddy", "Project collaborator",
    "Mentor", "Mentee", "Research partner", "Startup team member",
    "Open source contributor", "Community builder"
  ];

  const meetingPreferences = [
    "In-person only", "Virtual only", "Hybrid (both)", "No preference"
  ];

  useEffect(() => {
    updateData("availability", availability);
  }, [availability, updateData]);

  const toggleLookingFor = (option: string) => {
    setAvailability((prev: { lookingFor: string[]; }) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(option)
        ? prev.lookingFor.filter(item => item !== option)
        : [...prev.lookingFor, option]
    }));
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">Your availability</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Help others understand your time and collaboration style
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Hours */}
          <div className="space-y-3">
            <Label className="text-white">Weekly availability for projects</Label>
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
            <Label className="text-white">Preferred time commitment level</Label>
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

          {/* Looking For */}
          <div className="space-y-3">
            <Label className="text-white">What are you looking for? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-2">
              {lookingForOptions.map((option) => (
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
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          This helps us match you with people who have similar availability
        </p>
      </div>
    </div>
  );
};

export default AvailabilityStep;
