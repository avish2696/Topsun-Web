import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Heart, Zap, Leaf, Target, Users, Award, Instagram, Facebook, MessageCircle, ArrowRight } from 'lucide-react';
import { ResponsiveImage } from '@/app/components/ResponsiveImage';
import { Link, useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

import Shoe1 from '@/imports/storm-runner/1.png';
import Shoe3 from '@/imports/trail-blaze/1.png';
import Shoe5 from '@/imports/street-edge/1.png';

export default function AboutUs() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const values = [
    {
      icon: Zap,
      label: 'Performance First',
      description: 'Built for athletes who demand excellence. Every shoe is tested, refined, and perfected.',
    },
    {
      icon: Heart,
      label: 'Real Craftsmanship',
      description: 'Designed in-house, produced with precision. No shortcuts, no compromises on quality.',
    },
    {
      icon: Target,
      label: 'Accessible Excellence',
      description: 'Premium performance at fair prices. Great shoes shouldn\'t cost a fortune.',
    },
    {
      icon: Leaf,
      label: 'Responsibility',
      description: 'Sourcing sustainable materials and ethical manufacturing practices wherever possible.',
    },
  ];

  const milestones = [
    { number: '2020', label: 'Founded', description: 'TOPSUN launched with our first collection' },
    { number: '50K+', label: 'Happy Runners', description: 'Athletes and everyday customers worldwide' },
    { number: '7', label: 'Pro Collections', description: 'Engineered for street, running, and all-day comfort' },
    { number: '100%', label: 'Made with Pride', description: 'Quality inspection on every single pair' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20question%20about%20your%20story%20and%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
        {/* Page Hero Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-200/70 shadow-xs text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[11px] uppercase tracking-widest mb-4">
            Our Story & Craft
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 leading-tight mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Built for Runners. <br />
            <span className="text-[#009FE3]">Designed for All-Day Comfort.</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We started TOPSUN with a simple mission: building the fastest, most durable, and most comfortable performance footwear without the unfair luxury markups.
          </p>
        </section>

        {/* Story Grid with Shoe Preview */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-4">
            <span className="text-xs font-bold text-[#009FE3] uppercase tracking-wider">How It Started</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Footwear That Actually Performs</h2>
            <div className="text-xs sm:text-sm text-gray-600 space-y-3 leading-relaxed">
              <p>
                Our founders spent years testing footwear and watching traditional brands compromise on foam density and upper breathability.
              </p>
              <p>
                In 2020, we launched TOPSUN with engineered mesh, multi-density EVA midsoles, and responsive cushioning that holds up mile after mile.
              </p>
              <p>
                Today, with over 50,000+ happy runners and thousands of 5-star reviews, we continue to innovate with direct-to-consumer pricing.
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md mt-2"
            >
              Explore Our Shoes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-[#f4f4f2] rounded-3xl p-8 border border-gray-200/70 flex items-center justify-center aspect-square shadow-xs">
            <ResponsiveImage
              src={Shoe3}
              alt="TOPSUN Sunspark"
              className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
            />
          </div>
        </section>

        {/* Values Cards */}
        <section className="space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold text-[#009FE3] uppercase tracking-wider">Core Pillars</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-200/70 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">{val.label}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{val.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Milestones in Numbers */}
        <section className="bg-white rounded-3xl p-8 border border-gray-200/70 shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {milestones.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black text-[#009FE3]">{m.number}</div>
                <div className="text-sm font-bold text-gray-900">{m.label}</div>
                <div className="text-xs text-gray-500">{m.description}</div>
              </div>
            ))}
          </div>
        </section>

        {/* INTELAGROW PVT. LTD. Corporate Info */}
        <section className="bg-white rounded-3xl p-8 border border-gray-200/70 shadow-xs text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#009FE3]">Corporate Headquarters</span>
          <h3 className="text-xl font-bold text-gray-900">INTELAGROW PVT. LTD.</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            TOPSUN is a flagship brand owned and operated by <strong className="text-gray-900">INTELAGROW PVT. LTD.</strong>
          </p>
          <div className="pt-2 text-xs text-gray-500 max-w-md mx-auto">
            <strong className="text-gray-700">Registered Office:</strong> A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman - 713358, West Bengal, India
          </div>
          <div className="text-xs text-gray-500">
            Official Email: <a href="mailto:topsunshoes7@gmail.com" className="text-[#009FE3] font-bold hover:underline">topsunshoes7@gmail.com</a> | Phone & WhatsApp: <a href="tel:+917485006659" className="text-gray-900 font-bold hover:underline">+91 7485006659</a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0c0c] text-white py-12 px-6">
        <div className="max-w-[1200px] mx-auto text-center space-y-4">
          <p className="text-xs text-gray-400">© 2026 TOPSUN Performance Sneakers. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-xs text-gray-400 font-semibold">
            <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
