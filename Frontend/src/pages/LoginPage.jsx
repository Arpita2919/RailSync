import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import railSyncLogo from '../assets/railsync-logo.png';

export default function LoginPage() {
  const { login, signup, loginWithGoogle, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnPath = location.state?.from || '/overview';

  const [mode, setMode]             = useState('login'); // 'login' | 'signup'
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [infoMsg, setInfoMsg]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted]       = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, returnPath]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setConfirmPass('');
    setError('');
    setInfoMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both Email and Password.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPass) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    if (mode === 'login') {
      const result = await login(email.trim(), password.trim());
      setLoading(false);

      if (result.success) {
        navigate(returnPath, { replace: true });
      } else {
        setError(result.error || 'Invalid credentials or login failed.');
      }
    } else {
      const result = await signup(email.trim(), password.trim());
      setLoading(false);

      if (result.success) {
        if (result.needsEmailVerification) {
          setInfoMsg('Account created! Please check your email inbox to confirm your verification link.');
          switchMode('login');
        } else {
          navigate(returnPath, { replace: true });
        }
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setInfoMsg('');
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success) {
      setGoogleLoading(false);
      setError(result.error || 'Google Sign-In failed.');
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
            <div className="px-8 pt-8 pb-4 border-b border-[#1a2942]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
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
              </div>

              {/* Sign In / Sign Up Mode Switcher Tabs */}
              <div className="flex items-center p-1 rounded bg-[#080f1d] border border-[#1a2942] mb-4">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-1.5 text-center font-code-sm text-xs font-bold rounded transition-all duration-200 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#16253d] text-white border border-[#394761] shadow-sm'
                      : 'text-[#7e8ca9] hover:text-white'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-1.5 text-center font-code-sm text-xs font-bold rounded transition-all duration-200 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#16253d] text-white border border-[#394761] shadow-sm'
                      : 'text-[#7e8ca9] hover:text-white'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              <h1 className="font-headline-lg text-lg font-bold text-white leading-snug mb-1">
                {mode === 'login' ? 'Sign In to Operations Console' : 'Create RailSync Account'}
              </h1>
              <p className="font-body-sm text-sm text-[#94a3b8] leading-relaxed">
                {mode === 'login'
                  ? 'Sign in using your Supabase credentials to access the RailSync Operations Console.'
                  : 'Register a new account to access the RailSync Operations Console.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off" className="px-8 py-6 space-y-4">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded bg-[#ba1a1a]/20 border border-[#ba1a1a]/50 text-[#ffdad6]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-[#ba1a1a]">
                    error
                  </span>
                  <span className="font-body-sm text-sm leading-snug">{error}</span>
                </div>
              )}

              {/* Info banner */}
              {infoMsg && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded bg-[#3c9e57]/20 border border-[#3c9e57]/50 text-[#b5f3c5]">
                  <span className="material-symbols-outlined text-[18px] shrink-0 text-[#3c9e57]">
                    check_circle
                  </span>
                  <span className="font-body-sm text-sm leading-snug">{infoMsg}</span>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="rs-email"
                  className="font-label-caps text-[10px] font-bold text-[#b8c7e6] uppercase tracking-wider block"
                >
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#505f7a]">
                    mail
                  </span>
                  <input
                    id="rs-email"
                    name="railsync_email"
                    type="email"
                    autoComplete="new-password"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-[#080f1d] border border-[#1e304d] rounded px-10 py-2.5 font-code-sm text-sm text-white placeholder-[#394761] focus:outline-none focus:border-[#5c7ab5] focus:ring-1 focus:ring-[#5c7ab5]/30 transition-all duration-200"
                    disabled={loading || googleLoading}
                    required
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
                    name="railsync_password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#080f1d] border border-[#1e304d] rounded px-10 py-2.5 font-code-sm text-sm text-white placeholder-[#394761] focus:outline-none focus:border-[#5c7ab5] focus:ring-1 focus:ring-[#5c7ab5]/30 transition-all duration-200"
                    disabled={loading || googleLoading}
                    required
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

              {/* Confirm Password field (for Signup mode) */}
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="rs-confirm-password"
                    className="font-label-caps text-[10px] font-bold text-[#b8c7e6] uppercase tracking-wider block"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-[#505f7a]">
                      lock_reset
                    </span>
                    <input
                      id="rs-confirm-password"
                      name="railsync_confirm_password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full bg-[#080f1d] border border-[#1e304d] rounded px-10 py-2.5 font-code-sm text-sm text-white placeholder-[#394761] focus:outline-none focus:border-[#5c7ab5] focus:ring-1 focus:ring-[#5c7ab5]/30 transition-all duration-200"
                      disabled={loading || googleLoading}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                id="rs-auth-submit"
                type="submit"
                disabled={loading || googleLoading}
                className={`w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded font-code-sm text-[13px] font-bold uppercase tracking-wider transition-all duration-250 ${
                  loading
                    ? 'bg-[#16253d] border border-[#394761] text-[#b8c7e6] cursor-not-allowed'
                    : 'bg-[#16253d] border border-[#3b4d6e] text-white hover:bg-[#1e3355] hover:border-[#b8c7e6] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 cursor-pointer'
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
                    <span>{mode === 'login' ? 'AUTHENTICATING...' : 'CREATING ACCOUNT...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'AUTHENTICATE & CONTINUE' : 'REGISTER ACCOUNT'}</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="px-8 flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-[#1a2942]" />
              <span className="font-label-caps text-[9px] uppercase tracking-wider text-[#505f7a] font-bold">OR</span>
              <div className="flex-1 h-px bg-[#1a2942]" />
            </div>

            {/* Google OAuth Button */}
            <div className="px-8 pb-6 pt-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded bg-[#080f1d] border border-[#1e304d] text-sm font-semibold text-[#dfe9f5] hover:bg-[#14233c] hover:border-[#394761] transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>
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
          <span>SUPABASE AUTH ACTIVATED</span>
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
