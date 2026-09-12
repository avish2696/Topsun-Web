import React, { useState } from 'react';
import {
  Heart,
  Star,
  Truck,
  RefreshCw,
  Check,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Ruler,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { toast as showSonnerToast } from 'sonner';

import SizeSelectModal from '@/app/components/SizeSelectModal';

interface ProductDetailPageProps {
  product: any;
  onAddToCart?: (size: number | string, quantity: number) => Promise<void>;
  onAddToWishlist?: () => void;
  relatedProducts?: any[];
}

const UK_SIZES = [7, 8, 9, 10];

const sampleReviews = [
  { id: 1, author: 'Priya Sharma', rating: 5, text: 'Exceptional arch support and cushioning. Wore them for a 10k run right out of the box with zero blisters.', date: '2 weeks ago', verified: true },
  { id: 2, author: 'Rajesh Kumar', rating: 5, text: 'Quality feels like a ₹8,000 shoe. Great fit and finish. Very proud to support an Indian brand!', date: '1 month ago', verified: true },
  { id: 3, author: 'Aisha Patel', rating: 4.8, text: 'Super lightweight and breathable. Perfect for daily workouts and marathon training.', date: '1 month ago', verified: true },
];

export default function ProductDetailPage({
  product,
  onAddToCart,
  relatedProducts = [],
}: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = async (sizeToUse?: number | string) => {
    // Guard: only accept number or string — never a MouseEvent
    const validSize = (typeof sizeToUse === 'number' || typeof sizeToUse === 'string') ? sizeToUse : null;
    const finalSize = validSize || selectedSize;
    if (!finalSize) {
      setShowSizeModal(true);
      return;
    }

    setAdding(true);
    try {
      await onAddToCart?.(finalSize, quantity);
      showSonnerToast.success(`Added ${product.name} (UK ${finalSize}) to Cart!`);
    } catch (err: any) {
      showSonnerToast.error(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleModalSelectSize = async (size: number) => {
    setSelectedSize(size);
    setShowSizeModal(false);
    await handleAddToCart(size);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi TOPSUN Team! I have a question regarding the ${product.name} (₹${product.price}, Size UK ${selectedSize || '?'}). Can you assist me?`
    );
    window.open(`https://wa.me/917485006659?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-12 pb-20 md:pb-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Product Primary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square bg-[#f7f5f0] rounded-3xl p-6 sm:p-10 flex items-center justify-center overflow-hidden border border-[#e4ded5] shadow-xs">
            {/* Minimalist Brand Tag */}
            <div className="absolute top-4 left-4 z-10 opacity-70">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#121518]">TOPSUN</span>
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                setIsWishlisted(!isWishlisted);
                showSonnerToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
              }}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white border border-[#e4ded5] flex items-center justify-center text-[#121518] hover:bg-[#faf7f2] transition-colors cursor-pointer shadow-xs"
              aria-label="Toggle wishlist"
            >
              <Heart
                size={17}
                className={isWishlisted ? 'fill-rose-600 text-rose-600' : 'text-gray-400'}
              />
            </button>

            {/* Main Shoe Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIdx}
                src={productImages[currentImageIdx]}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-contain mix-blend-multiply"
                alt={`${product.name} - View ${currentImageIdx + 1}`}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {productImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-20 h-20 flex-shrink-0 rounded-2xl bg-[#f7f5f0] p-2 border-2 transition-all cursor-pointer overflow-hidden ${
                    idx === currentImageIdx
                      ? 'border-[#b38b3f] shadow-xs'
                      : 'border-[#e4ded5] hover:border-gray-400'
                  }`}
                  aria-label={`Select angle ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - Thumbnail angle ${idx + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details, Sizing & Purchase */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Info */}
          <div className="space-y-2 border-b border-[#e4ded5] pb-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#b38b3f] uppercase tracking-wider text-[11px]">
                {product.category} Footwear
              </span>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-[#121518]">{product.rating}</span>
                <span className="text-[#606870]">({product.reviews} reviews)</span>
              </div>
            </div>

            <h1
              className="text-3xl sm:text-4xl font-semibold text-[#121518] leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              {product.name}
            </h1>

            <p className="text-xs text-[#606870]">Colorway: <strong className="text-[#121518]">{product.colorLabel}</strong></p>
          </div>

          {/* Pricing Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#e4ded5] shadow-xs flex items-baseline justify-between">
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-bold text-[#121518]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {discount}% OFF
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-bold">
                Inclusive of all taxes & Free Express Shipping
              </p>
            </div>

            <span className="px-3 py-1 bg-[#121518] text-white text-xs font-bold rounded-lg shadow-2xs">
              Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Size Selection (UK / Indian) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#121518] flex items-center gap-1.5">
                <span>Select Shoe Size (UK / India)</span>
              </label>
              <Link
                to="/sizing-guide"
                className="inline-flex items-center gap-1 text-xs text-[#b38b3f] hover:underline font-semibold"
              >
                <Ruler size={13} />
                <span>Size Chart & Guide</span>
              </Link>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {UK_SIZES.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-12 rounded-xl font-bold text-sm border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'border-[#121518] bg-[#121518] text-white shadow-xs'
                        : 'border-[#e4ded5] bg-white text-[#121518] hover:border-[#b38b3f]'
                    }`}
                  >
                    UK {sz}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#606870]">All TOPSUN footwear fits <strong>True to Size (TTS)</strong>.</p>
          </div>

          {/* Quantity Stepper & Add to Cart */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="flex items-center border border-[#e4ded5] rounded-xl bg-white px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-10 flex items-center justify-center font-bold text-[#121518] hover:bg-[#faf7f2] rounded-lg transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-xs font-bold text-[#121518]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-10 flex items-center justify-center font-bold text-[#121518] hover:bg-[#faf7f2] rounded-lg transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleAddToCart()}
                disabled={adding}
                className="flex-1 h-12 bg-[#121518] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <span>{adding ? 'Adding…' : `Add to Cart • ₹${(product.price * quantity).toLocaleString('en-IN')}`}</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* WhatsApp Sizing Support */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-3 bg-white border border-[#e4ded5] hover:bg-[#faf7f2] text-[#121518] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle size={15} className="text-[#25D366]" />
              <span>Ask Our Sizing Expert on WhatsApp</span>
            </button>
          </div>

          {/* Trust Value Props */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white p-3.5 rounded-xl border border-[#e4ded5] flex items-center gap-2.5">
              <Truck size={17} className="text-[#b38b3f] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#121518]">Free Delivery</p>
                <p className="text-[10px] text-[#606870]">2-5 days across India</p>
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#e4ded5] flex items-center gap-2.5">
              <RefreshCw size={17} className="text-[#b38b3f] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#121518]">7-Day Exchanges</p>
                <p className="text-[10px] text-[#606870]">Free reverse pickup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion / Tabs Section */}
      <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex border-b border-[#e4ded5] gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'details'
                ? 'border-[#121518] text-[#121518] font-bold'
                : 'border-transparent text-[#606870] hover:text-[#121518]'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'specs'
                ? 'border-[#121518] text-[#121518] font-bold'
                : 'border-transparent text-[#606870] hover:text-[#121518]'
            }`}
          >
            Materials & Care
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[#121518] text-[#121518] font-bold'
                : 'border-transparent text-[#606870] hover:text-[#121518]'
            }`}
          >
            Customer Reviews ({sampleReviews.length})
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-4 text-xs sm:text-sm text-[#606870] leading-relaxed">
            <p>{product.description}</p>
            {product.features && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                {product.features.map((feat: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#121518]">
                    <CheckCircle2 size={14} className="text-[#b38b3f] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e4ded5] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#b38b3f] tracking-wider">Materials</span>
              <p className="text-[#121518] leading-relaxed">{product.material || '100% Engineered Mesh & EVA Foam'}</p>
            </div>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e4ded5] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#b38b3f] tracking-wider">Fit Guidance</span>
              <p className="text-[#121518] leading-relaxed">{product.fit || 'True to Size. For wide feet, order half size up.'}</p>
            </div>
            <div className="bg-[#faf7f2] p-4 rounded-xl border border-[#e4ded5] space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#b38b3f] tracking-wider">Care Instructions</span>
              <p className="text-[#121518] leading-relaxed">{product.care || 'Wipe clean with a damp cloth. Air dry naturally.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {sampleReviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-[#faf7f2] rounded-2xl border border-[#e4ded5] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#121518]">{rev.author}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                        <Check size={11} /> Verified Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#606870]">{rev.date}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-[#606870] leading-relaxed">{rev.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase text-[#b38b3f] tracking-wider">Complete Your Kit</span>
            <h2
              className="text-2xl sm:text-3xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              You May Also Like
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((rel) => (
              <Link
                key={rel.id}
                to={`/product/${rel.slug}`}
                className="group bg-white rounded-2xl border border-[#e4ded5] p-5 shadow-xs hover:border-[#dfc38a] transition-all flex flex-col justify-between"
              >
                <div className="aspect-square bg-[#f7f5f0] rounded-xl p-4 flex items-center justify-center overflow-hidden mb-3">
                  <img
                    src={rel.image}
                    alt={`${rel.name} - ${rel.category} Performance Footwear`}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <h3
                    className="text-lg font-semibold text-[#121518] group-hover:text-[#b38b3f] transition-colors truncate"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {rel.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#121518]">₹{rel.price.toLocaleString('en-IN')}</span>
                    <span className="text-gray-400 line-through">₹{rel.originalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Size Select Bottom Sheet Modal */}
      <SizeSelectModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onSelectSize={handleModalSelectSize}
        sizes={product?.sizes && product.sizes.length > 0 ? product.sizes : UK_SIZES}
        selectedSize={selectedSize}
        productName={product?.name}
      />

      {/* ── Sticky Mobile Bottom CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e4ded5] shadow-[0_-4px_24px_rgba(18,21,24,0.10)] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-[#121518] truncate">{product.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-[#121518]">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">{discount}% OFF</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleAddToCart()}
          disabled={adding}
          className="shrink-0 px-5 py-3 bg-[#009FE3] hover:bg-[#008bc5] disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#009FE3]/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer min-w-[120px] justify-center"
          aria-label={`Add ${product.name} to cart`}
        >
          {adding ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
