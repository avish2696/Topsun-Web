import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

function getSupabase() {
  if (!supabaseInstance) {
    const url = import.meta.env.VITE_SUPABASE_URL || 'https://zzlbcfnctwpgbjtbmmab.supabase.co';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bGJjZm5jdHdwZ2JqdGJtbWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NzA4MjksImV4cCI6MjAyNTI0NjgyOX0.kbsv4vw6JX8G_ZX-bnLtV2RqhHMmf_e8HjRJ0_G2mFo';
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  provider: 'email' | 'google';
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

class EmailAuthService {
  /**
   * Check if an email account already exists in Supabase
   */
  async checkUserExists(email: string): Promise<boolean> {
    try {
      const cleanEmail = email.toLowerCase().trim();
      // Check in orders table or users table or RPC to see if user exists
      const { data, error } = await getSupabase()
        .from('users')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (data && data.id) return true;

      // Fallback check in orders if users table record was optional
      const { data: orderData } = await getSupabase()
        .from('orders')
        .select('id')
        .filter('shipping_address->>email', 'eq', cleanEmail)
        .limit(1);

      if (orderData && orderData.length > 0) return true;

      return false;
    } catch (err) {
      console.warn('User existence check failed, defaulting to false:', err);
      return false;
    }
  }

  /**
   * Send OTP to email
   */
  async sendEmailOTP(email: string, shouldCreateUser: boolean = true): Promise<void> {
    try {
      console.log('📧 Sending OTP to email:', email, 'shouldCreateUser:', shouldCreateUser);

      const { error } = await getSupabase().auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser,
        },
      });

      if (error) {
        console.error('❌ OTP send error:', error);
        throw new Error(error.message);
      }

      console.log('✅ OTP sent successfully');
    } catch (err: any) {
      console.error('❌ Email OTP send failed:', err);
      throw err;
    }
  }

  /**
   * Verify OTP and sign in
   */
  async verifyEmailOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Verifying OTP for:', email);

      const { data, error } = await getSupabase().auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: otp,
        type: 'email',
      });

      if (error) {
        console.error('❌ OTP verification error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('User not found after verification');
      }

      // Record/Update user in users table
      const cleanEmail = email.toLowerCase().trim();
      await getSupabase().from('users').upsert({
        id: data.user.id,
        email: cleanEmail,
        full_name: data.user.user_metadata?.full_name || 'User',
      }, { onConflict: 'id' }).catch(() => {});

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        fullName: data.user.user_metadata?.full_name,
        provider: 'email',
      };

      console.log('✅ OTP verified successfully');
      return { user, error: null };
    } catch (err: any) {
      console.error('❌ Email OTP verification failed:', err);
      return { user: null, error: err.message };
    }
  }

  /**
   * Register with email and name
   */
  async registerWithEmail(email: string, otp: string, fullName: string): Promise<AuthResponse> {
    try {
      console.log('📝 Registering user:', email);

      const { data, error } = await getSupabase().auth.verifyOtp({
        email: email.toLowerCase().trim(),
        token: otp,
        type: 'email',
      });

      if (error) {
        console.error('❌ OTP verification error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('User not found after verification');
      }

      // Update user profile metadata
      await getSupabase().auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      // Insert/Upsert into users table
      const cleanEmail = email.toLowerCase().trim();
      await getSupabase().from('users').upsert({
        id: data.user.id,
        email: cleanEmail,
        full_name: fullName,
      }, { onConflict: 'id' }).catch(() => {});

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        fullName: fullName,
        provider: 'email',
      };

      console.log('✅ User registered successfully');
      return { user, error: null };
    } catch (err: any) {
      console.error('❌ Email registration failed:', err);
      return { user: null, error: err.message };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      console.log('🔵 Starting Google sign in...');

      const { error } = await getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ Google sign in error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Google sign in initiated');
      return { error: null };
    } catch (err: any) {
      console.error('❌ Google sign in failed:', err);
      return { error: err.message };
    }
  }

  /**
   * Get current user (async)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await getSupabase().auth.getSession();
      
      if (!data.session?.user) return null;

      const authUser = data.session.user;
      return {
        id: authUser.id,
        email: authUser.email || '',
        fullName: authUser.user_metadata?.full_name,
        provider: authUser.app_metadata?.provider === 'google' ? 'google' : 'email',
      };
    } catch (err) {
      console.error('❌ Get current user error:', err);
      return null;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      console.log('👋 Logging out...');
      const { error } = await getSupabase().auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        throw new Error(error.message);
      }
      console.log('✅ Logged out successfully');
    } catch (err: any) {
      console.error('❌ Logout failed:', err);
      throw err;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: authListener } = getSupabase().auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event);

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name,
          provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        };
        callback(user);
      } else {
        callback(null);
      }
    });

    return authListener?.subscription.unsubscribe;
  }
}

export const emailAuthService = new EmailAuthService();
