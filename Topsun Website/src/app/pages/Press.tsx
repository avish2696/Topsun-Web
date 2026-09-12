import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const articles = [
  {
    date: 'August 2026',
    title: 'TOPSUN Expands Next-Gen Running Line with Sunspark & Storm Runner',
    excerpt: 'Featuring responsive EVA cushioning and high-traction honeycomb outsoles for marathon enthusiasts and street runners — available directly via topsun.in.',
    tag: 'Product Announcement',
  },
  {
    date: 'July 2026',
    title: 'D2C Footwear Innovation: TOPSUN Surpasses 50,000 Pairs Shipped in India',
    excerpt: 'Bridging the gap between premium performance athletic footwear and accessible direct-to-consumer pricing across all Indian PIN codes.',
    tag: 'Milestone',
  },
];

export default function Press() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Press & Media Kit – TOPSUN Footwear Newsroom"
        description="Latest press releases, brand milestones, and product announcements from TOPSUN performance footwear. Contact our media relations team."
        canonicalUrl="https://topsun.in/press"
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Press', url: '/press' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
        <Breadcrumbs items={[{ label: 'Press & Media' }]} />

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-10 shadow-xs text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Newspaper size={12} className="text-[#b38b3f]" /> Newsroom & Media
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Press Releases & News
          </h1>
          <p className="text-xs text-[#606870] max-w-md mx-auto">
            The latest updates, brand milestones, and product innovations from TOPSUN.
          </p>
        </div>

        {/* Articles */}
        <div className="space-y-4">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[rgba(179,139,63,0.12)] text-[#8c6820] border border-[rgba(179,139,63,0.2)] uppercase tracking-wider">
                  {art.tag}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} /> {art.date}
                </div>
              </div>
              <h2
                className="text-xl font-semibold text-[#121518] leading-snug"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {art.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#606870] leading-relaxed">{art.excerpt}</p>
            </div>
          ))}
        </div>

        {/* Media Contact */}
        <div className="bg-[#121518] text-white rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <h3
            className="text-2xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Media & Press Inquiries
          </h3>
          <p className="text-xs text-gray-300">
            For interview requests, sponsorships, or high-res press assets:
          </p>
          <div className="pt-2">
            <a
              href="mailto:topsunshoes7@gmail.com?subject=Press Inquiry"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#b38b3f] hover:bg-[#9a7535] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <span>topsunshoes7@gmail.com</span>
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
