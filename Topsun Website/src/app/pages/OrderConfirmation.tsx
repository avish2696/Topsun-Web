import { motion } from 'motion/react';
import { Package, MapPin, AlertCircle, Loader, RefreshCw, ArrowLeft, Copy, Check, Star, Trophy, ChevronDown, Download, Search, ShoppingCart, Menu, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useShopping } from '@/app/context/ShoppingContext';
import { useAuth } from '@/app/context/AuthContext';
import { supabase } from '@/supabase';
import { toast } from 'sonner';
import Header from '@/app/components/Header';
import { SEOHead } from '@/app/components/SEOHead';

export default function OrderConfirmation() {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [offersExpanded, setOffersExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { getCartItemCount } = useShopping();
  const { user } = useAuth();
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchOrder = async () => {
    if (!orderId || !user) {
      setError('Order not accessible. Please log in.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !data) {
        setError('Order not found.');
        setLoading(false);
        return;
      }
      setOrder(data);
    } catch (err: any) {
      setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId, user]);

  const handleRetry = async () => {
    setLoading(true);
    setRetrying(true);
    await fetchOrder();
    setRetrying(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Order ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRating = (rate: number) => {
    setRating(rate);
    toast.success('Rating Submitted', {
      description: `Thank you for rating this product ${rate} stars!`,
    });
  };

  const getReturnWindowText = (orderObj: any) => {
    const deliveryDate = new Date(orderObj.updated_at || orderObj.created_at);
    const returnDate = new Date(deliveryDate);
    returnDate.setDate(returnDate.getDate() + 15);
    const today = new Date();
    
    const formattedReturnDate = returnDate.toLocaleDateString('en-IN', {
      month: 'short', day: 'numeric',
    });
    
    if (orderObj.order_status === 'delivered') {
      if (today > returnDate) {
        return `Return window ended on ${formattedReturnDate}`;
      } else {
        return `Return window active until ${formattedReturnDate}`;
      }
    } else {
      return '15-day return & exchange window available after delivery';
    }
  };

  const handleEditOrder = () => {
    if (order && (order.order_status === 'pending' || order.order_status === 'processing')) {
      toast.success('Edit request initiated', {
        description: 'Our customer support has been notified. We will reach out to you within 24 hours.'
      });
    } else {
      toast.error('Order cannot be modified', {
        description: 'This order has already been processed or shipped.'
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex justify-center items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-[480px] min-h-screen bg-[#f1f3f6] flex flex-col justify-center items-center p-6 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="flex justify-center mb-6">
            <Loader size={40} className="text-blue-500" />
          </motion.div>
          <p className="text-gray-500 font-medium text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex justify-center items-start" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-[480px] min-h-screen bg-[#f1f3f6] flex flex-col p-4 shadow-sm border-x border-gray-100">
          <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate('/orders')} className="p-1 hover:bg-gray-100 rounded-full text-gray-800 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-[17px] font-bold text-gray-900 tracking-tight">Order Details</h1>
          </header>
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <div className="bg-red-50 border border-red-200 p-5 rounded-2xl mb-6">
              <AlertCircle className="text-red-500 mx-auto mb-3" size={32} />
              <h2 className="text-[16px] font-bold text-red-950 mb-1">Unable to Load Order</h2>
              <p className="text-red-700 text-xs">{error}</p>
            </div>
            <div className="w-full space-y-3">
              <button onClick={handleRetry} disabled={retrying} className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 active:scale-98 transition-all disabled:opacity-50 text-[14px]">
                {retrying ? <Loader size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                {retrying ? 'Retrying...' : 'Retry'}
              </button>
              <Link to="/" className="block text-center px-8 py-3.5 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-98 transition-all text-[14px]">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const orderItems: any[] = order.items || [];
  const addr = order.shipping_address || {};

  const SHOE_MRP_MAP: Record<number, number> = {
    1: 4000,
    2: 5500,
    3: 5700,
    4: 6000,
    5: 5000,
    6: 5200,
    7: 4200,
  };

  // Calculations for Price Details section
  const totalQuantity = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
  const finalPrice = order.total_amount / 100;
  const listingPrice = orderItems.reduce((sum: number, item: any) => {
    const mrp = SHOE_MRP_MAP[item.product_id || item.id] || ((item.price / 100) * 2);
    return sum + (mrp * item.quantity);
  }, 0) || (totalQuantity * 4500);
  const specialPrice = orderItems.reduce((sum: number, item: any) => sum + ((item.price / 100) * item.quantity), 0) || finalPrice;
  const totalFees = 0; // Free delivery
  const otherDiscount = Math.max(0, specialPrice + totalFees - finalPrice);

  // Timeline dates relative to created_at
  const orderDate = new Date(order.created_at);
  const formatDateShort = (d: Date) => {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const confirmedDateText = formatDateShort(orderDate);

  const shippedDate = new Date(orderDate);
  shippedDate.setDate(orderDate.getDate() + 2);
  const shippedDateText = formatDateShort(shippedDate);

  const outForDeliveryDate = new Date(orderDate);
  outForDeliveryDate.setDate(orderDate.getDate() + 8);
  const outForDeliveryDateText = formatDateShort(outForDeliveryDate);

  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 10);
  const deliveryDateText = formatDateShort(deliveryDate);

  // Stepper render logic
  const renderTimeline = () => {
    const status = order.order_status;
    let activeStep = 0;
    if (status === 'shipped') activeStep = 1;
    else if (status === 'delivered') activeStep = 3; 

    const steps = [
      {
        title: 'Order Confirmed',
        date: confirmedDateText,
        detail: 'Your order has been placed and is being prepared.',
        index: 0
      },
      {
        title: 'Shipped',
        date: shippedDateText,
        detail: 'Your item has been dispatched and is on the way to your nearest hub.',
        index: 1
      },
      {
        title: 'Out For Delivery',
        date: outForDeliveryDateText,
        detail: 'Our delivery partner has picked up your order and is delivering it today.',
        index: 2
      },
      {
        title: 'Delivery',
        date: deliveryDateText,
        detail: 'Expected delivery by 11 PM.',
        index: 3
      }
    ];

    return (
      <div className="bg-white p-5 border-b border-gray-100 flex flex-col gap-0 shadow-sm">
        <div className="relative pl-8 space-y-6">
          {/* Connecting Line */}
          <div className="absolute left-[11px] top-[14px] bottom-[14px] w-[2px] bg-gray-200">
            <div 
              className="w-full bg-green-600 transition-all duration-500" 
              style={{ 
                height: activeStep === 0 ? '0%' : 
                        activeStep === 1 ? '33%' : 
                        activeStep >= 2 ? '100%' : '0%' 
              }}
            />
          </div>

          {steps.map((step) => {
            const isCompleted = activeStep > step.index || (status === 'delivered');
            const isCurrent = (activeStep === step.index && status !== 'delivered');
            const isPending = !isCompleted && !isCurrent;
            
            return (
              <div 
                key={step.index} 
                className={`relative transition-all duration-300 rounded-xl p-3 ${
                  isCurrent ? 'bg-[#f4faf7] border border-green-100/50' : ''
                }`}
              >
                {/* Stepper Dot */}
                <div className="absolute left-[-29px] top-[12px] z-10 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center text-white">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                     <div className="w-5 h-5 rounded-full bg-green-600 border-[3px] border-white ring-2 ring-green-600 flex items-center justify-center">
                       <div className="w-1.5 h-1.5 rounded-full bg-white" />
                     </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-300" />
                  )}
                </div>

                {/* Step Details */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[14px] font-bold ${
                      isPending ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {step.title}{step.index === 3 && status === 'delivered' ? 'ed' : ''}, {step.date}
                    </span>
                    {step.index === 3 && isPending && (
                      <button 
                        onClick={() => toast.info('Delivery date changes are locked once shipped')}
                        className="px-2.5 py-1 border border-gray-300 rounded-lg text-[11px] font-bold text-gray-700 bg-white shadow-sm active:scale-95"
                      >
                        Change Date
                      </button>
                    )}
                  </div>
                  
                  {(isCurrent || (isCompleted && step.index === 1 && status !== 'delivered')) && (
                    <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed font-medium">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="border-t border-gray-100 mt-4 pt-3 text-left">
          <Link 
            to="/track-order" 
            className="text-[14px] font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            See All Updates
            <span className="text-[12px] font-semibold font-sans">❯</span>
          </Link>
        </div>
      </div>
    );
  };

  const handleDownloadInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocker is active. Please enable pop-ups.');
      return;
    }
    
    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product_name} (Size: ${item.size})</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${(item.price / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.order_number}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; }
            .details { margin: 20px 0; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f4f4f4; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">TOPSUN E-COMMERCE</div>
              <div>www.topsun.in</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: bold;">INVOICE</div>
              <div>Order Reference: ${order.order_number}</div>
              <div>Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}</div>
            </div>
          </div>
          
          <div class="details">
            <strong>Shipping Details:</strong><br>
            ${addr.fullName}<br>
            ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>
            ${addr.city}, ${addr.state} - ${addr.postalCode}<br>
            Phone: ${addr.phone}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Details</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Total Paid (${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}): ₹${(order.total_amount / 100).toFixed(2)}
          </div>
          
          <div class="footer">
            Thank you for shopping with TopSun!<br>
            If you have any questions, please contact support@topsun.in
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col justify-start items-center" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SEOHead
        title="Order Confirmation | TOPSUN Footwear"
        description="Your TOPSUN footwear order confirmation and delivery details."
        noIndex={true}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />
      <div className="w-full max-w-[480px] min-h-screen bg-[#f1f3f6] flex flex-col shadow-sm border-x border-gray-100 pb-20 relative pt-16">
        
        {/* Back / Title bar */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/orders')} 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-800 flex items-center gap-1 text-xs font-semibold"
              title="Go Back to Orders"
            >
              <ArrowLeft size={18} />
              <span>Back to Orders</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 pb-4">
          
          {/* Product Items List & Order ID */}
          <div className="bg-white p-4 flex flex-col gap-1 shadow-sm border-b border-gray-100">
            <div className="text-[12px] text-gray-500 mb-2 flex items-center gap-1.5">
              <span>Order ID - {order.order_number}</span>
              <button 
                onClick={() => handleCopy(order.order_number)}
                className="p-1 hover:bg-gray-100 rounded text-blue-500 transition-all active:scale-90 flex items-center justify-center"
                title="Copy Order ID"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              </button>
            </div>
            
            {orderItems.map((item: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start py-3 border-b border-gray-50 last:border-b-0 last:pb-0">
                <div className="flex-grow min-w-0">
                  <h2 className="text-[15px] font-medium text-gray-900 leading-snug line-clamp-2">
                    {item.product_name}
                  </h2>
                  <p className="text-[13px] text-gray-500 mt-1">
                    Size: {item.size} • Color: {item.color_label || 'Default'}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-1 font-medium">
                    Seller: TopSun Retail
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[16px] font-bold text-gray-900">
                      ₹{(item.price / 100).toFixed(0)}
                    </span>
                    <span className="text-[12px] font-bold text-green-600">
                      1 offer
                    </span>
                  </div>
                </div>
                
                <div className="w-[72px] h-[72px] bg-[#f9f9f9] border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.product_name} 
                      className="w-full h-full object-contain mix-blend-multiply" 
                    />
                  ) : (
                    <Package size={28} className="text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>


          {/* Stepper Timeline Tracker */}
          {renderTimeline()}

          {/* Delivery Details Section */}
          <div className="mx-3.5 my-3">
            <h4 className="text-[14px] font-bold text-gray-900 mb-2 px-1">Delivery details</h4>
            <div className="bg-[#f8f9fa] rounded-2xl p-4 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] border border-[#edeeef]">
              <div className="flex gap-3 items-start">
                <div className="mt-0.5 text-gray-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="text-[13px] text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-900 mr-1.5">Home</span>
                  {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.postalCode}
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="text-gray-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-[13px] text-gray-600">
                  <span className="font-bold text-gray-900 mr-1.5">{addr.fullName}</span>
                  {addr.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Price Details Section */}
          <div className="mx-3.5 my-3">
            <h4 className="text-[14px] font-bold text-gray-900 mb-2 px-1">Price details</h4>
            <div className="bg-white border border-[#edeeef] rounded-2xl p-4 flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              
              <div className="space-y-3 pb-3">
                <div className="flex justify-between items-center text-[13px] text-gray-600">
                  <span>Listing price</span>
                  <span className="line-through">₹{listingPrice.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-center text-[13px] text-gray-800 font-bold">
                  <div className="flex items-center gap-1">
                    <span>Special price</span>
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>₹{specialPrice.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-center text-[13px] text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>Total fees</span>
                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                
                {otherDiscount > 0 && (
                  <div className="flex justify-between items-center text-[13px]">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Other discount</span>
                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <span className="text-green-600 font-bold">-₹{otherDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center text-[15px] font-bold text-gray-900">
                <span>Total amount</span>
                <span>₹{finalPrice.toLocaleString('en-IN')}</span>
              </div>
              
              {/* Paid By section */}
              <div className="bg-[#f8f9fa] border border-[#edeeef] rounded-xl p-3 mt-4 flex items-center justify-between text-[13px]">
                <span className="text-gray-500 font-bold">Paid By</span>
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  {order.payment_method === 'cod' ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Cash On Delivery</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="capitalize">{order.payment_method === 'upi' ? 'UPI' : order.payment_method}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Download Invoice Button */}
              <button 
                onClick={handleDownloadInvoice}
                className="mt-4 w-full border border-[#d4d6d8] hover:border-gray-400 hover:bg-gray-50 rounded-xl py-3 flex items-center justify-center gap-2 text-[13px] font-bold text-gray-700 active:scale-98 transition-all"
              >
                <Download size={14} className="text-gray-600" />
                <span>Download Invoice</span>
              </button>
              
            </div>
          </div>

          {/* Offers Earned Collapsible */}
          <div className="mx-3.5 my-3">
            <button 
              onClick={() => setOffersExpanded(!offersExpanded)}
              className="w-full bg-[#f8f9fa] border border-[#edeeef] hover:bg-gray-50 rounded-2xl p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] active:scale-99 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#f1f3f6] flex items-center justify-center text-gray-700">
                  <Trophy size={16} className="text-amber-500 fill-amber-400" />
                </div>
                <span className="text-[13px] text-gray-800 font-bold">Offers earned</span>
              </div>
              <div>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${offersExpanded ? 'rotate-180' : ''}`} 
                />
              </div>
            </button>
            
            {offersExpanded && (
              <div className="mx-2 mt-2 bg-white border border-[#edeeef] rounded-2xl p-3.5 space-y-2.5 text-[12px] text-gray-600 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <span>🎉 Free shipping applied to this order</span>
                </div>
                {order.payment_method !== 'cod' && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span>💳 Payment method promotional discount applied</span>
                  </div>
                )}
                {totalQuantity >= 2 && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span>👟 Combo offer discount applied</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rate your experience section */}
          <div className="mx-3.5 my-3">
            <h4 className="text-[14px] font-bold text-gray-900 mb-2 px-1">Rate your experience</h4>
            <div className="bg-white border border-[#edeeef] rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-2 text-[13px] text-gray-800 font-bold">
                <svg className="w-4.5 h-4.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Rate the product</span>
              </div>
              <div className="flex justify-center gap-3.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => handleRating(star)} 
                    className="focus:outline-none transition-all hover:scale-110 active:scale-90"
                  >
                    <svg 
                      className={`w-8 h-8 transition-colors ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`} 
                      fill={star <= rating ? 'currentColor' : 'none'} 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.178 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* Shop more from TopSun Button */}
          <div className="mx-3.5 mt-6 mb-12">
            <Link 
              to="/shop" 
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50/50 rounded-xl py-3.5 flex items-center justify-center font-bold text-[14px] active:scale-98 transition-all"
            >
              Shop more from TopSun
            </Link>
          </div>

        </div>

        {/* Sticky Bottom Actions */}
        <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] flex justify-center">
          <div className="w-full max-w-[480px] grid grid-cols-2 divide-x divide-gray-100">
            <button 
              onClick={handleEditOrder}
              className="py-3.5 text-center text-[14px] font-bold text-gray-800 hover:bg-gray-50 active:scale-95 transition-all"
            >
              Edit Order
            </button>
            <Link 
              to="/contact"
              className="py-3.5 text-center text-[14px] font-bold text-gray-800 hover:bg-gray-50 active:scale-95 transition-all block"
            >
              Need help?
            </Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
