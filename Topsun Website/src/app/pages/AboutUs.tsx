import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Target, Users, ShieldCheck, Heart, Sparkles, ArrowRight, Award, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

export default function AboutUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const stats = [
    { label: 'Pairs Delivered in India', value: '50,000+' },
    { label: 'Customer Satisfaction', value: '4.8 ★' },
    { label: 'Direct Savings', value: 'Up to 60%' },
    { label: 'Hassle-Free Exchange Window', value: '7 Days' },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="About Us – The TOPSUN Story & Athletic Mission"
        description="Learn how TOPSUN Footwear is engineering pro-tier athletic shoes with responsive EVA foam and breathable mesh for Indian runners at accessible direct-to-consumer prices."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[1040px] mx-auto px-4 sm:px-6 space-y-12">
        <Breadcrumbs items={[{ label: 'About TOPSUN' }]} />

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto space-y-4 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Sparkles size={12} className="text-[#b38b3f]" />
            Engineered in India
          </span>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Born on the Track. <br />
            <span className="text-[#b38b3f]">Built for the Stride.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] leading-relaxed max-w-xl mx-auto">
            TOPSUN was founded with a singular conviction: Indian athletes, runners, and everyday explorers deserve elite performance cushioning without paying exorbitant international markups.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-[#e4ded5] text-center shadow-xs space-y-1">
              <span
                className="text-2xl sm:text-3xl font-bold text-[#121518]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {s.value}
              </span>
              <p className="text-[11px] font-bold text-[#606870] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Brand Mission & Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#e4ded5] shadow-xs space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b38b3f]">Our Heritage</span>
            <h2
              className="text-2xl sm:text-3xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Direct from Factory to Athlete
            </h2>
            <p className="text-xs sm:text-sm text-[#606870] leading-relaxed">
              Operating under <strong>INTELAGROW PVT. LTD.</strong> (Raniganj, West Bengal), TOPSUN eliminates retail middlemen and distributor markups. Every rupee saved is reinvested directly into high-density EVA midsole foam, honeycomb traction outsoles, and breathable engineered mesh.
            </p>
            <p className="text-xs sm:text-sm text-[#606870] leading-relaxed">
              Whether you are running your first 5K, logging daily walking miles, or conquering city pavement, TOPSUN shoes deliver comfort that lasts morning to night.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-[#e4ded5] shadow-xs flex gap-4 items-start">
              <div className="w-11 h-11 rounded-xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#121518]">Track-Tested Cushioning</h3>
                <p className="text-xs text-[#606870] leading-relaxed">Dual-density EVA foam engineered for responsive rebound and maximum knee protection.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e4ded5] shadow-xs flex gap-4 items-start">
              <div className="w-11 h-11 rounded-xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#121518]">Indian Anatomy Fit</h3>
                <p className="text-xs text-[#606870] leading-relaxed">Designed with generous toebox room tailored to standard Indian foot morphology.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e4ded5] shadow-xs flex gap-4 items-start">
              <div className="w-11 h-11 rounded-xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#121518]">7-Day Size Guarantee</h3>
                <p className="text-xs text-[#606870] leading-relaxed">Free reverse courier pickup if your shoes don't fit like a second skin.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#121518] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4">
          <h2
            className="text-2xl sm:text-4xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ready to Elevate Your Stride?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
            Experience our bestselling running and athletic collection with free delivery across India.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#b38b3f] hover:bg-[#9a7535] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
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
