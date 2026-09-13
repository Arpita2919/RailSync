import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * ProtectedRoute — wraps any dashboard route.
 * If auth session resolution is loading, renders a clean loading screen.
 * If the user is not authenticated, redirects to /login
 * and preserves the originally requested path via state.from.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080f1d] text-white flex flex-col items-center justify-center space-y-3">
        <svg
          className="w-8 h-8 animate-spin text-[#95f8a7]"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="font-code-sm text-xs text-[#7e8ca9] uppercase tracking-wider font-semibold">
          VERIFYING SESSION...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}
