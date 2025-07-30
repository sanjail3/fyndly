import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Film, Headphones, Tv, ShoppingBag, Star, ExternalLink } from "lucide-react";

interface Recommendation {
  entity_id: string;
  entity_type: string;
  title: string;
  description: string;
  tags: string[];
  popularity: number;
  image_url?: string;
  external_ratings: any;
  relevance_score: number;
  explanation: string;
}

interface RecommendationsResponse {
  success: boolean;
  type: string;
  domains: string[];
  recommendations: Recommendation[];
  total: number;
}

const DOMAIN_OPTIONS = [
  { key: "all", label: "All", icon: Star },
  { key: "books", label: "Books", icon: BookOpen },
  { key: "movies", label: "Movies", icon: Film },
  { key: "podcasts", label: "Podcasts", icon: Headphones },
  { key: "tv_shows", label: "TV Shows", icon: Tv },
  { key: "brands", label: "Brands", icon: ShoppingBag },
];

const RecommendationsSection = () => {
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [currentType, setCurrentType] = useState("user_based");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState("all");

  const fetchAllRecommendations = async (type: string = "user_based") => {
    setLoading(true);
    setError(null);
    try {
      // Fetch recommendations for all domains at once
      const params = new URLSearchParams({
        type: type,
        domains: "books,movies,podcasts,tv_shows,brands",
        limit: "50" // Fetch more to have good variety across all domains
      });

      const response = await fetch(`/api/recommendations?${params}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to see personalized recommendations');
        } else if (response.status === 404) {
          throw new Error('User profile not found. Please complete your onboarding.');
        } else {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('All recommendations fetched:', data);
      setAllRecommendations(data.recommendations || []);
      setCurrentType(type);
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
      setError(error.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRecommendations();
  }, []);

  // Handle domain filter change (no API call, just local filtering)
  const handleDomainChange = (domain: string) => {
    setActiveDomain(domain);
  };

  // Handle recommendation type change (only API call when type changes)
  const handleTypeChange = (type: string) => {
    if (type !== currentType) {
      fetchAllRecommendations(type);
    }
  };

  // Filter recommendations by domain locally
  const getDomainRecommendations = (domain: string) => {
    if (!allRecommendations || allRecommendations.length === 0) return [];
    
    let filteredRecommendations = allRecommendations;
    
    if (domain !== "all") {
      filteredRecommendations = allRecommendations.filter(rec => rec.entity_type === domain);
    }
    
    // Sort by relevance score and limit results
    return filteredRecommendations
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, domain === "all" ? 8 : 6);
  };

  // Get count for each domain to show in badges
  const getDomainCount = (domain: string) => {
    if (domain === "all") return allRecommendations.length;
    return allRecommendations.filter(rec => rec.entity_type === domain).length;
  };

  // --- THEME STYLES ---
  const bgClass = "bg-[#111] text-white";
  const accentClass = "bg-[#CAFE32] text-black";
  const accentOutline = "border-[#CAFE32] text-[#CAFE32]";
  const chipActive = "bg-[#CAFE32] text-black font-bold shadow-md";
  const chipInactive = "bg-[#232323] text-[#CAFE32] border border-[#CAFE32]/60 hover:bg-[#CAFE32]/10";

  if (loading) {
    return (
      <Card className={`w-full ${bgClass} border-none`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 text-[#CAFE32]" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CAFE32]"></div>
            <p className="ml-3 text-[#CAFE32]">Loading your personalized recommendations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${bgClass} border border-red-500/30`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 text-[#CAFE32]" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={() => fetchAllRecommendations()}
              className="bg-[#CAFE32] text-black hover:bg-[#CAFE32]/80"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${bgClass} border border-[#CAFE32]/30 rounded-2xl shadow-lg`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Star className="h-5 w-5 text-[#CAFE32]" />
          Personalized Recommendations
        </CardTitle>
        <div className="flex flex-col gap-2">
          {/* Recommendation Type Toggle */}
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-full text-xs transition-all duration-150 ${
                currentType === 'user_based' ? chipActive : chipInactive
              }`}
              onClick={() => handleTypeChange('user_based')}
            >
              Based on Your Interests
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs transition-all duration-150 ${
                currentType === 'friend_based' ? chipActive : chipInactive
              }`}
              onClick={() => handleTypeChange('friend_based')}
            >
              Based on Friends
            </button>
            <button
              className={`px-3 py-1 rounded-full text-xs transition-all duration-150 ${
                currentType === 'all' ? chipActive : chipInactive
              }`}
              onClick={() => handleTypeChange('all')}
            >
              All Sources
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Chips Bar with counts */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {DOMAIN_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const count = getDomainCount(opt.key);
            return (
              <button
                key={opt.key}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-all duration-150 min-w-max
                  ${activeDomain === opt.key ? chipActive : chipInactive}
                `}
                onClick={() => handleDomainChange(opt.key)}
                style={{ border: activeDomain === opt.key ? "none" : "1.5px solid #CAFE32" }}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
                {count > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    activeDomain === opt.key ? 'bg-black/20 text-black' : 'bg-[#CAFE32]/20 text-[#CAFE32]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recommendations List */}
        <div className="flex flex-col gap-4">
          {getDomainRecommendations(activeDomain).length === 0 && (
            <div className="text-center py-8 text-[#CAFE32]/70">
              <p className="mb-2">No recommendations available for this category.</p>
              <p className="text-sm">Try updating your interests in your profile or complete the onboarding flow!</p>
            </div>
          )}
          {getDomainRecommendations(activeDomain).map((rec) => (
            <RecommendationCard key={`${rec.entity_id}-${rec.entity_type}`} recommendation={rec} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RecommendationCard = ({ recommendation }: { recommendation: Recommendation }) => {
  const domainIcons = {
    books: BookOpen,
    movies: Film,
    podcasts: Headphones,
    tv_shows: Tv,
    brands: ShoppingBag,
  };

  const colorClass = "bg-[#CAFE32]/10 text-[#CAFE32] border border-[#CAFE32]/40";

  const formatRating = (ratings: any) => {
    if (!ratings) return null;
    if (ratings.imdb_rating) {
      return `${ratings.imdb_rating}/10 (IMDB)`;
    }
    if (ratings.goodreads_rating) {
      return `${ratings.goodreads_rating}/5 (Goodreads)`;
    }
    if (ratings.itunes_rating) {
      return `${ratings.itunes_rating}/5 (iTunes)`;
    }
    return null;
  };

  const Icon = domainIcons[recommendation.entity_type as keyof typeof domainIcons] || BookOpen;

  return (
    <div className={`flex gap-3 rounded-xl p-3 md:p-4 ${colorClass} shadow-md items-start w-full`}> 
      {recommendation.image_url && (
        <img
          src={recommendation.image_url}
          alt={recommendation.title}
          className="w-16 h-20 object-cover rounded-lg border border-[#CAFE32]/30 flex-shrink-0"
        />
      )}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-[#CAFE32] text-black font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Icon className="h-3 w-3 mr-1" />
            {recommendation.entity_type}
          </Badge>
          <span className="text-xs text-[#CAFE32]/80 font-semibold">
            {Math.round(recommendation.relevance_score * 100)}% match
          </span>
        </div>
        <h3 className="font-semibold text-lg text-white line-clamp-2">{recommendation.title}</h3>
        <p className="text-sm text-gray-300 line-clamp-2 mt-1">
          {recommendation.description.replace(/<[^>]*>/g, '')}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {recommendation.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="border-[#CAFE32] text-[#CAFE32] bg-transparent text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {formatRating(recommendation.external_ratings) && (
            <span className="text-xs text-[#CAFE32]">
              {formatRating(recommendation.external_ratings)}
            </span>
          )}
          <Button size="sm" className="bg-[#CAFE32] text-black hover:bg-[#CAFE32]/80">
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
        <p className="text-xs text-[#CAFE32]/80 italic mt-1">
          {recommendation.explanation}
        </p>
      </div>
    </div>
  );
};

export default RecommendationsSection; 