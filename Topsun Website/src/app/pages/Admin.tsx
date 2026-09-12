import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ShieldCheck, Tag, ExternalLink, Printer, SlidersHorizontal,
  Bell, Volume2, VolumeX, Sparkles, Send, FileText, Percent, AlertTriangle
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
import { openInvoicePrintWindow } from '@/app/utils/invoiceGenerator';
import { getTrackedCarts, markCartAsRecovered, AbandonedCartSession } from '@/app/utils/cartTracker';
import { EMAIL_TEMPLATES, fillEmailTemplate, openMailClient, openWhatsAppChat, RecoveryEmailTemplate, sendServerEmail, SENDER_EMAIL } from '@/app/utils/emailService';
import { getProductOffers, saveProductOffer, saveAllProductOffers, resetAllProductOffers, calculateShoePrice, ProductOffersMap, ShoeOffer } from '@/app/utils/productOffers';

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

export interface AdminNotification {
  id: string;
  type: 'order' | 'payment_paid' | 'payment_cod' | 'payment_unpaid' | 'cart_abandoned';
  title: string;
  subtitle: string;
  timestamp: string;
  orderId?: string;
  isRead: boolean;
}

// ── Payment Status Categorizer (Strict Green = Paid, Red = Not Paid, Yellow = COD) ──
export function getPaymentClassification(paymentStatus?: string, paymentMethod?: string, orderStatus?: string) {
  const pStatus = (paymentStatus || '').toLowerCase().trim();
  const pMethod = (paymentMethod || '').toLowerCase().trim();
  const oStatus = (orderStatus || '').toLowerCase().trim();

  // Cancelled, Failed, or Unpaid -> Red
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
      label: 'Not Paid',
      color: 'red',
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
      badgeClass: 'bg-rose-100 text-rose-800 border border-rose-300 font-extrabold',
      dotClass: 'bg-rose-500',
      icon: XCircle,
    };
  }

  // Cash on Delivery -> Yellow
  if (
    pStatus === 'cod_pending' ||
    pStatus === 'cod' ||
    pMethod === 'cod' ||
    pMethod === 'cash on delivery' ||
    pStatus === 'pending_cod'
  ) {
    return {
      type: 'cod' as const,
      label: 'COD',
      color: 'yellow',
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold',
      dotClass: 'bg-amber-500',
      icon: Clock,
    };
  }

  // Prepaid / Completed -> Green
  return {
    type: 'paid' as const,
    label: 'Paid',
    color: 'green',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold',
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

  // Notifications State & Sound Chime
  const [showNotifications, setShowNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('topsun_read_notifs') || '[]'); } catch { return []; }
  });
  const prevOrdersCountRef = useRef<number>(0);

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {}
  };

  // Abandoned Carts & Customer Management State
  const [customerSubTab, setCustomerSubTab] = useState<'all' | 'abandoned'>('all');
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartSession[]>([]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [selectedRecoverySession, setSelectedRecoverySession] = useState<{
    customerName: string;
    email?: string;
    phone?: string;
    itemsSummary: string;
    itemCount: number;
    cartTotal: number;
  } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(EMAIL_TEMPLATES[0].id);
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [sendingDirectEmail, setSendingDirectEmail] = useState<boolean>(false);

  // Product Offers State
  const [productOffers, setProductOffers] = useState<ProductOffersMap>(getProductOffers);
  const [savingOffers, setSavingOffers] = useState(false);

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
  const [broadcastingBanner, setBroadcastingBanner] = useState(false);
  const [lastBroadcastCount, setLastBroadcastCount] = useState(0);

  // Bulk discount for "Select All" in Shoe Offers
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(20);

  useEffect(() => {
    fetchData();
    // Auto-refresh orders every 30 seconds for live order & payment updates
    const timer = setInterval(() => {
      fetchData(false);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (showLoadingSpinner: boolean = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: allOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      const fetchedOrders = (allOrders || []) as DBOrder[];

      // Check for new orders to trigger chime & alert
      if (prevOrdersCountRef.current > 0 && fetchedOrders.length > prevOrdersCountRef.current) {
        const newCount = fetchedOrders.length - prevOrdersCountRef.current;
        playNotificationSound();
        toast.success(`🎉 ${newCount} New Order${newCount > 1 ? 's' : ''} Received!`, {
          description: `Order #${fetchedOrders[0].order_number || fetchedOrders[0].id.slice(0, 8)} placed recently.`,
        });
      }
      prevOrdersCountRef.current = fetchedOrders.length;
      setOrders(fetchedOrders);

      // Refresh tracked carts
      setAbandonedCarts(getTrackedCarts());
      // Refresh product offers from Supabase (remote source of truth)
      const { fetchRemoteProductOffers } = await import('@/app/utils/productOffers');
      const remoteOffers = await fetchRemoteProductOffers();
      if (remoteOffers) setProductOffers(remoteOffers);
      else setProductOffers(getProductOffers());

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

  // ── Save Sales Banner + Broadcast to All Customers ───────────────────────
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBanner(true);
    try {
      const updated: SalesBannerConfig = {
        title: bannerTitle.trim() || 'Comfort Rush Deals',
        highlightText: bannerSubtitle.trim() || 'Ends In:',
        targetDate: new Date(bannerTargetDate).toISOString(),
        enabled: bannerEnabled,
      };
      const saved = await saveSalesBannerSettings(updated);
      setBannerConfig(updated);
      if (!saved) toast.warning('Saved locally — Supabase sync may be unavailable.');
      toast.success('Sales offer & countdown updated successfully across website!');

      // ── Broadcast to all customers if banner is enabled ───────────────────
      if (updated.enabled) {
        setBroadcastingBanner(true);
        const offerEndDate = new Date(updated.targetDate).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric',
        });
        const campaignTitle = updated.title;
        const campaignSubtext = updated.highlightText;

        // Collect unique customers from orders
        const emailsSent = new Set<string>();
        const phonesToBroadcast: string[] = [];
        let dispatchCount = 0;

        for (const order of orders) {
          const addr = order.shipping_address || {};
          const email = addr.email || '';
          const phone = addr.phone || '';
          const name = addr.fullName || 'Valued Customer';

          // Send email to unique addresses
          if (email && email.includes('@') && !emailsSent.has(email)) {
            emailsSent.add(email);
            const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${campaignTitle}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 12px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e4e4e7;box-shadow:0 8px 32px rgba(0,0,0,0.08);">
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#009FE3 0%,#0077B6 100%);padding:28px 32px;text-align:center;">
          <p style="margin:0 0 6px;color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">TOPSUN Performance Footwear</p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">${campaignTitle}</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:600;">${campaignSubtext}</p>
        </td>
      </tr>
      <!-- Countdown Badge -->
      <tr>
        <td style="padding:0;">
          <div style="background:#FFF9EC;border-bottom:2px dashed #FCD34D;padding:14px 32px;text-align:center;">
            <p style="margin:0;color:#92400E;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">⚡ Sale Ends: ${offerEndDate}</p>
          </div>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td style="padding:32px 32px 24px;">
          <p style="margin:0 0 16px;color:#18181b;font-size:16px;font-weight:700;">Hi ${name},</p>
          <p style="margin:0 0 16px;color:#374151;font-size:14px;line-height:1.75;">We are excited to announce our latest campaign <strong style="color:#009FE3;">${campaignTitle}</strong> is now LIVE on the TOPSUN store!</p>
          <p style="margin:0 0 24px;color:#374151;font-size:14px;line-height:1.75;">Shop our complete collection of lightweight running shoes, casual sneakers, and performance footwear — all crafted with honeycomb grip soles, breathable mesh uppers, and cloud cushioning technology.</p>
          <!-- Features Grid -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td width="33%" style="text-align:center;padding:12px 8px;background:#F0FDF4;border-radius:12px;margin:4px;">
                <p style="margin:0;font-size:18px;">🚚</p>
                <p style="margin:4px 0 0;color:#166534;font-size:11px;font-weight:700;">Free Delivery<br/>Pan India</p>
              </td>
              <td width="2%"></td>
              <td width="31%" style="text-align:center;padding:12px 8px;background:#EFF6FF;border-radius:12px;">
                <p style="margin:0;font-size:18px;">💎</p>
                <p style="margin:4px 0 0;color:#1D4ED8;font-size:11px;font-weight:700;">Premium Quality<br/>Handcrafted</p>
              </td>
              <td width="2%"></td>
              <td width="32%" style="text-align:center;padding:12px 8px;background:#FFF7ED;border-radius:12px;">
                <p style="margin:0;font-size:18px;">↩️</p>
                <p style="margin:4px 0 0;color:#9A3412;font-size:11px;font-weight:700;">7-Day Easy<br/>Returns</p>
              </td>
            </tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="https://topsun.in/shop" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#009FE3,#0077B6);color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.5px;text-transform:uppercase;">Shop Now →</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td style="background:#fafafa;padding:20px 32px;border-top:1px solid #e4e4e7;text-align:center;font-size:11px;color:#71717a;line-height:1.6;">
          <p style="margin:0 0 4px;font-weight:700;color:#27272a;">INTELAGROW PVT. LTD. · TOPSUN Footwear</p>
          <p style="margin:0 0 4px;">A/90 NSB Road, Raniganj, Paschim Bardhaman – 713358, West Bengal</p>
          <p style="margin:0;">WhatsApp: +91 7485006659 · <a href="https://topsun.in" style="color:#009FE3;">topsun.in</a></p>
          <p style="margin:8px 0 0;color:#a1a1aa;font-size:10px;">You received this email as a TOPSUN customer. Sent from noreply@topsun.in</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

            try {
              await sendServerEmail({
                to: email,
                subject: `🔥 ${campaignTitle} – TOPSUN Performance Footwear`,
                body: htmlBody,
                customer_name: name,
                type: 'sale_alert',
              });
              dispatchCount++;
            } catch {}
          }

          // Collect unique phones for WhatsApp
          if (phone && phone !== 'N/A' && phone.length >= 10) {
            const clean = phone.replace(/\D/g, '');
            const full = clean.startsWith('91') ? clean : `91${clean.slice(-10)}`;
            if (!phonesToBroadcast.includes(full)) {
              phonesToBroadcast.push(full);
            }
          }
        }

        setLastBroadcastCount(dispatchCount);

        // Open WhatsApp broadcast message (first customer or general)
        if (phonesToBroadcast.length > 0) {
          const waMsg = encodeURIComponent(
            `🎉 *${campaignTitle}* is LIVE on TOPSUN!\n\n` +
            `${campaignSubtext}\n\n` +
            `⚡ Shop Now: https://topsun.in/shop\n\n` +
            `🚚 Free Delivery across India\n💎 Premium Quality Footwear\n↩️ 7-Day Easy Returns\n\n` +
            `*Offer ends: ${offerEndDate}*\n\n` +
            `– Team TOPSUN Footwear`
          );
          // Open WhatsApp for the first number as a sample; admin can copy message
          window.open(`https://wa.me/?text=${waMsg}`, '_blank');
        }

        toast.success(
          `📢 Broadcast sent! ${dispatchCount} email${dispatchCount !== 1 ? 's' : ''} dispatched + WhatsApp message prepared.`,
          { duration: 6000 }
        );
        setBroadcastingBanner(false);
      }
    } catch (err: any) {
      toast.error('Failed to update banner: ' + err.message);
      setBroadcastingBanner(false);
    } finally {
      setSavingBanner(false);
    }
  };

  // ── Preset Date for Sales Banner ────────────────────────────────────────
  const setBannerPresetHours = (hours: number) => {
    const target = new Date(Date.now() + hours * 3600 * 1000);
    setBannerTargetDate(target.toISOString().slice(0, 16));
  };

  // ── Real-Time Notifications Feed ─────────────────────────────────────────
  const notifications = useMemo<AdminNotification[]>(() => {
    const list: AdminNotification[] = [];

    // Order & Payment notifications
    orders.forEach(o => {
      const pClass = getPaymentClassification(o.payment_status, o.payment_method, o.order_status);
      const name = o.shipping_address?.fullName || 'Customer';
      const orderNum = o.order_number || o.id.slice(0, 8);
      const amount = `₹${((o.total_amount || 0) / 100).toLocaleString('en-IN')}`;

      if (pClass.type === 'paid') {
        list.push({
          id: `notif_paid_${o.id}`,
          type: 'payment_paid',
          title: `Prepaid Order Paid (${amount})`,
          subtitle: `${name} paid for order #${orderNum} via ${o.payment_method?.toUpperCase() || 'ONLINE'}`,
          timestamp: o.created_at,
          orderId: o.id,
          isRead: readNotifIds.includes(`notif_paid_${o.id}`),
        });
      } else if (pClass.type === 'cod') {
        list.push({
          id: `notif_cod_${o.id}`,
          type: 'payment_cod',
          title: `New COD Order Placed (${amount})`,
          subtitle: `${name} placed Cash on Delivery order #${orderNum}`,
          timestamp: o.created_at,
          orderId: o.id,
          isRead: readNotifIds.includes(`notif_cod_${o.id}`),
        });
      } else {
        list.push({
          id: `notif_unpaid_${o.id}`,
          type: 'payment_unpaid',
          title: `Payment Not Paid / Failed (${amount})`,
          subtitle: `Order #${orderNum} by ${name} marked as unpaid or failed`,
          timestamp: o.created_at,
          orderId: o.id,
          isRead: readNotifIds.includes(`notif_unpaid_${o.id}`),
        });
      }
    });

    // Cart Abandonment notifications
    abandonedCarts.forEach(c => {
      list.push({
        id: `notif_cart_${c.id}`,
        type: 'cart_abandoned',
        title: `Cart Abandoned (₹${c.totalAmount.toLocaleString('en-IN')})`,
        subtitle: `${c.customerName} left ${c.items.length} item(s) in cart at ${c.stage}`,
        timestamp: c.lastActive,
        isRead: readNotifIds.includes(`notif_cart_${c.id}`),
      });
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [orders, abandonedCarts, readNotifIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const markAllNotificationsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    try { localStorage.setItem('topsun_read_notifs', JSON.stringify(allIds)); } catch {}
  };

  const markSingleNotificationRead = (id: string) => {
    if (readNotifIds.includes(id)) return;
    const updated = [...readNotifIds, id];
    setReadNotifIds(updated);
    try { localStorage.setItem('topsun_read_notifs', JSON.stringify(updated)); } catch {}
  };

  // ── Recovery Message Handlers ──────────────────────────────────────────
  const handleOpenRecoveryModal = (data: {
    customerName: string;
    email?: string;
    phone?: string;
    itemsSummary: string;
    itemCount: number;
    cartTotal: number;
  }) => {
    setSelectedRecoverySession(data);
    const tmpl = EMAIL_TEMPLATES[0];
    setSelectedTemplateId(tmpl.id);
    const filled = fillEmailTemplate(tmpl, data);
    setCustomSubject(filled.subject);
    setCustomBody(filled.body);
    setShowRecoveryModal(true);
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = EMAIL_TEMPLATES.find(t => t.id === templateId) || EMAIL_TEMPLATES[0];
    if (selectedRecoverySession) {
      const filled = fillEmailTemplate(tmpl, selectedRecoverySession);
      setCustomSubject(filled.subject);
      setCustomBody(filled.body);
    }
  };

  const handleSendRecoveryEmail = () => {
    if (!selectedRecoverySession?.email || selectedRecoverySession.email === 'N/A') {
      toast.error('No customer email address on file.');
      return;
    }
    openMailClient(selectedRecoverySession.email, customSubject, customBody);
    toast.success(`Prepared recovery email for ${selectedRecoverySession.email}`);
  };

  const handleSendDirectServerEmail = async () => {
    if (!selectedRecoverySession?.email || selectedRecoverySession.email === 'N/A') {
      toast.error('No customer email address on file.');
      return;
    }
    setSendingDirectEmail(true);
    try {
      const res = await sendServerEmail({
        to: selectedRecoverySession.email,
        subject: customSubject,
        body: customBody,
        customer_name: selectedRecoverySession.customerName,
        type: 'cart_recovery',
      });

      if (res.success) {
        toast.success(`Email dispatched from ${SENDER_EMAIL} to ${selectedRecoverySession.email}`);
        setShowRecoveryModal(false);
      } else {
        toast.error(`Hostinger server: ${res.error || 'Opening mail client instead'}`);
        openMailClient(selectedRecoverySession.email, customSubject, customBody);
      }
    } catch (err: any) {
      toast.error('Failed to dispatch email: ' + err.message);
      openMailClient(selectedRecoverySession.email, customSubject, customBody);
    } finally {
      setSendingDirectEmail(false);
    }
  };

  const handleSendRecoveryWhatsApp = () => {
    if (!selectedRecoverySession?.phone || selectedRecoverySession.phone === 'N/A') {
      toast.error('No customer mobile number on file.');
      return;
    }
    openWhatsAppChat(selectedRecoverySession.phone, `${customSubject}\n\n${customBody}`);
    toast.success(`Opened WhatsApp chat for +91 ${selectedRecoverySession.phone}`);
  };

  // ── Product Offers Handlers ─────────────────────────────────────────────
  const handleUpdateShoeOffer = (shoeId: number, partial: Partial<ShoeOffer>) => {
    setProductOffers(prev => ({
      ...prev,
      [shoeId]: {
        ...prev[shoeId],
        ...partial,
        shoeId,
      },
    }));
  };

  const handleSaveShoeOffers = async () => {
    setSavingOffers(true);
    try {
      const saved = await saveAllProductOffers(productOffers);
      if (saved) {
        toast.success('✅ Shoe offers saved & broadcasted storewide in real-time!');
      } else {
        toast.success('Shoe offers saved locally (Supabase sync may be unavailable)');
      }
    } catch (err: any) {
      toast.error('Failed to save offers: ' + err.message);
    } finally {
      setSavingOffers(false);
    }
  };

  const handleResetShoeOffers = async () => {
    await resetAllProductOffers();
    setProductOffers(getProductOffers());
    toast.success('All shoes reset to their original selling prices!');
  };

  // ── Select All Shoes — Apply Bulk Discount ────────────────────────────────
  const handleSelectAllShoes = (pct: number) => {
    const updated: ProductOffersMap = {};
    PRODUCTS.forEach(p => {
      updated[p.id] = {
        shoeId: p.id,
        discountPercent: pct,
        enabled: pct > 0,
        customPrice: undefined,
      };
    });
    setProductOffers(updated);
    toast.success(`All ${PRODUCTS.length} shoes set to ${pct}% OFF from original price!`);
  };

  // ── Toggle Enabled on All Shoes ────────────────────────────────────────────
  const handleToggleAllShoes = (enabled: boolean) => {
    setProductOffers(prev => {
      const updated: ProductOffersMap = {};
      PRODUCTS.forEach(p => {
        updated[p.id] = { ...(prev[p.id] || { shoeId: p.id, discountPercent: 0 }), shoeId: p.id, enabled };
      });
      return updated;
    });
    toast.success(enabled ? `All ${PRODUCTS.length} shoes offers ENABLED` : `All ${PRODUCTS.length} shoes offers DISABLED`);
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
            {/* Real-time Notifications Bell with Badge & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  showNotifications
                    ? 'bg-[#009FE3] text-white border-[#009FE3]'
                    : 'text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
                title="Notifications"
              >
                <Bell size={16} className={unreadCount > 0 ? 'text-amber-500 animate-bounce' : ''} />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center -ml-0.5 sm:ml-0.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                  >
                    <div className="p-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#009FE3]" />
                        <span className="text-xs font-bold text-gray-900">Live Alerts ({notifications.length})</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 font-bold rounded-md">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            soundEnabled ? 'text-emerald-700 bg-emerald-50' : 'text-gray-400 bg-gray-100'
                          }`}
                          title={soundEnabled ? 'Order sound alert ON' : 'Order sound alert muted'}
                        >
                          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        </button>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[11px] text-[#009FE3] hover:underline font-bold"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 text-xs">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <CheckCircle2 size={24} className="mx-auto text-gray-300 mb-1" />
                          No new notifications
                        </div>
                      ) : (
                        notifications.slice(0, 30).map(n => {
                          const isPaid = n.type === 'payment_paid';
                          const isCod = n.type === 'payment_cod';
                          const isCart = n.type === 'cart_abandoned';
                          const isUnpaid = n.type === 'payment_unpaid';

                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                markSingleNotificationRead(n.id);
                                if (n.orderId) {
                                  const ord = orders.find(o => o.id === n.orderId);
                                  if (ord) viewReceipt(ord);
                                  setShowNotifications(false);
                                } else if (isCart) {
                                  setActiveTab('customers');
                                  setCustomerSubTab('abandoned');
                                  setShowNotifications(false);
                                }
                              }}
                              className={`p-3 transition-colors cursor-pointer hover:bg-gray-50 flex items-start gap-2.5 ${
                                !n.isRead ? 'bg-blue-50/40' : ''
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isPaid && (
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                                    ✓
                                  </div>
                                )}
                                {isCod && (
                                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                                    COD
                                  </div>
                                )}
                                {isUnpaid && (
                                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[10px]">
                                    ✕
                                  </div>
                                )}
                                {isCart && (
                                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                    🛒
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-bold text-gray-900 truncate text-xs">{n.title}</p>
                                  <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                                    {format(new Date(n.timestamp), 'hh:mm a')}
                                  </span>
                                </div>
                                <p className="text-gray-600 text-[11px] leading-snug mt-0.5 line-clamp-2">{n.subtitle}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => fetchData(true)}
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
                          onClick={() => openInvoicePrintWindow(o)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                          title="Download GST Invoice"
                        >
                          <Download size={12} /> Invoice
                        </button>

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

                          {/* Invoice Download Button */}
                          <button
                            onClick={() => openInvoicePrintWindow(o)}
                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                            title="Download/Print GST Tax Invoice"
                          >
                            <Download size={13} />
                            <span>Invoice</span>
                          </button>

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
            
            {/* Header / Sub-Tab Switcher & Search */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCustomerSubTab('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      customerSubTab === 'all'
                        ? 'bg-[#121518] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All Customers ({users.length})
                  </button>
                  <button
                    onClick={() => setCustomerSubTab('abandoned')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      customerSubTab === 'abandoned'
                        ? 'bg-[#009FE3] text-white shadow-xs'
                        : 'bg-blue-50 text-[#009FE3] hover:bg-blue-100'
                    }`}
                  >
                    <span>🛒 Abandoned Carts</span>
                    <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                      {abandonedCarts.length}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  {customerSubTab === 'all'
                    ? 'Registered customers and verified buyers directory'
                    : 'Shoppers who added shoes to cart or left during checkout'}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search name, phone, or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#009FE3] outline-none"
                />
              </div>
            </div>

            {/* Sub-Tab 1: All Registered Customers */}
            {customerSubTab === 'all' && (
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
                            <h4 className="font-bold text-gray-900 text-sm truncate">{u.full_name || 'Customer'}</h4>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.provider === 'google' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#009FE3]'
                            }`}>
                              {u.provider === 'google' ? 'Google Auth' : 'Phone / Email'}
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

                      <div className="mt-4 pt-2 flex items-center justify-between gap-2 border-t border-gray-100 text-xs">
                        <button
                          onClick={() => handleOpenRecoveryModal({
                            customerName: u.full_name || 'Customer',
                            email: u.email !== 'N/A' ? u.email : undefined,
                            phone: u.phone !== 'N/A' ? u.phone : undefined,
                            itemsSummary: 'TOPSUN footwear collection',
                            itemCount: 1,
                            cartTotal: 4000,
                          })}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#009FE3] rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Send size={12} /> Send Offer
                        </button>

                        <div className="flex items-center gap-2">
                          {u.phone && u.phone !== 'N/A' && (
                            <a
                              href={`https://wa.me/91${u.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 p-1"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          )}
                          {u.email && u.email !== 'N/A' && (
                            <a
                              href={`mailto:${u.email}`}
                              className="text-gray-600 hover:text-gray-900 font-bold flex items-center gap-1 p-1"
                              title="Send Email"
                            >
                              <Mail size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Sub-Tab 2: Abandoned Carts & Checkout Drop-offs */}
            {customerSubTab === 'abandoned' && (
              <div className="space-y-3">
                {abandonedCarts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      ✓
                    </div>
                    <h4 className="font-bold text-gray-900 text-base">No Abandoned Carts Detected</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      All shoppers who added items have completed their orders, or no pending sessions are active.
                    </p>
                  </div>
                ) : (
                  abandonedCarts.map(cartSession => {
                    const itemsSummary = cartSession.items.map(i => `${i.name} (UK ${i.size})`).join(', ');

                    return (
                      <div
                        key={cartSession.id}
                        className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
                              🛒
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-gray-900 text-sm">{cartSession.customerName}</h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                                  Left at {cartSession.stage === 'cart' ? 'Cart Drawer' : 'Checkout Form'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                                <span>{cartSession.email || 'Email not provided'}</span>
                                {cartSession.phone && <span>• Phone: +91 {cartSession.phone}</span>}
                                <span>• Last Active: {format(new Date(cartSession.lastActive), 'MMM dd, hh:mm a')}</span>
                              </div>

                              {/* Items preview in cart */}
                              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                {cartSession.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs"
                                  >
                                    <span className="font-bold text-gray-800">{item.name}</span>
                                    <span className="text-gray-500 text-[10px]">(UK {item.size} • Qty {item.quantity})</span>
                                    <span className="font-bold text-[#009FE3] ml-1">₹{item.price.toLocaleString('en-IN')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-bold uppercase">Cart Value</p>
                              <p className="text-base sm:text-lg font-black text-gray-900">
                                ₹{cartSession.totalAmount.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <button
                              onClick={() => handleOpenRecoveryModal({
                                customerName: cartSession.customerName,
                                email: cartSession.email,
                                phone: cartSession.phone,
                                itemsSummary,
                                itemCount: cartSession.items.reduce((a, b) => a + (b.quantity || 1), 0),
                                cartTotal: cartSession.totalAmount,
                              })}
                              className="px-4 py-2 bg-[#009FE3] hover:bg-[#008bc5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
                            >
                              <Send size={13} />
                              <span>Send Recovery Message</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: PRODUCTS & PROMOTIONAL OFFER MANAGER                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#009FE3]" /> Shoe Offers & Pricing Manager ({PRODUCTS.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                    Set discounts on any shoe. All discounts are calculated <strong>strictly from each shoe's Original Price</strong>, not from previously discounted prices.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleResetShoeOffers}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reset to Original Prices
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveShoeOffers}
                    disabled={savingOffers}
                    className="px-5 py-2 bg-[#009FE3] hover:bg-[#008bc5] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
                  >
                    <Check size={14} />
                    <span>{savingOffers ? 'Saving...' : 'Save & Broadcast Offers'}</span>
                  </button>
                </div>
              </div>

              {/* ── Select All / Bulk Discount Row ── */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 shrink-0">
                  <Sparkles size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-gray-700">Bulk Apply to ALL Shoes:</span>
                </div>

                {/* Discount % presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[10, 15, 20, 25, 30, 40, 50].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setBulkDiscountPercent(pct)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        bulkDiscountPercent === pct
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleSelectAllShoes(bulkDiscountPercent)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    <Percent size={13} />
                    Select All · {bulkDiscountPercent}% OFF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllShoes(true)}
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
                  >
                    Enable All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAllShoes(false)}
                    className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
                  >
                    Disable All
                  </button>
                </div>
              </div>
            </div>

            {/* Products Offers Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRODUCTS.map(p => {
                const original = p.originalPrice || 4000;
                const offer = productOffers[p.id] || { shoeId: p.id, discountPercent: 0, enabled: false };
                const calc = calculateShoePrice(original, offer);

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                      offer.enabled ? 'border-[#009FE3] ring-2 ring-[#009FE3]/15' : 'border-gray-200/80'
                    }`}
                  >
                    <div>
                      {/* Product Header */}
                      <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gray-50 p-2 border border-gray-100 flex items-center justify-center shrink-0">
                          <img src={p.images?.[0]} alt={p.name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#009FE3] bg-[#009FE3]/10 px-2 py-0.5 rounded-md">
                            {p.category}
                          </span>
                          <h4 className="font-bold text-gray-900 text-sm mt-1 truncate">{p.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Original Base: <strong className="text-gray-800">₹{original.toLocaleString('en-IN')}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Offer Configuration Form */}
                      <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                        
                        {/* Offer Toggle Switch */}
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-gray-700 flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={offer.enabled}
                              onChange={e => handleUpdateShoeOffer(p.id, { enabled: e.target.checked })}
                              className="w-4 h-4 rounded text-[#009FE3] cursor-pointer"
                            />
                            <span>Active Promotional Offer</span>
                          </label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            offer.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {offer.enabled ? 'ON' : 'OFF'}
                          </span>
                        </div>

                        {/* Discount Percent Presets */}
                        <div>
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                            Discount From Original (₹{original})
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[10, 20, 30, 40, 50, 60].map(pct => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleUpdateShoeOffer(p.id, { discountPercent: pct, enabled: true, customPrice: undefined })}
                                className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                  offer.discountPercent === pct && !offer.customPrice
                                    ? 'bg-[#009FE3] text-white border-[#009FE3]'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {pct}% OFF
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Override Price or Percent Input */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Custom %</label>
                            <input
                              type="number"
                              min="0"
                              max="90"
                              value={offer.discountPercent || ''}
                              placeholder="0%"
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                handleUpdateShoeOffer(p.id, { discountPercent: val, enabled: val > 0, customPrice: undefined });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-[#009FE3]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Direct ₹ Price</label>
                            <input
                              type="number"
                              min="500"
                              max={original}
                              value={offer.customPrice || ''}
                              placeholder={`< ₹${original}`}
                              onChange={e => {
                                const val = parseInt(e.target.value) || undefined;
                                handleUpdateShoeOffer(p.id, { customPrice: val, enabled: !!val });
                              }}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-[#009FE3]"
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Calculated Price Result Banner */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Store Selling Price</p>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-gray-900">
                            ₹{calc.price.toLocaleString('en-IN')}
                          </span>
                          {calc.hasOffer && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{original.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {calc.hasOffer ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {calc.badge}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                          Regular Price
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: TOP OFFER BANNER & COUNTDOWN CONFIGURATOR                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'marketing' && (
          <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Currently Live on Website Status Panel ─────────────────────── */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-extrabold text-emerald-900 uppercase tracking-wider">Currently Live on Website</h3>
                <span className="ml-auto text-[10px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-100 rounded-full border border-emerald-200">Real-Time from Supabase</span>
              </div>

              {/* Live Banner Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-white rounded-xl p-3.5 border border-emerald-100 shadow-xs">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1"><Tag size={10} /> Live Offer Banner</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-2 h-2 rounded-full ${bannerConfig.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-xs font-bold text-gray-900">{bannerConfig.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${bannerConfig.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                      {bannerConfig.enabled ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Ends: <strong>{new Date(bannerConfig.targetDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-emerald-100 shadow-xs">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1"><Percent size={10} /> Active Price Discounts</p>
                  {(() => {
                    const activeOffers = PRODUCTS.filter(p => {
                      const o = productOffers[p.id];
                      return o?.enabled && (o.discountPercent || o.customPrice);
                    });
                    return activeOffers.length === 0 ? (
                      <p className="text-xs text-gray-400 font-medium">No active discounts — all products at regular price</p>
                    ) : (
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {activeOffers.map(p => {
                          const o = productOffers[p.id];
                          const calc = calculateShoePrice(p.originalPrice || p.price, o);
                          return (
                            <div key={p.id} className="flex items-center justify-between text-[11px]">
                              <span className="text-gray-700 font-medium truncate max-w-[140px]">{p.name}</span>
                              <span className="font-black text-emerald-800 shrink-0">₹{calc.price.toLocaleString('en-IN')} <span className="text-emerald-600 font-bold">({calc.badge})</span></span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 font-medium">
                ✅ Changes saved here update <strong>all website pages instantly</strong> via Supabase Realtime — no refresh needed for visitors.
              </p>
            </div>


            <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Tag size={18} className="text-[#009FE3]" /> Top Offer Announcement & Countdown Timer
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage the promotional offer banner and synchronized countdown clock shown at the very top of every website page.
                  </p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${bannerEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600'}`}>
                  {bannerEnabled ? '● ACTIVE LIVE' : '○ DISABLED'}
                </span>
              </div>

              {/* Live Preview Box */}
              <div className="mb-6 p-4 rounded-xl bg-[#009FE3] text-white shadow-xs">
                <p className="text-[10px] uppercase font-bold tracking-widest text-white/80 mb-1">Live Storefront Preview</p>
                <div className="flex items-center justify-between gap-3 text-xs font-bold flex-wrap">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
                    <span>{bannerTitle || 'Comfort Rush Deals'} {bannerSubtitle || 'Ends In:'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-zinc-900">
                    <span className="bg-white px-2 py-0.5 rounded text-[11px] font-bold">01 Day</span>
                    <span className="text-white">:</span>
                    <span className="bg-white px-2 py-0.5 rounded text-[11px] font-bold">12 Hrs</span>
                    <span className="text-white">:</span>
                    <span className="bg-white px-2 py-0.5 rounded text-[11px] font-bold">30 Min</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveBanner} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Offer Campaign Title</label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. Comfort Rush Deals, Mega Diwali Sale, Weekend Sprint"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Highlight Subtext / Offer</label>
                    <input
                      type="text"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="e.g. Ends In:, Flat 50% OFF Ends In:"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Countdown Target Date & Time</label>
                    <input
                      type="datetime-local"
                      value={bannerTargetDate}
                      onChange={(e) => setBannerTargetDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#009FE3] focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quick Timer Presets</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setBannerPresetHours(24)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      +24 Hours (Tomorrow)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPresetHours(48)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      +48 Hours (2 Days)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPresetHours(72)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPresetHours(168)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      +7 Days (1 Week)
                    </button>
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
                    <span className="text-xs font-bold text-gray-700">Display top banner on store header</span>
                  </label>

                  <button
                    type="submit"
                    disabled={savingBanner || broadcastingBanner}
                    className="px-6 py-2.5 bg-[#009FE3] hover:bg-[#0088c4] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
                  >
                    {broadcastingBanner ? (
                      <><Loader size={14} className="animate-spin" /><span>Broadcasting...</span></>
                    ) : savingBanner ? (
                      <><Loader size={14} className="animate-spin" /><span>Saving...</span></>
                    ) : (
                      <><Send size={14} /><span>Save & Broadcast to Customers</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Broadcast Info Card ── */}
            <div className="bg-gradient-to-br from-[#009FE3]/8 via-white to-emerald-50/60 rounded-2xl p-5 border border-[#009FE3]/20 shadow-xs">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Mail size={15} className="text-[#009FE3]" />
                What happens when you publish the banner?
              </h4>
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#009FE3]/15 text-[#009FE3] flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <p>A <strong>professional HTML sale announcement email</strong> is dispatched from <code className="bg-gray-100 px-1 rounded text-[10px]">noreply@topsun.in</code> to every unique customer email in your order history.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <p>A pre-filled <strong>WhatsApp broadcast message</strong> opens in a new tab so you can paste and send to your contact lists instantly.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <p>The banner goes <strong>live sitewide</strong> with the countdown timer you've configured.</p>
                </div>
              </div>
              {lastBroadcastCount > 0 && (
                <div className="mt-4 pt-3 border-t border-[#009FE3]/15 flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Last broadcast: {lastBroadcastCount} email{lastBroadcastCount !== 1 ? 's' : ''} dispatched successfully.
                </div>
              )}
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
                    onClick={() => openInvoicePrintWindow(orderDetails || selectedOrder)}
                    className="px-3.5 py-1.5 bg-[#009FE3] hover:bg-[#008bc5] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Download / Print GST Tax Invoice"
                  >
                    <Download size={14} /> Download Invoice
                  </button>
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* PRE-WRITTEN RECOVERY & PROMOTIONAL MESSAGE MODAL                     */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showRecoveryModal && selectedRecoverySession && (
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
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 my-auto"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#009FE3] uppercase tracking-wider">Customer Outreach & Recovery</span>
                  <h3 className="text-base font-bold text-gray-900">Send Offer / Recovery Message</h3>
                </div>
                <button
                  onClick={() => setShowRecoveryModal(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Customer Context Card */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{selectedRecoverySession.customerName}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      {selectedRecoverySession.email || 'No email'} {selectedRecoverySession.phone ? `• +91 ${selectedRecoverySession.phone}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Value</span>
                    <p className="font-black text-gray-900 text-sm">₹{selectedRecoverySession.cartTotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Pre-written Template Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Select Pre-written Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={e => handleTemplateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-xs text-gray-900 outline-none focus:bg-white focus:border-[#009FE3] cursor-pointer"
                  >
                    {EMAIL_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={e => setCustomSubject(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#009FE3]"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                    Message Body (Customizable)
                  </label>
                  <textarea
                    rows={8}
                    value={customBody}
                    onChange={e => setCustomBody(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-medium text-gray-900 outline-none focus:bg-white focus:border-[#009FE3] leading-relaxed resize-none"
                  />
                </div>

                {/* Hostinger Sender Info Badge */}
                <div className="flex items-center justify-between px-3 py-2 bg-sky-50/70 border border-sky-200/60 rounded-xl text-[11px]">
                  <div className="flex items-center gap-1.5 text-sky-800 font-semibold">
                    <Mail size={13} className="text-[#009FE3]" />
                    <span>Sender: <strong className="font-mono text-zinc-900">{SENDER_EMAIL}</strong></span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide bg-sky-100 px-2 py-0.5 rounded">Hostinger Webmail</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer text-xs"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedRecoverySession.phone && (
                      <button
                        type="button"
                        onClick={handleSendRecoveryWhatsApp}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 text-xs"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSendRecoveryEmail}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                      title="Open message in your default mail application"
                    >
                      <ExternalLink size={12} />
                      <span>Mail App</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendDirectServerEmail}
                      disabled={sendingDirectEmail}
                      className="px-4 py-2 bg-[#009FE3] hover:bg-[#008bc5] disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 text-xs"
                    >
                      {sendingDirectEmail ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
                      <span>Send from {SENDER_EMAIL}</span>
                    </button>
                  </div>
                </div>
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
