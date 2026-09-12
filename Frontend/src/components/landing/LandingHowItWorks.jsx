import React from 'react';
import { useScrollReveal } from './useScrollReveal';

const STEPS = [
  {
    num: '01',
    id: 'PREDICT',
    icon: 'insights',
    heading: 'Layer-1 ML Risk Prediction',
    detail:
      'A trained ML model estimates failure risk, expected maintenance duration, and uncertainty for each track segment — helping prioritise which blocks need attention and when.',
    badgeText: 'ML Layer',
    badgeStyle: 'bg-[#16253d] border-[#394761] text-[#b8c7e6]',
  },
  {
    num: '02',
    id: 'DETECT',
    icon: 'radar',
    heading: 'Conflict Detection',
    detail:
      'Proposed maintenance windows are checked against timetabled passenger and freight train paths. Every headway or safety constraint violation is flagged before scheduling.',
    badgeText: 'Safety Check',
    badgeStyle: 'bg-[#fef7e0] border-[#fdd663] text-[#b06000]',
  },
  {
    num: '03',
    id: 'OPTIMIZE',
    icon: 'memory',
    heading: 'CP-SAT Schedule Optimisation',
    detail:
      'Google OR-Tools CP-SAT finds a feasible maintenance schedule that satisfies hard constraints (safety, headways) and optimises soft objectives (urgency, resource utilisation).',
    badgeText: 'OR-Tools CP-SAT',
    badgeStyle: 'bg-[#002c0f] border-[#3c9e57] text-[#95f8a7]',
  },
  {
    num: '04',
    id: 'EXPLAIN',
    icon: 'psychology',
    heading: 'Explainable Decisions',
    detail:
      'Every scheduled or deferred task includes a plain-language explanation: why it was prioritised, which constraints influenced the decision, and what trade-offs were made.',
    badgeText: 'Explainability',
    badgeStyle: 'bg-surface-container border-surface-container-high text-primary',
  },
  {
    num: '05',
    id: 'REPLAN',
    icon: 'replay_circle_filled',
    heading: 'What-If Re-optimisation',
    detail:
      'When an emergency defect, disruption, or changed constraint is injected, the solver re-optimises the affected schedule — helping evaluate the impact before committing to a change.',
    badgeText: 'Scenario Analysis',
    badgeStyle: 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#ba1a1a]',
  },
];

export default function LandingHowItWorks() {
  const sectionRef = useScrollReveal();

  return (
    <section id="pipeline" className="py-20 bg-surface border-b border-surface-container-high scroll-mt-12 relative">
      <span id="how-it-works" className="absolute -top-12" />
      <div ref={sectionRef} className="rs-reveal max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-4">
            <span className="material-symbols-outlined text-[14px]">route</span>
            <span>How RailSync Works</span>
          </div>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-3">
            From Prediction to Action
          </h2>
          <p className="font-body-lg text-secondary text-sm sm:text-base leading-relaxed">
            Five integrated stages transform maintenance requests and risk signals into a conflict-free, explainable block schedule.
          </p>
        </div>

        {/* Vertical pipeline list */}
        <div className="max-w-2xl mx-auto">
          {STEPS.map((step, idx) => (
            <div key={step.id}>
              {/* Step card */}
              <div className="rs-card rounded bg-surface-container-lowest border border-surface-container-high p-5 shadow-sm flex items-start gap-4">
                {/* Icon box */}
                <div className="w-10 h-10 shrink-0 rounded bg-[#0c172b] border border-[#1a2942] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl text-[#95f8a7]">{step.icon}</span>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-label-caps text-[9px] font-bold tracking-wider text-secondary uppercase">
                      Step {step.num}
                    </span>
                    <span className="font-code-sm text-xs font-bold text-primary tracking-wider">
                      [{step.id}]
                    </span>
                    <span className={`font-label-caps text-[9px] font-bold px-2 py-0.5 rounded border ${step.badgeStyle}`}>
                      {step.badgeText}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface mb-1 leading-snug">
                    {step.heading}
                  </h3>
                  <p className="font-body-sm text-xs text-secondary leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Animated connector */}
              {idx < STEPS.length - 1 && (
                <div className="relative flex justify-start items-center py-1.5 pl-5 overflow-hidden">
                  <div className="relative w-px h-5 bg-surface-container-high overflow-visible">
                    <span
                      className="rs-pipe-dot bg-[#b8c7e6]"
                      style={{ animationDelay: `${idx * 0.56}s` }}
                    />
                  </div>
                  <span className="material-symbols-outlined text-lg text-surface-container-high ml-0.5">
                    arrow_downward
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
