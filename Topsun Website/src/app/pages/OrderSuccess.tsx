import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, ArrowRight, ShoppingBag, Loader, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/supabase';

// Dynamically loads canvas-confetti from CDN
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!orderId || !user) {
      setError('Session expired or order not found.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single();

        if (fetchError || !data) {
          setError('Order not found.');
        } else {
          setOrder(data);
          // Trigger confetti!
          triggerConfetti();
        }
      } catch (err: any) {
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

      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 50, zIndex: 1000 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } catch (e) {
      console.warn('Confetti animation failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex justify-center items-center font-sans">
        <div className="w-full max-w-[480px] min-h-screen bg-[#f1f3f6] flex flex-col justify-center items-center p-6 text-center">
          <Loader size={40} className="text-blue-500 animate-spin" />
          <p className="text-gray-500 font-medium text-sm mt-4">Confirming order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex justify-center items-center font-sans">
        <div className="w-full max-w-[480px] min-h-screen bg-[#f1f3f6] flex flex-col p-4 justify-center items-center text-center">
          <div className="bg-red-50 border border-red-200 p-6 rounded-2xl mb-6 w-full">
            <AlertCircle className="text-red-500 mx-auto mb-3" size={36} />
            <h2 className="text-[17px] font-bold text-red-950 mb-1">Order Details Error</h2>
            <p className="text-red-700 text-xs">{error}</p>
          </div>
          <Link to="/" className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl active:scale-98 transition-all text-[14px]">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const finalAmount = order ? order.total_amount / 100 : 0;
  const deliveryDate = order ? new Date(order.created_at) : new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 10);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex justify-center items-start font-sans">
      <div className="w-full max-w-[480px] min-h-screen bg-white flex flex-col shadow-sm border-x border-gray-100 pb-8 px-6 justify-between">
        
        {/* Top Spacer */}
        <div className="flex-1 flex flex-col justify-center items-center py-12">
          {/* Animated Green Checkbox */}
          <motion.div 
            initial={{ scale: 0, rotate: -45 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6 shadow-sm"
          >
            <ShieldCheck size={44} className="stroke-[1.5]" />
          </motion.div>

          {/* Success Titles */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="text-[24px] font-bold text-gray-900 tracking-tight text-center leading-tight"
          >
            Order Confirmed!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="text-[14px] text-gray-500 text-center mt-2 px-4 leading-relaxed font-medium"
          >
            Thank you for shopping with TopSun! Your order has been successfully processed and prepared for shipping.
          </motion.p>

          {/* Order Details box */}
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              className="w-full bg-[#f8f9fa] border border-[#edeeef] rounded-2xl p-4 mt-8 space-y-3.5 text-[13px]"
            >
              <div className="flex justify-between items-center text-gray-600">
                <span>Order ID</span>
                <span className="font-bold text-gray-900 font-mono">#{order.order_number}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Amount Paid</span>
                <span className="font-bold text-gray-900">₹{finalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Payment Method</span>
                <span className="font-bold text-gray-900 capitalize">
                  {order.payment_method === 'cod' ? 'Cash On Delivery' : order.payment_method}
                </span>
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-3 flex gap-2.5 items-start text-gray-600">
                <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[11.5px] uppercase font-bold text-gray-400 block tracking-wider">Estimated Delivery</span>
                  <span className="font-bold text-gray-800 text-[13.5px] mt-0.5 block">{formattedDeliveryDate}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Action CTAs at bottom */}
        <div className="space-y-3 w-full">
          <Link 
            to={`/order-confirmation/${orderId}`}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all text-[14px]"
          >
            <span>Track Order & View Details</span>
            <ArrowRight size={16} />
          </Link>
          
          <Link 
            to="/shop"
            className="w-full py-4 border-2 border-gray-300 hover:bg-gray-50 text-gray-800 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all text-[14px]"
          >
            <ShoppingBag size={16} className="text-gray-600" />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
