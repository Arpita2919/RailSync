import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

export default function LandingPolicyModes() {
  const [selectedPolicy, setSelectedPolicy] = useState('BALANCED');
  const sectionRef = useScrollReveal();

  const policies = [
    {
      id: 'SAFETY-FIRST',
      title: 'SAFETY-FIRST',
      subtitle: 'Zero-Tolerance Hazard Mitigation',
      description: 'Prioritizes high-risk and critical maintenance.',
      detail:
        'Schedules all critical and medium-risk maintenance immediately. Freight and non-priority passenger rakes are held or diverted to guarantee maximum track possession time for maintenance gangs.',
      badge: 'STRICT SAFETY REGIME',
      badgeStyle: 'bg-[#fef7e0] text-[#b06000] border-[#fdd663]',
      cardBg: 'bg-surface-container-lowest',
      borderStyle: 'border-[#fdd663]',
      icon: 'security',
      iconColor: 'text-[#b06000] bg-[#fef7e0]',
      stats: {
        safetyWeight: '95%',
        throughputWeight: '45%',
        blockDuration: 'Maximum',
      },
      stagger: 'rs-stagger-1',
    },
    {
      id: 'BALANCED',
      title: 'BALANCED',
      subtitle: 'Standard Multi-Objective Operating Preset',
      description: 'Balances safety, maintenance throughput and operational impact.',
      detail:
        'Harmonizes track health maintenance with strict train punctuality. Merges multiple departmental windows into coordinated shadow blocks to minimize cumulative line possession.',
      badge: 'RECOMMENDED DEFAULT',
      badgeStyle: 'bg-surface-container text-primary border-surface-container-high',
      cardBg: 'bg-surface-container-lowest',
      borderStyle: 'border-primary-fixed-variant',
      icon: 'balance',
      iconColor: 'text-primary bg-surface-container',
      stats: {
        safetyWeight: '80%',
        throughputWeight: '85%',
        blockDuration: 'Optimized',
      },
      stagger: 'rs-stagger-2',
    },
    {
      id: 'THROUGHPUT-FIRST',
      title: 'THROUGHPUT-FIRST',
      subtitle: 'Peak Traffic Corridor Maximization',
      description: 'Prioritizes corridor throughput while respecting critical maintenance.',
      detail:
        'Ensures maximum section capacity and train speeds during high-density festival or freight rush periods. Schedules only mandatory emergency repairs while deferring routine non-critical works.',
      badge: 'HIGH TRAFFIC PRESET',
      badgeStyle: 'bg-surface-container text-on-tertiary-container border-tertiary-fixed-dim',
      cardBg: 'bg-surface-container-lowest',
      borderStyle: 'border-tertiary-fixed-dim',
      icon: 'speed',
      iconColor: 'text-on-tertiary-container bg-surface-container',
      stats: {
        safetyWeight: '60%',
        throughputWeight: '98%',
        blockDuration: 'Minimal Gap',
      },
      stagger: 'rs-stagger-3',
    },
  ];

  return (
    <section id="policies" className="py-16 bg-surface-container-lowest border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-3">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            <span>POLICY ADAPTATION</span>
          </div>

          <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight mb-2.5">
            Operational Policy Presets
          </h2>

          <p className="font-body-lg text-secondary text-sm sm:text-base">
            Configurable objective weights allow Section Controllers to adapt the optimization engine to dynamic railway demands.
          </p>
        </div>

        {/* 3 Policy Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {policies.map((p) => {
            const isSelected = selectedPolicy === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPolicy(p.id)}
                className={`rs-card ${p.stagger} cursor-pointer rounded bg-surface-container-lowest border ${
                  isSelected ? `${p.borderStyle} shadow-sm ring-2 ring-primary-container/30 transform -translate-y-1` : 'border-surface-container-high'
                } p-5 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded flex items-center justify-center border border-current ${p.iconColor} transition-transform duration-220 group-hover:scale-105`}>
                      <span className="material-symbols-outlined text-xl">{p.icon}</span>
                    </div>
                    <span className={`font-label-caps text-[9px] px-2 py-0.5 rounded border font-bold ${p.badgeStyle}`}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-base font-bold text-on-surface mb-0.5">{p.title}</h3>
                  <h4 className="font-code-sm text-xs font-semibold text-primary mb-2">{p.subtitle}</h4>

                  <p className="font-body-md text-on-surface text-xs sm:text-sm font-semibold mb-2">
                    {p.description}
                  </p>

                  <p className="font-body-sm text-secondary text-xs sm:text-sm leading-relaxed mb-4">
                    {p.detail}
                  </p>
                </div>

                {/* Policy Weight Meters */}
                <div className="pt-3 border-t border-surface-container-high space-y-1 font-code-sm text-xs">
                  <div className="flex items-center justify-between text-secondary">
                    <span>Safety Weight:</span>
                    <span className="text-on-surface font-bold">{p.stats.safetyWeight}</span>
                  </div>
                  <div className="flex items-center justify-between text-secondary">
                    <span>Throughput Weight:</span>
                    <span className="text-on-surface font-bold">{p.stats.throughputWeight}</span>
                  </div>
                  <div className="flex items-center justify-between text-secondary">
                    <span>Block Preference:</span>
                    <span className="text-primary font-bold">{p.stats.blockDuration}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
