import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIndianColleges } from "@/hooks/useIndianColleges";
import { useState, useEffect } from "react";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const departments = [
  "Computer Science", "Information Technology", "Electronics and Communication",
  "Mechanical Engineering", "Civil Engineering", "Electrical Engineering",
  "Chemical Engineering", "Biotechnology", "Aerospace Engineering",
  "Business Administration", "Arts and Humanities", "Sciences"
];
const academicYears = ["1", "2", "3", "4", "5"];

interface SwipeFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: { college: string; department: string; academicYear: string }) => void;
  initialFilters: { college: string; department: string; academicYear: string };
}

export function SwipeFilters({ open, onOpenChange, onApplyFilters, initialFilters }: SwipeFiltersProps) {
  const [college, setCollege] = useState(initialFilters.college);
  const [department, setDepartment] = useState(initialFilters.department);
  const [academicYear, setAcademicYear] = useState(initialFilters.academicYear);
  const [openCollegePopover, setOpenCollegePopover] = useState(false);

  const { colleges, loading: collegesLoading } = useIndianColleges();

  const collegeOptions = colleges.map(c => ({
    value: c.college_name,
    label: c.college_name,
  }));

  useEffect(() => {
    setCollege(initialFilters.college);
    setDepartment(initialFilters.department);
    setAcademicYear(initialFilters.academicYear);
  }, [initialFilters]);

  const handleApply = () => {
    onApplyFilters({ college, department, academicYear });
    onOpenChange(false);
  };

  const handleClear = () => {
    setCollege("");
    setDepartment("");
    setAcademicYear("");
    onApplyFilters({ college: "", department: "", academicYear: "" });
    onOpenChange(false);
  };
  
  const isFiltered = initialFilters.college || initialFilters.department || initialFilters.academicYear;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black border-t border-[#CAFE33]/20 text-white">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="text-center text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent">Filter Your Discover Feed</span>
            </DrawerTitle>
            <DrawerDescription className="text-center text-gray-400 pt-1">
              Find exactly who you're looking for.
            </DrawerDescription>
          </DrawerHeader>
          {/* Filter summary bar */}
          {(college || department || academicYear) && (
            <div className="flex flex-wrap gap-2 px-4 pb-2 pt-1">
              {college && (
                <span className="flex items-center bg-gray-800 border border-[#CAFE33] text-[#CAFE33] rounded-full px-3 py-1 text-xs font-semibold">
                  {college}
                  <button onClick={() => setCollege("")} className="ml-1 text-[#CAFE33] hover:text-red-400 focus:outline-none">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {department && (
                <span className="flex items-center bg-gray-800 border border-[#CAFE33] text-[#CAFE33] rounded-full px-3 py-1 text-xs font-semibold">
                  {department}
                  <button onClick={() => setDepartment("")} className="ml-1 text-[#CAFE33] hover:text-red-400 focus:outline-none">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {academicYear && (
                <span className="flex items-center bg-gray-800 border border-[#CAFE33] text-[#CAFE33] rounded-full px-3 py-1 text-xs font-semibold">
                  Year {academicYear}
                  <button onClick={() => setAcademicYear("")} className="ml-1 text-[#CAFE33] hover:text-red-400 focus:outline-none">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
          <div className="p-4 pb-0">
            <div className="space-y-4 rounded-lg bg-gray-900/50 p-4 border border-gray-700/50">
              {/* College Selector - onboarding style */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="text-lg">🎓</span> College
                </label>
                <Popover open={openCollegePopover} onOpenChange={setOpenCollegePopover}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCollegePopover}
                      className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                      {college ? college : "Search for your college..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600 z-50">
                    <Command className="bg-gray-800">
                      <CommandInput placeholder="Search college..." className="text-white placeholder-gray-400"/>
                      <CommandList>
                        <CommandEmpty className="text-gray-400 p-4">No college found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-y-auto">
                          {collegeOptions.map((c, index) => (
                            <CommandItem
                              key={`${c.value}-${index}`}
                              value={c.value}
                              className="text-white hover:bg-gray-700"
                              onSelect={(currentValue) => {
                                setCollege(currentValue === college ? "" : currentValue);
                                setOpenCollegePopover(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  college === c.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div>
                                <div className="font-medium">{c.label}</div>
                                <div className="text-xs text-gray-400">{colleges.find(col => col.college_name === c.label)?.state}</div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* Department Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="text-lg">💻</span> Department
                </label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="w-full bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Academic Year Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <span className="text-lg">🗓️</span> Academic Year
                </label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger className="w-full bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DrawerFooter className="flex-row gap-3 pt-6">
            {isFiltered && (
              <Button variant="outline" onClick={handleClear} className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12 rounded-xl">Clear</Button>
            )}
            <Button onClick={handleApply} className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold h-12 rounded-xl text-base shadow-lg shadow-[#CAFE33]/20 hover:scale-105 transition-transform">
              Apply Filters
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 