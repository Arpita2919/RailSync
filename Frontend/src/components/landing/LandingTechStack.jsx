import React from 'react';
import { useScrollReveal } from './useScrollReveal';

export default function LandingTechStack() {
  const sectionRef = useScrollReveal();

  const technologies = [
    {
      name: 'Google OR-Tools CP-SAT',
      category: 'Constraint Solver',
      description: 'Industrial-strength discrete optimization engine for scheduling, resource allocation, and conflict resolution.',
      icon: 'memory',
      tag: 'CORE SOLVER',
      iconStyle: 'text-primary bg-surface-container',
      stagger: 'rs-stagger-1',
    },
    {
      name: 'Python',
      category: 'Core Engine & Analytics',
      description: 'Robust mathematical modeling, data transformations, and algorithm pipeline implementation.',
      icon: 'code',
      tag: 'BACKEND RUNTIME',
      iconStyle: 'text-primary bg-surface-container',
      stagger: 'rs-stagger-2',
    },
    {
      name: 'FastAPI / Node.js',
      category: 'High-Performance APIs',
      description: 'Asynchronous RESTful microservices providing low-latency communication between UI and solvers.',
      icon: 'api',
      tag: 'API GATEWAY',
      iconStyle: 'text-on-tertiary-container bg-surface-container',
      stagger: 'rs-stagger-3',
    },
    {
      name: 'XGBoost / Machine Learning',
      category: 'Predictive Hazard Engine',
      description: 'Gradient boosted decision trees predicting track failure hazard, overrun probability, and task urgency.',
      icon: 'psychology',
      tag: 'LAYER 1 ML',
      iconStyle: 'text-primary bg-surface-container',
      stagger: 'rs-stagger-4',
    },
    {
      name: 'Digital Twin Engine',
      category: 'Spatial-Temporal Model',
      description: 'Dynamic topological corridor representation of tracks, OHE sectors, interlocking, and train paths.',
      icon: 'hub',
      tag: 'CORRIDOR TWIN',
      iconStyle: 'text-primary bg-surface-container',
      stagger: 'rs-stagger-5',
    },
    {
      name: 'React',
      category: 'Frontend UI & Operations Console',
      description: 'Mission-critical, responsive operations dashboard built with modern component architecture.',
      icon: 'terminal',
      tag: 'CONTROL UI',
      iconStyle: 'text-primary bg-surface-container',
      stagger: 'rs-stagger-6',
    },
    {
      name: 'REST APIs',
      category: 'Data Interchange',
      description: 'Standardized schema-validated payloads integrating corridor telemetry, timetables, and solver outputs.',
      icon: 'sync_alt',
      tag: 'INTEGRATION',
      iconStyle: 'text-[#b06000] bg-[#fef7e0]',
      stagger: 'rs-stagger-7',
    },
    {
      name: 'Supabase / SQLite',
      category: 'Relational Store & Audit',
      description: 'Secure, ACID-compliant persistence for historical block logs, decision justifications, and audit records.',
      icon: 'database',
      tag: 'PERSISTENCE',
      iconStyle: 'text-secondary bg-surface-container',
      stagger: 'rs-stagger-7',
    },
  ];

  return (
    <section id="tech-stack" className="py-16 bg-surface border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-3">
            <span className="material-symbols-outlined text-[14px]">developer_board</span>
            <span>PROVEN ENTERPRISE STACK</span>
          </div>

          <h2 className="font-headline-xl text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight mb-2.5">
            Engineered for Mission-Critical Reliability
          </h2>

          <p className="font-body-lg text-secondary text-sm sm:text-base">
            A battle-tested architecture combining industrial mathematical solvers with high-speed predictive AI.
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className={`rs-card ${tech.stagger} rounded bg-surface-container-lowest border border-surface-container-high p-4 shadow-sm flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`w-8 h-8 rounded flex items-center justify-center border border-current ${tech.iconStyle} transition-transform duration-220 group-hover:scale-105`}>
                    <span className="material-symbols-outlined text-lg">{tech.icon}</span>
                  </div>
                  <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-secondary font-bold tracking-wider">
                    {tech.tag}
                  </span>
                </div>

                <h3 className="font-headline-sm font-bold text-on-surface text-sm mb-0.5">{tech.name}</h3>
                <h4 className="font-code-sm text-[11px] font-semibold text-primary mb-1.5">{tech.category}</h4>
                <p className="font-body-sm text-xs text-secondary leading-relaxed">{tech.description}</p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-surface-container-high flex items-center gap-1.5 font-code-sm text-[10px] text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-status-ops" />
                <span>NATIVE INTEGRATION</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
