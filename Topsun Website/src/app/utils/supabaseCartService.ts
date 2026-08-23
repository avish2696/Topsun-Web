/**
 * Supabase Cart Service
 * Handles all cart operations using Supabase PostgreSQL
 */

import { supabase } from '@/supabase';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export const supabaseCartService = {
  /**
   * Get user's cart
   */
  async getCart(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching cart:', error.message);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      quantity: item.quantity,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  },

  /**
   * Add item to cart
   */
  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to cart:', error.message);
      throw new Error(error.message || 'Failed to add to cart');
    }

    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      quantity: data.quantity,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(cartId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity })
      .eq('id', cartId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to update cart item');
    }

    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      quantity: data.quantity,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(cartId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId);

    if (error) {
      throw new Error(error.message || 'Failed to remove from cart');
    }
  },

  /**
   * Clear all items from user's cart
   */
  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message || 'Failed to clear cart');
    }
  },
};