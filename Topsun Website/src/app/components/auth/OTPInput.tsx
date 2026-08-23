import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, Loader, Clock, Lock } from 'lucide-react';

interface OTPInputProps {
  onOTPSubmit: (otp: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  attempts?: number;
  maxAttempts?: number;
  onResendClick?: () => Promise<void>;
  phone?: string;
  email?: string;
}

export function OTPInput({
  onOTPSubmit,
  isLoading = false,
  error = null,
  attempts = 3,
  maxAttempts = 3,
  onResendClick,
  phone,
  email,
}: OTPInputProps) {
  const [otpValue, setOtpValue] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Lockout state management
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Check lockout status on mount and periodically while locked
  useEffect(() => {
    const checkLockoutStatus = async () => {
      if (!email) return;

      try {
        // Check if account is locked by looking for error messages
        // that indicate lockout (these come from otpService.verify/send)
        if (error?.includes('Account locked') || error?.includes('locked')) {
          // Parse lockout duration from error or use default 5 minutes
          setIsLocked(true);
          const now = new Date();
          // Default to 5 minutes lockout (300 seconds)
          const lockoutEnd = new Date(now.getTime() + 5 * 60 * 1000);
          setLockedUntil(lockoutEnd);
        } else if (isLocked && lockedUntil) {
          // If we're still locked, keep checking until lockout expires
          const now = new Date();
          if (now >= lockedUntil) {
            // Lockout expired, reset
            setIsLocked(false);
            setLockedUntil(null);
            setRemainingSeconds(0);
            setOtpValue('');
          }
        }
      } catch (err) {
        console.error('Error checking lockout status:', err);
      }
    };

    checkLockoutStatus();

    // Poll every 10 seconds while locked
    const lockoutCheckInterval = isLocked
      ? setInterval(checkLockoutStatus, 10 * 1000)
      : null;

    return () => {
      if (lockoutCheckInterval) clearInterval(lockoutCheckInterval);
    };
  }, [isLocked, lockedUntil, email, error]);

  // Countdown timer - updates every 1 second while locked
  useEffect(() => {
    if (!isLocked || !lockedUntil) {
      setRemainingSeconds(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diffMs = lockedUntil.getTime() - now.getTime();

      if (diffMs <= 0) {
        // Lockout expired
        setIsLocked(false);
        setLockedUntil(null);
        setRemainingSeconds(0);
        setOtpValue('');
      } else {
        // Update remaining seconds
        const seconds = Math.ceil(diffMs / 1000);
        setRemainingSeconds(seconds);
      }
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [isLocked, lockedUntil]);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Only allow digits
    value = value.replace(/\D/g, '');

    // Limit to 6 digits
    value = value.slice(0, 6);

    setOtpValue(value);

    // Auto-submit when 6 digits entered
    if (value.length === 6 && !isSubmitting && !isLoading) {
      handleSubmit(value);
    }
  };

  const handleSubmit = async (otpCode: string) => {
    if (isSubmitting || isLoading || otpCode.length !== 6) return;

    setIsSubmitting(true);
    try {
      await onOTPSubmit(otpCode);
    } catch {
      // Error handled by parent, just reset submitting state
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length === 6) {
      await handleSubmit(otpValue);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      if (onResendClick) {
        await onResendClick();
      }
      setOtpValue('');
      setResendCooldown(30);
      inputRef.current?.focus();
    } catch {
      // Error handled by parent
    } finally {
      setResendLoading(false);
    }
  };

  // Format remaining seconds as "M:SS"
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get lockout message with countdown
  const getLockoutMessage = (): string => {
    if (!isLocked || remainingSeconds <= 0) return '';

    const timeStr = formatCountdown(remainingSeconds);

    if (error?.includes('Too many OTP requests')) {
      return `Too many OTP requests. Try again in ${timeStr}`;
    } else if (error?.includes('Invalid OTP. Account will be locked')) {
      return `Warning: One more failed attempt will lock your account`;
    }

    return `Your account is temporarily locked. Try again in ${timeStr}`;
  };

  const isDisabled = isLoading || isSubmitting || attempts <= 0 || error?.includes('exceeded') || isLocked;

  return (
    <div className="w-full space-y-6">
      {/* Lockout Banner - Prominent when locked */}
      {isLocked && remainingSeconds > 0 && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
             role="alert"
             aria-live="polite"
             aria-label="Account locked notification">
          <Lock size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 mb-1">Account Locked</h3>
            <p className="text-sm text-red-800 mb-2">
              Your account is temporarily locked due to too many failed attempts.
            </p>
            <div className="flex items-center gap-2 text-sm text-red-900 font-semibold">
              <Clock size={16} />
              <span aria-live="polite" aria-atomic="true">
                Try again in {formatCountdown(remainingSeconds)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Phone Display */}
      {phone && (
        <p className="text-center text-sm text-gray-600">
          OTP sent to <span className="font-semibold text-gray-900">{phone}</span>
        </p>
      )}

      {/* OTP Input Form */}
      <form onSubmit={handleManualSubmit} className="space-y-4">
        {/* Single OTP Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Enter 6-digit OTP</label>
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpValue}
            onChange={handleInputChange}
            disabled={isDisabled}
            placeholder="000000"
            className={`h-12 text-center text-2xl font-mono font-bold border-2 rounded-lg transition-all duration-200 ${
              isLocked
                ? 'border-red-300 bg-red-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200'
            }`}
            autoFocus={!isLocked}
            aria-label="OTP input"
            aria-disabled={isDisabled}
          />
          <p className="text-xs text-gray-500 text-center">
            {isLocked
              ? '🔒 Input disabled during lockout'
              : `${otpValue.length}/6 digits • Auto-submits when complete`}
          </p>
        </div>

        {/* Error Message */}
        {error && !isLocked && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
               role="alert">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Lockout Warning - 1 attempt remaining */}
        {attempts === 1 && !isLocked && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
               role="alert">
            <p className="text-sm text-amber-800 font-semibold">
              ⚠️ Warning: One more failed attempt will lock your account for 5 minutes
            </p>
          </div>
        )}

        {/* Attempts Remaining */}
        {attempts < maxAttempts && attempts > 1 && !isLocked && (
          <p className="text-center text-xs text-amber-600">
            ⚠️ {attempts} attempt{attempts !== 1 ? 's' : ''} remaining
          </p>
        )}

        {/* Loading State */}
        {isLoading || isSubmitting ? (
          <div className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader size={18} className="animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-blue-700 font-medium">Verifying OTP...</span>
          </div>
        ) : (
          // Manual Submit Button
          <Button
            type="submit"
            disabled={otpValue.length !== 6 || isDisabled}
            className={`w-full h-11 text-white font-semibold rounded-lg transition-all duration-200 ${
              isLocked
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed hover:bg-gray-400'
                : 'hover:opacity-90'
            }`}
            style={{
              background:
                isLocked
                  ? '#9CA3AF'
                  : otpValue.length === 6
                    ? 'linear-gradient(135deg, #ADD8E6, #87CEEB)'
                    : '#ccc',
            }}
          >
            {isLocked ? '🔒 Locked' : 'Verify OTP'}
          </Button>
        )}
      </form>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {/* Clear Button */}
        {otpValue.length > 0 && !isLocked && (
          <Button
            variant="outline"
            onClick={() => {
              setOtpValue('');
              inputRef.current?.focus();
            }}
            disabled={isLoading || isSubmitting}
            className="w-full text-sm"
          >
            Clear
          </Button>
        )}

        {/* Resend/Request New OTP Button */}
        {(attempts <= 0 || isLocked) && (
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={resendLoading || resendCooldown > 0 || isLocked}
            className={`w-full ${
              isLocked
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {resendLoading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Resending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : isLocked ? (
              `Available after ${formatCountdown(remainingSeconds)}`
            ) : (
              'Request New OTP'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
