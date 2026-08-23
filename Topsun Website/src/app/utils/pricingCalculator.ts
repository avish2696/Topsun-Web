/**
 * Pricing Calculator with Combo Offers
 * - Single Product: ₹599
 * - UPI: ₹599 - ₹50 = ₹549
 * - COD: ₹599 (no discount)
 * - Card: ₹599 - ₹30 = ₹569
 * - NetBanking: ₹599 - ₹40 = ₹559
 * 
 * Combo Offer (2+ shoes): ₹999 total (overrides all discounts)
 */

export type PaymentMethod = 'upi' | 'cod' | 'card' | 'netbanking';

export interface PricingInfo {
  basePrice: number;
  discount: number;
  discountReason: string;
  finalPrice: number;
  isComboOffer: boolean;
  comboSavings?: number;
}

const SINGLE_PRICE = 599;
const COMBO_PRICE = 999;
const MIN_COMBO_ITEMS = 2;

// Payment method discounts (only applied to single product)
const PAYMENT_DISCOUNTS: Record<PaymentMethod, number> = {
  upi: 50,       // ₹599 - ₹50 = ₹549
  cod: 0,        // ₹599 (no discount)
  card: 30,      // ₹599 - ₹30 = ₹569
  netbanking: 40, // ₹599 - ₹40 = ₹559
};

/**
 * Calculate price based on items and payment method
 * @param totalItems - Total number of items in cart
 * @param paymentMethod - Selected payment method
 * @returns PricingInfo with breakdown
 */
export function calculatePrice(
  totalItems: number,
  paymentMethod: PaymentMethod
): PricingInfo {
  // Check if combo offer applies (2 or more items)
  const isCombo = totalItems >= MIN_COMBO_ITEMS;

  if (isCombo) {
    // Combo offer: ₹999 for 2+ shoes (regardless of payment method)
    const singlePrice = SINGLE_PRICE * totalItems;
    const comboSavings = singlePrice - COMBO_PRICE;

    return {
      basePrice: singlePrice,
      discount: comboSavings,
      discountReason: `Combo Offer: Buy ${totalItems} shoes for ₹${COMBO_PRICE}`,
      finalPrice: COMBO_PRICE,
      isComboOffer: true,
      comboSavings,
    };
  } else {
    // Single product pricing with payment method discount
    const discount = PAYMENT_DISCOUNTS[paymentMethod] || 0;
    const finalPrice = SINGLE_PRICE - discount;

    const discountReasons: Record<PaymentMethod, string> = {
      upi: '₹50 UPI Discount',
      cod: 'No discount (COD)',
      card: '₹30 Card Discount',
      netbanking: '₹40 NetBanking Discount',
    };

    return {
      basePrice: SINGLE_PRICE,
      discount,
      discountReason: discountReasons[paymentMethod] || 'No discount',
      finalPrice,
      isComboOffer: false,
    };
  }
}

/**
 * Get all pricing options for a given number of items
 * Useful for showing comparison table
 */
export function getAllPricingOptions(totalItems: number) {
  const isCombo = totalItems >= MIN_COMBO_ITEMS;

  if (isCombo) {
    return {
      comboPrice: COMBO_PRICE,
      singlePrice: SINGLE_PRICE * totalItems,
      savings: SINGLE_PRICE * totalItems - COMBO_PRICE,
      message: `💰 Combo Offer Active! Buy ${totalItems} shoes for just ₹${COMBO_PRICE}`,
    };
  }

  return {
    upi: calculatePrice(1, 'upi').finalPrice,
    cod: calculatePrice(1, 'cod').finalPrice,
    card: calculatePrice(1, 'card').finalPrice,
    netbanking: calculatePrice(1, 'netbanking').finalPrice,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Get discount badge text
 */
export function getDiscountBadge(pricing: PricingInfo): string {
  if (pricing.isComboOffer && pricing.comboSavings) {
    return `Save ₹${pricing.comboSavings}`;
  }
  if (pricing.discount > 0) {
    return `Save ₹${pricing.discount}`;
  }
  return '';
}
