import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProfileFullModal from "../ProfileFullModal";
import { Github, Linkedin, Twitter, Globe, Mail, Eye, Heart, Sparkles, Users, MapPin, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface MatchedUser {
  id: string; // Changed from number to string to match UUID
  name: string;
  department: string;
  year: string;
  avatar: string;
  interests: string[];
  lookingFor: string[];
  bio: string;
  matchPercentage: number;
  location: string;
  projects: string[];
  isOnline: boolean;
  age: number;
  funTags: string[];
  skills: {
    tech: string[];
    personal: string[];
  };
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    email?: string;
  };
}

interface MatchedUsersSectionProps {
  matchedUsers: MatchedUser[];
  onRemoveMatch: (userId: string) => void;
}

const icons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  website: Globe,
  email: Mail,
};

const MatchedUsersSection = ({ matchedUsers, onRemoveMatch }: MatchedUsersSectionProps) => {
  const [selectedUser, setSelectedUser] = useState<MatchedUser | null>(null);
  const router = useRouter();

  console.log('MatchedUsersSection received:', matchedUsers);

  if (!matchedUsers || matchedUsers.length === 0) {
    return (
      <div className="px-4 py-16 text-center text-gray-500">
        <div className="text-5xl mb-2">✨</div>
        <h2 className="text-lg font-semibold mb-1">No matches yet</h2>
        <p className="text-sm">Matched users will show up here once you connect with students!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6 px-4">
          <div className="w-10 h-10 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] bg-clip-text text-transparent">
              Your Matches
            </h2>
            <p className="text-gray-400 text-sm">People who matched with you</p>
          </div>
          <Badge className="bg-[#CAFE33]/20 text-[#CAFE33] border border-[#CAFE33]/30 ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {matchedUsers.length}
          </Badge>
        </div>

        <ScrollArea className="w-full">
          <div className="flex space-x-6 px-4 pb-4">
            {matchedUsers.map((user) => (
              <Card
                key={user.id}
                className="w-80 h-96 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-gray-700/50 hover:border-[#CAFE33]/60 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-[#CAFE33]/20 flex-shrink-0 backdrop-blur-sm relative overflow-hidden"
                onClick={() => setSelectedUser(user)}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#CAFE33]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-6 h-full flex flex-col relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-2 ring-[#CAFE33]/30 group-hover:ring-[#CAFE33]/60 transition-all duration-300 shadow-xl">
                          <AvatarImage src={user.avatar?.split('?')[0]} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black font-bold text-lg">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-800 shadow-lg animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-lg truncate group-hover:text-[#CAFE33] transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-gray-400 text-sm truncate">{user.department}</p>
                        <p className="text-gray-500 text-xs">{user.year}</p>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black font-bold text-sm px-3 py-1 shadow-lg animate-pulse">
                      {user.matchPercentage}% ✨
                    </Badge>
                  </div>
                  {/* Location */}
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400 text-sm truncate">{user.location}</span>
                  </div>
                  {/* Fun Tags */}
                  {user.funTags && user.funTags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {user.funTags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} className="bg-[#CAFE33]/20 text-[#CAFE33] text-xs border border-[#CAFE33]/30">
                            {tag}
                          </Badge>
                        ))}
                        {user.funTags.length > 3 && (
                          <Badge className="bg-gray-700/50 text-gray-400 text-xs border border-gray-600/50">
                            +{user.funTags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Looking For */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 font-medium">🎯 Looking for</p>
                    <div className="flex flex-wrap gap-1">
                      {user.lookingFor.slice(0, 2).map((intent, index) => (
                        <Badge key={index} className="bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">
                          {intent}
                        </Badge>
                      ))}
                      {user.lookingFor.length > 2 && (
                        <Badge className="bg-gray-700/50 text-gray-400 text-xs border border-gray-600/50">
                          +{user.lookingFor.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Social Links */}
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs mb-2 font-medium">🔗 Connect</p>
                    <div className="flex gap-2 justify-center">
                      {user.socials && Object.entries(user.socials).map(([key, val]) => {
                        const Icon = icons[key as keyof typeof icons];
                        if (!val || !Icon) return null;
                        return (
                          <a
                            href={val}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={key}
                            className="w-10 h-10 bg-gradient-to-r from-gray-800 to-gray-900 border border-[#CAFE33]/30 hover:border-[#CAFE33] hover:bg-[#CAFE33]/10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg group/social"
                            onClick={e => e.stopPropagation()}
                            aria-label={key}
                          >
                            <Icon className="h-4 w-4 text-gray-400 group-hover/social:text-[#CAFE33] transition-colors" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#CAFE33]/50 text-[#CAFE33] hover:bg-[#CAFE33]/10 hover:border-[#CAFE33] transition-all duration-300 backdrop-blur-sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to chat page with user id as query param
                        router.push(`/chat?user=${user.id}`);
                      }}
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black hover:from-[#B8E62E] hover:to-[#CAFE33] font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {/* Full Profile Modal for matched user */}
      {selectedUser && (
        <ProfileFullModal
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          profile={selectedUser}
          isMatched={true}
          onRemoveMatch={onRemoveMatch}
          onConnect={() => {}}
        />
      )}
    </>
  );
};

export default MatchedUsersSection;
