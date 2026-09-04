import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { emailAuthService, User as AuthUser } from '@/app/utils/emailAuthService';
import { phoneAuthService } from '@/app/utils/phoneAuthService';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  fullName?: string;
  provider: 'phone' | 'email' | 'google';
}

interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Phone OTP methods (Primary)
  sendPhoneOTP: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyPhoneOTP: (phone: string, otp: string, fullName?: string) => Promise<void>;

  // Email / Google methods (Optional)
  checkUserExists: (email: string) => Promise<boolean>;
  sendEmailOTP: (email: string, shouldCreateUser?: boolean) => Promise<void>;
  verifyEmailOTP: (email: string, otp: string) => Promise<void>;
  registerWithEmail: (email: string, otp: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check phone user first
        const phoneUser = phoneAuthService.getCurrentUser();
        if (phoneUser) {
          if (isMounted) setUser(phoneUser);
          return;
        }

        // Otherwise check email/Supabase session
        const currentUser = await emailAuthService.getCurrentUser();
        if (isMounted && currentUser) {
          setUser(currentUser as User);
        } else {
          setUser(null);
        }

        const unsubscribe = emailAuthService.onAuthStateChange((u) => {
          if (isMounted) {
            setUser(u as User);
          }
        });

        return unsubscribe;
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Phone OTP Handlers
  const sendPhoneOTP = async (phone: string) => {
    try {
      setError(null);
      setIsLoading(true);
      return await phoneAuthService.sendPhoneOTP(phone);
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP to mobile';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneOTP = async (phone: string, otp: string, fullName?: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const res = await phoneAuthService.verifyPhoneOTP(phone, otp, fullName);
      if (res.error || !res.user) {
        throw new Error(res.error || 'Invalid OTP code');
      }
      setUser(res.user);
    } catch (err: any) {
      const message = err.message || 'OTP verification failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Google Handlers
  const checkUserExists = async (email: string) => {
    return await emailAuthService.checkUserExists(email);
  };

  const sendEmailOTP = async (email: string, shouldCreateUser: boolean = true) => {
    try {
      setError(null);
      setIsLoading(true);
      await emailAuthService.sendEmailOTP(email, shouldCreateUser);
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailOTP = async (email: string, otp: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const { user: newUser, error: authError } = await emailAuthService.verifyEmailOTP(email, otp);
      if (authError) throw new Error(authError);
      setUser(newUser as User);
    } catch (err: any) {
      const message = err.message || 'OTP verification failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, otp: string, fullName: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const { user: newUser, error: authError } = await emailAuthService.registerWithEmail(email, otp, fullName);
      if (authError) throw new Error(authError);
      setUser(newUser as User);
    } catch (err: any) {
      const message = err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const { error: authError } = await emailAuthService.signInWithGoogle();
      if (authError) throw new Error(authError);
    } catch (err: any) {
      const message = err.message || 'Google sign in failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);
      phoneAuthService.logout();
      await emailAuthService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = () => {
    return user;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    sendPhoneOTP,
    verifyPhoneOTP,
    checkUserExists,
    sendEmailOTP,
    verifyEmailOTP,
    registerWithEmail,
    signInWithGoogle,
    logout,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
