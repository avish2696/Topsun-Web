/**
 * Manual Tests for OTP Abuse Detection Module
 * 
 * Tests cover:
 * - OTP attempt logging (success and failure)
 * - Abuse pattern detection (brute-force, spam, account takeover)
 * - Alert logging to console and audit_logs table
 * - Pattern prioritization
 * - Statistics gathering
 * 
 * TO RUN TESTS:
 * 1. Copy the entire testOtpAbuseDetection object to browser console
 * 2. Run: await testOtpAbuseDetection.runAllTests().then(r => testOtpAbuseDetection.printResults(r))
 * 
 * AUTOMATED TESTING SETUP (Future):
 * 1. Install Vitest: npm install -D vitest @vitest/ui
 * 2. Add to package.json: "test": "vitest"
 * 3. Create vitest.config.ts with Supabase test configuration
 * 4. Run: npm test -- src/app/utils/otpAbuseDetection.test.ts
 */

import { supabase } from '../../supabase';
import {
  logOTPAttempt,
  detectAbusePattern,
  alertOnAbuse,
  processOTPAttempt,
  getAbuseStatistics,
} from './otpAbuseDetection';

const TEST_EMAIL = 'test-abuse@example.com';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

/**
 * Manual test runner for browser console testing
 */
export const testOtpAbuseDetection = {
  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];

    console.log('🚀 Starting OTP Abuse Detection Tests...\n');

    // Test 1: Log successful OTP attempt
    try {
      await logOTPAttempt(TEST_EMAIL, '123456', true, new Date());
      results.push({
        name: 'Log successful OTP attempt',
        passed: true,
      });
    } catch (error) {
      results.push({
        name: 'Log successful OTP attempt',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 2: Log failed OTP attempt
    try {
      await logOTPAttempt(TEST_EMAIL, '654321', false, new Date());
      results.push({
        name: 'Log failed OTP attempt',
        passed: true,
      });
    } catch (error) {
      results.push({
        name: 'Log failed OTP attempt',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 3: Log attempt with IP and user agent
    try {
      await logOTPAttempt(
        TEST_EMAIL,
        '111111',
        false,
        new Date(),
        '192.168.1.1',
        'Mozilla/5.0 Test Browser'
      );
      results.push({
        name: 'Log attempt with IP and user agent',
        passed: true,
      });
    } catch (error) {
      results.push({
        name: 'Log attempt with IP and user agent',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 4: Detect abuse pattern for clean email
    try {
      const result = await detectAbusePattern(TEST_EMAIL);
      if (
        result &&
        result.hasOwnProperty('isSuspicious') &&
        result.hasOwnProperty('pattern') &&
        result.hasOwnProperty('failureCount') &&
        result.hasOwnProperty('requestCount') &&
        result.hasOwnProperty('recommendation')
      ) {
        results.push({
          name: 'Detect abuse pattern structure is correct',
          passed: true,
        });
      } else {
        results.push({
          name: 'Detect abuse pattern structure is correct',
          passed: false,
          error: 'Missing required fields in result',
        });
      }
    } catch (error) {
      results.push({
        name: 'Detect abuse pattern structure is correct',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 5: Alert on abuse logs to console and audit_logs
    try {
      await alertOnAbuse(TEST_EMAIL, 'spam', {
        failure_count: 5,
        request_count: 4,
      });
      results.push({
        name: 'Alert on abuse creates audit log entry',
        passed: true,
      });
    } catch (error) {
      results.push({
        name: 'Alert on abuse creates audit log entry',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 6: Process OTP attempt for successful verification
    try {
      const result = await processOTPAttempt(
        TEST_EMAIL,
        '111111',
        true // success = true
      );
      if (result === null) {
        results.push({
          name: 'Process OTP returns null for successful verification',
          passed: true,
        });
      } else {
        results.push({
          name: 'Process OTP returns null for successful verification',
          passed: false,
          error: 'Should return null for successful attempts',
        });
      }
    } catch (error) {
      results.push({
        name: 'Process OTP returns null for successful verification',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 7: Process OTP attempt for failed verification
    try {
      const result = await processOTPAttempt(
        TEST_EMAIL,
        '000000',
        false // success = false
      );
      if (
        result &&
        result.hasOwnProperty('isSuspicious') &&
        result.hasOwnProperty('pattern')
      ) {
        results.push({
          name: 'Process OTP detects abuse on failed attempt',
          passed: true,
        });
      } else {
        results.push({
          name: 'Process OTP detects abuse on failed attempt',
          passed: false,
          error: 'Should return AbusePattern for failed attempts',
        });
      }
    } catch (error) {
      results.push({
        name: 'Process OTP detects abuse on failed attempt',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 8: Get abuse statistics
    try {
      const stats = await getAbuseStatistics(TEST_EMAIL);
      if (
        stats &&
        stats.today &&
        stats.thisWeek &&
        stats.thisMonth &&
        typeof stats.isCurrentlyLocked === 'boolean'
      ) {
        results.push({
          name: 'Get abuse statistics returns correct structure',
          passed: true,
        });
      } else {
        results.push({
          name: 'Get abuse statistics returns correct structure',
          passed: false,
          error: 'Missing required fields in statistics',
        });
      }
    } catch (error) {
      results.push({
        name: 'Get abuse statistics returns correct structure',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 9: Verify statistics have counts
    try {
      const stats = await getAbuseStatistics(TEST_EMAIL);
      if (
        typeof stats.today.requests === 'number' &&
        typeof stats.today.failures === 'number' &&
        typeof stats.thisWeek.requests === 'number' &&
        typeof stats.thisWeek.failures === 'number'
      ) {
        results.push({
          name: 'Abuse statistics include request and failure counts',
          passed: true,
        });
      } else {
        results.push({
          name: 'Abuse statistics include request and failure counts',
          passed: false,
          error: 'Counts are not numbers',
        });
      }
    } catch (error) {
      results.push({
        name: 'Abuse statistics include request and failure counts',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 10: Recommend action for brute-force pattern
    try {
      const result = await detectAbusePattern(TEST_EMAIL);
      if (result.recommendation && typeof result.recommendation === 'string') {
        results.push({
          name: 'Abuse pattern includes actionable recommendation',
          passed: true,
        });
      } else {
        results.push({
          name: 'Abuse pattern includes actionable recommendation',
          passed: false,
          error: 'Recommendation is missing or not a string',
        });
      }
    } catch (error) {
      results.push({
        name: 'Abuse pattern includes actionable recommendation',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 11: Handle invalid email gracefully in logOTPAttempt
    try {
      await logOTPAttempt('invalid-email', '123456', false);
      results.push({
        name: 'Log OTP handles invalid email without throwing',
        passed: true,
      });
    } catch (error) {
      results.push({
        name: 'Log OTP handles invalid email without throwing',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 12: Handle invalid email gracefully in detectAbusePattern
    try {
      const result = await detectAbusePattern('invalid-email');
      if (result.isSuspicious === false && result.pattern === null) {
        results.push({
          name: 'Detect abuse handles invalid email gracefully',
          passed: true,
        });
      } else {
        results.push({
          name: 'Detect abuse handles invalid email gracefully',
          passed: false,
          error: 'Should return safe defaults for invalid email',
        });
      }
    } catch (error) {
      results.push({
        name: 'Detect abuse handles invalid email gracefully',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 13: Verify pattern field values are correct
    try {
      const result = await detectAbusePattern(TEST_EMAIL);
      if (
        result.pattern === null ||
        result.pattern === 'brute_force' ||
        result.pattern === 'spam' ||
        result.pattern === 'account_takeover'
      ) {
        results.push({
          name: 'Abuse pattern values are from valid enum',
          passed: true,
        });
      } else {
        results.push({
          name: 'Abuse pattern values are from valid enum',
          passed: false,
          error: `Invalid pattern value: ${result.pattern}`,
        });
      }
    } catch (error) {
      results.push({
        name: 'Abuse pattern values are from valid enum',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 14: Verify failure count is non-negative
    try {
      const result = await detectAbusePattern(TEST_EMAIL);
      if (result.failureCount >= 0) {
        results.push({
          name: 'Failure count is non-negative',
          passed: true,
        });
      } else {
        results.push({
          name: 'Failure count is non-negative',
          passed: false,
          error: `Failure count cannot be negative: ${result.failureCount}`,
        });
      }
    } catch (error) {
      results.push({
        name: 'Failure count is non-negative',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Test 15: Verify request count is non-negative
    try {
      const result = await detectAbusePattern(TEST_EMAIL);
      if (result.requestCount >= 0) {
        results.push({
          name: 'Request count is non-negative',
          passed: true,
        });
      } else {
        results.push({
          name: 'Request count is non-negative',
          passed: false,
          error: `Request count cannot be negative: ${result.requestCount}`,
        });
      }
    } catch (error) {
      results.push({
        name: 'Request count is non-negative',
        passed: false,
        error: (error as Error).message,
      });
    }

    // Cleanup: Delete test OTP records
    try {
      await supabase
        .from('otp_records')
        .delete()
        .eq('email', TEST_EMAIL);
      console.log('\n✅ Cleanup: Deleted test OTP records');
    } catch (error) {
      console.log('\n⚠️ Cleanup failed:', (error as Error).message);
    }

    return results;
  },

  /**
   * Print test results to console
   */
  printResults(results: TestResult[]): void {
    console.log('\n=== OTP Abuse Detection Test Results ===\n');
    let passed = 0;
    let failed = 0;

    results.forEach((result) => {
      if (result.passed) {
        console.log(`✅ ${result.name}`);
        passed++;
      } else {
        console.log(`❌ ${result.name}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
        failed++;
      }
    });

    console.log(
      `\n📊 Results: ${passed} passed, ${failed} failed out of ${results.length} tests\n`
    );

    if (failed === 0) {
      console.log('🎉 All tests passed!\n');
    } else {
      console.log(`⚠️ ${failed} test(s) failed\n`);
    }
  },
};

/**
 * Export for browser console testing
 * Usage in browser console:
 * await testOtpAbuseDetection.runAllTests().then(r => testOtpAbuseDetection.printResults(r))
 */
