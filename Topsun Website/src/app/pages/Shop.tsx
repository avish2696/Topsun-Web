import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import {
  Star, Heart, Search, X, ShoppingCart, MessageCircle
} from 'lucide-react';
import { PRODUCTS, getAllProductsWithOffers } from '@/data/products';
import { useProductOffers } from '@/app/utils/productOffers';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import SizeSelectModal from '@/app/components/SizeSelectModal';

interface ProductCardProps {
  product: (typeof PRODUCTS)[0];
  onQuickAdd: (product: (typeof PRODUCTS)[0]) => void;
}

function ProductCard({ product, onQuickAdd }: ProductCardProps) {
  const hasDiscount = product.originalPrice > product.price;
  const discount = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickAdd(product);
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-2xl border border-[#e4ded5] overflow-hidden transition-all duration-300 shadow-2xs hover:shadow-md relative"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Top Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-square w-full flex items-center justify-center p-3 sm:p-5 overflow-hidden transition-colors"
        style={{ backgroundColor: product.cardBg || '#f7f5f0' }}
        aria-label={`${product.name} — ${product.colorLabel}`}
      >
        <img
          src={product.image}
          alt={`${product.name} - ${product.colorLabel} ${product.category} Footwear`}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />

        {/* 'New' Badge (Green pill matching Photo 2) */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-[#e2f4e8] text-[#1e7e34] border border-[#c3e6cb] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
            New
          </span>
        </div>

        {/* Brand Logo inside image top */}
        <div className="absolute top-2.5 left-12 sm:left-14 z-10 flex items-center gap-1 opacity-80">
          <span className="text-[10px] font-extrabold text-[#121518] uppercase tracking-tighter">TOPSUN</span>
        </div>

        {/* Wishlist Button (Circular matching Photo 2) */}
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-white border border-[#e4ded5] flex items-center justify-center shadow-xs transition-colors z-10 cursor-pointer text-[#606870] hover:text-rose-500 active:scale-95"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart size={16} className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''} />
        </button>

        {/* Rating Pill overlaid on bottom left (matching Photo 2: e.g. ★ 4.8 (214)) */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border border-[#e4ded5]/80 z-10">
          <Star size={11} className="text-amber-500 fill-amber-500" />
          <span className="text-[10px] sm:text-[11px] font-bold text-[#121518]">{product.rating}</span>
          <span className="text-[9px] sm:text-[10px] text-[#606870]">({product.reviews})</span>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <Link to={`/product/${product.slug}`} className="space-y-1 block">
          <h3 className="text-xs sm:text-sm font-bold text-[#121518] line-clamp-1 leading-snug">
            {product.name} : {product.colorLabel}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
            <span className="text-sm sm:text-base font-black text-[#121518]">
              ₹ {product.price.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {hasDiscount && (
            <p className="text-[10px] sm:text-[11px] text-emerald-700 font-bold">
              {discount}% Off
            </p>
          )}
        </Link>

        {/* Add To Cart CTA Button (Matching Photo 2 pill style) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-full py-2 px-3 bg-white hover:bg-[#121518] hover:text-white text-[#121518] border border-[#121518] rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <ShoppingCart size={13} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount, addToCart, openCartDrawer } = useShopping();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );

  const CATEGORIES = ['All', 'Running', 'Casual', 'Outdoor', 'Walking', 'Street', 'Everyday', 'Performance'];

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category });
    }
  };

  // Size modal state for quick add
  const [sizeModalProduct, setSizeModalProduct] = useState<(typeof PRODUCTS)[0] | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleQuickAdd = (product: (typeof PRODUCTS)[0]) => {
    setSizeModalProduct(product);
  };

  const handleSelectSize = async (size: number) => {
    if (!sizeModalProduct) return;
    await addToCart({
      id: sizeModalProduct.id,
      slug: sizeModalProduct.slug,
      name: sizeModalProduct.name,
      price: sizeModalProduct.price,
      originalPrice: sizeModalProduct.originalPrice,
      image: sizeModalProduct.image,
      size: size,
      quantity: 1,
      colorLabel: sizeModalProduct.colorLabel,
    });
    setSizeModalProduct(null);
  };

  useProductOffers();
  const allProducts = getAllProductsWithOffers();

  const filteredProducts = allProducts
    .filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.colorLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const pageTitle = selectedCategory === 'All'
    ? "Men's Athletic & Casual Footwear Collection | TOPSUN"
    : `Men's ${selectedCategory} Shoes | TOPSUN Footwear Collection`;
  const pageDescription = selectedCategory === 'All'
    ? "Explore the full TOPSUN footwear range for men: high-rebound running shoes, casual sneakers, trail runners, and daily trainers. Free delivery across India."
    : `Shop premium TOPSUN ${selectedCategory} footwear engineered for responsive cushioning, breathable knit comfort, and durability. Free delivery across India.`;
  const canonicalUrl = selectedCategory === 'All'
    ? "https://topsun.in/shop"
    : `https://topsun.in/shop?category=${encodeURIComponent(selectedCategory.toLowerCase())}`;

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={canonicalUrl}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/shop' },
          ...(selectedCategory !== 'All' ? [{ name: selectedCategory, url: `/shop?category=${selectedCategory.toLowerCase()}` }] : []),
        ]}
      />

      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => openCartDrawer()}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-28 max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            ...(selectedCategory !== 'All' ? [{ label: selectedCategory }] : [{ label: 'All Footwear' }]),
          ]}
        />

        {/* Search Bar with Action Button */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search running, sneakers, trail shoes..."
              className="w-full pl-10 pr-8 py-2.5 rounded-full bg-white border border-[#e4ded5] text-xs sm:text-sm text-[#121518] placeholder-gray-400 focus:outline-none focus:border-[#b38b3f] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#121518] cursor-pointer"
                aria-label="Clear search query"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="px-5 sm:px-7 py-2.5 rounded-full bg-[#b87d2b] hover:bg-[#a06b20] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </div>

        {/* Category Filter Chips for Rich Internal Linking */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap min-h-[44px] flex items-center justify-center ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#121518] text-white shadow-xs'
                  : 'bg-white border border-[#e4ded5] text-[#606870] hover:text-[#121518] hover:border-zinc-400'
              }`}
            >
              {cat === 'All' ? 'All Shoes' : cat}
            </button>
          ))}
        </div>

        {/* Section Heading with Dynamic H1 Matching Keyword Intent */}
        <div className="pt-2 border-b border-[#e4ded5] pb-3 flex items-baseline justify-between">
          <h1 className="text-xl sm:text-2xl font-black text-[#121518] tracking-tight uppercase">
            {selectedCategory === 'All' ? 'Footwear For Men' : `Men's ${selectedCategory} Footwear`}
          </h1>
          <span className="text-xs text-[#606870] font-medium">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
          </span>
        </div>

        {/* Product Grid (2 columns on mobile, 3 tablet, 4 desktop) */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3 bg-white rounded-2xl border border-[#e4ded5] p-8">
            <p className="text-base font-semibold text-[#121518]">No matching footwear found</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-5 py-2 bg-[#121518] text-white rounded-full text-xs font-bold cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onQuickAdd={handleQuickAdd} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Buttons (Matching Photo 2) */}
      {/* Floating Search & Cart Buttons (Bottom Right) */}
      <div className="fixed bottom-20 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-11 h-11 rounded-full bg-white border border-[#e4ded5] text-[#121518] flex items-center justify-center shadow-md hover:bg-[#faf7f2] cursor-pointer"
          aria-label="Search top"
        >
          <Search size={18} />
        </button>

        <button
          onClick={() => openCartDrawer()}
          className="relative w-11 h-11 rounded-full bg-white border border-[#e4ded5] text-[#121518] flex items-center justify-center shadow-md hover:bg-[#faf7f2] cursor-pointer"
          aria-label="Open Cart"
        >
          <ShoppingCart size={18} />
          {getCartItemCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#b87d2b] text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
              {getCartItemCount()}
            </span>
          )}
        </button>
      </div>

      {/* Sticky Bottom Bar (Sort By / Filter pills matching Photo 2) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e4ded5] px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
        <button
          onClick={() => setShowSortModal(true)}
          className="flex-1 py-2.5 px-4 rounded-full border border-[#121518] bg-white text-[#121518] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#faf7f2]"
        >
          <span className="font-bold">⇅</span>
          <span>Sort by</span>
        </button>

        <button
          onClick={() => setShowFilterModal(true)}
          className="flex-1 py-2.5 px-4 rounded-full border border-[#121518] bg-white text-[#121518] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#faf7f2]"
        >
          <span>☷</span>
          <span>Filter</span>
        </button>
      </div>

      {/* Sort Sheet Modal */}
      <AnimatePresence>
        {showSortModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSortModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-3xl p-5 z-10 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-bold text-[#121518]">Sort Products</h3>
                <button onClick={() => setShowSortModal(false)} className="p-1 cursor-pointer"><X size={18} /></button>
              </div>
              {[
                { val: 'featured', label: 'Featured' },
                { val: 'rating', label: 'Top Rated' },
                { val: 'price-low', label: 'Price: Low to High' },
                { val: 'price-high', label: 'Price: High to Low' },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => { setSortBy(s.val); setShowSortModal(false); }}
                  className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    sortBy === s.val ? 'bg-[#121518] text-white' : 'hover:bg-[#faf7f2] text-[#121518]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Sheet Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilterModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-white rounded-t-3xl p-5 z-10 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="font-bold text-[#121518]">Filter By Category</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-1 cursor-pointer"><X size={18} /></button>
              </div>
              {['All', 'Running', 'Casual', 'Outdoor', 'Walking', 'Street'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setShowFilterModal(false); }}
                  className={`w-full py-2.5 px-4 text-left rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedCategory === cat ? 'bg-[#121518] text-white' : 'hover:bg-[#faf7f2] text-[#121518]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Size Select Bottom Sheet Modal for Quick Add */}
      <SizeSelectModal
        isOpen={Boolean(sizeModalProduct)}
        onClose={() => setSizeModalProduct(null)}
        onSelectSize={handleSelectSize}
        sizes={sizeModalProduct?.sizes || [7, 8, 9, 10]}
        productName={sizeModalProduct?.name}
      />
    </div>
  );
}
