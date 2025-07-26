import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X } from "lucide-react";
import { useIndianColleges } from "@/hooks/useIndianColleges";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartFiltersProps {
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
}

const SmartFilters = ({
  college, setCollege,
  academicYear, setAcademicYear,
  department, setDepartment,
  intent, setIntent,
  availability, setAvailability,
  personalityTags, setPersonalityTags,
  skills, setSkills
}: SmartFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const { states, getCollegesByState, loading } = useIndianColleges();

  // Get colleges for selected state
  const availableColleges = selectedState ? getCollegesByState(selectedState) : [];

  const departments = [
    "Computer Science & Engineering", "Electronics & Communication Engineering", 
    "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
    "Chemical Engineering", "Aerospace Engineering", "Biotechnology", 
    "Information Technology", "Business Administration", "Economics", 
    "Psychology", "Biology", "Chemistry", "Physics", "Mathematics", 
    "English Literature", "Political Science", "History", "Philosophy", 
    "Art & Design", "Music", "Theater Arts", "Communications", "Journalism",
    "Pre-Med", "Pre-Law", "International Relations", "Environmental Science",
    "Data Science", "Bioengineering", "Materials Science", "Statistics", 
    "Architecture", "Law", "Medicine", "Pharmacy", "Nursing", "Commerce",
    "Finance", "Marketing", "Human Resources", "Other"
  ];

  const intentOptions = [
    "Hackathon Partner", "Co-Founder", "Startup Team", "Study Buddy",
    "Mentor/Mentee", "Project Partner", "Networking", "Research Partner"
  ];

  const availabilityOptions = [
    "0-5 hours/week", "5-10 hours/week", "10-20 hours/week", 
    "20+ hours/week", "Flexible", "Weekends Only"
  ];

  // Based on onboarding skills categories
  const techSkills = [
    "JavaScript", "Python", "React", "Node.js", "Java", "C++",
    "HTML/CSS", "TypeScript", "SQL", "MongoDB", "AWS", "Docker",
    "Git", "Machine Learning", "AI", "Data Science", "Blockchain",
    "Mobile Development", "Web Development", "UI/UX Design"
  ];

  const creativeSkills = [
    "Graphic Design", "Video Editing", "Photography", "Digital Art", 
    "Animation", "Music Production", "Writing", "Content Creation", 
    "Social Media Design", "Illustration", "Creative Writing"
  ];

  const sportsSkills = [
    "Cricket", "Football", "Basketball", "Tennis", "Badminton", "Swimming",
    "Running", "Cycling", "Yoga", "Gym/Fitness", "Volleyball", "Chess"
  ];

  const leadershipSkills = [
    "Team Leadership", "Project Management", "Event Management", 
    "Public Speaking", "Mentoring", "Communication", "Problem Solving"
  ];

  // Based on onboarding personality tags
  const personalityOptions = [
    "Creative", "Analytical", "Adventurous", "Organized", "Curious",
    "Leader", "Team Player", "Innovative", "Detail-oriented", "Ambitious",
    "Empathetic", "Energetic", "Calm", "Optimistic", "Pragmatic"
  ];

  const toggleMultiSelect = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter(item => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const toggleSkillCategory = (value: string, categorySkills: string[], allSkills: string[], setter: (v: string[]) => void) => {
    const otherSkills = allSkills.filter(s => !categorySkills.includes(s));
    if (categorySkills.includes(value)) {
      const newCategorySkills = categorySkills.filter(s => s !== value);
      setter([...otherSkills, ...newCategorySkills]);
    } else {
      const newCategorySkills = [...categorySkills, value];
      setter([...otherSkills, ...newCategorySkills]);
    }
  };

  const handleCollegeSelect = (collegeName: string) => {
    setCollege(collegeName);
    setOpen(false);
  };

  const FilterCard = ({ title, emoji, children }: { title: string; emoji: string; children: React.ReactNode }) => (
    <div className="bg-gradient-to-br from-[#111a03] to-[#0a1201] border border-[#CAFE33]/30 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{emoji}</span>
        <h3 className="text-[#CAFE33] font-bold text-sm uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );

  const TagSelector = ({ 
    options, 
    selected, 
    onToggle, 
    maxHeight = "200px" 
  }: { 
    options: string[]; 
    selected: string[]; 
    onToggle: (value: string) => void;
    maxHeight?: string;
  }) => (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(item => (
            <Badge
              key={item}
              className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-semibold px-3 py-1 rounded-full hover:shadow-lg transition-all duration-200 flex items-center gap-1 cursor-pointer"
              onClick={() => onToggle(item)}
            >
              {item}
              <X size={12} />
            </Badge>
          ))}
        </div>
      )}
      
      {/* Available Options */}
      <div className={`grid grid-cols-2 gap-2 overflow-y-auto bg-gray-900/50 rounded-lg p-3`} style={{ maxHeight }}>
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <div
              key={option}
              onClick={() => onToggle(option)}
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
    <div className="space-y-6">
      {/* Basic Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FilterCard title="State" emoji="🏛️">
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 rounded-xl max-h-48">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading states...</div>
              ) : states.length > 0 ? (
                states.map((state) => (
                  <SelectItem key={state} value={state} className="text-white hover:bg-gray-700">
                    {state}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">No states available</div>
              )}
            </SelectContent>
          </Select>
        </FilterCard>

        <FilterCard title="College" emoji="🏫">
          {!selectedState ? (
            <div className="bg-black/50 border border-gray-600 rounded-xl px-3 py-2 text-gray-400 text-sm">
              Please select a state first
            </div>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-black/50 text-white border-[#CAFE33]/40 hover:bg-gray-700 rounded-xl"
                >
                  {college || "Search for college..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600 z-50">
                <Command className="bg-gray-800">
                  <CommandInput 
                    placeholder={`Search colleges in ${selectedState}...`}
                    className="text-white placeholder-gray-400"
                  />
                  <CommandList>
                    <CommandEmpty className="text-gray-400 p-4">
                      <div className="text-center">
                        <p>No college found.</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const customCollege = prompt("Enter college name:");
                            if (customCollege) {
                              handleCollegeSelect(customCollege);
                            }
                          }}
                          className="mt-2 bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
                        >
                          Add Other College
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {availableColleges.map((collegeItem) => (
                        <CommandItem
                          key={collegeItem.college_name}
                          value={collegeItem.college_name}
                          onSelect={() => handleCollegeSelect(collegeItem.college_name)}
                          className="text-white hover:bg-gray-700"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              college === collegeItem.college_name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{collegeItem.college_name}</div>
                            <div className="text-xs text-gray-400">{collegeItem.state}</div>
                          </div>
                        </CommandItem>
                      ))}
                      
                      {/* Add "Other" option at the end */}
                      <CommandItem
                        value="add-other-college"
                        onSelect={() => {
                          const customCollege = prompt("Enter college name:");
                          if (customCollege) {
                            handleCollegeSelect(customCollege);
                          }
                        }}
                        className="text-[#CAFE33] hover:bg-gray-700 border-t border-gray-600 mt-2"
                      >
                        <div>
                          <div className="font-medium">+ Add Other College</div>
                          <div className="text-xs text-gray-400">Not found? Add manually</div>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </FilterCard>

        <FilterCard title="Academic Year" emoji="🎓">
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
              <SelectValue placeholder="Select year..." />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 rounded-xl">
              {["1", "2", "3", "4", "5+"].map((year) => (
                <SelectItem key={year} value={year} className="text-white hover:bg-gray-700">
                  Year {year}
                </SelectItem>
              ))}
              <SelectItem value="Passout" className="text-white hover:bg-gray-700">
                Passout
              </SelectItem>
            </SelectContent>
          </Select>
        </FilterCard>
      </div>

      {/* Department Row */}
      <FilterCard title="Department" emoji="📚">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
            <SelectValue placeholder="Select department..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600 rounded-xl max-h-48">
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept} className="text-white hover:bg-gray-700">
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterCard>

      {/* Intent Row */}
      <FilterCard title="Looking For" emoji="🎯">
        <TagSelector
          options={intentOptions}
          selected={intent}
          onToggle={(value) => toggleMultiSelect(value, intent, setIntent)}
          maxHeight="200px"
        />
      </FilterCard>

      {/* Availability Row */}
      <FilterCard title="Availability" emoji="⏰">
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
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
      </FilterCard>

      {/* Skills Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FilterCard title="Tech Skills" emoji="💻">
          <TagSelector
            options={techSkills}
            selected={skills.filter(s => techSkills.includes(s))}
            onToggle={(value) => {
              const currentTechSkills = skills.filter(s => techSkills.includes(s));
              const otherSkills = skills.filter(s => !techSkills.includes(s));
              const newTechSkills = toggleSkillCategory(value, currentTechSkills, skills, setSkills);
            }}
            maxHeight="150px"
          />
        </FilterCard>

        <FilterCard title="Creative Skills" emoji="🎨">
          <TagSelector
            options={creativeSkills}
            selected={skills.filter(s => creativeSkills.includes(s))}
            onToggle={(value) => {
              const currentCreativeSkills = skills.filter(s => creativeSkills.includes(s));
              const otherSkills = skills.filter(s => !creativeSkills.includes(s));
              const newCreativeSkills = toggleSkillCategory(value, currentCreativeSkills, skills, setSkills);
            }}
            maxHeight="150px"
          />
        </FilterCard>
      </div>

      {/* Additional Skills Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FilterCard title="Sports & Fitness" emoji="🏃‍♂️">
          <TagSelector
            options={sportsSkills}
            selected={skills.filter(s => sportsSkills.includes(s))}
            onToggle={(value) => {
              const currentSportsSkills = skills.filter(s => sportsSkills.includes(s));
              const otherSkills = skills.filter(s => !sportsSkills.includes(s));
              const newSportsSkills = toggleSkillCategory(value, currentSportsSkills, skills, setSkills);
            }}
            maxHeight="150px"
          />
        </FilterCard>

        <FilterCard title="Leadership Skills" emoji="👑">
          <TagSelector
            options={leadershipSkills}
            selected={skills.filter(s => leadershipSkills.includes(s))}
            onToggle={(value) => {
              const currentLeadershipSkills = skills.filter(s => leadershipSkills.includes(s));
              const otherSkills = skills.filter(s => !leadershipSkills.includes(s));
              const newLeadershipSkills = toggleSkillCategory(value, currentLeadershipSkills, skills, setSkills);
            }}
            maxHeight="150px"
          />
        </FilterCard>
      </div>

      {/* Personality Row */}
      <FilterCard title="Personality" emoji="🌟">
        <TagSelector
          options={personalityOptions}
          selected={personalityTags}
          onToggle={(value) => toggleMultiSelect(value, personalityTags, setPersonalityTags)}
          maxHeight="200px"
        />
      </FilterCard>
    </div>
  );
};

export default SmartFilters;
