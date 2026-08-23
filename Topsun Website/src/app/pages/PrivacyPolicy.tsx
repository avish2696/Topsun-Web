import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Shield, MessageCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function PrivacyPolicy() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20privacy%20question."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[10px] uppercase tracking-widest mb-3">
            <Shield size={12} /> Privacy & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-gray-500 mb-8">Last updated: August 2026</p>

          <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
              <p>
                When you visit the TOPSUN store, create an account with your mobile number, or place an order, we collect essential details: your name, shipping address, mobile phone number, and transaction logs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. How We Use Your Data</h2>
              <p>
                Your personal details are used exclusively to process and ship your orders, send SMS/WhatsApp tracking notifications, and provide customer support. We do not sell your personal data to third parties.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Payment Security & Encryption</h2>
              <p>
                All payment transactions are encrypted and processed through RBI-authorized payment aggregators (Razorpay / UPI). TOPSUN does not store credit card or UPI credentials on our servers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Cookies & Analytics</h2>
              <p>
                We use secure browser cookies and analytics sessions to keep your cart active and personalize your shopping experience.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">5. Company & Contact Information</h2>
              <p>
                TOPSUN is operated by <strong>INTELAGROW PVT. LTD.</strong> (Registered Office: A/90 NSB Road, Raniganj, Searsole Rajbari, Paschim Bardhaman - 713358, West Bengal, India).
              </p>
              <p>
                For data access, deletion requests, or general inquiries, contact our compliance officer at <strong className="text-gray-900">topsunshoes7@gmail.com</strong> or WhatsApp support at <strong className="text-gray-900">+91 7485006659</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0c0c] text-white py-12 px-6 text-center text-xs text-gray-400 space-y-3">
        <p>© 2026 TOPSUN Performance Sneakers. All rights reserved.</p>
        <div className="flex justify-center gap-4 text-gray-500 font-semibold">
          <Link to="/about" className="hover:text-white">About Us</Link>
          <Link to="/shop" className="hover:text-white">Shop</Link>
          <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
