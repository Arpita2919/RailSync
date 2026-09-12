import React from 'react';
import { useScrollReveal } from './useScrollReveal';

const PROBLEMS = [
  {
    icon: 'folder_off',
    title: 'Fragmented Maintenance Requests',
    detail:
      'Maintenance requests originate from multiple departments — Civil, Electrical/OHE, and S&T — and must be reconciled against one another and against active train operations without a unified planning view.',
    stagger: 'rs-stagger-1',
  },
  {
    icon: 'sync_problem',
    title: 'Train Movement Conflicts',
    detail:
      'Maintenance blocks must be planned around passenger and freight train schedules while respecting safe headway clearances and traction power isolation requirements.',
    stagger: 'rs-stagger-2',
  },
  {
    icon: 'groups_3',
    title: 'Multi-Department Coordination',
    detail:
      'Civil Engineering, Electrical/OHE, and S&T departments may compete for the same available block windows. Without a shared objective function, coordination is manual and conflict-prone.',
    stagger: 'rs-stagger-3',
  },
];

export default function LandingProblem() {
  const sectionRef = useScrollReveal();

  return (
    <section id="problem" className="py-20 bg-surface-container-lowest border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#fef7e0] border border-[#fdd663] text-[#b06000] font-label-caps text-[10px] font-bold uppercase mb-4">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>The Problem</span>
          </div>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight leading-tight mb-3">
            Railway Maintenance Is a Scheduling Problem
          </h2>
          <p className="font-body-lg text-secondary text-sm sm:text-base leading-relaxed">
            Coordinating maintenance work across multiple departments, train schedules, and safety constraints is inherently complex — and difficult to solve manually at scale.
          </p>
        </div>

        {/* 3 problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className={`rs-card ${p.stagger} rounded bg-surface-container-lowest border border-surface-container-high p-6 shadow-sm`}
            >
              <div className="w-9 h-9 rounded flex items-center justify-center bg-[#fef7e0] border border-[#fdd663] text-[#b06000] mb-4">
                <span className="material-symbols-outlined text-xl">{p.icon}</span>
              </div>
              <h3 className="font-headline-sm font-bold text-on-surface text-sm mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="font-body-sm text-secondary text-xs leading-relaxed">
                {p.detail}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
