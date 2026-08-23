import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Briefcase, Users, Target, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function Careers() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const openings = [
    {
      title: 'Footwear & Product Designer',
      department: 'Design & R&D',
      location: 'Raniganj, West Bengal / Hybrid',
      type: 'Full-time',
      description: 'Craft high-performance running silhouettes, midsole ergonomics, and color palettes.',
    },
    {
      title: 'Supply Chain & Logistics Specialist',
      department: 'Operations',
      location: 'India',
      type: 'Full-time',
      description: 'Oversee warehouse fulfillment, courier SLA tracking, and direct distribution.',
    },
    {
      title: 'Customer Experience & WhatsApp Specialist',
      department: 'Customer Care',
      location: 'Remote',
      type: 'Full-time',
      description: 'Delight athletes and runners with rapid sizing guidance and seamless exchange support.',
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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I'm%20interested%20in%20career%20opportunities."
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
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[11px] uppercase tracking-widest mb-3">
            Careers at TOPSUN
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight">
            Build the Future of <br />
            <span className="text-[#009FE3]">Athletic Footwear</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2 leading-relaxed">
            Join a fast-moving team dedicated to engineering pro-tier running shoes at direct-to-consumer prices.
          </p>
        </section>

        {/* Culture Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center">
              <Target size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Obsessed with Quality</h3>
            <p className="text-xs text-gray-500">Every shoe is built with high-density EVA foam and tested on real tracks.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center">
              <Users size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Direct Impact</h3>
            <p className="text-xs text-gray-500">Fast decision making without corporate bureaucracy or endless red tape.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center">
              <Heart size={20} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Competitive Growth</h3>
            <p className="text-xs text-gray-500">Fair compensation, health allowances, and shoe allowances for team members.</p>
          </div>
        </div>

        {/* Open Roles */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Open Roles</h2>
          <div className="space-y-3">
            {openings.map((job, idx) => (
              <div
                key={idx}
                className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-[#009FE3] tracking-wider">{job.department}</span>
                  <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                  <p className="text-xs text-gray-600">{job.description}</p>
                  <p className="text-[11px] text-gray-400 font-medium">📍 {job.location} · {job.type}</p>
                </div>
                <a
                  href={`mailto:topsunshoes7@gmail.com?subject=Job%20Application%20-%20${encodeURIComponent(job.title)}`}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl whitespace-nowrap self-start sm:self-center transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            ))}
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
