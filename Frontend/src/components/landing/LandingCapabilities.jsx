import React from 'react';
import { useScrollReveal } from './useScrollReveal';

const CAPS = [
  {
    icon: 'insights',
    title: 'Predictive Risk Intelligence',
    tag: 'ML Layer-1',
    detail: 'A trained model scores maintenance urgency and failure risk for each segment, helping planners focus attention where it matters most.',
    stagger: 'rs-stagger-1',
  },
  {
    icon: 'memory',
    title: 'Constraint-Based Scheduling',
    tag: 'OR-Tools CP-SAT',
    detail: 'Google OR-Tools CP-SAT finds a feasible maintenance schedule that satisfies hard safety constraints and optimises soft objectives.',
    stagger: 'rs-stagger-2',
  },
  {
    icon: 'swap_horiz',
    title: 'Multi-Department Coordination',
    tag: 'Task Pool',
    detail: 'Civil, Electrical/OHE and S&T maintenance requests are pooled and assigned to available block windows with minimal conflict.',
    stagger: 'rs-stagger-3',
  },
  {
    icon: 'psychology',
    title: 'Explainable Decisions',
    tag: 'Transparency',
    detail: 'Every scheduling decision includes a plain-language justification — which constraints drove the outcome and what trade-offs were made.',
    stagger: 'rs-stagger-4',
  },
  {
    icon: 'stacked_line_chart',
    title: 'Policy-Based Optimisation',
    tag: 'Pareto / Multi-Objective',
    detail: 'Explore different optimisation policies — urgency-first, resource-efficiency, or balanced — and compare resulting schedules on a Pareto frontier.',
    stagger: 'rs-stagger-5',
  },
  {
    icon: 'tune',
    title: 'What-If Re-Optimisation',
    tag: 'Scenario Sandbox',
    detail: 'Inject disruptions, emergency defects or changed constraints and re-run the solver to evaluate recovery options before committing to a plan.',
    stagger: 'rs-stagger-6',
  },
  {
    icon: 'conversion_path',
    title: 'Digital Twin View',
    tag: 'Visualisation',
    detail: 'A spatial visualisation of corridor segments, maintenance blocks, and train paths gives planners a unified situational picture.',
    stagger: 'rs-stagger-1',
  },
  {
    icon: 'history_edu',
    title: 'Feedback & Audit Trail',
    tag: 'Accountability',
    detail: 'All scheduling decisions and scenario results are logged for review, supporting post-hoc analysis and continuous model improvement.',
    stagger: 'rs-stagger-2',
  },
];

export default function LandingCapabilities() {
  const sectionRef = useScrollReveal();

  return (
    <section id="capabilities" className="py-20 bg-surface-container-lowest border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-4">
            <span className="material-symbols-outlined text-[14px]">hub</span>
            <span>Key Capabilities</span>
          </div>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-3">
            Built for Railway Maintenance Planning
          </h2>
          <p className="font-body-lg text-secondary text-sm sm:text-base leading-relaxed">
            Eight capabilities working together to make maintenance planning more intelligent, transparent, and coordinated.
          </p>
        </div>

        {/* 8-card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPS.map((cap) => (
            <div
              key={cap.title}
              className={`rs-card ${cap.stagger} rounded bg-surface-container-lowest border border-surface-container-high p-5 shadow-sm flex flex-col`}
            >
              <div className="w-9 h-9 rounded bg-[#0c172b] border border-[#1a2942] flex items-center justify-center text-[#95f8a7] mb-3.5">
                <span className="material-symbols-outlined text-xl">{cap.icon}</span>
              </div>
              <div className="font-label-caps text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">
                {cap.tag}
              </div>
              <h3 className="font-headline-sm font-bold text-on-surface text-sm mb-2 leading-snug">
                {cap.title}
              </h3>
              <p className="font-body-sm text-secondary text-xs leading-relaxed">
                {cap.detail}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
