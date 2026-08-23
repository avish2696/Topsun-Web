import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Package, ChevronRight, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { useAuth } from '@/app/context/AuthContext';

const SHOE_MRP_MAP: Record<number, number> = {
  1: 4000,
  2: 5500,
  3: 5700,
  4: 6000,
  5: 5000,
  6: 5200,
  7: 4200,
};

export default function Cart() {
  const { cart, removeFromCart, updateCartItem, getCartTotal, getCartItemCount, loadCart } = useShopping();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) loadCart();
  }, [user, loadCart]);

  const subtotal = getCartTotal();
  const totalMRP = cart.reduce((acc, i) => acc + (SHOE_MRP_MAP[i.id] || i.price * 2) * i.quantity, 0);
  const totalSavings = totalMRP - subtotal;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      navigate('/signin?redirect=%2Fcheckout');
    } else {
      navigate('/checkout');
    }
  };

  const goBack = () => navigate(-1);

  // ── Full-screen overlay layout: left strip (back) + right cart panel ──
  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── LEFT: dark backdrop strip — clicking goes back ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={goBack}
        className="flex-shrink-0 bg-black/55"
        style={{ width: '13%' }}
      />

      {/* ── RIGHT: Cart Panel — slides in from right ── */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="flex-1 flex flex-col bg-[#fafafa] h-full overflow-hidden shadow-2xl relative"
        style={{ borderRadius: '20px 0 0 20px' }}
      >
        {/* ── Top Header Bar ── */}
        <div className="bg-white border-b border-gray-200/70 px-4 py-3.5 flex items-center justify-between flex-shrink-0 shadow-xs">
          <h1 className="text-base font-bold text-gray-900">
            Shopping Cart ({itemCount})
          </h1>
          <button
            onClick={goBack}
            className="text-gray-500 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Scrollable Content Body ── */}
        <div className="flex-1 overflow-y-auto pb-28">

          {/* Empty cart state */}
          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center px-6 py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5 border border-blue-100">
                <ShoppingBag size={36} className="text-[#009FE3]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-xs text-gray-500 mb-7 leading-relaxed max-w-[220px]">
                You haven't added any shoes yet. Start exploring!
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-black transition-colors"
              >
                Browse Collection <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <>
              {/* ── Progress / Offer Banner ── */}
              <div className="bg-emerald-50 px-4 py-3 flex flex-col items-center gap-1.5 text-center border-b border-emerald-200">
                <p className="text-xs font-bold text-emerald-900">
                  🎉 Special Deal: Free Express Shipping Applied!
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  You are saving ₹{totalSavings.toLocaleString('en-IN')} on this order!
                </p>
              </div>

              {/* ── Cart Items ── */}
              <div className="p-3 space-y-3">
                <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-200/70 divide-y divide-gray-100">
                  <AnimatePresence>
                    {cart.map((item) => {
                      const itemMrpEach = SHOE_MRP_MAP[item.id] || (item.price * 2);
                      const itemDiscountPct = Math.round(((itemMrpEach - item.price) / itemMrpEach) * 100);

                      return (
                        <motion.div
                          key={`${item.id}-${item.size}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                          className="py-3.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex gap-3 items-start">
                            {/* Image */}
                            <div className="w-[72px] h-[72px] rounded-2xl bg-[#f4f4f2] flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100 p-1">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                />
                              ) : (
                                <Package size={26} className="text-gray-300" />
                              )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/product/${item.slug || item.id}`}
                                className="font-bold text-xs text-gray-900 leading-snug line-clamp-2 hover:text-[#009FE3] transition-colors"
                              >
                                {item.name}
                              </Link>

                              <div className="flex items-center flex-wrap gap-1.5 mt-1">
                                <span className="font-extrabold text-sm text-gray-900">
                                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[11px] text-gray-400 line-through">
                                  ₹{(itemMrpEach * item.quantity).toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] font-extrabold text-emerald-600">
                                  {itemDiscountPct}% OFF
                                </span>
                              </div>

                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Size: UK {item.size}
                              </p>

                              {/* Qty stepper + delete */}
                              <div className="flex items-center justify-between mt-2.5">
                                <div className="flex items-center border border-gray-200 rounded-full px-1.5 py-0.5 bg-gray-50">
                                  <button
                                    onClick={() => updateCartItem(item.id, item.size, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black disabled:opacity-30 transition-opacity"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-7 text-center font-bold text-xs text-gray-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartItem(item.id, item.size, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black transition-colors"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.id, item.size)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Savings pill */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-xs text-emerald-800 font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-extrabold flex-shrink-0">%</span>
                  <span>Total Savings on MRP: ₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Sticky Bottom Bar ── */}
        <div className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-2xl flex items-center justify-between">
          <div>
            <span className="font-extrabold text-[18px] text-gray-900 block leading-tight">
              ₹{total.toLocaleString('en-IN')}
            </span>
            <button className="text-[12px] font-bold text-amber-700 underline">
              View Details
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCheckout}
            className="h-12 px-5 rounded-full bg-[#1c1d1f] hover:bg-black text-white font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-md transition-colors"
          >
            <span>Proceed To Checkout</span>
            <ChevronRight size={17} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
