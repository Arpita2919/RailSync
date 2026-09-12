import React from 'react';
import { useScrollReveal } from './useScrollReveal';

const FLOW = [
  {
    icon: 'assignment',
    label: 'Maintenance Tasks',
    detail: 'Requests from Civil, OHE & S&T departments with urgency, duration and location.',
  },
  {
    icon: 'rule',
    label: 'Constraints',
    detail: 'Hard: safety headways, traction isolation. Soft: urgency weights, resource limits.',
  },
  {
    icon: 'memory',
    label: 'CP-SAT Solver',
    detail: 'Google OR-Tools CP-SAT explores feasible assignments across available block windows.',
  },
  {
    icon: 'calendar_month',
    label: 'Optimised Schedule',
    detail: 'A conflict-free, prioritised block schedule — with explanations for every decision.',
  },
];

export default function LandingOptimizer() {
  const sectionRef = useScrollReveal();

  return (
    <section id="optimizer" className="py-20 bg-surface-container-lowest border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: explanation */}
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-4">
              <span className="material-symbols-outlined text-[14px]">memory</span>
              <span>Constraint-Based Optimisation</span>
            </div>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-4 leading-snug">
              Scheduling with Google OR-Tools CP-SAT
            </h2>
            <p className="font-body-lg text-secondary text-sm sm:text-base leading-relaxed mb-6">
              RailSync models maintenance scheduling as a constraint satisfaction problem. The CP-SAT solver assigns maintenance tasks to available block windows while respecting hard safety constraints and optimising for soft objectives like urgency and resource efficiency.
            </p>
            <ul className="space-y-2.5 font-body-sm text-xs text-secondary">
              {[
                'Hard constraints: train headways, traction power isolation, crew availability',
                'Soft objectives: task urgency, resource utilisation, block efficiency',
                'Policy modes: urgency-first, balanced, or resource-efficient',
                'Explanation: every scheduled/deferred task includes a readable justification',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-on-tertiary-container text-[18px] shrink-0 mt-0.5">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: visual flow */}
          <div className="rounded bg-[#0c172b] border border-[#1a2942] p-6 shadow-xl text-white">
            <div className="font-label-caps text-[10px] font-bold text-[#7e8ca9] uppercase tracking-wider mb-5 pb-3 border-b border-[#1a2942]">
              Optimisation Pipeline
            </div>
            <div className="space-y-0">
              {FLOW.map((step, idx) => (
                <div key={step.label}>
                  <div className="rs-card flex items-start gap-3.5 p-4 rounded bg-[#080f1d] border border-[#1a2942]">
                    <div className="w-8 h-8 shrink-0 rounded bg-[#16253d] border border-[#394761] flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-[#95f8a7]">{step.icon}</span>
                    </div>
                    <div>
                      <div className="font-headline-sm text-xs font-bold text-white mb-0.5">{step.label}</div>
                      <div className="font-body-sm text-[11px] text-[#7e8ca9] leading-snug">{step.detail}</div>
                    </div>
                  </div>
                  {idx < FLOW.length - 1 && (
                    <div className="relative flex justify-center py-1.5 overflow-hidden">
                      <div className="w-px h-5 bg-[#1a2942] relative overflow-hidden">
                        <span className="rs-pipe-dot bg-[#b8c7e6]" style={{ animationDelay: `${idx * 0.7}s` }} />
                      </div>
                      <span className="material-symbols-outlined text-lg text-[#1a2942] absolute">arrow_downward</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
