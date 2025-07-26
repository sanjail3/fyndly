
import AdvancedFilters from "./AdvancedFilters";

interface SearchAndFiltersProps {
  onSearch?: (query: string) => void;
  onFilterSelect?: (filters: any) => void;
}

const SearchAndFilters = ({ onSearch, onFilterSelect }: SearchAndFiltersProps) => {
  const handleFiltersChange = (filters: any) => {
    onFilterSelect?.(filters);
  };

  return (
    <AdvancedFilters onFiltersChange={handleFiltersChange} />
  );
};

export default SearchAndFilters;
