import { supabase } from '@/supabase';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  fullName?: string;
  provider: 'phone' | 'email' | 'google';
}

export interface PhoneAuthResponse {
  user: User | null;
  error: string | null;
}

export function toValidUUID(id?: string): string {
  if (!id) return '00000000-0000-4000-a000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  const digits = id.replace(/\D/g, '').slice(-12);
  const padded = digits.padStart(12, '0');
  return `00000000-0000-4000-a000-${padded}`;
}

// SessionStorage key generator
const otpStoreKey = (phone: string) => `topsun_otp_${phone}`;

class PhoneAuthService {
  /**
   * Format phone number to 10-digit / E.164
   */
  private formatPhone(phone: string): { raw10: string; e164: string } {
    const cleaned = phone.replace(/\D/g, '');
    const raw10 = cleaned.length > 10 ? cleaned.slice(-10) : cleaned;
    const e164 = `+91${raw10}`;
    return { raw10, e164 };
  }

  /**
   * Send Phone OTP via APITxT / Supabase with automatic fallback
   */
  async sendPhoneOTP(phone: string): Promise<{ success: boolean; message?: string }> {
    const { raw10, e164 } = this.formatPhone(phone);

    const apiKey = import.meta.env.VITE_APITXT_API_KEY;

    // Generate random 6-digit OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in browser session for immediate verification
    try {
      sessionStorage.setItem(
        otpStoreKey(raw10),
        JSON.stringify({ otp: generatedOtp, expiresAt: expiry, phone: e164 })
      );
    } catch {}

    // 1. Send via APITxT API
    if (apiKey && apiKey !== 'your_apitxt_api_key_here') {
      try {
        const endpoints = [
          '/api/send-otp.php',
          'https://apitxt.com/api/sendOTP',
          '/api/apitxt/api/sendOTP',
        ];

        let sentSuccessfully = false;

        for (const url of endpoints) {
          try {
            const formData = new URLSearchParams({
              authkey: apiKey,
              mobile: `91${raw10}`,
              otp: generatedOtp,
            });

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: formData,
            });

            const resJson = await response.json().catch(() => null);

            if (response.ok && resJson && resJson.status === 'success') {
              sentSuccessfully = true;
              break;
            }
          } catch {}
        }

        if (sentSuccessfully) {
          return { success: true, message: 'OTP sent successfully to your mobile number via SMS!' };
        }
      } catch {}
    }

    // 2. Supabase Auth fallback
    try {
      const { error: supabaseError } = await supabase.auth.signInWithOtp({ phone: e164 });
      if (!supabaseError) {
        return { success: true, message: 'OTP sent via Supabase SMS service' };
      }
    } catch {}

    return { success: false, message: 'Failed to send OTP. Please check your phone number and try again.' };
  }

  /**
   * Verify Phone OTP and create/sign-in user session
   */
  async verifyPhoneOTP(phone: string, token: string, fullName?: string): Promise<PhoneAuthResponse> {
    const { raw10, e164 } = this.formatPhone(phone);
    const trimmedToken = token.trim();

    // 1. Verify against session OTP (from APITxT flow)
    try {
      const storedData = sessionStorage.getItem(otpStoreKey(raw10));
      if (storedData) {
        const { otp, expiresAt } = JSON.parse(storedData);
        if (Date.now() <= expiresAt && trimmedToken === otp) {
          const userId = toValidUUID(raw10);
          const user: User = {
            id: userId,
            phone: e164,
            fullName: fullName || 'TOPSUN Customer',
            provider: 'phone',
          };

          localStorage.setItem('auth_phone_user', JSON.stringify(user));
          sessionStorage.removeItem(otpStoreKey(raw10));
          return { user, error: null };
        }
      }
    } catch {}

    // 2. Verify against Supabase Auth
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: e164,
        token: trimmedToken,
        type: 'sms',
      });

      if (!error && data.user) {
        const user: User = {
          id: data.user.id,
          phone: e164,
          fullName: fullName || data.user.user_metadata?.full_name || 'TOPSUN Customer',
          provider: 'phone',
        };

        localStorage.setItem('auth_phone_user', JSON.stringify(user));
        return { user, error: null };
      }
    } catch {}

    return { user: null, error: 'Invalid or expired 6-digit OTP code. Please try again.' };
  }

  /**
   * Get stored phone user and auto-migrate legacy non-UUID IDs
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem('auth_phone_user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user && user.id) {
          user.id = toValidUUID(user.id);
          localStorage.setItem('auth_phone_user', JSON.stringify(user));
        }
        return user;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clear session
   */
  logout(): void {
    localStorage.removeItem('auth_phone_user');
    supabase.auth.signOut().catch(() => {});
  }
}

export const phoneAuthService = new PhoneAuthService();
