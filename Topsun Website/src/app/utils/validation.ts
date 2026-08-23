import { PIN_CODE_DATABASE } from '@/app/utils/pinCodeDatabase';

export const validation = {
  // Full name validation: non-empty, 2-100 chars, no special chars except space/hyphen
  isValidFullName: (name: string): boolean => {
    if (!name || typeof name !== 'string') return false;
    const fullNameRegex = /^[a-zA-Z\s\-]{2,100}$/;
    return fullNameRegex.test(name.trim());
  },

  // Email validation: required and must be valid format
  isValidEmail: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // OTP validation: exactly 6 digits
  isValidOTP: (otp: string): boolean => {
    if (!otp || typeof otp !== 'string') return false;
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  },

  // PIN code validation: 6 digits (database lookup is optional)
  isValidPINCode: (pin: string): boolean => {
    if (!pin || typeof pin !== 'string') return false;
    const pinRegex = /^\d{6}$/;
    return pinRegex.test(pin);
  },

  // Phone number validation: 10+ digits (Indian format)
  isValidPhone: (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    // Remove any non-digit characters except + at start
    const cleaned = phone.replace(/^\+/, '').replace(/\D/g, '');
    // Must be 10+ digits (Indian format is 10)
    return cleaned.length >= 10;
  },

  // Get PIN code info from database
  getPINCodeInfo: (pin: string): { city: string; state: string } | null => {
    if (!pin || typeof pin !== 'string') return null;
    return PIN_CODE_DATABASE[pin] || null;
  },

  // Error message generators
  getFullNameError: (name: string): string | null => {
    if (!name) return 'Full name is required';
    if (name.length < 2) return 'Full name must be at least 2 characters';
    if (name.length > 100) return 'Full name must be less than 100 characters';
    if (!/^[a-zA-Z\s\-]*$/.test(name)) return 'Full name can only contain letters, spaces, and hyphens';
    return null;
  },

  getEmailError: (email: string): string | null => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return null;
  },

  getOTPError: (otp: string): string | null => {
    if (!otp) return 'OTP is required';
    if (!/^\d*$/.test(otp)) return 'OTP can only contain digits';
    if (otp.length !== 6) return 'OTP must be exactly 6 digits';
    return null;
  },

  getPINCodeError: (pin: string): string | null => {
    if (!pin) return 'PIN code is required';
    if (!/^\d{6}$/.test(pin)) return 'PIN code must be exactly 6 digits';
    return null; // Allow manual entry - don't validate against database
  },

  // Address validation
  getAddressLineError: (address: string, isRequired: boolean = true): string | null => {
    if (!address && isRequired) return 'Address is required';
    if (address && address.length < 5) return 'Address must be at least 5 characters';
    if (address && address.length > 200) return 'Address must be less than 200 characters';
    return null;
  },

  getPhoneError: (phone: string): string | null => {
    if (!phone) return 'Phone number is required';
    const cleaned = phone.replace(/^\+/, '').replace(/\D/g, '');
    if (cleaned.length < 10) return 'Phone number must be at least 10 digits';
    if (cleaned.length > 15) return 'Phone number must be at most 15 digits';
    return null;
  },
};
