'use client';

import React, { useState, useCallback } from 'react';
import {
  Heart,
  Star,
  ShoppingCart,
  Truck,
  RefreshCw,
  Check,
  ChevronDown,
  ArrowLeft,
  Zap,
  Shield,
  MessageCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ResponsiveImage } from './ResponsiveImage';
import { toast as showSonnerToast } from 'sonner';

interface ProductDetailPageProps {
  product?: any;
  onAddToCart?: (size: number | string, quantity: number) => Promise<void>;
  onAddToWishlist?: () => void;
  relatedProducts?: any[];
}

const UK_SIZES = [7, 8, 9, 10];

const sampleReviews = [
  { id: 1, author: 'Priya S.', rating: 5, text: 'Best shoes ever! Amazing comfort, lightweight cushioning and premium finish.', date: '2 weeks ago' },
  { id: 2, author: 'Rajesh K.', rating: 5, text: 'Great value for money. Fits perfectly and very comfortable for running.', date: '1 month ago' },
  { id: 3, author: 'Aisha P.', rating: 5, text: 'Perfect! Wore them for daily workout and walking. Totally recommend!', date: '1 month ago' },
];

export default function ProductDetailPage({
  product,
  onAddToCart,
  onAddToWishlist,
  relatedProducts = [],
}: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const productImages =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : [];

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = async () => {
    if (!selectedSize) {
      showSonnerToast.error('Please select your UK size first');
      return;
    }

    setAdding(true);
    try {
      await onAddToCart?.(selectedSize, quantity);
      showSonnerToast.success(`Added ${product.name} (UK ${selectedSize}) to Cart!`);
      // Immediately open cart to continue the order
      navigate('/cart', { state: { backgroundLocation: location } });
    } catch (err: any) {
      showSonnerToast.error(err.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi TOPSUN Team! I have a question about the ${product.name} (₹${product.price}). Can you help me?`
    );
    window.open(`https://wa.me/917485006659?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Breadcrumb Header Bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-black"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#009FE3]">
          {product.category || 'Footwear'}
        </span>

        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100"
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}
          />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Image Carousel with Neeman's/Shop Style Card */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square bg-[#f4f4f2] rounded-3xl p-6 flex items-center justify-center overflow-hidden border border-gray-200/70 shadow-xs">
            {/* "New" Badge */}
            <span className="absolute top-3 left-3 bg-[#dcfce7] text-[#15803d] font-bold text-[11px] px-2.5 py-0.5 rounded-md shadow-2xs">
              New
            </span>

            {/* Discount Badge */}
            <span className="absolute top-3 right-3 bg-[#b48035] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-2xs">
              {discount}% OFF
            </span>

            {/* Main Shoe Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIdx}
                src={productImages[currentImageIdx]}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.25 }}
                className="w-full h-full object-contain mix-blend-multiply"
                alt={product.name}
              />
            </AnimatePresence>

            {/* Rating Pill */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs rounded-full px-2.5 py-1 flex items-center gap-1 shadow-xs">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-gray-800">
                {product.rating} ({product.reviews || 240})
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {productImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`w-16 h-16 flex-shrink-0 rounded-2xl bg-[#f4f4f2] p-1.5 border-2 transition-all overflow-hidden ${
                    idx === currentImageIdx
                      ? 'border-[#009FE3] shadow-md shadow-blue-100'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Action Block */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Title & Brand */}
            <div>
              <p className="text-[11px] font-bold tracking-widest text-[#009FE3] uppercase mb-1">
                TOPSUN PERFORMANCE
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Color: {product.colorLabel}</p>
            </div>

            {/* Pricing Card */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200/70 shadow-xs flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">
                  ₹ {product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-400 line-through font-medium">
                  ₹ {product.originalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Save {discount}%
              </span>
            </div>

            {/* Size Selector (UK) */}
            <div className="p-4 bg-white rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-800">
                  Select Size (UK)
                </label>
                <span className="text-[11px] text-gray-400 font-semibold">True to Size</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {UK_SIZES.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`h-12 rounded-2xl font-black text-[15px] border-2 transition-all active:scale-95 flex items-center justify-center ${
                        isSelected
                          ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                          : 'border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-400'
                      }`}
                    >
                      UK {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-200/70">
              <span className="text-xs font-bold text-gray-700 uppercase">Quantity</span>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 hover:text-black"
                >
                  −
                </button>
                <span className="w-6 text-center font-extrabold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center font-bold text-gray-700 hover:text-black"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button (Directly opens cart) */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full h-14 rounded-2xl bg-[#1c1d1f] hover:bg-black text-white font-black text-[15px] flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              <span>{selectedSize ? `Add to Cart • UK ${selectedSize}` : 'Select Size to Add'}</span>
            </button>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { icon: Truck, title: 'Free Express Delivery', desc: 'Ships in 24 hrs' },
              { icon: RefreshCw, title: '7-Day Easy Exchange', desc: 'Hassle free' },
              { icon: Shield, title: '100% Genuine', desc: 'Original TOPSUN' },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200/70 text-center flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-[#009FE3] flex items-center justify-center mb-1">
                  <Icon size={14} />
                </div>
                <p className="text-[11px] font-bold text-gray-900 leading-tight">{title}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Details & Reviews Accordion/Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-6">
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100 gap-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === 'details'
                  ? 'border-[#009FE3] text-[#009FE3]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Product Description
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 font-bold text-sm transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-[#009FE3] text-[#009FE3]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              Verified Reviews ({sampleReviews.length})
            </button>
          </div>

          {activeTab === 'details' ? (
            <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
              <p className="text-sm font-medium text-gray-800">{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-50 p-3.5 rounded-xl">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1">Material</h4>
                  <p>{product.material}</p>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl">
                  <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider mb-1">Fit & Care</h4>
                  <p>{product.fit} • {product.care || 'Wipe with damp cloth'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-xs mb-2">Key Features:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features?.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-gray-700">
                      <Check size={14} className="text-[#009FE3] flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sampleReviews.map((r) => (
                <div key={r.id} className="p-3.5 bg-gray-50 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{r.author}</span>
                    <span className="text-[10px] text-gray-400">{r.date}</span>
                  </div>
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={11} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-700 pt-1">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating WhatsApp Support Button (Bottom-Left) */}
      <button
        onClick={handleOpenWhatsApp}
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Chat on WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </button>
    </div>
  );
}
