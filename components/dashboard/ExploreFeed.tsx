import { useState, useEffect } from "react";
import { useMatchingAlgorithm, useExploreQueue } from "@/hooks/useMatchingAlgorithm";
import { useToast } from "@/hooks/use-toast";
import { useConnectionsContext } from "@/components/ConnectionsProvider";
import SearchSection from "./explore/SearchSection";
import HorizontalSection from "./explore/HorizontalSection";
import ProfileFullModal from "./ProfileFullModal";
import { Button } from "@/components/ui/button";
import MatchedUsersStory from "./explore/MatchedUsersStory";
import IntentHighlightsSection from "./explore/IntentHighlightsSection";
import RecommendationsSection from "./explore/RecommendationsSection";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ExploreFeed = () => {
  const {
    perfectMatches,
    hotMatches,
    collegeMatches,
    recommendedMatches,
    filteredResults,
    loading,
    filters,
    applyFilters,
    refetch,
    matchedUsers
  } = useMatchingAlgorithm();

  const { queue: exploreQueue, loading: exploreLoading, refetch: refetchExploreQueue } = useExploreQueue();

  const { sendConnectionRequest, matches, removeMatch } = useConnectionsContext();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewingMatchedProfile, setIsViewingMatchedProfile] = useState(false);
  const [viewSocialLinksUserId, setViewSocialLinksUserId] = useState<string | null>(null);
  const [connectingUserId, setConnectingUserId] = useState<string | null>(null);
  const [selectedIntentHighlight, setSelectedIntentHighlight] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filter state
  const [filter, setFilter] = useState({
    college: "",
    academicYear: "",
    department: "",
    intent: [] as string[],
    availability: "",
    personalityTags: [] as string[],
    skills: [] as string[],
    searchQuery: "",
  });

  const isFiltered = !!(
    filter.college ||
    filter.academicYear ||
    filter.department ||
    filter.intent.length > 0 ||
    filter.availability ||
    filter.personalityTags.length > 0 ||
    filter.skills.length > 0 ||
    filter.searchQuery
  );

  const handleFilterChange = (field: string, value: any) => {
    setFilter(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchChange = (query: string) => {
    setFilter(prev => ({
      ...prev,
      searchQuery: query,
    }));
  };

  const handleApplyFilters = () => {
    applyFilters({
      college: filter.college || undefined,
      academic_year: filter.academicYear || undefined,
      department: filter.department || undefined,
      intent: filter.intent.length ? filter.intent : undefined,
      availability: filter.availability || undefined,
      personality: filter.personalityTags.length ? filter.personalityTags : undefined,
      tech_skills: filter.skills.length ? filter.skills : undefined,
      search: filter.searchQuery || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilter({
      college: "",
      academicYear: "",
      department: "",
      intent: [],
      availability: "",
      personalityTags: [],
      skills: [],
      searchQuery: "",
    });
    applyFilters({});
  };

  // Auto-apply filters when search query changes (with debouncing)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isFiltered) {
        handleApplyFilters();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filter.searchQuery, filter.college, filter.academicYear, filter.department, filter.intent, filter.availability, filter.personalityTags, filter.skills]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  const handleViewProfile = async (user: any) => {
    if (!currentUserId || !user?.id) {
      console.error("handleViewProfile called with invalid user object:", user);
      return;
    }
    try {
      const response = await fetch(`/api/user/profile?userId=${user.id}&viewerId=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const profile = await response.json();
      setSelectedUser({ ...profile, avatar_url: profile.avatar_url || user.avatar_url || "/placeholder.svg" });
      setIsViewingMatchedProfile(profile.isMatched);
    } catch (error) {
      console.error('Error viewing profile:', error);
    }
  };

  const handleViewSocialLinks = (user: any) => {
    setViewSocialLinksUserId(user.id);
    setSelectedUser(user);
  };

  const handleConnect = async (userId: string) => {
    setConnectingUserId(userId);
    await sendConnectionRequest(userId);
    setConnectingUserId(null);
  };

  const [localMatchedUsers, setLocalMatchedUsers] = useState<any[]>([]);

  // Fetch matched users from the new endpoint on mount
  useEffect(() => {
    const fetchMatchedUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const response = await fetch(`/api/matching/matched-users?userId=${user.id}`);
      if (!response.ok) return;
      const data = await response.json();
      // Ensure matchScore and avatar_url are present for MatchedUsersStory (default to 100 and placeholder if not available)
      const users = (data.matchedUsers || []).map((u: any) => ({
        ...u,
        matchScore: u.matchScore ?? 100,
        avatar_url: u.avatar_url || "/placeholder.svg",
      }));
      setLocalMatchedUsers(users);
    };
    fetchMatchedUsers();
  }, []);

  // Remove match logic remains the same
  const handleRemoveMatch = async (userId: string) => {
    setLocalMatchedUsers(prev => prev.filter(u => u.id !== userId));
    const success = await removeMatch(userId);
    if (!success) {
      // If failed, refetch to restore
      // Optionally re-fetch matched users from the endpoint
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const response = await fetch(`/api/matching/matched-users?userId=${user.id}`);
      if (!response.ok) return;
      const data = await response.json();
      const users = (data.matchedUsers || []).map((u: any) => ({
        ...u,
        matchScore: u.matchScore ?? 100,
      }));
      setLocalMatchedUsers(users);
    }
  };

  const { toast } = useToast();

  // Ensure Perfect Matches always shows top 5 similar profiles
  const getPerfectMatchesForDisplay = () => {
    if (perfectMatches.length >= 5) return perfectMatches;
    
    // If we don't have enough perfect matches, fill with other high-scoring users
    const allOtherUsers = [
      ...hotMatches,
      ...collegeMatches,
      ...recommendedMatches,
    ];
    
    // Remove duplicates and sort by match score
    const uniqueUsers = Array.from(
      new Map(allOtherUsers.map(u => [u.id, u])).values()
    ).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    const combinedMatches = [...perfectMatches, ...uniqueUsers];
    return combinedMatches.slice(0, 5);
  };

  // Use exploreQueue for default feed, useMatchingAlgorithm for filtered
  const useFiltered = isFiltered;
  console.log(exploreQueue)
  const displayPerfectMatches = useFiltered
    ? getPerfectMatchesForDisplay()
    : (exploreQueue.PERFECT_MATCH || []);
  const showPerfect = displayPerfectMatches.length > 0;
  const showHot = useFiltered ? hotMatches.length > 0 : (exploreQueue.HOT_MATCH || []).length > 0;

  const showCollege = useFiltered ? collegeMatches.length > 0 : (exploreQueue.COLLEGE_TOP || []).length > 0;
  console.log(showCollege)
  console.log(exploreQueue.COLLEGE_TOP)
  const showRecommended = useFiltered ? recommendedMatches.length > 0 : (exploreQueue.RECOMMENDED || []).length > 0;

  const allRankedUsers = useFiltered
    ? [
        ...perfectMatches,
        ...hotMatches,
        ...collegeMatches,
        ...recommendedMatches,
      ]
    : [
        ...(exploreQueue.PERFECT_MATCH || []),
        ...(exploreQueue.HOT_MATCH || []),
        ...(exploreQueue.COLLEGE_TOP || []),
        ...(exploreQueue.RECOMMENDED || []),
      ];
  const uniqueRankedUsers = Array.from(new Map(allRankedUsers.map(u => [u.id, u])).values());
  const intentFilteredUsers = selectedIntentHighlight
    ? uniqueRankedUsers.filter(u => u.looking_for?.includes(selectedIntentHighlight))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <img
            src="/icon.png"
            alt="Fyndly Logo"
            className="w-16 h-16 animate-spin-slow rounded-2xl shadow-xl"
            style={{ animation: 'spin 1.2s linear infinite' }}
          />
          <p className="text-gray-400">Finding your perfect matches...</p>
        </div>
        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin 1.2s linear infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Back Button when filtered - Fixed mobile positioning */}
      {isFiltered && (
        <div className="fixed top-4 left-4 z-50 md:top-6 md:left-6">
          <Button
            onClick={handleClearFilters}
            className="bg-gradient-to-r from-[#CAFE33] to-[#B8E62E] text-black rounded-full w-10 h-10 md:w-12 md:h-12 p-0 shadow-lg hover:scale-110 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      )}

      {/* Modern Search Section - Add padding to avoid collision */}
      <div className={`py-4 ${isFiltered ? 'pt-16 md:pt-4' : ''}`}>
        <SearchSection
          college={filter.college}
          setCollege={value => handleFilterChange("college", value)}
          academicYear={filter.academicYear}
          setAcademicYear={value => handleFilterChange("academicYear", value)}
          department={filter.department}
          setDepartment={value => handleFilterChange("department", value)}
          intent={filter.intent}
          setIntent={value => handleFilterChange("intent", value)}
          availability={filter.availability}
          setAvailability={value => handleFilterChange("availability", value)}
          personalityTags={filter.personalityTags}
          setPersonalityTags={value => handleFilterChange("personalityTags", value)}
          skills={filter.skills}
          setSkills={value => handleFilterChange("skills", value)}
          onApplyFilters={handleApplyFilters}
          searchQuery={filter.searchQuery}
          onSearchChange={handleSearchChange}
          disableAutoSearch
        />
      </div>

      {/* Matched Users Story - only show when not filtered */}
      {!isFiltered && localMatchedUsers && localMatchedUsers.length > 0 && (
        <MatchedUsersStory
          matchedUsers={localMatchedUsers}
          onViewProfile={handleViewProfile}
          onViewSocialLinks={handleViewSocialLinks}
          onRemoveMatch={handleRemoveMatch}
        />
      )}

      {/* Content Sections */}
      {isFiltered ? (
        filteredResults.length > 0 ? (
          <div className="mt-8">
          <HorizontalSection
            title="Filtered Results"
              emoji="🔍"
            users={filteredResults}
            variant="large"
            onViewProfile={handleViewProfile}
            onConnect={handleConnect}
            intentHighlight
              connectingUserId={connectingUserId}
              onViewSocialLinks={handleViewSocialLinks}
          />
          </div>
        ) : (
          <div className="text-gray-400 text-center mt-12">
            <div className="flex flex-col items-center space-y-4">
              <span className="text-6xl">🔍</span>
              <h3 className="text-xl font-semibold">No matches found</h3>
              <p className="text-sm">Try adjusting your filters to find more people</p>
            </div>
          </div>
        )
      ) : (
        <>
          {showPerfect && (
            <HorizontalSection
              title="✨ Perfect Matches"
              subtitle="Curated based on your interests and goals"
              users={displayPerfectMatches}
              onViewProfile={handleViewProfile}
              onConnect={handleConnect}
              connectingUserId={connectingUserId}
              onViewSocialLinks={handleViewSocialLinks}
            />
          )}
          {showHot && (
            <HorizontalSection
              title="🔥 Hot Streaks"
              subtitle="Trending profiles on the platform"
              users={useFiltered ? hotMatches : (exploreQueue.HOT_MATCH || [])}
              onViewProfile={handleViewProfile}
              onConnect={handleConnect}
              connectingUserId={connectingUserId}
              onViewSocialLinks={handleViewSocialLinks}
            />
          )}
          {showCollege && (
            <HorizontalSection
              title="🎓 College Connections"
              subtitle="Fellow students from your college"
              users={useFiltered ? collegeMatches : (exploreQueue.COLLEGE_TOP || [])}
              onViewProfile={handleViewProfile}
              onConnect={handleConnect}
              connectingUserId={connectingUserId}
              onViewSocialLinks={handleViewSocialLinks}
            />
          )}
          {showRecommended && (
            <HorizontalSection
              title="👋 Recommended For You"
              subtitle="Hand-picked profiles you might like"
              users={useFiltered ? recommendedMatches : (exploreQueue.RECOMMENDED || [])}
              onViewProfile={handleViewProfile}
              onConnect={handleConnect}
              connectingUserId={connectingUserId}
              onViewSocialLinks={handleViewSocialLinks}
            />
          )}
        </>
      )}

      {/* Intent Highlights - only show when not filtered */}
      {!isFiltered && (
        <IntentHighlightsSection
          users={intentFilteredUsers}
          selectedIntent={selectedIntentHighlight}
          setSelectedIntent={setSelectedIntentHighlight}
          loading={loading}
          onViewProfile={handleViewProfile}
          onConnect={handleConnect}
          connectingUserId={connectingUserId}
          onViewSocialLinks={handleViewSocialLinks}
        />
      )}

      {/* Cross-Domain Recommendations - only show when not filtered */}
      {!isFiltered && (
        <div className="px-4 py-8">
          <RecommendationsSection />
        </div>
      )}

      {/* Profile Modal */}
      {selectedUser && (
        <ProfileFullModal
          key={selectedUser.id}
          profile={selectedUser}
          open={!!selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setViewSocialLinksUserId(null);
          }}
          onConnect={handleConnect}
          isMatched={isViewingMatchedProfile}
          onRemoveMatch={handleRemoveMatch}
          showSocialLinks={viewSocialLinksUserId === selectedUser.id}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default ExploreFeed;
