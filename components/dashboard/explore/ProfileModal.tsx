import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Heart, MessageCircle, Lock, Zap, Briefcase, Palette, Trophy, ArrowLeft, X } from "lucide-react";

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
  about?: string;
  matchScore?: number;
  place?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  personal_website?: string;
  personality_tags?: string[];
  instagram?: string;
  behance?: string;
}

interface ProfileModalProps {
  user: MatchedUser;
  isOpen: boolean;
  onClose: () => void;
  isMatched?: boolean;
  onRemoveMatch?: (userId: string) => void;
}

const ProfileModal = ({ user, isOpen, onClose, isMatched = false, onRemoveMatch }: ProfileModalProps) => {
  // Determine user category based on skills
  const getUserCategory = () => {
    const techCount = user.tech_skills?.length || 0;
    const creativeCount = user.creative_skills?.length || 0;
    const sportsCount = user.sports_skills?.length || 0;
    const leadershipCount = user.leadership_skills?.length || 0;

    if (techCount >= 3) return { icon: Zap, label: "Tech Enthusiast", color: "from-blue-500 to-purple-600" };
    if (creativeCount >= 2) return { icon: Palette, label: "Creative Mind", color: "from-pink-500 to-rose-600" };
    if (sportsCount >= 2) return { icon: Trophy, label: "Sports Person", color: "from-orange-500 to-red-600" };
    if (leadershipCount >= 2) return { icon: Briefcase, label: "Leader", color: "from-green-500 to-emerald-600" };
    
    return { icon: Zap, label: "Multi-talented", color: "from-[#CAFE33] to-[#B8E62E]" };
  };

  const category = getUserCategory();
  const CategoryIcon = category.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-auto p-0 bg-gray-900 border-[#CAFE33]/50 max-h-[95vh] overflow-hidden rounded-3xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{user.full_name}'s Profile</DialogTitle>
        </DialogHeader>
        
        <Card className="bg-gray-900 border-none rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header with Back Button and Gradient */}
            <div className={`relative h-40 bg-gradient-to-r ${category.color} flex items-center justify-center`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 left-4 z-10 text-white hover:bg-black/40 bg-black/20 rounded-full h-10 w-10 backdrop-blur-sm border border-white/20"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              {/* Match Score */}
              {user.matchScore && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#CAFE33]/90 text-black font-bold text-lg px-4 py-2 shadow-xl backdrop-blur-sm">
                    {user.matchScore}% Match ✨
                  </Badge>
                </div>
              )}
              
              {/* Avatar */}
              <Avatar className="h-24 w-24 border-4 border-[#CAFE33] shadow-2xl ring-4 ring-black/20 absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                <AvatarImage src={user.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-xl font-bold">
                  {user.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              {/* Category Badge */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <Badge className={`bg-gradient-to-r ${category.color} text-white px-3 py-1 shadow-lg border-2 border-black/20`}>
                  <CategoryIcon className="h-3 w-3 mr-1" />
                  {category.label}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="pt-16 px-6 pb-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{user.full_name}</h1>
                <p className="text-[#CAFE33] font-semibold">{user.department} • Year {user.academic_year}</p>
                
                {/* College & Location */}
                <div className="flex items-center justify-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <span>🏫</span>
                    <span>{user.college}</span>
                  </div>
                  {user.place && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{user.place}</span>
                    </div>
                  )}
                </div>
                
                {/* Fun Tags */}
                {user.personality_tags && user.personality_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center mt-2">
                    {user.personality_tags.map((tag: string, i: number) => (
                      <Badge key={i} className="bg-[#CAFE33]/20 text-[#CAFE33] text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* About */}
              {user.about && (
                <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-600/30 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <h3 className="text-[#CAFE33] font-bold text-sm mb-2 flex items-center gap-2">
                      💭 About
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{user.about}</p>
                  </CardContent>
                </Card>
              )}

              {/* Looking For */}
              <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h3 className="text-blue-400 font-bold text-sm mb-3 flex items-center gap-2">
                    🎯 Looking For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {user.looking_for?.map((item, index) => (
                      <Badge 
                        key={index}
                        className="bg-blue-500/20 text-blue-300 border-blue-400/30 px-3 py-1"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/20">
                <CardContent className="p-4">
                  <h3 className="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
                    ❤️ Interests & Hobbies
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {user.interests?.slice(0, 8).map((interest, index) => (
                      <Badge key={index} className="bg-orange-500/20 text-orange-300 text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {user.interests && user.interests.length > 8 && (
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs">
                        +{user.interests.length - 8}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Tech Skills */}
                {user.tech_skills && user.tech_skills.length > 0 && (
                  <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
                    <CardContent className="p-4">
                      <h3 className="text-purple-400 font-bold text-sm mb-2 flex items-center gap-2">
                        💻 Tech Skills
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {user.tech_skills.slice(0, 6).map((skill, index) => (
                          <Badge key={index} className="bg-purple-500/20 text-purple-300 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {user.tech_skills.length > 6 && (
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                            +{user.tech_skills.length - 6}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Other Skills */}
                {((user.creative_skills && user.creative_skills.length > 0) || 
                  (user.sports_skills && user.sports_skills.length > 0)) && (
                  <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/20">
                    <CardContent className="p-4">
                      <h3 className="text-green-400 font-bold text-sm mb-2 flex items-center gap-2">
                        🌟 Other Skills
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {[...(user.creative_skills || []), ...(user.sports_skills || [])]
                          .slice(0, 6)
                          .map((skill, index) => (
                            <Badge key={index} className="bg-green-500/20 text-green-300 text-xs">
                              {skill}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Social Links */}
              {isMatched ? (
                <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-600/30">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      {user.github && (
                        <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#CAFE33]">GitHub</a>
                      )}
                      {user.linkedin && (
                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#CAFE33]">LinkedIn</a>
                      )}
                      {user.twitter && (
                        <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#CAFE33]">Twitter</a>
                      )}
                      {user.personal_website && (
                        <a href={user.personal_website} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#CAFE33]">Website</a>
                      )}
                      {user.instagram && (
                        <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#CAFE33]">Instagram</a>
                      )}
                      {user.behance && (
                        <a href={user.behance} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#CAFE33]">Behance</a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-600/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center space-y-3">
                      <div className="text-center">
                        <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm font-medium">Social Links Locked 🔒</p>
                        <p className="text-gray-500 text-xs">Connect to unlock social profiles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {isMatched ? (
                  <>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => window.location.href = `/chat?user=${user.id}`}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Message
                    </Button>
                    {onRemoveMatch && (
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                        onClick={() => onRemoveMatch(user.id)}
                      >
                        <X className="h-5 w-5 mr-2" />
                        Remove Match
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Connect
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-[#CAFE33]/50 text-[#CAFE33] hover:bg-[#CAFE33]/10 hover:border-[#CAFE33] py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
