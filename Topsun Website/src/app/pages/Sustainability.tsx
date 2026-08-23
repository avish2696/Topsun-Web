import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Leaf, Droplet, Recycle, Target, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function Sustainability() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const initiatives = [
    {
      icon: Leaf,
      title: 'Eco-Engineered Mesh',
      desc: 'Using breathable recycled polymers in upper knits without compromising durability.',
    },
    {
      icon: Droplet,
      title: 'Water-Conscious Dyeing',
      desc: 'Reduced freshwater consumption in sole tinting and upper pigment binding.',
    },
    {
      icon: Recycle,
      title: 'Zero Single-Use Plastic',
      desc: '100% biodegradable shoe boxes with water-based non-toxic inks.',
    },
    {
      icon: Target,
      title: 'Long-Lasting Outsoles',
      desc: 'High-density EVA foam and vulcanized rubber engineered to outlast standard runners.',
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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20question%20about%20your%20materials."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[1000px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Hero */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[10px] uppercase tracking-widest mb-3">
            <Leaf size={12} /> Environmental Commitment
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight">
            Sustainable <br />
            <span className="text-[#009FE3]">High Performance</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2 leading-relaxed">
            We engineer premium shoes designed to last longer, reduce landfill waste, and minimize environmental impact.
          </p>
        </section>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {initiatives.map((init, i) => {
            const Icon = init.icon;
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center mb-3">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{init.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{init.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Commitment Statement */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Crafted with Responsibility</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            By eliminating unnecessary middle-tier markups and selling directly to athletes, TOPSUN minimizes warehousing waste and ensures ethical factory working conditions in our partner manufacturing facilities.
          </p>
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md"
            >
              Explore Our Shoes <ArrowRight size={14} />
            </Link>
          </div>
        </section>
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
