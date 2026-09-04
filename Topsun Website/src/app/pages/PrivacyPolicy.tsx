import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const sections = [
  {
    title: '1. Information We Collect',
    content:
      'When you visit the TOPSUN store, create an account, or place an order, we collect essential details: your full name, shipping address, mobile phone number, and transaction logs.',
  },
  {
    title: '2. How We Use Your Data',
    content:
      'Your personal details are used exclusively to process and ship your orders, send SMS/WhatsApp courier tracking updates, and provide customer support. We do not sell or rent your personal data to third parties.',
  },
  {
    title: '3. Payment Security & Encryption',
    content:
      'All payment transactions are 256-bit encrypted and processed through RBI-authorized payment aggregators (Razorpay / UPI). TOPSUN does not store credit card or UPI credentials on our servers.',
  },
  {
    title: '4. Cookies & Analytics',
    content:
      'We use secure browser cookies and analytics sessions to keep your shopping cart active and improve site performance.',
  },
  {
    title: '5. Corporate Governance & Contact',
    content:
      'TOPSUN is operated by INTELAGROW PVT. LTD. (Registered Office: A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman - 713358, West Bengal, India). For inquiries, contact topsunshoes7@gmail.com or WhatsApp +91 7485006659.',
  },
];

export default function PrivacyPolicy() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Privacy Policy – TOPSUN Footwear | INTELAGROW PVT. LTD."
        description="Read TOPSUN's official privacy policy regarding user data protection, 256-bit SSL encrypted checkout, and compliance."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy-policy' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[860px] mx-auto px-4 sm:px-6 space-y-6">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-12 shadow-xs space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Shield size={12} className="text-[#b38b3f]" /> Privacy & Compliance
          </div>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-[#121518] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Privacy Policy
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
          <Link to="/terms-of-service" className="text-xs text-[#b38b3f] hover:underline font-semibold">
            View Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  );
}
