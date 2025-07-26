import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseService } from '@/integrations/supabase/service-client'; // Added for session fallback

const QLOO_API_KEY = process.env.QLOO_API_KEY;
const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2/insights";
const APYFLUX_API_KEY = process.env.APYFLUX_API_KEY;
const APYFLUX_APP_ID = process.env.APYFLUX_APP_ID;
const APYFLUX_CLIENT_ID = process.env.APYFLUX_CLIENT_ID;
const APYFLUX_BASE_URL = "https://gateway.apyflux.com/v2/search";

// Helper to make Qloo API requests (copied from product-recommendations route)
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
    console.error(`Qloo API Response Content: ${await response.text()}`);
    return null;
  }
  return await response.json();
}

// Helper to make ApyFlux API requests (copied from product-recommendations route)
async function makeApyFluxApiRequest(query: string): Promise<any> {
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

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // No specific filters like college/department for products currently, but can be added later.

  const supabase = createServerComponentClient({ cookies });

  // Auth logic (copied from people swipe generate route)
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.split('Bearer ')[1];
  let session;

  if (jwt) {
    const { data: { user } } = await supabase.auth.getUser(jwt);
    if (user) {
      session = { user };
    }
  }

  if (!session) {
    const { data } = await supabaseService.auth.getSession();
    if (data.session) {
      session = data.session;
    }
  }
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Clear existing product queue for the user
    // Removed as per new flow: Queue should be appended, not fully replaced on generation.
    // await prisma.productSwipeQueue.deleteMany({
    //   where: { userId: userId },
    // });

    // Fetch user data including product interests and favorite brands/products
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        product_interests: true,
        brand_interests: true,
        favorite_brands: true,
        favorite_products: true,
        // recommendation_preferences: true, // You might need this if you add more filters to ApyFlux
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Qloo brand genre mappings (copied from product-recommendations route)
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

    // Build search set for ApyFlux (copied from product-recommendations route)
    const brandsToSearch = new Set<string>();
    qlooBrandRecommendations.forEach(qlooEntity => brandsToSearch.add(qlooEntity.name));
    if (user.favorite_brands) user.favorite_brands.forEach(brand => brandsToSearch.add(brand));
    if (user.favorite_products) user.favorite_products.forEach(product => brandsToSearch.add(product));

    let productRecommendations: any[] = [];

    const searchQueries: string[] = [];
    if (user.product_interests && user.product_interests.length > 0) {
        searchQueries.push(...user.product_interests.slice(0, 3)); // Prioritize product_interests
    } else if (brandsToSearch.size > 0) {
        searchQueries.push(...Array.from(brandsToSearch).slice(0, 3));
    }

    // Fetch products from ApyFlux
    for (const query of searchQueries) {
      const apyFluxResponse = await makeApyFluxApiRequest(query);
      if (apyFluxResponse && apyFluxResponse.data?.products) {
        productRecommendations.push(...apyFluxResponse.data.products);
      }
    }

    // Basic deduplication based on product_id
    const uniqueProducts = Array.from(new Map(productRecommendations.map(p => [p.product_id, p])).values());

    if (uniqueProducts.length === 0) {
      return NextResponse.json({ message: "No new product candidates found." });
    }

    // Prepare data for ProductSwipeQueue
    const queueData = uniqueProducts.map((p, index) => ({
      userId: userId,
      productId: p.product_id,
      productTitle: p.product_title || null,
      productImageUrl: p.product_photos && p.product_photos.length > 0 ? p.product_photos[0] : null,
      productPageUrl: p.product_page_url || null,
      productRating: p.product_rating || null,
      productNumReviews: p.product_num_reviews || null,
      productPrice: p.offer?.price || null,
      productStoreName: p.offer?.store_name || null,
      productDescription: p.product_description || null, // Map description
      productDetails: p || null, // Store the full product object as JSONB
      score: p.product_rating || 0, // Using product_rating as a simple score
      position: index,
    }));

    // Save to ProductSwipeQueue
    await prisma.productSwipeQueue.createMany({
      data: queueData,
      skipDuplicates: true, // Important to avoid errors if some products are already in queue
    });

    return NextResponse.json({ message: "Product swipe queue generated successfully" });
  } catch (error) {
    console.error("Error generating product swipe queue:", error);
    return NextResponse.json({ error: 'Failed to generate product swipe queue' }, { status: 500 });
  }
} 