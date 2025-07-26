import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIndianColleges } from "@/hooks/useIndianColleges";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const calculateAcademicYear = (passOutYearStr: string): string => {
  if (!passOutYearStr) return "";
  const passOutYear = parseInt(passOutYearStr, 10);
  const currentYear = new Date().getFullYear();

  if (passOutYear <= currentYear) {
    return "Passout";
  }

  // Assuming a 4-year program for calculation.
  const yearsRemaining = passOutYear - currentYear;
  
  if (yearsRemaining > 5) return "Graduate Student";

  const yearOfStudy = 4 - (yearsRemaining - 1);

  switch (yearOfStudy) {
    case 1: return "1st Year";
    case 2: return "2nd Year";
    case 3: return "3rd Year";
    case 4: return "4th Year";
    default: return "5th Year+";
  }
};

interface BasicInfoStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

const BasicInfoStep = ({ data, updateData, onNext, goBack }: BasicInfoStepProps) => {
  const [formData, setFormData] = useState({
    name: "",
    place: "",
    state: "",
    college: "",
    department: "",
    year: "",
    gender: "",
    passOutYear: "",
    ...data.basicInfo
  });

  const [open, setOpen] = useState(false);
  const { states, getCollegesByState, loading } = useIndianColleges();
  const [error, setError] = useState("");
  const [customDepartment, setCustomDepartment] = useState("");
  const [customCollege, setCustomCollege] = useState("");

  const departmentOptions = [
    // Most popular and modern tech branches
    "Computer Science & Engineering",
    "Artificial Intelligence and Machine Learning",
    "Artificial Intelligence and Data Science",
    "Data Science",
    "Computer Science & Business System",
    "Computer Science (Cybersecurity Specialization)",
    "Information Technology",
  
    // Traditional core engineering
    "Electronics & Communication Engineering",
    "Electrical and Electronics Engineering",
    "Electronics Engineering (VLSI Design and Technology)",
    "Electronics and Instrumentation Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
  
    // Interdisciplinary & trending
    "Bioengineering",
    "Biotechnology",
    "Industrial Biotechnology",
    "Environmental Engineering",
    "Environmental Science",
    "Materials Science",
    "Material Science and Engineering",
    "Geo Informatics",
    "Mechatronics Engineering",
    "Manufacturing Engineering",
  
    // Specialized core branches
    "Automobile Engineering",
    "Aeronautical Engineering",
    "Aerospace Engineering",
    "Production Engineering",
    "Printing Technology",
    "Mining Engineering",
    "Agricultural & Irrigation Engineering",
    "Industrial Engineering",
    "Mechanical and Automation Engineering",
    "Ceramic Technology",
    "Textile Technology",
    "Apparel Technology",
    "Leather Technology",
    "Rubber and Plastics Technology",
    "Petroleum Engineering and Technology",
    "Petrochemical Technology",
    "Polymer Technology",
    "Pharmaceutical Technology",
    "Food Technology",
  
    // Commerce, Management, and Law
    "Business Administration",
    "Commerce",
    "Finance",
    "Marketing",
    "Human Resources",
    "Law",
    "Pre-Law",
  
    // Medical & Health Sciences
    "Medicine",
    "Pharmacy",
    "Nursing",
    "Pre-Med",
  
    // Science & Research
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Statistics",
  
    // Arts, Humanities, and Social Sciences
    "Economics",
    "Political Science",
    "History",
    "Philosophy",
    "English Literature",
    "Psychology",
    "International Relations",
  
    // Media, Arts & Communication
    "Communications",
    "Journalism",
    "Art & Design",
    "Music",
    "Theater Arts",
  

    "Architecture",
  
  
    "Other Branches (B.Tech)"
  ];
  

  const currentYear = new Date().getFullYear();
  const passOutYearOptions = Array.from({ length: 10 }, (_, i) => (currentYear - 2 + i).toString());

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" }
  ];

  // Get colleges for selected state
  const availableColleges = formData.state ? getCollegesByState(formData.state) : [];

  // Sync formData from data.basicInfo when it changes
  useEffect(() => {
    setFormData({
      name: "",
      place: "",
      state: "",
      college: "",
      department: "",
      year: "",
      gender: "",
      passOutYear: "",
      ...data.basicInfo
    });
  }, [data.basicInfo]);

  // Always push current state to parent on mount/first render
  useEffect(() => {
    updateData("basicInfo", formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [field]: value };
      if (field === 'state') {
        newData.college = '';
        setCustomCollege("");
      }
      if (field === 'passOutYear') {
        newData.year = calculateAcademicYear(value);
      }
      if (field === 'department' && value !== 'Other') {
        setCustomDepartment("");
      }
      return newData;
    });
  };

  const handleCollegeSelect = (collegeName: string) => {
    handleInputChange("college", collegeName);
    setOpen(false);
    if (collegeName !== "Other") setCustomCollege("");
  };

  const isComplete = formData.name && formData.place && formData.state && 
                   formData.college && formData.department && formData.passOutYear && formData.gender;

  const handleContinue = () => {
    if (!isComplete) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    updateData("basicInfo", formData);
    onNext();
  };

  return (
    <div className="space-y-6 pb-20">
      {goBack && (
        <button onClick={goBack} className="text-[#CAFE33] hover:text-[#B8E62E] font-semibold mb-2">← Back</button>
      )}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <span className="text-3xl">👤</span>
          Let's get to know you!
        </h3>
        <p className="text-gray-400">Tell us about yourself to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white text-sm font-medium mb-2 block">
            📝 Full Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Your full name"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33]"
          />
        </div>

        <div>
          <Label htmlFor="place" className="text-white text-sm font-medium mb-2 block">
            📍 Place/Location <span className="text-red-400">*</span>
          </Label>
          <Input
            id="place"
            value={formData.place}
            onChange={(e) => handleInputChange("place", e.target.value)}
            placeholder="Enter your city, state or location"
            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33]"
          />
        </div>

        <div>
          <Label htmlFor="state" className="text-white text-sm font-medium mb-2 block">
            🏛️ State <span className="text-red-400">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange("state", value)} value={formData.state}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select your state" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
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
        </div>

        <div>
          <Label htmlFor="college" className="text-white text-sm font-medium mb-2 block">
            🏫 College/University <span className="text-red-400">*</span>
          </Label>
          {!formData.state ? (
            <div className="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-gray-400 text-sm">
              Please select a state first
            </div>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                >
                  {formData.college || "Search for your college..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600 z-50">
                <Command className="bg-gray-800">
                  <CommandInput 
                    placeholder={`Search colleges in ${formData.state}...`}
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
                            handleCollegeSelect("Other");
                          }}
                          className="mt-2 bg-[#CAFE33] text-black hover:bg-[#B8E62E]"
                        >
                          Add Other College
                        </Button>
                      </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {availableColleges.map((college) => (
                        <CommandItem
                          key={college.college_name}
                          value={college.college_name}
                          onSelect={() => handleCollegeSelect(college.college_name)}
                          className="text-white hover:bg-gray-700"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.college === college.college_name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{college.college_name}</div>
                            <div className="text-xs text-gray-400">{college.state}</div>
                          </div>
                        </CommandItem>
                      ))}
                      {/* Add "Other" option at the end */}
                      <CommandItem
                        value="Other"
                        onSelect={() => handleCollegeSelect("Other")}
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
          {/* Custom College Input */}
          {formData.college === "Other" && (
            <div className="mt-3">
              <Input
                value={customCollege}
                onChange={e => {
                  setCustomCollege(e.target.value);
                  handleInputChange("college", e.target.value);
                }}
                placeholder="Enter your college name"
                className="bg-gray-800 border-2 border-[#CAFE33] text-white placeholder-gray-400 focus:border-[#B8E62E] mt-1"
                autoFocus
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="department" className="text-white text-sm font-medium mb-2 block">
            🎓 Department/Major <span className="text-red-400">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange("department", value)} value={formData.department}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 max-h-60 z-50">
              {departmentOptions.map((dept) => (
                <SelectItem key={dept} value={dept} className="text-white hover:bg-gray-700">
                  {dept}
                </SelectItem>
              ))}
              <SelectItem key="Other" value="Other" className="text-[#CAFE33] hover:bg-gray-700">
                Other
              </SelectItem>
            </SelectContent>
          </Select>
          {/* Custom Department Input */}
          {formData.department === "Other" && (
            <div className="mt-3">
              <Input
                value={customDepartment}
                onChange={e => {
                  setCustomDepartment(e.target.value);
                  handleInputChange("department", e.target.value);
                }}
                placeholder="Enter your department/major"
                className="bg-gray-800 border-2 border-[#CAFE33] text-white placeholder-gray-400 focus:border-[#B8E62E] mt-1"
                autoFocus
              />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="passOutYear" className="text-white text-sm font-medium mb-2 block">
            🎓 Year of Passing Out <span className="text-red-400">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange("passOutYear", value)} value={formData.passOutYear}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select your graduation year" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 z-50">
              {passOutYearOptions.map((year) => (
                <SelectItem key={year} value={year} className="text-white hover:bg-gray-700">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.year && (
          <div className="space-y-1 rounded-lg bg-gray-800 p-3">
            <Label className="text-sm font-medium text-gray-400">
              Calculated Academic Year
            </Label>
            <p className="text-lg font-bold text-[#CAFE33]">{formData.year}</p>
          </div>
        )}

        <div>
          <Label htmlFor="gender" className="text-white text-sm font-medium mb-2 block">
            ⚧️ Gender <span className="text-red-400">*</span>
          </Label>
          <Select onValueChange={(value) => handleInputChange("gender", value)} value={formData.gender}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600 z-50">
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm text-center mb-2">{error}</div>
      )}
      <Button 
        onClick={handleContinue}
        disabled={!isComplete}
        className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold py-3 rounded-lg"
      >
        Continue
      </Button>
    </div>
  );
};

export default BasicInfoStep;
