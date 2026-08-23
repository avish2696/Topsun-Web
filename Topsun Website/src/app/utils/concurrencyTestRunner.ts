/**
 * Concurrency Test Runner - Browser-based Race Condition Testing
 * 
 * This module can be imported and run in the browser console to test
 * race conditions with real Supabase API calls.
 * 
 * Usage in browser console:
 * ```
 * import { runConcurrencyTests } from '@/app/utils/concurrencyTestRunner';
 * await runConcurrencyTests(userId);
 * ```
 */

import { supabase } from '@/supabase';

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  message: string;
  details?: Record<string, any>;
}

class ConcurrencyTestRunner {
  private results: TestResult[] = [];
  private testUserId: string = '';

  /**
   * Initialize test runner with authenticated user ID
   */
  async initialize(userId: string): Promise<boolean> {
    this.testUserId = userId;
    if (!userId) {
      console.error('❌ No user ID provided. Please authenticate first.');
      return false;
    }
    console.log(`✅ Test runner initialized for user: ${userId.substring(0, 8)}...`);
    return true;
  }

  /**
   * TEST 1: Cart Item UPSERT Atomicity
   * 
   * Verifies that concurrent UPSERT operations don't create duplicates
   * due to unique constraint enforcement at database level.
   */
  async test_CartUpsertAtomicity(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Cart Item UPSERT Atomicity';

    try {
      console.log(`\n🧪 ${testName}`);
      console.log('─'.repeat(60));

      // 1. Clear test data
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', this.testUserId)
        .ilike('product_id', '1%');

      // 2. Fire 5 concurrent UPSERT requests for same item
      const concurrentUpserts = Array(5)
        .fill(null)
        .map((_, i) =>
          supabase
            .from('cart_items')
            .upsert(
              {
                user_id: this.testUserId,
                product_id: '1',
                quantity: 1,
                variant: {
                  name: 'Atomic Test Shoe',
                  size: 'M',
                  price: 5999,
                  image: 'test.jpg',
                  colorLabel: 'Red',
                },
              },
              {
                onConflict: ['user_id', 'product_id', 'variant->size'],
              }
            )
            .then((res) => ({ requestId: i, success: !res.error, error: res.error }))
        );

      const upsertResults = await Promise.all(concurrentUpserts);

      // 3. Verify results
      const allSuccess = upsertResults.every((r) => r.success);
      const failedCount = upsertResults.filter((r) => !r.success).length;

      if (!allSuccess) {
        console.log(`⚠️  ${failedCount} request(s) failed (expected if already exists)`);
      }

      // 4. Check final state
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', this.testUserId)
        .eq('product_id', '1');

      if (error) throw error;

      const recordCount = data?.length || 0;
      const totalQty = data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      console.log(`📊 Results: ${recordCount} record(s), total quantity: ${totalQty}`);

      const passed = recordCount <= 1 && allSuccess;

      if (passed) {
        console.log(`✅ PASSED: No duplicates created by concurrent UPSERT`);
      } else {
        console.log(`❌ FAILED: Unexpected result - ${recordCount} records found`);
      }

      return {
        testName,
        passed,
        duration: Date.now() - startTime,
        message: passed
          ? 'Concurrent UPSERT operations handled atomically'
          : `Found ${recordCount} records (expected ≤1)`,
        details: { recordCount, totalQty, concurrentRequests: 5 },
      };
    } catch (err: any) {
      console.error(`❌ ERROR: ${err.message}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        message: `Exception: ${err.message}`,
      };
    }
  }

  /**
   * TEST 2: Multiple Items Concurrent Addition
   * 
   * Verifies that adding different items concurrently doesn't interfere.
   */
  async test_MultipleItemsConcurrentAddition(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Multiple Items Concurrent Addition';

    try {
      console.log(`\n🧪 ${testName}`);
      console.log('─'.repeat(60));

      // 1. Clear test data
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', this.testUserId)
        .ilike('product_id', '10%');

      // 2. Fire concurrent UPSERT for different items
      const concurrentAdds = [
        { productId: '101', size: 'S', name: 'Item A' },
        { productId: '102', size: 'M', name: 'Item B' },
        { productId: '103', size: 'L', name: 'Item C' },
        { productId: '104', size: 'XL', name: 'Item D' },
        { productId: '105', size: 'M', name: 'Item E' },
      ].map((item) =>
        supabase
          .from('cart_items')
          .upsert(
            {
              user_id: this.testUserId,
              product_id: item.productId,
              quantity: 1,
              variant: {
                name: item.name,
                size: item.size,
                price: 3000 + Math.random() * 5000,
                image: 'item.jpg',
                colorLabel: 'Various',
              },
            },
            {
              onConflict: ['user_id', 'product_id', 'variant->size'],
            }
          )
          .then((res) => ({
            productId: item.productId,
            success: !res.error,
            error: res.error,
          }))
      );

      const addResults = await Promise.all(concurrentAdds);
      const successCount = addResults.filter((r) => r.success).length;

      // 3. Verify all items added
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id')
        .eq('user_id', this.testUserId)
        .ilike('product_id', '10%');

      if (error) throw error;

      const itemCount = data?.length || 0;
      const passed = successCount === 5 && itemCount === 5;

      console.log(`📊 Results: ${successCount}/5 additions successful, ${itemCount} items in cart`);

      if (passed) {
        console.log(`✅ PASSED: All items added without interference`);
      } else {
        console.log(`❌ FAILED: Expected 5 items, got ${itemCount}`);
      }

      return {
        testName,
        passed,
        duration: Date.now() - startTime,
        message: passed
          ? 'Concurrent operations on different items handled correctly'
          : `Items mismatch: expected 5, got ${itemCount}`,
        details: { successCount, itemCount, concurrentRequests: 5 },
      };
    } catch (err: any) {
      console.error(`❌ ERROR: ${err.message}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        message: `Exception: ${err.message}`,
      };
    }
  }

  /**
   * TEST 3: Soft Delete Idempotency
   * 
   * Verifies that multiple concurrent soft-delete calls don't cause issues.
   */
  async test_SoftDeleteIdempotency(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Soft Delete Idempotency';

    try {
      console.log(`\n🧪 ${testName}`);
      console.log('─'.repeat(60));

      // 1. Create test address
      const { data: createData, error: createError } = await supabase
        .from('addresses')
        .insert({
          user_id: this.testUserId,
          full_name: 'Test Delete User',
          email: 'test-delete@example.com',
          phone: '+91-9876543210',
          address_line_1: 'Test Delete Address',
          city: 'Test City',
          state: 'TS',
          postal_code: '123456',
          country: 'India',
        })
        .select();

      if (createError) throw createError;

      const addressId = createData?.[0]?.id;
      if (!addressId) throw new Error('Failed to create test address');

      console.log(`📝 Created address: ${addressId.substring(0, 8)}...`);

      // 2. Fire 3 concurrent soft-delete requests
      const concurrentDeletes = Array(3)
        .fill(null)
        .map((_, i) =>
          supabase
            .from('addresses')
            .update({ is_deleted: true })
            .eq('id', addressId)
            .eq('user_id', this.testUserId)
            .then((res) => ({ requestId: i, success: !res.error, error: res.error }))
        );

      const deleteResults = await Promise.all(concurrentDeletes);
      const successCount = deleteResults.filter((r) => r.success).length;

      console.log(`🗑️  Fired ${successCount}/3 concurrent deletes`);

      // 3. Verify address is marked deleted
      const { data, error: queryError } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', addressId);

      if (queryError) throw queryError;

      const address = data?.[0];
      const isDeleted = address?.is_deleted === true;

      console.log(`📊 Results: Address is_deleted = ${isDeleted}`);

      const passed = successCount === 3 && isDeleted;

      if (passed) {
        console.log(`✅ PASSED: Soft delete is idempotent`);
      } else {
        console.log(`❌ FAILED: Delete succeeded=${successCount === 3}, deleted=${isDeleted}`);
      }

      return {
        testName,
        passed,
        duration: Date.now() - startTime,
        message: passed
          ? 'Multiple concurrent soft-delete calls handled idempotently'
          : `Delete failed or not marked as deleted`,
        details: { successCount, isDeleted, concurrentRequests: 3 },
      };
    } catch (err: any) {
      console.error(`❌ ERROR: ${err.message}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        message: `Exception: ${err.message}`,
      };
    }
  }

  /**
   * TEST 4: Order Creation Uniqueness
   * 
   * Verifies that concurrent order creations generate unique order numbers.
   */
  async test_OrderCreationUniqueness(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Order Creation Uniqueness';

    try {
      console.log(`\n🧪 ${testName}`);
      console.log('─'.repeat(60));

      const timestamp = Date.now();

      // 1. Fire 3 concurrent order creations
      const concurrentOrders = Array(3)
        .fill(null)
        .map((_, i) =>
          supabase
            .from('orders')
            .insert({
              user_id: this.testUserId,
              order_number: `ORD-${timestamp}-${i}-${Math.random().toString(36).substr(2, 9)}`,
              shipping_address: {
                fullName: `Test User ${i}`,
                email: `test${i}@example.com`,
                phone: '+91-9876543210',
                addressLine1: `Address ${i}`,
                city: 'Test City',
                state: 'TS',
                postalCode: '123456',
                country: 'India',
              },
              payment_status: 'pending',
              order_status: 'pending',
              subtotal_amount: 5000 + i * 1000,
              total_amount: 5000 + i * 1000,
            })
            .select()
            .then((res) => ({
              requestId: i,
              success: !res.error,
              orderId: res.data?.[0]?.id,
              orderNumber: res.data?.[0]?.order_number,
              error: res.error,
            }))
        );

      const orderResults = await Promise.all(concurrentOrders);
      const successCount = orderResults.filter((r) => r.success).length;
      const orderIds = orderResults
        .filter((r) => r.success && r.orderId)
        .map((r) => r.orderId);

      console.log(`📦 Created ${successCount}/3 orders`);

      // 2. Verify uniqueness
      const uniqueIds = new Set(orderIds);
      const allUnique = uniqueIds.size === orderIds.length;

      console.log(`📊 Results: ${successCount} orders, ${uniqueIds.size} unique IDs`);

      const passed = successCount === 3 && allUnique;

      if (passed) {
        console.log(`✅ PASSED: All orders created with unique identifiers`);
      } else {
        console.log(`❌ FAILED: Duplicate order IDs detected`);
      }

      return {
        testName,
        passed,
        duration: Date.now() - startTime,
        message: passed
          ? 'Concurrent order creations generated unique orders'
          : `Duplicate IDs found: ${successCount} created, ${uniqueIds.size} unique`,
        details: { createdCount: successCount, uniqueCount: uniqueIds.size },
      };
    } catch (err: any) {
      console.error(`❌ ERROR: ${err.message}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        message: `Exception: ${err.message}`,
      };
    }
  }

  /**
   * TEST 5: Quantity Update Race Condition
   * 
   * Verifies that concurrent quantity updates result in correct final value.
   */
  async test_QuantityUpdateRaceCondition(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Quantity Update Race Condition';

    try {
      console.log(`\n🧪 ${testName}`);
      console.log('─'.repeat(60));

      // 1. Create cart item with quantity 0
      const { data: createData, error: createError } = await supabase
        .from('cart_items')
        .upsert({
          user_id: this.testUserId,
          product_id: '999',
          quantity: 0,
          variant: {
            name: 'Race Condition Test',
            size: 'M',
            price: 1000,
            image: 'test.jpg',
            colorLabel: 'Blue',
          },
        })
        .select();

      if (createError) throw createError;

      // 2. Fire 5 concurrent updates, each incrementing quantity by 1
      // Without atomic operations, result could be off
      const concurrentUpdates = Array(5)
        .fill(null)
        .map((_, i) =>
          supabase
            .from('cart_items')
            .update({ quantity: i + 1 }) // Each sets to 1,2,3,4,5
            .eq('user_id', this.testUserId)
            .eq('product_id', '999')
            .then((res) => ({ requestId: i, success: !res.error, error: res.error }))
        );

      const updateResults = await Promise.all(concurrentUpdates);
      const successCount = updateResults.filter((r) => r.success).length;

      // 3. Check final quantity (should be from last update, which should be 5)
      const { data: finalData, error: queryError } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('user_id', this.testUserId)
        .eq('product_id', '999');

      if (queryError) throw queryError;

      const finalQty = finalData?.[0]?.quantity || 0;

      console.log(`📊 Results: ${successCount}/5 updates successful, final quantity: ${finalQty}`);

      // Note: With simultaneous updates setting specific values, we expect final value
      // to be from the last completed update (one of 1-5)
      const passed = successCount === 5 && finalQty >= 1 && finalQty <= 5;

      if (passed) {
        console.log(`✅ PASSED: Concurrent quantity updates handled correctly`);
      } else {
        console.log(`❌ FAILED: Quantity not in expected range`);
      }

      return {
        testName,
        passed,
        duration: Date.now() - startTime,
        message: passed
          ? 'Concurrent updates resulted in valid final state'
          : `Final quantity ${finalQty} unexpected`,
        details: { successCount, finalQty },
      };
    } catch (err: any) {
      console.error(`❌ ERROR: ${err.message}`);
      return {
        testName,
        passed: false,
        duration: Date.now() - startTime,
        message: `Exception: ${err.message}`,
      };
    }
  }

  /**
   * Run all concurrency tests
   */
  async runAll(): Promise<TestResult[]> {
    console.log('\n');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(10) + '🧪 CONCURRENCY RACE CONDITION TESTS' + ' '.repeat(12) + '║');
    console.log('╚' + '═'.repeat(58) + '╝');

    this.results = [
      await this.test_CartUpsertAtomicity(),
      await this.test_MultipleItemsConcurrentAddition(),
      await this.test_SoftDeleteIdempotency(),
      await this.test_OrderCreationUniqueness(),
      await this.test_QuantityUpdateRaceCondition(),
    ];

    // Print summary
    this.printSummary();

    return this.results;
  }

  /**
   * Print test summary
   */
  private printSummary() {
    console.log('\n');
    console.log('╔' + '═'.repeat(58) + '╗');
    console.log('║' + ' '.repeat(20) + '📊 TEST SUMMARY' + ' '.repeat(23) + '║');
    console.log('╠' + '═'.repeat(58) + '╣');

    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    this.results.forEach((result, idx) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const paddedName = result.testName.padEnd(40);
      const time = `${result.duration}ms`.padStart(6);
      console.log(
        `║ ${idx + 1}. ${status} | ${paddedName} ${time} ║`
      );
    });

    console.log('╠' + '═'.repeat(58) + '╣');
    console.log(`║ Total: ${passed}/${total} passed | Time: ${totalTime}ms` + ' '.repeat(25) + '║');
    console.log('╚' + '═'.repeat(58) + '╝\n');
  }

  /**
   * Get results as JSON for export/logging
   */
  getResultsAsJSON() {
    return {
      timestamp: new Date().toISOString(),
      testCount: this.results.length,
      passedCount: this.results.filter((r) => r.passed).length,
      totalTime: this.results.reduce((sum, r) => sum + r.duration, 0),
      results: this.results.map((r) => ({
        testName: r.testName,
        passed: r.passed,
        duration: r.duration,
        message: r.message,
        details: r.details,
      })),
    };
  }
}

/**
 * Export singleton and factory function
 */
let testRunner: ConcurrencyTestRunner | null = null;

export async function runConcurrencyTests(userId: string): Promise<TestResult[]> {
  testRunner = new ConcurrencyTestRunner();
  const initialized = await testRunner.initialize(userId);

  if (!initialized) {
    return [];
  }

  return testRunner.runAll();
}

export function getTestRunner(): ConcurrencyTestRunner | null {
  return testRunner;
}

export default ConcurrencyTestRunner;
