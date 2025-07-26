import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Link2, Github, Linkedin, Instagram, X, MessageCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MatchedUser {
  id: string;
  full_name: string;
  avatar_url?: string;
  looking_for: string[];
  linkedin?: string;
  github?: string;
  instagram?: string;
  matchScore: number;
}

interface MatchedUsersStoryProps {
  matchedUsers: MatchedUser[];
  onViewProfile: (user: MatchedUser) => void;
  onViewSocialLinks: (user: MatchedUser) => void;
  onRemoveMatch?: (userId: string) => void;
}

const MatchedUsersStory = ({
  matchedUsers,
  onViewProfile,
  onViewSocialLinks,
  onRemoveMatch,
}: MatchedUsersStoryProps) => {
  if (!matchedUsers?.length) return null;

  return (
    <div className="pb-4 px-2">
      <div className="flex items-center space-x-2 mb-2 px-2">
        <span className="text-lg">💬</span>
        <h2 className="text-white text-base font-semibold">Matched Users</h2>
        <span className="text-gray-400 text-sm">({matchedUsers.length})</span>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="flex space-x-4 px-2">
          {matchedUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-col items-center group cursor-pointer relative rounded-xl hover:bg-neutral-900/50 transition duration-150 p-2"
              onClick={() => onViewProfile(user)}
              style={{ minWidth: "92px" }}
            >
              {/* Remove button with confirmation modal */}
              {onRemoveMatch && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-white z-20 border-2 border-red-400 shadow-lg"
                      onClick={e => e.stopPropagation()}
                      title="Remove Match"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black border-[#CAFE33]/30 rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#CAFE33] text-lg font-bold">Remove Match?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <div className="text-gray-300 py-2 text-sm">
                      Are you sure you want to remove <span className="text-[#CAFE33] font-semibold">{user.full_name}</span> from your matches? <br />
                      <span className="text-red-400 font-semibold">You will lose the ability to chat.</span>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-gray-800 text-gray-300 border-none hover:bg-gray-700">Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-bold" onClick={() => onRemoveMatch(user.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {/* Avatar with gradient ring effect */}
              <div className="relative mb-2">
                <div className="rounded-full p-1 bg-gradient-to-tr from-[#CAFE33] via-[#B8E62E] to-[#CAFE33] shadow-lg" style={{ boxShadow: '0 0 0 4px #101010, 0 0 12px 2px #CAFE33' }}>
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={user.avatar_url?.split('?')[0]}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-black text-[#CAFE33] font-bold">
                      {user.full_name.split(" ")[0][0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <p className="text-white font-medium text-xs truncate w-20 text-center">{user.full_name?.split(" ")[0]}</p>
              {/* Intent highlight badge */}
              <div className="my-1">
                {user.looking_for && user.looking_for.length > 0 && (
                  <Badge className="bg-gradient-to-r from-blue-700 to-blue-400 text-blue-100 font-normal px-2 text-xs">
                    {user.looking_for[0]}
                  </Badge>
                )}
              </div>
              {/* Actions row - only chat and view profile, styled for green/black theme */}
              <div className="flex gap-2 mt-2 justify-center w-full">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full p-2 border-[#CAFE33] text-[#CAFE33] bg-black hover:bg-[#CAFE33] hover:text-black transition"
                  onClick={e => { e.stopPropagation(); onViewProfile(user); }}
                  title="View Profile"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="rounded-full p-2 border-[#CAFE33] text-[#CAFE33] bg-black hover:bg-[#CAFE33] hover:text-black transition"
                  onClick={e => { e.stopPropagation(); window.location.href = `/chat?user=${user.id}`; }}
                  title="Message"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchedUsersStory;
