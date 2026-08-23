/**
 * Custom hook for Product Detail Page state management
 * Handles size selection, quantity, wishlist, and cart operations
 */

import { useState, useCallback } from 'react';

export interface UsePDPOptions {
  onAddToCart?: (size: number | string, quantity: number) => void;
  onAddToWishlist?: () => void;
}

export interface UsePDPReturn {
  selectedSize: number | string | null;
  setSelectedSize: (size: number | string | null) => void;
  quantity: number;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
  setQuantity: (qty: number) => void;
  isWishlisted: boolean;
  toggleWishlist: () => void;
  handleAddToCart: () => boolean;
  canAddToCart: boolean;
  resetSelection: () => void;
}

/**
 * Hook for managing PDP state
 * @param options - Callback functions
 * @returns State and handlers
 */
export function usePDP(options?: UsePDPOptions): UsePDPReturn {
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => prev + 1);
  }, []);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const toggleWishlist = useCallback(() => {
    setIsWishlisted((prev) => !prev);
    options?.onAddToWishlist?.();
  }, [options]);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      console.warn('Size not selected');
      return false;
    }
    options?.onAddToCart?.(selectedSize, quantity);
    return true;
  }, [selectedSize, quantity, options]);

  const resetSelection = useCallback(() => {
    setSelectedSize(null);
    setQuantity(1);
    setIsWishlisted(false);
  }, []);

  const canAddToCart = selectedSize !== null;

  return {
    selectedSize,
    setSelectedSize,
    quantity,
    incrementQuantity,
    decrementQuantity,
    setQuantity,
    isWishlisted,
    toggleWishlist,
    handleAddToCart,
    canAddToCart,
    resetSelection,
  };
}
