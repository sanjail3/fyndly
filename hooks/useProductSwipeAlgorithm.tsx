import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { useUserProfile } from './useUserProfile';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { Star, ExternalLink, ShoppingCart } from 'lucide-react';

interface Product {
  product_id: string;
  productTitle: string; // Primary product title
  productDescription: string; // Primary product description
  productImageUrl?: string; // Primary product image URL
  productPrice?: string; // Primary product price
  productStoreName?: string; // Primary product store name
  productNumReviews?: number; // Primary number of reviews
  productRating?: number; // Primary product rating
  productPageUrl?: string; // Primary product page URL
  // Old fields for backward compatibility (should eventually be removed)
  product_title?: string;
  product_description?: string;
  product_photos?: string[];
  product_rating?: number;
  product_page_url?: string;
  offer?: {
    price?: string;
    store_name?: string;
    offer_page_url?: string;
  };
  productDetails?: any; // To hold the full JSON object
}

interface ProductSwipeAlgorithmResult {
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
  productQueue: Product[];
  hasMoreProducts: boolean;
  handleProductSwipe: (direction: 'left' | 'right') => Promise<Product | null>; // Modified to return Promise
  refreshProductQueue: () => void;
  clearProductQueue: () => void;
}

export const useProductSwipeAlgorithm = (): ProductSwipeAlgorithmResult => {
  const [productQueue, setProductQueue] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isQueueRefilling, setIsQueueRefilling] = useState(false);
  const [swipedProductIds, setSwipedProductIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('swipedProductIds');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const { profile: userProfileData } = useUserProfile();
  const { toast } = useToast();

  // Debugging logs for current state
  console.log('Render: productQueue.length', productQueue.length, 'currentIndex', currentIndex);

  const fetchFromProductQueue = useCallback(async (): Promise<Product[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      let response = await fetch(`/api/product-swipe/queue?userId=${user.id}&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch product swipe queue');
      let queueItems = await response.json();
      console.log('Fetched queue items from backend:', queueItems);

      // IMPORTANT: Remove this filter here. Filtering based on swipedProductIds
      // should happen when merging new products into the state.
      // queueItems = queueItems.filter((item: any) => !swipedProductIds.has(item.productId));

      // If queue is empty, trigger queue generation and re-fetch, mirroring useSwipeAlgorithm
      if (queueItems.length === 0) {
        console.log("Product queue empty, triggering generation and re-fetch...");
        const { data: { session } } = await supabase.auth.getSession();
        await fetch(`/api/product-swipe/queue/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`
          },
          body: JSON.stringify({ userId: user.id })
        });
        // Wait a moment for the queue to be generated
        await new Promise(res => setTimeout(res, 1000));
        // Re-fetch the queue after generation
        response = await fetch(`/api/product-swipe/queue?userId=${user.id}&limit=50`);
        if (!response.ok) throw new Error('Failed to fetch product swipe queue after generation');
        queueItems = await response.json();
        console.log('Fetched queue items after generation:', queueItems);

        // Clear swipedProductIds after queue generation to sync frontend and backend
        setSwipedProductIds(new Set());
        if (typeof window !== 'undefined') {
          localStorage.removeItem('swipedProductIds');
          console.log('Cleared swipedProductIds in localStorage after generation.');
        }
      }

      // Map ProductSwipeQueue items to the Product interface expected by ProductCard
      const products: Product[] = queueItems.map((item: any) => {
        console.log('Mapping current item from backend:', item);
        console.log('Mapping item.productId:', item.productId);
        return {
          product_id: item.product_id, // Corrected from item.productId to item.product_id
          productTitle: item.productTitle || item.product_title || '', // Prioritize new field, fallback to old or empty
          productDescription: item.productDescription || item.product_description || 'No description available.', // Prioritize new field, fallback to old or default
          productImageUrl: item.productImageUrl || (item.product_photos && item.product_photos.length > 0 ? item.product_photos[0] : undefined),
          productPrice: item.productPrice || item.offer?.price,
          productStoreName: item.productStoreName || item.offer?.store_name,
          productNumReviews: item.productNumReviews || item.product_num_reviews,
          productRating: item.productRating || item.product_rating || 0,
          productPageUrl: item.productPageUrl || item.product_page_url,
          // Include old fields for backward compatibility if they might still come from some sources
          product_title: item.product_title,
          product_description: item.product_description,
          product_photos: item.product_photos,
          product_rating: item.product_rating,
          product_page_url: item.product_page_url,
          offer: item.offer,
          productDetails: item.productDetails,
        };
      });

      return products; // Simply return fetched products, generation logic moved to refill
    } catch (error) {
      console.error("Error fetching from product queue:", error);
      return [];
    }
  }, [swipedProductIds]);

  const refillQueueIfNeeded = useCallback(async () => {
    // Refill logic should check the *local* queue size relative to currentIndex
    // Adjusted condition for refill (now that currentIndex is effectively always 0 or 1 after slice)
    // Changed condition to match useSwipeAlgorithm for when to trigger a fetch
    if (productQueue.length === 0 && !isQueueRefilling) { 
      setIsQueueRefilling(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsQueueRefilling(false);
        return;
      }
      
      // Generation is now handled within fetchFromProductQueue if the initial fetch is empty.
      const newProducts = await fetchFromProductQueue(); // This call will handle generation if empty
      console.log('Refill: New products fetched (before dedupe):', newProducts);

      if (newProducts.length > 0) {
        setProductQueue(prev => {
          // Deduplicate against already swiped and existing products in the current queue
          const existingProductIds = new Set(prev.map(p => p.product_id));
          console.log('Refill: Existing product IDs in queue:', Array.from(existingProductIds));
          console.log('Refill: Swiped product IDs:', Array.from(swipedProductIds));

          const uniqueNewProducts = newProducts.filter(np => 
            !swipedProductIds.has(np.product_id) && 
            !existingProductIds.has(np.product_id)
          );
          console.log('Refill: Unique new products (after dedupe):', uniqueNewProducts);
          // For FIFO, we replace or append. Let's keep it simple and replace the *entire* queue
          // with newly fetched and unique products for better consistency with useSwipeAlgorithm.
          // The swipedProductIds will ensure previously swiped items don't re-appear if generated again.
          return uniqueNewProducts;
        });
        setCurrentIndex(0); 
      }
      setIsQueueRefilling(false);
    }
  }, [productQueue.length, isQueueRefilling, fetchFromProductQueue, swipedProductIds]); // Added swipedProductIds to deps

  const initializeProductQueue = useCallback(async () => {
    setLoading(true);
    try {
      const initialProducts = await fetchFromProductQueue(); // This will now handle generation if empty
      console.log('Initialize: Initial products fetched:', initialProducts);
      setProductQueue(initialProducts);
      console.log('Initialize: productQueue after set:', initialProducts.length);
      setCurrentIndex(0); // Always start from the beginning of the newly fetched queue
      // swipedProductIds reset handled inside fetchFromProductQueue during generation
    } catch (e) {
      console.error("Initialize: Error during initialization:", e);
      setProductQueue([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFromProductQueue]);

  useEffect(() => {
    if (userProfileData) {
      console.log('Effect: userProfileData changed, initializing queue.');
      initializeProductQueue();
    }
  }, [userProfileData, initializeProductQueue]);

  useEffect(() => {
    console.log('Effect: productQueue.length, loading, isQueueRefilling changed. Current state:', { productQueueLength: productQueue.length, loading, isQueueRefilling });
    if (!loading && productQueue.length === 0) { // Simplified trigger: only refill if queue is empty and not loading
      refillQueueIfNeeded();
    }
  }, [productQueue.length, loading, isQueueRefilling, refillQueueIfNeeded]); // Removed currentIndex from deps as it's less relevant for this trigger

  // Persist swipedProductIds to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('swipedProductIds', JSON.stringify(Array.from(swipedProductIds)));
      console.log('Current swipedProductIds (persisted):', Array.from(swipedProductIds));
    }
  }, [swipedProductIds]);

  const handleProductSwipe = useCallback(async (direction: 'left' | 'right'): Promise<Product | null> => {
    if (productQueue.length === 0) {
      console.warn("Attempted to swipe on an empty product queue.");
      return null;
    }

    const swipedProduct = productQueue[0]; // Always swipe the first item in FIFO

    // Essential check: ensure product_id exists before proceeding
    if (!swipedProduct?.product_id) { // Use optional chaining for safety
      console.error("Swiped product is missing product_id:", swipedProduct);
      toast({
        variant: "destructive",
        title: "Swipe Error",
        description: "Product data is incomplete. Cannot save swipe."
      });
      // Remove the problematic product and continue
      setProductQueue(prev => prev.slice(1));
      return null;
    }

    // Remove the swiped product from the queue (FIFO)
    setProductQueue(prev => prev.slice(1));
    setSwipedProductIds(prev => new Set(prev).add(swipedProduct.product_id));

    // Fire-and-forget backend update
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        await fetch('/api/product-swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: swipedProduct.product_id, // Ensure this is explicitly passed
            direction: direction.toUpperCase(),
          }),
        });
        // No direct `sendConnectionRequest` equivalent for products, so just log success
      } catch (error) {
        console.error("Error logging product swipe:", error);
        toast({
          variant: "destructive",
          title: "Swipe Error",
          description: "Could not save your product swipe. Please try again."
        });
      }
    })();

    return swipedProduct; // Return the swiped product for toast notification
  }, [currentIndex, productQueue, swipedProductIds, toast]);

  const refreshProductQueue = useCallback(async () => { // Made async
    setLoading(true);
    setCurrentIndex(0);
    setSwipedProductIds(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('swipedProductIds');
    }
    // Trigger a fresh fetch which will handle generation if empty
    const newProducts = await fetchFromProductQueue();
    setProductQueue(newProducts);
    setLoading(false);
  }, [fetchFromProductQueue]);

  const clearProductQueue = useCallback(async () => {
    setProductQueue([]);
    setCurrentIndex(0);
    setSwipedProductIds(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('swipedProductIds');
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await fetch(`/api/product-swipe/queue/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
    }
    // After clearing, re-initialize to fetch a fresh queue (which might trigger generation)
    initializeProductQueue();
  }, [initializeProductQueue]);

  const currentProduct = productQueue[0] || null; // currentProduct is always the first in FIFO
  const hasMoreProducts = productQueue.length > 0; // Check if there are any products left

  return {
    currentProduct,
    loading,
    error: null, // No error state in this version
    productQueue,
    hasMoreProducts,
    handleProductSwipe,
    refreshProductQueue,
    clearProductQueue,
  };
}; 