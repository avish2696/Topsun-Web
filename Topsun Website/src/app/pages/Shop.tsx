import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Star,
  Search,
  ShoppingCart,
  Menu,
  User,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  X,
  Check,
  ShoppingBag,
  Package,
  Sparkles,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ResponsiveImage } from '@/app/components/ResponsiveImage';
import { useShopping, CartItem } from '@/app/context/ShoppingContext';
import { useAuth } from '@/app/context/AuthContext';
import { PRODUCTS_DATABASE } from '@/app/routes/Routes';
import { toast } from 'sonner';

import TopsunLogoImg from '@/imports/TOPSUN png 1.png';
import Shoe1 from '@/imports/storm-runner/1.png';
import Shoe2 from '@/imports/urban-classic/1.png';
import Shoe3 from '@/imports/trail-blaze/1.png';
import Shoe4 from '@/imports/comfort-walk/1.png';
import Shoe5 from '@/imports/street-edge/1.png';
import Shoe6 from '@/imports/everyday-flex/1.png';
import Shoe7 from '@/imports/sprint-pro/1.png';

const shoeImages: Record<number, string> = {
  1: Shoe1,
  2: Shoe2,
  3: Shoe3,
  4: Shoe4,
  5: Shoe5,
  6: Shoe6,
  7: Shoe7,
};

const UK_SIZES = [7, 8, 9, 10];

export default function Shop() {
  const { addToCart, getCartItemCount } = useShopping();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'discount'>('featured');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<number | null>(null);

  // Modals & Drawers
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Size Selector Modal (Add to Cart flow)
  const [sizeModalProduct, setSizeModalProduct] = useState<any | null>(null);

  // Wishlist state
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Real-time Countdown Timer (Days, Hours, Min, Sec)
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 12,
    minutes: 16,
    seconds: 26,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ticking countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 1, hours: 12, minutes: 16, seconds: 26 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  // Open the "Select Size (UK)" modal when clicking Add to Cart
  const handleOpenSizeModal = (product: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSizeModalProduct(product);
  };

  // Select size and add to cart immediately, then open cart to continue order
  const handleSelectSize = async (size: number) => {
    if (!sizeModalProduct) return;

    const cartItem: CartItem = {
      id: sizeModalProduct.id,
      slug: sizeModalProduct.slug,
      name: sizeModalProduct.name,
      price: sizeModalProduct.price,
      image: shoeImages[sizeModalProduct.id],
      size: size,
      quantity: 1,
      colorLabel: sizeModalProduct.colorLabel,
    };

    await addToCart(cartItem);
    const productName = sizeModalProduct.name;
    setSizeModalProduct(null);
    toast.success(`Added ${productName} (UK ${size}) to Cart!`);

    // Immediately open Cart to continue the order
    navigate('/cart', { state: { backgroundLocation: location } });
  };

  // Open WhatsApp Support
  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      'Hi TOPSUN Team! I am interested in your shoes and need some assistance with sizing and orders.'
    );
    window.open(`https://wa.me/917485006659?text=${message}`, '_blank');
  };

  // Filter & Sort Logic
  const filteredProducts = PRODUCTS_DATABASE.filter((product) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchColor = product.colorLabel.toLowerCase().includes(q);
      const matchCat = product.category.toLowerCase().includes(q);
      if (!matchName && !matchColor && !matchCat) return false;
    }

    // Category match
    if (selectedCategory !== 'All') {
      if (product.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Size filter match
    if (selectedSizeFilter !== null) {
      if (!product.sizes.includes(selectedSizeFilter)) return false;
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        const discA = (a.originalPrice - a.price) / a.originalPrice;
        const discB = (b.originalPrice - b.price) / b.originalPrice;
        return discB - discA;
      default:
        return 0;
    }
  });

  const format2Digits = (n: number) => String(n).padStart(2, '0');
  const cartCount = getCartItemCount();

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col pb-24" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── 1. TOP COUNTDOWN DEAL BANNER (Matching Screenshot 1 & 3) ── */}
      <div className="bg-[#009FE3] text-white px-3 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex flex-col">
          <span className="text-[14px] sm:text-[16px] font-extrabold tracking-tight leading-tight">
            Comfort Rush Deals
          </span>
          <span className="text-[12px] sm:text-[14px] font-extrabold opacity-95">
            Ends In:
          </span>
        </div>

        {/* 4 Countdown Boxes with Colons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Day */}
          <div className="bg-white text-gray-900 rounded-lg px-2 py-1 flex flex-col items-center min-w-[34px] sm:min-w-[42px] shadow-xs">
            <span className="text-[13px] sm:text-[15px] font-black leading-none">
              {format2Digits(timeLeft.days)}
            </span>
            <span className="text-[9px] font-semibold text-gray-500 mt-0.5">Day</span>
          </div>

          <span className="text-white font-bold text-xs">:</span>

          {/* Hours */}
          <div className="bg-white text-gray-900 rounded-lg px-2 py-1 flex flex-col items-center min-w-[34px] sm:min-w-[42px] shadow-xs">
            <span className="text-[13px] sm:text-[15px] font-black leading-none">
              {format2Digits(timeLeft.hours)}
            </span>
            <span className="text-[9px] font-semibold text-gray-500 mt-0.5">Hours</span>
          </div>

          <span className="text-white font-bold text-xs">:</span>

          {/* Min */}
          <div className="bg-white text-gray-900 rounded-lg px-2 py-1 flex flex-col items-center min-w-[34px] sm:min-w-[42px] shadow-xs">
            <span className="text-[13px] sm:text-[15px] font-black leading-none">
              {format2Digits(timeLeft.minutes)}
            </span>
            <span className="text-[9px] font-semibold text-gray-500 mt-0.5">Min</span>
          </div>

          <span className="text-white font-bold text-xs">:</span>

          {/* Sec */}
          <div className="bg-white text-gray-900 rounded-lg px-2 py-1 flex flex-col items-center min-w-[34px] sm:min-w-[42px] shadow-xs">
            <span className="text-[13px] sm:text-[15px] font-black leading-none text-[#009FE3]">
              {format2Digits(timeLeft.seconds)}
            </span>
            <span className="text-[9px] font-semibold text-gray-500 mt-0.5">Sec</span>
          </div>
        </div>
      </div>

      {/* ── 2. NEEMAN'S STYLE HEADER (Matching Screenshot 1) ── */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-30">
        {/* Left: Hamburger Menu */}
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-1 text-gray-800 hover:text-black transition-colors"
          aria-label="Open Navigation"
        >
          <Menu size={24} />
        </button>

        {/* Center: TOPSUN Brand Name / Logo */}
        <Link to="/" className="flex items-center gap-1.5">
          <img src={TopsunLogoImg} alt="TOPSUN" className="h-7 sm:h-8 object-contain" />
        </Link>

        {/* Right: Icons (Store, Cart with Badge, User) */}
        <div className="flex items-center gap-3">
          <Link to="/orders" className="text-gray-700 hover:text-black p-1" title="Track Orders">
            <Package size={20} />
          </Link>

          <button
            onClick={() => navigate('/cart', { state: { backgroundLocation: location } })}
            className="relative p-1 text-gray-800 hover:text-black"
            title="Shopping Cart"
          >
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-[#b48035] text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          <Link
            to={user ? '/profile' : '/signin'}
            className="text-gray-700 hover:text-black p-1"
            title={user ? 'My Profile' : 'Sign In'}
          >
            <User size={21} />
          </Link>
        </div>
      </header>

      {/* ── 3. SEARCH BAR (Matching Screenshot 1) ── */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="relative flex items-center">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-full px-4 h-[44px] bg-[#fdfdfd] focus-within:border-gray-400 transition-colors">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Oxy, Running, Sneakers..."
              className="w-full bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-medium font-semibold"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => {}}
            className="ml-2 px-5 h-[44px] rounded-full bg-[#b48035] hover:bg-[#9c6d2c] text-white font-bold text-[13px] shadow-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── 4. CATEGORY TITLE (Matching Screenshot 1) ── */}
      <div className="px-4 pt-5 pb-2">
        <h1
          className="text-[26px] sm:text-[32px] font-black text-gray-900 uppercase tracking-tight"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Footwear for men
        </h1>
        <div className="w-full h-px bg-gray-200 mt-2" />
      </div>

      {/* ── 5. 2-COLUMN PRODUCT GRID (Matching Screenshots 1 & 3) ── */}
      <main className="px-3 py-3 flex-1 max-w-[1400px] mx-auto w-full">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No footwear found</h3>
            <p className="text-sm text-gray-500 mt-1">Try clearing your filters or search term</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedSizeFilter(null);
              }}
              className="mt-4 px-6 py-2 rounded-full bg-gray-900 text-white text-sm font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {sortedProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const discountPercentage = Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100
              );

              return (
                <div
                  key={product.id}
                  className="bg-[#f4f4f2] rounded-2xl overflow-hidden flex flex-col justify-between border border-gray-200/70 shadow-xs relative group"
                >
                  {/* Top Header on Card: "New" badge + Rating */}
                  <div className="relative aspect-[1/1] p-2 flex items-center justify-center">
                    {/* "New" Green Badge (Top Left) */}
                    <span className="absolute top-2 left-2 z-10 bg-[#dcfce7] text-[#15803d] font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                      New
                    </span>

                    {/* Wishlist Button (Top Right) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center shadow-xs transition-transform active:scale-90"
                      aria-label="Wishlist"
                    >
                      <Heart
                        size={14}
                        className={
                          isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                        }
                      />
                    </button>

                    {/* Product Image */}
                    <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center p-2">
                      <ResponsiveImage
                        src={shoeImages[product.id]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Star Rating Badge (Pill above bottom card) */}
                    <div className="absolute bottom-1.5 left-2 bg-white/90 backdrop-blur-xs rounded-full px-2 py-0.5 flex items-center gap-1 shadow-2xs">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold text-gray-800">
                        {product.rating} ({product.reviews || 1})
                      </span>
                    </div>
                  </div>

                  {/* White Bottom Info Container (Matching Screenshot 1 & 3) */}
                  <div className="bg-white p-2.5 sm:p-3 rounded-b-2xl flex flex-col justify-between flex-1">
                    <div>
                      {/* Product Title & Subtitle */}
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="text-[12.5px] sm:text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#009FE3] transition-colors">
                          {product.name} : {product.colorLabel}
                        </h3>
                      </Link>

                      {/* Pricing Row */}
                      <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-[14px] sm:text-[16px] font-extrabold text-gray-900">
                          ₹ {product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-gray-400 line-through font-medium">
                          ₹ {product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Discount in Green (Matching Screenshot 3) */}
                      <div className="text-[11px] font-bold text-[#16a34a] mt-0.5">
                        {discountPercentage}% Off
                      </div>
                    </div>

                    {/* "Add to Cart" Pill Button (Matching Screenshot 3 & Triggers Size Modal) */}
                    <button
                      onClick={(e) => handleOpenSizeModal(product, e)}
                      className="mt-2.5 w-full py-2 rounded-full border border-gray-900 bg-white hover:bg-gray-900 text-gray-900 hover:text-white font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 shadow-xs"
                    >
                      <ShoppingCart size={13} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── 6. FLOATING ACTION BUTTONS (Matching Screenshots 1, 3, 4) ── */}

      {/* Floating WhatsApp Button (Bottom-Left) */}
      <button
        onClick={handleOpenWhatsApp}
        className="fixed bottom-20 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="Chat on WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </button>

      {/* Floating Quick Search Button (Bottom-Center-Right) */}
      <button
        onClick={() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          searchInput?.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-20 right-18 z-40 w-11 h-11 rounded-full bg-white text-gray-800 border border-gray-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        title="Quick Search"
      >
        <Search size={18} />
      </button>

      {/* Floating Cart Button with Counter Badge (Bottom-Right) */}
      <button
        onClick={() => navigate('/cart', { state: { backgroundLocation: location } })}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-white text-gray-900 border border-gray-300 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        title="View Cart"
      >
        <ShoppingCart size={20} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#b48035] text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
            {cartCount}
          </span>
        )}
      </button>

      {/* ── 7. STICKY BOTTOM SORT & FILTER BAR (Matching Screenshot 1 & 3) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
        {/* Sort by Pill Button */}
        <button
          onClick={() => setSortSheetOpen(true)}
          className="flex-1 h-[42px] rounded-full border border-gray-900 bg-white text-gray-900 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-colors"
        >
          <ArrowUpDown size={14} />
          <span>Sort by</span>
        </button>

        {/* Filter Pill Button */}
        <button
          onClick={() => setFilterSheetOpen(true)}
          className="flex-1 h-[42px] rounded-full border border-gray-900 bg-white text-gray-900 font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 transition-colors"
        >
          <SlidersHorizontal size={14} />
          <span>Filter</span>
        </button>
      </div>

      {/* ── 8. INSTANT SIZE SELECTOR MODAL (Matching Screenshot 4) ── */}
      <AnimatePresence>
        {sizeModalProduct && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeModalProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />

            {/* Size Modal Popup (Centered on Screen as shown in Screenshot 4) */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full max-w-[360px] bg-white rounded-3xl shadow-2xl p-5 border border-gray-200 pointer-events-auto flex flex-col"
              >
                {/* Modal Header: "Select Size (UK)" + "✕" Close */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3
                    className="text-[20px] font-black text-gray-900 tracking-tight"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Select Size (UK)
                  </h3>
                  <button
                    onClick={() => setSizeModalProduct(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* UK Sizes Grid: 7, 8, 9, 10 */}
                <div className="grid grid-cols-4 gap-3 pt-4 pb-2">
                  {UK_SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSelectSize(sz)}
                      className="h-12 rounded-2xl font-black text-[16px] border-2 border-gray-300 hover:border-gray-900 bg-white hover:bg-gray-900 hover:text-white text-gray-900 flex items-center justify-center transition-all active:scale-95 shadow-xs"
                    >
                      UK {sz}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-gray-400 text-center mt-2 font-medium">
                  Tap your size to add directly to cart
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── 9. SORT BOTTOM SHEET DRAWER ── */}
      <AnimatePresence>
        {sortSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSortSheetOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-[18px] font-bold text-gray-900">Sort By</h3>
                <button
                  onClick={() => setSortSheetOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="py-3 space-y-1.5">
                {[
                  { id: 'featured', label: 'Featured / Recommended' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'price-high', label: 'Price: High to Low' },
                  { id: 'rating', label: 'Customer Rating' },
                  { id: 'discount', label: 'Highest Discount (%)' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id as any);
                      setSortSheetOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left font-bold text-[14px] flex items-center justify-between transition-colors ${
                      sortBy === option.id
                        ? 'bg-blue-50 text-[#009FE3] border border-blue-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.id && <Check size={18} className="text-[#009FE3]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 10. FILTER BOTTOM SHEET DRAWER ── */}
      <AnimatePresence>
        {filterSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterSheetOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-[18px] font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filter: Categories */}
              <div className="py-4 border-b border-gray-100">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-3">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Running', 'Casual', 'Outdoor', 'Walking', 'Street', 'Everyday', 'Performance'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors ${
                          selectedCategory === cat
                            ? 'bg-[#009FE3] text-white border-[#009FE3]'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Filter: UK Sizes */}
              <div className="py-4 border-b border-gray-100">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-400 mb-3">Size (UK)</h4>
                <div className="grid grid-cols-4 gap-2.5">
                  {UK_SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() =>
                        setSelectedSizeFilter(selectedSizeFilter === sz ? null : sz)
                      }
                      className={`h-11 rounded-2xl text-[14px] font-bold border flex items-center justify-center transition-colors ${
                        selectedSizeFilter === sz
                           ? 'bg-gray-900 text-white border-gray-900'
                           : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      UK {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedSizeFilter(null);
                    setFilterSheetOpen(false);
                  }}
                  className="flex-1 py-3 rounded-2xl border border-gray-300 text-gray-700 font-bold text-[14px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="flex-2 py-3 rounded-2xl bg-[#009FE3] text-white font-bold text-[14px] shadow-md shadow-blue-200"
                >
                  Show Results ({sortedProducts.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── 11. MOBILE SIDEBAR NAVIGATION ── */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-50 p-6 flex flex-col justify-between shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                  <img src={TopsunLogoImg} alt="TOPSUN" className="h-7 object-contain" />
                  <button onClick={() => setMobileNavOpen(false)} className="text-gray-500">
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-4">
                  <Link
                    to="/"
                    onClick={() => setMobileNavOpen(false)}
                    className="block font-bold text-[16px] text-gray-800 hover:text-[#009FE3]"
                  >
                    Home
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setMobileNavOpen(false)}
                    className="block font-bold text-[16px] text-[#009FE3]"
                  >
                    Shop Footwear
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileNavOpen(false)}
                    className="block font-bold text-[16px] text-gray-800 hover:text-[#009FE3]"
                  >
                    Track Orders
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setMobileNavOpen(false)}
                    className="block font-bold text-[16px] text-gray-800 hover:text-[#009FE3]"
                  >
                    About TOPSUN
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileNavOpen(false)}
                    className="block font-bold text-[16px] text-gray-800 hover:text-[#009FE3]"
                  >
                    Contact Support
                  </Link>
                </nav>
              </div>

              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{user.fullName || 'My Account'}</p>
                      <p className="text-xs text-gray-500">{user.phone || user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileNavOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold"
                    >
                      View
                    </Link>
                  </div>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setMobileNavOpen(false)}
                    className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-[14px] flex items-center justify-center gap-2"
                  >
                    <User size={16} /> Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
