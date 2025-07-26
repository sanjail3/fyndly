
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import FilterCard from "./FilterCard";
import MultiSelectChips from "./MultiSelectChips";

interface SkillsFilterProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
  personalityTags: string[];
  setPersonalityTags: (tags: string[]) => void;
}

const skillsOptions = [
  { label: "React", emoji: "⚛️" },
  { label: "Node.js", emoji: "🌳" },
  { label: "Figma", emoji: "🎨" },
  { label: "UI/UX", emoji: "✨" },
  { label: "Machine Learning", emoji: "🤖" },
  { label: "Writing", emoji: "✍️" },
  { label: "Public Speaking", emoji: "🎤" }
];

const personalityOptions = [
  { label: "Curious", emoji: "🧐" },
  { label: "Leader", emoji: "🦁" },
  { label: "Designer", emoji: "🎨" },
  { label: "Developer", emoji: "👨‍💻" },
  { label: "Adventurous", emoji: "🧗" },
  { label: "Organized", emoji: "📅" },
  { label: "Empathetic", emoji: "💚" }
];

const SkillsFilter = ({ skills, setSkills, personalityTags, setPersonalityTags }: SkillsFilterProps) => {
  const [skillInput, setSkillInput] = useState("");
  const [personalityInput, setPersonalityInput] = useState("");

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };

  const addPersonality = () => {
    if (personalityInput && !personalityTags.includes(personalityInput)) {
      setPersonalityTags([...personalityTags, personalityInput]);
      setPersonalityInput("");
    }
  };

  const getSkillEmoji = (skill: string) => {
    return skillsOptions.find(s => s.label === skill)?.emoji || "🔷";
  };

  const getPersonalityEmoji = (tag: string) => {
    return personalityOptions.find(p => p.label === tag)?.emoji || "🌟";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <FilterCard title="Skills & Interests" emoji="🔧">
        <MultiSelectChips 
          items={skills} 
          onRemove={(skill) => setSkills(skills.filter(s => s !== skill))}
          getEmoji={getSkillEmoji}
        />
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill..."
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl flex-1"
            list="skills-list"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <Button
            onClick={addSkill}
            size="sm"
            className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:scale-105 transition-all rounded-xl"
          >
            <Plus size={16} />
          </Button>
        </div>
        <datalist id="skills-list">
          {skillsOptions.map(opt => (
            <option key={opt.label} value={opt.label} />
          ))}
        </datalist>
      </FilterCard>

      <FilterCard title="Personality" emoji="😎">
        <MultiSelectChips 
          items={personalityTags} 
          onRemove={(tag) => setPersonalityTags(personalityTags.filter(t => t !== tag))}
          getEmoji={getPersonalityEmoji}
        />
        <div className="flex gap-2">
          <Input
            placeholder="Add personality trait..."
            value={personalityInput}
            onChange={e => setPersonalityInput(e.target.value)}
            className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl flex-1"
            list="personality-list"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPersonality())}
          />
          <Button
            onClick={addPersonality}
            size="sm"
            className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:scale-105 transition-all rounded-xl"
          >
            <Plus size={16} />
          </Button>
        </div>
        <datalist id="personality-list">
          {personalityOptions.map(opt => (
            <option key={opt.label} value={opt.label} />
          ))}
        </datalist>
      </FilterCard>
    </div>
  );
};

export default SkillsFilter;
