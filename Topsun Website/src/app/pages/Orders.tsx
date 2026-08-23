import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, ShoppingBag, ChevronRight, Loader, ArrowLeft, MessageCircle } from 'lucide-react';
import Header from '@/app/components/Header';
import { useShopping } from '@/app/context/ShoppingContext';

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
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getCartItemCount } = useShopping();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setOrders(data as DBOrder[]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (order: DBOrder) => {
    const status = order.order_status;
    if (status === 'pending' && order.payment_method === 'cod') return 'bg-emerald-100 text-emerald-800';
    switch (status) {
      case 'confirmed':  return 'bg-emerald-100 text-emerald-800';
      case 'processing': return 'bg-blue-100 text-[#009FE3]';
      case 'shipped':    return 'bg-purple-100 text-purple-800';
      case 'delivered':  return 'bg-emerald-100 text-emerald-800';
      case 'failed':     return 'bg-rose-100 text-rose-800';
      default:           return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (order: DBOrder) => {
    const status = order.order_status;
    if (status === 'pending' && order.payment_method === 'cod') return <Package size={16} />;
    switch (status) {
      case 'confirmed':  return <CheckCircle size={16} />;
      case 'delivered':  return <CheckCircle size={16} />;
      case 'shipped':    return <Truck size={16} />;
      case 'processing': return <Package size={16} />;
      default:           return <Clock size={16} />;
    }
  };

  const getStatusLabel = (order: DBOrder) => {
    if (order.payment_method === 'cod' && (order.order_status === 'pending' || order.order_status === 'confirmed')) return 'Cash on Delivery';
    if (order.order_status === 'pending') return 'Processing';
    return order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Floating WhatsApp Support Button */}
      <a
        href="https://wa.me/917485006659?text=Hi%20TOPSUN%20Team!%20I%20have%20a%20query%20about%20my%20order."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp"
        title="WhatsApp Support"
      >
        <MessageCircle size={26} className="fill-current" />
      </a>

      <main className="pt-24 sm:pt-28 pb-20 max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors active:scale-95 text-gray-800"
              title="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              My Orders
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader size={32} className="animate-spin text-[#009FE3]" />
            <p className="text-gray-500 text-xs font-semibold">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl p-8 border border-gray-200/70 shadow-xs space-y-3">
            <div className="w-16 h-16 bg-blue-50 text-[#009FE3] rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No orders placed yet</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Discover top-rated shoes with instant delivery.</p>
            <Link
              to="/shop"
              className="inline-block px-7 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-full text-xs transition-colors shadow-md mt-2"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-200/70 shadow-xs overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Status Bar */}
                <div className="h-1 bg-[#009FE3]" />

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase text-[#009FE3] tracking-widest block">
                        Order #{order.order_number}
                      </span>
                      <p className="text-xs text-gray-500">Placed on {formatDate(order.created_at)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-gray-900">
                        ₹{(order.total_amount / 100).toLocaleString('en-IN')}
                      </span>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order)}`}>
                        {getStatusIcon(order)}
                        <span>{getStatusLabel(order)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Product Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="flex items-center gap-4 py-1">
                      <div className="w-16 h-16 bg-[#f4f4f2] rounded-2xl flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 overflow-hidden">
                        {order.items[0].image_url ? (
                          <img src={order.items[0].image_url} alt="Product" className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <Package size={22} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {order.items[0].product_name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Size: UK {order.items[0].size} · Qty: {order.items[0].quantity}
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-[11px] text-[#009FE3] font-bold mt-0.5">
                            +{order.items.length - 1} more item(s)
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      to={`/order-confirmation/${order.id}`}
                      className="text-xs font-bold text-[#009FE3] hover:underline flex items-center gap-1"
                    >
                      View Invoice & Details <ChevronRight size={14} />
                    </Link>

                    <Link
                      to="/track-order"
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors"
                    >
                      Track Package
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
