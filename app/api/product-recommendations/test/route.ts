// app/api/product-recommendations/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const QLOO_API_KEY = process.env.QLOO_API_KEY;
const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2/insights";
const APYFLUX_API_KEY = process.env.APYFLUX_API_KEY;
const APYFLUX_BASE_URL = "https://gateway.apyflux.com/v2/search-v2";

// Helper to make Qloo API requests (copied from main route)
async function makeQlooApiRequest(params: Record<string, string>): Promise<any> {
  if (!QLOO_API_KEY) {
    console.error("QLOO_API_KEY is not set.");
    return null;
  }
  const response = await fetch(`${QLOO_BASE_URL}?${new URLSearchParams(params)}`, {
    headers: {
      'accept': 'application/json',
      'X-Api-Key': QLOO_API_KEY
    }
  });
  if (!response.ok) {
    console.error(`Qloo API Error: ${response.status} ${response.statusText}`);
    return null;
  }
  return await response.json();
}

// Helper to make ApyFlux API requests (copied from main route)
async function makeApyFluxApiRequest(query: string, preferences: any): Promise<any> {
  if (!APYFLUX_API_KEY) {
    console.error("APYFLUX_API_KEY is not set.");
    return null;
  }

  const params = new URLSearchParams({
    q: query,
    language: 'en',
    limit: '10',
    sort_by: 'BEST_MATCH',
    ...(preferences.product_categories_of_interest && preferences.product_categories_of_interest.length > 0 && { category: preferences.product_categories_of_interest.join(',') }),
    ...(preferences.min_product_rating && { min_rating: preferences.min_product_rating.toString() }),
    ...(preferences.max_product_price && { max_price: preferences.max_product_price.toString() }),
  });

  const response = await fetch(`${APYFLUX_BASE_URL}?${params}`, {
    headers: {
      'accept': 'application/json',
      'X-Api-Key': APYFLUX_API_KEY,
    }
  });

  if (!response.ok) {
    console.error(`ApyFlux API Error: ${response.status} ${response.statusText}`);
    return null;
  }
  return await response.json();
}

export async function GET(request: NextRequest) {
  const testUserId = 'c89e27ce-5dc5-4c84-ad39-947bfddcc84b'; 
  
  try {
    const user = await prisma.users.findUnique({
      where: { id: testUserId },
      select: {
        id: true,
        full_name: true,
        favorite_brands: true,
        product_interests: true,
        recommendation_preferences: true,
        brand_interests: true,
        favorite_products: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Test user not found' }, { status: 404 });
    }

    const preferences = user.recommendation_preferences ? JSON.parse(JSON.stringify(user.recommendation_preferences)) : {};

    // Qloo brand genre mappings
    const BRAND_GENRE_MAPPINGS = {
      "technology": "urn:tag:category:brand:technology",
      "lifestyle": "urn:tag:category:brand:lifestyle",
      "fashion": "urn:tag:category:brand:fashion",
      "food": "urn:tag:category:brand:food",
      "automotive": "urn:tag:category:brand:automotive",
      "entertainment": "urn:tag:category:brand:entertainment"
    };

    let qlooBrandRecommendations: any[] = [];
    if (user.brand_interests && user.brand_interests.length > 0) {
      for (const brandInterest of user.brand_interests) {
        const tag = BRAND_GENRE_MAPPINGS[brandInterest as keyof typeof BRAND_GENRE_MAPPINGS];
        if (!tag) continue;
        const qlooParams = {
          "filter.type": "urn:entity:brand",
          "signalInterestsTags": tag,
          "take": "5"
        };
        const qlooResponse = await makeQlooApiRequest(qlooParams);
        if (qlooResponse && qlooResponse.success) {
          qlooBrandRecommendations.push(...(qlooResponse.results?.entities || []));
        }
      }
    }

    // Build search set for ApyFlux
    const brandsToSearch = new Set<string>();
    qlooBrandRecommendations.forEach(qlooEntity => brandsToSearch.add(qlooEntity.name));
    if (user.favorite_brands) user.favorite_brands.forEach(brand => brandsToSearch.add(brand));
    if (user.favorite_products) user.favorite_products.forEach(product => brandsToSearch.add(product));

    let productRecommendations: any[] = [];

    if (brandsToSearch.size > 0) {
      const searchQueries = Array.from(brandsToSearch).slice(0, 3);
      for (const query of searchQueries) {
        console.log(`Searching ApyFlux for: ${query}`); // Debug log
        const apyFluxResponse = await makeApyFluxApiRequest(query, preferences);
        if (apyFluxResponse && apyFluxResponse.data?.products) {
          productRecommendations.push(...apyFluxResponse.data.products);
        }
      }
    }

    const uniqueProducts = Array.from(new Map(productRecommendations.map(p => [p.product_id, p])).values());

    return NextResponse.json(uniqueProducts);

  } catch (error) {
    console.error('Error in product recommendations test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate test product recommendations' },
      { status: 500 }
    );
  }
} 