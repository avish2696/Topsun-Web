import { User } from '@/app/context/AuthContext';
import { supabase } from '@/supabase';

/**
 * User Service - Provides unified access to user data via Supabase auth
 * 
 * Single Source of Truth: auth.users table
 * - No in-memory user storage
 * - All user queries go through Supabase
 * - User metadata stored in user_metadata and custom claims
 * 
 * NOTE: Supabase auth.users table is built-in and managed by Supabase
 * Contains: id (UUID), email, phone (custom claim), created_at, updated_at
 * Can store additional data in: user_metadata = { fullName, phone, ... }
 */

export const userService = {
  /**
   * Get user by ID from Supabase auth.users
   * Uses admin API to query auth.users table
   * 
   * Returns user data including metadata
   */
  async getById(userId: string): Promise<User | null> {
    try {
      console.log(`🔍 Fetching user by ID: ${userId}`);

      // Use supabase.auth.admin.getUserById to get user from auth.users table
      const { data: { user: authUser }, error } = await supabase.auth.admin.getUserById(userId);

      if (error) {
        console.error(`❌ Failed to get user by ID: ${error.message}`);
        return null;
      }

      if (!authUser) {
        console.log(`ℹ️ User not found: ${userId}`);
        return null;
      }

      // Transform Supabase auth user to User interface
      const user: User = {
        id: authUser.id,
        fullName: authUser.user_metadata?.full_name || 'User',
        email: authUser.email || '',
        phone: authUser.user_metadata?.phone,
        createdAt: new Date(authUser.created_at),
        updatedAt: new Date(authUser.updated_at),
      };

      console.log(`✅ User found: ${user.email}`);
      return user;
    } catch (err: any) {
      console.error(`❌ userService.getById error: ${err.message}`);
      return null;
    }
  },

  /**
   * Get user by phone from Supabase auth.users custom metadata
   * Queries auth.users where user_metadata->>'phone' matches
   * 
   * Returns first matching user or null
   */
  async getByPhone(phone: string): Promise<User | null> {
    try {
      console.log(`🔍 Fetching user by phone: ${phone}`);

      // Use admin API to list users and filter by phone in metadata
      // Note: Direct filtering by metadata not available in admin API,
      // so we fetch all users (in production, use RLS policy with public function)
      const { data: { users }, error } = await supabase.auth.admin.listUsers();

      if (error) {
        console.error(`❌ Failed to list users: ${error.message}`);
        return null;
      }

      // Find user with matching phone in metadata
      const authUser = users?.find(u => u.user_metadata?.phone === phone);

      if (!authUser) {
        console.log(`ℹ️ User not found with phone: ${phone}`);
        return null;
      }

      const user: User = {
        id: authUser.id,
        fullName: authUser.user_metadata?.full_name || 'User',
        email: authUser.email || '',
        phone: authUser.user_metadata?.phone,
        createdAt: new Date(authUser.created_at),
        updatedAt: new Date(authUser.updated_at),
      };

      console.log(`✅ User found by phone: ${user.email}`);
      return user;
    } catch (err: any) {
      console.error(`❌ userService.getByPhone error: ${err.message}`);
      return null;
    }
  },

  /**
   * Check if phone number exists in auth.users
   * 
   * Returns: true if phone exists, false otherwise
   */
  async phoneExists(phone: string): Promise<boolean> {
    try {
      console.log(`🔍 Checking if phone exists: ${phone}`);

      const { data: { users }, error } = await supabase.auth.admin.listUsers();

      if (error) {
        console.error(`❌ Failed to list users: ${error.message}`);
        return false;
      }

      const exists = users?.some(u => u.user_metadata?.phone === phone) ?? false;

      console.log(`${exists ? '✅' : 'ℹ️'} Phone exists: ${exists}`);
      return exists;
    } catch (err: any) {
      console.error(`❌ userService.phoneExists error: ${err.message}`);
      return false;
    }
  },

  /**
   * Update user profile in Supabase auth.users
   * Can update fullName, phone, or other metadata
   * 
   * Only the current user can update their own profile via client
   * Admin can update any user via admin API (used here)
   */
  async update(
    userId: string,
    updates: {
      fullName?: string;
      phone?: string;
      email?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<User | null> {
    try {
      console.log(`✏️ Updating user: ${userId}`);

      // Prepare metadata updates
      const userData: any = {
        data: {
          ...(updates.fullName && { full_name: updates.fullName }),
          ...(updates.phone && { phone: updates.phone }),
          ...(updates.metadata && updates.metadata),
        },
      };

      // Update email if provided
      if (updates.email) {
        userData.email = updates.email;
      }

      const { data: { user: authUser }, error } = await supabase.auth.admin.updateUserById(
        userId,
        userData
      );

      if (error) {
        console.error(`❌ Failed to update user: ${error.message}`);
        return null;
      }

      if (!authUser) {
        console.error(`❌ User not found after update: ${userId}`);
        return null;
      }

      const user: User = {
        id: authUser.id,
        fullName: authUser.user_metadata?.full_name || 'User',
        email: authUser.email || '',
        phone: authUser.user_metadata?.phone,
        createdAt: new Date(authUser.created_at),
        updatedAt: new Date(authUser.updated_at),
      };

      console.log(`✅ User updated: ${user.email}`);
      return user;
    } catch (err: any) {
      console.error(`❌ userService.update error: ${err.message}`);
      return null;
    }
  },

  /**
   * Get current authenticated user from session
   * This is the primary way to get the logged-in user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        return null;
      }

      return {
        id: session.user.id,
        fullName: session.user.user_metadata?.full_name || 'User',
        email: session.user.email || '',
        phone: session.user.user_metadata?.phone,
        createdAt: new Date(session.user.created_at),
        updatedAt: new Date(session.user.updated_at),
      };
    } catch (err: any) {
      console.error(`❌ userService.getCurrentUser error: ${err.message}`);
      return null;
    }
  },
};
