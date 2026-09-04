import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { RefreshCw, Package, Clock, CheckCircle2, AlertCircle, MessageCircle, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

export default function Returns() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const steps = [
    {
      number: '01',
      title: 'Message Us on WhatsApp',
      description: 'Send your Order ID and the replacement size needed. Our team confirms eligibility in under 2 hours.',
    },
    {
      number: '02',
      title: 'Free Reverse Pickup',
      description: 'Our courier partner collects the package from your doorstep at zero cost. No branch drop-off needed.',
    },
    {
      number: '03',
      title: 'Quality Check & Packing',
      description: 'Upon arrival at our warehouse, our quality team inspects the unworn shoes and shoe box.',
    },
    {
      number: '04',
      title: 'Replacement Dispatched',
      description: 'Your replacement pair is packed and dispatched within 24 hours with live courier tracking.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="7-Day Hassle-Free Exchange Policy | TOPSUN Footwear"
        description="TOPSUN offers a 7-day hassle-free shoe size exchange policy with free doorstep reverse courier pickup across all Indian PIN codes."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Returns & Exchanges', url: '/returns' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[1000px] mx-auto px-4 sm:px-6 space-y-10">
        <Breadcrumbs items={[{ label: 'Returns & Exchanges' }]} />

        {/* Hero */}
        <div className="text-center space-y-3 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Sparkles size={12} className="text-[#b38b3f]" />
            Zero Risk Guarantee
          </span>
          <h1
            className="text-3xl sm:text-5xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            7-Day Exchange Promise
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] max-w-lg mx-auto leading-relaxed">
            If your TOPSUN footwear doesn't fit like a glove, we make the exchange process effortless with free reverse courier pickup.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center mx-auto">
              <Clock size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#121518]">7-Day Window</h3>
            <p className="text-xs text-[#606870] leading-relaxed">Initiate your exchange within 7 days of package delivery</p>
          </div>
          <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center mx-auto">
              <RefreshCw size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#121518]">Free Reverse Pickup</h3>
            <p className="text-xs text-[#606870] leading-relaxed">Our courier collects the parcel from your delivery address</p>
          </div>
          <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center mx-auto">
              <Package size={22} />
            </div>
            <h3 className="font-bold text-sm text-[#121518]">24-Hour Dispatch</h3>
            <p className="text-xs text-[#606870] leading-relaxed">Replacement dispatched within 24 hours of return receipt</p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-10 shadow-xs space-y-6">
          <h2
            className="text-2xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            How the Exchange Works
          </h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#faf7f2] border border-[#e4ded5] flex items-center justify-center shrink-0">
                  <span
                    className="text-base font-bold text-[#b38b3f]"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {step.number}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-[#121518]">{step.title}</h3>
                  <p className="text-xs text-[#606870] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-10 shadow-xs space-y-4">
          <h2
            className="text-2xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Eligibility Conditions
          </h2>
          <div className="space-y-2.5">
            {[
              { ok: true, text: 'Exchange request initiated within 7 calendar days of delivery' },
              { ok: true, text: 'Shoes must be unworn with factory tags and clean outsoles' },
              { ok: true, text: 'Original shoe box must be included in the return package' },
              { ok: false, text: 'Worn, soiled, or damaged shoes cannot be accepted for exchange' },
            ].map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[#606870]">
                {c.ok ? (
                  <CheckCircle2 size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#121518] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xs">
          <h2
            className="text-2xl sm:text-3xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Need to Start an Exchange?
          </h2>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Our support team processes exchange requests in under 2 hours via WhatsApp.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/917485006659?text=Hi%20TOPSUN!%20I%20want%20to%20initiate%20an%20exchange%20request%20for%20my%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#25D366] hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <MessageCircle size={15} />
              <span>Start Exchange on WhatsApp</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
