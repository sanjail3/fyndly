import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, ExternalLink, ShoppingCart, DollarSign, Store, Tag } from 'lucide-react';
import React from 'react';

interface ProductFullModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
}

const ProductFullModal: React.FC<ProductFullModalProps> = ({ open, onClose, product }) => {
  if (!product) return null;
  const imageUrl = product.productImageUrl || (product.product_photos && product.product_photos.length > 0 ? product.product_photos[0] : '/placeholder.svg');

  const handleViewProduct = () => {
    if (product.productPageUrl) {
      window.open(product.productPageUrl, '_blank');
    }
  };
  const handleBuyNow = () => {
    if (product.productPageUrl) {
      window.open(product.productPageUrl, '_blank');
    }
  };

  // Extract more details if available
  const details = product.productDetails || {};
  const attributes = details.product_attributes || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-auto p-0 bg-black border-[#CAFE33]/50 max-h-[95vh] overflow-hidden rounded-3xl">
        {/* Header with Gradient and Image */}
        <div className="relative h-56 bg-gradient-to-br from-[#CAFE33] to-[#30C77B] flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.productTitle || 'Product Image'}
            className="max-h-48 max-w-full object-contain rounded-2xl shadow-xl border-4 border-white/20 bg-white/10"
          />
        </div>
        {/* Content */}
        <div className="pt-6 px-6 pb-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white mb-1">{product.productTitle}</h1>
            <div className="flex flex-wrap justify-center gap-3 mb-2">
              {product.productPrice && (
                <span className="flex items-center gap-1 bg-[#CAFE33]/20 text-[#CAFE33] px-3 py-1 rounded-full font-bold text-lg">
                  <DollarSign size={18} /> {product.productPrice}
                </span>
              )}
              {product.productStoreName && (
                <span className="flex items-center gap-1 bg-gray-800 text-gray-200 px-3 py-1 rounded-full font-semibold">
                  <Store size={16} /> {product.productStoreName}
                </span>
              )}
              {(product.productRating !== undefined && product.productRating > 0) && (
                <span className="flex items-center gap-1 bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full font-semibold">
                  <Star size={16} fill="currentColor" /> {product.productRating.toFixed(1)}
                  {product.productNumReviews !== undefined && product.productNumReviews > 0 && (
                    <span className="text-gray-400 text-xs ml-1">({product.productNumReviews} reviews)</span>
                  )}
                </span>
              )}
            </div>
          </div>
          {/* Description */}
          <div className="bg-[#192613] rounded-xl px-5 py-4 shadow flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#CAFE33] font-bold text-base"><span>📝</span> Description</div>
            <p className="text-green-100 text-base">{product.productDescription || 'No description available.'}</p>
          </div>
          {/* Attributes */}
          {attributes && attributes.length > 0 && (
            <div className="bg-[#121912] rounded-xl px-5 py-4 shadow flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-base"><Tag size={16}/> Product Attributes</div>
              <div className="flex flex-wrap gap-2">
                {attributes.map((attr: any, idx: number) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-gradient-to-br from-blue-500 to-blue-300 text-black text-xs font-bold shadow">
                    {attr.name}: {attr.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-4">
            {product.productPageUrl && (
              <Button
                variant="outline"
                className="flex-1 border-[#CAFE32] text-[#CAFE32] hover:bg-[#CAFE32]/10 transition-colors duration-200 text-base font-semibold py-3 rounded-xl shadow-md hover:shadow-lg"
                onClick={handleViewProduct}
              >
                <ExternalLink size={18} className="mr-2" />
                View Details
              </Button>
            )}
            {product.productPrice && product.productPageUrl && (
              <Button
                variant="default"
                className="flex-1 bg-[#CAFE32] text-gray-900 hover:bg-[#CAFE32]/90 transition-colors duration-200 text-base font-semibold py-3 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105"
                onClick={handleBuyNow}
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFullModal; 