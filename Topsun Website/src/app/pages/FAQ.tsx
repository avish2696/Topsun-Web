import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { ChevronDown, MessageCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const FAQS = [
  {
    category: 'Sizing & Fit',
    q: 'How do TOPSUN shoes fit? Are they true to size?',
    a: 'Yes! All TOPSUN athletic shoes follow standard UK / Indian sizing and fit True to Size (TTS). If you typically wear a UK 8 in sports footwear, order a UK 8 in TOPSUN. If you have wider feet or fall between sizes, we recommend sizing up half a size.',
  },
  {
    category: 'Sizing & Fit',
    q: 'What should I do if the shoe size does not fit?',
    a: 'We offer a 7-day hassle-free exchange policy. Simply message us on WhatsApp with your Order ID, and our courier partner will collect the shoes directly from your doorstep at zero extra cost.',
  },
  {
    category: 'Shipping & Delivery',
    q: 'How long does shipping take across India?',
    a: 'Orders are dispatched within 24 hours of placement from our Surat / West Bengal logistics hub. Delivery typically takes 2-4 business days for metro cities and 3-6 business days for the rest of India.',
  },
  {
    category: 'Shipping & Delivery',
    q: 'Is Cash on Delivery (COD) available?',
    a: 'Yes, Cash on Delivery is available across 19,000+ Indian PIN codes. If you prepay via UPI or cards, you automatically receive an additional 5% discount at checkout.',
  },
  {
    category: 'Materials & Performance',
    q: 'What materials are used in TOPSUN running shoes?',
    a: 'TOPSUN footwear features dual-density EVA foam midsoles for high rebound cushioning, high-abrasion non-slip rubber outsoles for all-weather traction, and lightweight breathable engineered mesh uppers.',
  },
  {
    category: 'Returns & Warranty',
    q: 'What is TOPSUN’s return and refund policy?',
    a: 'We provide a 7-day size exchange guarantee on all unworn shoes in their original box and tags. For defective items, we arrange immediate replacement or full refund to your original payment method.',
  },
];

export default function FAQ() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const categories = ['All', 'Sizing & Fit', 'Shipping & Delivery', 'Materials & Performance', 'Returns & Warranty'];

  const filteredFaqs = FAQS.filter(
    (f) => activeCategory === 'All' || f.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Frequently Asked Questions (FAQ) | TOPSUN Footwear"
        description="Find instant answers to common questions about TOPSUN shoe sizing, shipping timelines across India, 7-day hassle-free exchanges, and EVA foam materials."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'FAQ', url: '/faq' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[900px] mx-auto px-4 sm:px-6 space-y-10">
        <Breadcrumbs items={[{ label: 'Help & FAQ' }]} />

        {/* Page Hero */}
        <div className="text-center space-y-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <HelpCircle size={12} className="text-[#b38b3f]" />
            Athlete Knowledge Base
          </span>
          <h1
            className="text-3xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] max-w-lg mx-auto leading-relaxed">
            Everything you need to know about TOPSUN footwear, sizing, doorstep courier tracking, and our 7-day exchange promise.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#121518] text-white shadow-xs'
                  : 'bg-white text-[#606870] hover:bg-[#ece7de] border border-[#e4ded5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#e4ded5] shadow-xs overflow-hidden transition-colors hover:border-[#dfc38a]"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b38b3f] block mb-1">
                      {faq.category}
                    </span>
                    <span
                      className="text-base sm:text-lg font-semibold text-[#121518] block"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      {faq.q}
                    </span>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-[#faf7f2] border border-[#e4ded5] flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#121518] text-white border-[#121518]' : 'text-[#121518]'}`}>
                    <ChevronDown size={15} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#f0ebe2] text-xs sm:text-sm text-[#606870] leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Banner */}
        <div className="bg-[#121518] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
          <h2
            className="text-2xl sm:text-3xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Have a Specific Question?
          </h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Our sizing specialists are online on WhatsApp to help you pick the perfect size and shoe model for your running routine.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20question%20that%20isn't%20in%20the%20FAQ."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <MessageCircle size={15} />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
