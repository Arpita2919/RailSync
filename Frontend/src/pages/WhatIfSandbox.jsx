import React, { useState } from 'react';

export default function WhatIfSandbox() {
  const [scenario, setScenario] = useState('Track Weld Defect at 15:30 (Active NCR Urgent)');
  const [reOptState, setReOptState] = useState('idle');
  const [promoteState, setPromoteState] = useState('idle');

  const handleReOptimize = () => {
    if (reOptState !== 'idle') return;
    setReOptState('computing');
    setTimeout(() => {
      setReOptState('done');
      setTimeout(() => {
        setReOptState('idle');
      }, 2500);
    }, 700);
  };

  const handlePromote = () => {
    if (promoteState !== 'idle') return;
    setPromoteState('transmitting');
    setTimeout(() => {
      setPromoteState('promoted');
    }, 900);
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full gap-space-md p-gutter">
        {/* Operational Breadcrumb & Mode Banner */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs bg-surface-container px-space-md py-space-xs rounded shadow-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="material-symbols-outlined text-[18px] text-error">dynamic_form</span>
            <span className="font-code-sm text-code-sm text-on-surface uppercase tracking-wider font-semibold">
              SANDBOX RE-OPTIMIZER
            </span>
            <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-1 py-0.5 rounded uppercase font-bold">
              Simulation Locked to Live Feed
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">memory</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">MIP Solver v4.2</span>
          </div>
        </div>

        {/* SECTION 1: Disruption Injection Console */}
        <section className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Disruption Injection Parameters</h2>
            </div>
            <span className="font-code-sm text-code-sm bg-surface-container-highest text-on-surface-variant px-space-xs py-0.5 rounded">
              KRJ/SOM Sector
            </span>
          </div>

          {/* Controls Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Scenario Selector */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Disruption Scenario Preset</label>
              <div className="relative">
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  className="w-full h-8 px-space-sm bg-surface-container-low text-on-surface font-code-sm text-code-sm rounded appearance-none focus:outline-none focus:bg-surface-container cursor-pointer"
                  id="scenario-selector"
                >
                  <option>Track Weld Defect at 15:30 (Active NCR Urgent)</option>
                  <option>OHE Cantilever Sag at Post Km 1074/12</option>
                  <option>Signal Interlocking Electronic Failure (KRJ North)</option>
                  <option>Custom Operator Injection (Manual Possessions)</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-2 text-[16px] text-on-surface-variant pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>

            {/* Target Section */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Target Spatial Location</label>
              <div className="flex items-center gap-space-xs h-8 px-space-sm bg-surface-container-low text-on-surface rounded font-code-sm text-code-sm">
                <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                <span className="truncate">UP Mainline - KRJ (Khurja Junction) Km 1072.3</span>
              </div>
            </div>

            {/* Severity */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Block Severity &amp; Mandate</label>
              <div className="flex items-center justify-between h-8 px-space-sm bg-error-container text-on-error-container rounded">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px]">dangerous</span>
                  <span className="font-code-sm text-code-sm font-semibold">CRITICAL POSSESSION</span>
                </div>
                <span className="font-label-caps text-label-caps uppercase bg-error text-on-error px-1 py-0.5 rounded">90-min lock</span>
              </div>
            </div>

            {/* Time Window & Affected */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Temporal Window &amp; Direct Trains</label>
              <div className="flex items-center justify-between h-8 px-space-sm bg-surface-container-low text-on-surface rounded font-code-sm text-code-sm">
                <span className="text-on-surface font-semibold">15:30 - 17:00 IST</span>
                <span className="text-on-surface-variant truncate">Impacts: #12004 Gomti, #12424 Rajdhani</span>
              </div>
            </div>
          </div>

          {/* Optimization Trigger Button & Engine Telemetry */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md pt-space-xs">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
              <span className="font-label-caps text-label-caps uppercase">Solver: CBC MIP Engine | Time Limit: 10s | Heuristic v8</span>
            </div>
            <button
              onClick={handleReOptimize}
              disabled={reOptState === 'computing'}
              className={`flex items-center justify-center gap-space-xs px-space-lg h-9 bg-primary-container text-on-primary rounded font-code-md text-code-md shadow-sm active:opacity-90 transition-all ${
                reOptState === 'computing' ? 'opacity-75' : ''
              }`}
              id="re-opt-btn"
            >
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">bolt</span>
              <span className="tracking-wide" id="re-opt-text">
                {reOptState === 'computing'
                  ? 'COMPUTING MIP OPTIMIZATION...'
                  : reOptState === 'done'
                  ? 'SCHEDULE RE-OPTIMIZED (0.41s)'
                  : 'RE-OPTIMIZE SCHEDULE (SOLVE PLAN B)'}
              </span>
            </button>
          </div>
        </section>

        {/* SECTION 2: Baseline Plan vs. Revised Plan B Comparison Matrix */}
        <section className="flex flex-col gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">compare_arrows</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">2. Dispatch Mitigation Matrix</h2>
            </div>
            <span className="font-label-caps text-label-caps text-tertiary-container bg-tertiary-fixed px-space-xs py-0.5 rounded uppercase font-bold">
              84.8% Delay Mitigation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Baseline Plan Card */}
            <div className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-[18px]">block</span>
                  <span className="font-headline-sm text-headline-sm text-error">Baseline Inaction (Default)</span>
                </div>
                <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface-variant px-space-xs py-0.5 rounded">
                  STATUS QUO
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">12004 Gomti Express Arrival</span>
                  <span className="font-code-sm text-code-sm text-error font-bold">+72 mins at CNB</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Corridor Cumulative Loss</span>
                  <span className="font-code-sm text-code-sm text-error font-bold">184 rake-mins</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">P-Way Track Block Duration</span>
                  <span className="font-code-sm text-code-sm text-on-surface font-semibold">Truncated to 45 mins</span>
                </div>
                <div className="flex items-center gap-space-xs p-space-xs bg-error-container text-on-error-container rounded font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-[16px] text-error shrink-0">warning</span>
                  <span className="font-code-sm text-code-sm font-bold text-error">CRITICAL:</span>
                  <span className="truncate">Imposes 20 km/h PSR (48h) due to unground weld.</span>
                </div>
              </div>
              {/* Metric Sparkline Graphic */}
              <div className="flex flex-col gap-1 mt-auto">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>CORRIDOR THROUGHPUT RETENTION</span>
                  <span className="font-bold text-error">32%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded overflow-hidden">
                  <div className="bg-error h-full" style={{ width: '32%' }}></div>
                </div>
              </div>
            </div>

            {/* Revised Plan B Card */}
            <div className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-[18px]">verified</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Revised Plan B</span>
                </div>
                <span className="font-label-caps text-label-caps bg-tertiary-container text-tertiary-fixed px-space-xs py-0.5 rounded font-bold uppercase">
                  AI RECOMMENDED
                </span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">12004 Gomti Exp (SOM Loop 1)</span>
                  <span className="font-code-sm text-code-sm text-on-tertiary-container font-bold">+11 mins at CNB</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Full Engineering Block</span>
                  <span className="font-code-sm text-code-sm text-on-tertiary-container font-bold">Full 90 mins (15:35-17:05)</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Concurrent TRD OHE Inspection</span>
                  <span className="font-code-sm text-code-sm text-on-tertiary-container font-bold">Shadowed (0 min loss)</span>
                </div>
                <div className="flex items-start gap-space-xs p-space-xs bg-surface-container text-on-surface rounded">
                  <span className="material-symbols-outlined text-tertiary-fixed-dim text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span className="font-body-sm text-body-sm">
                    Total Corridor Loss: <strong className="font-code-sm text-on-tertiary-container font-bold">28 rake-mins</strong>. Prevents
                    domino cascading across Prayagraj Division junction nodes.
                  </span>
                </div>
              </div>
              {/* Metric Sparkline Graphic */}
              <div className="flex flex-col gap-1 mt-auto">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span>CORRIDOR THROUGHPUT RETENTION</span>
                  <span className="font-bold text-on-tertiary-container">88%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded overflow-hidden">
                  <div className="bg-tertiary-fixed-dim h-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Track Schematic / Block Allocation Diagram */}
        <section className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">conversion_path</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Synoptic Layout: Plan B Dynamic Allocation
              </span>
            </div>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Km 1068.0 to 1076.0</span>
          </div>

          {/* SVG Track Synoptic Graphic */}
          <div className="w-full bg-surface-container-high rounded p-space-sm overflow-x-auto">
            <svg className="w-full min-w-[560px] h-24" fill="none" viewBox="0 0 700 100" xmlns="http://www.w3.org/2000/svg">
              <line className="text-surface-variant" stroke="currentColor" strokeDasharray="2 2" x1="100" x2="100" y1="10" y2="90" />
              <line className="text-surface-variant" stroke="currentColor" strokeDasharray="2 2" x1="300" x2="300" y1="10" y2="90" />
              <line className="text-surface-variant" stroke="currentColor" strokeDasharray="2 2" x1="500" x2="500" y1="10" y2="90" />

              <text className="text-on-surface font-label-caps text-[9px]" fill="currentColor" x="100" y="16">
                SOMESHWAR (SOM)
              </text>
              <text className="text-on-surface font-label-caps text-[9px]" fill="currentColor" x="350" y="16">
                KRJ JN (Km 1072.3)
              </text>
              <text className="text-on-surface font-label-caps text-[9px]" fill="currentColor" x="580" y="16">
                CHANDA (CHL)
              </text>

              <line className="text-secondary" stroke="currentColor" strokeWidth="3" x1="20" x2="260" y1="40" y2="40" />
              <line stroke="#BA1A1A" strokeDasharray="4 2" strokeWidth="4" x1="260" x2="440" y1="40" y2="40" />
              <line className="text-secondary" stroke="currentColor" strokeWidth="3" x1="440" x2="680" y1="40" y2="40" />

              <path d="M 220 40 L 260 70 L 460 70 L 500 40" fill="none" stroke="#3C9E57" strokeWidth="3" />

              <line className="text-outline" stroke="currentColor" strokeWidth="2" x1="360" x2="480" y1="88" y2="88" />
              <rect className="fill-surface-container text-on-surface-variant" height="12" rx="2" width="60" x="380" y="82" />
              <text className="text-on-surface-variant font-code-sm text-[8px]" fill="currentColor" x="384" y="91">
                BOXN-92 SIDING
              </text>

              <g transform="translate(300, 58)">
                <rect fill="#16253D" height="20" rx="3" width="94" />
                <text className="font-code-sm text-[10px] font-bold" fill="#FFFFFF" x="6" y="14">
                  12004 GOMTI [UP]
                </text>
              </g>

              <g transform="translate(310, 26)">
                <rect fill="#BA1A1A" height="16" rx="2" width="84" />
                <text className="font-label-caps text-[9px]" fill="#FFFFFF" x="6" y="12">
                  P-WAY 90m BLOCK
                </text>
              </g>
            </svg>
          </div>
        </section>

        {/* SECTION 3: Dispatch Logic */}
        <section className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">3. Dispatch Logic: Explainable AI Rationale</h2>
          </div>
          <div className="bg-surface-container-low p-space-md rounded flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-xs mb-0.5">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps bg-primary text-on-primary px-1.5 py-0.5 rounded uppercase font-bold">
                  SYNTHESIS
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Optimal Resolution Plan</span>
              </div>
              <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">+61 min corridor gain</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs text-body-sm text-on-surface">
              <div className="flex items-center gap-space-xs p-space-xs bg-surface-container-lowest rounded">
                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">arrow_forward</span>
                <span>
                  <strong className="font-code-sm text-primary">BOXN-92</strong> sidelined into KRJ Siding #4 at 15:22.
                </span>
              </div>
              <div className="flex items-center gap-space-xs p-space-xs bg-surface-container-lowest rounded">
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container shrink-0">check_circle</span>
                <span>
                  <strong className="font-code-sm text-primary">12004 Gomti</strong> clears SOM Loop 1 via 2-min green corridor.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: Safety & Constraint Verification Checks */}
        <section className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">fact_check</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">4. Safety &amp; Constraint Verification (4/4 Passed)</h2>
            </div>
            <span className="font-label-caps text-label-caps bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded uppercase">
              ALL CLEAR
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
            <div className="flex items-start gap-space-xs p-space-xs bg-surface-container-low rounded">
              <span className="material-symbols-outlined text-on-tertiary-container text-[18px] shrink-0 mt-0.5">check_circle</span>
              <div className="flex flex-col min-w-0">
                <span className="font-code-sm text-code-sm font-semibold text-on-surface">MPS &amp; PSR Compliant</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">IRSOD Section 4 speed clearance respected.</span>
              </div>
            </div>
            <div className="flex items-start gap-space-xs p-space-xs bg-surface-container-low rounded">
              <span className="material-symbols-outlined text-on-tertiary-container text-[18px] shrink-0 mt-0.5">check_circle</span>
              <div className="flex flex-col min-w-0">
                <span className="font-code-sm text-code-sm font-semibold text-on-surface">Traction Power Overlap Safe</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  OHE neutral section isolated at Substation 4B.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-space-xs p-space-xs bg-surface-container-low rounded">
              <span className="material-symbols-outlined text-on-tertiary-container text-[18px] shrink-0 mt-0.5">check_circle</span>
              <div className="flex flex-col min-w-0">
                <span className="font-code-sm text-code-sm font-semibold text-on-surface">Interlocking Validated</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Zero risk of route flank or track circuit shorting.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-space-xs p-space-xs bg-surface-container-low rounded">
              <span className="material-symbols-outlined text-on-tertiary-container text-[18px] shrink-0 mt-0.5">check_circle</span>
              <div className="flex flex-col min-w-0">
                <span className="font-code-sm text-code-sm font-semibold text-on-surface">Crew &amp; HOER Norms Preserved</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Running crew duty hours within mandatory limits.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Operational Execution Action Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-md bg-surface-container p-space-md rounded shadow-sm">
          <div className="flex items-center gap-space-sm">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">COMPUTE TIME</span>
              <span className="font-code-sm text-code-sm text-on-surface font-bold">4.82s (Converged)</span>
            </div>
            <div className="h-6 w-px bg-surface-variant hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">DISPATCH CONFIDENCE</span>
              <span className="font-code-sm text-code-sm text-on-tertiary-container font-bold">99.4% Robustness</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm justify-end">
            <button className="flex items-center justify-center gap-space-xs px-space-md h-9 bg-surface-container-lowest text-on-surface rounded font-code-sm text-code-sm shadow-sm hover:bg-surface transition-all">
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Revise Constraints</span>
            </button>
            <button
              onClick={handlePromote}
              disabled={promoteState !== 'idle'}
              className={`flex items-center justify-center gap-space-xs px-space-lg h-9 rounded font-code-md text-code-md shadow-sm active:scale-[0.98] transition-all ${
                promoteState === 'promoted'
                  ? 'bg-primary-container text-on-primary'
                  : 'bg-tertiary-container text-on-tertiary-container hover:opacity-90'
              }`}
              id="promote-btn"
            >
              <span className="material-symbols-outlined text-[18px]">publish</span>
              <span className="font-semibold" id="promote-text">
                {promoteState === 'transmitting'
                  ? 'TRANSMITTING TO FOIS / COA...'
                  : promoteState === 'promoted'
                  ? 'PLAN B ACTIVE ON DIVISIONAL GRID ✔'
                  : 'PROMOTE PLAN B TO TIMETABLE'}
              </span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
