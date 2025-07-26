import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, RotateCcw, RefreshCw, Loader2, Filter, Sparkles } from "lucide-react";
import ProfileFullModal from "./ProfileFullModal";
import { useSwipeAlgorithm } from "@/hooks/useSwipeAlgorithm";
import { useConnectionsContext } from "@/components/ConnectionsProvider";
import { useToast } from '@/hooks/use-toast';
import { SwipeFilters } from "./swipe/SwipeFilters";

// Add a reusable LoadingIcon component for rolling logo
function LoadingIcon({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/icon.png"
        alt="Fyndly Logo"
        className={`rounded-2xl shadow-xl animate-spin-slow`}
        style={{ width: size, height: size, animation: 'spin 1.2s linear infinite' }}
      />
      {message && <p className="text-gray-400 mt-4">{message}</p>}
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

const SwipePage = () => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSocialInfo, setShowSocialInfo] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);

  const { currentUser, loading, handleSwipe, refreshQueue, hasMoreUsers, swipeQueue, applyFilters: applySwipeFilters, clearSwipeQueue } = useSwipeAlgorithm();
  const { checkIfMatched, sendConnectionRequest } = useConnectionsContext();
  const [isMatched, setIsMatched] = useState(false);
  const [isCardLoading, setIsCardLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ college: "", department: "", academicYear: "" });
  const [showSwipeSpinner, setShowSwipeSpinner] = useState(false);
  const [swipeTimeoutId, setSwipeTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleApplyFilters = async (newFilters: { college: string; department: string; academicYear: string }) => {
    setInitialLoading(true);
    setFilters(newFilters);
    await applySwipeFilters(newFilters);
    setInitialLoading(false);
  };

  // Shuffle utility
  function shuffleArray(array: any[]) {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  // Shuffle queue on first load and on refresh
  useEffect(() => {
    if (loading) {
      setInitialLoading(true);
    } else {
      setInitialLoading(false);
    }
  }, [loading]);

  // Shuffle on manual refresh
  const handleRefresh = async () => {
    setInitialLoading(true);
    await refreshQueue();
    // shuffle will happen in useEffect above
  };

  // Check if current user is matched
  useEffect(() => {
    if (currentUser) {
      checkIfMatched(currentUser.id).then(setIsMatched);
    }
  }, [currentUser, checkIfMatched]);

  // Touch/Mouse event handlers
  const handleStart = (clientX: number) => {
    if (isCardLoading) return;
    startX.current = clientX;
    setIsDragging(true);
    setShowSocialInfo(false);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isCardLoading) return;
    const diff = clientX - startX.current;
    // Clamp dragOffset to max 80vw left/right
    const maxOffset = Math.min(window.innerWidth * 0.8, 320); // 80vw or 320px max
    setDragOffset(Math.max(-maxOffset, Math.min(diff, maxOffset)));
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handleSwipeAction('right');
      } else {
        handleSwipeAction('left');
      }
    } else {
      setDragOffset(0);
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Periodically clear swipe queue every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      clearSwipeQueue();
    }, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [clearSwipeQueue]);

  // Manual clear button handler
  const handleManualClear = async () => {
    setInitialLoading(true);
    await clearSwipeQueue();
    setInitialLoading(false);
  };

  // Defensive reset: clear spinner if card is not loading
  useEffect(() => {
    if (!isCardLoading && showSwipeSpinner) {
      setShowSwipeSpinner(false);
    }
  }, [isCardLoading, showSwipeSpinner]);

  // Show spinner if swipe backend call takes too long
  const handleSwipeAction = async (direction: 'left' | 'right') => {
    // Always clear spinner and card loading at the start
    setShowSwipeSpinner(false);
    setIsCardLoading(false);
    if (swipeTimeoutId) {
      clearTimeout(swipeTimeoutId);
      setSwipeTimeoutId(null);
    }
    if (isCardLoading) return;
    if (direction === 'right') {
      setShowSocialInfo(true);
      setIsCardLoading(true);
      // Start spinner timeout
      const timeoutId = setTimeout(() => setShowSwipeSpinner(true), 1200);
      setSwipeTimeoutId(timeoutId);
      setTimeout(() => {
        setSwipeDirection(direction);
        setTimeout(async () => {
          handleSwipe(direction);
          setSwipeDirection(null);
          setShowSocialInfo(false);
          setDragOffset(0);
          setIsCardLoading(false);
          setShowSwipeSpinner(false);
          if (swipeTimeoutId) {
            clearTimeout(swipeTimeoutId);
            setSwipeTimeoutId(null);
          }
          toast({
            title: 'Connection Request Sent',
            description: 'Your request has been sent! 🎉',
            variant: 'default',
            duration: 2500,
          });
        }, 300);
      }, 1500);
    } else {
      setSwipeDirection(direction);
      // Start spinner timeout
      const timeoutId = setTimeout(() => setShowSwipeSpinner(true), 1200);
      setSwipeTimeoutId(timeoutId);
      setTimeout(async () => {
        handleSwipe(direction);
        setSwipeDirection(null);
        setDragOffset(0);
        setIsCardLoading(false);
        setShowSwipeSpinner(false);
        if (swipeTimeoutId) {
          clearTimeout(swipeTimeoutId);
          setSwipeTimeoutId(null);
        }
      }, 300);
    }
  };

  const handleHeartClick = () => {
    handleSwipeAction('right');
  };

  const handlePassClick = () => {
    handleSwipeAction('left');
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-black p-2 md:p-4 flex flex-col">
        <div className="text-center py-3 relative">
          <h1 className="text-2xl font-bold text-[#CAFE33] mb-1">
            Discover & Connect 💫
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            Swipe right to connect, left to pass
          </p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowFilters(true)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#CAFE33] hover:bg-[#CAFE33]/10"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <img src="/icon.png" className="h-12 w-12 animate-spin mx-auto" alt="Shuffling" />
            <p className="text-gray-400">Finding and shuffling your perfect matches...</p>
          </div>
        </div>
      </div>
    );
  }

  // If queue is empty after loading, show 'All caught up' message
  if (!initialLoading && (!swipeQueue || swipeQueue.length === 0)) {
    return (
      <div className="min-h-screen bg-black p-2 md:p-4 flex flex-col">
        <div className="text-center py-3 relative">
          <h1 className="text-2xl font-bold text-[#CAFE33] mb-1">
            No More Profiles 🎯
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            {filters.college || filters.department || filters.academicYear ? "Try broadening your filters!" : "Check back later for new matches!"}
          </p>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowFilters(true)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-[#CAFE33] hover:bg-[#CAFE33]/10"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="text-6xl">🔍</div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">All caught up!</h3>
              <p className="text-gray-400 max-w-sm">
                You've seen all available profiles. New matches will appear as more users join.
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cardTransform = isDragging || dragOffset !== 0 
    ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)` 
    : swipeDirection === 'left' 
      ? 'translateX(-100%) rotate(-30deg)' 
      : swipeDirection === 'right' 
        ? 'translateX(100%) rotate(30deg)' 
        : 'translateX(0) rotate(0deg)';

  const cardOpacity = isDragging || dragOffset !== 0 
    ? Math.max(0.5, 1 - Math.abs(dragOffset) / 200)
    : swipeDirection 
      ? 0 
      : 1;

  // Use swipeQueue directly
  const currentProfile = swipeQueue[0];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-4 overflow-hidden">
      {/* Filter summary bar */}
      {(filters.college || filters.department || filters.academicYear) && (
        <div className="flex flex-wrap gap-2 pb-2 pt-1">
          {filters.college && (
            <span className="flex items-center bg-gray-800 border border-[#CAFE33] text-[#CAFE33] rounded-full px-3 py-1 text-xs font-semibold">
              {filters.college}
              <button onClick={() => { setFilters(f => ({ ...f, college: "" })); handleApplyFilters({ ...filters, college: "" }); }} className="ml-1 text-[#CAFE33] hover:text-red-400 focus:outline-none">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.department && (
            <span className="flex items-center bg-gray-800 border border-[#CAFE33] text-[#CAFE33] rounded-full px-3 py-1 text-xs font-semibold">
              {filters.department}
              <button onClick={() => { setFilters(f => ({ ...f, department: "" })); handleApplyFilters({ ...filters, department: "" }); }} className="ml-1 text-[#CAFE33] hover:text-red-400 focus:outline-none">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.academicYear && (
            <span className="flex items-center bg-gray-800 border border-[#CAFE33] text-[#CAFE33] rounded-full px-3 py-1 text-xs font-semibold">
              Year {filters.academicYear}
              <button onClick={() => { setFilters(f => ({ ...f, academicYear: "" })); handleApplyFilters({ ...filters, academicYear: "" }); }} className="ml-1 text-[#CAFE33] hover:text-red-400 focus:outline-none">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        {isCardLoading && showSwipeSpinner && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70">
            <LoadingIcon size={56} message="Saving your swipe..." />
            <p className="text-gray-400 mt-2">This is taking longer than usual.</p>
          </div>
        )}
        {initialLoading ? (
          <div className="text-center space-y-4">
            <LoadingIcon size={48} message="Finding your perfect matches..." />
          </div>
        ) : !currentProfile ? (
          <div className="text-center space-y-6">
            <div className="text-6xl">🤷‍♀️</div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-white">All caught up!</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                {filters.college || filters.department || filters.academicYear
                  ? "Try broadening your filters to see more people."
                  : "Check back later for new profiles!"}
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            className="w-full h-full max-w-sm cursor-grab active:cursor-grabbing"
          >
            {/* Main Profile Section with Avatar and Overlay */}
            <div
              className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(${dragOffset}px) rotate(${dragOffset / 20}deg)` }}
            >
              

              <Avatar className="w-full h-full">
                <AvatarImage src={currentProfile.avatar_url?.split('?')[0]} className="w-full h-full object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-[#CAFE33] to-[#B8E62E] flex items-center justify-center">
                  <LoadingIcon size={48} />
                </AvatarFallback>
              </Avatar>

              {/* Top Overlay - Name and Year */}
              <div className="absolute top-1 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-xl rounded-lg p-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {currentProfile.full_name}
                      </h2>
                      <p className="text-gray-300 text-sm">
                        Year {currentProfile.academic_year} • {currentProfile.department}
                      </p>
                    </div>
                    {typeof currentProfile?.matchScore === 'number' ? (
                      <div className="bg-[#CAFE33] text-black text-sm font-bold px-3 py-1 rounded-full">
                        {currentProfile.matchScore}% ✨
                      </div>
                    ) : (
                      <div className="bg-gray-700 text-gray-200 text-xs font-bold px-3 py-1 rounded-full">
                        N/A
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Overlay - College and Tags */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-xl rounded-lg p-3 shadow-lg">
                  <div className="text-center mb-2">
                    <p className="text-gray-300 text-sm font-medium">
                      {currentProfile.college}
                    </p>
                  </div>
                  {currentProfile.personality_tags && currentProfile.personality_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {currentProfile.personality_tags.slice(0, 3).map((tag: any, idx: any) => (
                        <span key={idx} className="text-xs bg-gray-800/80 text-gray-300 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Swipe indicators */}
              {dragOffset > 50 && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 pointer-events-none animate-fade-in">
                  <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-xl">
                    LIKE 💚
                  </div>
                </div>
              )}
              {dragOffset < -50 && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10 pointer-events-none animate-fade-in">
                  <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-xl">
                    PASS 👎
                  </div>
                </div>
              )}
            </div>

            {/* Essential Data Section */}
            <div className="p-4 space-y-3 bg-gray-900">
              <div>
                <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
                  🌟 Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.interests
                    .slice(0, 4)
                    .map((interest: any, idx: any) => (
                      <Badge key={idx} variant="secondary" className="bg-[#CAFE33]/15 text-[#CAFE33] text-xs">
                        {interest}
                      </Badge>
                  ))}
                  {currentProfile.interests.length > 4 && (
                    <span className="text-xs text-gray-400">+{currentProfile.interests.length - 4} more</span>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
                  🎯 Looking For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.looking_for.slice(0, 2).map((looking: any, idx: any) => (
                    <Badge key={idx} variant="outline" className="text-blue-400 border-blue-400 text-xs">
                      {looking}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* View Full Profile Button */}
              <div className="flex justify-center mt-4">
                <button
                  className="text-sm bg-[#CAFE33] hover:bg-[#B8E62E] text-black rounded-full px-4 py-2 font-semibold shadow-lg transition-all transform hover:scale-105"
                  onClick={() => setShowFullProfile(true)}
                  aria-label="View full profile"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Modern Action Buttons --- */}
      <div className="flex justify-center items-center w-full py-4 gap-6 flex-shrink-0">
        <Button
          onClick={handlePassClick}
          size="icon"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-red-500 shadow-lg border border-red-500/20 hover:scale-105 transition-transform"
          disabled={!currentProfile || isCardLoading}
        >
          <X className="h-8 w-8" />
        </Button>
        <Button
          onClick={handleHeartClick}
          size="icon"
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#CAFE33] to-[#30C77B] text-black shadow-2xl shadow-[#CAFE33]/30 border-2 border-white/50 hover:scale-110 transition-transform animate-pulse-slow"
          disabled={!currentProfile || isCardLoading}
        >
          <Heart className="h-10 w-10" fill="currentColor" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-gray-500 text-xs pb-2 md:pb-4">
        <div className="md:hidden">Swipe right to like • Swipe left to pass</div>
        <div className="hidden md:block">Click ❤️ to like • Click ✕ to pass</div>
        {hasMoreUsers && (
          <div className="text-[#CAFE33] text-xs mt-1">
            More profiles waiting! ⏳
          </div>
        )}
      </div>

      {/* Full profile modal */}
      <ProfileFullModal
        open={showFullProfile}
        onClose={() => setShowFullProfile(false)}
        profile={currentProfile}
        isMatched={isMatched}
        onConnect={sendConnectionRequest}
        onRemoveMatch={() => {}}
      />
      <SwipeFilters 
        open={showFilters}
        onOpenChange={setShowFilters}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
      <style jsx global>{`
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes pulse-slow {
          50% {
            box-shadow: 0 0 25px 5px rgba(202, 254, 51, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default SwipePage;
