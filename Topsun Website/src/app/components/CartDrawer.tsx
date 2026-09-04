import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ChevronLeft, ChevronRight, Truck, ShoppingCart, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useShopping, CartItem } from '@/app/context/ShoppingContext';
import { useNavigate, Link } from 'react-router-dom';
import Shoe1 from '@/imports/storm-runner/1.webp';
import Shoe2 from '@/imports/urban-classic/1.webp';
import Shoe3 from '@/imports/trail-blaze/1.webp';

// Upsell accessory products for "Best Paired With"
const UPSELL_PRODUCTS = [
  {
    id: 901,
    name: 'Performance Cushioned Socks (3-Pack)',
    price: 399,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&auto=format&fit=crop&q=80',
    size: 'Free Size',
    colorLabel: 'Black / Grey / White',
    discount: '50% OFF',
  },
  {
    id: 902,
    name: 'Pro Foam Shoe Cleaner & Shield Kit',
    price: 499,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&auto=format&fit=crop&q=80',
    size: '150ml Kit',
    colorLabel: 'All Footwear',
    discount: '45% OFF',
  },
  {
    id: 903,
    name: 'Ergonomic EVA Arch-Support Insoles',
    price: 349,
    originalPrice: 699,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80',
    size: 'UK 7-10',
    colorLabel: 'Dual-Density Foam',
    discount: '50% OFF',
  },
];

export default function CartDrawer() {
  const { cart, isCartDrawerOpen, closeCartDrawer, updateCartItem, removeFromCart, getCartTotal, getCartItemCount, addToCart } = useShopping();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);
  const [upsellIndex, setUpsellIndex] = useState(0);

  const itemCount = getCartItemCount();
  const subtotal = getCartTotal();

  // Tier Discounts (like screenshot: Tier 1 at 2 items = 7% OFF, Tier 2 at 3 items = 10% OFF)
  let discountPercent = 0;
  let offerMessage = 'Add 2 products for Extra 7% OFF';
  let progressWidth = '10%';

  if (itemCount === 1) {
    discountPercent = 0;
    offerMessage = 'Add 1 more product for Extra 7% OFF';
    progressWidth = '35%';
  } else if (itemCount === 2) {
    discountPercent = 7;
    offerMessage = 'Add 1 more product for Extra 10% OFF';
    progressWidth = '65%';
  } else if (itemCount >= 3) {
    discountPercent = 10;
    offerMessage = '🎉 Extra 10% OFF unlocked!';
    progressWidth = '100%';
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = subtotal - discountAmount;

  const handlePincodeCheck = () => {
    if (pincode.trim().length === 6 && /^\d+$/.test(pincode)) {
      setPincodeMessage('✓ Delivery in 2-4 Days (Express Free Delivery)');
    } else {
      setPincodeMessage('Please enter a valid 6-digit PIN code');
    }
  };

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  const nextUpsell = () => {
    setUpsellIndex((prev) => (prev + 1) % UPSELL_PRODUCTS.length);
  };

  const prevUpsell = () => {
    setUpsellIndex((prev) => (prev - 1 + UPSELL_PRODUCTS.length) % UPSELL_PRODUCTS.length);
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", height: '100dvh' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-label="Close cart drawer"
          />

          {/* Drawer Container — slides from right, full-height on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-[440px] bg-[#faf7f2] shadow-2xl flex flex-col overflow-hidden z-10"
            style={{ height: '100dvh' }}
          >
            {/* Top Bar: Title & Close Button */}
            <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-[#e4ded5] shrink-0">
              <h2
                className="text-xl font-semibold text-[#121518] tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Cart ({itemCount})
              </h2>
              <button
                onClick={closeCartDrawer}
                className="p-1 text-[#606870] hover:text-[#121518] hover:bg-[#faf7f2] rounded-full transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {/* 1. Multi-tier Discount Progress Banner (Matching Screenshot) */}
              <div className="bg-[#dce6dc] px-4 py-3.5 border-b border-[#c8d8c8] space-y-2.5">
                <p className="text-center text-xs font-bold text-[#234223]">
                  {offerMessage}
                </p>

                {/* Progress Node Bar */}
                <div className="relative flex items-center justify-between max-w-[320px] mx-auto pt-1 pb-1">
                  {/* Background Track */}
                  <div className="absolute left-4 right-4 h-1.5 bg-[#bccfbc] rounded-full top-1/2 -translate-y-1/2" />
                  {/* Filled Track */}
                  <div
                    className="absolute left-4 h-1.5 bg-[#3d7a3d] rounded-full top-1/2 -translate-y-1/2 transition-all duration-500"
                    style={{ width: progressWidth }}
                  />

                  {/* Node 1: Cart */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#3d7a3d] text-white flex items-center justify-center shadow-xs">
                      <ShoppingCart size={14} />
                    </div>
                  </div>

                  {/* Node 2: 7% OFF (2 items) */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex flex-col items-center justify-center text-[8px] font-black transition-colors ${
                        itemCount >= 2
                          ? 'bg-[#3d7a3d] text-white border-[#3d7a3d]'
                          : 'bg-white text-[#234223] border-[#a0bca0]'
                      }`}
                    >
                      <span>7%</span>
                      <span className="text-[6px] -mt-0.5 leading-none">OFF</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#234223] mt-1">2 items</span>
                  </div>

                  {/* Node 3: 10% OFF (3 items) */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex flex-col items-center justify-center text-[8px] font-black transition-colors ${
                        itemCount >= 3
                          ? 'bg-[#3d7a3d] text-white border-[#3d7a3d]'
                          : 'bg-white text-[#234223] border-[#a0bca0]'
                      }`}
                    >
                      <span>10%</span>
                      <span className="text-[6px] -mt-0.5 leading-none">OFF</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#234223] mt-1">3 items</span>
                  </div>
                </div>
              </div>

              {/* 2. Items List or Empty State */}
              <div className="p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12 space-y-3 bg-white rounded-2xl border border-[#e4ded5] p-6">
                    <div className="w-14 h-14 rounded-full bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center mx-auto">
                      <ShoppingCart size={24} />
                    </div>
                    <h3
                      className="text-lg font-semibold text-[#121518]"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      Your Cart is Empty
                    </h3>
                    <p className="text-xs text-[#606870]">
                      Discover our high-performance running and athletic sneakers.
                    </p>
                    <button
                      onClick={() => {
                        closeCartDrawer();
                        navigate('/shop');
                      }}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#121518] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Browse Footwear</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  cart.map((item) => {
                    const discount = item.originalPrice
                      ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                      : 50;

                    return (
                      <div
                        key={`${item.id}-${item.size}`}
                        className="bg-white rounded-2xl p-3.5 border border-[#e4ded5] shadow-2xs flex gap-3.5 items-center"
                      >
                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl bg-[#f7f5f0] border border-[#e4ded5] flex items-center justify-center p-2 shrink-0 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-[#121518] line-clamp-1 leading-snug">
                            {item.name} : {item.colorLabel || 'Athletic'}
                          </h4>

                          {/* Pricing */}
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-[#121518]">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                            {item.originalPrice && (
                              <span className="text-[10px] text-gray-400 line-through">
                                ₹{item.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="text-[10px] text-emerald-700 font-bold">
                              {discount}% OFF
                            </span>
                          </div>

                          <p className="text-[10px] text-[#606870] font-semibold">
                            Size: UK {item.size}
                          </p>

                          {/* Stepper + Delete */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="inline-flex items-center border border-[#e4ded5] rounded-full bg-[#faf7f2] px-1 py-0.5">
                              <button
                                onClick={() => updateCartItem(item.id, item.size, item.quantity - 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#121518] hover:bg-white transition-colors cursor-pointer"
                                aria-label="Decrease"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2 text-[11px] font-bold text-[#121518]">{item.quantity}</span>
                              <button
                                onClick={() => updateCartItem(item.id, item.size, item.quantity + 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[#121518] hover:bg-white transition-colors cursor-pointer"
                                aria-label="Increase"
                              >
                                <Plus size={10} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id, item.size)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* 3. "Best Paired With" Upsell Carousel (Matching Screenshot) */}
                {cart.length > 0 && (
                  <div className="bg-[#e4ede4] rounded-2xl p-4 border border-[#cadbca] space-y-3 mt-4">
                    <div className="flex items-center justify-between">
                      <h3
                        className="text-base font-semibold text-[#1a381a] tracking-tight"
                        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                      >
                        Best Paired With
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={prevUpsell}
                          className="w-7 h-7 rounded-full bg-white/90 text-[#1a381a] flex items-center justify-center shadow-xs hover:bg-white transition-colors cursor-pointer"
                          aria-label="Previous suggestion"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={nextUpsell}
                          className="w-7 h-7 rounded-full bg-white/90 text-[#1a381a] flex items-center justify-center shadow-xs hover:bg-white transition-colors cursor-pointer"
                          aria-label="Next suggestion"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Upsell Card */}
                    <div className="bg-white rounded-xl p-3 border border-[#cadbca] flex items-center gap-3 shadow-2xs">
                      <div className="w-16 h-16 rounded-lg bg-[#faf7f2] border border-[#e4ded5] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                        <img
                          src={UPSELL_PRODUCTS[upsellIndex].image}
                          alt={UPSELL_PRODUCTS[upsellIndex].name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-[11px] font-bold text-[#121518] line-clamp-1">
                          {UPSELL_PRODUCTS[upsellIndex].name}
                        </h4>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-bold text-[#121518]">
                            ₹{UPSELL_PRODUCTS[upsellIndex].price}
                          </span>
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{UPSELL_PRODUCTS[upsellIndex].originalPrice}
                          </span>
                          <span className="text-[9px] text-emerald-700 font-bold">
                            {UPSELL_PRODUCTS[upsellIndex].discount}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              id: UPSELL_PRODUCTS[upsellIndex].id,
                              name: UPSELL_PRODUCTS[upsellIndex].name,
                              price: UPSELL_PRODUCTS[upsellIndex].price,
                              image: UPSELL_PRODUCTS[upsellIndex].image,
                              size: UPSELL_PRODUCTS[upsellIndex].size,
                              quantity: 1,
                              colorLabel: UPSELL_PRODUCTS[upsellIndex].colorLabel,
                            });
                          }}
                          className="mt-1 inline-flex items-center gap-1 px-3 py-1 bg-[#121518] hover:bg-black text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus size={11} />
                          <span>Add to Order</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Bottom Sticky Action Section (Matching Screenshot) */}
            {cart.length > 0 && (
              <div className="bg-white border-t border-[#e4ded5] p-4 space-y-3 shrink-0 shadow-lg">
                {/* Pincode Delivery Check */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[#121518] font-semibold flex-1">
                    <Truck size={15} className="text-[#b38b3f] shrink-0" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Check Delivery PIN"
                      className="w-full text-xs bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#121518] py-0.5"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePincodeCheck}
                    className="px-3 py-1 rounded-full border border-[#121518] text-[11px] font-bold text-[#121518] hover:bg-[#121518] hover:text-white transition-colors cursor-pointer shrink-0"
                  >
                    Check
                  </button>
                </div>
                {pincodeMessage && (
                  <p className="text-[10px] font-bold text-emerald-700">{pincodeMessage}</p>
                )}

                {/* Collapsible Details */}
                {showDetails && (
                  <div className="bg-[#faf7f2] rounded-xl p-3 text-xs space-y-1.5 border border-[#e4ded5]">
                    <div className="flex justify-between text-[#606870]">
                      <span>Subtotal</span>
                      <span className="font-semibold text-[#121518]">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Multi-Item Discount ({discountPercent}%)</span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#606870]">
                      <span>Shipping</span>
                      <span className="font-bold text-emerald-700">FREE</span>
                    </div>
                    <div className="flex justify-between text-[#606870]">
                      <span>Taxes & GST</span>
                      <span className="text-gray-400">Included</span>
                    </div>
                  </div>
                )}

                {/* Price & Checkout CTA */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div>
                    <span className="text-base font-extrabold text-[#121518] block">
                      ₹{finalTotal.toLocaleString('en-IN')}.00
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-[10px] text-[#b38b3f] underline font-bold hover:text-[#8c6820] cursor-pointer"
                    >
                      {showDetails ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="flex-1 py-3 px-5 bg-[#121518] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <span>Proceed To Checkout</span>
                    <span className="font-mono text-sm">»</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
