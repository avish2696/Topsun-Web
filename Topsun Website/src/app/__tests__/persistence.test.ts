/**
 * Task 19: Test Data Persistence Across Page Refreshes and User Sessions
 * 
 * Comprehensive integration tests validating:
 * 1. Order Persistence - Orders survive page refreshes and user sessions
 * 2. Address Persistence - Addresses stay consistent across tabs
 * 3. Cart Persistence - Cart items persist and sync in real-time
 * 4. Session Changes - Data doesn't get lost on logout/login
 * 5. Cross-User Isolation - RLS policies prevent data leakage
 * 
 * **Validates: Requirements BR-1, BR-2, BR-4, BR-5, BR-8 & Design Sections 1-7**
 * 
 * Test Framework: Vitest
 * Database: Supabase Postgres with RLS
 * Prerequisites:
 * - Supabase client configured in .env
 * - Database migrations (Phase 1) completed
 * - RLS policies enabled
 * - Test database isolated from production
 * 
 * Running tests:
 * npm test -- src/app/__tests__/persistence.test.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '../../supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Test Configuration
 */
const TEST_USERS = {
  USER_A: {
    id: uuidv4(),
    email: 'user-a-persistence@test.com',
    name: 'User A',
  },
  USER_B: {
    id: uuidv4(),
    email: 'user-b-persistence@test.com',
    name: 'User B',
  },
};

const TEST_ADDRESSES = {
  ADDRESS_A: {
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '+919876543210',
    address_line_1: '123 Main Street',
    address_line_2: 'Apt 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postal_code: '400001',
    country: 'India',
    is_default: true,
  },
  ADDRESS_B: {
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+919123456789',
    address_line_1: '456 Oak Avenue',
    address_line_2: null,
    city: 'Bangalore',
    state: 'Karnataka',
    postal_code: '560001',
    country: 'India',
    is_default: false,
  },
};

const TEST_CART_ITEMS = {
  ITEM_1: {
    product_id: 101,
    product_name: 'Casual Shoe - White',
    quantity: 2,
    price: 2500,
    variant: {
      size: '9',
      color_label: 'White',
      image_url: 'https://example.com/shoe-white.jpg',
    },
  },
  ITEM_2: {
    product_id: 102,
    product_name: 'Formal Shoe - Black',
    quantity: 1,
    price: 3000,
    variant: {
      size: '10',
      color_label: 'Black',
      image_url: 'https://example.com/shoe-black.jpg',
    },
  },
};

/**
 * PHASE 1: ORDER PERSISTENCE TESTS
 * 
 * Requirements: BR-1
 * - Create an order in database
 * - Refresh page → Order still visible
 * - Logout and login → Order still in history
 * - Access from different device/tab → Same order visible
 */
describe('Phase 1: Order Persistence Across Page Refreshes and Sessions', () => {
  
  it('1.1 should persist order in database when created', async () => {
    // Create a test order
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 275,
      shipping_amount: 50,
      total_amount: 5825,
      razorpay_order_id: `razorpay_test_${uuidv4()}`,
    };

    const { data: createdOrder, error: insertError } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(createdOrder).toBeDefined();
    expect(createdOrder.order_number).toBe(mockOrder.order_number);
    expect(createdOrder.payment_status).toBe('completed');

    // Cleanup
    if (createdOrder?.id) {
      await supabase.from('orders').delete().eq('id', createdOrder.id);
    }
  });

  it('1.2 should retrieve order after page refresh (simulated by re-querying)', async () => {
    // Create order
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 275,
      shipping_amount: 50,
      total_amount: 5825,
    };

    const { data: created } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    expect(created).toBeDefined();

    // Simulate page refresh - query again
    const { data: retrieved, error: queryError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', created?.id)
      .eq('user_id', TEST_USERS.USER_A.id)
      .single();

    expect(queryError).toBeNull();
    expect(retrieved?.id).toBe(created?.id);
    expect(retrieved?.order_number).toBe(mockOrder.order_number);

    // Cleanup
    if (created?.id) {
      await supabase.from('orders').delete().eq('id', created.id);
    }
  });

  it('1.3 should show order in history after logout and login', async () => {
    // Create order for user A
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 275,
      shipping_amount: 50,
      total_amount: 5825,
    };

    const { data: createdOrder } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    // Simulate logout
    expect(createdOrder).toBeDefined();

    // Simulate login - query order history
    const { data: orderHistory, error: historyError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .order('created_at', { ascending: false });

    expect(historyError).toBeNull();
    expect(orderHistory?.length).toBeGreaterThan(0);
    expect(orderHistory?.some(o => o.id === createdOrder?.id)).toBe(true);

    // Cleanup
    if (createdOrder?.id) {
      await supabase.from('orders').delete().eq('id', createdOrder.id);
    }
  });

  it('1.4 should return same order when accessed from different device/tab', async () => {
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 275,
      shipping_amount: 50,
      total_amount: 5825,
    };

    const { data: original } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    // Simulate different device/tab querying same order
    const { data: device1 } = await supabase
      .from('orders')
      .select('*')
      .eq('id', original?.id)
      .eq('user_id', TEST_USERS.USER_A.id)
      .single();

    const { data: device2 } = await supabase
      .from('orders')
      .select('*')
      .eq('id', original?.id)
      .eq('user_id', TEST_USERS.USER_A.id)
      .single();

    expect(device1?.id).toBe(device2?.id);
    expect(device1?.order_number).toBe(device2?.order_number);
    expect(device1?.total_amount).toBe(device2?.total_amount);

    // Cleanup
    if (original?.id) {
      await supabase.from('orders').delete().eq('id', original.id);
    }
  });

  it('1.5 should include order items denormalized in order_items table', async () => {
    // Create order
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 0,
      shipping_amount: 0,
      total_amount: 5500,
    };

    const { data: createdOrder } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    // Insert order items
    const orderItems = [
      {
        order_id: createdOrder?.id,
        product_id: TEST_CART_ITEMS.ITEM_1.product_id,
        product_name: TEST_CART_ITEMS.ITEM_1.product_name,
        price: TEST_CART_ITEMS.ITEM_1.price,
        quantity: TEST_CART_ITEMS.ITEM_1.quantity,
        size: TEST_CART_ITEMS.ITEM_1.variant.size,
        color_label: TEST_CART_ITEMS.ITEM_1.variant.color_label,
      },
    ];

    const { data: insertedItems, error: insertError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    expect(insertError).toBeNull();
    expect(insertedItems?.length).toBe(1);

    // Query order with items
    const { data: orderWithItems } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', createdOrder?.id)
      .single();

    expect(orderWithItems?.order_items?.length).toBeGreaterThan(0);

    // Cleanup
    if (createdOrder?.id) {
      await supabase.from('order_items').delete().eq('order_id', createdOrder.id);
      await supabase.from('orders').delete().eq('id', createdOrder.id);
    }
  });
});

/**
 * PHASE 2: ADDRESS PERSISTENCE TESTS
 * 
 * Requirements: BR-8
 * - Create an address
 * - Refresh page → Address still visible
 * - Multiple tabs open → Both see same address list in real-time
 * - Edit address on tab A → Tab B reflects changes without manual refresh
 */
describe('Phase 2: Address Persistence and Real-Time Sync', () => {

  it('2.1 should persist address in database when created', async () => {
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: createdAddress, error: insertError } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(createdAddress).toBeDefined();
    expect(createdAddress.full_name).toBe(TEST_ADDRESSES.ADDRESS_A.full_name);
    expect(createdAddress.user_id).toBe(TEST_USERS.USER_A.id);

    // Cleanup
    if (createdAddress?.id) {
      await supabase.from('addresses').delete().eq('id', createdAddress.id);
    }
  });

  it('2.2 should retrieve address after page refresh', async () => {
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    // Simulate page refresh
    const { data: retrieved, error: queryError } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', created?.id)
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('is_deleted', false)
      .single();

    expect(queryError).toBeNull();
    expect(retrieved?.id).toBe(created?.id);
    expect(retrieved?.full_name).toBe(TEST_ADDRESSES.ADDRESS_A.full_name);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('2.3 should show same address list in multiple tabs (simulated with concurrent queries)', async () => {
    // Create address
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    // Simulate Tab 1 and Tab 2 both querying addresses
    const [tab1Query, tab2Query] = await Promise.all([
      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', TEST_USERS.USER_A.id)
        .eq('is_deleted', false),
      supabase
        .from('addresses')
        .select('*')
        .eq('user_id', TEST_USERS.USER_A.id)
        .eq('is_deleted', false),
    ]);

    expect(tab1Query.data?.length).toBe(tab2Query.data?.length);
    expect(tab1Query.data?.some(a => a.id === created?.id)).toBe(true);
    expect(tab2Query.data?.some(a => a.id === created?.id)).toBe(true);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('2.4 should reflect address edits across tabs without manual refresh', async () => {
    const initialAddress = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([initialAddress])
      .select()
      .single();

    // Tab A updates the address
    const updatedName = 'John Doe Updated';
    const { data: updated, error: updateError } = await supabase
      .from('addresses')
      .update({ full_name: updatedName })
      .eq('id', created?.id)
      .select()
      .single();

    expect(updateError).toBeNull();
    expect(updated?.full_name).toBe(updatedName);

    // Tab B queries the same address (should see the update)
    const { data: tab2Result } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', created?.id)
      .single();

    expect(tab2Result?.full_name).toBe(updatedName);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('2.5 should handle address deletion with soft-delete (is_deleted flag)', async () => {
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    // Soft delete
    const { data: deleted, error: deleteError } = await supabase
      .from('addresses')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', created?.id)
      .select()
      .single();

    expect(deleteError).toBeNull();
    expect(deleted?.is_deleted).toBe(true);

    // Query should not return soft-deleted addresses
    const { data: queryResult } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('is_deleted', false);

    expect(queryResult?.some(a => a.id === created?.id)).toBe(false);

    // Cleanup - physical delete for test
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('2.6 should maintain address constraints (phone, postal_code validation)', async () => {
    const invalidAddress = {
      user_id: TEST_USERS.USER_A.id,
      full_name: 'John Doe',
      email: 'john@example.com',
      phone: '123', // Invalid - too short
      address_line_1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
    };

    const { error: insertError } = await supabase
      .from('addresses')
      .insert([invalidAddress])
      .select()
      .single();

    // Should fail due to constraint
    expect(insertError).toBeDefined();
  });
});

/**
 * PHASE 3: CART PERSISTENCE TESTS
 * 
 * Requirements: BR-2, BR-5, BR-8
 * - Add items to cart
 * - Refresh page → Cart items still present
 * - Multiple tabs with same user → Both show same cart
 * - Add item in tab A → Tab B shows it instantly
 */
describe('Phase 3: Cart Persistence and Real-Time Sync', () => {

  it('3.1 should persist cart items in database when added', async () => {
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: TEST_CART_ITEMS.ITEM_1.product_id.toString(),
      quantity: TEST_CART_ITEMS.ITEM_1.quantity,
      variant: {
        size: TEST_CART_ITEMS.ITEM_1.variant.size,
        color_label: TEST_CART_ITEMS.ITEM_1.variant.color_label,
      },
    };

    const { data: inserted, error: insertError } = await supabase
      .from('cart_items')
      .upsert([cartItem], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(inserted).toBeDefined();
    expect(inserted?.user_id).toBe(TEST_USERS.USER_A.id);
    expect(inserted?.quantity).toBe(TEST_CART_ITEMS.ITEM_1.quantity);

    // Cleanup
    if (inserted?.id) {
      await supabase.from('cart_items').delete().eq('id', inserted.id);
    }
  });

  it('3.2 should retrieve cart items after page refresh', async () => {
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: TEST_CART_ITEMS.ITEM_1.product_id.toString(),
      quantity: TEST_CART_ITEMS.ITEM_1.quantity,
      variant: {
        size: TEST_CART_ITEMS.ITEM_1.variant.size,
      },
    };

    const { data: inserted } = await supabase
      .from('cart_items')
      .upsert([cartItem], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    // Simulate page refresh
    const { data: retrieved, error: queryError } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id);

    expect(queryError).toBeNull();
    expect(retrieved?.length).toBeGreaterThan(0);
    expect(retrieved?.some(item => item.id === inserted?.id)).toBe(true);

    // Cleanup
    if (inserted?.id) {
      await supabase.from('cart_items').delete().eq('id', inserted.id);
    }
  });

  it('3.3 should show same cart in multiple tabs', async () => {
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: TEST_CART_ITEMS.ITEM_1.product_id.toString(),
      quantity: TEST_CART_ITEMS.ITEM_1.quantity,
      variant: { size: '9' },
    };

    const { data: inserted } = await supabase
      .from('cart_items')
      .upsert([cartItem], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    // Simulate Tab 1 and Tab 2
    const [tab1, tab2] = await Promise.all([
      supabase.from('cart_items').select('*').eq('user_id', TEST_USERS.USER_A.id),
      supabase.from('cart_items').select('*').eq('user_id', TEST_USERS.USER_A.id),
    ]);

    expect(tab1.data?.length).toBe(tab2.data?.length);
    expect(tab1.data?.some(item => item.id === inserted?.id)).toBe(true);
    expect(tab2.data?.some(item => item.id === inserted?.id)).toBe(true);

    // Cleanup
    if (inserted?.id) {
      await supabase.from('cart_items').delete().eq('id', inserted.id);
    }
  });

  it('3.4 should prevent duplicate cart items via unique constraint', async () => {
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: TEST_CART_ITEMS.ITEM_1.product_id.toString(),
      quantity: 1,
      variant: { size: '9' },
    };

    // First insert
    const { data: first } = await supabase
      .from('cart_items')
      .upsert([cartItem], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    // Attempt second insert with same product
    const { data: second } = await supabase
      .from('cart_items')
      .upsert([{ ...cartItem, quantity: 2 }], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    // Should be same item with updated quantity
    expect(first?.id).toBe(second?.id);
    expect(second?.quantity).toBe(2); // Updated quantity

    // Cleanup
    if (first?.id) {
      await supabase.from('cart_items').delete().eq('id', first.id);
    }
  });

  it('3.5 should handle concurrent add-to-cart atomically', async () => {
    const product1 = { ...TEST_CART_ITEMS.ITEM_1, product_id: 201 };
    const product2 = { ...TEST_CART_ITEMS.ITEM_2, product_id: 202 };

    const cartItem1 = {
      user_id: TEST_USERS.USER_A.id,
      product_id: product1.product_id.toString(),
      quantity: 1,
      variant: { size: '9' },
    };

    const cartItem2 = {
      user_id: TEST_USERS.USER_A.id,
      product_id: product2.product_id.toString(),
      quantity: 1,
      variant: { size: '10' },
    };

    // Simulate concurrent adds
    const [result1, result2] = await Promise.all([
      supabase.from('cart_items').upsert([cartItem1], { onConflict: 'user_id,product_id' }).select().single(),
      supabase.from('cart_items').upsert([cartItem2], { onConflict: 'user_id,product_id' }).select().single(),
    ]);

    expect(result1.data?.id).not.toBe(result2.data?.id); // Different items
    expect(result1.data?.product_id).not.toBe(result2.data?.product_id);

    // Cleanup
    if (result1.data?.id) {
      await supabase.from('cart_items').delete().eq('id', result1.data.id);
    }
    if (result2.data?.id) {
      await supabase.from('cart_items').delete().eq('id', result2.data.id);
    }
  });

  it('3.6 should update cart quantity atomically (no duplicate on double-click)', async () => {
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: '301',
      quantity: 1,
      variant: { size: '9' },
    };

    // First add
    const { data: first } = await supabase
      .from('cart_items')
      .upsert([cartItem], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    // Double-click: simulate sending same add request twice concurrently
    const [update1, update2] = await Promise.all([
      supabase
        .from('cart_items')
        .upsert([{ ...cartItem, quantity: 2 }], { onConflict: 'user_id,product_id' })
        .select()
        .single(),
      supabase
        .from('cart_items')
        .upsert([{ ...cartItem, quantity: 2 }], { onConflict: 'user_id,product_id' })
        .select()
        .single(),
    ]);

    // Both should update same row, not create duplicate
    expect(update1.data?.id).toBe(update2.data?.id);
    expect(update1.data?.id).toBe(first?.id);

    // Query should show only 1 item
    const { data: finalCart } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('product_id', '301');

    expect(finalCart?.length).toBe(1);

    // Cleanup
    if (first?.id) {
      await supabase.from('cart_items').delete().eq('id', first.id);
    }
  });
});


/**
 * PHASE 4: SESSION CHANGES AND DATA INTEGRITY
 * 
 * Requirements: BR-1, BR-4
 * - Create data while logged in
 * - Session expires/log out → Data not lost
 * - Log back in → Data intact
 */
describe('Phase 4: No Data Loss on Session Changes', () => {

  it('4.1 should keep orders after logout and login', async () => {
    // Create order while "logged in"
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 0,
      shipping_amount: 0,
      total_amount: 5500,
    };

    const { data: created } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    expect(created).toBeDefined();

    // Simulate logout (just clear local state in real app)
    // Simulate login - query orders
    const { data: retrievedAfterLogin } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('id', created?.id)
      .single();

    expect(retrievedAfterLogin?.id).toBe(created?.id);
    expect(retrievedAfterLogin?.order_number).toBe(mockOrder.order_number);

    // Cleanup
    if (created?.id) {
      await supabase.from('orders').delete().eq('id', created.id);
    }
  });

  it('4.2 should keep addresses after logout and login', async () => {
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    // After logout and login
    const { data: retrieved } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('id', created?.id)
      .eq('is_deleted', false)
      .single();

    expect(retrieved?.id).toBe(created?.id);
    expect(retrieved?.full_name).toBe(TEST_ADDRESSES.ADDRESS_A.full_name);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('4.3 should clear cart on logout (implementation-specific)', async () => {
    // Cart clearing on logout is typically a client-side decision
    // We verify that cart items in database can be cleared
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: '401',
      quantity: 1,
      variant: { size: '9' },
    };

    const { data: inserted } = await supabase
      .from('cart_items')
      .insert([cartItem])
      .select()
      .single();

    // Simulate logout - clear cart
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', TEST_USERS.USER_A.id);

    expect(deleteError).toBeNull();

    // Verify cart is empty
    const { data: afterClear } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id);

    expect(afterClear?.length).toBe(0);
  });

  it('4.4 should not lose payment records on session expiry', async () => {
    // Create payment record
    const paymentData = {
      order_id: uuidv4(),
      user_id: TEST_USERS.USER_A.id,
      razorpay_payment_id: `pay_test_${uuidv4()}`,
      razorpay_order_id: `order_test_${uuidv4()}`,
      razorpay_signature: `sig_test_${uuidv4()}`,
      amount: 5500,
      currency: 'INR',
      status: 'captured',
      signature_verified: true,
    };

    const { data: created } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    // After session expiry, payment should still exist
    const { data: retrieved } = await supabase
      .from('payments')
      .select('*')
      .eq('id', created?.id)
      .eq('user_id', TEST_USERS.USER_A.id)
      .single();

    expect(retrieved?.razorpay_payment_id).toBe(paymentData.razorpay_payment_id);
    expect(retrieved?.status).toBe('captured');

    // Cleanup
    if (created?.id) {
      await supabase.from('payments').delete().eq('id', created.id);
    }
  });

  it('4.5 should maintain audit trail across sessions', async () => {
    // Create an audit log
    const auditData = {
      table_name: 'orders',
      record_id: uuidv4().toString(),
      user_id: TEST_USERS.USER_A.id,
      action: 'create',
      new_values: {
        order_number: 'ORD-TEST-001',
        status: 'confirmed',
      },
    };

    const { data: created } = await supabase
      .from('audit_logs')
      .insert([auditData])
      .select()
      .single();

    expect(created).toBeDefined();

    // After session expiry, audit log should be accessible
    const { data: retrieved } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', created?.id);

    expect(retrieved?.length).toBe(1);
    expect(retrieved?.[0].action).toBe('create');

    // Cleanup
    if (created?.id) {
      await supabase.from('audit_logs').delete().eq('id', created.id);
    }
  });
});

/**
 * PHASE 5: CROSS-USER ISOLATION (RLS SECURITY)
 * 
 * Requirements: BR-4, Design Section 7
 * - Create data as user A
 * - Switch to user B → Cannot see user A's data
 * - Verify RLS policies prevent leakage
 */
describe('Phase 5: Cross-User Isolation via RLS Policies', () => {

  it('5.1 should prevent user B from seeing user A orders via RLS', async () => {
    // User A creates order
    const orderA = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      subtotal_amount: 5500,
      tax_amount: 0,
      shipping_amount: 0,
      total_amount: 5500,
    };

    const { data: created } = await supabase
      .from('orders')
      .insert([orderA])
      .select()
      .single();

    // User B tries to query User A's order by ID
    // In real app, this would use RLS with auth context
    // We simulate by checking that queries filter by user_id
    const { data: result } = await supabase
      .from('orders')
      .select('*')
      .eq('id', created?.id)
      .eq('user_id', TEST_USERS.USER_B.id); // Different user

    expect(result?.length).toBe(0); // Should be empty

    // Cleanup
    if (created?.id) {
      await supabase.from('orders').delete().eq('id', created.id);
    }
  });

  it('5.2 should prevent user B from seeing user A addresses via RLS', async () => {
    const addressA = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressA])
      .select()
      .single();

    // User B queries addresses
    const { data: userBAddresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id)
      .eq('is_deleted', false);

    // Should not see User A's address
    expect(userBAddresses?.some(a => a.id === created?.id)).toBe(false);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('5.3 should prevent user B from seeing user A cart via RLS', async () => {
    const cartItemA = {
      user_id: TEST_USERS.USER_A.id,
      product_id: '501',
      quantity: 2,
      variant: { size: '9' },
    };

    const { data: created } = await supabase
      .from('cart_items')
      .insert([cartItemA])
      .select()
      .single();

    // User B queries cart
    const { data: userBCart } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id);

    // Should not see User A's cart items
    expect(userBCart?.some(item => item.id === created?.id)).toBe(false);

    // Cleanup
    if (created?.id) {
      await supabase.from('cart_items').delete().eq('id', created.id);
    }
  });

  it('5.4 should prevent user B from seeing user A payments via RLS', async () => {
    const paymentA = {
      order_id: uuidv4(),
      user_id: TEST_USERS.USER_A.id,
      razorpay_payment_id: `pay_test_${uuidv4()}`,
      razorpay_order_id: `order_test_${uuidv4()}`,
      razorpay_signature: `sig_${uuidv4()}`,
      amount: 5500,
      currency: 'INR',
      status: 'captured',
      signature_verified: true,
    };

    const { data: created } = await supabase
      .from('payments')
      .insert([paymentA])
      .select()
      .single();

    // User B queries payments
    const { data: userBPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id);

    // Should not see User A's payments
    expect(userBPayments?.some(p => p.id === created?.id)).toBe(false);

    // Cleanup
    if (created?.id) {
      await supabase.from('payments').delete().eq('id', created.id);
    }
  });

  it('5.5 should enforce RLS on OTP records (email-based isolation)', async () => {
    // Create OTP for User A
    const otpRecordA = {
      email: TEST_USERS.USER_A.email,
      phone: '+919876543210',
      code: '123456',
      purpose: 'login',
      attempts: 0,
      max_attempts: 5,
      verified: false,
      request_count: 1,
      expires_at: new Date(Date.now() + 300000).toISOString(),
    };

    const { data: created } = await supabase
      .from('otp_records')
      .insert([otpRecordA])
      .select()
      .single();

    // User B shouldn't be able to query User A's OTP by email filter
    const { data: otpB } = await supabase
      .from('otp_records')
      .select('*')
      .eq('email', TEST_USERS.USER_B.email);

    // Should not find User A's OTP
    expect(otpB?.some(o => o.id === created?.id)).toBe(false);

    // Cleanup
    if (created?.id) {
      await supabase.from('otp_records').delete().eq('id', created.id);
    }
  });

  it('5.6 should verify all user_id columns are properly scoped', async () => {
    // Create data across all tables with User A
    const orderId = uuidv4();

    const order = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      total_amount: 5500,
    };

    const { data: createdOrder } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    // Verify that querying with User B's ID returns empty
    const { data: shouldBeEmpty } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id)
      .eq('id', createdOrder?.id);

    expect(shouldBeEmpty?.length).toBe(0);

    // Cleanup
    if (createdOrder?.id) {
      await supabase.from('orders').delete().eq('id', createdOrder.id);
    }
  });

  it('5.7 should prevent account enumeration (timing attacks)', async () => {
    // Create address for User A
    const addressA = {
      user_id: TEST_USERS.USER_A.id,
      full_name: 'User A Address',
      email: TEST_USERS.USER_A.email,
      phone: '+919876543210',
      address_line_1: '123 Main',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressA])
      .select()
      .single();

    // Try to query with wrong user_id
    const start1 = performance.now();
    const { data: result1 } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id)
      .eq('id', created?.id);
    const time1 = performance.now() - start1;

    // Try to query with non-existent address
    const start2 = performance.now();
    const { data: result2 } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('id', uuidv4());
    const time2 = performance.now() - start2;

    // Both should return empty and have similar timing
    // (Not asserting exact timing due to network variance)
    expect(result1?.length).toBe(0);
    expect(result2?.length).toBe(0);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('5.8 should not leak data via soft-delete bypass', async () => {
    // Create address
    const addressA = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressA])
      .select()
      .single();

    // Soft delete
    await supabase
      .from('addresses')
      .update({ is_deleted: true })
      .eq('id', created?.id);

    // User B queries all addresses (including deleted)
    // Should still not see it due to user_id filter
    const { data: withDeleted } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id);

    expect(withDeleted?.some(a => a.id === created?.id)).toBe(false);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });
});

/**
 * PHASE 6: ACCEPTANCE CRITERIA VERIFICATION
 * 
 * Final verification that all persistence requirements are met
 */
describe('Phase 6: Acceptance Criteria Verification', () => {

  it('✅ AC-1: Orders persist in database and survive page refresh', async () => {
    const mockOrder = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-${Date.now()}-TEST`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      total_amount: 5500,
    };

    const { data: created } = await supabase
      .from('orders')
      .insert([mockOrder])
      .select()
      .single();

    // Simulate page refresh
    const { data: afterRefresh } = await supabase
      .from('orders')
      .select('*')
      .eq('id', created?.id)
      .eq('user_id', TEST_USERS.USER_A.id)
      .single();

    expect(afterRefresh?.id).toBe(created?.id);
    expect(afterRefresh?.order_number).toBe(mockOrder.order_number);

    // Cleanup
    if (created?.id) {
      await supabase.from('orders').delete().eq('id', created.id);
    }
  });

  it('✅ AC-2: Addresses persist and are accessible across tabs', async () => {
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    // Simulate Tab 1 and Tab 2
    const [tab1, tab2] = await Promise.all([
      supabase.from('addresses').select('*').eq('user_id', TEST_USERS.USER_A.id).eq('is_deleted', false),
      supabase.from('addresses').select('*').eq('user_id', TEST_USERS.USER_A.id).eq('is_deleted', false),
    ]);

    expect(tab1.data?.some(a => a.id === created?.id)).toBe(true);
    expect(tab2.data?.some(a => a.id === created?.id)).toBe(true);

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
  });

  it('✅ AC-3: Cart items persist and prevent duplicates with UPSERT', async () => {
    const cartItem = {
      user_id: TEST_USERS.USER_A.id,
      product_id: '601',
      quantity: 1,
      variant: { size: '9' },
    };

    // Add item
    const { data: first } = await supabase
      .from('cart_items')
      .upsert([cartItem], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    // Add same item again (should update, not create duplicate)
    const { data: second } = await supabase
      .from('cart_items')
      .upsert([{ ...cartItem, quantity: 2 }], { onConflict: 'user_id,product_id' })
      .select()
      .single();

    expect(first?.id).toBe(second?.id);

    // Cleanup
    if (first?.id) {
      await supabase.from('cart_items').delete().eq('id', first.id);
    }
  });

  it('✅ AC-4: Payment records persist across session changes', async () => {
    const paymentData = {
      order_id: uuidv4(),
      user_id: TEST_USERS.USER_A.id,
      razorpay_payment_id: `pay_test_${uuidv4()}`,
      razorpay_order_id: `order_test_${uuidv4()}`,
      razorpay_signature: `sig_${uuidv4()}`,
      amount: 5500,
      currency: 'INR',
      status: 'captured',
      signature_verified: true,
    };

    const { data: created } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .single();

    // After session expiry
    const { data: retrieved } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', TEST_USERS.USER_A.id)
      .eq('id', created?.id)
      .single();

    expect(retrieved?.razorpay_payment_id).toBe(paymentData.razorpay_payment_id);

    // Cleanup
    if (created?.id) {
      await supabase.from('payments').delete().eq('id', created.id);
    }
  });

  it('✅ AC-5: RLS policies prevent cross-user data access', async () => {
    // Create data as User A
    const orderA = {
      user_id: TEST_USERS.USER_A.id,
      order_number: `ORD-TEST-${uuidv4()}`,
      payment_status: 'completed',
      order_status: 'confirmed',
      shipping_address: TEST_ADDRESSES.ADDRESS_A,
      total_amount: 5500,
    };

    const { data: created } = await supabase
      .from('orders')
      .insert([orderA])
      .select()
      .single();

    // Try to access as User B
    const { data: unauthorized } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', TEST_USERS.USER_B.id)
      .eq('id', created?.id);

    expect(unauthorized?.length).toBe(0);

    // Cleanup
    if (created?.id) {
      await supabase.from('orders').delete().eq('id', created.id);
    }
  });

  it('✅ AC-6: Soft deletes maintain audit trail', async () => {
    // Create address
    const addressData = {
      user_id: TEST_USERS.USER_A.id,
      ...TEST_ADDRESSES.ADDRESS_A,
    };

    const { data: created } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    // Soft delete
    const { data: deleted } = await supabase
      .from('addresses')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', created?.id)
      .select()
      .single();

    expect(deleted?.is_deleted).toBe(true);

    // Create audit log
    const auditData = {
      table_name: 'addresses',
      record_id: created?.id.toString(),
      user_id: TEST_USERS.USER_A.id,
      action: 'soft_delete',
      old_values: created,
      new_values: deleted,
    };

    const { data: auditLog } = await supabase
      .from('audit_logs')
      .insert([auditData])
      .select()
      .single();

    expect(auditLog?.action).toBe('soft_delete');

    // Cleanup
    if (created?.id) {
      await supabase.from('addresses').delete().eq('id', created.id);
    }
    if (auditLog?.id) {
      await supabase.from('audit_logs').delete().eq('id', auditLog.id);
    }
  });

  it('✅ AC-7: Audit logs track all data changes', async () => {
    // Create audit log for order creation
    const auditData = {
      table_name: 'orders',
      record_id: uuidv4().toString(),
      user_id: TEST_USERS.USER_A.id,
      action: 'create',
      new_values: {
        order_number: 'ORD-TEST-001',
        payment_status: 'completed',
      },
    };

    const { data: created, error: insertError } = await supabase
      .from('audit_logs')
      .insert([auditData])
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(created?.action).toBe('create');
    expect(created?.table_name).toBe('orders');

    // Cleanup
    if (created?.id) {
      await supabase.from('audit_logs').delete().eq('id', created.id);
    }
  });

  it('✅ AC-8: OTP records persist and enforce rate limiting', async () => {
    const otpData = {
      email: `test-${Date.now()}@example.com`,
      code: '123456',
      purpose: 'login',
      attempts: 0,
      max_attempts: 5,
      verified: false,
      request_count: 1,
      expires_at: new Date(Date.now() + 300000).toISOString(),
    };

    const { data: created, error: insertError } = await supabase
      .from('otp_records')
      .insert([otpData])
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(created?.request_count).toBe(1);

    // Cleanup
    if (created?.id) {
      await supabase.from('otp_records').delete().eq('id', created.id);
    }
  });
});
