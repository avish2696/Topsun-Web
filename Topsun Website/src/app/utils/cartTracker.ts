export interface AbandonedCartSession {
  id: string;
  userId?: string;
  customerName: string;
  email?: string;
  phone?: string;
  items: Array<{
    id: number;
    name: string;
    size: number | string;
    colorLabel: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  totalAmount: number;
  stage: 'cart' | 'checkout_shipping' | 'checkout_payment';
  lastActive: string; // ISO string
  recovered?: boolean;
}

const CARTS_STORAGE_KEY = 'topsun_tracked_carts';
const CARTS_EVENT_KEY = 'topsun_tracked_carts_update';

export function getTrackedCarts(): AbandonedCartSession[] {
  try {
    const raw = localStorage.getItem(CARTS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Ignore parse error
  }
  return [];
}

export function recordCartSession(session: Partial<AbandonedCartSession> & { items: any[]; totalAmount: number }) {
  if (!session.items || session.items.length === 0) return;

  try {
    const current = getTrackedCarts();
    const sessionId = session.id || session.phone || session.email || (session.userId ? `user_${session.userId}` : 'guest_active');

    const updatedSession: AbandonedCartSession = {
      id: sessionId,
      userId: session.userId,
      customerName: session.customerName || (session.email ? session.email.split('@')[0] : 'Shopper'),
      email: session.email,
      phone: session.phone,
      items: session.items,
      totalAmount: session.totalAmount,
      stage: session.stage || 'cart',
      lastActive: new Date().toISOString(),
      recovered: false,
    };

    const existingIdx = current.findIndex(c => c.id === sessionId);
    let updatedList: AbandonedCartSession[];
    if (existingIdx >= 0) {
      updatedList = [...current];
      updatedList[existingIdx] = updatedSession;
    } else {
      updatedList = [updatedSession, ...current.slice(0, 49)];
    }

    localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent(CARTS_EVENT_KEY, { detail: updatedList }));
  } catch (e) {
    console.warn('Failed to record cart session', e);
  }
}

export function markCartAsRecovered(sessionId: string) {
  try {
    const current = getTrackedCarts();
    const updated = current.map(c => (c.id === sessionId ? { ...c, recovered: true } : c));
    localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CARTS_EVENT_KEY, { detail: updated }));
  } catch (e) {
    console.warn('Failed to update cart status', e);
  }
}

export function clearCartSession(sessionId?: string) {
  try {
    const current = getTrackedCarts();
    const updated = sessionId ? current.filter(c => c.id !== sessionId) : [];
    localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(CARTS_EVENT_KEY, { detail: updated }));
  } catch (e) {
    console.warn('Failed to clear cart session', e);
  }
}
