import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Ruler, ChevronRight, Info, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const SIZE_TABLE = [
  { uk: '7', india: '7', us: '8', eu: '41', foot: '25.5' },
  { uk: '8', india: '8', us: '9', eu: '42', foot: '26.5' },
  { uk: '9', india: '9', us: '10', eu: '43', foot: '27.5' },
  { uk: '10', india: '10', us: '11', eu: '44', foot: '28.5' },
];

export default function SizingGuide() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Shoe Size Chart & UK/India Conversion Guide | TOPSUN"
        description="Find your perfect shoe size with TOPSUN's UK / Indian footwear size guide. Accurate CM foot measurements and step-by-step sizing instructions."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Sizing Guide', url: '/sizing-guide' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[900px] mx-auto px-4 sm:px-6 space-y-10">
        <Breadcrumbs items={[{ label: 'Sizing Guide' }]} />

        {/* Hero */}
        <div className="text-center space-y-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Ruler size={12} className="text-[#b38b3f]" />
            Find Your Exact Fit
          </span>
          <h1
            className="text-3xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Footwear Sizing Chart
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] max-w-lg mx-auto leading-relaxed">
            All TOPSUN athletic footwear follows standard UK / Indian sizing and fits True to Size (TTS). Use this guide to ensure a glove-like athletic fit.
          </p>
        </div>

        {/* Size Conversion Table */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-[#e4ded5] bg-[#faf7f2]">
            <h2
              className="text-xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Size Conversion Chart
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#faf7f2] border-b border-[#e4ded5]">
                  {['UK / India', 'US Men', 'EU Size', 'Foot Length (CM)'].map((h) => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-bold text-[#606870] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4ded5]">
                {SIZE_TABLE.map((row) => (
                  <tr key={row.uk} className="hover:bg-[#faf7f2] transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-[#121518]">UK {row.uk} / IN {row.india}</td>
                    <td className="px-6 py-4 text-xs text-gray-700">US {row.us}</td>
                    <td className="px-6 py-4 text-xs text-gray-700">EU {row.eu}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-[#b38b3f]">{row.foot} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Measure Steps */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-10 shadow-xs space-y-6">
          <h2
            className="text-2xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            How to Measure Your Foot Length
          </h2>
          <ol className="space-y-4">
            {[
              'Place a blank sheet of paper on a flat hard floor against a wall.',
              'Stand on the paper with your heel lightly touching the wall.',
              'Mark the longest point of your toes with a pen held completely vertically.',
              'Measure the distance from the edge of the paper to the mark in centimetres.',
              'Compare your measurement with our chart. If you fall between sizes, order the larger size.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3.5 text-xs sm:text-sm text-[#606870]">
                <span className="w-6 h-6 rounded-full bg-[#121518] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Expert Fit Tips */}
        <div className="bg-[#121518] text-white rounded-3xl p-8 sm:p-10 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Info size={18} className="text-[#dfc38a] shrink-0" />
            <h3
              className="text-xl sm:text-2xl font-semibold text-white"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Fit Recommendations
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2"><ChevronRight size={13} className="text-[#dfc38a] mt-0.5 shrink-0" /> Measure your feet in the evening when they are naturally at their largest.</li>
            <li className="flex items-start gap-2"><ChevronRight size={13} className="text-[#dfc38a] mt-0.5 shrink-0" /> All TOPSUN running shoes feature generous toebox room to allow natural toe splay.</li>
            <li className="flex items-start gap-2"><ChevronRight size={13} className="text-[#dfc38a] mt-0.5 shrink-0" /> If you have wider feet, consider going half a size up for extra lateral comfort.</li>
          </ul>
          <div className="pt-2">
            <a
              href="https://wa.me/917485006659?text=Hi%20TOPSUN!%20I%20need%20help%20choosing%20the%20right%20shoe%20size."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <MessageCircle size={14} />
              <span>Ask Our Sizing Expert</span>
            </a>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#121518] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-xs"
          >
            <span>Shop All Footwear</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
