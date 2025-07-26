
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FilterCard from "./FilterCard";

interface BasicFiltersProps {
  college: string;
  setCollege: (v: string) => void;
  academicYear: string;
  setAcademicYear: (v: string) => void;
  department: string;
  setDepartment: (v: string) => void;
  availability: string;
  setAvailability: (v: string) => void;
}

const departmentOptions = [
  "Computer Science", "Mechanical Engg", "Electrical Engg", "Business", "Design", "Other",
];

const academicYearOptions = ["1", "2", "3", "4", "5"];

const availabilityOptions = [
  { label: "Part-time", emoji: "🕒" },
  { label: "Full-time", emoji: "🟢" },
  { label: "Flexible", emoji: "🌈" },
  { label: "Remote", emoji: "💻" },
  { label: "On-campus", emoji: "🏫" },
];

const BasicFilters = ({
  college, setCollege,
  academicYear, setAcademicYear,
  department, setDepartment,
  availability, setAvailability
}: BasicFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FilterCard title="College" emoji="🏫">
        <Input
          placeholder="Search your college..."
          value={college}
          onChange={e => setCollege(e.target.value)}
          className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl"
        />
      </FilterCard>

      <FilterCard title="Academic Year" emoji="🎓">
        <Select value={academicYear} onValueChange={setAcademicYear}>
          <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-[#CAFE33]/40 rounded-xl">
            {academicYearOptions.map(option => (
              <SelectItem key={option} value={option} className="hover:bg-[#CAFE33]/20">
                Year {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterCard>

      <FilterCard title="Department" emoji="🧑‍💼">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-[#CAFE33]/40 rounded-xl">
            {departmentOptions.map(option => (
              <SelectItem key={option} value={option} className="hover:bg-[#CAFE33]/20">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterCard>

      <FilterCard title="Availability" emoji="⏰">
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="bg-black/50 text-white border-[#CAFE33]/40 focus:border-[#CAFE33] rounded-xl">
            <SelectValue placeholder="How much time?" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border-[#CAFE33]/40 rounded-xl">
            {availabilityOptions.map(option => (
              <SelectItem key={option.label} value={option.label} className="hover:bg-[#CAFE33]/20">
                <span className="mr-2">{option.emoji}</span> {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterCard>
    </div>
  );
};

export default BasicFilters;
