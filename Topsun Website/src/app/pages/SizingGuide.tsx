import React, { useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Ruler, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function SizingGuide() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sizeChart = [
    { uk: 7, us: 8, eu: 41, cm: 25.5, foot: 'Standard Fit' },
    { uk: 8, us: 9, eu: 42, cm: 26.5, foot: 'Standard Fit' },
    { uk: 9, us: 10, eu: 43, cm: 27.5, foot: 'Standard Fit' },
    { uk: 10, us: 11, eu: 44, cm: 28.5, foot: 'Standard Fit' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20need%20help%20choosing%20my%20shoe%20size."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Hero */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[11px] uppercase tracking-widest mb-3">
            Perfect Fit Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Footwear Sizing Chart (UK)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
            All TOPSUN sneakers are crafted to standard UK sizing. Use this chart to find your exact match.
          </p>
        </section>

        {/* Measuring Steps */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Ruler size={20} className="text-[#009FE3]" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">How to Measure Your Foot Length</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="text-xs font-black text-[#009FE3]">STEP 01</span>
              <p className="text-xs text-gray-700 font-medium mt-1">Place a white sheet of paper on a flat hard floor against a wall.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="text-xs font-black text-[#009FE3]">STEP 02</span>
              <p className="text-xs text-gray-700 font-medium mt-1">Stand on it with your heel touching the wall and mark your longest toe.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <span className="text-xs font-black text-[#009FE3]">STEP 03</span>
              <p className="text-xs text-gray-700 font-medium mt-1">Measure the distance with a ruler in cm and check the table below.</p>
            </div>
          </div>
        </div>

        {/* Size Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs overflow-hidden">
          <h3 className="text-base font-bold text-gray-900 mb-4">Official Conversion Chart</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                  <th className="p-3.5">UK Size</th>
                  <th className="p-3.5">US Size</th>
                  <th className="p-3.5">EU Size</th>
                  <th className="p-3.5">Length (cm)</th>
                  <th className="p-3.5">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sizeChart.map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3.5 font-extrabold text-sm text-gray-900">UK {row.uk}</td>
                    <td className="p-3.5 text-gray-600 font-semibold">US {row.us}</td>
                    <td className="p-3.5 text-gray-600 font-semibold">EU {row.eu}</td>
                    <td className="p-3.5 font-mono font-bold text-[#009FE3]">{row.cm} cm</td>
                    <td className="p-3.5 text-emerald-600 font-bold">{row.foot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pro Sizing Tip */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 flex items-start gap-3.5">
          <CheckCircle2 size={22} className="text-[#009FE3] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="block text-sm font-bold mb-1">Wide Foot Recommendation:</strong>
            If your feet are broader than average or you prefer a relaxed toe box for long running sessions, choose one size up (e.g. if you normally wear UK 8, order UK 9).
          </div>
        </div>

        {/* CTA Shop */}
        <div className="text-center pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-md transition-colors"
          >
            Browse Footwear Collection <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0c0c] text-white py-12 px-6 text-center text-xs text-gray-400 space-y-3">
        <p>© 2026 TOPSUN Performance Sneakers. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-gray-500 font-semibold">
          <Link to="/about" className="hover:text-white">About Us</Link>
          <Link to="/shop" className="hover:text-white">Shop</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
