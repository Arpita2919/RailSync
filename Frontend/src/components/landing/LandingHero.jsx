import React from 'react';
import { Link } from 'react-router-dom';

const PIPELINE = ['PREDICT', 'DETECT', 'OPTIMIZE', 'EXPLAIN', 'REPLAN'];

export default function LandingHero() {
  return (
    <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 bg-[#080f1d] text-white border-b border-[#1a2942] overflow-hidden">

      {/* ── Background grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(26,41,66,0.3) 1px, transparent 1px),' +
            'linear-gradient(to bottom, rgba(26,41,66,0.3) 1px, transparent 1px)',
          backgroundSize: '3.5rem 3.5rem',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 20%, #000 55%, transparent 100%)',
        }}
      />

      {/* ── Ambient glow ── */}
      <div
        className="absolute pointer-events-none rs-glow-orb"
        style={{
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '640px', height: '280px',
          background: 'radial-gradient(ellipse, rgba(22,37,61,0.6) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Animated pipeline rail line behind hero ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#394761] to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-px overflow-hidden w-full pointer-events-none">
        <div
          className="absolute top-0 h-px w-20 bg-gradient-to-r from-transparent via-[#b8c7e6] to-transparent"
          style={{ animation: 'scanLine 5s linear infinite' }}
        />
      </div>

      {/* ── Content ── */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <div className="rs-content-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c172b]/90 border border-[#2a3c5a] mb-7 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#3c9e57] rs-status-live shrink-0" />
          <span className="font-label-caps text-[10px] uppercase tracking-widest text-[#b8c7e6] font-bold">
            Smart India Hackathon &nbsp;·&nbsp; Ministry of Railways
          </span>
        </div>

        {/* ── PRIMARY BRAND — RAILSYNC ── */}
        <h1
          className="rs-wordmark-enter font-black leading-none tracking-[-0.045em] text-white mb-5 select-none"
          style={{ fontSize: 'clamp(4rem, 14vw, 8rem)' }}
        >
          RAILSYNC
        </h1>

        {/* Product subtitle — visually subordinate */}
        <p className="rs-content-2 text-lg sm:text-2xl md:text-3xl font-semibold text-[#dfe9f5] tracking-tight mb-4 leading-snug">
          AI-Powered Automatic Block Planning &amp; Digital Twin
        </p>

        {/* Tagline */}
        <p className="rs-content-3 text-sm sm:text-base text-[#7e8ca9] max-w-2xl mx-auto leading-relaxed mb-9">
          Predict failures. Detect conflicts. Optimize maintenance blocks.
          Explain every decision. Re-plan when conditions change.
        </p>

        {/* Pipeline chain */}
        <div className="rs-content-4 flex flex-wrap items-center justify-center gap-1.5 mb-10 font-label-caps text-[10px] font-bold uppercase tracking-wider">
          {PIPELINE.map((stage, idx) => (
            <React.Fragment key={stage}>
              <span className="px-3 py-1.5 rounded bg-[#0c172b] border border-[#2a3c5a] text-[#b8c7e6]">
                {stage}
              </span>
              {idx < PIPELINE.length - 1 && (
                <span className="text-[#2a3c5a] text-base leading-none select-none">›</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTAs */}
        <div className="rs-content-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            className="group w-full sm:w-auto rs-btn-primary inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded text-[13px] font-code-sm font-bold uppercase tracking-wider"
          >
            <span>Launch RailSync Dashboard</span>
            <span className="rs-arrow-icon material-symbols-outlined text-[17px]">arrow_forward</span>
          </Link>
          <a
            href="#pipeline"
            className="group w-full sm:w-auto rs-btn-secondary inline-flex items-center justify-center gap-2 px-7 py-3 rounded text-[13px] font-code-sm font-semibold tracking-wide"
          >
            <span>Explore How It Works</span>
            <span className="material-symbols-outlined text-[16px] transition-transform duration-220 group-hover:translate-y-0.5">
              arrow_downward
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}
