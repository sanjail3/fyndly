import { NextResponse } from 'next/server';

// Qloo API config and helpers (copied from chat/route.ts)
const QLOO_API_KEY = "WLkwwcOW14J5LMLQPPAGEQ3L8UTmEgvDboc_1B_YcuE";
const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2/insights";
const ENTITY_TYPES: { [key: string]: string } = {
  books: "urn:entity:book",
  movies: "urn:entity:movie",
  podcasts: "urn:entity:podcast",
  tv_shows: "urn:entity:tv_show"
};
const GENRE_MAPPINGS: { [key: string]: { [key: string]: string } } = {
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
  }
};
async function makeQlooApiRequest(params: Record<string, string>): Promise<any> {
  const response = await fetch(`${QLOO_BASE_URL}?${new URLSearchParams(params)}`, {
    headers: {
      'accept': 'application/json',
      'X-Api-Key': QLOO_API_KEY
    }
  });
  if (!response.ok) return null;
  return await response.json();
}
function parseQlooResponse(response: any, entityType: string): any[] {
  if (!response || !response.success) return [];
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
      relevance_score: 0.0,
      explanation: ""
    };
  });
}

export async function POST(request: Request) {
  try {
    const { functionCall = {} } = await request.json();
    const { name, genres = [], age_group = "25_to_29", gender = "male", limit = 5 } = functionCall;
    let domain = null;
    if (name === 'recommendBooks') domain = 'books';
    if (name === 'recommendMovies') domain = 'movies';
    if (name === 'recommendPodcasts') domain = 'podcasts';
    if (name === 'recommendTVShows') domain = 'tv_shows';
    if (!domain) {
      return NextResponse.json({ error: 'Invalid function name for Qloo recommendation.' }, { status: 400 });
    }

    const genreTags = (genres || []).map((g: string) => GENRE_MAPPINGS[domain]?.[g] || g).filter(Boolean);
    if (genreTags.length === 0) {
      return NextResponse.json([]);
    }

    const params = {
      "filter.type": ENTITY_TYPES[domain],
      "signalInterestsTags": genreTags.join(','),
      "signal.demographics.age": "25_to_29",
      "signal.demographics.gender": gender === 'other' ? 'male' : gender,
      "filter.release_year.min": "22",
      "take": String(limit)
    };
    const qlooResponse = await makeQlooApiRequest(params);
    const recommendations = parseQlooResponse(qlooResponse, domain);
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error in Qloo recommendation endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process Qloo recommendation request' },
      { status: 500 }
    );
  }
} 