
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiSelectChipsProps {
  items: string[];
  onRemove: (item: string) => void;
  getEmoji?: (item: string) => string;
}

const MultiSelectChips = ({ items, onRemove, getEmoji }: MultiSelectChipsProps) => {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {items.map(item => (
        <Badge
          key={item}
          variant="secondary"
          className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-semibold px-3 py-1 rounded-full hover:shadow-lg transition-all duration-200 flex items-center gap-1"
        >
          {getEmoji?.(item) && <span>{getEmoji(item)}</span>}
          {item}
          <button
            onClick={() => onRemove(item)}
            className="ml-1 rounded-full hover:bg-black/20 p-0.5 transition-colors"
            type="button"
          >
            <X size={12} />
          </button>
        </Badge>
      ))}
    </div>
  );
};

export default MultiSelectChips;
