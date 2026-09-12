import { useState, useEffect } from 'react';

export interface ShoeOffer {
  shoeId: number;
  discountPercent?: number; // e.g., 20 for 20% OFF
  customPrice?: number;     // e.g., 1999 promotional price
  enabled: boolean;
  badgeText?: string;       // e.g., "LIMITED OFFER", "FLASH SALE"
}

export type ProductOffersMap = Record<number, ShoeOffer>;

const OFFERS_STORAGE_KEY = 'topsun_product_offers';
const OFFERS_EVENT_KEY = 'topsun_product_offers_update';

/**
 * Default offers configuration.
 * By default, each shoe is sold at its originalPrice unless an admin specifies a promotional offer.
 */
const DEFAULT_OFFERS: ProductOffersMap = {
  1: { shoeId: 1, discountPercent: 0, enabled: false }, // Airflex (Original: 4000)
  2: { shoeId: 2, discountPercent: 0, enabled: false }, // Duro Ridge (Original: 5500)
  3: { shoeId: 3, discountPercent: 0, enabled: false }, // Sunspark (Original: 5700)
  4: { shoeId: 4, discountPercent: 0, enabled: false }, // Duskflex (Original: 6000)
  5: { shoeId: 5, discountPercent: 0, enabled: false }, // Emberflex (Original: 5000)
  6: { shoeId: 6, discountPercent: 0, enabled: false }, // Cloudmax (Original: 4500)
  7: { shoeId: 7, discountPercent: 0, enabled: false }, // Hyperflow (Original: 4800)
};

export function getProductOffers(): ProductOffersMap {
  try {
    const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_OFFERS, ...parsed };
    }
  } catch (e) {
    // Ignore storage parse error
  }
  return DEFAULT_OFFERS;
}

export function saveProductOffer(shoeId: number, offer: Partial<ShoeOffer>) {
  try {
    const current = getProductOffers();
    const updated: ProductOffersMap = {
      ...current,
      [shoeId]: {
        ...current[shoeId],
        ...offer,
        shoeId,
      },
    };
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(OFFERS_EVENT_KEY, { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Failed to save product offer', e);
    return getProductOffers();
  }
}

export function saveAllProductOffers(newOffers: ProductOffersMap) {
  try {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(newOffers));
    window.dispatchEvent(new CustomEvent(OFFERS_EVENT_KEY, { detail: newOffers }));
  } catch (e) {
    console.error('Failed to save all product offers', e);
  }
}

export function resetAllProductOffers() {
  try {
    localStorage.removeItem(OFFERS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(OFFERS_EVENT_KEY, { detail: DEFAULT_OFFERS }));
  } catch (e) {
    console.error('Failed to reset product offers', e);
  }
}

/**
 * Calculates the final selling price strictly from originalPrice:
 * - If offer is active with discountPercent: originalPrice * (1 - discount/100)
 * - If offer is active with customPrice: customPrice
 * - Otherwise: originalPrice (no discount)
 */
export function calculateShoePrice(originalPrice: number, offer?: ShoeOffer): {
  price: number;
  discount: number;
  badge: string;
  hasOffer: boolean;
} {
  if (!offer || !offer.enabled) {
    return {
      price: originalPrice,
      discount: 0,
      badge: '',
      hasOffer: false,
    };
  }

  if (typeof offer.customPrice === 'number' && offer.customPrice > 0 && offer.customPrice < originalPrice) {
    const diff = originalPrice - offer.customPrice;
    const discount = Math.round((diff / originalPrice) * 100);
    return {
      price: offer.customPrice,
      discount,
      badge: offer.badgeText || `${discount}% OFF`,
      hasOffer: true,
    };
  }

  if (typeof offer.discountPercent === 'number' && offer.discountPercent > 0) {
    const pct = Math.min(Math.max(offer.discountPercent, 1), 90);
    const discountedPrice = Math.round(originalPrice * (1 - pct / 100));
    return {
      price: discountedPrice,
      discount: pct,
      badge: offer.badgeText || `${pct}% OFF`,
      hasOffer: true,
    };
  }

  return {
    price: originalPrice,
    discount: 0,
    badge: '',
    hasOffer: false,
  };
}

/**
 * Custom React hook that subscribes to product offer changes and re-renders components.
 */
export function useProductOffers() {
  const [offers, setOffers] = useState<ProductOffersMap>(getProductOffers);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ProductOffersMap>;
      if (customEvent.detail) {
        setOffers(customEvent.detail);
      } else {
        setOffers(getProductOffers());
      }
    };

    window.addEventListener(OFFERS_EVENT_KEY, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(OFFERS_EVENT_KEY, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    offers,
    saveProductOffer,
    saveAllProductOffers,
    resetAllProductOffers,
    calculateShoePrice,
  };
}
