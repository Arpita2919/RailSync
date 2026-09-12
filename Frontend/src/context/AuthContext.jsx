import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'railsync_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const sessionData = sessionStorage.getItem(STORAGE_KEY);
      if (sessionData) return JSON.parse(sessionData);

      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) return JSON.parse(localData);
    } catch {
      // Ignore parse error
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(user);

  const login = async (userId, password, rememberMe = false) => {
    setLoading(true);

    // Simulate realistic sub-second authentication handshake
    await new Promise((resolve) => setTimeout(resolve, 600));

    const cleanUserId = (userId || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Standard prototype demo credentials validation
    const isPasswordValid =
      cleanPassword.toLowerCase() === 'railsync' ||
      cleanPassword === 'RailSync@123' ||
      cleanPassword === 'admin';

    const isValid = cleanUserId.length > 0 && isPasswordValid;

    if (!isValid) {
      setLoading(false);
      return {
        success: false,
        error: 'Invalid Employee ID or password. Use demo: admin / railsync',
      };
    }

    const userData = {
      userId: cleanUserId,
      name: cleanUserId.includes('admin') ? 'Sr. DOM / PRYJ Controller' : 'Duty Officer',
      role: 'Chief Operations Controller',
      division: 'North Central Railway · PRYJ Division',
      desk: 'COA / Quad Desk',
      loginTime: new Date().toISOString(),
      token: 'demo_token_' + Date.now(),
    };

    try {
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage error fallback
    }

    setUser(userData);
    setLoading(false);

    return { success: true, user: userData };
  };

  const logout = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore cleanup error
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
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
