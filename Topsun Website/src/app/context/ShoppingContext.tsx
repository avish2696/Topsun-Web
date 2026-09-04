import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

export interface CartItem {
  id: number;
  slug?: string;
  name: string;
  price: number;
  image: string;
  size: number | string;
  quantity: number;
  colorLabel: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderDate: Date;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  paymentStatus: 'completed' | 'pending' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered';
  estimatedDeliveryDate: Date;
  trackingNumber?: string;
}

interface ShoppingContextType {
  cart: CartItem[];
  orders: Order[];
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: number, size: number | string) => Promise<void>;
  updateCartItem: (id: number, size: number | string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  createOrder: (order: Order) => void;
  getCartItemCount: () => number;
  clearAllData: () => void;
  loadCart: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

// localStorage helpers
function getStorageKey(userId: string | null) {
  return userId ? `topsun_cart_${userId}` : 'topsun_cart_guest';
}

function saveCartToStorage(cart: CartItem[], userId: string | null) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(cart));
  } catch (e) {
    console.warn('Failed to save cart to localStorage');
  }
}

function loadCartFromStorage(userId: string | null): CartItem[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function ShoppingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  // Load cart from storage when user changes or logs in
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.id ?? null;

    // Only run if auth state actually changed (login/logout)
    if (prevUserId === undefined) {
      // Initial mount — just load the appropriate cart
      prevUserIdRef.current = currentUserId;
      if (currentUserId) {
        const userCart = loadCartFromStorage(currentUserId);
        const guestCart = loadCartFromStorage(null);
        const merged = [...userCart];
        for (const guestItem of guestCart) {
          const existing = merged.find(i => i.id === guestItem.id && i.size === guestItem.size);
          if (existing) existing.quantity += guestItem.quantity;
          else merged.push(guestItem);
        }
        setCart(merged);
        saveCartToStorage(merged, currentUserId);
        localStorage.removeItem(getStorageKey(null));
      } else {
        setCart(loadCartFromStorage(null));
      }
      return;
    }

    if (prevUserId === currentUserId) return; // No auth change, skip
    prevUserIdRef.current = currentUserId;

    if (currentUserId) {
      // User just logged in — load their saved cart and merge guest items
      const userCart = loadCartFromStorage(currentUserId);
      const guestCart = loadCartFromStorage(null);

      const merged = [...userCart];
      for (const guestItem of guestCart) {
        const existing = merged.find(i => i.id === guestItem.id && i.size === guestItem.size);
        if (existing) existing.quantity += guestItem.quantity;
        else merged.push(guestItem);
      }

      setCart(merged);
      saveCartToStorage(merged, currentUserId);
      // Clear guest cart after merge
      localStorage.removeItem(getStorageKey(null));
    } else {
      // User just logged out — save current cart as guest and load guest cart
      // DO NOT clear the previous user's saved cart
      setCart(loadCartFromStorage(null));
    }
  }, [user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart, user?.id ?? null);
  }, [cart, user?.id]);

  const loadCart = useCallback(async () => {
    const stored = loadCartFromStorage(user?.id ?? null);
    setCart(stored);
  }, [user?.id]);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(false);
  }, []);

  const addToCart = useCallback(async (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === item.size);
      const updated = existing
        ? prev.map(i =>
            i.id === item.id && i.size === item.size
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          )
        : [...prev, item];
      return updated;
    });
    setIsCartDrawerOpen(true);
    toast.success('Added to cart', { description: `${item.name} (${item.size})` });
  }, []);

  const removeFromCart = useCallback(async (id: number, size: number | string) => {
    setCart(prev => prev.filter(i => !(i.id === id && i.size === size)));
    toast.success('Removed from cart');
  }, []);

  const updateCartItem = useCallback(async (id: number, size: number | string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id, size);
      return;
    }
    setCart(prev =>
      prev.map(i => (i.id === id && i.size === size ? { ...i, quantity } : i))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    saveCartToStorage([], user?.id ?? null);
  }, [user?.id]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => cart.reduce((c, i) => c + i.quantity, 0);

  const createOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
    clearCart();
  }, [clearCart]);

  const clearAllData = useCallback(() => {
    clearCart();
    setOrders([]);
  }, [clearCart]);

  return (
    <ShoppingContext.Provider
      value={{
        cart,
        orders,
        isCartDrawerOpen,
        openCartDrawer,
        closeCartDrawer,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCartTotal,
        createOrder,
        getCartItemCount,
        clearAllData,
        loadCart,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping must be used within ShoppingProvider');
  }
  return context;
}
