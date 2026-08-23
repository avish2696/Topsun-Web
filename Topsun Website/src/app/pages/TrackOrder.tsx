import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { motion } from 'motion/react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';

export default function TrackOrder() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!orderNumber.trim()) {
      setSearchError('Please enter an Order ID or AWB Tracking Number');
      return;
    }

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSearching(false);

    // Mock found order
    setTrackedOrder({
      id: orderNumber.toUpperCase(),
      status: 'In Transit',
      courier: 'Delhivery Express / Shipmozo',
      awb: '9847291048',
      estimatedDelivery: '2-3 Business Days',
      destination: 'West Bengal, India',
      timeline: [
        { label: 'Order Confirmed', time: 'Aug 21, 2026 - 10:30 AM', done: true },
        { label: 'Packed & Handed to Courier', time: 'Aug 21, 2026 - 04:15 PM', done: true },
        { label: 'In Transit to Destination Hub', time: 'Aug 22, 2026 - 08:00 AM', current: true },
        { label: 'Out for Delivery', time: 'Expected Soon', pending: true },
        { label: 'Delivered', time: 'Pending', pending: true },
      ],
    });
  };

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
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20need%20help%20tracking%20my%20order."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/70 shadow-xs text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#009FE3] font-extrabold text-[11px] uppercase tracking-widest mb-3">
            Real-time Logistics
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Track Your TOPSUN Order
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-2 leading-relaxed">
            Enter your Order ID (e.g. TOP-2026-XXXX) or Courier Tracking AWB number below.
          </p>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. TOP-2026-8910 or Phone"
              className="flex-1 h-12 px-4 bg-gray-50 border border-gray-300 focus:border-gray-900 rounded-2xl text-xs font-bold text-gray-900 outline-none uppercase"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="h-12 px-6 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Search size={14} />
              <span>{isSearching ? 'Searching...' : 'Track'}</span>
            </button>
          </form>
          {searchError && (
            <p className="text-xs text-rose-600 font-semibold mt-2 flex items-center justify-center gap-1">
              <AlertCircle size={13} /> {searchError}
            </p>
          )}
        </section>

        {/* Tracking Results Card */}
        {trackedOrder && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/70 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-gray-400">Order ID</span>
                <h3 className="text-lg font-bold text-gray-900">{trackedOrder.id}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-[#009FE3] text-xs font-extrabold rounded-full">
                  🚚 {trackedOrder.status}
                </span>
              </div>
            </div>

            {/* Courier Info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Courier</span>
                <p className="text-xs font-bold text-gray-900">{trackedOrder.courier}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">AWB Number</span>
                <p className="text-xs font-mono font-bold text-gray-900">{trackedOrder.awb}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Est. Delivery</span>
                <p className="text-xs font-bold text-emerald-600">{trackedOrder.estimatedDelivery}</p>
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Tracking Timeline</h4>
              <div className="space-y-4 relative pl-6 border-l-2 border-gray-200 ml-2">
                {trackedOrder.timeline.map((st: any, i: number) => (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        st.done
                          ? 'bg-emerald-600 text-white'
                          : st.current
                          ? 'bg-[#009FE3] ring-4 ring-blue-100'
                          : 'bg-gray-300'
                      }`}
                    >
                      {st.done && <CheckCircle size={12} />}
                    </div>
                    <p className={`text-xs font-bold ${st.current ? 'text-[#009FE3]' : 'text-gray-900'}`}>
                      {st.label}
                    </p>
                    <p className="text-[11px] text-gray-400">{st.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Support Prompt */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#009FE3] flex items-center justify-center flex-shrink-0">
              <Package size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900">Can't Find Your Tracking Number?</h4>
              <p className="text-xs text-gray-500">Our customer support can check your parcel location in 60 seconds.</p>
            </div>
          </div>
          <a
            href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20Please%20help%20me%20track%20my%20order."
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap"
          >
            WhatsApp Support
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
