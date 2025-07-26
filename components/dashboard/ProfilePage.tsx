import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, MapPin, Edit3, Globe, Github, Linkedin, Twitter, Clock, Users, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProfileEditModal from "./ProfileEditModal";

const ProfilePage = () => {
  const { profile, loading, logout, updateProfile } = useUserProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#CAFE33] mx-auto mb-4" />
          <p className="text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Profile not found</p>
        </div>
      </div>
    );
  }

  const getYearDisplay = (academicYear: number) => {
    const yearMap: { [key: number]: string } = {
      1: "1st Year",
      2: "2nd Year", 
      3: "3rd Year",
      4: "4th Year",
      5: "5th Year+"
    };
    return yearMap[academicYear] || `${academicYear}th Year`;
  };

  const socialLinks = [
    { platform: 'github', url: profile.github, icon: Github },
    { platform: 'linkedin', url: profile.linkedin, icon: Linkedin },
    { platform: 'twitter', url: profile.twitter, icon: Twitter },
    { platform: 'website', url: profile.personal_website, icon: Globe }
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-[#CAFE33]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-10 w-64 h-64 bg-[#CAFE33]/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 right-1/3 w-48 h-48 bg-[#CAFE33]/8 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 p-4 space-y-6 pb-24">
        {/* Modern Hero Profile Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#CAFE33]/30 via-[#CAFE33]/20 to-[#CAFE33]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-[#CAFE33]/30 rounded-3xl overflow-hidden shadow-2xl">
            <div className="h-32 bg-gradient-to-r from-[#CAFE33]/40 via-[#CAFE33]/30 to-[#CAFE33]/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23CAFE33\\' fill-opacity=\\'0.1\\'%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
              <div className="absolute top-4 right-4">
                <Button 
                  size="icon" 
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
       
            <CardContent className="px-6 pb-6 -mt-16">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 border-4 border-[#CAFE33]/40 shadow-2xl mb-4 hover:scale-105 transition-transform duration-300">
                  <AvatarImage src={profile.avatar_url?.split('?')[0]} />
                  <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-2xl font-bold">
                    {profile.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2 mb-4">
                  <h1 className="text-3xl font-bold text-[#CAFE33]">{profile.full_name}</h1>
                  <p className="text-[#CAFE33] font-semibold">{profile.department} • {getYearDisplay(profile.academic_year)}</p>
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.college}</span>
                  </div>
                </div>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex gap-3 mb-4">
                    {socialLinks.map(({ platform, url, icon: Icon }) => (
                      <Button 
                        key={platform}
                        size="icon" 
                        variant="outline" 
                        className="rounded-full border-gray-600 hover:border-[#CAFE33] hover:bg-[#CAFE33]/20 hover:text-[#CAFE33] transition-all duration-300 hover:scale-110"
                        onClick={() => window.open(url, '_blank')}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                )}

                {/* Looking For Tags */}
                {profile.looking_for && profile.looking_for.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.looking_for.map((item, index) => (
                      <Badge 
                        key={index} 
                        className="bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/40 px-3 py-1 rounded-full font-medium"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        {profile.about && (
          <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-[#CAFE33]/30 rounded-3xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">💭</span>
                <h2 className="text-xl font-bold text-[#CAFE33]">About Me</h2>
              </div>
              <p className="text-gray-300 leading-relaxed">{profile.about}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gray-800/50 border-[#CAFE33]/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-[#CAFE33]" />
                <span className="text-2xl">⏰</span>
              </div>
              <div className="text-sm font-bold text-[#CAFE33]">{profile.weekly_availability || "Not specified"}</div>
              <div className="text-xs text-gray-400">Weekly Availability</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-[#CAFE33]/20 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-5 w-5 text-[#CAFE33]" />
                <span className="text-2xl">🤝</span>
              </div>
              <div className="text-sm font-bold text-[#CAFE33]">{profile.meeting_preference || "Flexible"}</div>
              <div className="text-xs text-gray-400">Meeting Style</div>
            </CardContent>
          </Card>
        </div>

        {/* Skills & Interests Tabs */}
        <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-[#CAFE33]/30 rounded-3xl">
          <CardContent className="p-6">
            <Tabs defaultValue="interests" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-[#CAFE33]/20 rounded-2xl p-1">
                <TabsTrigger value="interests" className="data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black text-[#CAFE33] rounded-xl font-medium">
                  🎯 Interests
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black text-[#CAFE33] rounded-xl font-medium">
                  ⚡ Skills
                </TabsTrigger>
                <TabsTrigger value="vibe" className="data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black text-[#CAFE33] rounded-xl font-medium">
                  😄 Vibe
                </TabsTrigger>
              </TabsList>

              <TabsContent value="interests" className="mt-6">
                <div className="flex flex-wrap gap-3">
                  {profile.interests?.map((interest, index) => (
                    <Badge 
                      key={index}
                      className="bg-blue-600/20 text-blue-400 border-blue-600/30 px-3 py-2 rounded-full hover:scale-105 transition-transform"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <div className="space-y-4">
                  {profile.tech_skills && profile.tech_skills.length > 0 && (
                    <div>
                      <h4 className="text-[#CAFE33] text-sm font-medium mb-3 flex items-center gap-2">
                        <span className="text-lg">💻</span> Tech Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.tech_skills.map((skill, index) => (
                          <Badge 
                            key={index}
                            className="bg-purple-600/20 text-purple-400 border-purple-600/30 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.creative_skills && profile.creative_skills.length > 0 && (
                    <div>
                      <h4 className="text-[#CAFE33] text-sm font-medium mb-3 flex items-center gap-2">
                        <span className="text-lg">🎨</span> Creative Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.creative_skills.map((skill, index) => (
                          <Badge 
                            key={index}
                            className="bg-pink-600/20 text-pink-400 border-pink-600/30 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.leadership_skills && profile.leadership_skills.length > 0 && (
                    <div>
                      <h4 className="text-[#CAFE33] text-sm font-medium mb-3 flex items-center gap-2">
                        <span className="text-lg">👥</span> Leadership Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.leadership_skills.map((skill, index) => (
                          <Badge 
                            key={index}
                            className="bg-green-600/20 text-green-400 border-green-600/30 px-3 py-1 rounded-full"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="vibe" className="mt-6">
                <div className="flex flex-wrap gap-3">
                  {profile.personality_tags?.map((tag, index) => (
                    <Badge 
                      key={index}
                      className="bg-pink-600/20 text-pink-400 border-pink-600/30 px-3 py-2 rounded-full hover:scale-105 transition-transform"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Projects Section */}
        {profile.achievements && profile.achievements.length > 0 && (
          <Card className="bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-xl border-[#CAFE33]/30 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-[#CAFE33] flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                Projects & Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.achievements.map((achievement, index) => (
                <div 
                  key={achievement.id}
                  className="bg-gray-800/50 p-5 rounded-2xl border border-gray-600/50 hover:border-[#CAFE33]/50 transition-all duration-300 hover:scale-105 group cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl group-hover:animate-bounce">💡</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#CAFE33] text-lg mb-2">{achievement.title}</h3>
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
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-bold text-lg py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit3 className="h-5 w-5 mr-3" />
            <span className="text-xl mr-2">✏️</span>
            Edit Profile
          </Button>
          
          <Button 
            variant="outline"
            onClick={logout}
            className="w-full border-red-600/50 text-red-400 hover:bg-red-600/20 hover:text-red-300 hover:border-red-500/70 py-6 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span className="text-xl mr-2">👋</span>
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onUpdate={updateProfile}
      />
    </div>
  );
};

export default ProfilePage;
