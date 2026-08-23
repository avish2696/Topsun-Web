import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminRoute } from '@/app/components/auth/AdminRoute';
import { supabase } from '@/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Loader, MapPin, Search, Filter, ChevronLeft, Calendar, CreditCard, Package, TrendingUp, IndianRupee, Clock, Mail, LogOut, Menu, X as XIcon } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TopsunLogoImg from '@/imports/TOPSUN png 1.png';

interface DBUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
  provider?: string;
}

interface DBOrder {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
  shipping_address?: any;
  items?: any[];
}

// ── Custom Admin Header (no cart bag) ─────────────────────────────────────────
function AdminHeader({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <img src={TopsunLogoImg} alt="TOPSUN" className="h-9 object-contain" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#ADD8E6]/20 text-[#001f27] rounded-full">ADMIN</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6f7879] hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Users Panel (full screen slide) ──────────────────────────────────────────
function UsersPanel({ onBack, users }: { onBack: () => void; users: DBUser[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    users.filter(u =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    ), [users, search]);

  const otpCount = users.filter(u => !u.provider || u.provider === 'email').length;
  const googleCount = users.filter(u => u.provider === 'google').length;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-[#F5F9FA] z-50 overflow-y-auto pb-16"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onBack} className="p-2 -ml-2 bg-gray-100 rounded-full text-[#191c1d]">
              <ChevronLeft size={20} />
            </button>
            <div>
              <p className="text-xs text-[#6f7879] font-semibold tracking-wider uppercase">Users</p>
              <h2 className="text-xl font-bold font-['DM_Sans'] text-[#191c1d]">All Users</h2>
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#F5F9FA] border border-gray-200 focus:ring-2 focus:ring-[#ADD8E6] outline-none text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] text-center">
            <p className="text-[10px] text-[#6f7879] font-semibold uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">{users.length}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] text-center">
            <p className="text-[10px] text-[#6f7879] font-semibold uppercase tracking-wider mb-1">Email OTP</p>
            <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">{otpCount}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] text-center">
            <p className="text-[10px] text-[#6f7879] font-semibold uppercase tracking-wider mb-1">Google</p>
            <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">{googleCount}</p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No users found.</div>
          ) : (
            filtered.map((u, i) => (
              <div key={u.id}>
                <div className="flex items-center gap-3 px-4 py-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#ADD8E6]/30 flex items-center justify-center text-[#001f27] font-bold text-sm flex-shrink-0">
                    {u.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#191c1d] text-sm truncate">{u.full_name || 'Unknown'}</p>
                    <p className="text-xs text-[#6f7879] truncate">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.provider === 'google'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-[#ADD8E6]/20 text-[#001f27]'
                      }`}>
                        {u.provider === 'google' ? (
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        ) : (
                          <Mail size={8} />
                        )}
                        {u.provider === 'google' ? 'Google' : 'Email OTP'}
                      </span>
                      {u.created_at && (
                        <span className="text-[10px] text-[#6f7879]">
                          Joined {format(new Date(u.created_at), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {i < filtered.length - 1 && <div className="h-px bg-gray-50 mx-4" />}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  const [metrics, setMetrics] = useState({ pending: 0, revenue: 0, uniqueCustomers: 0, totalOrders: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ── 1. Fetch ALL orders ──────────────────────────────────────────────
      const { data: allOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, order_number, user_id, total_amount, payment_status, order_status, payment_method, created_at, shipping_address, items')
        .order('created_at', { ascending: false });
      if (ordersErr) throw ordersErr;

      const fetchedOrders = allOrders || [];
      setOrders(fetchedOrders);

      // ── 2. Compute metrics accurately ────────────────────────────────────
      const now = new Date();

      // Pending = orders that are not yet shipped/delivered/cancelled
      const mPending = fetchedOrders.filter(o =>
        ['pending', 'processing'].includes(o.order_status)
      ).length;

      // Revenue = sum of all orders that are NOT cancelled/returned/failed
      const mRevenue = fetchedOrders
        .filter(o => !['cancelled', 'returned', 'failed'].includes(o.order_status))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Unique customers = distinct user_ids in the orders table
      const uniqueUserIds = new Set(fetchedOrders.map(o => o.user_id).filter(Boolean));
      const mUniqueCustomers = uniqueUserIds.size;

      // Total orders count
      const mTotalOrders = fetchedOrders.length;

      // ── 3. Revenue chart — last 7 days ───────────────────────────────────
      const last7Days = Array.from({ length: 7 }).map((_, i) => ({
        name: format(subDays(now, 6 - i), 'MMM dd'),
        revenue: 0,
        orders: 0,
      }));

      fetchedOrders.forEach(o => {
        if (['cancelled', 'returned', 'failed'].includes(o.order_status)) return;
        const d = new Date(o.created_at);
        const dayDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          last7Days[6 - dayDiff].revenue += (o.total_amount || 0) / 100;
          last7Days[6 - dayDiff].orders += 1;
        }
      });

      // ── 4. Build users list from unique order user_ids + shipping info ───
      const usersMap = new Map<string, DBUser>();
      fetchedOrders.forEach(o => {
        if (!o.user_id || usersMap.has(o.user_id)) return;
        const addr = o.shipping_address || {};
        usersMap.set(o.user_id, {
          id: o.user_id,
          full_name: addr.fullName || 'Guest',
          email: addr.email || 'N/A',
          phone: addr.phone || 'N/A',
          created_at: o.created_at,
          provider: o.payment_method === 'google' ? 'google' : 'email',
        });
      });

      // ── 5. Fetch ALL users securely via RPC function ───
      try {
        const { data: allUsers, error: usersErr } = await supabase.rpc('get_all_users');
        
        if (usersErr) {
           console.warn("Could not fetch all users via RPC (admin policy might be missing):", usersErr.message);
        } else if (allUsers) {
          allUsers.forEach((p: any) => {
            if (!usersMap.has(p.id)) {
              usersMap.set(p.id, {
                id: p.id,
                full_name: p.full_name || p.name || 'Unknown',
                email: p.email || 'N/A',
                phone: p.phone || '',
                created_at: p.created_at || new Date().toISOString(),
                provider: p.provider || 'email',
              });
            }
          });
        }
      } catch (e) {
        console.error("Error calling get_all_users:", e);
      }

      setMetrics({ pending: mPending, revenue: mRevenue, uniqueCustomers: usersMap.size, totalOrders: mTotalOrders });
      setChartData(last7Days);
      setUsers(Array.from(usersMap.values()));
    } catch (err: any) {
      console.error('Admin fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };


  const viewReceipt = async (order: DBOrder) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', order.id).single();
      if (error) throw error;
      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      setOrderDetails({ ...data, items: itemsData || data.items || [] });
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
      if (orderDetails && selectedOrder?.id === orderId) {
        setOrderDetails({ ...orderDetails, order_status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login', { replace: true });
  };

  const filteredOrders = useMemo(() =>
    orders.filter(o =>
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [orders, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F5F9FA] font-sans pb-24">
      <AdminHeader onLogout={handleLogout} />

      <main className="pt-24 px-4 max-w-lg mx-auto">

        {/* Page Title & Search */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d] tracking-tight">Dashboard</h1>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white rounded-xl shadow-[0_2px_8px_rgba(25,28,29,0.06)] text-[#3a6470] hover:bg-[#ADD8E6]/10 transition-colors disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader size={14} className="animate-spin" /> : <TrendingUp size={14} />}
              Refresh
            </button>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border-none shadow-[0_2px_8px_rgba(25,28,29,0.04)] focus:ring-2 focus:ring-[#ADD8E6] outline-none text-sm"
              />
            </div>
            <button className="px-4 bg-white rounded-xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] text-[#191c1d] flex items-center justify-center">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x" style={{ scrollbarWidth: 'none' }}>
          {/* Pending */}
          <div className="snap-start min-w-[130px] bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] flex flex-col justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-[#6f7879] mb-2">
              <Clock size={14} /><span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">{metrics.pending}</p>
            <p className="text-[10px] text-[#6f7879] mt-1">Awaiting dispatch</p>
          </div>
          {/* Revenue */}
          <div className="snap-start min-w-[130px] bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] flex flex-col justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-[#6f7879] mb-2">
              <IndianRupee size={14} /><span className="text-xs font-semibold uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">₹{(metrics.revenue / 100).toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-[#6f7879] mt-1">All time</p>
          </div>
          {/* Total Orders */}
          <div className="snap-start min-w-[130px] bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] flex flex-col justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-[#6f7879] mb-2">
              <Package size={14} /><span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            </div>
            <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">{metrics.totalOrders}</p>
            <p className="text-[10px] text-[#6f7879] mt-1">Total placed</p>
          </div>
          {/* Users — clickable */}
          <button
            onClick={() => setShowUsers(true)}
            className="snap-start min-w-[130px] bg-[#191c1d] p-4 rounded-2xl shadow-[0_4px_12px_rgba(25,28,29,0.15)] flex flex-col justify-between flex-shrink-0 text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-2 text-[#ADD8E6] mb-2">
              <Users size={14} /><span className="text-xs font-semibold uppercase tracking-wider">Customers</span>
            </div>
            <p className="text-2xl font-bold font-['DM_Sans'] text-white">{metrics.uniqueCustomers}</p>
            <p className="text-[10px] text-[#ADD8E6] mt-1">Tap to view →</p>
          </button>
        </div>

        {/* Revenue Graph */}
        <div className="bg-white rounded-2xl p-5 mb-6 shadow-[0_2px_8px_rgba(25,28,29,0.04)]">
          <h3 className="text-sm font-semibold text-[#191c1d] uppercase tracking-wider mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#ADD8E6]" /> Revenue Overview (7D)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ADD8E6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ADD8E6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6f7879' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6f7879' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#191c1d', fontWeight: 'bold' }}
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ADD8E6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders List */}
        <h3 className="text-lg font-bold font-['DM_Sans'] text-[#191c1d] mb-4">Recent Orders</h3>
        {loading ? (
          <div className="flex justify-center p-12"><Loader className="animate-spin text-[#ADD8E6]" /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.slice(0, 20).map(o => (
              <div key={o.id} className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-[#F5F9FA] flex items-center justify-center text-[#191c1d] font-bold text-sm">
                      {o.shipping_address?.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-[#191c1d] text-sm">{o.shipping_address?.fullName || 'Guest'}</p>
                      <p className="text-xs text-[#6f7879]">{o.order_number || o.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#191c1d]">₹{(o.total_amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#ADD8E6]/20 text-[#001f27] text-[10px] font-bold uppercase tracking-wider rounded-full">
                      {o.order_status}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-100 w-full" />
                <button
                  onClick={() => viewReceipt(o)}
                  className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#191c1d] hover:bg-gray-50 transition-colors"
                >
                  View Receipt
                </button>
              </div>
            ))}
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm">No orders found.</div>
            )}
          </div>
        )}
      </main>

      {/* Users Panel */}
      <AnimatePresence>
        {showUsers && (
          <UsersPanel onBack={() => setShowUsers(false)} users={users} />
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#F5F9FA] z-50 overflow-y-auto font-sans pb-24"
          >
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between shadow-sm z-10 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedOrder(null)} className="p-2 -ml-2 bg-gray-50 rounded-full text-[#191c1d]">
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <p className="text-xs text-[#6f7879] font-semibold tracking-wider uppercase">Order Receipt</p>
                  <h2 className="text-lg font-bold font-['DM_Sans'] text-[#191c1d]">{selectedOrder.order_number || selectedOrder.id.substring(0, 8)}</h2>
                </div>
              </div>
              <button
                onClick={() => {
                  updateOrderStatus(selectedOrder.id, selectedOrder.order_status === 'delivered' ? 'pending' : 'delivered');
                  setTimeout(() => setSelectedOrder(null), 500);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${selectedOrder.order_status === 'delivered' ? 'bg-gray-100 text-gray-600' : 'bg-[#191c1d] text-white'}`}
              >
                {selectedOrder.order_status === 'delivered' ? 'Mark Pending' : 'Mark Fulfilled'}
              </button>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-4">
              {loadingDetails || !orderDetails ? (
                <div className="flex justify-center p-12"><Loader className="animate-spin text-[#ADD8E6]" /></div>
              ) : (
                <>
                  {/* Customer Block */}
                  <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)]">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-[#ADD8E6]/30 flex items-center justify-center text-[#001f27] font-bold text-xl">
                        {orderDetails.shipping_address?.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#191c1d]">{orderDetails.shipping_address?.fullName || 'Guest User'}</h3>
                        <p className="text-sm text-[#ADD8E6] font-medium">{orderDetails.shipping_address?.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-[#6f7879] flex items-center gap-1 mb-1"><MapPin size={12} /> Phone</p>
                        <p className="text-sm font-semibold">{orderDetails.shipping_address?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6f7879] flex items-center gap-1 mb-1"><Calendar size={12} /> Date</p>
                        <p className="text-sm font-semibold">{format(new Date(orderDetails.created_at), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping & Payment */}
                  <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] space-y-4">
                    <div>
                      <p className="text-xs text-[#6f7879] font-semibold uppercase tracking-wider flex items-center gap-2 mb-2">
                        <MapPin size={14} /> Shipping Address
                      </p>
                      <p className="text-sm text-[#191c1d] leading-relaxed">
                        {orderDetails.shipping_address?.addressLine1}<br />
                        {orderDetails.shipping_address?.city}, {orderDetails.shipping_address?.state} {orderDetails.shipping_address?.postalCode}<br />
                        India
                      </p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <div>
                      <p className="text-xs text-[#6f7879] font-semibold uppercase tracking-wider flex items-center gap-2 mb-2">
                        <CreditCard size={14} /> Payment
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{orderDetails.payment_status === 'cod_pending' ? 'COD' : 'PAID'}</div>
                        <p className="text-sm font-medium">{orderDetails.payment_status === 'cod_pending' ? 'Cash on Delivery' : 'Paid Online'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)]">
                    <p className="text-xs text-[#6f7879] font-semibold uppercase tracking-wider flex items-center gap-2 mb-4">
                      <Package size={14} /> Items in this order
                    </p>
                    <div className="space-y-4">
                      {orderDetails.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-[#191c1d]">{item.product_name || `Product ID: ${item.product_id}`}</p>
                            <p className="text-xs text-[#6f7879] mt-0.5">Qty: {item.quantity} • Size: {item.size}</p>
                          </div>
                          <p className="font-bold text-[#191c1d]">₹{(item.price / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <p className="text-[#6f7879] font-semibold">Total</p>
                      <p className="text-2xl font-bold font-['DM_Sans'] text-[#191c1d]">₹{(orderDetails.total_amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(25,28,29,0.04)] mb-8">
                    <p className="text-xs text-[#6f7879] font-semibold uppercase tracking-wider mb-4">
                      Past orders for {orderDetails.shipping_address?.fullName?.split(' ')[0] || 'customer'}
                    </p>
                    <div className="space-y-3">
                      {orders
                        .filter(o => o.user_id === selectedOrder.user_id && o.id !== selectedOrder.id)
                        .slice(0, 3)
                        .map(o => (
                          <div key={o.id} className="flex justify-between items-center p-3 bg-[#F5F9FA] rounded-xl text-sm">
                            <div>
                              <p className="font-semibold text-[#191c1d]">{o.order_number || o.id.substring(0, 8)}</p>
                              <p className="text-[10px] text-[#6f7879] uppercase">{format(new Date(o.created_at), 'MMM dd, yyyy')}</p>
                            </div>
                            <span className="px-2 py-1 bg-white text-[#6f7879] text-xs font-bold rounded-lg shadow-sm border border-gray-100">
                              {o.order_status}
                            </span>
                          </div>
                        ))}
                      {orders.filter(o => o.user_id === selectedOrder.user_id && o.id !== selectedOrder.id).length === 0 && (
                        <p className="text-sm text-gray-500 italic">No previous orders found.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
