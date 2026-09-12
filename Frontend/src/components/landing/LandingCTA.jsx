import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from './useScrollReveal';

export default function LandingCTA() {
  const sectionRef = useScrollReveal();

  return (
    <section className="py-20 bg-surface-container-lowest">
      <div ref={sectionRef} className="rs-reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded bg-[#0c172b] border border-[#1a2942] p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-lg relative overflow-hidden">

          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #182844 1px, transparent 1px), linear-gradient(to bottom, #182844 1px, transparent 1px)',
              backgroundSize: '3rem 3rem',
              opacity: 0.2,
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-[#16253d]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#182844] border border-[#394761] text-[#b8c7e6] font-label-caps text-[10px] font-bold uppercase tracking-wider mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3c9e57] rs-status-live" />
              <span>RailSync &nbsp;·&nbsp; Indian Railways AI Platform</span>
            </div>

            {/* Heading */}
            <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              From Prediction to Action
            </h2>

            {/* Description */}
            <p className="font-body-lg text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto mb-8">
              RailSync brings predictive intelligence, conflict detection, and constraint-based optimisation into one explainable maintenance planning workflow.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/login"
                className="group w-full sm:w-auto rs-btn-primary inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded text-[13px] font-code-sm font-bold uppercase tracking-wider shadow-sm"
              >
                <span>Launch Operations Dashboard</span>
                <span className="rs-arrow-icon material-symbols-outlined text-[17px]">arrow_forward</span>
              </Link>
              <Link
                to="/login"
                className="group w-full sm:w-auto rs-btn-secondary inline-flex items-center justify-center gap-2 px-7 py-3 rounded text-[13px] font-code-sm font-semibold tracking-wide"
              >
                <span className="material-symbols-outlined text-[16px]">stacked_line_chart</span>
                <span>Explore Optimisation</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
