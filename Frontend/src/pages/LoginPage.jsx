import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import railSyncLogo from '../assets/railsync-logo.png';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnPath = location.state?.from || '/overview';

  const [userId, setUserId]         = useState('');
  const [password, setPassword]     = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [mounted, setMounted]       = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // If already authenticated, go to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate(returnPath, { replace: true });
  }, [isAuthenticated, navigate, returnPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password.trim()) {
      setError('Please enter both User ID and Password.');
      return;
    }

    setLoading(true);
    const result = await login(userId, password, rememberMe);
    setLoading(false);

    if (result.success) {
      navigate(returnPath, { replace: true });
    } else {
      setError(result.error || 'Invalid User ID or password.');
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#080f1d] text-white flex flex-col transition-opacity duration-500 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(26,41,66,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,41,66,0.25) 1px, transparent 1px)',
        backgroundSize: '3rem 3rem',
      }}
    >
      {/* Ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#16253d]/30 rounded-full blur-3xl pointer-events-none" />

      {/* ── TOP NAV BAR ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#1a2942] bg-[#080f1d]/80 backdrop-blur-sm">
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="w-8 h-8 rounded bg-[#16253d] border border-[#394761] flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={railSyncLogo}
              alt="RailSync"
              className="h-6 w-6 object-contain"
              onError={(e) => { e.currentTarget.src = '/railsync-logo.png'; }}
            />
          </div>
          <div>
            <div className="font-headline-sm text-[15px] font-bold tracking-tight text-white leading-tight">
              RAILSYNC
            </div>
            <div className="font-label-caps text-[9px] uppercase tracking-wider text-[#7e8ca9] font-semibold">
              NCR / PRYJ DIVISION
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-1.5 font-code-sm text-[12px] font-semibold text-[#b8c7e6] hover:text-white transition-colors group"
        >
          <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:-translate-x-0.5">
            arrow_back
          </span>
          <span>Back to RailSync</span>
        </Link>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div
          className={`w-full max-w-md transition-all duration-600 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          {/* Card */}
          <div className="rounded-lg bg-[#0c172b]/95 border border-[#1e304d] shadow-2xl overflow-hidden">

            {/* Card header */}
            <div className="px-8 pt-8 pb-6 border-b border-[#1a2942]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded bg-[#16253d] border border-[#394761] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px] text-[#95f8a7]">lock</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-[16px] font-bold text-white leading-tight">
                      RAILSYNC
                    </span>
                    <span className="font-label-caps text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#16253d] border border-[#394761] text-[#b8c7e6]">
                      AI · TWIN
                    </span>
                  </div>
                  <div className="font-label-caps text-[10px] uppercase tracking-wider text-[#7e8ca9] font-semibold mt-0.5">
                    Secure Operations Access
                  </div>
                </div>
              </div>

              <h1 className="font-headline-lg text-lg font-bold text-white leading-snug mb-1">
                Sign In to Operations Console
              </h1>
              <p className="font-body-sm text-sm text-[#94a3b8] leading-relaxed">
                Sign in to access the RailSync Railway Operations Console.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded bg-[#ba1a1a]/20 border border-[#ba1a1a]/50 text-[#ffdad6]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-[#ba1a1a]">
                    error
                  </span>
                  <span className="font-body-sm text-sm leading-snug">{error}</span>
                </div>
              )}

              {/* User ID field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="rs-user-id"
                  className="font-label-caps text-[10px] font-bold text-[#b8c7e6] uppercase tracking-wider block"
                >
                  Employee ID / Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#505f7a]">
                    badge
                  </span>
                  <input
                    id="rs-user-id"
                    type="text"
                    autoComplete="username"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="admin"
                    className="w-full bg-[#080f1d] border border-[#1e304d] rounded px-10 py-2.5 font-code-sm text-sm text-white placeholder-[#394761] focus:outline-none focus:border-[#5c7ab5] focus:ring-1 focus:ring-[#5c7ab5]/30 transition-all duration-200"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="rs-password"
                  className="font-label-caps text-[10px] font-bold text-[#b8c7e6] uppercase tracking-wider block"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#505f7a]">
                    key
                  </span>
                  <input
                    id="rs-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="railsync"
                    className="w-full bg-[#080f1d] border border-[#1e304d] rounded px-10 py-2.5 font-code-sm text-sm text-white placeholder-[#394761] focus:outline-none focus:border-[#5c7ab5] focus:ring-1 focus:ring-[#5c7ab5]/30 transition-all duration-200"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#505f7a] hover:text-[#b8c7e6] transition-colors"
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <div className="relative">
                    <input
                      id="rs-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                      disabled={loading}
                    />
                    <div className="w-4 h-4 rounded border border-[#394761] bg-[#080f1d] peer-checked:bg-[#3c9e57] peer-checked:border-[#3c9e57] transition-all duration-200 flex items-center justify-center">
                      {rememberMe && (
                        <span className="material-symbols-outlined text-[12px] text-white">check</span>
                      )}
                    </div>
                  </div>
                  <span className="font-body-sm text-xs text-[#94a3b8] group-hover:text-[#b8c7e6] transition-colors">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  className="font-body-sm text-xs text-[#7e8ca9] hover:text-[#b8c7e6] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit button */}
              <button
                id="rs-auth-submit"
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded font-code-sm text-[13px] font-bold uppercase tracking-wider transition-all duration-250 ${
                  loading
                    ? 'bg-[#16253d] border border-[#394761] text-[#b8c7e6] cursor-not-allowed'
                    : 'bg-[#16253d] border border-[#3b4d6e] text-white hover:bg-[#1e3355] hover:border-[#b8c7e6] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin shrink-0 text-[#95f8a7]"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>AUTHENTICATE &amp; CONTINUE</span>
                    <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Card footer — demo notice */}
            <div className="px-8 pb-6">
              <div className="rounded bg-[#080f1d] border border-[#1a2942] px-4 py-3">
                <div className="font-label-caps text-[9px] font-bold text-[#7e8ca9] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-[#505f7a]">info</span>
                  PROTOTYPE DEMO CREDENTIALS
                </div>
                <div className="font-code-sm text-[11px] text-[#94a3b8] space-y-0.5">
                  <div>
                    <span className="text-[#7e8ca9]">Employee ID: </span>
                    <span className="text-[#dfe9f5] font-semibold">admin</span>
                    <span className="text-[#505f7a]"> (or admin@railsync.in)</span>
                  </div>
                  <div>
                    <span className="text-[#7e8ca9]">Password: </span>
                    <span className="text-[#dfe9f5] font-semibold">railsync</span>
                    <span className="text-[#505f7a]"> (or RailSync@123)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Below card — SIH/ministry notice */}
          <p className="text-center font-label-caps text-[10px] text-[#394761] uppercase tracking-wider mt-6">
            Smart India Hackathon · Ministry of Railways · Indian Railways PRYJ Division
          </p>
        </div>
      </main>

      {/* Decorative bottom strip matching sidebar */}
      <div className="relative z-10 py-3 border-t border-[#1a2942] px-6">
        <div className="flex items-center justify-center gap-4 font-code-sm text-[11px] text-[#394761]">
          <span>SOLVER ENGINE: CP-SAT v4.2</span>
          <span>·</span>
          <span className="text-[#394761]">PREDICT · DETECT · OPTIMIZE · EXPLAIN · REPLAN</span>
          <span>·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3c9e57] animate-pulse" />
            CRIS LINK NORMAL
          </span>
        </div>
      </div>
    </div>
  );
}
