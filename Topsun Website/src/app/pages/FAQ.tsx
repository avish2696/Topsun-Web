import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function FAQ() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const faqs = [
    {
      q: 'How do TOPSUN shoes fit? What size should I choose?',
      a: 'TOPSUN footwear fits true to standard UK sizes (UK 7 to UK 10). If you wear size 8 in athletic shoes, order UK 8. For wider feet, consider going up half a size for enhanced toe comfort.',
    },
    {
      q: 'How long does delivery take in India?',
      a: 'Orders are dispatched within 24 hours. Express shipping takes 2 to 4 business days, and standard delivery takes 4 to 6 business days across India.',
    },
    {
      q: 'What is the return and exchange policy?',
      a: 'We offer a hassle-free 7-day exchange and return policy for unworn shoes in their original box and tags. Simply WhatsApp or email our support team to initiate.',
    },
    {
      q: 'Are TOPSUN shoes good for running and gym workouts?',
      a: 'Yes! Engineered mesh uppers combined with responsive EVA midsoles provide impact absorption, high breathability, and non-slip rubber grip for all-day sports and street wear.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Razorpay Secure Checkout.',
    },
    {
      q: 'How do I clean and care for my TOPSUN sneakers?',
      a: 'Wipe clean with a damp microfiber cloth and mild soap. Air dry at room temperature away from direct extreme heat. Do not machine wash.',
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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20question."
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
            Help Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
            Find fast answers about sizing, shipping times, returns, and shoe care.
          </p>
        </section>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200/70 rounded-2xl overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/70 transition-colors"
              >
                <span className="font-bold text-sm sm:text-base text-gray-900 pr-3">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[#009FE3] transition-transform duration-200 flex-shrink-0 ${
                    expanded === i ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100 bg-gray-50/50"
                  >
                    <p className="px-5 py-4 text-xs sm:text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Still Have Questions Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 text-center space-y-3 shadow-xs">
          <h3 className="text-xl font-bold text-gray-900">Still have a question?</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Our support team is available 6 days a week to help you choose the right fit or track an order.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors shadow-xs"
            >
              Contact Us
            </Link>
            <a
              href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <MessageCircle size={14} className="fill-current" /> WhatsApp Support
            </a>
          </div>
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
