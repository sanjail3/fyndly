import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Film, Headphones, Tv, ShoppingBag, Star, ExternalLink } from 'lucide-react';

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

interface ChatRecommendationBubbleProps {
  recommendations: Recommendation[];
  message?: string;
}

const domainIcons = {
  books: BookOpen,
  movies: Film,
  podcasts: Headphones,
  tv_shows: Tv,
  brands: ShoppingBag,
};

const colorClass = 'bg-[#CAFE32]/10 text-[#CAFE32] border border-[#CAFE32]/40';

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

const ChatRecommendationBubble: React.FC<ChatRecommendationBubbleProps> = ({ recommendations, message }) => {
  return (
    <div className="flex flex-col gap-3 max-w-[90%] sm:max-w-[85%] bg-gray-900 rounded-2xl p-4 shadow-lg w-full">
      {message && (
        <div className="mb-2 text-gray-200 text-base font-medium">{message}</div>
      )}
      <div className="flex flex-col gap-4">
        {recommendations.map((rec) => {
          const Icon = domainIcons[rec.entity_type as keyof typeof domainIcons] || Star;
          return (
            <div key={rec.entity_id} className={`flex gap-3 rounded-xl p-3 md:p-4 ${colorClass} shadow-md items-start w-full`}>
              {rec.image_url && (
                <img
                  src={rec.image_url}
                  alt={rec.title}
                  className="w-16 h-20 object-cover rounded-lg border border-[#CAFE32]/30 flex-shrink-0"
                />
              )}
              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-[#CAFE32] text-black font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Icon className="h-3 w-3 mr-1" />
                    {rec.entity_type}
                  </Badge>
                  <span className="text-xs text-[#CAFE32]/80 font-semibold">
                    {Math.round(rec.relevance_score * 100)}% match
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-white line-clamp-2">{rec.title}</h3>
                <p className="text-sm text-gray-300 line-clamp-2 mt-1">
                  {rec.description.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {rec.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-[#CAFE32] text-[#CAFE32] bg-transparent text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {formatRating(rec.external_ratings) && (
                    <span className="text-xs text-[#CAFE32]">
                      {formatRating(rec.external_ratings)}
                    </span>
                  )}
                  <Button size="sm" variant="outline" className="border-[#CAFE32] text-[#CAFE32] hover:bg-[#CAFE32]/20">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
                <p className="text-xs text-[#CAFE32]/80 italic mt-1">
                  {rec.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatRecommendationBubble; 