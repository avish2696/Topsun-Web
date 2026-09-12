import React from 'react';
import Header from '@/app/components/Header';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Loader,
  MapPin, Plus, ChevronRight, Package, CreditCard, Truck, Shield, Check, MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopping, ShippingAddress } from '@/app/context/ShoppingContext';
import { useAuth } from '@/app/context/AuthContext';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import { PIN_CODE_DATABASE } from '@/app/utils/pinCodeDatabase';
import { supabase } from '@/supabase';
import { pushOrderToShipmozo } from '@/app/utils/shipmozoService';
import { generateShortOrderId, logOrderIdValidation } from '@/app/utils/orderIdGenerator';
import { calculatePrice, PaymentMethod as PricingPaymentMethod } from '@/app/utils/pricingCalculator';
import { toValidUUID } from '@/app/utils/phoneAuthService';
import { sendOrderConfirmationEmail } from '@/app/utils/emailService';
import { recordCartSession } from '@/app/utils/cartTracker';

interface FormErrors {
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

interface SavedAddress {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

declare global {
  interface Window { Razorpay: any; }
}

type PaymentMethod = 'online' | 'cod';
type CheckoutStep = 'shipping' | 'summary';

/**
 * Calculates accurate courier package dimensions, weight, and package type
 * according to standard shoe box packaging for 1, 2, 3, 4, 5+ pairs.
 */
export const calculateShoePackageDetails = (totalQuantity: number) => {
  const qty = Math.max(1, totalQuantity || 1);
  const weight = Math.max(0.5, Number((0.6 * qty).toFixed(2))); // 0.60 kg per shoe pair (min 0.50 kg)

  let length = 33;
  let width = 20;
  let height = 12 * qty;

  // For 4 or more shoe boxes, couriers pack 2 boxes side-by-side (width = 40cm) to keep packages compact
  if (qty >= 4) {
    width = 40;
    height = Math.ceil(qty / 2) * 12;
  }

  const packageType = weight >= 10
    ? 'Medium Shipment (Above 10 kg)'
    : 'Small Shipment (Below 10 kg) Single box';

  return {
    package_type: packageType,
    weight,
    length,
    width,
    breadth: width,
    height,
  };
};

import { SEOHead } from '@/app/components/SEOHead';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';

// Step Indicator — 3 steps: Cart → Summary → Payment
function StepIndicator({ step }: { step: CheckoutStep }) {
  const steps = [
    { id: 'cart', label: 'Cart' },
    { id: 'summary', label: 'Summary' },
    { id: 'payment', label: 'Payment' },
  ];

  const activeIndex = step === 'shipping' ? 0 : step === 'summary' ? 1 : 2;

  return (
    <div className="flex items-center justify-center gap-0 py-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {steps.map((s, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                isCompleted
                  ? 'bg-[#b38b3f] text-white'
                  : isActive
                  ? 'bg-[#121518] text-white ring-4 ring-[rgba(179,139,63,0.2)]'
                  : 'bg-[#faf7f2] text-gray-400 border border-[#e4ded5]'
              }`}>
                {isCompleted ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isActive ? 'text-[#121518]' : isCompleted ? 'text-[#b38b3f]' : 'text-gray-400'
              }`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-[2px] w-12 mx-1 mb-3 rounded-full transition-colors duration-300 ${
                i < activeIndex ? 'bg-[#b38b3f]' : 'bg-[#e4ded5]'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Saved Address Card
function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-3 ${
        selected
          ? 'border-[#b38b3f] bg-[rgba(179,139,63,0.06)] shadow-xs'
          : 'border-[#e4ded5] hover:border-gray-400 bg-white'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-[#b38b3f]' : 'border-[#e4ded5]'
        }`}>
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#b38b3f]" />}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm text-[#121518]">{address.full_name}</p>
          {address.is_default && (
            <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-[rgba(179,139,63,0.12)] text-[#8c6820] rounded-full border border-[rgba(179,139,63,0.2)]">
              Default
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-[#606870] mt-0.5">{address.phone}</p>
        <p className="text-xs text-gray-700 mt-1 leading-relaxed">
          {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''},{' '}
          {address.city}, {address.state} – {address.postal_code}
        </p>
      </div>
    </motion.div>
  );
}

function CheckoutContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cart, getCartTotal, getCartItemCount, clearCart } = useShopping();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('shipping');

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCODProcessing, setIsCODProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const stored = localStorage.getItem(`topsun_addresses_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        if (data && data.length > 0) {
          setSavedAddresses(data as SavedAddress[]);
          const def = data.find((a: any) => a.is_default) || data[0];
          setSelectedSavedId(def.id);
          setShowNewForm(false);
        } else {
          setSavedAddresses([]);
          setShowNewForm(true);
        }
      } else {
        setSavedAddresses([]);
        setShowNewForm(true);
      }
    } catch {
      setShowNewForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  }, [user]);

  const validateForm = (): boolean => {
    const e: FormErrors = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    if (!formData.addressLine1.trim()) e.addressLine1 = 'Address is required';
    if (!formData.city.trim()) e.city = 'City is required';
    if (!formData.state.trim()) e.state = 'State is required';
    if (!formData.postalCode.trim()) e.postalCode = 'Postal code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let v = value;
      if (name === 'phone') v = value.replace(/[^0-9]/g, '').slice(0, 10);
      const updated = { ...prev, [name]: v };
      if (name === 'postalCode' && v in PIN_CODE_DATABASE) {
        const { city, state } = (PIN_CODE_DATABASE as any)[v];
        updated.city = city;
        updated.state = state;
      }
      return updated;
    });
    if (errors[name as keyof FormErrors]) setErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSavedId && !showNewForm) {
      const sa = savedAddresses.find(a => a.id === selectedSavedId)!;
      setFormData({
        fullName: sa.full_name,
        email: user?.email || '',
        phone: sa.phone,
        addressLine1: sa.address_line1,
        addressLine2: sa.address_line2 || '',
        city: sa.city,
        state: sa.state,
        postalCode: sa.postal_code,
        country: sa.country,
      });
      setStep('summary');
      return;
    }

    if (!validateForm()) return;

    if (user) {
      try {
        const newAddress: SavedAddress = {
          id: `addr_${Date.now()}`,
          full_name: formData.fullName,
          phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`,
          address_line1: formData.addressLine1,
          address_line2: formData.addressLine2 || undefined,
          postal_code: formData.postalCode,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          is_default: savedAddresses.length === 0,
        };
        const updatedAddresses = [newAddress, ...savedAddresses];
        localStorage.setItem(`topsun_addresses_${user.id}`, JSON.stringify(updatedAddresses));
        setSavedAddresses(updatedAddresses);
        setSelectedSavedId(newAddress.id);
        setShowNewForm(false);
      } catch {
        // proceed
      }
    }

    setFormData(prev => ({
      ...prev,
      phone: prev.phone.startsWith('+91') ? prev.phone : `+91${prev.phone}`,
    }));
    setStep('summary');
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  const getActiveAddress = (): ShippingAddress => {
    if (selectedSavedId && !showNewForm) {
      const sa = savedAddresses.find(a => a.id === selectedSavedId);
      if (sa) {
        return {
          fullName: sa.full_name,
          email: user?.email || '',
          phone: sa.phone,
          addressLine1: sa.address_line1,
          addressLine2: sa.address_line2 || '',
          city: sa.city,
          state: sa.state,
          postalCode: sa.postal_code,
          country: sa.country,
        };
      }
    }
    return formData;
  };

  const getDiscountedTotal = (method: string) => {
    const rawSubtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (method === 'online' || method === 'card' || method === 'upi' || method === 'netbanking') {
      return Math.round(rawSubtotal * 0.95);
    }
    return rawSubtotal;
  };

  const placeOrderInDB = async (razorpayOrderId?: string, razorpayPaymentId?: string, overrideMethod?: string) => {
    if (!user) throw new Error('User not logged in');
    const address = getActiveAddress();
    const orderNumber = generateShortOrderId();
    logOrderIdValidation(orderNumber, 'at order creation');

    const itemsJson = cart.map((item) => ({
      product_id: item.id,
      product_name: item.name,
      price: item.price * 100,
      quantity: item.quantity,
      size: item.size,
      color_label: item.colorLabel,
      image_url: item.image,
    }));

    const methodToUse = overrideMethod || (paymentMethod === 'online' ? 'card' : 'cod');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: toValidUUID(user.id),
        order_number: orderNumber,
        total_amount: getDiscountedTotal(methodToUse) * 100,
        payment_status: methodToUse === 'cod' ? 'pending' : (razorpayPaymentId ? 'completed' : 'pending'),
        order_status: 'pending',
        items: itemsJson,
        shipping_address: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        payment_method: methodToUse,
        razorpay_order_id: razorpayOrderId || null,
      })
      .select('id, order_number')
      .single();

    if (orderError || !order) {
      throw new Error(orderError?.message || 'Failed to create order in database');
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: item.price * 100,
      quantity: item.quantity,
      size: item.size,
      color_label: item.colorLabel,
      image_url: item.image,
    }));

    await supabase.from('order_items').insert(orderItems);

    if (methodToUse === 'cod') {
      const totalQty = (orderItems || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
      const pkg = calculateShoePackageDetails(totalQty);

      const shipmozoData = {
        order_id: order.order_number,
        order_number: order.order_number,
        total_amount: getDiscountedTotal('cod') * 100,
        payment_method: 'cod',
        package_type: pkg.package_type,
        weight: pkg.weight,
        length: pkg.length,
        width: pkg.width,
        breadth: pkg.breadth,
        height: pkg.height,
        shipping_address: {
          fullName: address.fullName,
          phone: address.phone,
          email: user.email || '',
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
        },
        items: orderItems,
      };
      await pushOrderToShipmozo(shipmozoData);
    }

    return { orderId: order.id, orderNumber: order.order_number };
  };

  const updateOrderPaymentStatus = async (orderId: string, status: string, paymentId?: string) => {
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        razorpay_payment_id: paymentId || null,
        order_status: status === 'completed' ? 'processing' : 'pending',
      })
      .eq('id', orderId);
    if (error) throw new Error('Failed to update order status');
  };

  const handleCOD = async () => {
    if (!user) return setError('Please log in to continue');
    if (cart.length === 0) return setError('Your cart is empty');
    setIsCODProcessing(true);
    setError(null);
    try {
      const data = await placeOrderInDB(undefined, undefined, 'cod');
      setSuccessMessage('✅ Order placed! Cash on Delivery confirmed.');
      const addr = getActiveAddress();
      sendOrderConfirmationEmail({
        orderNumber: data.orderId,
        customerEmail: addr.email || user.email,
        customerName: addr.fullName,
        totalAmount: getDiscountedTotal('cod'),
        paymentMethod: 'cod',
        items: cart,
        shippingAddress: addr,
      });
      await clearCart();
      setTimeout(() => navigate(`/order-success/${data.orderId}`), 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setIsCODProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!user) return setError('Please log in to continue');
    if (cart.length === 0) return setError('Your cart is empty');
    setIsProcessing(true);
    setError(null);
    const address = getActiveAddress();

    try {
      if (!window.Razorpay) throw new Error('Payment gateway not loaded. Please refresh.');

      const finalAmount = getDiscountedTotal('card');

      const { data: rpData, error: rpError } = await supabase.functions.invoke('razorpay-create-order', {
        body: { amount: finalAmount * 100, receipt: `receipt_${Date.now()}` }
      });

      if (rpError || !rpData || rpData.error) {
        const errorMsg = rpData?.details?.error?.description || rpData?.error || rpError?.message || 'Failed to initialize payment gateway';
        throw new Error(`Razorpay Error: ${errorMsg}`);
      }

      const { orderId } = await placeOrderInDB(rpData.order_id, undefined, 'card');

      const razorpayOptions: any = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rpData.amount,
        currency: rpData.currency,
        order_id: rpData.order_id,
        name: 'TOPSUN',
        description: 'Performance Footwear Order',
        prefill: { name: address.fullName, email: user.email, contact: address.phone },
        theme: { color: '#009FE3' },
        handler: (response: any) => handleRazorpaySuccess(orderId, response),
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setError('Payment cancelled. Order saved in your Orders history.');
          }
        },
      };

      const rzp = new window.Razorpay(razorpayOptions);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleRazorpaySuccess = async (orderId: string, response: any) => {
    setVerifying(true);
    setIsProcessing(false);
    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify', {
        body: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }
      });

      if (verifyError || !verifyData || verifyData.error) {
        throw new Error(verifyError?.message || verifyData?.error || 'Payment verification failed');
      }

      await updateOrderPaymentStatus(orderId, 'completed', response.razorpay_payment_id);

      try {
        const { data: fullOrder } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (fullOrder) {
          const totalQty = (fullOrder.order_items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
          const pkg = calculateShoePackageDetails(totalQty);

          const shipmozoData = {
            order_id: fullOrder.order_number,
            order_number: fullOrder.order_number,
            total_amount: fullOrder.total_amount,
            payment_method: fullOrder.payment_method || 'card',
            package_type: pkg.package_type,
            weight: pkg.weight,
            length: pkg.length,
            width: pkg.width,
            breadth: pkg.breadth,
            height: pkg.height,
            shipping_address: fullOrder.shipping_address,
            items: (fullOrder.order_items || []).map((item: any) => ({
              product_id: item.product_id,
              product_name: item.product_name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color_label: item.color_label,
            })),
          };
          await pushOrderToShipmozo(shipmozoData);
        }
      } catch (e) {
        console.error('Shipmozo sync error:', e);
      }

      sendOrderConfirmationEmail({
        orderNumber: fullOrder?.order_number || orderId,
        customerEmail: fullOrder?.shipping_address?.email || user?.email,
        customerName: fullOrder?.shipping_address?.fullName,
        totalAmount: fullOrder?.total_amount || getDiscountedTotal('card'),
        paymentMethod: 'card',
        items: fullOrder?.order_items || cart,
        shippingAddress: fullOrder?.shipping_address,
      });
      setSuccessMessage('✅ Payment verified! Order confirmed.');
      await clearCart();
      setTimeout(() => navigate(`/order-success/${orderId}`), 1200);
    } catch (err: any) {
      setError(err.message || 'Payment verification failed. Please contact support.');
      setVerifying(false);
    }
  };

  const handleProceed = async () => {
    if (paymentMethod === 'cod') {
      await handleCOD();
    } else {
      await handleRazorpayPayment();
    }
  };

  const isLoading = isProcessing || verifying || isCODProcessing;

  // ─── SHIPPING STEP ───
  if (step === 'shipping') {
    return (
      <div
        className="min-h-screen bg-[#fafafa] flex flex-col"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Header
          cartCount={getCartItemCount()}
          onCartClick={() => navigate('/cart')}
          onMobileMenuToggle={setMobileMenuOpen}
          mobileMenuOpen={mobileMenuOpen}
        />

        <div className="flex-1 pt-20 sm:pt-24">
          <div className="bg-white border-b border-gray-200/70 px-4 py-3 flex items-center justify-between sticky top-16 z-30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="text-base font-bold text-gray-900">Delivery Address</h1>
            </div>
          </div>

          <div className="max-w-[500px] mx-auto px-4 pb-36">
            <StepIndicator step="shipping" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {loadingAddresses ? (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-8">
                  <Loader size={16} className="animate-spin text-[#009FE3]" /> Loading addresses...
                </div>
              ) : savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Saved Addresses</p>
                  {savedAddresses.map(addr => (
                    <AddressCard
                      key={addr.id}
                      address={addr}
                      selected={selectedSavedId === addr.id && !showNewForm}
                      onSelect={() => { setSelectedSavedId(addr.id); setShowNewForm(false); }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => { setShowNewForm(!showNewForm); setSelectedSavedId(null); }}
                    className={`w-full flex items-center gap-2 justify-center py-3 border-2 border-dashed rounded-2xl text-xs font-bold transition-all ${
                      showNewForm
                        ? 'border-[#009FE3] text-[#009FE3] bg-blue-50/30'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <Plus size={15} /> Add New Delivery Address
                  </button>
                </div>
              )}

              {/* New Address Form */}
              <AnimatePresence>
                {showNewForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleShippingSubmit}
                    className="space-y-3 bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs"
                  >
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Add New Address</p>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Full Name *</label>
                      <input
                        type="text" name="fullName" value={formData.fullName}
                        onChange={handleInputChange} placeholder="Recipient's Name"
                        className={`w-full h-11 px-3.5 rounded-xl border text-xs outline-none transition-colors bg-gray-50 ${
                          errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Mobile Phone *</label>
                      <div className="relative flex items-center">
                        <div className="absolute left-3.5 pr-2.5 border-r border-gray-300 flex items-center z-10">
                          <span className="text-xs font-bold text-gray-800">+91</span>
                        </div>
                        <input
                          type="tel" name="phone" value={formData.phone}
                          onChange={handleInputChange} placeholder="10-digit number" maxLength={10}
                          className={`w-full h-11 pl-14 pr-3.5 rounded-xl border text-xs outline-none transition-colors bg-gray-50 ${
                            errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">PIN Code *</label>
                      <input
                        type="text" name="postalCode" value={formData.postalCode}
                        onChange={handleInputChange} placeholder="6-digit PIN" maxLength={6}
                        className={`w-full h-11 px-3.5 rounded-xl border text-xs outline-none transition-colors bg-gray-50 ${
                          errors.postalCode ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Street Address *</label>
                      <input
                        type="text" name="addressLine1" value={formData.addressLine1}
                        onChange={handleInputChange} placeholder="House / Flat No, Street, Colony"
                        className={`w-full h-11 px-3.5 rounded-xl border text-xs outline-none transition-colors bg-gray-50 ${
                          errors.addressLine1 ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">Landmark (Optional)</label>
                      <input
                        type="text" name="addressLine2" value={formData.addressLine2}
                        onChange={handleInputChange} placeholder="Near Temple / School"
                        className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-gray-900 bg-gray-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">City *</label>
                        <input
                          type="text" name="city" value={formData.city}
                          onChange={handleInputChange} placeholder="City"
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-gray-900 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-600 mb-1">State *</label>
                        <input
                          type="text" name="state" value={formData.state}
                          onChange={handleInputChange} placeholder="State"
                          className="w-full h-11 px-3.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-gray-900 bg-gray-50"
                        />
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Sticky Bottom: Continue to Summary */}
          <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
            <div className="w-full max-w-[500px] bg-white border-t border-gray-200 px-4 pt-3 pb-5 shadow-lg">
              <button
                onClick={handleShippingSubmit as any}
                type="button"
                className="w-full h-13 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                Proceed to Order Summary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUMMARY STEP ───
  const activeAddress = getActiveAddress();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#121518] flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <SEOHead
        title="Secure Checkout | TOPSUN Footwear"
        description="Complete your order securely with TOPSUN. Fast shipping, 256-bit SSL encryption, and multiple payment options including UPI, Cards, and Cash on Delivery."
        noIndex={true}
      />
      <Header
        cartCount={getCartItemCount()}
        onCartClick={() => navigate('/cart')}
        onMobileMenuToggle={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="flex-1 pt-20 sm:pt-24">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200/70 px-4 py-3 flex items-center gap-3 sticky top-16 z-30">
          <button
            onClick={() => setStep('shipping')}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-700"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-bold text-gray-900">Review & Payment</h1>
        </div>

        <div className="max-w-[500px] mx-auto px-4 pb-36 space-y-4">
          <StepIndicator step="summary" />

          {/* Error / Success Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 font-semibold"
              >
                <AlertCircle size={16} className="flex-shrink-0" /> {error}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 font-semibold"
              >
                <CheckCircle size={16} className="flex-shrink-0" /> {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shipping Address Summary */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/70">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin size={14} className="text-[#009FE3]" />
                </div>
                <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Shipping To</span>
              </div>
              <button
                onClick={() => setStep('shipping')}
                className="text-xs font-bold text-[#009FE3] hover:underline"
              >
                Change
              </button>
            </div>
            <p className="font-bold text-sm text-gray-900">{activeAddress.fullName}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {activeAddress.addressLine1}{activeAddress.addressLine2 ? `, ${activeAddress.addressLine2}` : ''}, {activeAddress.city}, {activeAddress.state} – {activeAddress.postalCode}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">📞 {activeAddress.phone}</p>
          </div>

          {/* Items Preview */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/70">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-3">
              Order Items ({cart.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#f4f4f2] border border-gray-100 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <Package size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Size: UK {item.size} · Qty: {item.quantity}
                    </p>
                    <span className="text-xs font-black text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/70 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Choose Payment Method</h3>
            
            {/* Online Payment */}
            <button
              onClick={() => setPaymentMethod('online')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                paymentMethod === 'online'
                  ? 'border-[#009FE3] bg-blue-50/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'online' ? 'border-[#009FE3]' : 'border-gray-300'
              }`}>
                {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-[#009FE3]" />}
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#009FE3]">
                <CreditCard size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-xs text-gray-900">Online Payment (UPI / Cards)</p>
                <p className="text-[10px] text-gray-500">Instant confirmation & fast shipping</p>
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                5% OFF
              </span>
            </button>

            {/* COD */}
            <button
              onClick={() => setPaymentMethod('cod')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all ${
                paymentMethod === 'cod'
                  ? 'border-[#009FE3] bg-blue-50/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'cod' ? 'border-[#009FE3]' : 'border-gray-300'
              }`}>
                {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-[#009FE3]" />}
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#b48035]">
                <Truck size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-xs text-gray-900">Cash on Delivery</p>
                <p className="text-[10px] text-gray-500">Pay cash at doorstep on delivery</p>
              </div>
            </button>
          </div>

          {/* Pricing Details */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-gray-200/70 space-y-2.5 text-xs">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-2">Price Breakdown</h3>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charges</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            {paymentMethod === 'online' && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Online Payment Discount (5%)</span>
                <span>-₹{Math.round(subtotal * 0.05).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="h-px bg-gray-100 my-2" />
            <div className="flex justify-between items-center text-sm font-black text-gray-900">
              <span>Grand Total</span>
              <span className="text-base text-[#009FE3]">
                ₹{(paymentMethod === 'online'
                  ? getDiscountedTotal('card')
                  : getDiscountedTotal('cod')
                ).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 py-1">
            <Shield size={13} className="text-emerald-500" />
            <span>256-Bit SSL Encrypted Safe Checkout</span>
          </div>
        </div>

        {/* Sticky Action Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center">
          <div className="w-full max-w-[500px] bg-white border-t border-gray-200 px-4 py-3.5 shadow-lg">
            <button
              onClick={handleProceed}
              disabled={isLoading || cart.length === 0}
              className="w-full h-13 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-98"
            >
              {isCODProcessing ? (
                <><Loader size={16} className="animate-spin" /> Placing Order...</>
              ) : isProcessing || verifying ? (
                <><Loader size={16} className="animate-spin" /> Connecting Gateway...</>
              ) : paymentMethod === 'cod' ? (
                <>Confirm Cash on Delivery <ChevronRight size={16} /></>
              ) : (
                <>Pay Now ₹{getDiscountedTotal('card').toLocaleString('en-IN')} <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
