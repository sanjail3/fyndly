import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import SmartFilters from "./SmartFilters";

interface SearchSectionProps {
  college: string;
  setCollege: (v: string) => void;
  academicYear: string;
  setAcademicYear: (v: string) => void;
  department: string;
  setDepartment: (v: string) => void;
  intent: string[];
  setIntent: (v: string[]) => void;
  availability: string;
  setAvailability: (v: string) => void;
  personalityTags: string[];
  setPersonalityTags: (v: string[]) => void;
  skills: string[];
  setSkills: (v: string[]) => void;
  onApplyFilters: () => void;
  disableAutoSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const SearchSection = ({
  college, setCollege,
  academicYear, setAcademicYear,
  department, setDepartment,
  intent, setIntent,
  availability, setAvailability,
  personalityTags, setPersonalityTags,
  skills, setSkills,
  onApplyFilters,
  searchQuery = "",
  onSearchChange,
}: SearchSectionProps) => {
  const [isSmartFiltersOpen, setIsSmartFiltersOpen] = useState(false);

  const isFiltered = !!(
    college ||
    academicYear ||
    department ||
    intent.length > 0 ||
    availability ||
    personalityTags.length > 0 ||
    skills.length > 0 ||
    searchQuery
  );

  const handleClearFilters = () => {
    setCollege("");
    setAcademicYear("");
    setDepartment("");
    setIntent([]);
    setAvailability("");
    setPersonalityTags([]);
    setSkills([]);
    if (onSearchChange) {
      onSearchChange("");
    }
    onApplyFilters();
    setIsSmartFiltersOpen(false);
  };

  const activeFiltersCount = [
    college,
    academicYear,
    department,
    availability,
    ...(intent.length > 0 ? ['intent'] : []),
    ...(personalityTags.length > 0 ? ['personality'] : []),
    ...(skills.length > 0 ? ['skills'] : []),
    ...(searchQuery ? ['search'] : [])
  ].filter(Boolean).length;

  const allActiveFilters = [
    ...(college ? [{ type: 'college', value: college }] : []),
    ...(academicYear ? [{ type: 'year', value: `Year ${academicYear}` }] : []),
    ...(department ? [{ type: 'department', value: department }] : []),
    ...(availability ? [{ type: 'availability', value: availability }] : []),
    ...intent.map(i => ({ type: 'intent', value: i })),
    ...personalityTags.map(p => ({ type: 'personality', value: p })),
    ...skills.map(s => ({ type: 'skills', value: s })),
    ...(searchQuery ? [{ type: 'search', value: searchQuery }] : [])
  ];

  const removeFilter = (filter: any) => {
    switch (filter.type) {
      case 'college': setCollege(""); break;
      case 'year': setAcademicYear(""); break;
      case 'department': setDepartment(""); break;
      case 'availability': setAvailability(""); break;
      case 'intent': setIntent(intent.filter(i => i !== filter.value)); break;
      case 'personality': setPersonalityTags(personalityTags.filter(p => p !== filter.value)); break;
      case 'skills': setSkills(skills.filter(s => s !== filter.value)); break;
      case 'search': if (onSearchChange) onSearchChange(""); break;
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  return (
    <div className="space-y-4 px-2">
      {/* Compact Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#CAFE33] transition-colors" />
        <Input
          placeholder="Search by name, skills, college..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-12 pr-16 bg-gradient-to-r from-gray-900/90 to-gray-800/90 border-gray-700/50 text-white placeholder-gray-400 focus:border-[#CAFE33] focus:ring-2 focus:ring-[#CAFE33]/20 rounded-xl h-14 backdrop-blur-sm text-base transition-all duration-300 hover:border-[#CAFE33]/50"
        />
        
        {/* Smart Filter Toggle */}
        <Collapsible open={isSmartFiltersOpen} onOpenChange={setIsSmartFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl h-10 w-10 transition-all duration-300 ${
                activeFiltersCount > 0
                  ? "text-[#CAFE33] bg-[#CAFE33]/20 hover:bg-[#CAFE33]/30"
                  : "text-gray-400 hover:text-[#CAFE33] hover:bg-[#CAFE33]/10"
              }`}
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#CAFE33] text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="bg-gradient-to-br from-black via-gray-900 to-black border border-[#CAFE33]/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
              {/* Smart Filter Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#CAFE33]/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] rounded-xl flex items-center justify-center">
                    <Filter className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      🎯 Smart Filters
                    </h2>
                    <p className="text-sm text-gray-400">Find your perfect match</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isFiltered && (
                    <Button
                      onClick={handleClearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSmartFiltersOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-[#CAFE33]/20"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Smart Filters Content */}
              <div className="p-6">
                <SmartFilters
                  college={college}
                  setCollege={setCollege}
                  academicYear={academicYear}
                  setAcademicYear={setAcademicYear}
                  department={department}
                  setDepartment={setDepartment}
                  intent={intent}
                  setIntent={setIntent}
                  availability={availability}
                  setAvailability={setAvailability}
                  personalityTags={personalityTags}
                  setPersonalityTags={setPersonalityTags}
                  skills={skills}
                  setSkills={setSkills}
                />
              </div>

              {/* Apply Button */}
              <div className="p-4 border-t border-[#CAFE33]/20 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                <Button
                  onClick={() => {
                    onApplyFilters();
                    setIsSmartFiltersOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  🔍 Apply Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Active Filters Display */}
      {allActiveFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-[#CAFE33] text-sm font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Active:
          </span>
          {allActiveFilters.map((filter, index) => (
            <Badge
              key={`${filter.type}-${filter.value}-${index}`}
              className="bg-[#CAFE33]/20 text-[#CAFE33] cursor-pointer hover:bg-red-500/20 hover:text-red-400 whitespace-nowrap transition-colors border border-[#CAFE33]/30 flex items-center gap-1"
              onClick={() => removeFilter(filter)}
            >
              {filter.value}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchSection;
