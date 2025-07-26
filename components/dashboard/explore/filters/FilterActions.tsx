
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";

interface FilterActionsProps {
  onApplyFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterActions = ({ onApplyFilters, onClearFilters, hasActiveFilters }: FilterActionsProps) => {
  return (
    <div className="sticky bottom-0 bg-gradient-to-t from-black via-black/95 to-transparent p-6 mt-8">
      <div className="flex gap-3 max-w-md mx-auto">
        <Button
          onClick={onApplyFilters}
          className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold py-3 rounded-2xl shadow-lg hover:scale-105 transition-all duration-200 text-lg"
        >
          <Search className="w-5 h-5 mr-2" />
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="border-[#CAFE33]/60 text-[#CAFE33] hover:bg-[#CAFE33]/10 py-3 rounded-2xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterActions;
