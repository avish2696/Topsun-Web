import React, { useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Package, MessageCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function Returns() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      num: '1',
      title: 'Initiate on WhatsApp or Email',
      desc: 'Send your Order ID and photo to our WhatsApp line (+91 7485006659) or topsunshoes7@gmail.com.',
    },
    {
      num: '2',
      title: 'Free Reverse Pickup',
      desc: 'Our courier partner will arrange a doorstep pickup from your registered address.',
    },
    {
      num: '3',
      title: 'Instant Replacement or Refund',
      desc: 'Once inspected, the new size is dispatched or full refund credited within 3-5 business days.',
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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20want%20to%20exchange/return%20my%20shoes."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[1000px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Banner */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[11px] uppercase tracking-widest mb-3">
            Hassle-Free Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            7-Day Easy Returns & Exchanges
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mt-2 leading-relaxed">
            Wrong size? Not what you expected? No worries! We make shoe exchanges super fast and stress-free.
          </p>
        </section>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#009FE3] flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">7-Day Window</h4>
              <p className="text-xs text-gray-500">From the date of delivery</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Free Reverse Pickup</h4>
              <p className="text-xs text-gray-500">No extra return charges</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200/70 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">100% Refund</h4>
              <p className="text-xs text-gray-500">Direct to original payment method</p>
            </div>
          </div>
        </div>

        {/* How It Works Steps */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Simple 3-Step Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {steps.map((s, idx) => (
              <div key={idx} className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-2">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-extrabold text-xs flex items-center justify-center">
                  {s.num}
                </div>
                <h3 className="font-bold text-sm text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility Conditions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
              <CheckCircle size={16} className="text-emerald-600" /> Eligible for Return
            </h4>
            <ul className="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
              <li>Unworn condition with tags intact</li>
              <li>Original shoe box and packaging</li>
              <li>Within 7 days of delivery</li>
            </ul>
          </div>

          <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 space-y-2">
            <h4 className="font-bold text-sm text-rose-900 flex items-center gap-1.5">
              <Clock size={16} className="text-rose-600" /> Not Eligible
            </h4>
            <ul className="text-xs text-rose-800 space-y-1.5 list-disc list-inside">
              <li>Shoes with outdoor sole wear or dirt</li>
              <li>Items without original tags or box</li>
              <li>Requests initiated after 7 days</li>
            </ul>
          </div>
        </section>

        {/* Action Prompt */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200/70 text-center space-y-3 shadow-xs">
          <h3 className="text-xl font-bold text-gray-900">Need to Exchange a Size Right Now?</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Our WhatsApp support representative will quickly verify your order and schedule a reverse courier pickup.
          </p>
          <a
            href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20want%20to%20exchange%20my%20shoe%20size."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md transition-colors mt-2"
          >
            <MessageCircle size={16} className="fill-current" /> Chat on WhatsApp for Exchange
          </a>
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
