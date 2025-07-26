
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterHeaderProps {
  isFiltered: boolean;
  onClose: () => void;
}

const FilterHeader = ({ isFiltered, onClose }: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[#CAFE33]/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] rounded-xl flex items-center justify-center">
          <Filter className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Smart Filters</h2>
          <p className="text-sm text-gray-400">Find your perfect match</p>
        </div>
      </div>
      {isFiltered && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-[#CAFE33]/20"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

export default FilterHeader;
