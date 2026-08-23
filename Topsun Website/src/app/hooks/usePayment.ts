import { useState } from 'react';
import { razorpayService } from '@/app/utils/razorpayService';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  orderId: string | null;
}

export function usePayment() {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    orderId: null,
  });

  const initiatePayment = async (
    userId: string,
    cartItems: any[],
    shippingAddress: any,
    totalAmount: number,
    customerName: string,
    customerEmail: string,
    customerPhone: string
  ): Promise<string | null> => {
    setPaymentState({ isProcessing: true, error: null, orderId: null });

    try {
      console.log('💳 Initiating payment...');

      const orderId = await razorpayService.processPayment(
        userId,
        cartItems,
        shippingAddress,
        totalAmount,
        customerName,
        customerEmail,
        customerPhone
      );

      setPaymentState({
        isProcessing: false,
        error: null,
        orderId: orderId,
      });

      console.log('✅ Payment completed. Order ID:', orderId);
      return orderId;
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed. Please try again.';

      setPaymentState({
        isProcessing: false,
        error: errorMessage,
        orderId: null,
      });

      console.error('❌ Payment error:', errorMessage);
      return null;
    }
  };

  const clearError = () => {
    setPaymentState((prev) => ({ ...prev, error: null }));
  };

  return {
    ...paymentState,
    initiatePayment,
    clearError,
  };
}
