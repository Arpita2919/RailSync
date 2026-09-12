import React, { useState } from 'react';
import { useScrollReveal } from './useScrollReveal';

/* Static simulated corridor data — clearly labelled as simulation */
const SEGMENTS = [
  {
    id: 'A',
    label: 'Segment A',
    km: 'Km 0 – 18',
    status: 'LOW RISK',
    statusColor: 'text-[#3c9e57]',
    statusBg: 'bg-[#002c0f]/20 border-[#3c9e57]/40',
    block: 'None Scheduled',
    risk: 0.15,
    riskBar: 'w-[15%] bg-[#3c9e57]',
  },
  {
    id: 'B',
    label: 'Segment B',
    km: 'Km 18 – 42',
    status: 'MAINTENANCE DUE',
    statusColor: 'text-[#b06000]',
    statusBg: 'bg-[#fef7e0]/10 border-[#fdd663]/40',
    block: 'Block B-12: Tamping (scheduled)',
    risk: 0.72,
    riskBar: 'w-[72%] bg-[#fdd663]',
  },
  {
    id: 'C',
    label: 'Segment C',
    km: 'Km 42 – 65',
    status: 'NOMINAL',
    statusColor: 'text-[#3c9e57]',
    statusBg: 'bg-[#002c0f]/20 border-[#3c9e57]/40',
    block: 'OHE Inspection (next window)',
    risk: 0.28,
    riskBar: 'w-[28%] bg-[#b8c7e6]',
  },
];

const TASKS = [
  { label: 'Track Tamping — Seg B',  dept: 'Civil Engg',    urgency: 'HIGH',   icon: 'engineering', color: 'text-[#b06000]' },
  { label: 'OHE Inspection — Seg C', dept: 'Electrical',    urgency: 'MEDIUM', icon: 'electric_bolt', color: 'text-primary' },
  { label: 'Signal Cable Renewal',   dept: 'S&T',           urgency: 'LOW',    icon: 'cable', color: 'text-secondary' },
];

export default function LandingDigitalTwin() {
  const sectionRef = useScrollReveal();
  const [selected, setSelected] = useState('B');
  const seg = SEGMENTS.find((s) => s.id === selected) || SEGMENTS[1];

  return (
    <section id="digital-twin" className="py-20 bg-surface border-b border-surface-container-high">
      <div ref={sectionRef} className="rs-reveal max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-surface-container-high text-primary font-label-caps text-[10px] font-bold uppercase mb-4">
              <span className="material-symbols-outlined text-[14px]">conversion_path</span>
              <span>Digital Twin / Simulation View</span>
            </div>
            <h2 className="font-headline-xl text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mb-2 leading-snug">
              Corridor Visualisation &amp; Task Mapping
            </h2>
            <p className="font-body-lg text-secondary text-sm sm:text-base leading-relaxed max-w-xl">
              A spatial-temporal view of corridor segments, risk indicators, and scheduled maintenance blocks. Data shown is simulated for demonstration.
            </p>
          </div>
          {/* Simulation badge */}
          <div className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#fef7e0]/20 border border-[#fdd663]/30 text-[#b06000] font-label-caps text-[9px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">science</span>
            Simulation / Prototype Data
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Segment list ── */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
              Corridor Segments
            </div>
            {SEGMENTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`w-full text-left p-4 rounded border transition-all cursor-pointer ${
                  selected === s.id
                    ? 'bg-[#0c172b] border-[#394761] text-white shadow-md'
                    : 'bg-surface-container-lowest border-surface-container-high hover:border-surface-container-high/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-headline-sm text-sm font-bold ${selected === s.id ? 'text-white' : 'text-on-surface'}`}>
                    {s.label}
                  </span>
                  <span className={`font-label-caps text-[9px] font-bold px-2 py-0.5 rounded border ${s.statusBg} ${s.statusColor}`}>
                    {s.status}
                  </span>
                </div>
                <div className="font-code-sm text-[11px] text-secondary mb-2">{s.km}</div>
                {/* Risk bar */}
                <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${s.riskBar}`} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-label-caps text-[9px] text-secondary uppercase">Risk Score</span>
                  <span className="font-code-sm text-[10px] font-bold text-on-surface">{s.risk.toFixed(2)}</span>
                </div>
              </button>
            ))}

            {/* Maintenance tasks */}
            <div className="pt-2">
              <div className="font-label-caps text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                Pending Tasks (Simulated)
              </div>
              <div className="space-y-2">
                {TASKS.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center gap-3 p-3 rounded bg-surface-container-lowest border border-surface-container-high"
                  >
                    <span className={`material-symbols-outlined text-lg ${t.color}`}>{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-headline-sm text-xs font-bold text-on-surface truncate">{t.label}</div>
                      <div className="font-label-caps text-[9px] text-secondary uppercase">{t.dept}</div>
                    </div>
                    <span className={`font-label-caps text-[9px] font-bold px-2 py-0.5 rounded bg-surface-container border border-surface-container-high ${t.color}`}>
                      {t.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Segment detail panel ── */}
          <div className="lg:col-span-3 rounded bg-[#0c172b] border border-[#1a2942] p-5 sm:p-6 text-white shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1a2942]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3c9e57] rs-status-live" />
                <span className="font-code-sm text-xs font-bold text-white uppercase tracking-wider">
                  {seg.label} — Segment Detail
                </span>
              </div>
              <span className="font-label-caps text-[9px] text-[#505f7a]">Simulated data</span>
            </div>

            {/* Visual track schematic */}
            <div className="mb-5 p-4 rounded bg-[#080f1d] border border-[#1a2942]">
              <div className="font-label-caps text-[9px] text-[#505f7a] uppercase tracking-wider mb-3">
                Track Schematic — {seg.km}
              </div>
              {/* Track lines */}
              {['UP MAIN', 'DOWN MAIN'].map((track) => (
                <div key={track} className="mb-4">
                  <div className="flex justify-between font-code-sm text-[11px] text-[#7e8ca9] mb-1.5">
                    <span className="font-bold text-[#b8c7e6]">{track}</span>
                  </div>
                  <div className="relative h-2 bg-[#1a2942] rounded-full overflow-hidden">
                    {/* Maintenance block highlight */}
                    {seg.id === 'B' && (
                      <div
                        className="absolute top-0 bottom-0 bg-[#fdd663]/60 border-x border-[#fdd663]"
                        style={{ left: '35%', width: '30%' }}
                      />
                    )}
                    {/* Rail shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#394761]/40 to-transparent" />
                  </div>
                  {seg.id === 'B' && track === 'UP MAIN' && (
                    <div className="mt-1.5 ml-[35%]">
                      <span className="font-label-caps text-[9px] font-bold text-[#b06000] bg-[#fef7e0]/10 border border-[#fdd663]/30 px-2 py-0.5 rounded">
                        Block B-12 (scheduled)
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Detail metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded bg-[#080f1d] border border-[#1a2942]">
                <div className="font-label-caps text-[9px] uppercase tracking-wider text-[#7e8ca9] mb-1">
                  ML Risk Score
                </div>
                <div className={`font-code-sm text-sm font-bold ${seg.statusColor}`}>
                  {seg.risk.toFixed(2)} / 1.0
                </div>
              </div>
              <div className="p-3 rounded bg-[#080f1d] border border-[#1a2942]">
                <div className="font-label-caps text-[9px] uppercase tracking-wider text-[#7e8ca9] mb-1">
                  Status
                </div>
                <div className={`font-code-sm text-xs font-bold ${seg.statusColor}`}>
                  {seg.status}
                </div>
              </div>
              <div className="p-3 rounded bg-[#080f1d] border border-[#1a2942] col-span-2">
                <div className="font-label-caps text-[9px] uppercase tracking-wider text-[#7e8ca9] mb-1">
                  Scheduled Block
                </div>
                <div className="font-code-sm text-xs font-bold text-[#95f8a7]">{seg.block}</div>
              </div>
            </div>

            {/* CP-SAT note */}
            <div className="p-3.5 rounded bg-[#16253d]/70 border border-[#394761]">
              <div className="font-label-caps text-[9px] font-bold text-[#b8c7e6] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">memory</span>
                CP-SAT Scheduling Note (Simulated)
              </div>
              <p className="font-body-sm text-xs text-[#dfe9f5] leading-relaxed">
                {seg.id === 'B'
                  ? 'Elevated risk score: Block B-12 has been assigned the next available maintenance window respecting train headway constraints.'
                  : 'Risk score within acceptable range. Routine inspection assigned to a night window without train path conflicts.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
