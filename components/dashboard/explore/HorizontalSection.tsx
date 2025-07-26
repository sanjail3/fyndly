import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ProfileCard from "./ProfileCard";
import { Button } from "@/components/ui/button";

interface MatchedUser {
  id: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  avatar_url?: string;
  interests: string[];
  tech_skills: string[];
  looking_for: string[];
  matchScore?: number;
  isNewUser?: boolean;
}

interface HorizontalSectionProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  users: MatchedUser[];
  variant?: 'default' | 'large' | 'compact';
  onViewProfile?: (user: MatchedUser) => void;
  onConnect?: (userId: string) => void;
  intentHighlight?: boolean;
  connectingUserId: string | null;
  onViewSocialLinks: (user: any) => void;
}

const HorizontalSection = ({ 
  title, 
  subtitle, 
  emoji, 
  users, 
  variant = 'default',
  onViewProfile,
  onConnect,
  intentHighlight,
  connectingUserId,
  onViewSocialLinks
}: HorizontalSectionProps) => {
  if (users.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
        <div className="flex space-x-4 min-w-[1px]">
          {users.map((user) => (
            <ProfileCard
              key={user.id}
              user={user}
              variant={variant}
              onViewProfile={onViewProfile}
              onConnect={onConnect}
              intentHighlight={intentHighlight}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default HorizontalSection;
