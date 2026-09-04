import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminRoute } from '@/app/components/auth/AdminRoute';
import { supabase } from '@/supabase';
import { useAuth } from '@/app/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Loader, MapPin, Search, ChevronLeft, Calendar,
  CreditCard, Package, TrendingUp, IndianRupee, Clock, Mail,
  LogOut, CheckCircle2, XCircle, Phone, MessageSquare,
  Download, Eye, RefreshCw, ShoppingBag, Truck, Check, ArrowUpRight,
  ShieldCheck, Tag, ExternalLink, Printer, SlidersHorizontal
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { getSalesBannerSettings, saveSalesBannerSettings, SalesBannerConfig } from '@/app/utils/salesBannerSettings';
import { PRODUCTS } from '@/data/products';
import { toast } from 'sonner';
import TopsunLogoImg from '@/imports/TOPSUN png 1.webp';

interface DBUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
  provider?: string;
  total_spent?: number;
  orders_count?: number;
}

interface DBOrder {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  payment_status: string;
  order_status: string;
  payment_method?: string;
  created_at: string;
  shipping_address?: any;
  items?: any[];
  tracking_number?: string;
}

// ── Payment Status Categorizer ──────────────────────────────────────────────
export function getPaymentClassification(paymentStatus?: string, paymentMethod?: string, orderStatus?: string) {
  const pStatus = (paymentStatus || '').toLowerCase().trim();
  const pMethod = (paymentMethod || '').toLowerCase().trim();
  const oStatus = (orderStatus || '').toLowerCase().trim();

  // Cancelled or Failed
  if (
    oStatus === 'cancelled' ||
    pStatus === 'failed' ||
    pStatus === 'cancelled' ||
    pStatus === 'unpaid' ||
    pStatus === 'not_paid' ||
    pStatus === 'refunded'
  ) {
    return {
      type: 'cancelled' as const,
      label: pStatus === 'refunded' ? 'Refunded' : (pStatus === 'failed' ? 'Failed' : 'Cancelled / Unpaid'),
      color: 'red',
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300',
      dotClass: 'bg-rose-500',
      icon: XCircle,
    };
  }

  // Cash on Delivery
  if (
    pStatus === 'cod_pending' ||
    pStatus === 'cod' ||
    pMethod === 'cod' ||
    pMethod === 'cash on delivery' ||
    pStatus === 'pending_cod'
  ) {
    return {
      type: 'cod' as const,
      label: 'COD (Pending Pay)',
      color: 'yellow',
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300',
      dotClass: 'bg-amber-500',
      icon: Clock,
    };
  }

  // Completed / Paid
  return {
    type: 'paid' as const,
    label: 'Payment Completed',
    color: 'green',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    dotClass: 'bg-emerald-500',
    icon: CheckCircle2,
  };
}

// ── Order Status Helper ──────────────────────────────────────────────────────
export function getOrderStatusBadge(status: string) {
  const s = (status || 'pending').toLowerCase();
  switch (s) {
    case 'delivered':
      return { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Check };
    case 'shipped':
    case 'in_transit':
      return { label: 'Shipped', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck };
    case 'processing':
      return { label: 'Processing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Package };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle };
    default:
      return { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
  }
}

// ── Admin Dashboard Component ────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customers' | 'products' | 'marketing'>('overview');
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'cod' | 'cancelled'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_high' | 'amount_low'>('newest');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Sales Banner State
  const [bannerConfig, setBannerConfig] = useState<SalesBannerConfig>(getSalesBannerSettings());
  const [bannerTitle, setBannerTitle] = useState(bannerConfig.title);
  const [bannerSubtitle, setBannerSubtitle] = useState(bannerConfig.highlightText);
  const [bannerTargetDate, setBannerTargetDate] = useState(bannerConfig.targetDate.slice(0, 16));
  const [bannerEnabled, setBannerEnabled] = useState(bannerConfig.enabled);
  const [savingBanner, setSavingBanner] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: allOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      const fetchedOrders = (allOrders || []) as DBOrder[];
      setOrders(fetchedOrders);

      // 2. Fetch or Map Users
      const usersMap = new Map<string, DBUser>();

      fetchedOrders.forEach(o => {
        if (!o.user_id) return;
        const addr = o.shipping_address || {};
        const amount = (o.total_amount || 0) / 100;
        const isNotCancelled = !['cancelled', 'failed'].includes((o.order_status || '').toLowerCase());

        if (!usersMap.has(o.user_id)) {
          usersMap.set(o.user_id, {
            id: o.user_id,
            full_name: addr.fullName || 'Guest Customer',
            email: addr.email || 'N/A',
            phone: addr.phone || 'N/A',
            created_at: o.created_at,
            provider: o.payment_method === 'google' ? 'google' : 'email',
            total_spent: isNotCancelled ? amount : 0,
            orders_count: 1,
          });
        } else {
          const u = usersMap.get(o.user_id)!;
          u.orders_count = (u.orders_count || 0) + 1;
          if (isNotCancelled) {
            u.total_spent = (u.total_spent || 0) + amount;
          }
        }
      });

      // Try RPC for registered profiles
      try {
        const { data: allProfiles, error: profilesErr } = await supabase.rpc('get_all_users');
        if (!profilesErr && allProfiles) {
          allProfiles.forEach((p: any) => {
            if (!usersMap.has(p.id)) {
              usersMap.set(p.id, {
                id: p.id,
                full_name: p.full_name || p.name || 'Registered User',
                email: p.email || 'N/A',
                phone: p.phone || '',
                created_at: p.created_at || new Date().toISOString(),
                provider: p.provider || 'email',
                total_spent: 0,
                orders_count: 0,
              });
            }
          });
        }
      } catch (e) {
        // Graceful fallback
      }

      setUsers(Array.from(usersMap.values()));
    } catch (err: any) {
      console.error('Admin fetchData error:', err);
      toast.error('Failed to load orders: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // ── Metrics Calculation ──────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    let totalRevenue = 0;
    let paidRevenue = 0;
    let codRevenue = 0;
    let paidCount = 0;
    let codCount = 0;
    let cancelledCount = 0;
    let pendingDispatch = 0;

    orders.forEach(o => {
      const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
      const amount = (o.total_amount || 0) / 100;
      const oStatus = (o.order_status || '').toLowerCase();

      if (pClass.type === 'paid') {
        paidCount++;
        paidRevenue += amount;
        totalRevenue += amount;
      } else if (pClass.type === 'cod') {
        codCount++;
        codRevenue += amount;
        totalRevenue += amount;
      } else {
        cancelledCount++;
      }

      if (['pending', 'processing'].includes(oStatus)) {
        pendingDispatch++;
      }
    });

    const activeOrders = totalOrders - cancelledCount;
    const aov = activeOrders > 0 ? totalRevenue / activeOrders : 0;

    return {
      totalRevenue,
      paidRevenue,
      codRevenue,
      totalOrders,
      paidCount,
      codCount,
      cancelledCount,
      pendingDispatch,
      aov,
      customerCount: users.length,
    };
  }, [orders, users]);

  // ── 7-Day Chart Data ─────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const now = new Date();
    const last7Days = Array.from({ length: 7 }).map((_, i) => ({
      name: format(subDays(now, 6 - i), 'MMM dd'),
      revenue: 0,
      orders: 0,
    }));

    orders.forEach(o => {
      const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
      if (pClass.type === 'cancelled') return;

      const d = new Date(o.created_at);
      const dayDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (dayDiff >= 0 && dayDiff < 7) {
        last7Days[6 - dayDiff].revenue += (o.total_amount || 0) / 100;
        last7Days[6 - dayDiff].orders += 1;
      }
    });

    return last7Days;
  }, [orders]);

  // ── Payment Breakdown Data for Donut Chart ────────────────────────────────
  const paymentBreakdownData = useMemo(() => [
    { name: 'Paid / Completed (Green)', value: metrics.paidCount, color: '#10B981' },
    { name: 'COD Pending (Yellow)', value: metrics.codCount, color: '#F59E0B' },
    { name: 'Cancelled / Failed (Red)', value: metrics.cancelledCount, color: '#EF4444' },
  ], [metrics]);

  // ── Filtered & Sorted Orders ──────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
      const oStatus = (o.order_status || 'pending').toLowerCase();

      // Search Query filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchNum = o.order_number?.toLowerCase().includes(q) || o.id?.toLowerCase().includes(q);
        const matchName = o.shipping_address?.fullName?.toLowerCase().includes(q);
        const matchEmail = o.shipping_address?.email?.toLowerCase().includes(q);
        const matchPhone = o.shipping_address?.phone?.toLowerCase().includes(q);
        const matchCity = o.shipping_address?.city?.toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchEmail && !matchPhone && !matchCity) return false;
      }

      // Payment Status filter
      if (paymentFilter !== 'all') {
        if (paymentFilter === 'paid' && pClass.type !== 'paid') return false;
        if (paymentFilter === 'cod' && pClass.type !== 'cod') return false;
        if (paymentFilter === 'cancelled' && pClass.type !== 'cancelled') return false;
      }

      // Order Status filter
      if (orderStatusFilter !== 'all') {
        if (oStatus !== orderStatusFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'amount_high') return (b.total_amount || 0) - (a.total_amount || 0);
      if (sortBy === 'amount_low') return (a.total_amount || 0) - (b.total_amount || 0);
      return 0;
    });
  }, [orders, searchQuery, paymentFilter, orderStatusFilter, sortBy]);

  // ── Update Order Status ──────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o));
      if (orderDetails && selectedOrder?.id === orderId) {
        setOrderDetails((prev: any) => ({ ...prev, order_status: newStatus }));
      }
      toast.success(`Order status changed to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error('Failed to update order status: ' + err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ── Update Payment Status ─────────────────────────────────────────────────
  const handleUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    setUpdatingStatusId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newPaymentStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o));
      if (orderDetails && selectedOrder?.id === orderId) {
        setOrderDetails((prev: any) => ({ ...prev, payment_status: newPaymentStatus }));
      }
      toast.success(`Payment status marked as ${newPaymentStatus.toUpperCase()}`);
    } catch (err: any) {
      console.error('Error updating payment status:', err);
      toast.error('Failed to update payment: ' + err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ── View Order Details Modal ──────────────────────────────────────────────
  const viewReceipt = async (order: DBOrder) => {
    setSelectedOrder(order);
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').eq('id', order.id).single();
      if (error) throw error;
      const { data: itemsData } = await supabase.from('order_items').select('*').eq('order_id', order.id);
      setOrderDetails({ ...data, items: (itemsData && itemsData.length > 0) ? itemsData : (data.items || []) });
    } catch (err) {
      console.error('Error fetching details:', err);
      setOrderDetails(order);
    } finally {
      setLoadingDetails(false);
    }
  };

  // ── Export Orders to CSV ──────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('No orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'City',
      'State',
      'PIN',
      'Items Count',
      'Total Amount (INR)',
      'Payment Status',
      'Payment Classification',
      'Order Status',
    ];

    const rows = filteredOrders.map(o => {
      const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
      const addr = o.shipping_address || {};
      const itemsCount = (o.items || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || 1;

      return [
        `"${o.order_number || o.id}"`,
        `"${format(new Date(o.created_at), 'yyyy-MM-dd HH:mm')}"`,
        `"${addr.fullName || 'Guest'}"`,
        `"${addr.email || 'N/A'}"`,
        `"${addr.phone || 'N/A'}"`,
        `"${addr.city || ''}"`,
        `"${addr.state || ''}"`,
        `"${addr.postalCode || ''}"`,
        itemsCount,
        ((o.total_amount || 0) / 100).toFixed(2),
        `"${o.payment_status || 'pending'}"`,
        `"${pClass.label}"`,
        `"${o.order_status || 'pending'}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `topsun_orders_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders exported to CSV successfully!');
  };

  // ── Save Sales Banner ─────────────────────────────────────────────────────
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const updated: SalesBannerConfig = {
        title: bannerTitle.trim() || 'Comfort Rush Deals',
        highlightText: bannerSubtitle.trim() || 'Ends In:',
        targetDate: new Date(bannerTargetDate).toISOString(),
        enabled: bannerEnabled,
      };
      saveSalesBannerSettings(updated);
      setBannerConfig(updated);
      toast.success('Sales offer & countdown updated successfully across website!');
    } catch (err: any) {
      toast.error('Failed to update banner: ' + err.message);
    } finally {
      setSavingBanner(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin-login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-[#1E293B] font-sans antialiased pb-20">
      
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Status Badge */}
          <div className="flex items-center gap-3">
            <img src={TopsunLogoImg} alt="TOPSUN" className="h-8 sm:h-9 object-contain" />
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-800 tracking-wide uppercase">Admin Console</span>
            </div>
          </div>

          {/* Quick Stats Summary on Header */}
          <div className="hidden md:flex items-center gap-6 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Paid: <strong className="text-gray-900">{metrics.paidCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>COD: <strong className="text-gray-900">{metrics.codCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Cancelled: <strong className="text-gray-900">{metrics.cancelledCount}</strong></span>
            </div>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-gray-700 hover:text-[#009FE3] bg-gray-50 hover:bg-[#009FE3]/10 border border-gray-200 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-[#009FE3]' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-gray-700 hover:text-emerald-700 bg-gray-50 hover:bg-emerald-50 border border-gray-200 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              title="Export Orders CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-3 py-2 rounded-xl transition-all active:scale-95 border border-rose-200/60"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* ── Sub Navigation Tabs ────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 border-t border-gray-100 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & Analytics', icon: TrendingUp },
            { id: 'orders', label: `Orders (${orders.length})`, icon: Package, badge: metrics.pendingDispatch > 0 ? `${metrics.pendingDispatch} Pending` : null },
            { id: 'customers', label: `Customers (${users.length})`, icon: Users },
            { id: 'products', label: `Products (${PRODUCTS.length})`, icon: ShoppingBag },
            { id: 'marketing', label: 'Sales Banner & Countdown', icon: Tag },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#009FE3] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-[#009FE3]' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Main Workspace ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: OVERVIEW & ANALYTICS                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Payment Status Legend & Color Rule Banner */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#009FE3]" /> Payment Status Indicators
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Universal visual color coding across all orders, reports, and receipts:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {/* Green Paid */}
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold leading-none">Green: Paid / Completed</p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">{metrics.paidCount} Orders (₹{(metrics.paidRevenue).toLocaleString('en-IN')})</p>
                    </div>
                  </div>

                  {/* Yellow COD */}
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold leading-none">Yellow: COD Pending</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">{metrics.codCount} Orders (₹{(metrics.codRevenue).toLocaleString('en-IN')})</p>
                    </div>
                  </div>

                  {/* Red Cancelled */}
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
                    <div>
                      <p className="text-xs font-bold leading-none">Red: Cancelled / Unpaid</p>
                      <p className="text-[10px] text-rose-600 mt-0.5">{metrics.cancelledCount} Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              
              {/* Total Revenue */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><IndianRupee size={16} /></div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    ₹{(metrics.totalRevenue).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-gray-500">
                    <span className="text-emerald-600 font-bold">₹{metrics.paidRevenue.toLocaleString('en-IN')} Online</span>
                    <span>•</span>
                    <span className="text-amber-600 font-bold">₹{metrics.codRevenue.toLocaleString('en-IN')} COD</span>
                  </div>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-[#009FE3]"><Package size={16} /></div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{metrics.totalOrders}</p>
                  <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-600">{metrics.paidCount} Paid</span> |
                    <span className="font-semibold text-amber-600">{metrics.codCount} COD</span> |
                    <span className="font-semibold text-rose-600">{metrics.cancelledCount} Cancelled</span>
                  </p>
                </div>
              </div>

              {/* Pending Dispatch */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Awaiting Dispatch</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Clock size={16} /></div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">{metrics.pendingDispatch}</p>
                  <p className="text-[11px] text-gray-500 mt-1.5">Orders in Pending / Processing status</p>
                </div>
              </div>

              {/* Average Order Value (AOV) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Average Order Value</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600"><TrendingUp size={16} /></div>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    ₹{metrics.aov.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1.5">{metrics.customerCount} registered customers</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* 7-Day Revenue Trend (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp size={16} className="text-[#009FE3]" /> Revenue & Order Trends (Last 7 Days)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Daily gross sales volume across all channels</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009FE3" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#009FE3" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#009FE3" strokeWidth={3} fillOpacity={1} fill="url(#adminRevenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Payment Status Breakdown Donut (1 Col) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={16} className="text-[#009FE3]" /> Payment Distribution
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Ratio of Paid vs COD vs Cancelled</p>
                </div>

                <div className="h-48 w-full my-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {paymentBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0' }}
                        formatter={(value: number, name: string) => [`${value} Orders`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Paid / Completed (Green)
                    </span>
                    <strong className="text-emerald-700">{metrics.paidCount} ({metrics.totalOrders > 0 ? Math.round((metrics.paidCount / metrics.totalOrders) * 100) : 0}%)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      COD (Yellow)
                    </span>
                    <strong className="text-amber-700">{metrics.codCount} ({metrics.totalOrders > 0 ? Math.round((metrics.codCount / metrics.totalOrders) * 100) : 0}%)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Cancelled / Unpaid (Red)
                    </span>
                    <strong className="text-rose-700">{metrics.cancelledCount} ({metrics.totalOrders > 0 ? Math.round((metrics.cancelledCount / metrics.totalOrders) * 100) : 0}%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Quick Preview on Overview */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Orders Activity</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Latest 5 orders placed on Topsun</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#009FE3] hover:underline flex items-center gap-1"
                >
                  View All {orders.length} Orders <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="divide-y divide-gray-100">
                {orders.slice(0, 5).map(o => {
                  const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
                  const oBadge = getOrderStatusBadge(o.order_status);
                  const PIcon = pClass.icon;

                  return (
                    <div key={o.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${pClass.bgClass}`}>
                          <PIcon size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{o.shipping_address?.fullName || 'Guest User'}</span>
                            <span className="text-xs text-gray-400 font-mono">#{o.order_number || o.id.slice(0, 8)}</span>
                          </div>
                          <p className="text-xs text-gray-500">{format(new Date(o.created_at), 'MMM dd, yyyy • hh:mm a')}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${pClass.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pClass.dotClass}`} />
                          {pClass.label}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${oBadge.bg}`}>
                          {oBadge.label}
                        </span>

                        <p className="font-bold text-gray-900 text-sm min-w-[80px] text-right">
                          ₹{((o.total_amount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>

                        <button
                          onClick={() => viewReceipt(o)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ORDERS MANAGEMENT                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter & Control Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-4">
              
              {/* Search + Sort */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by Order #, Customer Name, Email, Phone, or City..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs">
                    <SlidersHorizontal size={14} className="text-gray-500" />
                    <span className="font-semibold text-gray-600">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={e => setSortBy(e.target.value as any)}
                      className="bg-transparent font-bold text-gray-900 outline-none cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="amount_high">Highest Amount</option>
                      <option value="amount_low">Lowest Amount</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Filter Tabs (Strictly Color-Coded) */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Payment:</span>
                
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    paymentFilter === 'all'
                      ? 'bg-gray-900 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All ({orders.length})
                </button>

                {/* GREEN: Completed / Paid */}
                <button
                  onClick={() => setPaymentFilter('paid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    paymentFilter === 'paid'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${paymentFilter === 'paid' ? 'bg-white' : 'bg-emerald-500'}`} />
                  Paid / Completed ({metrics.paidCount})
                </button>

                {/* YELLOW: COD */}
                <button
                  onClick={() => setPaymentFilter('cod')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    paymentFilter === 'cod'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${paymentFilter === 'cod' ? 'bg-white' : 'bg-amber-500'}`} />
                  COD ({metrics.codCount})
                </button>

                {/* RED: Cancelled / Unpaid */}
                <button
                  onClick={() => setPaymentFilter('cancelled')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    paymentFilter === 'cancelled'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${paymentFilter === 'cancelled' ? 'bg-white' : 'bg-rose-500'}`} />
                  Cancelled / Unpaid ({metrics.cancelledCount})
                </button>

                <div className="h-4 w-px bg-gray-200 mx-2 hidden sm:block" />

                {/* Order Status Quick Filter */}
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1 hidden sm:inline">Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
                >
                  <option value="all">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

            </div>

            {/* Orders Table / Cards List */}
            {loading ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-xs">
                <Loader className="animate-spin text-[#009FE3] mx-auto mb-3" size={32} />
                <p className="text-sm font-semibold text-gray-600">Loading order records...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center border border-gray-200/80 shadow-xs">
                <Package className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="text-base font-bold text-gray-900">No orders match your filter</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search keywords, payment status filter, or order status selection.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setPaymentFilter('all'); setOrderStatusFilter('all'); }}
                  className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(o => {
                  const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
                  const oBadge = getOrderStatusBadge(o.order_status);
                  const PIcon = pClass.icon;
                  const isUpdating = updatingStatusId === o.id;

                  return (
                    <div
                      key={o.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:border-gray-300 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Order & Customer Info */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base flex-shrink-0 ${pClass.bgClass}`}>
                            <PIcon size={22} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-gray-900 text-base">{o.shipping_address?.fullName || 'Guest Customer'}</h4>
                              <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                #{o.order_number || o.id.slice(0, 8)}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} /> {format(new Date(o.created_at), 'MMM dd, yyyy • hh:mm a')}
                              </span>
                              {o.shipping_address?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone size={12} /> {o.shipping_address.phone}
                                </span>
                              )}
                              {o.shipping_address?.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> {o.shipping_address.city}, {o.shipping_address.state}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badges, Pricing & Quick Actions */}
                        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                          
                          {/* Payment Badge (Color-Coded) */}
                          <div className="flex flex-col items-start lg:items-end">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${pClass.badgeClass}`}>
                              <span className={`w-2 h-2 rounded-full ${pClass.dotClass}`} />
                              {pClass.label}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">
                              {o.payment_method || 'Online'}
                            </span>
                          </div>

                          {/* Quick Order Status Dropdown */}
                          <div className="flex items-center gap-1.5">
                            <select
                              disabled={isUpdating}
                              value={o.order_status || 'pending'}
                              onChange={e => handleUpdateOrderStatus(o.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${oBadge.bg}`}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="processing">📦 Processing</option>
                              <option value="shipped">🚚 Shipped</option>
                              <option value="delivered">✅ Delivered</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </div>

                          {/* Order Total */}
                          <div className="text-right min-w-[100px]">
                            <p className="text-base sm:text-lg font-black text-gray-900">
                              ₹{((o.total_amount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {(o.items || []).length > 0 ? `${o.items?.length} item(s)` : '1 package'}
                            </p>
                          </div>

                          {/* View Details Button */}
                          <button
                            onClick={() => viewReceipt(o)}
                            className="px-3.5 py-2 bg-gray-900 hover:bg-[#009FE3] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
                          >
                            <Eye size={14} />
                            Receipt
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: CUSTOMERS CRM                                              */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            
            {/* Header / Search */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Customer Directory ({users.length})</h3>
                <p className="text-xs text-gray-500 mt-0.5">All registered users and guest checkout clients</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search customer name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#009FE3] outline-none"
                />
              </div>
            </div>

            {/* Customer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users
                .filter(u =>
                  u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.phone?.includes(searchQuery)
                )
                .map(u => (
                  <div key={u.id} className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#009FE3]/10 text-[#009FE3] font-black text-base flex items-center justify-center flex-shrink-0">
                          {u.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || u.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-900 text-sm truncate">{u.full_name || 'Guest User'}</h4>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.provider === 'google' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#009FE3]'
                          }`}>
                            {u.provider === 'google' ? 'Google Auth' : 'Email / Mobile'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-100 text-xs">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Orders Placed</p>
                          <p className="font-bold text-gray-900">{u.orders_count || 1}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Lifetime Spend</p>
                          <p className="font-bold text-emerald-700">₹{(u.total_spent || 0).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-1 flex items-center justify-between text-xs">
                      {u.phone && u.phone !== 'N/A' ? (
                        <a
                          href={`https://wa.me/91${u.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                        >
                          <MessageSquare size={13} /> WhatsApp
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">No phone on file</span>
                      )}

                      {u.email && u.email !== 'N/A' && (
                        <a
                          href={`mailto:${u.email}`}
                          className="text-[#009FE3] hover:underline font-bold flex items-center gap-1"
                        >
                          <Mail size={13} /> Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PRODUCTS CATALOG                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Products Catalog ({PRODUCTS.length})</h3>
                <p className="text-xs text-gray-500 mt-0.5">Current inventory items available on the storefront</p>
              </div>

              <a
                href="/shop"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#009FE3] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <ExternalLink size={14} /> Open Live Shop
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map(p => (
                <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 p-2 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <img src={p.images?.[0]} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#009FE3] bg-[#009FE3]/10 px-2 py-0.5 rounded-md">
                      {p.category}
                    </span>
                    <h4 className="font-bold text-gray-900 text-sm mt-1 truncate">{p.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-black text-gray-900 text-sm">₹{p.price.toLocaleString('en-IN')}</span>
                      {p.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">₹{p.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Sizes: {p.sizes?.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: SALES BANNER & COUNTDOWN CONFIGURATOR                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'marketing' && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Tag size={18} className="text-[#009FE3]" /> Top Offer Bar & Countdown Timer
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Configure the site-wide announcement banner and synchronized countdown clock displayed at the top of every page.
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${bannerEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {bannerEnabled ? '● ACTIVE LIVE' : '○ DISABLED'}
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="mb-6 p-4 rounded-xl bg-[#009FE3] text-white shadow-xs">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80 mb-1">Live Storefront Preview</p>
                <div className="flex items-center justify-center gap-3 text-xs font-bold text-center">
                  <span>{bannerTitle || 'Comfort Rush Deals'}</span>
                  <span>|</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">{bannerSubtitle || 'Ends In:'} 08h : 42m : 15s</span>
                </div>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Offer Campaign Title</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. Comfort Rush Deals, Diwali Flash Sale, Monsoon Rush"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Subtext / Prefix</label>
                    <input
                      type="text"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="e.g. Ends In:, Limited Stock:"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Countdown Expiry Date & Time</label>
                    <input
                      type="datetime-local"
                      value={bannerTargetDate}
                      onChange={(e) => setBannerTargetDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bannerEnabled}
                      onChange={(e) => setBannerEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#009FE3] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-700">Display top banner on website</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingBanner}
                    className="px-6 py-2.5 bg-[#009FE3] hover:bg-[#0088c4] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {savingBanner ? 'Saving...' : 'Save & Publish Banner'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RICH ORDER DETAILS & RECEIPT MODAL                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 my-auto"
            >
              
              {/* Modal Topbar */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-gray-100 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order Receipt</span>
                    <h2 className="text-base font-bold text-gray-900 font-mono">#{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={14} /> Print
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {loadingDetails || !orderDetails ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader className="animate-spin text-[#009FE3] mb-2" size={32} />
                    <p className="text-xs text-gray-500 font-semibold">Loading receipt details...</p>
                  </div>
                ) : (
                  <>
                    {/* Status & Payment Header Banner */}
                    {(() => {
                      const pClass = getPaymentClassification(orderDetails.payment_status, orderDetails.payment_method, orderDetails.order_status);
                      const PIcon = pClass.icon;

                      return (
                        <div className={`p-4 rounded-2xl border ${pClass.badgeClass} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pClass.bgClass}`}>
                              <PIcon size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-wider">Payment: {pClass.label}</p>
                              <p className="text-[11px] opacity-80 mt-0.5">Method: {orderDetails.payment_method || 'Online'} • Placed: {format(new Date(orderDetails.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Manual Payment Status Toggle */}
                            <select
                              value={orderDetails.payment_status || 'pending'}
                              onChange={e => handleUpdatePaymentStatus(orderDetails.id, e.target.value)}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-800 outline-none cursor-pointer"
                            >
                              <option value="paid">🟢 Mark Paid</option>
                              <option value="cod_pending">🟡 Mark COD</option>
                              <option value="cancelled">🔴 Mark Cancelled / Unpaid</option>
                            </select>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Customer Contact & Shipping Block */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#009FE3]/10 text-[#009FE3] font-bold flex items-center justify-center">
                            {orderDetails.shipping_address?.fullName?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{orderDetails.shipping_address?.fullName || 'Guest Customer'}</h4>
                            <p className="text-xs text-gray-500">{orderDetails.shipping_address?.email || 'N/A'}</p>
                          </div>
                        </div>

                        {/* Direct Contact Actions */}
                        <div className="flex items-center gap-2">
                          {orderDetails.shipping_address?.phone && (
                            <>
                              <a
                                href={`https://wa.me/91${orderDetails.shipping_address.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(orderDetails.shipping_address.fullName || '')},%20regarding%20your%20TOPSUN%20order%20#${encodeURIComponent(orderDetails.order_number || orderDetails.id.slice(0, 8))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <MessageSquare size={13} /> WhatsApp
                              </a>
                              <a
                                href={`tel:${orderDetails.shipping_address.phone}`}
                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <Phone size={13} /> Call
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delivery Address */}
                      <div className="pt-3 text-xs text-gray-700 leading-relaxed">
                        <p className="font-bold text-gray-900 uppercase tracking-wider text-[10px] mb-1">Delivery Address:</p>
                        <p>{orderDetails.shipping_address?.addressLine1 || orderDetails.shipping_address?.address || 'N/A'}</p>
                        {orderDetails.shipping_address?.addressLine2 && <p>{orderDetails.shipping_address.addressLine2}</p>}
                        <p>{orderDetails.shipping_address?.city}, {orderDetails.shipping_address?.state} - {orderDetails.shipping_address?.postalCode || orderDetails.shipping_address?.pincode}</p>
                        <p className="font-semibold text-gray-500 mt-1">Phone: {orderDetails.shipping_address?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Itemized Products in Order */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200/80 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordered Items</span>
                        <span className="text-xs text-gray-500 font-semibold">{orderDetails.items?.length || 1} Item(s)</span>
                      </div>

                      <div className="divide-y divide-gray-100 p-4 space-y-3">
                        {orderDetails.items && orderDetails.items.length > 0 ? (
                          orderDetails.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-xs pt-2 first:pt-0">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200/60 p-1 flex items-center justify-center flex-shrink-0">
                                  <Package size={16} className="text-gray-400" />
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{item.product_name || item.name || `Product #${item.product_id || (i + 1)}`}</p>
                                  <p className="text-gray-500 mt-0.5">Qty: {item.quantity || 1} • Size: {item.size || 'Standard'}</p>
                                </div>
                              </div>
                              <p className="font-black text-gray-900 text-sm">
                                ₹{(((item.price || item.unit_price || 0) * (item.quantity || 1)) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-gray-900">Custom Order Package</p>
                              <p className="text-gray-500">Qty: 1</p>
                            </div>
                            <p className="font-black text-gray-900 text-sm">
                              ₹{((orderDetails.total_amount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}

                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-sm">Total Amount</span>
                          <span className="text-xl font-black text-[#009FE3]">
                            ₹{((orderDetails.total_amount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Fulfillment Status Actions */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-gray-900">Update Order Status</p>
                        <p className="text-[11px] text-gray-500">Change progress for customer tracking</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                          <button
                            key={st}
                            onClick={() => handleUpdateOrderStatus(orderDetails.id, st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                              orderDetails.order_status === st
                                ? 'bg-gray-900 text-white shadow-xs'
                                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                  </>
                )}
              </div>

            </motion.div>
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
