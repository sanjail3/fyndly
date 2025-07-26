import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin, Twitter, Globe, Mail, Lock, ArrowLeft, MapPin, Heart, Zap, Palette, Trophy, Briefcase } from "lucide-react";
import { useConnectionsContext } from "@/components/ConnectionsProvider";
import { useState, useEffect } from "react";

interface ProfileFullModalProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  isMatched: boolean;
  onRemoveMatch: (userId: string) => void;
  onConnect: (userId: string) => void;
  showSocialLinks?: boolean;
  currentUserId?: string | null;
}

const socialIcons: Record<string, React.ReactNode> = {
  github: <Github className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  website: <Globe className="h-4 w-4" />,
  personal_website: <Globe className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />
};

export default function ProfileFullModal({
  open,
  onClose,
  profile,
  isMatched,
  onRemoveMatch,
  onConnect,
  showSocialLinks = false,
  currentUserId,
}: ProfileFullModalProps) {
  const { sendConnectionRequest, getConnectionStatus, loading } = useConnectionsContext();
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  if (!profile) return null;

  // Check connection status when modal opens
  useEffect(() => {
    if (open && profile.id) {
      setCheckingStatus(true);
      getConnectionStatus(profile.id.toString()).then((status: any) => {
        setConnectionStatus(status);
        setCheckingStatus(false);
      });
    }
  }, [open, profile.id, getConnectionStatus]);

  // Determine user category based on skills
  const getUserCategory = () => {
    const techCount = profile.tech_skills?.length || 0;
    const creativeCount = profile.creative_skills?.length || 0;
    const sportsCount = profile.sports_skills?.length || 0;
    const leadershipCount = profile.leadership_skills?.length || 0;

    if (techCount >= 3) return { icon: Zap, label: "Tech Enthusiast", color: "from-blue-500 to-purple-600" };
    if (creativeCount >= 2) return { icon: Palette, label: "Creative Mind", color: "from-pink-500 to-rose-600" };
    if (sportsCount >= 2) return { icon: Trophy, label: "Sports Person", color: "from-orange-500 to-red-600" };
    if (leadershipCount >= 2) return { icon: Briefcase, label: "Leader", color: "from-green-500 to-emerald-600" };
    
    return { icon: Zap, label: "Multi-talented", color: "from-[#CAFE33] to-[#B8E62E]" };
  };

  const category = getUserCategory();
  const CategoryIcon = category.icon;

  const handleConnect = async () => {
    if (profile.id) {
      const success = await sendConnectionRequest(profile.id.toString());
      if (success) {
        // Refresh connection status
        const status = await getConnectionStatus(profile.id.toString());
        setConnectionStatus(status);
      }
    }
  };

  const getConnectButtonContent = () => {
    if (checkingStatus) return "Checking...";
    if (loading) return "Sending...";
    
    if (connectionStatus?.type === 'matched') {
      return (
        <>
          <Zap className="h-5 w-5 mr-2" />
          Matched! ✨
        </>
      );
    }
    
    if (connectionStatus?.type === 'sent') {
      return "Request Sent";
    }
    
    if (connectionStatus?.type === 'received') {
      return "Wants to Connect!";
    }
    
    return (
      <>
        <Heart className="h-5 w-5 mr-2" />
        Connect
      </>
    );
  };

  const isConnectButtonDisabled = () => {
    return checkingStatus || loading || 
           connectionStatus?.type === 'sent' || 
           connectionStatus?.type === 'matched';
  };

  // Determine if social links should be visible
  const shouldShowSocials = isMatched || connectionStatus?.type === 'matched';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-auto p-0 bg-black border-[#CAFE33]/50 max-h-[95vh] overflow-hidden rounded-3xl">
        <VisuallyHidden>
          <DialogTitle>User Profile: {profile.full_name || profile.name}</DialogTitle>
        </VisuallyHidden>
        <Card className="bg-black border-none rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header with Gradient */}
            <div className={`relative h-44 bg-gradient-to-br from-[#CAFE33] to-[#30C77B] flex items-center justify-center`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 left-4 z-10 bg-black/40 text-white hover:bg-black/60 rounded-full h-10 w-10 border border-[#CAFE33]/40"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              {profile.matchScore && (
                <div className="absolute top-4 right-4">
                  <div className="bg-[#CAFE33] text-black font-bold text-lg px-5 py-2 rounded-2xl shadow-lg border-2 border-[#B8E62E]/40 animate-fade-in transition-all">
                    {`${Math.round(profile.matchScore < 1 ? profile.matchScore * 100 : profile.matchScore)}% Match ✨`}
                  </div>
                </div>
              )}
              {/* Avatar */}
              <Avatar className="h-28 w-28 border-4 border-[#CAFE33] shadow-2xl ring-4 ring-black/20 absolute -bottom-14 left-1/2 transform -translate-x-1/2">
                <AvatarImage src={profile.avatar_url?.split('?')[0]} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-2xl font-extrabold">
                  {profile.full_name?.split(' ').map((n: string) => n[0]).join('') || profile.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="pt-20 px-5 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">{profile.full_name || profile.name}</h1>
                 {/* Category Badge */}
                 <div className="flex justify-center pt-1 pb-2">
                  <div className={`px-4 py-1 rounded-full flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${category.color} text-white shadow-lg border-2 border-black/20`}>
                    <CategoryIcon className="h-4 w-4 mr-1" />
                    {category.label}
                  </div>
                </div>
                <p className="text-[#CAFE33] font-semibold">{profile.department} • Year {profile.academic_year}</p>
                <div className="flex items-center justify-center gap-4 text-green-300 text-base font-medium">
                  <span>🏫 {profile.college}</span>
                  {profile.place && <span>• 📍 {profile.place}</span>}
                </div>
                {profile.personality_tags && profile.personality_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {profile.personality_tags.map((tag: string, i: number) => (
                      <div key={i} className="px-3 py-1 rounded-full bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-xs font-semibold shadow">{tag}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* About */}
              {profile.about && (
                <div className="bg-[#192613] rounded-xl px-5 py-4 shadow flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#CAFE33] font-bold text-base"><span>💭</span> About</div>
                  <p className="text-green-100 text-base">{profile.about}</p>
                </div>
              )}

              {/* Gender */}
              {profile.gender && (
                <div className="bg-[#121912] rounded-xl px-5 py-4 shadow flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-pink-400 font-bold text-base"><span>👤</span> Gender</div>
                  <span className="px-4 py-1 rounded-full bg-gradient-to-r from-pink-500 to-pink-300 text-black font-semibold w-fit">{profile.gender}</span>
                </div>
              )}

              {/* Looking For */}
              {profile.looking_for && profile.looking_for.length > 0 && (
                <div className="rounded-xl px-5 py-4 shadow bg-[#121912] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-base"><span>🎯</span> Looking For</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.looking_for.map((item: string, index: number) => (
                      <span key={index} className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-300 text-black font-semibold">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Information */}
              {(profile.weekly_availability || profile.time_commitment || profile.meeting_preference) && (
                <div className="rounded-xl px-5 py-4 shadow bg-[#0D1B0D] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-base"><span>⏰</span> Availability</div>
                  <div className="space-y-2">
                    {profile.weekly_availability && (
                      <div>
                        <span className="text-emerald-300 text-sm font-medium">Weekly: </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">{profile.weekly_availability}</span>
                      </div>
                    )}
                    {profile.time_commitment && (
                      <div>
                        <span className="text-emerald-300 text-sm font-medium">Commitment: </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">{profile.time_commitment}</span>
                      </div>
                    )}
                    {profile.meeting_preference && (
                      <div>
                        <span className="text-emerald-300 text-sm font-medium">Meeting: </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">{profile.meeting_preference}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="rounded-xl px-5 py-4 shadow bg-[#171717] flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-base"><span>❤️</span> Interests & Hobbies</div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.slice(0, 12).map((interest: string, index: number) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-gradient-to-br from-orange-300 to-orange-100 text-orange-900 text-xs font-bold shadow">{interest}</span>
                    ))}
                    {profile.interests.length > 12 && (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-br from-orange-300 to-orange-100 text-orange-900 text-xs font-bold shadow">
                        +{profile.interests.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Grid */}
              <div className="grid grid-cols-1 gap-3">
                {profile.tech_skills && profile.tech_skills.length > 0 && (
                  <div className="rounded-xl px-5 py-4 shadow bg-[#0A141A]">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-base"><span>💻</span> Tech Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.tech_skills.slice(0, 12).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-gradient-to-br from-purple-400 to-purple-100 text-purple-900 text-xs font-bold shadow">{skill}</span>
                      ))}
                      {profile.tech_skills.length > 12 && (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-br from-purple-400 to-purple-100 text-purple-900 text-xs font-bold shadow">
                          +{profile.tech_skills.length - 12} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {((profile.creative_skills && profile.creative_skills.length > 0) ||
                  (profile.sports_skills && profile.sports_skills.length > 0) ||
                  (profile.leadership_skills && profile.leadership_skills.length > 0) ||
                  (profile.other_skills && profile.other_skills.length > 0)) && (
                  <div className="rounded-xl px-5 py-4 shadow bg-[#101b13]">
                    <div className="flex items-center gap-2 text-green-400 font-bold text-base"><span>🌟</span> Other Skills</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        ...(profile.creative_skills || []),
                        ...(profile.sports_skills || []),
                        ...(profile.leadership_skills || []),
                        ...(profile.other_skills || [])
                      ].slice(0, 12).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-gradient-to-br from-green-400 to-green-100 text-green-900 text-xs font-bold shadow">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Projects & Achievements Section */}
              {profile.achievements && profile.achievements.length > 0 && (
                <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-[#CAFE33]/30 rounded-3xl mt-6">
                  <div className="flex items-center gap-3 px-6 pt-6">
                    <span className="text-2xl">🚀</span>
                    <span className="text-[#CAFE33] text-xl font-bold">Projects & Achievements</span>
                  </div>
                  <div className="space-y-4 px-6 pb-6 pt-2">
                    {profile.achievements.map((achievement: any, index: number) => (
                      <div 
                        key={achievement.id || index}
                        className="bg-gray-800/50 p-5 rounded-2xl border border-gray-600/50 hover:border-[#CAFE33]/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-2xl group-hover:animate-bounce">💡</div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-2">{achievement.title}</h3>
                            <p className="text-gray-400 mb-3">{achievement.description}</p>
                            {achievement.link && (
                              <div className="flex gap-2">
                                <Badge 
                                  className="bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/30 text-xs cursor-pointer"
                                  onClick={() => window.open(achievement.link, '_blank')}
                                >
                                  View Project
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="rounded-xl px-5 py-4 shadow bg-black/70 border border-[#CAFE33]/10">
                <div className="text-[#CAFE33] font-bold text-base mb-3 flex items-center gap-2">🔗 Social Links</div>
                {shouldShowSocials ? (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors">
                        <Github className="h-4 w-4 text-white" />
                        <span className="text-white text-sm">GitHub</span>
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-lg transition-colors">
                        <Linkedin className="h-4 w-4 text-white" />
                        <span className="text-white text-sm">LinkedIn</span>
                      </a>
                    )}
                    {profile.twitter && (
                      <a href={profile.twitter} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 p-3 rounded-lg transition-colors">
                        <Twitter className="h-4 w-4 text-white" />
                        <span className="text-white text-sm">Twitter</span>
                      </a>
                    )}
                    {profile.personal_website && (
                      <a href={profile.personal_website} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 p-3 rounded-lg transition-colors">
                        <Globe className="h-4 w-4 text-white" />
                        <span className="text-white text-sm">Website</span>
                      </a>
                    )}
                    {profile.instagram && (
                      <a href={profile.instagram} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 rounded-lg transition-colors">
                        <span className="text-white text-sm">📷 Instagram</span>
                      </a>
                    )}
                    {profile.behance && (
                      <a href={profile.behance} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 p-3 rounded-lg transition-colors">
                        <span className="text-white text-sm">🎨 Behance</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center bg-gray-800/50 rounded-lg p-6 border-2 border-dashed border-gray-700">
                    <div className="text-center space-y-2">
                      <Lock className="h-8 w-8 text-gray-500 mx-auto" />
                      <p className="text-[#CAFE33] text-sm font-medium">Social Links Locked 🔒</p>
                      <p className="text-gray-500 text-xs">Connect to unlock social profiles</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {isMatched ? (
                  <>
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => window.location.href = `/chat?user=${profile.id}`}
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Message
                    </Button>
                    {onRemoveMatch && (
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm"
                        onClick={() => { onRemoveMatch(profile.id); onClose(); }}
                      >
                        <Heart className="h-5 w-5 mr-2" />
                        Remove Match
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    onClick={handleConnect}
                    disabled={isConnectButtonDisabled()}
                    className={`flex-1 font-bold py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                      connectionStatus?.type === 'matched' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : connectionStatus?.type === 'sent'
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33]'
                    }`}
                  >
                    {getConnectButtonContent()}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
