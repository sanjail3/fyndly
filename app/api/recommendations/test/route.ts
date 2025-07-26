import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

function calculateRelevanceScore(user: UserWithRecommendations, recommendation: Recommendation): number {
  let score = 0.4; // Base score

  // Genre matching boost
  const userAllGenres = [
    ...(user.book_interests || []),
    ...(user.movie_interests || []),
    ...(user.podcast_interests || []),
    ...(user.tv_show_interests || []),
    ...(user.brand_interests || [])
  ];

  const genreMatches = userAllGenres.filter(genre => 
    recommendation.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
  );
  score += genreMatches.length * 0.2;

  // Popularity factor
  score += recommendation.popularity * 0.25;

  // External ratings boost
  if (recommendation.external_ratings) {
    let ratingBoost = 0;
    if (recommendation.external_ratings.imdb_rating) {
      ratingBoost += (recommendation.external_ratings.imdb_rating / 10) * 0.1;
    }
    if (recommendation.external_ratings.goodreads_rating) {
      ratingBoost += (recommendation.external_ratings.goodreads_rating / 5) * 0.1;
    }
    score += ratingBoost;
  }

  return Math.min(1.0, score);
}

async function getUserBasedRecommendations(user: UserWithRecommendations, targetDomains: string[] = ["books", "movies", "podcasts"]): Promise<Recommendation[]> {
  const allRecommendations: Recommendation[] = [];

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
    
    for (const genre of userGenres) {
      const genreTag = GENRE_MAPPINGS[domain]?.[genre];
      if (!genreTag) continue;

      const params = {
        "filter.type": ENTITY_TYPES[domain as keyof typeof ENTITY_TYPES],
        "signalInterestsTags": genreTag,
        "signal.demographics.age": user.age_group || "25_to_29",
        "signal.demographics.gender": user.gender === "other" ? "male" : (user.gender || "male"),
        "filter.release_year.min": "22",
        "take": "5"
      };

      const response = await makeQlooApiRequest(params);
      const recommendations = parseQlooResponse(response, domain);

      for (const rec of recommendations) {
        rec.relevance_score = calculateRelevanceScore(user, rec);
        rec.explanation = `Recommended because you like ${genre} ${domain}`;
      }

      allRecommendations.push(...recommendations);
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user_based';
    const domains = searchParams.get('domains')?.split(',') || ['books', 'movies', 'podcasts'];
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get a test user (first user from database)
    const user = await prisma.users.findFirst({
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
      return NextResponse.json({ error: 'No users found in database' }, { status: 404 });
    }

    let recommendations: Recommendation[] = [];

    switch (type) {
      case 'user_based':
        recommendations = await getUserBasedRecommendations(user as UserWithRecommendations, domains);
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
      user: {
        id: user.id,
        full_name: user.full_name,
        interests: {
          book_interests: user.book_interests,
          movie_interests: user.movie_interests,
          podcast_interests: user.podcast_interests
        }
      },
      recommendations: recommendations.slice(0, limit),
      total: recommendations.length
    });

  } catch (error) {
    console.error('Test Recommendation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 