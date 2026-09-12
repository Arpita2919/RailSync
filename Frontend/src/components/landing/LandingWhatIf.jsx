import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

const STEPS = [
  {
    tag: 'BASELINE',
    label: 'Baseline Plan',
    icon: 'check_circle',
    title: 'Active Conflict-Free Schedule',
    desc: 'All maintenance tasks have been assigned to available block windows. No train-path conflicts are present in the current schedule.',
    activeStyle: 'border-[#394761] bg-[#0c172b] text-white',
    iconColor: 'text-[#3c9e57]',
    detailStyle: 'bg-[#0c172b] border-[#394761] text-white',
  },
  {
    tag: 'DISRUPTION',
    label: 'Disruption Injected',
    icon: 'crisis_alert',
    title: 'Emergency Defect / Changed Constraint',
    desc: 'A new defect report or unexpected constraint is injected into the scenario — for example, an urgent repair request that conflicts with a currently planned block.',
    activeStyle: 'border-error-container bg-error-container/20 text-error',
    iconColor: 'text-error',
    detailStyle: 'bg-error-container/10 border-error-container/40',
  },
  {
    tag: 'UPDATE',
    label: 'Constraints Updated',
    icon: 'lock_reset',
    title: 'Constraint Model Refreshed',
    desc: 'The solver\'s constraint model is updated to reflect the new situation: affected time windows, resource locks, and changed priorities are incorporated.',
    activeStyle: 'border-[#fdd663] bg-[#fef7e0]/10 text-[#b06000]',
    iconColor: 'text-[#b06000]',
    detailStyle: 'bg-[#fef7e0]/5 border-[#fdd663]/30',
  },
  {
    tag: 'RE-SOLVE',
    label: 'CP-SAT Re-optimises',
    icon: 'autorenew',
    title: 'Solver Runs on Updated Constraints',
    desc: 'Google OR-Tools CP-SAT re-optimises the schedule with the updated constraints, finding a new feasible assignment for affected tasks.',
    activeStyle: 'border-[#394761] bg-[#16253d] text-white',
    iconColor: 'text-[#b8c7e6]',
    detailStyle: 'bg-[#16253d] border-[#394761]',
  },
  {
    tag: 'UPDATED',
    label: 'Updated Schedule',
    icon: 'verified_user',
    title: 'Re-optimised Plan Ready',
    desc: 'The updated, conflict-free schedule is available for review. Planners can compare it against the baseline before deciding whether to adopt the new plan.',
    activeStyle: 'border-[#3c9e57]/40 bg-[#002c0f]/20 text-[#3c9e57]',
    iconColor: 'text-[#3c9e57]',
    detailStyle: 'bg-[#002c0f]/10 border-[#3c9e57]/30',
  },
];

const INACTIVE = 'border-surface-container-high bg-surface-container-lowest text-secondary hover:border-surface-container';

export default function LandingWhatIf() {
  const [active, setActive] = useState(0);
  const sectionRef = useScrollReveal();
  const cur = STEPS[active];

  return (
    <section id="what-if" className="py-20 bg-surface border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-4">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>What-If &amp; Replanning</span>
          </div>
          <h2 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-3">
            What Happens When the Plan Changes?
          </h2>
          <p className="font-body-lg text-secondary text-sm sm:text-base leading-relaxed">
            RailSync re-optimises the maintenance plan when conditions change. Select a stage to explore the scenario.
          </p>
        </div>

        {/* 5-step selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {STEPS.map((step, idx) => (
            <button
              key={step.tag}
              onClick={() => setActive(idx)}
              className={`rounded border p-3.5 text-left transition-all duration-300 cursor-pointer ${
                active === idx ? step.activeStyle : INACTIVE
              }`}
            >
              <div className={`flex items-center gap-2 mb-1.5 ${active === idx ? step.iconColor : 'text-secondary'}`}>
                <span className="material-symbols-outlined text-lg">{step.icon}</span>
                <span className="font-label-caps text-[9px] font-bold">{idx + 1}</span>
              </div>
              <div className="font-label-caps text-[9px] font-bold uppercase tracking-wider text-on-surface mb-0.5">
                {step.label}
              </div>
              <div className="font-label-caps text-[8px] text-secondary uppercase tracking-wider">
                {step.tag}
              </div>
            </button>
          ))}
        </div>

        {/* Active detail */}
        <div className={`rounded border p-6 transition-all duration-350 ${cur.detailStyle}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`material-symbols-outlined text-2xl ${cur.iconColor}`}>{cur.icon}</span>
            <div>
              <div className="font-label-caps text-[10px] font-bold uppercase tracking-wider text-secondary mb-0.5">
                Stage {active + 1} of 5 · {cur.tag}
              </div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">{cur.title}</h3>
            </div>
          </div>
          <p className="font-body-lg text-sm text-secondary leading-relaxed">
            {cur.desc}
          </p>
        </div>

      </div>
    </section>
  );
}
