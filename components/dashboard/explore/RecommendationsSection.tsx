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
  user: {
    id: string;
    full_name: string;
    interests: any;
  };
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
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDomain, setActiveDomain] = useState("all");

  const fetchRecommendations = async (domains: string[] = ["books", "movies", "podcasts"]) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/recommendations/test?type=user_based&domains=${domains.join(",")}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Handle domain filter change
  const handleDomainChange = (domain: string) => {
    setActiveDomain(domain);
    if (domain === "all") {
      fetchRecommendations();
    } else {
      fetchRecommendations([domain]);
    }
  };

  // Filter recommendations by domain
  const getDomainRecommendations = (domain: string) => {
    if (!recommendations?.recommendations) return [];
    if (domain === "all") return recommendations.recommendations.slice(0, 6);
    return recommendations.recommendations.filter(rec => rec.entity_type === domain).slice(0, 6);
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
            Cross-Domain Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CAFE32]"></div>
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
          Cross-Domain Recommendations
        </CardTitle>
        {recommendations?.user && (
          <p className="text-sm text-[#CAFE32] font-medium">
            Personalized for {recommendations.user.full_name}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Filter Chips Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {DOMAIN_OPTIONS.map(opt => {
            const Icon = opt.icon;
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
              </button>
            );
          })}
        </div>

        {/* Recommendations List */}
        <div className="flex flex-col gap-4">
          {getDomainRecommendations(activeDomain).length === 0 && (
            <div className="text-center py-8 text-[#CAFE32]/70">
              No recommendations available. Try updating your interests!
            </div>
          )}
          {getDomainRecommendations(activeDomain).map((rec) => (
            <RecommendationCard key={rec.entity_id} recommendation={rec} />
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
          <Button size="sm" variant="outline" className="border-[#CAFE32] text-[#CAFE32] hover:bg-[#CAFE32]/20">
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