import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Lazy supabase client
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    if (url && key) _supabase = createClient(url, key);
  }
  return _supabase;
}

export interface ShoeOffer {
  shoeId: number;
  discountPercent?: number;
  customPrice?: number;
  enabled: boolean;
  badgeText?: string;
}

export type ProductOffersMap = Record<number, ShoeOffer>;

const OFFERS_STORAGE_KEY = 'topsun_product_offers';
const OFFERS_EVENT_KEY = 'topsun_product_offers_update';

const DEFAULT_OFFERS: ProductOffersMap = {
  1: { shoeId: 1, discountPercent: 0, enabled: false },
  2: { shoeId: 2, discountPercent: 0, enabled: false },
  3: { shoeId: 3, discountPercent: 0, enabled: false },
  4: { shoeId: 4, discountPercent: 0, enabled: false },
  5: { shoeId: 5, discountPercent: 0, enabled: false },
  6: { shoeId: 6, discountPercent: 0, enabled: false },
  7: { shoeId: 7, discountPercent: 0, enabled: false },
};

// ─── Local cache helpers ────────────────────────────────────────────────────
export function getProductOffers(): ProductOffersMap {
  try {
    const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_OFFERS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_OFFERS };
}

function localSetOffers(offers: ProductOffersMap) {
  try {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
    window.dispatchEvent(new CustomEvent(OFFERS_EVENT_KEY, { detail: offers }));
  } catch {}
}

// ─── Fetch from Supabase ────────────────────────────────────────────────────
export async function fetchRemoteProductOffers(): Promise<ProductOffersMap | null> {
  try {
    const sb = getSupabase();
    if (!sb) return null;
    const { data, error } = await sb
      .from('sales_banner_settings')
      .select('product_offers')
      .eq('id', 'default')
      .single();
    if (error || !data?.product_offers) return null;
    const remote = data.product_offers as ProductOffersMap;
    const merged = { ...DEFAULT_OFFERS, ...remote };
    localSetOffers(merged);
    return merged;
  } catch {
    return null;
  }
}

// ─── Save to Supabase + local broadcast ────────────────────────────────────
export async function saveAllProductOffers(newOffers: ProductOffersMap): Promise<boolean> {
  localSetOffers(newOffers);
  try {
    const sb = getSupabase();
    if (!sb) return false;
    const { error } = await sb
      .from('sales_banner_settings')
      .update({ product_offers: newOffers, updated_at: new Date().toISOString() })
      .eq('id', 'default');
    return !error;
  } catch {
    return false;
  }
}

export function saveProductOffer(shoeId: number, offer: Partial<ShoeOffer>) {
  const current = getProductOffers();
  const updated: ProductOffersMap = {
    ...current,
    [shoeId]: { ...current[shoeId], ...offer, shoeId },
  };
  saveAllProductOffers(updated);
  return updated;
}

export function resetAllProductOffers() {
  localSetOffers({ ...DEFAULT_OFFERS });
  saveAllProductOffers({ ...DEFAULT_OFFERS });
}

// ─── Price calculator (pure, no side effects) ──────────────────────────────
export function calculateShoePrice(
  originalPrice: number,
  offer?: ShoeOffer,
): { price: number; discount: number; badge: string; hasOffer: boolean } {
  if (!offer || !offer.enabled) {
    return { price: originalPrice, discount: 0, badge: '', hasOffer: false };
  }
  if (typeof offer.customPrice === 'number' && offer.customPrice > 0 && offer.customPrice < originalPrice) {
    const diff = originalPrice - offer.customPrice;
    const discount = Math.round((diff / originalPrice) * 100);
    return { price: offer.customPrice, discount, badge: offer.badgeText || `${discount}% OFF`, hasOffer: true };
  }
  if (typeof offer.discountPercent === 'number' && offer.discountPercent > 0) {
    const pct = Math.min(Math.max(offer.discountPercent, 1), 90);
    const discountedPrice = Math.round(originalPrice * (1 - pct / 100));
    return { price: discountedPrice, discount: pct, badge: offer.badgeText || `${pct}% OFF`, hasOffer: true };
  }
  return { price: originalPrice, discount: 0, badge: '', hasOffer: false };
}

// ─── React hook: subscribes to local + Supabase Realtime ────────────────────
export function useProductOffers() {
  const [offers, setOffers] = useState<ProductOffersMap>(getProductOffers);

  useEffect(() => {
    // Fetch latest from Supabase on mount
    fetchRemoteProductOffers().then(remote => {
      if (remote) setOffers(remote);
    });

    // Listen for local dispatches (same tab)
    const handleUpdate = (e: Event) => {
      const ev = e as CustomEvent<ProductOffersMap>;
      setOffers(ev.detail ? { ...DEFAULT_OFFERS, ...ev.detail } : getProductOffers());
    };
    window.addEventListener(OFFERS_EVENT_KEY, handleUpdate);

    // Supabase Realtime subscription (cross-tab / cross-device)
    const sb = getSupabase();
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;
    if (sb) {
      channel = sb
        .channel('product_offers_rt')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'sales_banner_settings',
          filter: "id=eq.default",
        }, (payload: any) => {
          const remote = payload.new?.product_offers as ProductOffersMap | undefined;
          if (remote) {
            const merged = { ...DEFAULT_OFFERS, ...remote };
            localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(merged));
            setOffers(merged);
          }
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener(OFFERS_EVENT_KEY, handleUpdate);
      channel?.unsubscribe();
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
