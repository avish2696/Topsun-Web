import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Leaf, Droplet, Recycle, Target, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const initiatives = [
  {
    icon: Leaf,
    title: 'Eco-Engineered Knits',
    desc: 'Recycled polymer fibres in upper mesh without compromising tensile strength or breathability.',
  },
  {
    icon: Droplet,
    title: 'Water-Conscious Dyeing',
    desc: 'Reduced freshwater consumption in sole tinting and upper pigment binding processes.',
  },
  {
    icon: Recycle,
    title: 'Zero Single-Use Plastic',
    desc: '100% biodegradable shoe boxes printed with water-based non-toxic vegetable inks.',
  },
  {
    icon: Target,
    title: 'Long-Life Outsoles',
    desc: 'High-density vulcanized rubber engineered to outlast typical marathon runners by 30%.',
  },
];

export default function Sustainability() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Sustainability & Eco Commitment | TOPSUN Footwear"
        description="Learn how TOPSUN engineers long-lasting athletic footwear using water-conscious dyeing, recycled polymers, and plastic-free packaging."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Sustainability', url: '/sustainability' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[1000px] mx-auto px-4 sm:px-6 space-y-10">
        <Breadcrumbs items={[{ label: 'Sustainability' }]} />

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-12 shadow-xs text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold tracking-wider uppercase">
            <Leaf size={12} className="text-emerald-600" />
            Responsible Engineering
          </span>
          <h1
            className="text-3xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Sustainable by Design. <br />
            <span className="text-[#b38b3f]">High Performance by Nature.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] max-w-lg mx-auto leading-relaxed">
            We engineer premium shoes designed to last longer, reduce landfill waste, and minimize environmental impact.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {initiatives.map((init, i) => {
            const Icon = init.icon;
            return (
              <div key={i} className="bg-white p-6 rounded-3xl border border-[#e4ded5] shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-bold text-[#121518] mb-1">{init.title}</h3>
                  <p className="text-xs text-[#606870] leading-relaxed">{init.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commitment Statement */}
        <div className="bg-[#121518] text-white rounded-3xl p-8 sm:p-12 space-y-4 shadow-xs">
          <h2
            className="text-2xl sm:text-3xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Direct Distribution, Minimal Waste
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
            By eliminating multi-tiered middlemen and shipping direct to athletes, TOPSUN minimizes redundant shipping hops, cuts warehouse deadstock, and ensures clean ethical factory working conditions in our partner facilities across India.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#b38b3f] hover:bg-[#9a7535] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
