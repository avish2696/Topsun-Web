import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck, X, Sparkles } from 'lucide-react';
import Header from '@/app/components/Header';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartItemCount, clearCart } = useShopping();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const total = getCartTotal();
  const freeShippingThreshold = 500;
  const isFreeShipping = total >= freeShippingThreshold;
  const progressPercent = Math.min(100, (total / freeShippingThreshold) * 100);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'TOPSUN10') {
      setCouponApplied(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Your Shopping Cart | TOPSUN Footwear"
        description="Review your TOPSUN footwear order. Free delivery across India on orders over ₹500, with 7-day hassle-free size exchanges."
        noIndex={true}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Shop', url: '/shop' },
          { name: 'Cart', url: '/cart' },
        ]}
      />

      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => {}}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-20 max-w-[1100px] mx-auto px-4 sm:px-6 space-y-8">
        <Breadcrumbs items={[{ label: 'Shop', href: '/shop' }, { label: 'Cart' }]} />

        {/* Header */}
        <div className="flex items-baseline justify-between border-b border-[#e4ded5] pb-4">
          <div>
            <h1
              className="text-3xl sm:text-4xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Shopping Cart
            </h1>
            <p className="text-xs text-[#606870] mt-1">
              {getCartItemCount()} item{getCartItemCount() !== 1 ? 's' : ''} in your order
            </p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold transition-colors cursor-pointer"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e4ded5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Truck size={15} className="text-[#b38b3f]" />
              {isFreeShipping ? (
                <span className="text-emerald-700 font-bold">🎉 Congratulations! You have unlocked Free Express Shipping!</span>
              ) : (
                <span className="text-[#121518]">
                  Add <strong className="text-[#b38b3f]">₹{(freeShippingThreshold - total).toLocaleString('en-IN')}</strong> more for Free Shipping
                </span>
              )}
            </div>
            <span className="text-[#606870] font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-[#faf7f2] rounded-full overflow-hidden border border-[#e4ded5]">
            <div
              className="h-full bg-[#b38b3f] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-[#e4ded5] p-8 shadow-xs space-y-4">
            <div className="w-20 h-20 rounded-full bg-[rgba(179,139,63,0.12)] text-[#b38b3f] flex items-center justify-center mx-auto">
              <ShoppingBag size={34} />
            </div>
            <h2
              className="text-2xl sm:text-3xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#606870] max-w-sm mx-auto leading-relaxed">
              Explore our performance athletic shoes engineered with responsive EVA cushioning and breathable mesh.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#121518] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
              >
                <span>Explore Footwear</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List */}
            <div className="lg:col-span-7 space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e4ded5] shadow-xs flex gap-4 sm:gap-5 items-center transition-all hover:border-[#dfc38a]"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#f7f5f0] rounded-xl flex items-center justify-center p-2 shrink-0 border border-[#e4ded5] overflow-hidden">
                    <img
                      src={item.image}
                      alt={`${item.name} - Size UK ${item.selectedSize}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className="text-lg sm:text-xl font-semibold text-[#121518] truncate leading-tight"
                          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                        >
                          <Link to={`/product/${item.slug || 'airflex'}`} className="hover:text-[#b38b3f] transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-[#606870]">{item.colorLabel || 'Athletic Edition'}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#faf7f2] border border-[#e4ded5] text-[11px] font-bold text-[#121518]">
                      Size: UK {item.selectedSize}
                    </div>

                    {/* Stepper & Price Row */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#e4ded5] rounded-lg bg-[#faf7f2] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-1.5 hover:bg-[#ece7de] text-[#121518] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#121518]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-1.5 hover:bg-[#ece7de] text-[#121518] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#121518]">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[11px] text-gray-400 line-through block">
                            ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#e4ded5] p-6 sm:p-7 shadow-xs space-y-5 sticky top-28">
              <h2
                className="text-2xl font-semibold text-[#121518] pb-3 border-b border-[#e4ded5]"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Order Summary
              </h2>

              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Discount code (e.g. TOPSUN10)"
                  className="flex-1 px-3.5 py-2.5 bg-[#faf7f2] border border-[#e4ded5] rounded-xl text-xs uppercase font-semibold text-[#121518] focus:outline-none focus:border-[#121518]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#121518] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </form>
              {couponApplied && (
                <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <span>TOPSUN10 applied (10% OFF)</span>
                  <button onClick={() => setCouponApplied(false)} className="text-emerald-900">
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-[#606870]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#121518]">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount (10%)</span>
                    <span>-₹{Math.round(total * 0.1).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-emerald-700">
                    {isFreeShipping ? 'FREE' : '₹99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Applicable Taxes</span>
                  <span className="text-gray-400">Included in Price</span>
                </div>
                <div className="border-t border-[#e4ded5] pt-3 flex justify-between items-baseline text-sm sm:text-base font-bold text-[#121518]">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#121518]">
                    ₹{(couponApplied ? Math.round(total * 0.9) : total + (isFreeShipping ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-[#121518] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} />
              </button>

              {/* Trust Badges */}
              <div className="pt-2 border-t border-[#e4ded5] space-y-2 text-[11px] text-[#606870]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-700 shrink-0" />
                  <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-[#b38b3f] shrink-0" />
                  <span>Doorstep delivery via Delhivery & Bluedart</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
