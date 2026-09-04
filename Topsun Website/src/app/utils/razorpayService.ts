/**
 * Razorpay Payment Service
 * Handles payment processing and order creation
 */

import { supabase } from '@/supabase';

import { toValidUUID } from '@/app/utils/phoneAuthService';

export interface RazorpayPaymentOptions {
  amount: number; // Amount in paise (multiply by 100 if in rupees)
  currency?: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  notes?: {
    [key: string]: string;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const razorpayService = {
  /**
   * Initialize Razorpay - Load script and setup
   */
  async initializeRazorpay(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;

      script.onload = () => {
        console.log('✅ Razorpay script loaded');
        resolve();
      };

      script.onerror = () => {
        console.error('❌ Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };

      document.body.appendChild(script);
    });
  },

  /**
   * Create payment order on backend
   * This should call your backend API which calls Razorpay API
   */
  async createOrder(amount: number, orderId: string): Promise<any> {
    try {
      // For now, return a mock order
      // In production, call your backend API:
      // const response = await fetch('/api/razorpay/create-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, receipt: orderId })
      // });
      // return response.json();

      console.log('📦 Creating Razorpay order for amount:', amount, 'paise');

      // Mock response - replace with actual backend call
      return {
        id: `order_${Date.now()}`,
        amount: amount,
        amount_paid: 0,
        amount_due: amount,
        currency: 'INR',
        receipt: orderId,
        status: 'created',
      };
    } catch (err: any) {
      console.error('❌ Failed to create order:', err.message);
      throw err;
    }
  },

  /**
   * Open Razorpay checkout modal
   */
  async openCheckout(options: RazorpayPaymentOptions): Promise<RazorpayPaymentResponse> {
    // Ensure Razorpay script is loaded
    if (!window.Razorpay) {
      await this.initializeRazorpay();
    }

    return new Promise((resolve, reject) => {
      // Create order first
      this.createOrder(options.amount, options.orderId)
        .then((orderData) => {
          const razorpayOptions = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
            amount: options.amount, // Amount in paise
            currency: options.currency || 'INR',
            name: 'TOPSUN',
            description: options.description,
            order_id: orderData.id,
            customer_id: options.orderId,
            prefill: {
              name: options.customerName,
              email: options.customerEmail,
              contact: options.customerPhone,
            },
            notes: options.notes || {},
            theme: {
              color: '#ADD8E6', // Light blue from your brand
            },
            handler: (response: any) => {
              console.log('✅ Payment successful:', response);
              resolve({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
            modal: {
              ondismiss: () => {
                console.log('⚠️ Checkout modal closed');
                reject(new Error('Payment cancelled by user'));
              },
            },
          };

          const rzp = new window.Razorpay(razorpayOptions);
          rzp.open();
        })
        .catch((err) => {
          console.error('❌ Failed to open checkout:', err.message);
          reject(err);
        });
    });
  },

  /**
   * Verify payment signature on backend
   * This ensures the payment is legitimate
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<boolean> {
    try {
      console.log('🔐 Verifying payment signature...');

      // In production, call your backend to verify:
      // const response = await fetch('/api/razorpay/verify-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     razorpay_order_id: razorpayOrderId,
      //     razorpay_payment_id: razorpayPaymentId,
      //     razorpay_signature: razorpaySignature
      //   })
      // });
      // const result = await response.json();
      // return result.verified;

      // Mock verification - replace with backend call
      console.log('✅ Payment verified (mock)');
      return true;
    } catch (err: any) {
      console.error('❌ Payment verification failed:', err.message);
      throw err;
    }
  },

  /**
   * Save payment details to database
   */
  async savePayment(
    userId: string,
    orderId: string,
    paymentData: RazorpayPaymentResponse,
    amount: number,
    status: 'completed' | 'failed' | 'pending'
  ): Promise<void> {
    try {
      const { error } = await supabase.from('payments').insert([
        {
          user_id: userId,
          order_id: orderId,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
          amount: amount,
          currency: 'INR',
          status: status,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      if (error) {
        throw error;
      }

      console.log('✅ Payment saved to database');
    } catch (err: any) {
      console.error('❌ Failed to save payment:', err.message);
      throw err;
    }
  },

  /**
   * Create order in database
   */
  async createOrderRecord(
    userId: string,
    items: any[],
    shippingAddress: any,
    totalAmount: number
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            user_id: toValidUUID(userId),
            items: items,
            shipping_address: shippingAddress,
            total_amount: totalAmount,
            payment_status: 'pending',
            order_status: 'processing',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Order created:', data.id);
      return data.id;
    } catch (err: any) {
      console.error('❌ Failed to create order:', err.message);
      throw err;
    }
  },

  /**
   * Update order status after payment
   */
  async updateOrderStatus(
    orderId: string,
    paymentStatus: 'completed' | 'failed' | 'pending',
    orderStatus: string = 'confirmed'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          order_status: orderStatus === 'confirmed' ? 'confirmed' : 'processing',
          updated_at: new Date(),
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      console.log('✅ Order status updated');
    } catch (err: any) {
      console.error('❌ Failed to update order:', err.message);
      throw err;
    }
  },

  /**
   * Process complete payment flow
   */
  async processPayment(
    userId: string,
    cartItems: any[],
    shippingAddress: any,
    totalAmount: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string
  ): Promise<string> {
    try {
      console.log('💳 Starting payment process...');

      // 1. Create order in database
      const orderId = await this.createOrderRecord(userId, cartItems, shippingAddress, totalAmount);

      // 2. Open Razorpay checkout
      const paymentResponse = await this.openCheckout({
        amount: totalAmount * 100, // Convert to paise
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        description: `Order for ${customerName}`,
        notes: {
          orderId: orderId,
          userId: userId,
        },
      });

      // 3. Verify payment signature
      const isVerified = await this.verifyPayment(
        paymentResponse.razorpay_order_id,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature
      );

      if (!isVerified) {
        throw new Error('Payment verification failed');
      }

      // 4. Save payment details
      await this.savePayment(userId, orderId, paymentResponse, totalAmount, 'completed');

      // 5. Update order status
      await this.updateOrderStatus(orderId, 'completed', 'confirmed');

      console.log('✅ Payment processed successfully');
      return orderId;
    } catch (err: any) {
      console.error('❌ Payment processing failed:', err.message);
      throw err;
    }
  },
};

// Type extension for Razorpay window object
declare global {
  interface Window {
    Razorpay: any;
  }
}
