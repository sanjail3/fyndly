import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, DollarSign, Store } from 'lucide-react';
import ProductFullModal from './ProductFullModal';

interface Product {
  product_id: string;
  productTitle: string;
  productDescription: string;
  productImageUrl?: string;
  productPrice?: string;
  productStoreName?: string;
  productNumReviews?: number;
  productRating?: number;
  productPageUrl?: string;
  product_photos?: string[];
  offer?: {
    price?: string;
    store_name?: string;
    offer_page_url?: string;
  };
  productDetails?: any;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const imageUrl = product.productImageUrl || (product.product_photos && product.product_photos.length > 0 ? product.product_photos[0] : '/placeholder.svg');

  return (
    <>
      <div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black border border-[#CAFE33]/40 flex flex-col">
        {/* Product Image */}
        <div className="w-full aspect-square bg-gray-900 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={product.productTitle || 'Product Image'}
            className="w-full h-full object-contain bg-white/10 rounded-2xl"
            style={{ maxHeight: 320 }}
          />
        </div>
        {/* Info Bar */}
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-lg font-bold text-white truncate max-w-[60%]">{product.productTitle}</h2>
          {product.productPrice && (
            <span className="flex items-center gap-1 bg-[#CAFE33]/20 text-[#CAFE33] px-3 py-1 rounded-full font-bold text-base">
              <DollarSign size={16} /> {product.productPrice}
            </span>
          )}
        </div>
        {/* Sub Info Row */}
        <div className="flex items-center gap-4 px-5 pt-2 pb-1">
          {(product.productRating !== undefined && product.productRating > 0) && (
            <span className="flex items-center gap-1 text-yellow-300 text-xs">
              <Star size={14} fill="currentColor" /> {product.productRating.toFixed(1)}
              {product.productNumReviews !== undefined && product.productNumReviews > 0 && (
                <span className="text-gray-400 text-xs ml-1">({product.productNumReviews})</span>
              )}
            </span>
          )}
          {product.productStoreName && (
            <span className="flex items-center gap-1 text-gray-400 text-xs">
              <Store size={14} /> {product.productStoreName}
            </span>
          )}
        </div>
        {/* Description (short) */}
        <div className="px-5 pb-2">
          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed text-left mt-1 mb-2">{product.productDescription || 'No description available.'}</p>
        </div>
        {/* View Full Details Button */}
        <div className="px-5 pb-5 mt-auto">
          <Button
            variant="ghost"
            className="w-full text-[#CAFE32] border border-[#CAFE32]/40 hover:bg-[#CAFE32]/10 font-semibold text-base py-2 rounded-xl shadow"
            onClick={() => setModalOpen(true)}
          >
            View Full Details
          </Button>
        </div>
      </div>
      <ProductFullModal open={modalOpen} onClose={() => setModalOpen(false)} product={product} />
    </>
  );
};

export default ProductCard; 