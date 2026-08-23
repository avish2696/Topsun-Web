import { supabase } from '@/supabase';

/**
 * OTP Abuse Detection Module
 * 
 * Tracks OTP attempts and detects suspicious patterns:
 * 1. Brute-force: >5 failed attempts per OTP code
 * 2. Spam/Enumeration: >3 OTP requests per email per hour
 * 3. Account Takeover: >10 failures per email per hour
 * 
 * Implements:
 * - Atomic attempt tracking
 * - Pattern detection with recommendations
 * - Alert logging to audit_logs table and console
 * - Rate limiting integration with otpService
 */

/**
 * Interface for OTP attempt logging
 */
export interface OTPAttemptLog {
  email: string;
  code: string;
  success: boolean;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Interface for abuse pattern detection results
 */
export interface AbusePattern {
  isSuspicious: boolean;
  pattern: 'brute_force' | 'spam' | 'account_takeover' | null;
  failureCount: number;
  requestCount: number;
  recommendation: string;
}

/**
 * Abuse detection rules and thresholds
 */
const ABUSE_RULES = {
  // Rule 1: Brute-force detection
  BRUTE_FORCE_THRESHOLD: 5, // Max 5 failed attempts per OTP code
  
  // Rule 2: Spam/enumeration detection
  MAX_OTP_REQUESTS_PER_HOUR: 3, // Max 3 OTP requests per email per hour
  
  // Rule 3: Account takeover attempt detection
  HIGH_FAILURE_RATE_THRESHOLD: 10, // >10 failures per email per hour = alert
  
  // Lookback window for hourly metrics
  LOOKBACK_WINDOW_HOURS: 1,
};

/**
 * Log an OTP verification attempt to the database
 * 
 * Called after each OTP verification attempt (success or failure)
 * Does not throw errors - logs and continues to avoid blocking auth flow
 * 
 * @param email Target email address
 * @param code OTP code attempted
 * @param success Whether the attempt was successful
 * @param timestamp Timestamp of attempt
 * @param ip_address Optional IP address of requester
 * @param user_agent Optional user agent string
 */
export async function logOTPAttempt(
  email: string,
  code: string,
  success: boolean,
  timestamp: Date = new Date(),
  ip_address?: string,
  user_agent?: string
): Promise<void> {
  try {
    // Skip if email invalid
    if (!email || !email.includes('@')) {
      console.warn('⚠️ Invalid email for OTP attempt logging:', email);
      return;
    }

    console.log(
      `📝 Logging OTP ${success ? 'success' : 'failure'} for ${email}`
    );

    // Note: otp_records table already tracks attempts via attempts column
    // This function is primarily for abuse pattern detection queries
    // The attempt is already logged when otpService.verify() is called

    // Additional context logging (if needed for audit trail)
    // Could be expanded to track IP-based rate limiting, user agent analysis, etc.
    if (ip_address || user_agent) {
      console.debug(
        `📊 Request context: IP=${ip_address}, UA=${user_agent?.substring(0, 50)}...`
      );
    }

    // Future: Could insert into a separate otp_attempt_logs table for detailed analytics
    // For now, relying on otp_records table which tracks attempts
  } catch (error) {
    console.error('❌ Error logging OTP attempt:', error);
    // Don't throw - this should never block auth flow
  }
}

/**
 * Detect abuse patterns for an email address
 * 
 * Checks three abuse rules:
 * 1. Brute-force: >5 failed attempts per OTP code
 * 2. Spam: >3 OTP requests per email per hour
 * 3. Account takeover: >10 failures per email per hour
 * 
 * Returns:
 * - isSuspicious: true if any pattern detected
 * - pattern: which pattern triggered (if multiple, returns highest priority)
 * - failureCount: total failures in last hour
 * - requestCount: total OTP requests in last hour
 * - recommendation: suggested action
 * 
 * @param email Email to check for abuse patterns
 * @returns Abuse pattern detection result
 */
export async function detectAbusePattern(
  email: string
): Promise<AbusePattern> {
  try {
    // Input validation
    if (!email || !email.includes('@')) {
      console.warn('⚠️ Invalid email for abuse detection:', email);
      return {
        isSuspicious: false,
        pattern: null,
        failureCount: 0,
        requestCount: 0,
        recommendation: 'No action required',
      };
    }

    console.log(`🔍 Detecting abuse patterns for ${email}`);

    // Calculate lookback window
    const oneHourAgo = new Date(
      Date.now() - ABUSE_RULES.LOOKBACK_WINDOW_HOURS * 60 * 60 * 1000
    );

    // Query 1: Failed attempts per OTP (current/most recent OTP)
    const { data: currentOTP, error: currentOTPError } = await supabase
      .from('otp_records')
      .select('attempts, max_attempts, code')
      .eq('email', email)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (currentOTPError) {
      console.error(
        '❌ Error querying current OTP for brute-force detection:',
        currentOTPError
      );
      throw currentOTPError;
    }

    // Rule 1: Check brute-force attempts on current OTP
    let isBruteForce = false;
    let currentFailures = 0;
    if (currentOTP && currentOTP.length > 0) {
      currentFailures = currentOTP[0].attempts;
      isBruteForce =
        currentFailures > (currentOTP[0].max_attempts || ABUSE_RULES.BRUTE_FORCE_THRESHOLD);
      console.log(
        `  Rule 1 (Brute-force): ${currentFailures} / ${
          currentOTP[0].max_attempts || ABUSE_RULES.BRUTE_FORCE_THRESHOLD
        } attempts - ${isBruteForce ? '⚠️ TRIGGERED' : 'OK'}`
      );
    }

    // Query 2: OTP request count in last hour
    const { data: otpRequests, error: requestCountError } = await supabase
      .from('otp_records')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .eq('verified', false)
      .gte('first_request_at', oneHourAgo.toISOString());

    if (requestCountError) {
      console.error(
        '❌ Error querying OTP request count for spam detection:',
        requestCountError
      );
      throw requestCountError;
    }

    // Rule 2: Check spam/enumeration (multiple OTP requests)
    const requestCount = otpRequests?.[0]?.count || 0;
    const isSpam = requestCount > ABUSE_RULES.MAX_OTP_REQUESTS_PER_HOUR;
    console.log(
      `  Rule 2 (Spam): ${requestCount} / ${ABUSE_RULES.MAX_OTP_REQUESTS_PER_HOUR} requests - ${
        isSpam ? '⚠️ TRIGGERED' : 'OK'
      }`
    );

    // Query 3: Failed attempts in last hour (for account takeover detection)
    const { data: failedAttempts, error: failureCountError } = await supabase
      .from('otp_records')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .eq('verified', false)
      .gte('attempts', ABUSE_RULES.BRUTE_FORCE_THRESHOLD)
      .gte('created_at', oneHourAgo.toISOString());

    if (failureCountError) {
      console.error(
        '❌ Error querying failure count for account takeover detection:',
        failureCountError
      );
      throw failureCountError;
    }

    // Rule 3: Check account takeover (high failure rate)
    const failureCount = failedAttempts?.[0]?.count || 0;
    const isAccountTakeover =
      failureCount > ABUSE_RULES.HIGH_FAILURE_RATE_THRESHOLD;
    console.log(
      `  Rule 3 (Account Takeover): ${failureCount} / ${ABUSE_RULES.HIGH_FAILURE_RATE_THRESHOLD} failures - ${
        isAccountTakeover ? '⚠️ TRIGGERED' : 'OK'
      }`
    );

    // Determine result with priority: Account Takeover > Spam > Brute-force
    let detectedPattern: 'brute_force' | 'spam' | 'account_takeover' | null =
      null;
    let recommendation = 'No action required';

    if (isAccountTakeover) {
      detectedPattern = 'account_takeover';
      recommendation =
        'Account takeover attempt detected. Consider temporarily locking the account and notifying the user.';
    } else if (isSpam) {
      detectedPattern = 'spam';
      recommendation =
        'Multiple OTP requests detected. Consider increasing rate limit lockout duration or requiring manual verification.';
    } else if (isBruteForce) {
      detectedPattern = 'brute_force';
      recommendation =
        'Brute-force attempt detected on current OTP. The account is already locked, ensure lockout duration is enforced.';
    }

    const result: AbusePattern = {
      isSuspicious: detectedPattern !== null,
      pattern: detectedPattern,
      failureCount,
      requestCount,
      recommendation,
    };

    console.log(
      `✅ Abuse detection result: ${result.isSuspicious ? '⚠️ SUSPICIOUS' : '✅ CLEAN'} (${detectedPattern || 'none'})`
    );

    return result;
  } catch (error) {
    console.error('❌ Error in abuse pattern detection:', error);
    // Return safe default (not suspicious) rather than throwing
    // We don't want detection failures to block auth
    return {
      isSuspicious: false,
      pattern: null,
      failureCount: 0,
      requestCount: 0,
      recommendation: 'Error during abuse detection - no action taken',
    };
  }
}

/**
 * Alert on suspicious OTP activity
 * 
 * Logs alerts to:
 * 1. Console (for dev/debugging)
 * 2. audit_logs table (for compliance/investigation)
 * 3. (Future) Admin dashboard, email notifications, etc.
 * 
 * @param email Email address with suspicious activity
 * @param pattern Abuse pattern type
 * @param metadata Additional context (failure count, request count, etc.)
 */
export async function alertOnAbuse(
  email: string,
  pattern: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    if (!email) {
      console.warn('⚠️ Cannot alert on abuse without email');
      return;
    }

    console.warn(
      `🚨 ABUSE ALERT: ${pattern.toUpperCase()} detected for ${email}`,
      metadata || ''
    );

    // Log to audit_logs table for compliance and investigation
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: 'otp_records',
        record_id: email, // Email serves as identifier for OTP records
        action: 'abuse_detected',
        new_values: {
          email,
          pattern,
          ...metadata,
          detected_at: new Date().toISOString(),
        },
      });

    if (auditError) {
      console.error('❌ Error logging abuse alert to audit_logs:', auditError);
      // Don't throw - alert already logged to console
    } else {
      console.log(
        `✅ Abuse alert logged to audit_logs: ${pattern} for ${email}`
      );
    }

    // Future: Send to admin dashboard, email notifications, etc.
    // For now, just console + audit log
  } catch (error) {
    console.error('❌ Error in abuse alert:', error);
    // Don't throw - we already logged to console
  }
}

/**
 * Complete flow: Log attempt + Detect abuse + Alert if needed
 * 
 * Call this after each failed OTP verification attempt
 * Automatically:
 * 1. Logs the attempt
 * 2. Detects abuse patterns
 * 3. Alerts if suspicious
 * 
 * @param email Email address
 * @param code OTP code attempted
 * @param success Whether verification succeeded
 * @param ip_address Optional IP address
 * @param user_agent Optional user agent
 */
export async function processOTPAttempt(
  email: string,
  code: string,
  success: boolean,
  ip_address?: string,
  user_agent?: string
): Promise<AbusePattern | null> {
  try {
    // Step 1: Log the attempt
    await logOTPAttempt(email, code, success, new Date(), ip_address, user_agent);

    // For successful attempts, no need to check abuse (they already verified)
    if (success) {
      return null;
    }

    // Step 2: Detect abuse pattern for failed attempts
    const abuseResult = await detectAbusePattern(email);

    // Step 3: Alert if suspicious
    if (abuseResult.isSuspicious && abuseResult.pattern) {
      await alertOnAbuse(email, abuseResult.pattern, {
        failure_count: abuseResult.failureCount,
        request_count: abuseResult.requestCount,
        recommendation: abuseResult.recommendation,
      });
    }

    return abuseResult;
  } catch (error) {
    console.error('❌ Error in processOTPAttempt:', error);
    return null;
  }
}

/**
 * Get abuse statistics for an email (admin dashboard use)
 * 
 * Returns metrics for monitoring and investigation:
 * - Total OTP requests today/this week/this month
 * - Failed attempts today/this week/this month
 * - Current lockout status
 * - Abuse pattern history
 * 
 * @param email Email to get statistics for
 * @returns Abuse statistics object
 */
export async function getAbuseStatistics(email: string): Promise<{
  today: { requests: number; failures: number };
  thisWeek: { requests: number; failures: number };
  thisMonth: { requests: number; failures: number };
  isCurrentlyLocked: boolean;
  lockedUntil?: Date;
  lastAttempt?: Date;
}> {
  try {
    if (!email) {
      throw new Error('Email required for abuse statistics');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Query all OTP records for this email
    const { data: records, error } = await supabase
      .from('otp_records')
      .select('created_at, attempts, locked_until, verified')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Calculate statistics
    const stats = {
      today: { requests: 0, failures: 0 },
      thisWeek: { requests: 0, failures: 0 },
      thisMonth: { requests: 0, failures: 0 },
      isCurrentlyLocked: false,
      lockedUntil: undefined as Date | undefined,
      lastAttempt: undefined as Date | undefined,
    };

    records?.forEach(record => {
      const recordDate = new Date(record.created_at);

      // Update last attempt
      if (!stats.lastAttempt || recordDate > stats.lastAttempt) {
        stats.lastAttempt = recordDate;
      }

      // Count requests and failures
      if (recordDate >= today) {
        stats.today.requests++;
        if (record.attempts > 0) stats.today.failures++;
      }
      if (recordDate >= thisWeek) {
        stats.thisWeek.requests++;
        if (record.attempts > 0) stats.thisWeek.failures++;
      }
      if (recordDate >= thisMonth) {
        stats.thisMonth.requests++;
        if (record.attempts > 0) stats.thisMonth.failures++;
      }

      // Check lockout status
      if (record.locked_until) {
        const lockedUntil = new Date(record.locked_until);
        if (lockedUntil > now) {
          stats.isCurrentlyLocked = true;
          stats.lockedUntil = lockedUntil;
        }
      }
    });

    return stats;
  } catch (error) {
    console.error('❌ Error getting abuse statistics:', error);
    // Return zero stats rather than throwing
    return {
      today: { requests: 0, failures: 0 },
      thisWeek: { requests: 0, failures: 0 },
      thisMonth: { requests: 0, failures: 0 },
      isCurrentlyLocked: false,
    };
  }
}

/**
 * Export for integration points
 */
export const otpAbuseDetection = {
  logOTPAttempt,
  detectAbusePattern,
  alertOnAbuse,
  processOTPAttempt,
  getAbuseStatistics,
};
