// app/api/product-recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { supabaseService } from '@/integrations/supabase/service-client';

const QLOO_API_KEY = process.env.QLOO_API_KEY;
const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2/insights";
const APYFLUX_API_KEY = process.env.APYFLUX_API_KEY;
const APYFLUX_APP_ID = process.env.APYFLUX_APP_ID;
const APYFLUX_CLIENT_ID = process.env.APYFLUX_CLIENT_ID;
const APYFLUX_BASE_URL = "https://gateway.apyflux.com/v2/search";

// Helper to make Qloo API requests
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

// Helper to make ApyFlux API requests
async function makeApyFluxApiRequest(query: string, preferences: any): Promise<any> {
  if (!APYFLUX_API_KEY) {
    console.error("APYFLUX_API_KEY is not set.");
    return null;
  }
  if (!APYFLUX_CLIENT_ID) {
    console.error("APYFLUX_CLIENT_ID is not set.");
    return null;
  }

  const params = new URLSearchParams({
    q: query,
    language: 'en',
    limit: '10',
    sort_by: 'BEST_MATCH',
    // Removed preferences related parameters as per Python example
  });

  const response = await fetch(`${APYFLUX_BASE_URL}?${params}`, {
    headers: {
      'accept': 'application/json',
      'X-App-Id': APYFLUX_APP_ID || '',
      'X-Client-Id': APYFLUX_CLIENT_ID || '',
      'X-Api-Key': APYFLUX_API_KEY,
    }
  });

  if (!response.ok) {
    console.error(`ApyFlux API Error: ${response.status} ${response.statusText}`);
    console.error(`ApyFlux API Response Content: ${await response.text()}`);
    return null;
  }
  return await response.json();
}

export async function GET(request: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies });
  

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        favorite_brands: true,
        product_interests: true,
        recommendation_preferences: true, // Fetch preferences including product filters
        brand_interests: true, // Add brand_interests to select
        favorite_products: true, // Add favorite_products to select
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse recommendation_preferences safely
    const preferences = user.recommendation_preferences ? JSON.parse(JSON.stringify(user.recommendation_preferences)) : {};

    // Qloo brand genre mappings
    const BRAND_GENRE_MAPPINGS: Record<string, string> = {
      "technology": "urn:tag:genre:brand:tech",
      "lifestyle": "urn:tag:genre:brand:lifestyle",
      "fashion": "urn:tag:genre:brand:fashion",
      "food": "urn:tag:genre:brand:food",
      "automotive": "urn:tag:genre:brand:automotive",
      "entertainment": "urn:tag:genre:brand:entertainment"
    };

    let qlooBrandRecommendations: any[] = [];
    if (user.brand_interests && user.brand_interests.length > 0) {
      for (const brandInterest of user.brand_interests) {
        const tag = BRAND_GENRE_MAPPINGS[brandInterest as keyof typeof BRAND_GENRE_MAPPINGS];
        if (!tag) continue;
        const qlooParams = {
          "filter.type": "urn:entity:brand",
          "signalInterestsTags": tag,
          "take": "5",
          "filter.popularity.min": "0.1"
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

    // Modify this section to use product_interests for ApyFlux if available
    const searchQueries: string[] = [];
    if (user.product_interests && user.product_interests.length > 0) {
        searchQueries.push(...user.product_interests.slice(0, 3)); // Prioritize product_interests
    } else if (brandsToSearch.size > 0) {
        searchQueries.push(...Array.from(brandsToSearch).slice(0, 3));
    }

    for (const query of searchQueries) {
        const apyFluxResponse = await makeApyFluxApiRequest(query, preferences);
        if (apyFluxResponse && apyFluxResponse.data?.products) {
            productRecommendations.push(...apyFluxResponse.data.products);
        }
    }

    // Basic deduplication based on product_id
    const uniqueProducts = Array.from(new Map(productRecommendations.map(p => [p.product_id, p])).values());

    return NextResponse.json(uniqueProducts);

  } catch (error) {
    console.error('Error in product recommendations endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate product recommendations' },
      { status: 500 }
    );
  }
} 