import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  Star,
  Check,
  Shield,
  Zap,
  Wind,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Instagram,
  Clock,
  Truck,
  RotateCcw,
  MessageCircle,
  Search,
  MapPin,
  Lock,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useShopping } from "@/app/context/ShoppingContext";
import HeroShoe3D from "@/app/components/HeroShoe3D";
import Header from "@/app/components/Header";
import { SEOHead } from "@/app/components/SEOHead";
import { useProductOffers, calculateShoePrice } from "@/app/utils/productOffers";

// High-resolution product images
import Shoe1 from "@/imports/storm-runner/1.webp";
import Shoe2 from "@/imports/urban-classic/1.webp";
import Shoe3 from "@/imports/trail-blaze/1.webp";
import Shoe4 from "@/imports/comfort-walk/1.webp";
import Shoe5 from "@/imports/street-edge/1.webp";
import Shoe6 from "@/imports/everyday-flex/1.webp";
import Shoe7 from "@/imports/sprint-pro/1.webp";

export interface ShoeProduct {
  id: number;
  slug: string;
  name: string;
  series: string;
  category: string;
  price: number;
  originalPrice: number;
  mrp: number;
  discount: number;
  tag?: string;
  img: string;
  colorLabel: string;
  rating: number;
  reviews: number;
  bgLight: string;
  specs: {
    weight: string;
    cushioning: string;
  };
}

const BASE_PRODUCTS: ShoeProduct[] = [
  {
    id: 1,
    slug: "airflex",
    name: "TOPSUN Airflex",
    series: "Series 01 // Running",
    category: "Running",
    price: 4000,
    originalPrice: 4000,
    mrp: 4000,
    discount: 0,
    img: Shoe1,
    colorLabel: "Mint Aqua / Cyan",
    rating: 4.8,
    reviews: 214,
    bgLight: "#ecfdf5",
    specs: { weight: "218g", cushioning: "CloudMatrix™" }
  },
  {
    id: 2,
    slug: "duro-ridge",
    name: "TOPSUN Duro Ridge",
    series: "Series 02 // Casual",
    category: "Casual",
    price: 5500,
    originalPrice: 5500,
    mrp: 5500,
    discount: 0,
    img: Shoe2,
    colorLabel: "White / Black / Tan",
    rating: 4.7,
    reviews: 189,
    bgLight: "#f4f4f5",
    specs: { weight: "245g", cushioning: "DuroDensity™" }
  },
  {
    id: 3,
    slug: "sunspark",
    name: "TOPSUN Sunspark",
    series: "Series 03 // Outdoor",
    category: "Outdoor",
    price: 5700,
    originalPrice: 5700,
    mrp: 5700,
    discount: 0,
    img: Shoe3,
    colorLabel: "White / Sun Orange",
    rating: 4.9,
    reviews: 301,
    bgLight: "#fff7ed",
    specs: { weight: "260g", cushioning: "TrailCore™" }
  },
  {
    id: 4,
    slug: "duskflex",
    name: "TOPSUN Duskflex",
    series: "Series 04 // Walking",
    category: "Walking",
    price: 6000,
    originalPrice: 6000,
    mrp: 6000,
    discount: 0,
    img: Shoe4,
    colorLabel: "Black / Peach Teal",
    rating: 4.6,
    reviews: 176,
    bgLight: "#f0fdfa",
    specs: { weight: "210g", cushioning: "AeroGlide™" }
  },
  {
    id: 5,
    slug: "emberflex",
    name: "TOPSUN Emberflex",
    series: "Series 05 // Street",
    category: "Street",
    price: 5000,
    originalPrice: 5000,
    mrp: 5000,
    discount: 0,
    img: Shoe5,
    colorLabel: "Chalk White / Ember",
    rating: 4.8,
    reviews: 243,
    bgLight: "#fef2f2",
    specs: { weight: "235g", cushioning: "StreetPound™" }
  },
  {
    id: 6,
    slug: "cloudmax",
    name: "TOPSUN Cloudmax",
    series: "Series 06 // Everyday",
    category: "Everyday",
    price: 5200,
    originalPrice: 5200,
    mrp: 5200,
    discount: 0,
    img: Shoe6,
    colorLabel: "Platinum / Pale Sand",
    rating: 4.7,
    reviews: 158,
    bgLight: "#fefce8",
    specs: { weight: "205g", cushioning: "ZeroGravity™" }
  },
  {
    id: 7,
    slug: "hyperflow",
    name: "TOPSUN HyperFlow",
    series: "Series 07 // Performance",
    category: "Performance",
    price: 4200,
    originalPrice: 4200,
    mrp: 4200,
    discount: 0,
    img: Shoe7,
    colorLabel: "Pure White / Electric Blue",
    rating: 4.9,
    reviews: 267,
    bgLight: "#eff6ff",
    specs: { weight: "225g", cushioning: "HydroFlow™" }
  }
];

const CATEGORIES = ["All", "Running", "Casual", "Outdoor", "Walking", "Street", "Everyday", "Performance"];
const SIZES = [7, 8, 9, 10];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sizeModalProduct, setSizeModalProduct] = useState<ShoeProduct | null>(null);

  const [wishlist, setWishlist] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { addToCart, getCartItemCount } = useShopping();
  const { offers: productOffers } = useProductOffers();

  // Dynamically compute live prices strictly from original price according to active admin offers
  const products: ShoeProduct[] = BASE_PRODUCTS.map((p) => {
    const offer = productOffers[p.id];
    const { price, discount, badge } = calculateShoePrice(p.originalPrice, offer);
    return {
      ...p,
      price,
      discount,
      tag: badge || p.tag,
    };
  });

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());

  const handleSelectSizeAndAdd = async (product: ShoeProduct, size: number) => {
    await addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.img,
      size: size,
      quantity: 1,
      colorLabel: product.colorLabel
    });
    setSizeModalProduct(null);
    navigate("/cart");
  };

  const toggleWishlist = (id: number) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-[#009FE3] selection:text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SEOHead
        title="TOPSUN Footwear | Premium Sport & Performance Footwear"
        description="Explore TOPSUN's high-performance sports and running shoes engineered for Indian athletes. Experience lightweight cushioning, durable traction, and 7-day hassle-free exchanges."
        canonicalUrl="https://topsun.in/"
        breadcrumbs={[{ name: 'Home', url: '/' }]}
      />

      {/* Main Navigation */}
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate("/cart")}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Content Landmark for Screen Readers and Accessibility Audits */}
      <main id="main-content">
        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1: HERO (DARK THEME)
        ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative bg-[#09090b] text-white pt-24 sm:pt-28 md:pt-32 pb-12 px-4 sm:px-8 overflow-hidden">
          
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[radial-gradient(circle,rgba(0,159,227,0.18)_0%,transparent_70%)] blur-2xl" />
          </div>

          <div className="max-w-[1440px] mx-auto relative z-10">
            
            {/* Top Pill Tag */}
            <div className="flex justify-center mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#009FE3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009FE3] animate-pulse" />
                NEW 2026 PERFORMANCE SERIES
              </span>
            </div>

            {/* Centered 3D Interactive Shoe Stage */}
            <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center">
              
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span className="text-[20vw] sm:text-[14vw] font-black text-white/[0.04] tracking-tighter leading-none">
                  TOPSUN
                </span>
              </div>

              {/* 3D Shoe Model */}
              <div className="w-full h-[360px] sm:h-[440px] md:h-[500px] relative z-10">
                <HeroShoe3D />
              </div>

            </div>

            {/* Hero Typography */}
            <div className="text-center max-w-2xl mx-auto mt-2">
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05]">
                TOPSUN Performance Footwear <br />
                <span className="text-[#009FE3]">Redefined</span>
              </h1>

              <p className="text-zinc-400 text-xs sm:text-sm mt-2.5 max-w-md mx-auto leading-relaxed">
                Engineered for unmatched comfort, peak performance, and everyday style. Discover next-generation footwear handcrafted to power every step.
              </p>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
              <button
                onClick={() => navigate("/shop")}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#009FE3] hover:bg-[#008cc7] text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-[#009FE3]/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ShoppingBag size={15} />
                <span>Shop Collection</span>
              </button>
              <a
                href="#colorways"
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Explore Catalog</span>
                <ChevronRight size={14} />
              </a>
            </div>

          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          START OF WHITE THEME (REST OF WHOLE PAGE)
      ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Search Bar ── */}
      <section className="bg-zinc-50 border-b border-zinc-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search sneakers, running, everyday flex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") navigate("/shop");
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-[#009FE3] shadow-sm"
            />
          </div>
          <button
            onClick={() => navigate("/shop")}
            className="px-5 py-2.5 bg-[#009FE3] hover:bg-[#008bc5] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: 7 COLORWAYS HORIZONTAL SWIPE CAROUSEL (White Theme)
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="colorways" className="py-10 px-4 sm:px-8 max-w-[1440px] mx-auto overflow-hidden">
        
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#009FE3] uppercase block mb-1">
              ICONIC SILHOUETTES
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 uppercase tracking-tight">
              Trending 7 Colorways
            </h2>
          </div>
          <Link to="/shop" className="text-xs font-bold text-[#009FE3] hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {/* Scrollable Container with Snap */}
        <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.slug}`)}
              className="snap-center shrink-0 w-[240px] sm:w-[260px] bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-xl rounded-2xl p-3 sm:p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 group"
            >
              <div>
                {/* Product Image Box */}
                <div
                  className="relative aspect-square w-full rounded-xl p-3 flex items-center justify-center overflow-hidden mb-3"
                  style={{ backgroundColor: product.bgLight }}
                >
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#009FE3] text-white">
                      {product.discount}% OFF
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-white/90 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-red-500 shadow-sm transition-transform active:scale-90"
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart
                      size={14}
                      className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""}
                    />
                  </button>
                  <img
                    src={product.img}
                    alt={`${product.name} - ${product.colorLabel} ${product.category} Footwear`}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Details */}
                <div className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                  {product.category}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 leading-snug truncate mt-0.5">
                  {product.name}
                </h3>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {product.colorLabel}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-1.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold text-zinc-700">{product.rating}</span>
                  <span className="text-[10px] text-zinc-400">({product.reviews})</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-extrabold text-zinc-900">
                    ₹{product.price.toLocaleString()}
                  </div>
                  {product.discount > 0 && (
                    <div className="text-[11px] text-zinc-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSizeModalProduct(product);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-[#009FE3] text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm active:scale-95"
                  aria-label="Add to cart"
                >
                  <ShoppingCart size={13} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: 2-COLUMN MOBILE PRODUCT CATALOG (White Theme, Clean Cards)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4 sm:px-8 bg-zinc-50 border-t border-b border-zinc-200 max-w-[1440px] mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-bold font-mono tracking-widest text-[#009FE3] uppercase block mb-1">
              FULL SELECTION
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-zinc-900 uppercase tracking-tight">
              Shop By Category
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xl whitespace-nowrap transition-all ${
                  activeCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-[#009FE3] text-white shadow-sm font-bold"
                    : "bg-white border border-zinc-300 text-zinc-700 hover:border-zinc-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Clean Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-zinc-200 hover:border-zinc-300 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div>
                {/* Image Stage */}
                <div
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="relative aspect-square w-full rounded-xl p-3 flex items-center justify-center cursor-pointer overflow-hidden mb-2.5"
                  style={{ backgroundColor: product.bgLight }}
                >
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-white">
                      {product.discount}% OFF
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-white/90 border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-red-500 shadow-sm transition-transform active:scale-90"
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart
                      size={14}
                      className={wishlist.includes(product.id) ? "fill-red-500 text-red-500" : ""}
                    />
                  </button>
                  <img
                    src={product.img}
                    alt={`${product.name} - ${product.colorLabel} ${product.category} Footwear`}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase font-semibold">
                  {product.category}
                </div>
                <h3
                  onClick={() => navigate(`/product/${product.slug}`)}
                  className="text-xs sm:text-sm font-bold text-zinc-900 truncate mt-0.5 cursor-pointer hover:text-[#009FE3]"
                >
                  {product.name}
                </h3>
                <div className="text-[10px] sm:text-[11px] text-zinc-500 truncate">
                  {product.colorLabel}
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 mt-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-zinc-700">{product.rating}</span>
                  <span className="text-[9px] text-zinc-400">({product.reviews})</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-zinc-900">
                    ₹{product.price.toLocaleString()}
                  </div>
                  {product.discount > 0 && (
                    <div className="text-[10px] text-zinc-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSizeModalProduct(product)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#009FE3] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                >
                  <ShoppingBag size={12} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: COMFORT TECHNOLOGY & FEATURES (White Theme)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-8 max-w-[1440px] mx-auto">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#009FE3] uppercase block mb-1">
            WHY TOPSUN
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 uppercase tracking-tight">
            Crafted for Total Comfort
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-2">
            Engineered with high-rebound cushioning and breathable multi-layer knit for effortless stride.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {[
            { icon: Zap, title: "CloudMatrix™ Foam", desc: "Ultra-light impact absorption for all-day running & walking comfort." },
            { icon: Wind, title: "AeroMesh™ Matrix", desc: "360° dynamic ventilation upper keeps your feet cool under high friction." },
            { icon: Shield, title: "HexaGrip™ Rubber", desc: "Anti-slip multidirectional rubber lugs for wet and dry ground confidence." },
            { icon: Award, title: "Anatomical Fit", desc: "Contoured arch stabilizer that locks in your posture with zero hot-spots." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 hover:border-[#009FE3] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#009FE3] mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900">{title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: NEWSLETTER BANNER (Sage / Mint Container)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-4 sm:px-8 max-w-[1440px] mx-auto">
        <div className="bg-[#e8f5e9] border border-[#c8e6c9] rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto">
          <div className="w-10 h-10 rounded-full bg-white/80 border border-green-200 flex items-center justify-center mx-auto mb-3 text-emerald-700">
            <Sparkles size={18} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-snug">
            Step Into Next-Gen Comfort Together!
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 max-w-md mx-auto">
            Discover lightweight footwear engineered for your everyday stride. Subscribe for exclusive deals.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to TOPSUN!");
            }}
            className="flex flex-col sm:flex-row gap-2 mt-5 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 bg-white border border-zinc-300 rounded-xl text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#009FE3] shadow-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              Get Updates
            </button>
          </form>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: CONTACT & REGISTERED ADDRESS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-4 sm:px-8 bg-zinc-50 border-t border-b border-zinc-200">
        <div className="max-w-[1440px] mx-auto space-y-6">
          
          {/* Contact Row */}
          <div>
            <h2 className="text-xs font-bold uppercase text-zinc-400 font-mono tracking-wider mb-3">
              Customer Support &amp; Locations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href="https://wa.me/917485006659"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-zinc-200 hover:border-zinc-300 p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">Live WhatsApp Chat</div>
                    <div className="text-[10px] text-zinc-500">Instant responses 9 AM — 8 PM</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>

              <a
                href="tel:+917485006659"
                className="bg-white border border-zinc-200 hover:border-zinc-300 p-4 rounded-2xl flex items-center justify-between shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#009FE3] flex items-center justify-center">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900">+91 7485006659</div>
                    <div className="text-[10px] text-zinc-500">Customer Helpline &amp; Orders</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Registered Office Box */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-700 mb-2">
              <MapPin size={16} />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
              INTELAGROW PVT. LTD. — REGISTERED OFFICE
            </h3>
            <p className="text-xs text-zinc-600 mt-1 max-w-md mx-auto leading-relaxed">
              A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman - 713358, West Bengal, India
            </p>
            <div className="text-[11px] text-zinc-400 mt-2 font-mono">
              Operational: Everyday (10:00 AM — 7:00 PM IST)
            </div>
          </div>

          {/* 100% Secure Transaction & Payment Methods */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
              <Lock size={12} className="text-emerald-600" />
              <span>100% Secure & Encrypted Transactions</span>
            </div>

            {/* Payment Badges Strip */}
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-lg mx-auto">
              {["UPI", "GPay", "PhonePe", "Paytm", "CRED", "LazyPay", "RuPay", "VISA", "Mastercard", "NetBanking"].map((pay) => (
                <span
                  key={pay}
                  className="px-2.5 py-1 bg-white border border-zinc-200 rounded-md text-[10px] font-bold text-zinc-700 shadow-2xs"
                >
                  {pay}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: D2C E-COMMERCE FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-white pt-12 pb-20 sm:pb-12 px-4 sm:px-8 border-t border-zinc-200">
        <div className="max-w-[1440px] mx-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-zinc-200 text-xs">
            
            {/* Column 1: Shop By Category */}
            <div>
              <div className="text-zinc-900 font-bold uppercase tracking-wider mb-3.5">
                Shop By Category
              </div>
              <ul className="space-y-2 text-zinc-600">
                <li><Link to="/shop" className="hover:text-[#009FE3]">Running Sneakers</Link></li>
                <li><Link to="/shop" className="hover:text-[#009FE3]">Casual Classic</Link></li>
                <li><Link to="/shop" className="hover:text-[#009FE3]">Outdoor Trails</Link></li>
                <li><Link to="/shop" className="hover:text-[#009FE3]">Walking Everyday</Link></li>
                <li><Link to="/shop" className="hover:text-[#009FE3]">All 7 Colorways</Link></li>
              </ul>
            </div>

            {/* Column 2: Help & Support */}
            <div>
              <div className="text-zinc-900 font-bold uppercase tracking-wider mb-3.5">
                Help & Support
              </div>
              <ul className="space-y-2 text-zinc-600">
                <li><Link to="/track-order" className="hover:text-[#009FE3]">Track Order</Link></li>
                <li><Link to="/returns" className="hover:text-[#009FE3]">7-Day Returns & Exchange</Link></li>
                <li><Link to="/sizing-guide" className="hover:text-[#009FE3]">UK Sizing Guide</Link></li>
                <li><Link to="/faq" className="hover:text-[#009FE3]">Frequently Asked Questions</Link></li>
                <li><a href="mailto:topsunshoes7@gmail.com" className="hover:text-[#009FE3]">Email Us</a></li>
              </ul>
            </div>

            {/* Column 3: Policy */}
            <div>
              <div className="text-zinc-900 font-bold uppercase tracking-wider mb-3.5">
                Policy
              </div>
              <ul className="space-y-2 text-zinc-600">
                <li><Link to="/terms-of-service" className="hover:text-[#009FE3]">Terms & Conditions</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-[#009FE3]">Privacy Policy</Link></li>
                <li><Link to="/returns" className="hover:text-[#009FE3]">Shipping & Exchange Policy</Link></li>
                <li><a href="#" className="hover:text-[#009FE3]">Cookie Settings</a></li>
              </ul>
            </div>

            {/* Column 4: About & Social */}
            <div>
              <div className="text-zinc-900 font-bold uppercase tracking-wider mb-3.5">
                About TOPSUN
              </div>
              <p className="text-zinc-500 leading-relaxed mb-4">
                TOPSUN is an Indian athletic footwear brand engineered to bring high-rebound cushioning and aerospace knit directly from factory to athletes.
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href="https://www.instagram.com/top_sunshoes7?igsh=MXNnc3Q1NGFiam0wMw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-[#009FE3] hover:border-[#009FE3] shadow-2xs transition-colors"
                  aria-label="Follow TOPSUN on Instagram"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href="https://wa.me/917485006659"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg border border-zinc-200 flex items-center justify-center text-emerald-600 hover:border-emerald-500 shadow-2xs transition-colors"
                  aria-label="Chat with TOPSUN Support on WhatsApp"
                >
                  <Phone size={17} />
                </a>
                <a
                  href="mailto:topsunshoes7@gmail.com"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg border border-zinc-200 flex items-center justify-center text-sky-600 hover:border-sky-500 shadow-2xs transition-colors"
                  aria-label="Email TOPSUN Support"
                >
                  <Mail size={17} />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <div>© 2026 TOPSUN Footwear India. All Rights Reserved.</div>
            <div className="font-mono text-[11px]">Crafted with Precision // Direct Factory Dispatch</div>
          </div>

        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════════════════
          SIZE SELECTION POPUP MODAL (Matching Screenshot)
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {sizeModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeModalProduct(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Card Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl z-10 border border-zinc-100"
            >
              {/* Header with Title and Close (X) */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
                  Select Size (UK)
                </h3>
                <button
                  onClick={() => setSizeModalProduct(null)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors"
                  aria-label="Close size modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Product Mini Preview Header */}
              <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 mb-5">
                <div className="w-14 h-14 rounded-xl p-1 bg-white border border-zinc-200 flex items-center justify-center shrink-0">
                  <img
                    src={sizeModalProduct.img}
                    alt={sizeModalProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-extrabold text-zinc-900 truncate">
                    {sizeModalProduct.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {sizeModalProduct.colorLabel}
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xs font-black text-[#009FE3]">
                      ₹{sizeModalProduct.price.toLocaleString()}
                    </span>
                    {sizeModalProduct.discount > 0 && (
                      <span className="text-[10px] text-zinc-400 line-through">
                        ₹{sizeModalProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Large Tap-Friendly UK Size Pills */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSelectSizeAndAdd(sizeModalProduct, size)}
                    className="py-3 sm:py-3.5 border-2 border-zinc-200 hover:border-[#009FE3] hover:text-[#009FE3] hover:bg-sky-50 active:scale-95 text-zinc-900 font-extrabold text-sm sm:text-base rounded-2xl transition-all shadow-xs flex items-center justify-center"
                  >
                    UK {size}
                  </button>
                ))}
              </div>

              {/* Subtitle helper */}
              <p className="text-[11px] text-zinc-400 text-center font-medium">
                Tap your size to add directly to cart
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          FLOATING ACTION BUTTONS
      ═══════════════════════════════════════════════════════════════════ */}
      {/* Floating Cart (Mobile View) */}
      <button
        onClick={() => navigate("/cart")}
        className="fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-2xl hover:bg-[#009FE3] transition-colors relative sm:hidden"
        aria-label="View Cart"
      >
        <ShoppingBag size={20} />
        {getCartItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#009FE3] text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
            {getCartItemCount()}
          </span>
        )}
      </button>

    </div>
  );
}
