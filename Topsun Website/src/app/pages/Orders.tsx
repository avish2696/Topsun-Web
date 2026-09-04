import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, ChevronRight, Loader, ArrowLeft } from 'lucide-react';
import Header from '@/app/components/Header';
import { useShopping } from '@/app/context/ShoppingContext';
import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';
import { toValidUUID } from '@/app/utils/phoneAuthService';

interface DBOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  payment_method: string;
  order_status: string;
  items: any[];
  shipping_address: any;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCartItemCount } = useShopping();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders').select('*').eq('user_id', toValidUUID(user.id)).order('created_at', { ascending: false });
        if (!error && data) setOrders(data as DBOrder[]);
      } catch (err) {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusConfig = (order: DBOrder): { label: string; cls: string } => {
    const s = order.order_status;
    if (s === 'pending' && order.payment_method === 'cod') return { label: 'Cash on Delivery', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    switch (s) {
      case 'confirmed':  return { label: 'Confirmed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'processing': return { label: 'Processing', cls: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'shipped':    return { label: 'Shipped', cls: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'delivered':  return { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'failed':     return { label: 'Failed', cls: 'bg-red-50 text-red-700 border-red-200' };
      default:           return { label: 'Pending', cls: 'bg-gray-50 text-gray-600 border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="My Orders – Purchase History | TOPSUN"
        description="View and track your previous TOPSUN footwear orders, delivery status, and invoices."
        noIndex={true}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main className="pt-24 sm:pt-28 pb-24 max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
        <Breadcrumbs items={[{ label: 'My Orders' }]} />

        {/* Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#e4ded5] rounded-lg transition-colors text-gray-600 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Order History
            </h1>
            <p className="text-xs text-[#606870]">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader size={28} className="animate-spin text-[#b38b3f]" />
            <p className="text-[#606870] text-xs font-medium">Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#e4ded5] space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-[rgba(179,139,63,0.12)] rounded-full flex items-center justify-center mx-auto text-[#b38b3f]">
              <ShoppingBag size={28} />
            </div>
            <h3
              className="text-xl sm:text-2xl font-semibold text-[#121518]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              No orders placed yet
            </h3>
            <p className="text-xs text-[#606870] max-w-xs mx-auto leading-relaxed">
              Discover athletic performance shoes with responsive cushioning and 7-day hassle-free exchanges.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#121518] hover:bg-black text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors mt-2"
            >
              Start Shopping <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = getStatusConfig(order);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#e4ded5] shadow-xs overflow-hidden"
                >
                  <div className="h-[3px] bg-gradient-to-r from-[#b38b3f] to-[#dfc38a]" />

                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#e4ded5] gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#b38b3f] tracking-wider block">
                          Order #{order.order_number}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">Placed on {formatDate(order.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-[#121518]">
                          ₹{(order.total_amount / 100).toLocaleString('en-IN')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${status.cls}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#faf7f2] rounded-xl flex-shrink-0 flex items-center justify-center border border-[#e4ded5] overflow-hidden p-1">
                          {order.items[0].image_url ? (
                            <img src={order.items[0].image_url} alt={order.items[0].product_name} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#121518] truncate">{order.items[0].product_name}</h4>
                          <p className="text-xs text-[#606870] mt-0.5">
                            Size: UK {order.items[0].size} · Qty: {order.items[0].quantity}
                          </p>
                          {order.items.length > 1 && (
                            <p className="text-[11px] text-[#b38b3f] font-bold mt-0.5">
                              +{order.items.length - 1} more item{order.items.length - 1 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        to={`/order-confirmation/${order.id}`}
                        className="text-xs font-bold text-[#b38b3f] hover:text-[#8c6820] flex items-center gap-1 transition-colors"
                      >
                        View Invoice & Details <ChevronRight size={14} />
                      </Link>
                      <Link
                        to="/track-order"
                        className="px-4 py-2 bg-[#faf7f2] hover:bg-[#ece7de] text-[#121518] font-bold text-xs rounded-lg transition-colors border border-[#e4ded5]"
                      >
                        Track Package
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
