import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, X, ShoppingCart, RefreshCw } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { useProductSwipeAlgorithm } from '@/hooks/useProductSwipeAlgorithm';

interface Product {
  product_id: string;
  product_title: string;
  product_description: string;
  product_photos: string[];
  product_rating: number;
  product_page_url: string;
  offer?: {
    price: string;
    store_name: string;
    offer_page_url?: string;
  };
}

// Add a reusable LoadingIcon component for rolling logo
function LoadingIcon({ size = 64, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/icon.png"
        alt="Fyndly Logo"
        className={`rounded-2xl shadow-xl animate-spin-slow`}
        style={{ width: size, height: size, animation: 'spin 1.2s linear infinite' }}
      />
      {message && <p className="text-gray-400 mt-4">{message}</p>}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
}

const ProductRecommender: React.FC = () => {
  const { profile: userProfileData } = useUserProfile();
  const { toast } = useToast();
  
  const { 
    currentProduct, 
    loading, 
    error, 
    hasMoreProducts, 
    handleProductSwipe, // Use directly from hook
    refreshProductQueue, // Use directly from hook
  } = useProductSwipeAlgorithm();

  // Swiping states (still managed locally for UI animation)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const [isCardTransitioning, setIsCardTransitioning] = useState(false);
  const [showSwipeSpinner, setShowSwipeSpinner] = useState(false);
  const [swipeTimeoutId, setSwipeTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); 

  // Unified swipe action handler
  const handleSwipeAction = (direction: 'left' | 'right') => {
    setShowSwipeSpinner(false);
    setIsCardTransitioning(false); 
    if (swipeTimeoutId) {
      clearTimeout(swipeTimeoutId);
      setSwipeTimeoutId(null);
    }
    if (isCardTransitioning) return; 

    setIsCardTransitioning(true); 
    const timeoutId = setTimeout(() => setShowSwipeSpinner(true), 500); 
    setSwipeTimeoutId(timeoutId);

    setSwipeDirection(direction);

    setTimeout(async () => { 
      const swipedProduct = await handleProductSwipe(direction); // Call hook's swipe handler

      if (direction === 'right' && swipedProduct) {
        toast({
          title: 'Added to Cart!',
          description: `${swipedProduct.product_title} has been added. 🛒`,
          variant: 'default',
          duration: 2500,
        });
      }

      setSwipeDirection(null);
      setDragOffset(0);
      setIsCardTransitioning(false); 
      setShowSwipeSpinner(false);
      if (swipeTimeoutId) {
        clearTimeout(swipeTimeoutId);
        setSwipeTimeoutId(null);
      }
    }, 300); // Animation duration
  };

  // Keep handleSearch local and call hook's refresh
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    refreshProductQueue(); 
  };

  // Touch/Mouse event handlers (remain mostly the same)
  const handleStart = (clientX: number) => {
    if (isCardTransitioning) return;
    startX.current = clientX;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || isCardTransitioning) return;
    const diff = clientX - startX.current;
    const maxOffset = Math.min(window.innerWidth * 0.8, 320);
    setDragOffset(Math.max(-maxOffset, Math.min(diff, maxOffset)));
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        handleSwipeAction('right');
      } else {
        handleSwipeAction('left');
      }
    } else {
      setDragOffset(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleCartClick = () => {
    handleSwipeAction('right');
  };

  const handlePassClick = () => {
    handleSwipeAction('left');
  };

  if (!userProfileData) {
    return <div className="text-center text-gray-500">Loading user profile for product recommendations...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black">
      <form onSubmit={handleSearch} className="flex gap-2 mb-6 w-full max-w-lg">
        <Input
          type="text"
          placeholder="Search products (e.g., Nike shoes, headphones)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-[#CAFE32]"
        />
        <Button type="submit" className="bg-[#CAFE32] text-gray-900 hover:bg-[#CAFE32]/90">
          Search
        </Button>
      </form>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-[#CAFE32]" />
            <p className="ml-2 text-[#CAFE32]">Finding products...</p>
          </div>
        ) : (!currentProduct && !hasMoreProducts) ? (
          <div className="text-center space-y-6">
              <div className="text-6xl">🤷‍♀️</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">All caught up!</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  No more product recommendations at the moment. Check back later!
                </p>
              </div>
              <Button
                onClick={refreshProductQueue}
                className="bg-[#CAFE33] text-black hover:bg-[#B8E62E] font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
        ) : (
          <div className="relative w-full flex flex-col items-center">
            {isCardTransitioning && showSwipeSpinner && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 rounded-2xl">
                <LoadingIcon size={56} message="Processing product..." />
              </div>
            )}
            {currentProduct && (
              <div
                ref={cardRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                className="w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing rounded-2xl shadow-lg transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(${dragOffset}px) rotate(${dragOffset / 20}deg)`,
                  opacity: isDragging || dragOffset !== 0 ? Math.max(0.5, 1 - Math.abs(dragOffset) / 200) : swipeDirection ? 0 : 1,
                }}
              >
                <ProductCard product={currentProduct} />
                {dragOffset > 50 && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10 pointer-events-none animate-fade-in rounded-2xl">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-xl">
                      ADD TO CART 🛒
                    </div>
                  </div>
                )}
                {dragOffset < -50 && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10 pointer-events-none animate-fade-in rounded-2xl">
                    <div className="bg-red-500 text-white px-6 py-3 rounded-full font-bold text-xl shadow-xl">
                      SKIP 👎
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Swipe action buttons below the card */}
      {currentProduct && !loading && !error && (
        <div className="flex justify-center items-center w-full py-4 gap-6 flex-shrink-0 mt-6 mb-8">
          <Button
            onClick={handlePassClick}
            size="icon"
            className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 text-red-500 shadow-lg border border-red-500/20 hover:scale-105 transition-transform"
            disabled={isCardTransitioning}
          >
            <X className="h-8 w-8" />
          </Button>
          <Button
            onClick={handleCartClick}
            size="icon"
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#CAFE32] to-[#30C77B] text-black shadow-2xl shadow-[#CAFE32]/30 border-2 border-white/50 hover:scale-110 transition-transform animate-pulse-slow"
            disabled={isCardTransitioning}
          >
            <ShoppingCart className="h-10 w-10" fill="currentColor" />
          </Button>
        </div>
      )}
      <style jsx global>{`
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes pulse-slow {
          50% {
            box-shadow: 0 0 25px 5px rgba(202, 254, 51, 0.4);
          }
        }
      `}</style>
    </div>
  );
};

export default ProductRecommender; 