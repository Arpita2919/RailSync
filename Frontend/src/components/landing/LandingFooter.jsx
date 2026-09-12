import React from 'react';
import { Link } from 'react-router-dom';
import railSyncLogo from '../../assets/railsync-logo.png';

const APP_LINKS = [
  { label: 'Home',           to: '/'           },
  { label: 'Dashboard',      to: '/login'       },
  { label: 'Optimisation',   to: '/login'       },
  { label: 'Digital Twin',   to: '/login'       },
  { label: 'What-If',        to: '/login'       },
];

const SECTION_LINKS = [
  { label: 'The Problem',   href: '#problem'      },
  { label: 'How It Works',  href: '#how-it-works' },
  { label: 'Capabilities',  href: '#capabilities' },
  { label: 'Digital Twin',  href: '#digital-twin' },
  { label: 'What-If',       href: '#what-if'      },
];

const TECH = [
  { icon: 'memory',     label: 'Google OR-Tools CP-SAT' },
  { icon: 'insights',   label: 'ML Risk Prediction'     },
  { icon: 'psychology', label: 'Explainable Optimisation'},
];

export default function LandingFooter() {
  return (
    <footer className="bg-[#0c172b] border-t border-[#1a2942] text-slate-300 font-code-sm text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-9 border-b border-[#1a2942]">

          {/* Brand column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#16253d] border border-[#394761] p-1 flex items-center justify-center shrink-0">
                <img
                  src={railSyncLogo}
                  alt="RailSync Logo"
                  className="h-6 w-6 object-contain"
                  onError={(e) => { e.currentTarget.src = '/railsync-logo.png'; }}
                />
              </div>
              <div>
                <span className="font-headline-sm font-bold text-white text-base tracking-tight block leading-tight">
                  RAILSYNC
                </span>
                <span className="font-label-caps text-[9px] text-[#7e8ca9] tracking-wider uppercase font-semibold">
                  AI-Powered Automatic Block Planning &amp; Digital Twin
                </span>
              </div>
            </div>

            <p className="font-body-sm text-slate-400 text-xs leading-relaxed max-w-md">
              RailSync is a prototype system for AI-driven railway maintenance planning, combining predictive risk intelligence, conflict detection, and constraint-based optimisation using Google OR-Tools CP-SAT.
            </p>

            {/* SIH notice */}
            <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3c9e57] rs-status-live mt-1 shrink-0" />
              <span>Smart India Hackathon &nbsp;·&nbsp; Transportation &amp; Logistics &nbsp;·&nbsp; Ministry of Railways</span>
            </div>

            {/* Prototype disclaimer */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fef7e0]/5 border border-[#fdd663]/20 text-[#b06000] font-label-caps text-[9px] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[12px]">science</span>
              Prototype / Research System — Not a Production Deployment
            </div>
          </div>

          {/* App routes */}
          <div className="space-y-2.5">
            <span className="font-label-caps text-[10px] text-white font-bold tracking-wider uppercase block mb-1">
              Application
            </span>
            <ul className="space-y-1.5">
              {APP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-slate-400 hover:text-white transition-colors duration-220">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Engine / tech stack */}
          <div className="space-y-2.5">
            <span className="font-label-caps text-[10px] text-white font-bold tracking-wider uppercase block mb-1">
              Engine
            </span>
            <ul className="space-y-2">
              {TECH.map((t) => (
                <li key={t.label} className="flex items-center gap-2 text-slate-400">
                  <span className="material-symbols-outlined text-[14px] text-[#95f8a7]">{t.icon}</span>
                  {t.label}
                </li>
              ))}
            </ul>

            <div className="pt-3 space-y-1.5">
              <span className="font-label-caps text-[10px] text-white font-bold tracking-wider uppercase block mb-1">
                Sections
              </span>
              {SECTION_LINKS.map((l) => (
                <div key={l.label}>
                  <a href={l.href} className="text-slate-400 hover:text-white transition-colors duration-220">
                    {l.label}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} RailSync. Built for Smart India Hackathon — Transportation &amp; Logistics.
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span className="text-primary-fixed font-semibold">
              PREDICT · DETECT · OPTIMIZE · EXPLAIN · REPLAN
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
