
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Heart } from "lucide-react";

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

interface TrendingSectionProps {
  hotProfiles: Person[];
}

const TrendingSection = ({ hotProfiles }: TrendingSectionProps) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#CAFE33]/20 shadow-2xl shadow-[#CAFE33]/5 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-3xl font-bold text-white">🔥 Trending Now</h2>
            <p className="text-gray-400 text-xs sm:text-sm">Most active and highly matched profiles</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border-red-500/50 animate-pulse px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-base">
          Live • {hotProfiles.length} online
        </Badge>
      </div>
      
      <div className="grid gap-4 sm:gap-6">
        {hotProfiles.map((person, index) => (
          <Card 
            key={person.id}
            className="group relative bg-gradient-to-br from-gray-900 via-gray-800/80 to-gray-900 border-[#CAFE33]/30 hover:border-[#CAFE33] transition-all duration-500 hover:scale-[1.01] overflow-hidden hover:shadow-2xl hover:shadow-[#CAFE33]/20 rounded-xl sm:rounded-2xl"
          >
            <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-l from-[#CAFE33]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-3 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="relative mx-auto sm:mx-0">
                  <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-2 sm:border-3 border-[#CAFE33] ring-2 sm:ring-4 ring-[#CAFE33]/20">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-lg sm:text-xl font-bold">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {person.isOnline && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 sm:border-3 border-gray-900 flex items-center justify-center">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black text-xs sm:text-sm font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg">
                    {person.matchPercentage}%
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <h3 className="text-white font-bold text-base sm:text-xl">{person.name}</h3>
                    <Badge className="bg-gradient-to-r from-[#CAFE33]/20 to-[#B8E62E]/20 text-[#CAFE33] border-[#CAFE33]/50 text-xs font-semibold">
                      {person.projects} projects
                    </Badge>
                    {person.isOnline && (
                      <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/50 text-xs">
                        Online
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-300">
                    <span className="font-medium">{person.department}</span>
                    <span>•</span>
                    <span>{person.year}</span>
                    <span>•</span>
                    <span className="text-[#CAFE33] font-medium">📍 {person.location}</span>
                  </div>
                  
                  <p className="text-gray-200 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed font-medium">
                    {person.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {person.interests.map((interest, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-[#CAFE33]/15 text-[#CAFE33] border-[#CAFE33]/40 text-[10px] sm:text-xs hover:bg-[#CAFE33]/25 transition-all duration-300 rounded-lg px-2 sm:px-3 py-0.5"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-5 sm:mb-6">
                    {person.lookingFor.map((looking, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="text-[#CAFE33] border-[#CAFE33] text-[10px] sm:text-xs hover:bg-[#CAFE33]/10 transition-all duration-300 rounded-lg px-2 sm:px-3 py-0.5"
                      >
                        {looking}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[#CAFE33]/40 rounded-xl py-2 sm:py-3 text-base sm:text-lg"
                    size="lg"
                  >
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                    Connect Now
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

export default TrendingSection;
