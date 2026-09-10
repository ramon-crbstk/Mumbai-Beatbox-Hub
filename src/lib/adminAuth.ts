import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase.js';

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
  lastSignIn?: string;
  createdAt?: string;
}

// Known project owner / default admin email from environment / metadata
const OWNER_EMAIL = 'ramonrbakuri@gmail.com';

/**
 * Verifies if a given Supabase User object has administrator rights synchronously.
 * Checks:
 * 1. user.app_metadata.role === 'admin' or user.app_metadata.is_admin === true
 * 2. user.user_metadata.role === 'admin' or user.user_metadata.is_admin === true
 * 3. VITE_ADMIN_EMAILS environment variable (comma-separated list)
 * 4. Project owner account fallback
 */
export function verifyUserIsAdmin(user: User | null | undefined): { isAdmin: boolean; reason?: string } {
  if (!user || !user.email) {
    return { isAdmin: false, reason: 'No active user account found' };
  }

  const emailLower = user.email.toLowerCase();

  // 1. Check user.app_metadata (set by Supabase Admin API / SQL editor)
  const appRole = user.app_metadata?.role;
  const appIsAdmin = user.app_metadata?.is_admin === true;
  if (appRole === 'admin' || appIsAdmin) {
    return { isAdmin: true };
  }

  // 2. Check user.user_metadata (set by Supabase User Metadata)
  const userRole = user.user_metadata?.role;
  const userIsAdmin = user.user_metadata?.is_admin === true;
  if (userRole === 'admin' || userIsAdmin) {
    return { isAdmin: true };
  }

  // 3. Check VITE_ADMIN_EMAILS from environment
  const adminEmailsEnv = (import.meta.env.VITE_ADMIN_EMAILS || '').toLowerCase();
  const configuredEmails = adminEmailsEnv
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  if (configuredEmails.includes(emailLower)) {
    return { isAdmin: true };
  }

  // 4. Project owner email
  if (emailLower === OWNER_EMAIL.toLowerCase()) {
    return { isAdmin: true };
  }

  return {
    isAdmin: false,
    reason: `Access Denied: Account '${user.email}' does not have an administrator role in Supabase Auth or public.admins table.`,
  };
}

/**
 * Async verification against live Supabase database authorization (RPC public.is_admin and public.admins table)
 */
export async function verifyUserIsAdminAsync(user: User | null | undefined): Promise<{ isAdmin: boolean; reason?: string }> {
  if (!user || !user.email) {
    return { isAdmin: false, reason: 'No active user account found' };
  }

  // First check synchronous criteria
  const syncCheck = verifyUserIsAdmin(user);
  if (syncCheck.isAdmin) {
    return syncCheck;
  }

  try {
    // 1. Check RPC is_admin() in Supabase
    const { data: rpcIsAdmin, error: rpcError } = await supabase.rpc('is_admin');
    if (!rpcError && rpcIsAdmin === true) {
      return { isAdmin: true };
    }

    // 2. Check public.admins by user id (UUID)
    const { data: adminById, error: idError } = await supabase
      .from('admins')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (!idError && adminById?.id) {
      return { isAdmin: true };
    }

    // 3. Check public.admins by email
    const { data: adminByEmail, error: emailError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email.toLowerCase())
      .maybeSingle();

    if (!emailError && adminByEmail?.id) {
      return { isAdmin: true };
    }
  } catch (e) {
    console.warn('Database admin check query exception:', e);
  }

  return {
    isAdmin: false,
    reason: `Access Denied: Account '${user.email}' is authenticated, but was not found in public.admins. Please run the SQL schema to add this user as admin.`,
  };
}

/**
 * Sign in an administrator using Supabase Authentication.
 * Enforces role verification: non-admins are immediately signed out.
 */
export async function signInAdmin(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    if (!email || !pass) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Authentication failed: No user returned.' };
    }

    // Enforce Admin Verification using async database check
    const verification = await verifyUserIsAdminAsync(data.user);
    if (!verification.isAdmin) {
      // Immediately terminate the session for non-admin accounts
      await supabase.auth.signOut();
      return {
        success: false,
        error: verification.reason || 'Access Denied: Administrator role required in public.admins.',
      };
    }

    const adminUser: AdminUser = {
      id: data.user.id,
      email: data.user.email || email,
      role: 'admin',
      isAdmin: true,
      lastSignIn: data.user.last_sign_in_at,
      createdAt: data.user.created_at,
    };

    return { success: true, user: adminUser };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Signs out the current administrator
 */
export async function signOutAdmin(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Error signing out admin:', err);
  }
}

/**
 * Asynchronously checks current Supabase session and verifies admin rights.
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) {
      return null;
    }

    const verification = await verifyUserIsAdminAsync(data.session.user);
    if (!verification.isAdmin) {
      return null;
    }

    return {
      id: data.session.user.id,
      email: data.session.user.email || '',
      role: 'admin',
      isAdmin: true,
      lastSignIn: data.session.user.last_sign_in_at,
      createdAt: data.session.user.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Custom React Hook to manage Admin Auth lifecycle
 */
export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !data.session?.user) {
        setAdminUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      const verification = await verifyUserIsAdminAsync(data.session.user);
      if (verification.isAdmin) {
        setAdminUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          role: 'admin',
          isAdmin: true,
          lastSignIn: data.session.user.last_sign_in_at,
          createdAt: data.session.user.created_at,
        });
        setSession(data.session);
        setError(null);
      } else {
        // If logged in user is not admin, sign out
        await supabase.auth.signOut();
        setAdminUser(null);
        setSession(null);
        setError(verification.reason || 'Unauthorized');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setAdminUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_OUT' || !newSession?.user) {
          setAdminUser(null);
          setSession(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const verification = await verifyUserIsAdminAsync(newSession.user);
          if (verification.isAdmin) {
            setAdminUser({
              id: newSession.user.id,
              email: newSession.user.email || '',
              role: 'admin',
              isAdmin: true,
              lastSignIn: newSession.user.last_sign_in_at,
              createdAt: newSession.user.created_at,
            });
            setSession(newSession);
            setError(null);
          } else {
            await supabase.auth.signOut();
            setAdminUser(null);
            setSession(null);
            setError(verification.reason || 'Unauthorized');
          }
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAuth]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    const result = await signInAdmin(email, pass);
    if (!result.success) {
      setError(result.error || 'Authentication failed');
      setLoading(false);
      return false;
    }
    setAdminUser(result.user || null);
    setLoading(false);
    return true;
  };

  const logout = async () => {
    setLoading(true);
    await signOutAdmin();
    setAdminUser(null);
    setSession(null);
    setLoading(false);
  };

  return {
    adminUser,
    session,
    loading,
    error,
    login,
    logout,
    refresh: checkAuth,
  };
}
