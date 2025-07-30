"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Sparkles, 
  BookOpen, 
  Film, 
  Headphones, 
  ShoppingBag,
  Heart,
  Zap,
  Target,
  Palette,
  Code,
  Lightbulb,
  Star,
  TrendingUp,
  PieChart,
  Compass,
  Loader2,
  RefreshCw
} from "lucide-react";

interface UserData {
  id: string;
  full_name: string;
  college: string;
  department: string;
  academic_year: number;
  interests?: string[];
  tech_skills?: string[];
  creative_skills?: string[];
  personality_tags?: string[];
  book_interests?: string[];
  movie_interests?: string[];
  podcast_interests?: string[];
  tv_show_interests?: string[];
  favorite_books?: string[];
  favorite_movies?: string[];
  favorite_podcasts?: string[];
  favorite_brands?: string[];
  created_at?: string;
}

interface PersonalityScores {
  creativity: number;
  analytical: number;
  social: number;
  adventurous: number;
  technical: number;
}

interface QuickStats {
  total_matches: number;
  messages_sent: number;
  content_interactions: number;
  product_interactions: number;
  account_age_days: number;
}

const TasteAnalysisPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [personalityScores, setPersonalityScores] = useState<PersonalityScores>({
    creativity: 0,
    analytical: 0,
    social: 0,
    adventurous: 0,
    technical: 0
  });
  const [quickStats, setQuickStats] = useState<QuickStats>({
    total_matches: 0,
    messages_sent: 0,
    content_interactions: 0,
    product_interactions: 0,
    account_age_days: 0
  });
  const [aiInsights, setAiInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("brain");
  const [error, setError] = useState<string | null>(null);

  // Generate personalized content based on user data
  const generatePersonalizedContent = (user: UserData, scores: PersonalityScores) => {
    const contentProfiles = {
      books: {
        dominant_genres: (user.book_interests || []).map((interest, index) => ({
          name: `📚 ${interest.charAt(0).toUpperCase() + interest.slice(1)}`,
          percentage: Math.max(20, 50 - index * 10),
          emoji: getGenreEmoji(interest, 'book')
        })),
        reading_style: getReadingStyle(user.book_interests || [], scores)
      },
      movies: {
        dominant_genres: (user.movie_interests || []).map((interest, index) => ({
          name: `🎬 ${interest.charAt(0).toUpperCase() + interest.slice(1)}`,
          percentage: Math.max(15, 45 - index * 8),
          emoji: getGenreEmoji(interest, 'movie')
        })),
        viewing_style: getViewingStyle(user.movie_interests || [], scores)
      },
      podcasts: {
        dominant_genres: (user.podcast_interests || []).map((interest, index) => ({
          name: `🎧 ${interest.charAt(0).toUpperCase() + interest.slice(1)}`,
          percentage: Math.max(12, 40 - index * 7),
          emoji: getGenreEmoji(interest, 'podcast')
        })),
        listening_style: getListeningStyle(user.podcast_interests || [], scores)
      }
    };

    const personalityInsights = {
      dominant_traits: [
        { 
          trait: "🧠 Analytical Thinker", 
          percentage: scores.analytical, 
          description: getTraitDescription("analytical", (user.tech_skills || []).length)
        },
        { 
          trait: "🎨 Creative Visionary", 
          percentage: scores.creativity, 
          description: getTraitDescription("creative", (user.creative_skills || []).length)
        },
        { 
          trait: "💡 Tech Pioneer", 
          percentage: scores.technical, 
          description: getTraitDescription("technical", (user.interests || []).filter(i => i.toLowerCase().includes('tech')).length)
        },
        { 
          trait: "🌟 Social Connector", 
          percentage: scores.social, 
          description: getTraitDescription("social", scores.social)
        },
        { 
          trait: "🚀 Adventure Seeker", 
          percentage: scores.adventurous, 
          description: getTraitDescription("adventurous", (user.interests || []).filter(i => ['travel', 'sports', 'adventure'].some(a => i.toLowerCase().includes(a))).length)
        }
      ],
      content_dna: {
        fiction_reality_balance: calculateContentBalance(user.book_interests || [], user.movie_interests || []),
        depth_entertainment_ratio: calculateDepthRatio(user.interests || [], user.podcast_interests || []),
        innovation_tradition_scale: calculateInnovationScale(user.tech_skills || [], user.favorite_brands || []),
        academic_focus: Math.min(95, 40 + (user.academic_year || 1) * 10)
      },
      taste_evolution: generateTasteEvolution(user)
    };

    return { contentProfiles, personalityInsights };
  };

  // Helper functions for personalization
  const getGenreEmoji = (genre: string, type: string) => {
    const emojiMap: Record<string, string> = {
      'sci-fi': '🚀', 'fiction': '📖', 'non-fiction': '📊', 'romance': '💕',
      'mystery': '🔍', 'thriller': '😱', 'drama': '🎭', 'comedy': '😂',
      'action': '💥', 'horror': '👻', 'fantasy': '🧙', 'biography': '👤',
      'technology': '💻', 'business': '💼', 'news': '📰', 'education': '🎓',
      'health': '🏥', 'sports': '⚽', 'music': '🎵', 'history': '📜'
    };
    return emojiMap[genre.toLowerCase()] || '⭐';
  };

  const getReadingStyle = (interests: string[], scores: PersonalityScores) => {
    if (scores.analytical > 80) return "🎯 Deep Analytical Reader - You dissect every concept and connect ideas across domains";
    if (scores.creativity > 80) return "🌈 Imaginative Explorer - You seek stories that expand your creative horizons";
    if (interests.includes('sci-fi')) return "🚀 Future Visionary - You're drawn to possibilities and what could be";
    return "📚 Thoughtful Curator - You choose books that challenge and inspire growth";
  };

  const getViewingStyle = (interests: string[], scores: PersonalityScores) => {
    if (interests.includes('sci-fi') && scores.technical > 70) return "🤖 Tech-Savvy Cinephile - You appreciate films that explore technology's impact";
    if (scores.creativity > 75) return "🎨 Artistic Soul - You're drawn to cinematography and storytelling craft";
    if (interests.includes('thriller')) return "🧩 Mystery Solver - You love films that challenge your deductive skills";
    return "🎬 Quality Seeker - You prioritize meaningful content over mainstream entertainment";
  };

  const getListeningStyle = (interests: string[], scores: PersonalityScores) => {
    if (interests.includes('technology') && interests.includes('business')) return "💡 Innovation Hunter - You use podcasts to stay ahead of industry trends";
    if (scores.analytical > 80) return "🧠 Knowledge Optimizer - You treat audio content as efficient learning fuel";
    if (interests.includes('comedy')) return "😄 Balanced Learner - You mix education with entertainment perfectly";
    return "🎧 Curiosity-Driven Listener - You explore diverse topics to broaden your perspective";
  };

  const getTraitDescription = (trait: string, intensity: number) => {
    const descriptions = {
      analytical: intensity > 5 ? "You excel at breaking down complex systems" : "You approach problems methodically",
      creative: intensity > 3 ? "Innovation flows naturally through you" : "You find unique solutions to challenges",
      technical: intensity > 0 ? "Technology is your playground for innovation" : "You appreciate the power of good tools",
      social: intensity > 60 ? "You build meaningful connections effortlessly" : "You value quality relationships",
      adventurous: intensity > 2 ? "You actively seek new experiences" : "You're open to exploring new horizons"
    };
    return descriptions[trait as keyof typeof descriptions] || "You have a unique perspective on life";
  };

  const calculateContentBalance = (books: string[], movies: string[]) => {
    const realityGenres = ['non-fiction', 'biography', 'documentary', 'news', 'business'];
    const realityCount = [...books, ...movies].filter(genre => 
      realityGenres.some(real => genre.toLowerCase().includes(real))
    ).length;
    return Math.min(95, 30 + realityCount * 15);
  };

  const calculateDepthRatio = (interests: string[], podcasts: string[]) => {
    const deepTopics = ['science', 'philosophy', 'technology', 'business', 'education'];
    const deepCount = [...interests, ...podcasts].filter(topic =>
      deepTopics.some(deep => topic.toLowerCase().includes(deep))
    ).length;
    return Math.min(95, 40 + deepCount * 12);
  };

  const calculateInnovationScale = (skills: string[], brands: string[]) => {
    const innovativeKeywords = ['ai', 'ml', 'react', 'python', 'tesla', 'apple', 'spotify'];
    const innovationCount = [...skills, ...brands].filter(item =>
      innovativeKeywords.some(keyword => item.toLowerCase().includes(keyword))
    ).length;
    return Math.min(95, 50 + innovationCount * 8);
  };

  const generateTasteEvolution = (user: UserData) => {
    const accountAge = Math.floor((Date.now() - new Date(user.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24));
    const phases = [];
    
    if (accountAge > 90) phases.push({ period: "🌱 Early Explorer", themes: ["🎮 General Interests", "🎬 Entertainment"], color: "#FF6B6B" });
    if (accountAge > 60) phases.push({ period: "🔥 Skill Builder", themes: (user.tech_skills || []).slice(0, 2).map(s => `💻 ${s}`), color: "#4ECDC4" });
    if (accountAge > 30) phases.push({ period: "🚀 Specialist Phase", themes: (user.interests || []).slice(0, 2).map(i => `🎯 ${i}`), color: "#45B7D1" });
    
    phases.push({ 
      period: "🧠 Current Self", 
      themes: [
        `🎓 ${user.department || 'Student'} Expert`,
        ...(user.personality_tags || []).slice(0, 2).map(tag => `✨ ${tag}`)
      ], 
      color: "#CAFE33" 
    });

    return phases;
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/taste-analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUserData(data.user_data);
        setPersonalityScores(data.personality_scores);
        setQuickStats(data.quick_stats);
      } else {
        throw new Error(data.error || 'Failed to load data');
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate AI insights
  const generateAIInsights = async () => {
    if (!userData) return;
    
    setAiLoading(true);
    try {
      const response = await fetch('/api/taste-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_insights'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // For now, generate personalized insights based on user data
          const personalizedInsights = `🧠 **${userData.full_name}'s Unique Taste Genome**

🎯 **Your Academic Edge**: As a ${userData.department} student at ${userData.college}, you bring a ${userData.academic_year > 2 ? 'seasoned' : 'fresh'} perspective to your interests. Your combination of ${(userData.tech_skills || []).slice(0, 2).join(' and ') || 'technical potential'} with ${(userData.creative_skills || []).length > 0 ? (userData.creative_skills || [])[0] : 'creative thinking'} makes you a rare hybrid thinker.

🚀 **Content Signature**: Your preference for ${(userData.book_interests || [])[0] || 'diverse'} books and ${(userData.movie_interests || [])[0] || 'quality'} films reveals someone who ${personalityScores?.analytical! > 80 ? 'approaches entertainment intellectually' : 'seeks meaningful experiences'}. The fact that you're drawn to ${(userData.favorite_brands || []).slice(0, 2).join(' and ') || 'quality brands'} shows appreciation for innovation and quality.

🌟 **Growth Trajectory**: With ${(userData.interests || []).length} distinct interests and ${(userData.personality_tags || []).length} defining traits, you're clearly in an active exploration phase. Your taste evolution suggests you're moving toward ${(userData.personality_tags || []).includes('Tech Enthusiast') ? 'deep technical expertise' : 'creative leadership'}.

💡 **${userData.full_name}'s Superpower**: You have the unique ability to blend ${userData.department.toLowerCase()} thinking with ${(userData.creative_skills || []).length > 0 ? 'creative expression' : 'innovative problem-solving'} - positioning you perfectly for the future of work where both analytical and creative skills are essential!`;

          setAiInsights(personalizedInsights);
        }
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      setAiInsights(`🤖 **Analysis for ${userData.full_name}**\n\nI'm having trouble generating your personalized insights right now, but I can see you have a fascinating profile combining ${userData.department} studies with diverse interests in ${(userData.interests || []).slice(0, 2).join(' and ') || 'various fields'}. Your taste in ${(userData.favorite_brands || []).slice(0, 2).join(' and ') || 'brands'} shows great judgment! Try refreshing for a deeper analysis. ${(userData.personality_tags || []).length > 0 ? `\n\nYour ${(userData.personality_tags || [])[0]} trait really shines through!` : ''}`);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData && personalityScores) {
      generateAIInsights();
    }
  }, [userData, personalityScores]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Brain className="w-16 h-16 text-[#CAFE33] animate-pulse mx-auto" />
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin absolute top-2 right-2" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#CAFE33] mb-2">🧠 Analyzing Your Taste Universe</h2>
            <p className="text-gray-400">Gathering your personal insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userData || !personalityScores) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-400 text-6xl">😕</div>
          <h2 className="text-2xl font-bold text-red-400">Oops! Something went wrong</h2>
          <p className="text-gray-400">{error || 'Unable to load your taste profile'}</p>
          <Button 
            onClick={fetchUserData}
            className="bg-[#CAFE33] text-black hover:bg-[#CAFE33]/80"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { contentProfiles, personalityInsights } = generatePersonalizedContent(userData, personalityScores);
  const firstName = userData.full_name.split(' ')[0];

  return (
    <div className="min-h-screen bg-black text-white p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Personalized Header */}
        <div className="text-center space-y-3 sm:space-y-4 relative">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#CAFE33]/20 to-purple-500/20 blur-xl rounded-full"></div>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 bg-gray-900/50 backdrop-blur-sm rounded-full px-4 sm:px-8 py-3 sm:py-4 border border-[#CAFE33]/30">
              <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-[#CAFE33] animate-pulse" />
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#CAFE33] to-purple-400 bg-clip-text text-transparent">
                {firstName}'s Taste Universe 
              </h1>
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-bounce" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto px-2">
            <p className="text-base sm:text-lg text-gray-400">
              🧬 Hey <span className="text-[#CAFE33] font-medium">{firstName}</span>! Discover the fascinating patterns that make your {userData.department} mind unique
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm">
              <span className="text-purple-400">🎓 {userData.college}</span>
              <span className="text-blue-400">📚 Year {userData.academic_year}</span>
              <span className="text-green-400">⚡ {userData.interests?.length || 0} Core Interests</span>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative">
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-gray-900/80 backdrop-blur-sm border border-[#CAFE33]/30 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 gap-1 overflow-x-auto">
              <TabsTrigger 
                value="brain" 
                className="min-w-[120px] data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black rounded-lg transition-all duration-300 text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">🧠 Brain Map</span>
              </TabsTrigger>
              <TabsTrigger 
                value="content" 
                className="min-w-[120px] data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black rounded-lg transition-all duration-300 text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">🎨 Content DNA</span>
              </TabsTrigger>
              <TabsTrigger 
                value="evolution" 
                className="min-w-[120px] data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black rounded-lg transition-all duration-300 text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">🚀 Evolution</span>
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="min-w-[120px] data-[state=active]:bg-[#CAFE33] data-[state=active]:text-black rounded-lg transition-all duration-300 text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">💡 AI Insights</span>
              </TabsTrigger>
            </TabsList>
            {/* Fade edges on mobile when scrolling */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent pointer-events-none sm:hidden"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent pointer-events-none sm:hidden"></div>
          </div>

          {/* Brain Map Tab */}
          <TabsContent value="brain" className="space-y-4 sm:space-y-6">
            {/* Personality Visualization */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-[#CAFE33]/30 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <CardTitle className="text-xl sm:text-2xl text-[#CAFE33] flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                  🧠 {firstName}'s Personality Core
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-400">The unique traits that power your {userData.department} mind</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Personality Traits */}
                  <div className="space-y-3 sm:space-y-4">
                    {personalityInsights.dominant_traits.map((trait, index) => (
                      <div key={index} className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50">
                        <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                          <span className="font-medium text-sm sm:text-base text-white">{trait.trait}</span>
                          <span className="text-[#CAFE33] font-bold text-sm sm:text-base">{trait.percentage}%</span>
                        </div>
                        <Progress 
                          value={trait.percentage} 
                          className="h-2 sm:h-3 bg-gray-700 rounded-full mb-1.5 sm:mb-2" 
                        />
                        <p className="text-xs sm:text-sm text-gray-400">{trait.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills Constellation */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30">
                      <h4 className="text-base sm:text-lg font-medium text-blue-300 mb-3 sm:mb-4 flex items-center gap-2">
                        <Code className="w-4 h-4 sm:w-5 sm:h-5" />
                        💻 {firstName}'s Tech Arsenal
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {(userData.tech_skills || []).map((skill, index) => (
                          <Badge key={index} className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                            {skill}
                          </Badge>
                        ))}
                        {(userData.tech_skills || []).length === 0 && (
                          <p className="text-blue-300/60 text-xs sm:text-sm">Ready to explore new tech horizons! 🚀</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/30">
                      <h4 className="text-base sm:text-lg font-medium text-purple-300 mb-3 sm:mb-4 flex items-center gap-2">
                        <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                        🎨 Creative Galaxy
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {(userData.creative_skills || []).map((skill, index) => (
                          <Badge key={index} className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                            {skill}
                          </Badge>
                        ))}
                        {(userData.creative_skills || []).length === 0 && (
                          <p className="text-purple-300/60 text-xs sm:text-sm">Your creativity is waiting to be unleashed! ✨</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-900/30 to-[#CAFE33]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-[#CAFE33]/30">
                      <h4 className="text-base sm:text-lg font-medium text-[#CAFE33] mb-3 sm:mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                        ✨ Core Passions
                      </h4>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {(userData.interests || []).map((interest, index) => (
                          <Badge key={index} className="bg-[#CAFE33]/20 text-[#CAFE33] border-[#CAFE33]/30 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content DNA Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border-orange-500/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-orange-300 flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    🧭 {firstName}'s Content Compass
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">🎭 Fiction vs Reality</span>
                      <span className="text-orange-300">{personalityInsights.content_dna.fiction_reality_balance}% Reality</span>
                    </div>
                    <Progress value={personalityInsights.content_dna.fiction_reality_balance} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">🎯 Deep vs Light Content</span>
                      <span className="text-orange-300">{personalityInsights.content_dna.depth_entertainment_ratio}% Deep</span>
                    </div>
                    <Progress value={personalityInsights.content_dna.depth_entertainment_ratio} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">⚡ Innovation Focus</span>
                      <span className="text-orange-300">{personalityInsights.content_dna.innovation_tradition_scale}% Future</span>
                    </div>
                    <Progress value={personalityInsights.content_dna.innovation_tradition_scale} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">🎓 Academic Influence</span>
                      <span className="text-orange-300">{personalityInsights.content_dna.academic_focus}% Influence</span>
                    </div>
                    <Progress value={personalityInsights.content_dna.academic_focus} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Favorite Brands Showcase */}
              <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-cyan-300 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    🛍️ {firstName}'s Brand DNA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {(userData.favorite_brands || []).slice(0, 6).map((brand, index) => (
                      <div key={index} className="bg-cyan-500/10 rounded-xl p-3 text-center border border-cyan-500/20">
                        <span className="text-sm font-medium">{brand}</span>
                      </div>
                    ))}
                    {(userData.favorite_brands || []).length === 0 && (
                      <div className="col-span-2 text-center py-4">
                        <p className="text-cyan-300/60">🌟 Your brand preferences are a mystery waiting to be discovered!</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                    <p className="text-sm text-cyan-300">
                      💡 <strong>Brand Insight:</strong> {(userData.favorite_brands || []).length > 0 
                        ? "Your choices reflect a taste for innovation and quality"
                        : "Ready to discover brands that match your unique style!"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content DNA Tab */}
          <TabsContent value="content" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Books */}
              <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/30 border-emerald-500/30 rounded-xl sm:rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-emerald-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    📚 {firstName}'s Literary DNA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {(contentProfiles.books.dominant_genres || []).map((genre, index) => (
                    <div key={index} className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <span className="text-base sm:text-lg">{genre.emoji}</span>
                          {genre.name}
                        </span>
                        <span className="text-emerald-300 text-xs sm:text-sm">{genre.percentage}%</span>
                      </div>
                      <Progress value={genre.percentage} className="h-1.5 sm:h-2 bg-gray-700" />
                    </div>
                  ))}
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-emerald-500/10 rounded-lg sm:rounded-xl border border-emerald-500/20">
                    <p className="text-xs sm:text-sm text-emerald-300">{contentProfiles.books.reading_style}</p>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-emerald-300">🌟 {firstName}'s Library:</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(userData.favorite_books || []).slice(0, 3).map((book, index) => (
                        <Badge key={index} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                          {book}
                        </Badge>
                      ))}
                      {(userData.favorite_books || []).length === 0 && (
                        <p className="text-emerald-300/60 text-xs">Your future favorite books are waiting to be discovered! 📖</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Movies */}
              <Card className="bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30 rounded-xl sm:rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-red-300 flex items-center gap-2">
                    <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                    🎬 Cinema Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {(contentProfiles.movies.dominant_genres || []).map((genre, index) => (
                    <div key={index} className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <span className="text-base sm:text-lg">{genre.emoji}</span>
                          {genre.name}
                        </span>
                        <span className="text-red-300 text-xs sm:text-sm">{genre.percentage}%</span>
                      </div>
                      <Progress value={genre.percentage} className="h-1.5 sm:h-2 bg-gray-700" />
                    </div>
                  ))}
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-500/10 rounded-lg sm:rounded-xl border border-red-500/20">
                    <p className="text-xs sm:text-sm text-red-300">{contentProfiles.movies.viewing_style}</p>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-red-300">🎭 {firstName}'s Watchlist:</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(userData.favorite_movies || []).slice(0, 3).map((movie, index) => (
                        <Badge key={index} className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                          {movie}
                        </Badge>
                      ))}
                      {(userData.favorite_movies || []).length === 0 && (
                        <p className="text-red-300/60 text-xs">Great films are calling your name! 🎬</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Podcasts */}
              <Card className="bg-gradient-to-br from-violet-900/30 to-purple-900/30 border-violet-500/30 rounded-xl sm:rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-violet-300 flex items-center gap-2">
                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5" />
                    🎧 Audio Landscape
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {(contentProfiles.podcasts.dominant_genres || []).map((genre, index) => (
                    <div key={index} className="space-y-1.5 sm:space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <span className="text-base sm:text-lg">{genre.emoji}</span>
                          {genre.name}
                        </span>
                        <span className="text-violet-300 text-xs sm:text-sm">{genre.percentage}%</span>
                      </div>
                      <Progress value={genre.percentage} className="h-1.5 sm:h-2 bg-gray-700" />
                    </div>
                  ))}
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-violet-500/10 rounded-lg sm:rounded-xl border border-violet-500/20">
                    <p className="text-xs sm:text-sm text-violet-300">{contentProfiles.podcasts.listening_style}</p>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-violet-300">🎙️ {firstName}'s Playlist:</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(userData.favorite_podcasts || []).slice(0, 3).map((podcast, index) => (
                        <Badge key={index} className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                          {podcast}
                        </Badge>
                      ))}
                      {(userData.favorite_podcasts || []).length === 0 && (
                        <p className="text-violet-300/60 text-xs">Amazing podcasts are waiting to fuel your curiosity! 🎧</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolution" className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-[#CAFE33]/30 rounded-xl sm:rounded-3xl">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl text-[#CAFE33] flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  🚀 {firstName}'s Taste Evolution Journey
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-400">See how your {userData.department} mind has grown and evolved</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  {(personalityInsights.taste_evolution || []).map((phase, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <div 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-black font-bold text-xs sm:text-sm border-4 border-gray-800"
                          style={{ backgroundColor: phase.color }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-1.5 sm:pt-0">
                          <h4 className="text-base sm:text-lg font-medium text-white mb-1.5 sm:mb-2">{phase.period}</h4>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {(phase.themes || []).map((theme, themeIndex) => (
                              <Badge 
                                key={themeIndex} 
                                className="text-xs sm:text-sm text-black border-0"
                                style={{ backgroundColor: `${phase.color}40`, color: phase.color }}
                              >
                                {theme}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      {index < (personalityInsights.taste_evolution || []).length - 1 && (
                        <div className="absolute left-6 sm:left-8 top-12 sm:top-16 w-0.5 h-6 bg-gray-600"></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-[#CAFE33]/10 to-purple-500/10 rounded-xl sm:rounded-2xl border border-[#CAFE33]/30">
                  <h4 className="text-base sm:text-lg font-medium text-[#CAFE33] mb-2 sm:mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    🎯 What This Reveals About {firstName}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300">
                    <div className="space-y-1.5 sm:space-y-2">
                      <p><strong className="text-[#CAFE33]">📈 Growth Pattern:</strong> You consistently evolve toward more sophisticated interests</p>
                      <p><strong className="text-purple-400">🧠 {userData.department} Edge:</strong> Your academic background shapes your unique perspective</p>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <p><strong className="text-blue-400">🚀 Future Path:</strong> Heading toward expertise in {userData.personality_tags?.[0] || 'your field'}</p>
                      <p><strong className="text-green-400">💡 {firstName}'s Edge:</strong> You blend {userData.department.toLowerCase()} thinking with creative exploration!</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-[#CAFE33]/10 to-purple-500/10 border-[#CAFE33]/50 rounded-xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl text-[#CAFE33] flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                  🤖 AI Analysis for {firstName}
                  {aiLoading && <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#CAFE33] border-t-transparent rounded-full animate-spin" />}
                </CardTitle>
                <p className="text-sm sm:text-base text-gray-400">Personalized insights into your unique preferences</p>
              </CardHeader>
              <CardContent>
                {aiLoading ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="h-4 sm:h-6 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="h-4 sm:h-6 bg-gray-700 rounded-full animate-pulse w-3/4"></div>
                    <div className="h-4 sm:h-6 bg-gray-700 rounded-full animate-pulse w-1/2"></div>
                    <div className="h-4 sm:h-6 bg-gray-700 rounded-full animate-pulse w-2/3"></div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-lg">
                      {aiInsights}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personalized Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-700/30 border-blue-500/30 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">🎯</div>
                  <h4 className="text-blue-300 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Next Discovery</h4>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Based on your {userData.department} background, explore {userData.interests?.[0] || 'new horizons'}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-700/30 border-purple-500/30 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">🌟</div>
                  <h4 className="text-purple-300 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">{firstName}'s Score</h4>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Your taste sophistication: {Math.max(...(Object.values(personalityScores || {}) as number[]))}% in {userData.department.toLowerCase()}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/30 to-green-700/30 border-green-500/30 rounded-xl sm:rounded-2xl">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="text-2xl sm:text-3xl mb-1.5 sm:mb-2">🚀</div>
                  <h4 className="text-green-300 font-medium mb-1.5 sm:mb-2 text-sm sm:text-base">Growth Rate</h4>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {quickStats && quickStats.account_age_days < 30 ? "New explorer" : quickStats && quickStats.account_age_days < 90 ? "Rapid learner" : "Seasoned curator"} - keep expanding!
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Personalized Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-2">
          <Button 
            onClick={generateAIInsights}
            className="bg-gradient-to-r from-[#CAFE33] to-green-400 text-black hover:from-[#CAFE33]/80 hover:to-green-400/80 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-medium transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            disabled={aiLoading}
          >
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {aiLoading ? "🤖 Analyzing..." : `🧠 Refresh ${firstName}'s Analysis`}
          </Button>
          <Button 
            variant="outline" 
            className="border-[#CAFE33] text-[#CAFE33] hover:bg-[#CAFE33]/10 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-medium transition-all duration-300 text-sm sm:text-base"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            ✨ Share {firstName}'s Taste
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TasteAnalysisPage; 