
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, X, Search, Sparkles } from "lucide-react";

interface AdvancedFiltersProps {
  onFiltersChange?: (filters: any) => void;
}

const AdvancedFilters = ({ onFiltersChange }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");

  const colleges = [
    "IIT Madras", "IIT Delhi", "IIT Bombay", "IIT Kanpur", "IIT Kharagpur",
    "Anna University", "VIT Chennai", "SRM University", "Loyola College", 
    "Stella Maris College", "PSG College", "MIT Chennai", "SSN College"
  ];

  const departments = [
    "Computer Science", "Information Technology", "Electronics & Communication",
    "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
    "Business Administration", "MBA", "Commerce", "Economics",
    "Design", "Architecture", "Biotechnology", "Chemical Engineering",
    "Aerospace Engineering", "Automobile Engineering"
  ];

  const intents = [
    "Hackathon Partner", "Co-Founder", "Startup Team", "Study Buddy",
    "Mentor/Mentee", "Project Partner", "Networking", "Research Partner",
    "Design Collaboration", "Code Review", "Business Partner", "Creative Partner"
  ];

  const techSkills = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "C++",
    "Machine Learning", "Data Science", "AI/ML", "Cloud Computing", "DevOps",
    "Mobile Development", "Web Development", "Blockchain", "Cybersecurity",
    "Database Management", "UI/UX Design", "Game Development"
  ];

  const creativeSkills = [
    "Graphic Design", "Video Editing", "Photography", "Digital Art",
    "Animation", "3D Modeling", "Content Writing", "Copywriting",
    "Social Media", "Branding", "Illustration", "Music Production"
  ];

  const businessSkills = [
    "Marketing", "Sales", "Finance", "Strategy", "Operations",
    "Project Management", "Business Development", "Consulting",
    "Analytics", "Market Research", "Leadership", "Communication"
  ];

  const otherSkills = [
    "Public Speaking", "Event Management", "Teaching", "Research",
    "Problem Solving", "Critical Thinking", "Team Leadership"
  ];

  const personalityTags = [
    "Early Bird", "Night Owl", "Coffee Addict", "Tea Lover", "Gym Enthusiast",
    "Foodie", "Travel Lover", "Book Worm", "Movie Buff", "Music Lover",
    "Creative", "Analytical", "Social Butterfly", "Introvert", "Optimistic",
    "Perfectionist", "Risk Taker", "Detail Oriented", "Big Picture Thinker"
  ];

  const availabilityOptions = [
    "0-5 hours/week", "5-10 hours/week", "10-20 hours/week", 
    "20+ hours/week", "Flexible", "Weekends Only", "Full-time"
  ];

  const handleFilterChange = (category: string, value: any) => {
    const newFilters = { ...activeFilters, [category]: value };
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilter = (category: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[category];
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchQuery("");
    onFiltersChange?.({});
  };

  const addToMultiSelect = (category: string, value: string) => {
    const current = activeFilters[category] || [];
    if (!current.includes(value)) {
      handleFilterChange(category, [...current, value]);
    }
  };

  const removeFromMultiSelect = (category: string, value: string) => {
    const current = activeFilters[category] || [];
    const updated = current.filter((item: string) => item !== value);
    if (updated.length > 0) {
      handleFilterChange(category, updated);
    } else {
      clearFilter(category);
    }
  };

  const renderMultiSelectSection = (title: string, category: string, options: string[], icon: string) => (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-[#CAFE33] flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </label>
      
      {/* Selected items */}
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {(activeFilters[category] || []).map((item: string) => (
          <Badge
            key={item}
            className="bg-[#CAFE33]/20 text-[#CAFE33] cursor-pointer hover:bg-red-500/20 hover:text-red-400 transition-colors"
            onClick={() => removeFromMultiSelect(category, item)}
          >
            {item}
            <X className="h-3 w-3 ml-1" />
          </Badge>
        ))}
      </div>
      
      {/* Options grid */}
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-gray-900/50 rounded-lg p-3">
        {options.map((option) => {
          const isSelected = (activeFilters[category] || []).includes(option);
          return (
            <div
              key={option}
              onClick={() => isSelected ? removeFromMultiSelect(category, option) : addToMultiSelect(category, option)}
              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-all ${
                isSelected 
                  ? "bg-[#CAFE33]/20 border border-[#CAFE33]/50" 
                  : "hover:bg-gray-800/70 border border-transparent"
              }`}
            >
              <Checkbox
                checked={isSelected}
                className="border-gray-600 data-[state=checked]:bg-[#CAFE33] data-[state=checked]:border-[#CAFE33]"
              />
              <label className="text-xs text-gray-300 cursor-pointer flex-1">
                {option}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="mb-6 px-4 space-y-4">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#CAFE33] transition-colors" />
        <Input
          placeholder="Search by name, skills, interests, college..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-14 bg-gradient-to-r from-gray-900/90 to-gray-800/90 border-gray-700/50 text-white placeholder-gray-400 focus:border-[#CAFE33] focus:ring-2 focus:ring-[#CAFE33]/20 rounded-xl h-14 backdrop-blur-sm text-base transition-all duration-300 hover:border-[#CAFE33]/50"
        />
        
        {/* Advanced Filters Button */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl h-10 w-10 transition-all duration-300 ${
                Object.keys(activeFilters).length > 0
                  ? "text-[#CAFE33] bg-[#CAFE33]/20 hover:bg-[#CAFE33]/30"
                  : "text-gray-400 hover:text-[#CAFE33] hover:bg-[#CAFE33]/10"
              }`}
            >
              <Filter className="h-5 w-5" />
              {Object.keys(activeFilters).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#CAFE33] text-black text-xs rounded-full flex items-center justify-center font-bold">
                  {Object.keys(activeFilters).length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-[90vw] max-w-4xl p-0 bg-gray-900/95 border-gray-700/50 rounded-2xl shadow-2xl backdrop-blur-xl" 
            align="end"
            side="bottom"
          >
            <Card className="bg-transparent border-none">
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-[#CAFE33]" />
                    Advanced Filters
                  </h3>
                  {Object.keys(activeFilters).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                  {/* Basic Info Filters */}
                  <div className="space-y-6">
                    <h4 className="text-[#CAFE33] font-semibold text-sm uppercase tracking-wide">📚 Academic Info</h4>
                    
                    {/* College */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#CAFE33] flex items-center gap-2">
                        🏫 College
                      </label>
                      <Select
                        value={activeFilters.college || ""}
                        onValueChange={(value) => handleFilterChange("college", value)}
                      >
                        <SelectTrigger className="bg-gray-800/70 border-gray-600 text-white rounded-xl">
                          <SelectValue placeholder="Select college..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                          {colleges.map((college) => (
                            <SelectItem key={college} value={college} className="text-white hover:bg-gray-700">
                              {college}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#CAFE33] flex items-center gap-2">
                        📖 Department
                      </label>
                      <Select
                        value={activeFilters.department || ""}
                        onValueChange={(value) => handleFilterChange("department", value)}
                      >
                        <SelectTrigger className="bg-gray-800/70 border-gray-600 text-white rounded-xl">
                          <SelectValue placeholder="Select department..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept} className="text-white hover:bg-gray-700">
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#CAFE33] flex items-center gap-2">
                        🎓 Year
                      </label>
                      <Select
                        value={activeFilters.academic_year || ""}
                        onValueChange={(value) => handleFilterChange("academic_year", value)}
                      >
                        <SelectTrigger className="bg-gray-800/70 border-gray-600 text-white rounded-xl">
                          <SelectValue placeholder="Select year..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                          {["1", "2", "3", "4", "5+"].map((year) => (
                            <SelectItem key={year} value={year} className="text-white hover:bg-gray-700">
                              Year {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#CAFE33] flex items-center gap-2">
                        ⏰ Availability
                      </label>
                      <Select
                        value={activeFilters.availability || ""}
                        onValueChange={(value) => handleFilterChange("availability", value)}
                      >
                        <SelectTrigger className="bg-gray-800/70 border-gray-600 text-white rounded-xl">
                          <SelectValue placeholder="Select availability..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-white hover:bg-gray-700">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Skills and Preferences */}
                  <div className="space-y-6">
                    <h4 className="text-[#CAFE33] font-semibold text-sm uppercase tracking-wide">🎯 Skills & Preferences</h4>
                    
                    {/* Intent */}
                    {renderMultiSelectSection("Intent", "intent", intents, "🎯")}
                    
                    {/* Tech Skills */}
                    {renderMultiSelectSection("Tech Skills", "tech_skills", techSkills, "💻")}
                    
                    {/* Creative Skills */}
                    {renderMultiSelectSection("Creative Skills", "creative_skills", creativeSkills, "🎨")}
                    
                    {/* Business Skills */}
                    {renderMultiSelectSection("Business Skills", "business_skills", businessSkills, "💼")}
                    
                    {/* Personality Tags */}
                    {renderMultiSelectSection("Personality", "personality", personalityTags, "💫")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-[#CAFE33] text-sm font-medium whitespace-nowrap">Active Filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value) return null;
            
            if (Array.isArray(value)) {
              return value.map((item: string) => (
                <Badge
                  key={`${key}-${item}`}
                  className="bg-[#CAFE33]/20 text-[#CAFE33] cursor-pointer hover:bg-red-500/20 hover:text-red-400 whitespace-nowrap transition-colors border border-[#CAFE33]/30"
                  onClick={() => removeFromMultiSelect(key, item)}
                >
                  {item}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ));
            }
            
            return (
              <Badge
                key={key}
                className="bg-[#CAFE33]/20 text-[#CAFE33] cursor-pointer hover:bg-red-500/20 hover:text-red-400 whitespace-nowrap transition-colors border border-[#CAFE33]/30"
                onClick={() => clearFilter(key)}
              >
                {value as string}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
