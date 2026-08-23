import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Newspaper, Calendar, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function Press() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const articles = [
    {
      date: 'August 2026',
      title: 'TOPSUN Expands Next-Gen Running Line with Sunspark & Storm Runner',
      excerpt: 'Featuring responsive EVA cushioning and high-traction honeycomb outsoles for marathon enthusiasts and street runners.',
      tag: 'Product Announcement',
    },
    {
      date: 'July 2026',
      title: 'D2C Footwear Innovation: TOPSUN Surpasses 50,000 Pairs Shipped in India',
      excerpt: 'Bridging the gap between premium performance athletic footwear and accessible pricing.',
      tag: 'Milestone',
    },
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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20press/media%20inquiry."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[10px] uppercase tracking-widest mb-3">
            <Newspaper size={12} /> Newsroom & Media
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Press Releases & News
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2">
            The latest updates, brand milestones, and product innovations from TOPSUN.
          </p>
        </div>

        <div className="space-y-4">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#009FE3] uppercase">
                  {art.tag}
                </span>
                <span className="text-xs text-gray-400 font-medium">{art.date}</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">{art.title}</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{art.excerpt}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 text-center space-y-2 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900">Media & Press Inquiries</h3>
          <p className="text-xs text-gray-500">For interview requests or high-res press assets, please contact:</p>
          <p className="text-xs font-bold text-[#009FE3]">topsunshoes7@gmail.com</p>
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
