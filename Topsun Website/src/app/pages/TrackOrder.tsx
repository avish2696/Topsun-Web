import React, { useState, useEffect } from 'react';
import Header from '@/app/components/Header';
import { Search, Package, Truck, CheckCircle, MapPin, MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

export default function TrackOrder() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getCartItemCount } = useShopping();
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
    setTrackedOrder({
      id: orderNumber.toUpperCase(),
      status: 'In Transit',
      courier: 'Delhivery Express / Bluedart',
      awb: '9847291048',
      estimatedDelivery: '2-3 Business Days',
      destination: 'West Bengal, India',
      timeline: [
        { label: 'Order Confirmed', time: 'Aug 28, 2026 – 10:30 AM', done: true },
        { label: 'Packed & Handed to Courier', time: 'Aug 28, 2026 – 04:15 PM', done: true },
        { label: 'In Transit to Destination Hub', time: 'Aug 29, 2026 – 08:00 AM', current: true },
        { label: 'Out for Delivery', time: 'Expected Soon', pending: true },
        { label: 'Delivered', time: 'Pending', pending: true },
      ],
    });
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Track My Order – Live Courier Status | TOPSUN"
        description="Track your TOPSUN footwear shipment in real time using your Order ID or AWB number. Check courier milestones and estimated delivery date."
        breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Track Order', url: '/track-order' }]}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[900px] mx-auto px-4 sm:px-6 space-y-8">
        <Breadcrumbs items={[{ label: 'Track Order' }]} />

        {/* Hero / Search */}
        <div className="bg-white rounded-3xl border border-[#e4ded5] p-8 sm:p-12 shadow-xs text-center space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[rgba(179,139,63,0.12)] border border-[rgba(179,139,63,0.25)] text-[#8c6820] text-[11px] font-bold tracking-wider uppercase">
            <Truck size={12} className="text-[#b38b3f]" />
            Real-Time Logistics
          </span>
          <h1
            className="text-3xl sm:text-4xl font-semibold text-[#121518]"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Track Your TOPSUN Order
          </h1>
          <p className="text-xs sm:text-sm text-[#606870] max-w-md mx-auto leading-relaxed">
            Enter your Order ID (e.g. TOP-2026-XXXX) or courier AWB tracking number below.
          </p>

          <form onSubmit={handleTrack} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. TOP-2026-8910 or AWB Number"
              className="flex-1 h-12 px-4 bg-[#faf7f2] border border-[#d5cfc6] focus:border-[#121518] rounded-xl text-xs text-[#121518] outline-none uppercase font-semibold transition-colors"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="h-12 px-7 rounded-xl bg-[#121518] hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            >
              <Search size={14} />
              <span>{isSearching ? 'Searching…' : 'Track'}</span>
            </button>
          </form>
          {searchError && (
            <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1">
              <AlertCircle size={13} /> {searchError}
            </p>
          )}
        </div>

        {/* Results Card */}
        {trackedOrder && (
          <div className="bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4ded5] gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#b38b3f] tracking-wider">Order ID</span>
                <h2 className="text-lg font-bold text-[#121518]">{trackedOrder.id}</h2>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
                <Truck size={13} /> {trackedOrder.status}
              </span>
            </div>

            {/* Courier Grid */}
            <div className="grid grid-cols-3 gap-4 bg-[#faf7f2] p-4 rounded-2xl border border-[#e4ded5]">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Courier</span>
                <p className="text-xs font-bold text-[#121518] mt-0.5">{trackedOrder.courier}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">AWB Number</span>
                <p className="text-xs font-mono font-bold text-[#121518] mt-0.5">{trackedOrder.awb}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Est. Delivery</span>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{trackedOrder.estimatedDelivery}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Delivery Milestones</h3>
              <div className="relative pl-6 border-l-2 border-[#e4ded5] ml-2 space-y-5">
                {trackedOrder.timeline.map((st: any, i: number) => (
                  <div key={i} className="relative">
                    <div
                      className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        st.done ? 'bg-emerald-600 text-white' : st.current ? 'bg-[#b38b3f] ring-4 ring-amber-100' : 'bg-[#e4ded5]'
                      }`}
                    >
                      {st.done && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <p className={`text-xs font-bold ${st.current ? 'text-[#b38b3f]' : st.pending ? 'text-gray-400' : 'text-[#121518]'}`}>
                      {st.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{st.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Help */}
        <div className="bg-white rounded-2xl border border-[#e4ded5] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center shrink-0">
              <Package size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#121518]">Can't Find Your AWB Number?</h4>
              <p className="text-xs text-[#606870]">Our support team can verify your parcel location in 60 seconds.</p>
            </div>
          </div>
          <a
            href="https://wa.me/917485006659?text=Hi%20TOPSUN!%20Please%20help%20me%20track%20my%20order."
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-[#25D366] hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
          >
            WhatsApp Support
          </a>
        </div>
      </main>
    </div>
  );
}
