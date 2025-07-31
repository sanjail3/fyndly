import { User, Eye, Heart, Linkedin, Twitter, Globe, Instagram, Image, MapPin, Briefcase, Palette, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import FormattedMessage from './FormattedMessage';
import { ChatMessage } from './types';
import { useState } from 'react';
import React from 'react'; // Added missing import for React

interface ChatBubbleProps {
  message: ChatMessage;
  toggleSuggestion: (suggestion: any) => void;
  selectedSuggestions: string[];
  handleBulkSelectSuggestions: (suggestions: any[]) => void;
  userIcon: string | null;
}

const ChatBubble = ({
  message,
  toggleSuggestion,
  selectedSuggestions,
  handleBulkSelectSuggestions,
  userIcon
}: ChatBubbleProps) => {
  const [openProfileDialog, setOpenProfileDialog] = useState<any | null>(null);

  const handleConnect = (friend: any) => {
    // TODO: Integrate with backend connection request
    alert(`Connect request sent to ${friend.full_name}`);
  };

  const handleViewProfile = (friend: any) => {
    setOpenProfileDialog(friend);
  };

  const getUserCategory = (friend: any) => {
    const techCount = friend.tech_skills?.length || 0;
    const creativeCount = friend.creative_skills?.length || 0;
    const sportsCount = friend.sports_skills?.length || 0;
    const leadershipCount = friend.leadership_skills?.length || 0;

    if (techCount >= 3) return { icon: Palette, label: "Tech", color: "from-blue-500 to-purple-600", bg: "bg-blue-500/10" };
    if (creativeCount >= 2) return { icon: Palette, label: "Creative", color: "from-pink-500 to-rose-600", bg: "bg-pink-500/10" };
    if (sportsCount >= 2) return { icon: Trophy, label: "Sports", color: "from-orange-500 to-red-600", bg: "bg-orange-500/10" };
    if (leadershipCount >= 2) return { icon: Briefcase, label: "Leader", color: "from-green-500 to-emerald-600", bg: "bg-green-500/10" };

    return { icon: Palette, label: "Multi", color: "from-[#CAFE33] to-[#B8E62E]", bg: "bg-[#CAFE33]/10" };
  };

  return (
    <div
      className={`flex items-start space-x-4 max-w-[90%] sm:max-w-[85%] ${
        message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      <div
        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
          message.type === "user"
            ? "bg-[#C5F631] text-gray-950"
            : "bg-gray-800 text-[#C5F631]"
        }`}
      >
        {message.type === "user" ? (
          <button className="focus:outline-none w-full h-full flex items-center justify-center">
            {userIcon ? (
              <img src={userIcon} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 sm:w-8 sm:h-8" />
            )}
          </button>
        ) : (
          <img src="/bot-icon.png" alt="Bot" className="w-full h-full object-cover" />
        )}
      </div>

      <div
        className={`space-y-4 ${
          message.type === "user"
            ? "bg-[#C5F631] text-gray-950"
            : "bg-gray-900"
        } rounded-2xl p-4 sm:p-6 shadow-lg w-full`}
      >
        {message.type === "user" || !message.isFormatted ? (
          <p className={message.type === "user" ? "text-gray-900" : "text-gray-200"}>
            {typeof message.content === 'string' ? message.content : message.content.prompt}
          </p>
        ) : (
          <div className={message.type === "user" ? "text-gray-900" : "text-gray-800 formatted-content"}>
            <FormattedMessage content={typeof message.content === 'string' ? message.content : message.content.prompt} />
          </div>
        )}

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-6 space-y-6 w-full overflow-hidden">
            {/* Bulk Select Button */}
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                onClick={() => handleBulkSelectSuggestions(message.suggestions!)}
                className="bg-gradient-to-r from-[#8EC01D] to-[#C5F631] text-gray-950 border-none hover:from-[#7AA018] hover:to-[#A3D224] shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                Bulk Select
              </Button>
            </div>
            {/* Suggestions List - Single Column */}
            <div className="space-y-6">
              {message.suggestions.map((friend, j) => {
                const category = getUserCategory(friend);
                const CategoryIcon = category.icon;

                return (
                  <Card
                    key={j}
                    className="p-4 sm:p-5 relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full"
                    style={{ boxShadow: "0 10px 30px -15px rgba(0, 255, 0, 0.1)" }}
                  >
                    {/* Similarity Score Badge */}
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex items-center backdrop-blur-md bg-gray-700/80 border border-[#8EC01D] rounded-full px-2 sm:px-3 py-1 sm:py-1.5 z-10 shadow-lg">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full mr-1 sm:mr-2" style={{
                        backgroundColor: friend.similarity > 0.8 ? '#C5F631' :
                                       friend.similarity > 0.6 ? '#8EC01D' :
                                       friend.similarity > 0.4 ? '#5A8012' : '#DC2626'
                      }}></div>
                      <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#C5F631] to-[#8EC01D] bg-clip-text text-transparent">
                        {friend.matchScore !== undefined ? `${friend.matchScore}% Match` : 'N/A Match'}
                      </span>
                    </div>
                    {/* Add/Remove Button */}
                    <button
                      onClick={() => toggleSuggestion(friend)}
                      className="absolute top-12 sm:top-16 right-3 sm:right-4 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10 group"
                      style={{
                        transform: selectedSuggestions.includes(friend.id || friend.full_name) ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {selectedSuggestions.includes(friend.id || friend.full_name) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#C5F631] group-hover:scale-110 transition-transform"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-400 group-hover:rotate-90 transition-transform"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      )}
                    </button>
                    {/* Main Content */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 pt-10 sm:pt-0">
                      {/* Profile Image with Gradient Border */}
                      <div className="relative mx-auto sm:mx-0">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C5F631] via-[#8EC01D] to-[#5A8012] blur-sm opacity-80"></div>
                        <img
                          src={friend.avatar_url || "/api/placeholder/120/120"}
                          alt={friend.full_name}
                          className="relative w-16 h-16 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-gray-900"
                        />
                         {/* Category Icon */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center shadow-lg`}>
                          <CategoryIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      {/* Friend Details */}
                      <div className="flex-1">
                        <div className="flex flex-col gap-2">
                          <div className="text-center sm:text-left">
                            <h4 className="text-xl sm:text-2xl font-bold text-gray-100 mb-1">
                              {friend.full_name}
                            </h4>
                            <div className="flex items-center justify-center sm:justify-start gap-1">
                              <p className="bg-gradient-to-r from-[#C5F631] to-[#8EC01D] bg-clip-text text-transparent font-semibold text-sm sm:text-base">
                                {friend.college} {friend.department && `| ${friend.department}`}
                              </p>
                            </div>
                            {friend.academic_year && (
                              <div className="flex items-center justify-center sm:justify-start text-gray-400 text-xs sm:text-sm mt-2">
                                <span>Year: {friend.academic_year}</span>
                              </div>
                            )}
                          </div>
                          {/* Looking For */}
                          {friend.looking_for && friend.looking_for.length > 0 && (
                            <div className="mt-2">
                              <p className="text-gray-400 text-xs mb-1">🎯 Looking for</p>
                              <div className="flex flex-wrap gap-1">
                                {friend.looking_for.slice(0, 2).map((item: string, idx: number) => (
                                  <Badge key={idx} className="bg-gradient-to-r from-[#CAFE33]/20 to-[#B8E62E]/20 text-[#CAFE33] text-xs border border-[#CAFE33]/30">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Top Skills */}
                          {(friend.tech_skills && friend.tech_skills.length > 0) ||
                           (friend.creative_skills && friend.creative_skills.length > 0) ||
                           (friend.sports_skills && friend.sports_skills.length > 0) ||
                           (friend.leadership_skills && friend.leadership_skills.length > 0) ||
                           (friend.other_skills && friend.other_skills.length > 0) ? (
                            <div className="mt-2">
                              <p className="text-gray-400 text-xs mb-1">🚀 Top Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {friend.tech_skills?.slice(0, 2).map((skill: string, index: number) => (
                                  <Badge key={index} className="bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                                {friend.creative_skills?.slice(0, 1).map((skill: string, index: number) => (
                                  <Badge key={`creative-${index}`} className="bg-pink-500/20 text-pink-300 text-xs border border-pink-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                                {((friend.tech_skills?.length || 0) + (friend.creative_skills?.length || 0) +
                                  (friend.sports_skills?.length || 0) + (friend.leadership_skills?.length || 0) +
                                  (friend.other_skills?.length || 0)) > 3 && (
                                  <Badge className="bg-gray-700/50 text-gray-400 text-xs border border-gray-600/50">
                                    +{((friend.tech_skills?.length || 0) + (friend.creative_skills?.length || 0) +
                                      (friend.sports_skills?.length || 0) + (friend.leadership_skills?.length || 0) +
                                      (friend.other_skills?.length || 0)) - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : null}
                          {/* Interests */}
                          {friend.interests && friend.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {friend.interests.map((interest: string, idx: number) => (
                                <Badge key={idx} className="bg-[#C5F631] text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          )}
                           {/* Personality Tags */}
                           {friend.personality_tags && friend.personality_tags.length > 0 && (
                            <div className="mt-2">
                              <p className="text-gray-400 text-xs mb-1">✨ Personality</p>
                              <div className="flex flex-wrap gap-1">
                                {friend.personality_tags.map((tag: string, idx: number) => (
                                  <Badge key={idx} className="bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                        {/* Actions */}
                        <div className="mt-4 sm:mt-5 flex space-x-2">
                          <Button
                            onClick={() => handleViewProfile(friend)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-gray-600/70 text-gray-300 hover:bg-gray-700/50 hover:border-[#CAFE33]/50 hover:text-[#CAFE33] transition-all duration-300 backdrop-blur-sm bg-gray-800/40"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button
                            onClick={() => handleConnect(friend)}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Dialog open={!!openProfileDialog} onOpenChange={() => setOpenProfileDialog(null)}>
              {openProfileDialog && (
                <DialogContent className="sm:max-w-[600px] rounded-xl border-0 shadow-2xl bg-gray-900 text-white p-6 overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-[#C5F631] to-[#8EC01D] bg-clip-text text-transparent mb-4">
                      {openProfileDialog.full_name}'s Profile
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 border-b border-gray-700 pb-4 mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#C5F631] via-[#8EC01D] to-[#5A8012] blur-sm opacity-80"></div>
                      <img
                        src={openProfileDialog.avatar_url || "/api/placeholder/120/120"}
                        alt={openProfileDialog.full_name}
                        className="relative w-24 h-24 rounded-2xl object-cover border-2 border-gray-900"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${getUserCategory(openProfileDialog).color} flex items-center justify-center shadow-lg`}>
                        {React.createElement(getUserCategory(openProfileDialog).icon, { className: "h-3 w-3 text-white" })}
                      </div>
                    </div>
                    <p className="text-lg text-gray-300">{openProfileDialog.college} | {openProfileDialog.department} | Year {openProfileDialog.academic_year}</p>
                    {openProfileDialog.place && <p className="text-gray-400"><MapPin className="inline-block w-4 h-4 mr-1 text-[#C5F631]" /> {openProfileDialog.place}</p>}
                  </div>

                  <div className="space-y-5">
                    {openProfileDialog.about && (
                      <div>
                        <h3 className="font-bold text-lg text-[#C5F631] mb-2">About Me</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{openProfileDialog.about}</p>
                      </div>
                    )}

                    {(openProfileDialog.interests && openProfileDialog.interests.length > 0) && (
                      <div>
                        <h3 className="font-bold text-lg text-[#C5F631] mb-2">Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {openProfileDialog.interests.map((interest: string, idx: number) => (
                            <Badge key={idx} className="bg-[#C5F631] text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(openProfileDialog.tech_skills && openProfileDialog.tech_skills.length > 0) ||
                     (openProfileDialog.creative_skills && openProfileDialog.creative_skills.length > 0) ||
                     (openProfileDialog.sports_skills && openProfileDialog.sports_skills.length > 0) ||
                     (openProfileDialog.leadership_skills && openProfileDialog.leadership_skills.length > 0) ||
                     (openProfileDialog.other_skills && openProfileDialog.other_skills.length > 0) ? (
                      <div>
                        <h3 className="font-bold text-lg text-[#C5F631] mb-2">Skills</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {openProfileDialog.tech_skills && openProfileDialog.tech_skills.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Tech</p>
                              <div className="flex flex-wrap gap-1">
                                {openProfileDialog.tech_skills.map((skill: string, idx: number) => (
                                  <Badge key={idx} className="bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                           {openProfileDialog.creative_skills && openProfileDialog.creative_skills.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Creative</p>
                              <div className="flex flex-wrap gap-1">
                                {openProfileDialog.creative_skills.map((skill: string, idx: number) => (
                                  <Badge key={idx} className="bg-pink-500/20 text-pink-300 text-xs border border-pink-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                           {openProfileDialog.sports_skills && openProfileDialog.sports_skills.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Sports</p>
                              <div className="flex flex-wrap gap-1">
                                {openProfileDialog.sports_skills.map((skill: string, idx: number) => (
                                  <Badge key={idx} className="bg-orange-500/20 text-orange-300 text-xs border border-orange-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                           {openProfileDialog.leadership_skills && openProfileDialog.leadership_skills.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Leadership</p>
                              <div className="flex flex-wrap gap-1">
                                {openProfileDialog.leadership_skills.map((skill: string, idx: number) => (
                                  <Badge key={idx} className="bg-green-500/20 text-green-300 text-xs border border-green-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                           {openProfileDialog.other_skills && openProfileDialog.other_skills.length > 0 && (
                            <div>
                              <p className="text-gray-400 text-sm mb-1">Other</p>
                              <div className="flex flex-wrap gap-1">
                                {openProfileDialog.other_skills.map((skill: string, idx: number) => (
                                  <Badge key={idx} className="bg-gray-500/20 text-gray-300 text-xs border border-gray-500/30">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {(openProfileDialog.looking_for && openProfileDialog.looking_for.length > 0) && (
                      <div>
                        <h3 className="font-bold text-lg text-[#C5F631] mb-2">Looking For</h3>
                        <div className="flex flex-wrap gap-2">
                          {openProfileDialog.looking_for.map((item: string, idx: number) => (
                            <Badge key={idx} className="bg-gradient-to-r from-[#CAFE33]/20 to-[#B8E62E]/20 text-[#CAFE33] text-xs border border-[#CAFE33]/30">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                     {openProfileDialog.personality_tags && openProfileDialog.personality_tags.length > 0 && (
                      <div>
                        <h3 className="font-bold text-lg text-[#C5F631] mb-2">Personality Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {openProfileDialog.personality_tags.map((tag: string, idx: number) => (
                            <Badge key={idx} className="bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(openProfileDialog.github || openProfileDialog.linkedin || openProfileDialog.twitter ||
                      openProfileDialog.personal_website || openProfileDialog.instagram || openProfileDialog.behance) && (
                      <div>
                        <h3 className="font-bold text-lg text-[#C5F631] mb-2">Social Links</h3>
                        <div className="flex flex-wrap gap-3">
                          {openProfileDialog.github && (
                            <a href={openProfileDialog.github.startsWith('http') ? openProfileDialog.github : `https://github.com/${openProfileDialog.github}`}
                               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-[#C5F631] transition-colors">
                              <Linkedin className="w-5 h-5" /> GitHub
                            </a>
                          )}
                           {openProfileDialog.linkedin && (
                            <a href={openProfileDialog.linkedin.startsWith('http') ? openProfileDialog.linkedin : `https://linkedin.com/in/${openProfileDialog.linkedin}`}
                               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-[#C5F631] transition-colors">
                              <Linkedin className="w-5 h-5" /> LinkedIn
                            </a>
                          )}
                           {openProfileDialog.twitter && (
                            <a href={openProfileDialog.twitter.startsWith('http') ? openProfileDialog.twitter : `https://twitter.com/${openProfileDialog.twitter}`}
                               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-[#C5F631] transition-colors">
                              <Twitter className="w-5 h-5" /> Twitter
                            </a>
                          )}
                           {openProfileDialog.personal_website && (
                            <a href={openProfileDialog.personal_website.startsWith('http') ? openProfileDialog.personal_website : `https://${openProfileDialog.personal_website}`}
                               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-[#C5F631] transition-colors">
                              <Globe className="w-5 h-5" /> Website
                            </a>
                          )}
                           {openProfileDialog.instagram && (
                            <a href={openProfileDialog.instagram.startsWith('http') ? openProfileDialog.instagram : `https://instagram.com/${openProfileDialog.instagram}`}
                               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-[#C5F631] transition-colors">
                              <Instagram className="w-5 h-5" /> Instagram
                            </a>
                          )}
                           {openProfileDialog.behance && (
                            <a href={openProfileDialog.behance.startsWith('http') ? openProfileDialog.behance : `https://www.behance.net/${openProfileDialog.behance}`}
                               target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-300 hover:text-[#C5F631] transition-colors">
                              <Image className="w-5 h-5" /> Behance
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={() => handleConnect(openProfileDialog)}
                      size="lg"
                      className="w-full max-w-sm bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Connect with {openProfileDialog.full_name}
                    </Button>
                  </div>
                </DialogContent>
              )}
            </Dialog>
          </div>
        )}

        {message.quickReplies && (
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            {message.quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                className="bg-white hover:bg-purple-50 text-gray-700 border-purple-200 text-xs sm:text-sm"
                onClick={() => {
                  // Since we can't access setInput directly here, this is a placeholder
                  // We'll handle the actual implementation in the parent component
                  console.log("Quick reply selected:", reply);
                }}
              >
                {reply}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble; 