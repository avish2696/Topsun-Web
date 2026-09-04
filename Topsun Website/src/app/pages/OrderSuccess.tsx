import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag, Loader, AlertCircle, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/supabase';
import { SEOHead } from '@/app/components/SEOHead';
import { toValidUUID } from '@/app/utils/phoneAuthService';

const loadConfetti = (): Promise<any> => {
  return new Promise((resolve) => {
    if ((window as any).confetti) return resolve((window as any).confetti);
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
    script.onload = () => resolve((window as any).confetti);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
};

export default function OrderSuccess() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!orderId || !user) {
      setError('Session expired or order not found.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders').select('*').eq('id', orderId).eq('user_id', toValidUUID(user.id)).single();
        if (fetchError || !data) {
          setError('Order not found.');
        } else {
          setOrder(data);
          triggerConfetti();
        }
      } catch {
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  const triggerConfetti = async () => {
    try {
      const confetti = await loadConfetti();
      if (!confetti) return;
      const duration = 2200;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000, colors: ['#b38b3f', '#dfc38a', '#121518', '#ffffff', '#f5f0e8'] };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex justify-center items-center" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="text-[#b38b3f] animate-spin" />
          <p className="text-[#606870] text-xs font-medium">Confirming your order…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex justify-center items-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="bg-white border border-[#e4ded5] rounded-2xl p-8 max-w-sm w-full text-center space-y-4 shadow-xs">
          <AlertCircle size={36} className="text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-[#121518]">Order Error</h2>
          <p className="text-xs text-[#606870]">{error}</p>
          <Link to="/" className="block px-6 py-3 bg-[#121518] text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const finalAmount = order ? order.total_amount / 100 : 0;
  const deliveryDate = order ? new Date(order.created_at) : new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div
      className="min-h-screen bg-[#faf7f2] flex justify-center items-center py-8 px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <SEOHead
        title="Order Confirmed! | TOPSUN Footwear"
        description="Your TOPSUN footwear order has been successfully placed. Check invoice, estimated delivery, and live tracking."
        noIndex={true}
      />

      <div className="w-full max-w-[440px] space-y-4">
        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-[#e4ded5] p-8 shadow-xs text-center space-y-4"
        >
          <div className="h-[3px] bg-gradient-to-r from-[#b38b3f] to-[#dfc38a] rounded-full mx-8 mb-4" />

          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.15 }}
            className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto"
          >
            <ShieldCheck size={40} className="stroke-[1.5]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h1
              className="text-2xl sm:text-3xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Order Confirmed!
            </h1>
            <p className="text-xs text-[#606870] mt-1.5 leading-relaxed px-4">
              Thank you for shopping with TOPSUN. Your order is confirmed and being prepared for dispatch.
            </p>
          </motion.div>

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#faf7f2] rounded-2xl border border-[#e4ded5] p-4 text-left space-y-3 text-xs mt-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[#606870]">Order Number</span>
                <span className="font-bold text-[#121518] font-mono">#{order.order_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#606870]">Amount Paid</span>
                <span className="font-bold text-[#121518]">₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#606870]">Payment Method</span>
                <span className="font-bold text-[#121518] capitalize">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                </span>
              </div>
              <div className="border-t border-[#e4ded5] pt-3 flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-lg bg-[rgba(179,139,63,0.12)] flex items-center justify-center shrink-0">
                  <Truck size={15} className="text-[#b38b3f]" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Est. Delivery</span>
                  <span className="font-bold text-[#121518] text-xs">{formattedDeliveryDate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <Link
            to={`/order-confirmation/${orderId}`}
            className="w-full py-3.5 bg-[#121518] hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs uppercase tracking-wider shadow-xs"
          >
            <span>Track Order & View Invoice</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/shop"
            className="w-full py-3.5 bg-white border border-[#e4ded5] hover:bg-[#faf7f2] text-[#121518] font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs"
          >
            <ShoppingBag size={14} className="text-gray-500" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
