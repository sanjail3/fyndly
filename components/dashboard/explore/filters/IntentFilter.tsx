
import { Button } from "@/components/ui/button";
import FilterCard from "./FilterCard";
import MultiSelectChips from "./MultiSelectChips";

interface IntentFilterProps {
  intent: string[];
  setIntent: (intent: string[]) => void;
}

const intentOptions = [
  { label: "Hackathon Partner", emoji: "💻" },
  { label: "Co-founder", emoji: "🚀" },
  { label: "Study Buddy", emoji: "📚" },
  { label: "Team Member", emoji: "🤝" },
  { label: "Mentor", emoji: "🧑‍🏫" },
  { label: "Project Partner", emoji: "🔧" },
  { label: "Friends", emoji: "👋" },
  { label: "Creative Collab", emoji: "🎨" },
];

const IntentFilter = ({ intent, setIntent }: IntentFilterProps) => {
  const toggleIntent = (item: string) => {
    setIntent(intent.includes(item) ? intent.filter(i => i !== item) : [...intent, item]);
  };

  const getEmoji = (item: string) => {
    return intentOptions.find(opt => opt.label === item)?.emoji || "🎯";
  };

  return (
    <FilterCard title="What are you looking for?" emoji="🎯">
      <MultiSelectChips 
        items={intent} 
        onRemove={(item) => setIntent(intent.filter(i => i !== item))}
        getEmoji={getEmoji}
      />
      <div className="grid grid-cols-2 gap-2">
        {intentOptions.map(opt => (
          <Button
            key={opt.label}
            size="sm"
            variant={intent.includes(opt.label) ? "secondary" : "outline"}
            onClick={() => toggleIntent(opt.label)}
            className={
              intent.includes(opt.label)
                ? "bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black border-none font-bold shadow-md hover:scale-105 transition-all"
                : "text-[#CAFE33] border-[#CAFE33]/60 bg-transparent hover:bg-[#CAFE33]/10 hover:border-[#CAFE33] transition-all"
            }
          >
            <span className="mr-1">{opt.emoji}</span>
            <span className="text-xs">{opt.label}</span>
          </Button>
        ))}
      </div>
    </FilterCard>
  );
};

export default IntentFilter;
