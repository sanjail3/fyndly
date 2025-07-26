
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Sparkles, X } from "lucide-react";

interface MatchConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    department: string;
    year: string;
    avatar: string;
    interests: string[];
    matchPercentage: number;
    isOnline?: boolean;
  };
  onViewFullProfile: () => void;
}

const MatchConfirmationModal = ({ open, onClose, user, onViewFullProfile }: MatchConfirmationModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0 bg-gradient-to-br from-[#CAFE33]/10 via-gray-900 to-purple-900/20 border-[#CAFE33]/30 rounded-3xl overflow-hidden">
        <Card className="bg-transparent border-none">
          <CardContent className="p-6 text-center space-y-6">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Celebration Header */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <Sparkles className="h-12 w-12 text-[#CAFE33] animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-[#CAFE33] tracking-wide">
                🎉 It's a Match! 🎉
              </h1>
              <p className="text-gray-300">
                You and {user.name} liked each other!
              </p>
            </div>

            {/* User Profile */}
            <div className="space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-[#CAFE33] shadow-2xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] text-black text-xl font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                <p className="text-[#CAFE33] font-semibold">{user.department} • {user.year}</p>
                <p className="text-sm text-gray-400 mt-2">{user.matchPercentage}% compatibility</p>
              </div>

              {/* Interests Preview */}
              <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
                {user.interests.slice(0, 3).map((interest, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-[#CAFE33]/20 text-[#CAFE33] text-xs rounded-full border border-[#CAFE33]/30"
                  >
                    {interest}
                  </span>
                ))}
                {user.interests.length > 3 && (
                  <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                    +{user.interests.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onViewFullProfile}
                className="w-full bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-bold py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Heart className="h-5 w-5 mr-2" />
                View Full Profile
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-[#CAFE33]/50 text-[#CAFE33] hover:bg-[#CAFE33]/10 hover:border-[#CAFE33] py-3 rounded-2xl font-semibold transition-all duration-300"
                onClick={onClose}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Start Conversation
              </Button>
            </div>

            <p className="text-xs text-gray-500">
              🔓 Social links are now unlocked in their profile!
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default MatchConfirmationModal;
