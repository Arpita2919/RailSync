import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Derive UI-friendly user object from Supabase session user
  const formatUser = (supabaseUser) => {
    if (!supabaseUser) return null;
    const metadata = supabaseUser.user_metadata || {};
    const email = supabaseUser.email || '';
    const nameFromEmail = email ? email.split('@')[0] : 'Duty Officer';

    return {
      id: supabaseUser.id,
      email: email,
      userId: metadata.employee_id || metadata.username || email || supabaseUser.id,
      name: metadata.full_name || metadata.name || nameFromEmail,
      role: metadata.role || 'Chief Operations Controller',
      division: metadata.division || 'North Central Railway · PRYJ Division',
      desk: metadata.desk || 'COA / Quad Desk',
      loginTime: supabaseUser.last_sign_in_at || new Date().toISOString(),
      raw: supabaseUser,
    };
  };

  useEffect(() => {
    let mounted = true;

    // 1. Retrieve current session on app startup
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('[RailSync Auth] Error getting initial session:', error);
      }
      if (mounted) {
        setSession(initialSession);
        setUser(formatUser(initialSession?.user));
        setLoading(false);
      }
    }).catch((err) => {
      console.error('[RailSync Auth] Session retrieval failed:', err);
      if (mounted) setLoading(false);
    });

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          setUser(formatUser(currentSession?.user));
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase configuration missing! Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to Frontend/.env',
      };
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (error) {
        return { success: false, error: error.message };
      }

      setSession(data.session);
      setUser(formatUser(data.user));
      return { success: true, user: formatUser(data.user) };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Authentication request failed.' };
    }
  };

  const signup = async (email, password, extraData = {}) => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase configuration missing! Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to Frontend/.env',
      };
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: extraData,
        },
      });

      setLoading(false);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(formatUser(data.user));
      }

      return {
        success: true,
        user: formatUser(data.user),
        needsEmailVerification: !data.session && Boolean(data.user),
      };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Registration request failed.' };
    }
  };

  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase configuration missing! Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to Frontend/.env',
      };
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message || 'Google OAuth request failed.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[RailSync Auth] SignOut error:', err);
    }
    setSession(null);
    setUser(null);
  };

  const token = session?.access_token || null;
  const isAuthenticated = Boolean(session && session.user);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        token,
        isAuthenticated,
        loading,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
