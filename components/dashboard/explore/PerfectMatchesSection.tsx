
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface Person {
  id: number;
  name: string;
  department: string;
  year: string;
  avatar: string;
  interests: string[];
  lookingFor: string[];
  bio: string;
  isHot: boolean;
  matchPercentage: number;
  location: string;
  projects: number;
  isOnline: boolean;
}

interface PerfectMatchesSectionProps {
  suggestions: Person[];
}

const PerfectMatchesSection = ({ suggestions }: PerfectMatchesSectionProps) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#CAFE33]/20 shadow-2xl shadow-[#CAFE33]/5 mb-6 sm:mb-8">
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] rounded-xl sm:rounded-2xl">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">✨ Perfect Matches</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Curated based on your interests and goals</p>
          </div>
        </div>
        <Badge className="bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/50 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
          {suggestions.length} matches found
        </Badge>
      </div>
      
      <div className="grid gap-4 sm:gap-5">
        {suggestions.map((person, index) => (
          <Card 
            key={person.id} 
            className="group bg-gradient-to-br from-gray-900 to-gray-800 border-[#CAFE33]/30 hover:border-[#CAFE33] transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-[#CAFE33]/20 rounded-xl sm:rounded-2xl overflow-hidden"
            style={{
              animationDelay: `${index * 0.07}s`,
            }}
          >
            <CardContent className="p-3 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-5">
                <div className="relative mx-auto sm:mx-0 flex-shrink-0">
                  <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-[#CAFE33] ring-2 ring-[#CAFE33]/20">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback className="bg-[#CAFE33] text-black text-sm sm:text-base font-bold">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {person.isOnline && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-[#CAFE33] text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {person.matchPercentage}%
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-white font-bold text-lg sm:text-xl">{person.name}</h3>
                    <Badge className="bg-gradient-to-r from-[#CAFE33]/20 to-[#B8E62E]/20 text-[#CAFE33] border-[#CAFE33]/50 text-xs font-semibold">
                      {person.projects} projects
                    </Badge>
                    {person.isOnline && (
                      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/50 text-xs">
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 text-xs sm:text-sm text-gray-300">
                    <span className="font-medium">{person.department}</span>
                    <span>•</span>
                    <span>{person.year}</span>
                    <span>•</span>
                    <span className="text-[#CAFE33] font-medium">📍 {person.location}</span>
                  </div>
                  
                  <p className="text-gray-200 text-sm mb-3 leading-relaxed font-medium">
                    {person.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {person.interests.map((interest, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-[#CAFE33]/15 text-[#CAFE33] border-[#CAFE33]/40 text-xs hover:bg-[#CAFE33]/25 transition-all duration-300 rounded-lg px-2 py-0.5"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {person.lookingFor.map((looking, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-[#CAFE33] border-[#CAFE33] text-xs hover:bg-[#CAFE33]/10 transition-all duration-300 rounded-lg px-2 py-0.5"
                      >
                        {looking}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#CAFE33]/30 rounded-xl py-2.5 text-sm sm:text-base"
                    size="sm"
                  >
                    Connect Now 🤝
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PerfectMatchesSection;
