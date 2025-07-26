import { useState, useEffect } from 'react';

interface College {
  college_name: string;
  city: string;
  state: string;
}

export const useCollegeApi = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTamilNaduColleges = () => {
      setLoading(true);
      
      // Comprehensive list of Tamil Nadu colleges
      const tamilNaduColleges: College[] = [
        // IITs and NITs
        { college_name: 'Indian Institute of Technology Madras', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'National Institute of Technology Tiruchirappalli', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
        
        // Anna University and affiliated colleges
        { college_name: 'Anna University', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'College of Engineering Guindy', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Madras Institute of Technology', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Alagappa College of Technology', city: 'Chennai', state: 'Tamil Nadu' },
        
        // Private Engineering Colleges
        { college_name: 'Vellore Institute of Technology', city: 'Vellore', state: 'Tamil Nadu' },
        { college_name: 'SRM Institute of Science and Technology', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Amrita Vishwa Vidyapeetham', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'PSG College of Technology', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'Thiagarajar College of Engineering', city: 'Madurai', state: 'Tamil Nadu' },
        { college_name: 'SSN College of Engineering', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Kalasalingam Academy of Research and Education', city: 'Krishnankoil', state: 'Tamil Nadu' },
        { college_name: 'Karunya Institute of Technology and Sciences', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'Kumaraguru College of Technology', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'Rajalakshmi Engineering College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'St. Joseph\'s College of Engineering', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Easwari Engineering College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Loyola-ICAM College of Engineering and Technology', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Hindustan Institute of Technology and Science', city: 'Chennai', state: 'Tamil Nadu' },
        
        // Government Engineering Colleges
        { college_name: 'Government College of Engineering Salem', city: 'Salem', state: 'Tamil Nadu' },
        { college_name: 'Government College of Technology Coimbatore', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'Madras Institute of Technology Anna University', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Annamalai University', city: 'Chidambaram', state: 'Tamil Nadu' },
        { college_name: 'Bharathidasan University', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
        { college_name: 'Madurai Kamaraj University', city: 'Madurai', state: 'Tamil Nadu' },
        { college_name: 'University of Madras', city: 'Chennai', state: 'Tamil Nadu' },
        
        // Arts and Science Colleges
        { college_name: 'Loyola College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Madras Christian College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Stella Maris College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Presidency College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'PSG College of Arts and Science', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'American College', city: 'Madurai', state: 'Tamil Nadu' },
        { college_name: 'Lady Doak College', city: 'Madurai', state: 'Tamil Nadu' },
        { college_name: 'St. Joseph\'s College', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
        { college_name: 'Sacred Heart College', city: 'Tirupattur', state: 'Tamil Nadu' },
        { college_name: 'Ethiraj College for Women', city: 'Chennai', state: 'Tamil Nadu' },
        
        // Medical Colleges
        { college_name: 'Madras Medical College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Stanley Medical College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Kilpauk Medical College', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Thanjavur Medical College', city: 'Thanjavur', state: 'Tamil Nadu' },
        { college_name: 'Tirunelveli Medical College', city: 'Tirunelveli', state: 'Tamil Nadu' },
        { college_name: 'Coimbatore Medical College', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'Madurai Medical College', city: 'Madurai', state: 'Tamil Nadu' },
        { college_name: 'Christian Medical College', city: 'Vellore', state: 'Tamil Nadu' },
        { college_name: 'Sri Ramachandra Institute of Higher Education and Research', city: 'Chennai', state: 'Tamil Nadu' },
        
        // Management and Business Schools
        { college_name: 'Indian Institute of Management Tiruchirappalli', city: 'Tiruchirappalli', state: 'Tamil Nadu' },
        { college_name: 'Great Lakes Institute of Management', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Indian Institute of Foreign Trade', city: 'Chennai', state: 'Tamil Nadu' },
        
        // Other Notable Institutions
        { college_name: 'Tamil Nadu Agricultural University', city: 'Coimbatore', state: 'Tamil Nadu' },
        { college_name: 'Tamil Nadu Veterinary and Animal Sciences University', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Tamil Nadu Physical Education and Sports University', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'Indian Maritime University', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'National Institute of Fashion Technology', city: 'Chennai', state: 'Tamil Nadu' },
        { college_name: 'National Institute of Design', city: 'Chennai', state: 'Tamil Nadu' },
      ];

      // Sort colleges alphabetically by name
      const sortedColleges = tamilNaduColleges.sort((a, b) => 
        a.college_name.localeCompare(b.college_name)
      );
      
      setColleges(sortedColleges);
      setLoading(false);
    };

    // Load colleges immediately
    loadTamilNaduColleges();
  }, []);

  return { colleges, loading };
};
