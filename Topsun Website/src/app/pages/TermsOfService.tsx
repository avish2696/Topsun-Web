import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { FileText } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By using the TOPSUN store and purchasing our athletic footwear products, you agree to comply with and be bound by these terms under INTELAGROW PVT. LTD. (Registered Office: A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman – 713358, West Bengal, India).',
  },
  {
    title: '2. Pricing & Orders',
    content:
      'All prices listed in Indian Rupees (₹) are inclusive of applicable GST. We reserve the right to cancel orders in case of pricing errors or inventory stock-outs with full immediate refunds.',
  },
  {
    title: '3. Shipping & Delivery',
    content:
      'Estimated delivery timelines are 2–5 business days across India. Tracking updates are dispatched via SMS and WhatsApp automatically upon fulfillment.',
  },
  {
    title: '4. Returns & Size Exchanges',
    content:
      'We offer a 7-day hassle-free size exchange policy for unworn footwear returned in original packaging and shoe box with zero return shipping fees.',
  },
  {
    title: '5. Governing Law',
    content:
      'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of competent courts in West Bengal, India.',
  },
];

export default function TermsOfService() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Terms of Service – TOPSUN Footwear | INTELAGROW PVT. LTD."
        description="Read the Terms of Service governing your use of TOPSUN online store — pricing, shipping, returns, intellectual property, and governing law."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms-of-service' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[860px] mx-auto px-4 sm:px-6 space-y-6">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-12 shadow-xs space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <FileText size={12} className="text-[#b38b3f]" /> Terms & Conditions
          </div>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Terms of Service
          </h1>
          <p className="text-xs text-gray-400">Last updated: August 2026</p>

          <div className="space-y-6 text-xs sm:text-sm text-[#606870] leading-relaxed divide-y divide-[#e4ded5]">
            {sections.map((sec, idx) => (
              <section key={idx} className="pt-6 first:pt-0 space-y-2">
                <h2 className="text-base font-bold text-[#121518]">{sec.title}</h2>
                <p>{sec.content}</p>
              </section>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/privacy-policy" className="text-xs text-[#b38b3f] hover:underline font-semibold">
            View Privacy Policy →
          </Link>
        </div>
      </main>
    </div>
  );
}
