
import { useState, useEffect, useMemo } from 'react';

interface College {
  college_name: string;
  state: string;
}

export const useIndianColleges = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCollegeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load the CSV data from public directory
        const response = await fetch('/indian_college_data.csv');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch college data: ${response.status}`);
        }
        
        const csvText = await response.text();
        
        // Parse CSV manually (simple parser for our specific format)
        const lines = csvText.trim().split('\n');
        
        if (lines.length === 0) {
          throw new Error('CSV file is empty');
        }
        
        const collegeData: College[] = [];
        
        // Skip header row (index 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          
          // Handle quoted values that might contain commas
          const matches = line.match(/(?:^|,)("(?:[^"]+)*"|[^,]*)/g);
          
          if (matches && matches.length >= 2) {
            const collegeName = matches[0].replace(/^,?"?|"?$/g, '').trim();
            const state = matches[1].replace(/^,?"?|"?$/g, '').trim();
            
            if (collegeName && state && collegeName !== 'College_Name') {
              collegeData.push({
                college_name: collegeName,
                state: state
              });
            }
          }
        }
        
        console.log(`Loaded ${collegeData.length} colleges from CSV`);
        setColleges(collegeData);
        
      } catch (error) {
        console.error('Error loading college data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setColleges([]);
      } finally {
        setLoading(false);
      }
    };

    loadCollegeData();
  }, []);

  // Get unique states
  const states = useMemo(() => {
    const uniqueStates = [...new Set(colleges.map(college => college.state))]
      .sort()
      .filter(state => state && state.trim() !== '');
    return uniqueStates;
  }, [colleges]);

  // Filter colleges by state
  const getCollegesByState = useMemo(() => {
    return (selectedState: string) => {
      if (!selectedState) return [];
      return colleges
        .filter(college => college.state.toLowerCase() === selectedState.toLowerCase())
        .sort((a, b) => a.college_name.localeCompare(b.college_name));
    };
  }, [colleges]);

  return {
    colleges,
    states,
    getCollegesByState,
    loading,
    error
  };
};
