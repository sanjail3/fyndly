import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BookOpen, Film, Headphones, ShoppingBag, Plus, X, Star, Heart, Sparkles } from "lucide-react";

interface FavoritesStepProps {
  data: any;
  updateData: (key: string, data: any) => void;
  onNext: () => void;
  goBack?: () => void;
}

interface FavoritesData {
  books: string[];
  movies: string[];
  podcasts: string[];
  brands: string[];
}

type CategoryKey = keyof FavoritesData;

const FavoritesStep = ({ data, updateData, onNext, goBack }: FavoritesStepProps) => {
  const [favorites, setFavorites] = useState<FavoritesData>({
    books: data.favorites?.books || [],
    movies: data.favorites?.movies || [],
    podcasts: data.favorites?.podcasts || [],
    brands: data.favorites?.brands || []
  });
  
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("books");
  const [customInput, setCustomInput] = useState("");

  const categories = {
    books: {
      icon: BookOpen,
      name: "Books",
      emoji: "📚",
      placeholder: "Add your favorite book...",
      color: "from-emerald-500 to-green-600",
      suggestions: [
        "The Alchemist", "Atomic Habits", "Sapiens", "1984", "To Kill a Mockingbird",
        "Harry Potter", "The Great Gatsby", "Pride and Prejudice", "The Catcher in the Rye",
        "Lord of the Rings", "Dune", "The Hobbit", "Think and Grow Rich", "Rich Dad Poor Dad"
      ]
    },
    movies: {
      icon: Film,
      name: "Movies",
      emoji: "🎬",
      placeholder: "Add your favorite movie...",
      color: "from-red-500 to-pink-600",
      suggestions: [
        "The Shawshank Redemption", "The Godfather", "Pulp Fiction", "Inception", "The Dark Knight",
        "Forrest Gump", "The Matrix", "Goodfellas", "The Lord of the Rings", "Titanic",
        "Avengers: Endgame", "Interstellar", "The Wolf of Wall Street", "Parasite", "La La Land"
      ]
    },
    podcasts: {
      icon: Headphones,
      name: "Podcasts",
      emoji: "🎧",
      placeholder: "Add your favorite podcast...",
      color: "from-purple-500 to-indigo-600",
      suggestions: [
        "The Joe Rogan Experience", "Serial", "This American Life", "TED Talks Daily", "Radiolab",
        "The Tim Ferriss Show", "How I Built This", "Stuff You Should Know", "My Favorite Murder",
        "The Daily", "Conan O'Brien Needs a Friend", "SmartLess", "Call Her Daddy", "Armchair Expert"
      ]
    },
    brands: {
      icon: ShoppingBag,
      name: "Brands",
      emoji: "🛍️",
      placeholder: "Add your favorite brand...",
      color: "from-orange-500 to-yellow-600",
      suggestions: [
        "Apple", "Nike", "Google", "Netflix", "Spotify", "Amazon", "Tesla", "Adidas",
        "Microsoft", "Samsung", "Coca-Cola", "McDonald's", "Starbucks", "Disney", "PlayStation"
      ]
    }
  } as const;

  useEffect(() => {
    setFavorites(data.favorites || {
      books: [],
      movies: [],
      podcasts: [],
      brands: []
    });
  }, [data.favorites]);

  const addFavorite = (category: CategoryKey, item: string) => {
    if (!item.trim() || favorites[category].includes(item.trim())) return;
    
    const newFavorites = {
      ...favorites,
      [category]: [...favorites[category], item.trim()]
    };
    setFavorites(newFavorites);
    updateData("favorites", newFavorites);
    setCustomInput("");
  };

  const removeFavorite = (category: CategoryKey, item: string) => {
    const newFavorites = {
      ...favorites,
      [category]: favorites[category].filter((fav: string) => fav !== item)
    };
    setFavorites(newFavorites);
    updateData("favorites", newFavorites);
  };

  const addSuggestion = (category: CategoryKey, suggestion: string) => {
    addFavorite(category, suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent, category: CategoryKey) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFavorite(category, customInput);
    }
  };

  const getCategoryCount = () => {
    return Object.values(favorites).reduce((total, items) => total + items.length, 0);
  };

  const currentCategory = categories[activeCategory];
  const CurrentIcon = currentCategory.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-[#CAFE33]" />
          <h2 className="text-xl font-semibold text-white">Your Favorites</h2>
          <Sparkles className="w-6 h-6 text-[#CAFE33]" />
        </div>
        <p className="text-gray-400 text-sm">
          Share what you love! This helps us recommend similar content and connect you with like-minded people.
        </p>
        <p className="text-[#CAFE33] text-xs font-medium">
          ✨ Optional • {getCategoryCount()} items added • Takes less than 2 minutes
        </p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {(Object.entries(categories) as [CategoryKey, typeof categories[CategoryKey]][]).map(([key, category]) => {
          const Icon = category.icon;
          const isActive = activeCategory === key;
          const count = favorites[key]?.length || 0;
          
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "p-3 rounded-xl border transition-all duration-200 text-center",
                isActive 
                  ? "border-[#CAFE33] bg-[#CAFE33]/10 text-[#CAFE33]" 
                  : "border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-gray-300"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-lg">{category.emoji}</span>
                </div>
                <span className="text-xs font-medium">{category.name}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="text-xs bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/30">
                    {count}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Category Content */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-white">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r", currentCategory.color)}>
              <CurrentIcon className="w-4 h-4 text-white" />
            </div>
            <span>Favorite {currentCategory.name}</span>
            <span className="text-lg">{currentCategory.emoji}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Custom Input */}
          <div className="flex gap-2">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, activeCategory)}
              placeholder={currentCategory.placeholder}
              className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-[#CAFE33]"
            />
            <Button
              onClick={() => addFavorite(activeCategory, customInput)}
              disabled={!customInput.trim() || favorites[activeCategory].includes(customInput.trim())}
              className="bg-[#CAFE33] hover:bg-[#CAFE33]/80 text-black"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Selected Items */}
          {favorites[activeCategory].length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-400" />
                Your {currentCategory.name} ({favorites[activeCategory].length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {favorites[activeCategory].map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/30 hover:bg-[#CAFE33]/30 cursor-pointer group"
                    onClick={() => removeFavorite(activeCategory, item)}
                  >
                    {item}
                    <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              Popular {currentCategory.name}
            </h4>
            <div className="flex flex-wrap gap-2">
              {currentCategory.suggestions
                .filter(suggestion => !favorites[activeCategory].includes(suggestion))
                .slice(0, 12)
                .map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:border-[#CAFE33] hover:text-[#CAFE33] cursor-pointer transition-colors"
                    onClick={() => addSuggestion(activeCategory, suggestion)}
                  >
                    {suggestion}
                    <Plus className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={goBack}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            onClick={onNext}
            className="text-gray-400 hover:text-gray-300"
          >
            Skip for Now
          </Button>
          <Button 
            onClick={onNext}
            className="bg-[#CAFE33] hover:bg-[#CAFE33]/80 text-black font-medium"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FavoritesStep; 