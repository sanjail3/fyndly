import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Qloo API Configuration
const QLOO_API_KEY = "WLkwwcOW14J5LMLQPPAGEQ3L8UTmEgvDboc_1B_YcuE";
const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2/insights";

// Entity type mappings for Qloo API
const ENTITY_TYPES = {
  books: "urn:entity:book",
  movies: "urn:entity:movie",
  podcasts: "urn:entity:podcast",
  tv_shows: "urn:entity:tv_show",
  brands: "urn:entity:brand"
};

// Genre mappings for Qloo API
const GENRE_MAPPINGS: any = {
  books: {
    "sci-fi": "urn:tag:genre:book:science_fiction",
    "fantasy": "urn:tag:genre:book:fantasy",
    "mystery": "urn:tag:genre:book:mystery",
    "romance": "urn:tag:genre:book:romance",
    "thriller": "urn:tag:genre:book:thriller",
    "non-fiction": "urn:tag:genre:book:non_fiction",
    "biography": "urn:tag:genre:book:biography",
    "history": "urn:tag:genre:book:history",
    "fiction": "urn:tag:genre:book:fiction"
  },
  movies: {
    "action": "urn:tag:genre:media:action",
    "comedy": "urn:tag:genre:media:comedy",
    "drama": "urn:tag:genre:media:drama",
    "thriller": "urn:tag:genre:media:thriller",
    "sci-fi": "urn:tag:genre:media:science_fiction",
    "horror": "urn:tag:genre:media:horror",
    "romance": "urn:tag:genre:media:romance",
    "animation": "urn:tag:genre:media:animation"
  },
  podcasts: {
    "comedy": "urn:tag:genre:podcast:comedy",
    "news": "urn:tag:genre:podcast:news",
    "true-crime": "urn:tag:genre:podcast:true_crime",
    "sports": "urn:tag:genre:podcast:sports",
    "technology": "urn:tag:genre:podcast:technology",
    "business": "urn:tag:genre:podcast:business"
  },
  tv_shows: {
    "action": "urn:tag:genre:media:action",
    "comedy": "urn:tag:genre:media:comedy",
    "drama": "urn:tag:genre:media:drama",
    "thriller": "urn:tag:genre:media:thriller",
    "sci-fi": "urn:tag:genre:media:science_fiction",
    "horror": "urn:tag:genre:media:horror",
    "romance": "urn:tag:genre:media:romance",
    "animation": "urn:tag:genre:media:animation"
  },
  brands: {
    "technology": "urn:tag:category:brand:technology",
    "lifestyle": "urn:tag:category:brand:lifestyle",
    "fashion": "urn:tag:category:brand:fashion",
    "food": "urn:tag:category:brand:food",
    "automotive": "urn:tag:category:brand:automotive",
    "entertainment": "urn:tag:category:brand:entertainment"
  }
};

// Fallback genres for each domain when user interests don't match
const FALLBACK_GENRES = {
  books: ["fiction", "non-fiction", "mystery", "romance", "biography"],
  movies: ["drama", "comedy", "action", "thriller", "romance"],
  podcasts: ["news", "comedy", "technology", "business", "true-crime"],
  tv_shows: ["drama", "comedy", "action", "thriller", "sci-fi"],
  brands: ["technology", "lifestyle", "fashion", "food", "entertainment"]
};

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

interface UserWithRecommendations {
  id: string;
  full_name: string;
  age_group: string | null;
  gender: string | null;
  book_interests: string[];
  movie_interests: string[];
  podcast_interests: string[];
  tv_show_interests: string[];
  brand_interests: string[];
  favorite_books: string[];
  favorite_movies: string[];
  favorite_podcasts: string[];
  favorite_tv_shows: string[];
  favorite_brands: string[];
  content_rating_preference: string | null;
  min_popularity_threshold: number | null;
  recommendation_preferences: any;
}

async function makeQlooApiRequest(params: any): Promise<any> {
  try {
    const response = await fetch(`${QLOO_BASE_URL}?${new URLSearchParams(params)}`, {
      headers: {
        'accept': 'application/json',
        'X-Api-Key': QLOO_API_KEY
      }
    });

    if (response.status === 400) {
      console.error('Qloo API Request failed with 400 error:', params);
      return null;
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Qloo API request failed:', error);
    return null;
  }
}

function parseQlooResponse(response: any, entityType: string): Recommendation[] {
  if (!response || !response.success) {
    return [];
  }

  const entities = response.results?.entities || [];
  return entities.map((entity: any) => {
    const properties = entity.properties || {};
    const tags = (entity.tags || []).map((tag: any) => tag.name);
    const external = entity.external || {};

    let external_ratings = {};
    if (entityType === "books") {
      const goodreads = external.goodreads?.[0] || {};
      external_ratings = {
        goodreads_rating: goodreads.user_rating,
        goodreads_count: goodreads.user_ratings_count
      };
    } else if (entityType === "movies") {
      const imdb = external.imdb?.[0] || {};
      const metacritic = external.metacritic?.[0] || {};
      external_ratings = {
        imdb_rating: imdb.user_rating,
        imdb_count: imdb.user_rating_count,
        metacritic_critic: metacritic.critic_rating,
        metacritic_user: metacritic.user_rating
      };
    } else if (entityType === "podcasts") {
      const itunes = external.itunes?.[0] || {};
      external_ratings = {
        itunes_rating: itunes.user_rating
      };
    }

    return {
      entity_id: entity.entity_id || "",
      entity_type: entityType,
      title: entity.name || properties.title || "Unknown Title",
      description: properties.description || properties.short_description || "",
      tags,
      popularity: entity.popularity || 0.0,
      image_url: properties.image?.url,
      external_ratings,
      relevance_score: 0.0, // Will be calculated
      explanation: ""
    };
  });
}

async function getUserBasedRecommendations(user: UserWithRecommendations, targetDomains: string[] = ["books", "movies", "podcasts"]): Promise<Recommendation[]> {
  const allRecommendations: Recommendation[] = [];
  
  // Add randomization seed based on current time to get different results
  const randomSeed = Date.now();
  
  for (const domain of targetDomains) {
    if (!ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES]) continue;

    let userGenres: string[] = [];
    if (domain === 'books') {
      userGenres = user.book_interests || [];
    } else if (domain === 'movies') {
      userGenres = user.movie_interests || [];
    } else if (domain === 'podcasts') {
      userGenres = user.podcast_interests || [];
    } else if (domain === 'tv_shows') {
      userGenres = user.tv_show_interests || [];
    } else if (domain === 'brands') {
      userGenres = user.brand_interests || [];
    }
    
    // Filter genres that have mappings in Qloo API
    const validGenres = userGenres.filter(genre => GENRE_MAPPINGS[domain]?.[genre]);
    
    // If no valid genres found, use fallback genres
    if (validGenres.length === 0) {
      console.log(`No valid genres found for ${domain}, using fallback genres`);
      validGenres.push(...FALLBACK_GENRES[domain as keyof typeof FALLBACK_GENRES]);
    }
    
    // Shuffle genres to get different results each time
    const shuffledGenres = [...validGenres].sort(() => Math.random() - 0.5);
    
    // Take only a subset of genres for more varied results
    const selectedGenres = shuffledGenres.slice(0, Math.min(3, shuffledGenres.length));
    
    for (const genre of selectedGenres) {
      const genreTag = GENRE_MAPPINGS[domain]?.[genre];
      if (!genreTag) {
        console.log(`No mapping found for genre: ${genre} in domain: ${domain}`);
        continue;
      }

      // Add randomization to API parameters
      const randomOffset = Math.floor(Math.random() * 10); // Random starting point
      const params = {
        "filter.type": ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES],
        "signalInterestsTags": genreTag,
        "signal.demographics.age": user.age_group || "25_to_29",
        "signal.demographics.gender": user.gender === "other" ? "male" : (user.gender || "male"),
        "filter.release_year.min": "15", // More flexible date range
        "take": "8", // Get more results
        "skip": randomOffset.toString() // Add randomization
      };

      console.log(`Fetching recommendations for ${domain} genre: ${genre} with tag: ${genreTag}`);
      const response = await makeQlooApiRequest(params);
      const recommendations = parseQlooResponse(response, domain);

      for (const rec of recommendations) {
        rec.relevance_score = calculateRelevanceScore(user, rec);
        
        // Different explanation based on whether it's user's interest or fallback
        if (userGenres.includes(genre)) {
          rec.explanation = `Recommended because you like ${genre} ${domain}`;
        } else {
          rec.explanation = `Popular ${genre} ${domain} you might enjoy`;
        }
        
        // Add small random factor to relevance score to vary ordering
        rec.relevance_score += (Math.random() - 0.5) * 0.1;
      }

      allRecommendations.push(...recommendations);
    }
    
    // Safety net: if still no recommendations for this domain, try one more fallback call
    const domainRecommendations = allRecommendations.filter(rec => rec.entity_type === domain);
    if (domainRecommendations.length === 0) {
      console.log(`No recommendations found for ${domain}, trying emergency fallback`);
      
      const emergencyGenre = FALLBACK_GENRES[domain as keyof typeof FALLBACK_GENRES][0];
      const emergencyGenreTag = GENRE_MAPPINGS[domain]?.[emergencyGenre];
      
      if (emergencyGenreTag) {
        const emergencyParams = {
          "filter.type": ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES],
          "signalInterestsTags": emergencyGenreTag,
          "signal.demographics.age": "25_to_29",
          "signal.demographics.gender": "male",
          "take": "5"
        };
        
        const emergencyResponse = await makeQlooApiRequest(emergencyParams);
        const emergencyRecommendations = parseQlooResponse(emergencyResponse, domain);
        
        for (const rec of emergencyRecommendations) {
          rec.relevance_score = 0.5; // Medium relevance for fallback
          rec.explanation = `Popular ${emergencyGenre} ${domain} you might discover`;
        }
        
        allRecommendations.push(...emergencyRecommendations);
      }
    }
  }

  // Enhanced deduplication and sorting
  const seenTitles = new Set();
  const seenEntityIds = new Set();
  const uniqueRecommendations: Recommendation[] = [];
  
  // Sort by relevance score with randomization factor
  const sortedRecommendations = allRecommendations.sort((a, b) => {
    const scoreDiff = b.relevance_score - a.relevance_score;
    // If scores are very close, add some randomization
    if (Math.abs(scoreDiff) < 0.05) {
      return Math.random() - 0.5;
    }
    return scoreDiff;
  });
  
  for (const rec of sortedRecommendations) {
    const titleKey = rec.title.toLowerCase().trim();
    const entityKey = rec.entity_id;
    
    if (!seenTitles.has(titleKey) && !seenEntityIds.has(entityKey)) {
      seenTitles.add(titleKey);
      seenEntityIds.add(entityKey);
      uniqueRecommendations.push(rec);
    }
  }

  // Return a randomized subset to ensure variety
  const shuffledResults = uniqueRecommendations.sort(() => Math.random() - 0.5);
  return shuffledResults.slice(0, 15); // Return more results for better filtering
}

function calculateRelevanceScore(user: UserWithRecommendations, recommendation: Recommendation): number {
  let score = 0.3; // Lower base score to allow more variation

  // Enhanced genre matching with exact domain targeting
  let userGenres: string[] = [];
  
  switch (recommendation.entity_type) {
    case 'books':
      userGenres = user.book_interests || [];
      break;
    case 'movies':
      userGenres = user.movie_interests || [];
      break;
    case 'podcasts':
      userGenres = user.podcast_interests || [];
      break;
    case 'tv_shows':
      userGenres = user.tv_show_interests || [];
      break;
    case 'brands':
      userGenres = user.brand_interests || [];
      break;
  }

  // Exact genre matching (higher weight)
  const exactGenreMatches = userGenres.filter(genre => 
    recommendation.tags.some(tag => 
      tag.toLowerCase() === genre.toLowerCase() ||
      tag.toLowerCase().includes(genre.toLowerCase()) ||
      genre.toLowerCase().includes(tag.toLowerCase())
    )
  );
  score += exactGenreMatches.length * 0.3;

  // Fuzzy genre matching (lower weight)
  const fuzzyGenreMatches = userGenres.filter(genre => 
    recommendation.tags.some(tag => {
      const tagWords = tag.toLowerCase().split(/\s+/);
      const genreWords = genre.toLowerCase().split(/\s+/);
      return tagWords.some(tagWord => genreWords.some(genreWord => 
        tagWord.includes(genreWord) || genreWord.includes(tagWord)
      ));
    })
  );
  score += fuzzyGenreMatches.length * 0.15;

  // Popularity factor (normalized)
  score += Math.min(recommendation.popularity * 0.2, 0.2);

  // External ratings boost
  if (recommendation.external_ratings) {
    let ratingBoost = 0;
    if (recommendation.external_ratings.imdb_rating && recommendation.external_ratings.imdb_rating > 7) {
      ratingBoost += 0.1;
    }
    if (recommendation.external_ratings.goodreads_rating && recommendation.external_ratings.goodreads_rating > 4) {
      ratingBoost += 0.1;
    }
    if (recommendation.external_ratings.itunes_rating && recommendation.external_ratings.itunes_rating > 4) {
      ratingBoost += 0.1;
    }
    score += ratingBoost;
  }

  // Content length/description quality boost
  if (recommendation.description && recommendation.description.length > 100) {
    score += 0.05;
  }

  return Math.min(1.0, Math.max(0.1, score)); // Ensure score is between 0.1 and 1.0
}

async function getFriendBasedRecommendations(user: UserWithRecommendations, targetDomains: string[] = ["books", "movies", "podcasts"]): Promise<Recommendation[]> {
  // Get user's friends - simplified for now since we don't have a friends field
  // In a real implementation, you'd query for actual friends
  const friends = await prisma.users.findMany({
    where: {
      // For now, just get some random users as "friends"
      // In production, you'd query actual friend relationships
      NOT: {
        id: user.id // Exclude the current user
      }
    },
    take: 5
  });

  if (friends.length === 0) {
    // If no friends, fall back to user-based recommendations with fallback genres
    console.log("No friends found, using fallback genres for friend-based recommendations");
    return await getUserBasedRecommendations(user, targetDomains);
  }

  // Aggregate friends' interests
  const friendsGenres: { [key: string]: string[] } = {};
  for (const friend of friends) {
    for (const domain of targetDomains) {
      const friendGenres = friend[`${domain}_interests` as keyof typeof friend] as string[] || [];
      if (!friendsGenres[domain]) friendsGenres[domain] = [];
      friendsGenres[domain].push(...friendGenres);
    }
  }

  const allRecommendations: Recommendation[] = [];

  for (const domain of targetDomains) {
    if (!ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES]) continue;

    const userGenres = new Set(user[`${domain}_interests` as keyof UserWithRecommendations] as string[] || []);
    const friendGenres = new Set(friendsGenres[domain] || []);
    let uniqueFriendGenres = [...friendGenres].filter(genre => !userGenres.has(genre));
    
    // Filter for valid genres that have Qloo API mappings
    uniqueFriendGenres = uniqueFriendGenres.filter(genre => GENRE_MAPPINGS[domain]?.[genre]);
    
    // If no valid friend genres, use fallback genres
    if (uniqueFriendGenres.length === 0) {
      console.log(`No valid friend genres found for ${domain}, using fallback genres`);
      uniqueFriendGenres = FALLBACK_GENRES[domain as keyof typeof FALLBACK_GENRES].filter(genre => !userGenres.has(genre));
      
      // If still empty (user has all fallback genres), use all fallback genres
      if (uniqueFriendGenres.length === 0) {
        uniqueFriendGenres = FALLBACK_GENRES[domain as keyof typeof FALLBACK_GENRES];
      }
    }

    // Randomize and limit the genres
    const shuffledGenres = uniqueFriendGenres.sort(() => Math.random() - 0.5);
    const selectedGenres = shuffledGenres.slice(0, Math.min(3, shuffledGenres.length));

    for (const genre of selectedGenres) {
      const genreTag = GENRE_MAPPINGS[domain]?.[genre];
      if (!genreTag) continue;

      const randomOffset = Math.floor(Math.random() * 5);
      const params = {
        "filter.type": ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES],
        "signalInterestsTags": genreTag,
        "signal.demographics.age": user.age_group || "25_to_29",
        "signal.demographics.gender": user.gender || "male",
        "filter.release_year.min": "15",
        "take": "6",
        "skip": randomOffset.toString()
      };

      const response = await makeQlooApiRequest(params);
      const recommendations = parseQlooResponse(response, domain);

      for (const rec of recommendations) {
        rec.relevance_score = calculateRelevanceScore(user, rec) * 0.8; // Friend-based discount
        
        // Check if this was from friends' actual interests or fallback
        const wasFriendGenre = friendGenres.has(genre);
        if (wasFriendGenre) {
          rec.explanation = `Recommended because your friends like ${genre} ${domain}`;
        } else {
          rec.explanation = `Popular ${genre} ${domain} others enjoy`;
        }
        
        // Add randomization factor
        rec.relevance_score += (Math.random() - 0.5) * 0.1;
      }

      allRecommendations.push(...recommendations);
    }
    
    // Safety net for friend-based recommendations too
    const domainRecommendations = allRecommendations.filter(rec => rec.entity_type === domain);
    if (domainRecommendations.length === 0) {
      console.log(`No friend-based recommendations found for ${domain}, trying emergency fallback`);
      
      const emergencyGenre = FALLBACK_GENRES[domain as keyof typeof FALLBACK_GENRES][0];
      const emergencyGenreTag = GENRE_MAPPINGS[domain]?.[emergencyGenre];
      
      if (emergencyGenreTag) {
        const emergencyParams = {
          "filter.type": ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES],
          "signalInterestsTags": emergencyGenreTag,
          "signal.demographics.age": "25_to_29",
          "signal.demographics.gender": "male",
          "take": "4"
        };
        
        const emergencyResponse = await makeQlooApiRequest(emergencyParams);
        const emergencyRecommendations = parseQlooResponse(emergencyResponse, domain);
        
        for (const rec of emergencyRecommendations) {
          rec.relevance_score = 0.4; // Lower relevance for friend-based fallback
          rec.explanation = `Trending ${emergencyGenre} ${domain} to explore`;
        }
        
        allRecommendations.push(...emergencyRecommendations);
      }
    }
  }

  // Sort by relevance score and remove duplicates
  const seenTitles = new Set();
  const uniqueRecommendations: Recommendation[] = [];
  
  for (const rec of allRecommendations.sort((a, b) => b.relevance_score - a.relevance_score)) {
    if (!seenTitles.has(rec.title)) {
      seenTitles.add(rec.title);
      uniqueRecommendations.push(rec);
    }
  }

  return uniqueRecommendations.slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user_based';
    const domains = searchParams.get('domains')?.split(',') || ['books', 'movies', 'podcasts'];
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user with all recommendation fields
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        full_name: true,
        age_group: true,
        gender: true,
        book_interests: true,
        movie_interests: true,
        podcast_interests: true,
        tv_show_interests: true,
        brand_interests: true,
        favorite_books: true,
        favorite_movies: true,
        favorite_podcasts: true,
        favorite_tv_shows: true,
        favorite_brands: true,
        content_rating_preference: true,
        min_popularity_threshold: true,
        recommendation_preferences: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let recommendations: Recommendation[] = [];

    switch (type) {
      case 'user_based':
        recommendations = await getUserBasedRecommendations(user as UserWithRecommendations, domains);
        break;
      case 'friend_based':
        recommendations = await getFriendBasedRecommendations(user as UserWithRecommendations, domains);
        break;
      case 'all':
        const [userBased, friendBased] = await Promise.all([
          getUserBasedRecommendations(user as UserWithRecommendations, domains),
          getFriendBasedRecommendations(user as UserWithRecommendations, domains)
        ]);
        recommendations = [...userBased, ...friendBased]
          .sort((a, b) => b.relevance_score - a.relevance_score)
          .slice(0, limit);
        break;
      default:
        recommendations = await getUserBasedRecommendations(user as UserWithRecommendations, domains);
    }

    // Save recommendation history
    for (const rec of recommendations) {
      await prisma.recommendationHistory.create({
        data: {
          userId: user.id,
          entity_id: rec.entity_id,
          entity_type: rec.entity_type,
          entity_title: rec.title,
          recommendation_type: type,
          relevance_score: rec.relevance_score,
          explanation: rec.explanation
        }
      });
    }

    return NextResponse.json({
      success: true,
      type,
      domains,
      recommendations: recommendations.slice(0, limit),
      total: recommendations.length
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 