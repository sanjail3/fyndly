import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Skills {
  tech: string[];
  creative: string[];
  sports: string[];
  leadership: string[];
  other: string[];
}

interface ExpandedSkillsStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const ExpandedSkillsStep = ({ data, updateData, onNext, goBack }: ExpandedSkillsStepProps) => {
  const [skills, setSkills] = useState<Skills>({
    tech: [],
    creative: [],
    sports: [],
    leadership: [],
    other: [],
    ...(data.skills || {})
  });

  const [error, setError] = useState("");

  const skillCategories = {
    tech: {
      title: "Tech Skills",
      emoji: "💻",
      skills: [
        "JavaScript", "Python", "Java", "C++", "React", "Node.js", "Flutter", 
        "Swift", "Kotlin", "HTML/CSS", "SQL", "MongoDB", "AWS", "Docker", 
        "Git", "Machine Learning", "AI", "Data Science", "Blockchain", 
        "Cybersecurity", "DevOps", "UI/UX Design", "Mobile Development", 
        "Web Development", "Game Development", "Cloud Computing", "Big Data",
        "IoT", "AR/VR", "Robotics"
      ]
    },
    creative: {
      title: "Creative Skills", 
      emoji: "🎨",
      skills: [
        "Graphic Design", "Video Editing", "Photography", "Digital Art", 
        "Animation", "Music Production", "Writing", "Content Creation", 
        "Copywriting", "Illustration", "3D Modeling", "Web Design", 
        "Brand Design", "Motion Graphics", "Film Making", "Podcast Production",
        "Social Media Design", "Print Design", "Typography", "Creative Writing",
        "Storytelling", "Art Direction"
      ]
    },
    sports: {
      title: "Sports & Fitness",
      emoji: "⚽", 
      skills: [
        "Cricket", "Football", "Basketball", "Tennis", "Badminton", "Swimming",
        "Running", "Cycling", "Yoga", "Gym/Fitness", "Volleyball", "Table Tennis",
        "Hockey", "Boxing", "Martial Arts", "Trekking", "Rock Climbing", "Chess",
        "Kabaddi", "Wrestling", "Archery", "Golf", "Skating", "Surfing",
        "Mountaineering", "Adventure Sports"
      ]
    },
    leadership: {
      title: " Leadership & Management",
      emoji: "👑",
      skills: [
        "Team Leadership", "Project Management", "Event Management", 
        "Public Speaking", "Mentoring", "Negotiation", "Strategic Planning",
        "Problem Solving", "Decision Making", "Conflict Resolution", 
        "Team Building", "Communication", "Delegation", "Time Management",
        "Innovation", "Change Management", "Coaching", "Facilitation",
        "Crisis Management", "Stakeholder Management"
      ]
    },
    other: {
      title: " Other Skills",
      emoji: "🌟", 
      skills: [
        "Teaching", "Research", "Languages", "Cooking", "Gardening", 
        "Volunteering", "Community Service", "Fundraising", "Networking",
        "Cultural Activities", "Dance", "Singing", "Acting", "Stand-up Comedy",
        "Gaming", "Reading", "Traveling", "Fashion", "Interior Design",
        "Entrepreneurship", "Investment", "Trading", "Blogging", "Vlogging"
      ]
    }
  };

  useEffect(() => {
    setSkills({
      tech: [],
      creative: [],
      sports: [],
      leadership: [],
      other: [],
      ...(data.skills || {})
    });
  }, [data.skills]);

  // Always push current state to parent on mount
  useEffect(() => {
    updateData("skills", skills);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSkill = (category: keyof Skills, skill: string) => {
    setSkills(prev => ({
      ...prev,
      [category]: prev[category].includes(skill)
        ? prev[category].filter(s => s !== skill)
        : [...prev[category], skill]
    }));
  };

  const isSkillSelected = (category: keyof Skills, skill: string) => {
    return skills[category].includes(skill);
  };

  const hasSelectedSkills = Object.values(skills).some(categorySkills => categorySkills.length > 0);

  const handleContinue = () => {
    const hasSelectedSkills = Object.values(skills).some(categorySkills => categorySkills.length > 0);
    if (!hasSelectedSkills) {
      setError("Please select at least one skill to continue.");
      return;
    }
    setError("");
    updateData("skills", skills);
    onNext();
  };

  return (
    <div className="space-y-6 pb-20">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-3xl">💪</span>
          What are your skills & talents?
        </h3>
        <p className="text-gray-400">Select all that apply - this helps us find your perfect matches!</p>
      </div>

      <div className="space-y-8">
        {Object.entries(skillCategories).map(([category, { title, emoji, skills: categorySkills }]) => (
          <div key={category} className="space-y-4">
            <h4 className="text-lg font-semibold text-[#CAFE33] flex items-center gap-2">
              <span className="text-xl">{emoji}</span>
              {title}
              {skills[category as keyof Skills].length > 0 && (
                <Badge variant="secondary" className="bg-[#CAFE33] text-black ml-2">
                  {skills[category as keyof Skills].length}
                </Badge>
              )}
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categorySkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(category as keyof Skills, skill)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border text-left",
                    isSkillSelected(category as keyof Skills, skill)
                      ? "bg-[#CAFE33] text-black border-[#CAFE33] shadow-lg transform scale-105"
                      : "bg-gray-900 text-gray-300 border-gray-600 hover:border-[#CAFE33] hover:text-[#CAFE33] hover:bg-gray-800"
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center mb-2">{error}</div>
      )}
      <Button 
        onClick={handleContinue}
        className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg"
      >
        Continue
      </Button>

      {hasSelectedSkills && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h5 className="text-[#CAFE33] font-medium mb-2">Selected Skills Summary:</h5>
            <div className="space-y-2">
              {Object.entries(skills).map(([category, categorySkills]) => (
                categorySkills.length > 0 && (
                  <div key={category} className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-400 min-w-fit">
                      {skillCategories[category as keyof Skills].emoji} {skillCategories[category as keyof Skills].title.split(' ').slice(1).join(' ')}:
                    </span>
                    {categorySkills.map((skill:any) => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className="text-xs border-[#CAFE33] text-[#CAFE33]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpandedSkillsStep;
