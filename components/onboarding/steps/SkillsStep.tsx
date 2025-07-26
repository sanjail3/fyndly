import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";

interface SkillsStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
}

const SkillsStep = ({ data, updateData, onNext }: SkillsStepProps) => {
  const [skills, setSkills] = useState({
    tech: [],
    nonTech: [],
    ...data.skills
  });
  const [customSkill, setCustomSkill] = useState("");
  const [activeTab, setActiveTab] = useState("tech");

  const techSkills = [
    "JavaScript", "Python", "React", "Node.js", "Java", "C++",
    "HTML/CSS", "TypeScript", "SQL", "MongoDB", "AWS", "Docker",
    "Git", "Angular", "Vue.js", "React Native", "Flutter", "Swift",
    "Kotlin", "PHP", "Ruby", "Go", "Rust", "DevOps", "Machine Learning",
    "Competitive Programming"
  ];

  const nonTechSkills = [
    "Project Management", "Leadership", "Communication", "Teamwork",
    "Problem Solving", "Critical Thinking", "Creativity", "Public Speaking",
    "Writing", "Marketing", "Sales", "Design Thinking", "Research",
    "Data Analysis", "Strategy", "Negotiation", "Time Management",
    "Event Planning", "Social Media", "Content Creation", "Photography"
  ];

  useEffect(() => {
    updateData("skills", skills);
  }, [skills, updateData]);

  const toggleSkill = (skill: string, type: "tech" | "nonTech") => {
    setSkills((prev: { [x: string]: any; }) => ({
      ...prev,
      [type]: prev[type].includes(skill) 
        ? prev[type].filter((s: string) => s !== skill)
        : [...prev[type], skill]
    }));
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      const type = activeTab as "tech" | "nonTech";
      if (!skills[type].includes(customSkill.trim())) {
        setSkills((prev: { [x: string]: any; }) => ({
          ...prev,
          [type]: [...prev[type], customSkill.trim()]
        }));
        setCustomSkill("");
      }
    }
  };

  const removeSkill = (skill: string, type: "tech" | "nonTech") => {
    setSkills((prev: { [x: string]: any[]; }) => ({
      ...prev,
      [type]: prev[type].filter(s => s !== skill)
    }));
  };

  const currentSkills = activeTab === "tech" ? techSkills : nonTechSkills;
  const selectedSkills = activeTab === "tech" ? skills.tech : skills.nonTech;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-24">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-[#CAFE33] text-center">What are your skills?</CardTitle>
          <p className="text-gray-400 text-sm text-center">
            Show off your technical and soft skills
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="tech" className="data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black">
                Tech Skills
              </TabsTrigger>
              <TabsTrigger value="nonTech" className="data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black">
                Soft Skills
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tech" className="space-y-4 mt-4">
              <SkillsContent 
                skills={techSkills}
                selectedSkills={skills.tech}
                onToggle={(skill) => toggleSkill(skill, "tech")}
                onRemove={(skill) => removeSkill(skill, "tech")}
                customSkill={customSkill}
                onCustomSkillChange={setCustomSkill}
                onAddCustomSkill={addCustomSkill}
              />
            </TabsContent>
            
            <TabsContent value="nonTech" className="space-y-4 mt-4">
              <SkillsContent 
                skills={nonTechSkills}
                selectedSkills={skills.nonTech}
                onToggle={(skill) => toggleSkill(skill, "nonTech")}
                onRemove={(skill) => removeSkill(skill, "nonTech")}
                customSkill={customSkill}
                onCustomSkillChange={setCustomSkill}
                onAddCustomSkill={addCustomSkill}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-500 text-sm">
          Total skills: {skills.tech.length + skills.nonTech.length}
        </p>
      </div>
    </div>
  );
};

interface SkillsContentProps {
  skills: string[];
  selectedSkills: string[];
  onToggle: (skill: string) => void;
  onRemove: (skill: string) => void;
  customSkill: string;
  onCustomSkillChange: (value: string) => void;
  onAddCustomSkill: () => void;
}

const SkillsContent = ({ 
  skills, 
  selectedSkills, 
  onToggle, 
  onRemove, 
  customSkill, 
  onCustomSkillChange, 
  onAddCustomSkill 
}: SkillsContentProps) => (
  <div className="space-y-4">
    {/* Selected Skills */}
    {selectedSkills.length > 0 && (
      <div className="space-y-2">
        <h4 className="text-white text-sm font-medium">Selected ({selectedSkills.length})</h4>
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge 
              key={skill} 
              className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] cursor-pointer"
              onClick={() => onRemove(skill)}
            >
              {skill}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      </div>
    )}

    {/* Available Skills */}
    <div className="space-y-2">
      <h4 className="text-white text-sm font-medium">Available Skills</h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge 
            key={skill}
            variant={selectedSkills.includes(skill) ? "default" : "outline"}
            className={`cursor-pointer transition-all ${
              selectedSkills.includes(skill) 
                ? "bg-[#CAFE33] text-black" 
                : "border-gray-700 text-gray-300 hover:border-[#CAFE33] hover:text-white"
            }`}
            onClick={() => onToggle(skill)}
          >
            {skill}
          </Badge>
        ))}
      </div>
    </div>

    {/* Add Custom Skill */}
    <div className="space-y-2">
      <h4 className="text-white text-sm font-medium">Add Custom Skill</h4>
      <div className="flex gap-2">
        <Input
          value={customSkill}
          onChange={(e) => onCustomSkillChange(e.target.value)}
          placeholder="Type your skill..."
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-[#CAFE33]"
          onKeyPress={(e) => e.key === "Enter" && onAddCustomSkill()}
        />
        <Button 
          onClick={onAddCustomSkill}
          size="sm"
          className="bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

export default SkillsStep;
