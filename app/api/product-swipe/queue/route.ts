import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const productQueueItems = await prisma.productSwipeQueue.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        position: 'asc',
      },
      take: limit,
      select: {
        productId: true,
        productTitle: true,
        productImageUrl: true,
        productPageUrl: true,
        productRating: true,
        productNumReviews: true,
        productPrice: true,
        productStoreName: true,
        productDescription: true, // Make sure to select the new description field
        productDetails: true,
      },
    });

    const productsWithDetails = productQueueItems.map(item => ({
      product_id: item.productId,
      productTitle: item.productTitle || '',
      productDescription: item.productDescription || 'No description available.',
      productImageUrl: item.productImageUrl || '/placeholder.svg',
      productPrice: item.productPrice,
      productStoreName: item.productStoreName,
      productNumReviews: item.productNumReviews,
      productRating: item.productRating,
      productPageUrl: item.productPageUrl,
      // The 'offer' and 'product_photos' etc. are old fields, if still needed for compatibility
      // you can map them from productDetails or keep them optional in the Product interface.
      // For now, mapping directly from the new fields.
      productDetails: item.productDetails, // Keep the raw details if needed
    }));

    console.log('Backend API response (productsWithDetails):', productsWithDetails);
    return NextResponse.json(productsWithDetails);
  } catch (error) {
    console.error('Error fetching product swipe queue:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 