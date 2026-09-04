import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/app/components/Header';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="404 – Page Not Found"
        description="The page you are looking for does not exist on TOPSUN Footwear."
        noIndex={true}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
      />

      <main className="pt-28 pb-24 max-w-lg mx-auto px-6 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-10 sm:p-12 shadow-xs space-y-4">
          <div
            className="text-7xl font-bold text-[#b38b3f]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            404
          </div>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] leading-relaxed">
            The footwear or page you are looking for might have been retired, moved, or never existed in the TOPSUN collection.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#121518] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              <ShoppingBag size={14} />
              <span>Explore Collection</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#faf7f2] hover:bg-[#e4ded5] text-[#121518] text-xs font-bold rounded-lg border border-[#e4ded5] transition-colors"
            >
              <span>Return Home</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
