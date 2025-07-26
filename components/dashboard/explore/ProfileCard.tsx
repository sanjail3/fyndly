import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, Zap, Briefcase, Palette, Trophy } from "lucide-react";

interface MatchedUser {
  id: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  avatar_url?: string;
  interests: string[];
  tech_skills: string[];
  creative_skills?: string[];
  sports_skills?: string[];
  leadership_skills?: string[];
  looking_for: string[];
  matchScore?: number;
  isNewUser?: boolean;
}

interface ProfileCardProps {
  user: MatchedUser;
  variant?: 'default' | 'large' | 'compact';
  onViewProfile?: (user: MatchedUser) => void;
  onConnect?: (userId: string) => void;
  intentHighlight?: boolean;
}

const ProfileCard = ({ user, variant = 'default', onViewProfile, onConnect, intentHighlight }: ProfileCardProps) => {
  const cardSizes = {
    default: 'w-72 h-80',
    large: 'w-80 h-96',
    compact: 'w-64 h-72'
  };

  // Determine user category based on skills
  const getUserCategory = () => {
    const techCount = user.tech_skills?.length || 0;
    const creativeCount = user.creative_skills?.length || 0;
    const sportsCount = user.sports_skills?.length || 0;
    const leadershipCount = user.leadership_skills?.length || 0;

    if (techCount >= 3) return { icon: Zap, label: "Tech", color: "from-blue-500 to-purple-600", bg: "bg-blue-500/10" };
    if (creativeCount >= 2) return { icon: Palette, label: "Creative", color: "from-pink-500 to-rose-600", bg: "bg-pink-500/10" };
    if (sportsCount >= 2) return { icon: Trophy, label: "Sports", color: "from-orange-500 to-red-600", bg: "bg-orange-500/10" };
    if (leadershipCount >= 2) return { icon: Briefcase, label: "Leader", color: "from-green-500 to-emerald-600", bg: "bg-green-500/10" };
    
    return { icon: Zap, label: "Multi", color: "from-[#CAFE33] to-[#B8E62E]", bg: "bg-[#CAFE33]/10" };
  };

  const category = getUserCategory();
  const CategoryIcon = category.icon;

  return (
    <Card className={`${cardSizes[variant]} bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50 hover:border-[#CAFE33]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#CAFE33]/20 flex-shrink-0 backdrop-blur-sm relative overflow-hidden group`}>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#CAFE33]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <CardContent className="p-4 h-full flex flex-col relative z-10">
        {/* Header with Avatar and Badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-[#CAFE33]/30 group-hover:ring-[#CAFE33]/60 transition-all duration-300">
                <AvatarImage
                  src={user.avatar_url?.split('?')[0]}
                  className="w-full h-full object-cover rounded-xl"
                />
                <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-semibold">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Category Icon */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg`}>
                <CategoryIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{user.full_name}</h3>
              <p className="text-gray-400 text-xs truncate">{user.department}</p>
              <p className="text-gray-500 text-xs">Year {user.academic_year}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {user.matchScore !== undefined && (
              <Badge className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold text-xs shadow-lg">
                {Math.round(user.matchScore)} pts
              </Badge>
            )}
            
            {user.isNewUser && (
              <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs shadow-lg">
                New 🆕
              </Badge>
            )}
          </div>
        </div>

        {/* College Badge */}
        <Badge variant="outline" className="text-gray-300 border-gray-600 mb-3 w-fit text-xs bg-gray-800/50 backdrop-blur-sm">
          🏫 {user.college}
        </Badge>

        {/* Category Badge */}
        <div className="mb-3">
          <Badge className={`${category.bg} text-gray-300 border border-gray-600/50 text-xs`}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {category.label} Focused
          </Badge>
        </div>

        {/* Intent Highlight */}
        {intentHighlight && user.looking_for && user.looking_for.length > 0 && (
          <div className="mb-2">
            <Badge className="bg-gradient-to-r from-blue-700 to-blue-400 text-blue-100 text-xs font-medium border-0 px-2">
              {user.looking_for[0]}
            </Badge>
          </div>
        )}

        {/* Top Skills */}
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-2">🚀 Top Skills</p>
          <div className="flex flex-wrap gap-1">
            {user.tech_skills?.slice(0, 2).map((skill, index) => (
              <Badge key={index} className="bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                {skill}
              </Badge>
            ))}
            {user.creative_skills?.slice(0, 1).map((skill, index) => (
              <Badge key={`creative-${index}`} className="bg-pink-500/20 text-pink-300 text-xs border border-pink-500/30">
                {skill}
              </Badge>
            ))}
            {(user.tech_skills?.length || 0) + (user.creative_skills?.length || 0) > 3 && (
              <Badge className="bg-gray-700/50 text-gray-400 text-xs border border-gray-600/50">
                +{((user.tech_skills?.length || 0) + (user.creative_skills?.length || 0)) - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Intent Tags */}
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">🎯 Looking for</p>
          <div className="flex flex-wrap gap-1">
            {user.looking_for?.slice(0, 2).map((intent, index) => (
              <Badge key={index} className="bg-gradient-to-r from-[#CAFE33]/20 to-[#B8E62E]/20 text-[#CAFE33] text-xs border border-[#CAFE33]/30">
                {intent}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex space-x-2">
          <Button
            onClick={() => onViewProfile?.(user)}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-600/70 text-gray-300 hover:bg-gray-700/50 hover:border-[#CAFE33]/50 hover:text-[#CAFE33] transition-all duration-300 backdrop-blur-sm bg-gray-800/40"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            onClick={() => onConnect?.(user.id)}
            size="sm"
            className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Heart className="h-4 w-4 mr-1" />
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
