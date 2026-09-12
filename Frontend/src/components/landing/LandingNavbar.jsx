import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import railSyncLogo from '../../assets/railsync-logo.png';

const NAV_LINKS = [
  { label: 'Problem',      href: '#problem'      },
  { label: 'Pipeline',     href: '#pipeline'     },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Digital Twin', href: '#digital-twin' },
  { label: 'What-If',      href: '#what-if'      },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 rs-navbar-enter transition-all duration-300 ${
        scrolled
          ? 'bg-[#080f1d]/95 backdrop-blur-md border-b border-[#1a2942] py-2.5 shadow-lg shadow-black/30'
          : 'bg-[#080f1d]/75 backdrop-blur-sm border-b border-[#1a2942]/40 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* Brand */}
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
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-[15px] font-bold tracking-tight text-white leading-tight">
                RAILSYNC
              </span>
              <span className="font-label-caps text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#16253d] text-[#b8c7e6] border border-[#394761] font-bold">
                AI · TWIN
              </span>
            </div>
            <span className="font-label-caps text-[9px] uppercase tracking-wider text-[#505f7a] font-semibold block leading-tight">
              AI-Powered Railway Maintenance Planning
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-[#0c172b]/80 px-3 py-1 rounded border border-[#1a2942]">
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rs-nav-link text-[12px] font-semibold text-[#b8c7e6] hover:text-white px-3 py-1.5 rounded transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Status + CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#16253d] border border-[#1a2942] text-[11px] font-code-sm font-bold text-[#95f8a7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3c9e57] rs-status-live" />
            <span>SOLVER READY</span>
          </div>
          <Link
            to="/login"
            className="group rs-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded text-[12px] font-code-sm font-bold uppercase tracking-wide"
          >
            <span>Launch Dashboard</span>
            <span className="rs-arrow-icon material-symbols-outlined text-[15px]">arrow_forward</span>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex lg:hidden items-center gap-2">
          <Link
            to="/login"
            className="rs-btn-primary px-3 py-1.5 rounded text-[11px] font-code-sm font-bold uppercase tracking-wider"
          >
            Launch
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded bg-[#16253d] text-[#b8c7e6] hover:text-white border border-[#394761] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0c172b] border-b border-[#1a2942] px-4 pt-3 pb-6 space-y-1 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#1a2942]">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-xs font-semibold text-[#b8c7e6] hover:text-white p-2 rounded hover:bg-[#16253d] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-2">
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="rs-btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-code-sm font-bold uppercase tracking-wider"
            >
              <span>Launch RailSync Dashboard</span>
              <span className="rs-arrow-icon material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
