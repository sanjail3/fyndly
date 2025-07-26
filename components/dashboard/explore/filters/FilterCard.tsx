
import { ReactNode } from "react";

interface FilterCardProps {
  title: string;
  emoji: string;
  children: ReactNode;
  className?: string;
}

const FilterCard = ({ title, emoji, children, className = "" }: FilterCardProps) => {
  return (
    <div className={`bg-gradient-to-br from-[#111a03] to-[#0a1201] border border-[#CAFE33]/30 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-[#CAFE33]/50 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{emoji}</span>
        <h3 className="text-green-300 font-bold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default FilterCard;
