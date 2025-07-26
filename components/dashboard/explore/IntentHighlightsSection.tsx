import { Badge } from "@/components/ui/badge";
import HorizontalSection from "./HorizontalSection";

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

const intents = [
  { label: "Hackathon partner", emoji: "💻" },
  { label: "Co-founder", emoji: "🚀" },
  { label: "Project Collaborator", emoji: "🤝" },
  { label: "Study Buddy", emoji: "📚" },
  { label: "Startup team member", emoji: "🎨" },
  { label: "Sports Partner", emoji: "🏋️" },
  { label: "Making friends", emoji: "👋" },
];

interface IntentHighlightsSectionProps {
  users: MatchedUser[];
  selectedIntent: string | null;
  setSelectedIntent: (s: string | null) => void;
  loading: boolean;
  onViewProfile: (user: MatchedUser) => void;
  onConnect: (userId: string) => void;
  connectingUserId: string | null;
  onViewSocialLinks: (user: MatchedUser) => void;
}

const IntentHighlightsSection = ({
  users,
  selectedIntent,
  setSelectedIntent,
  loading,
  onViewProfile,
  onConnect,
  connectingUserId,
  onViewSocialLinks,
}: IntentHighlightsSectionProps) => {
  return (
    <div className="mt-8 pb-8">
      <div className="flex items-center space-x-2 mb-4 px-4">
        <span className="text-xl">🎯</span>
        <h2 className="text-white text-lg font-semibold">Discover by Intent</h2>
      </div>
      <div className="flex flex-wrap gap-2 px-4 mb-4">
        {intents.map((intent) => (
          <Badge
            key={intent.label}
            onClick={() => setSelectedIntent(selectedIntent === intent.label ? null : intent.label)}
            className={`cursor-pointer transition-all border py-1.5 px-3 flex items-center ${
              selectedIntent === intent.label
                ? 'bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black border-transparent font-semibold scale-105 shadow shadow-[#CAFE33]/30'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
            style={{ fontSize: '1rem', gap: '7px' }}
          >
            <span className="mr-1.5 text-base">{intent.emoji}</span>
            {intent.label}
          </Badge>
        ))}
      </div>
      {selectedIntent && (
        <div className="mt-4 animate-fade-in">
          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : (
            <>
              {users.length > 0 ? (
                <HorizontalSection
                  title={`Users looking for "${selectedIntent}"`}
                  emoji={intents.find(i => i.label === selectedIntent)?.emoji}
                  users={users}
                  onViewProfile={onViewProfile}
                  onConnect={onConnect}
                  variant="large"
                  connectingUserId={connectingUserId}
                  onViewSocialLinks={onViewSocialLinks}
                />
              ) : (
                <div className="text-center text-gray-400 py-6 px-4">
                  No one found with this intent yet. Try another one!
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IntentHighlightsSection;
