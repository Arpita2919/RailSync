import React, { useState } from 'react';

const presetConfig = {
  safety: {
    name: 'Safety-First',
    desc: 'Safety-First Mode: Prioritizes track renewal and catenary maintenance possessions. Passenger schedule buffers widened by up to 14 minutes per corridor section.',
    m1: '91.2%',
    m2: '380 min',
    m3: '16 of 18',
    m4: '0 CONFLICTS',
    m5: '94.2%',
    btnLabel: 'APPLY SAFETY-FIRST PRESET',
  },
  balanced: {
    name: 'Balanced',
    desc: 'Balanced Mode: Maximizes track maintenance window allocations while capping aggregate passenger rake detention under 35 train-minutes per 12h cycle.',
    m1: '94.8%',
    m2: '210 min',
    m3: '14 of 18',
    m4: '0 CONFLICTS',
    m5: '88.5%',
    btnLabel: 'APPLY BALANCED PRESET TO CORRIDOR',
  },
  throughput: {
    name: 'Throughput-First',
    desc: 'Throughput-First Mode: Prioritizes line capacity, minimizing station dwell and yard hold times. Maintenance possessions are compressed and non-critical inspections deferred.',
    m1: '97.4%',
    m2: '110 min',
    m3: '8 of 18',
    m4: '4 TIGHT (<3m)',
    m5: '62.1%',
    btnLabel: 'APPLY THROUGHPUT PRESET (OVERRIDE)',
  },
};

export default function Optimization() {
  const [selectedPreset, setSelectedPreset] = useState('balanced');
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const current = presetConfig[selectedPreset];

  const handleDispatch = () => {
    if (dispatching) return;
    setDispatching(true);
    setTimeout(() => {
      setDispatching(false);
      setDispatched(true);
      setTimeout(() => {
        setDispatched(false);
      }, 2000);
    }, 750);
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full p-gutter gap-space-lg">
        {/* Status & Context Pill */}
        <div className="flex items-center justify-between bg-surface-container-high px-gutter py-space-sm rounded-lg shadow-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">balance</span>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">Pareto Policy Optimization</span>
              <span className="font-code-sm text-code-sm text-on-surface-variant truncate">
                MILP Engine: NCR-DDU Corridor Dispatch Model
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-0.5 rounded shadow-sm shrink-0">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            <span className="font-label-caps text-label-caps text-on-surface uppercase">SOLVER OPTIMAL</span>
          </div>
        </div>

        {/* Policy Preset Selector */}
        <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Policy Formulation Preset</span>
            <span className="font-code-sm text-code-sm text-secondary">Cycle: 12h Shift (12:00 - 00:00 IST)</span>
          </div>

          {/* Segmented Radio Bar */}
          <div className="grid grid-cols-3 gap-space-xs bg-surface-container p-0.5 rounded-lg" id="preset-selector">
            <button
              className={`flex flex-col items-center justify-center py-space-sm px-space-xs rounded font-headline-sm text-headline-sm transition-colors ${
                selectedPreset === 'safety' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
              }`}
              onClick={() => setSelectedPreset('safety')}
              type="button"
            >
              <span className="font-code-md text-code-md tracking-tight">SAFETY-FIRST</span>
              <span className="font-label-caps text-label-caps text-secondary opacity-75">Max Buffers</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center py-space-sm px-space-xs rounded font-headline-sm text-headline-sm transition-colors ${
                selectedPreset === 'balanced' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
              }`}
              onClick={() => setSelectedPreset('balanced')}
              type="button"
            >
              <span className="font-code-md text-code-md tracking-tight">BALANCED</span>
              <span className="font-label-caps text-label-caps text-primary-fixed uppercase tracking-wider">Active Choice</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center py-space-sm px-space-xs rounded font-headline-sm text-headline-sm transition-colors ${
                selectedPreset === 'throughput' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
              }`}
              onClick={() => setSelectedPreset('throughput')}
              type="button"
            >
              <span className="font-code-md text-code-md tracking-tight">THROUGHPUT</span>
              <span className="font-label-caps text-label-caps text-secondary opacity-75">Min Detention</span>
            </button>
          </div>

          {/* Policy Description Banner */}
          <div className="flex items-start gap-space-sm bg-surface-container-low p-space-sm rounded text-on-surface">
            <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">info</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-headline-sm text-on-surface">{current.name} Mode:</span> {current.desc}
            </p>
          </div>
        </div>

        {/* Multi-Objective Pareto Frontier Trade-Off Display */}
        <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Pareto Objective Vector Metrics</span>
            </div>
            <span className="font-label-caps text-label-caps text-on-tertiary-container bg-surface-container-high px-space-xs py-0.5 rounded uppercase">
              Dual Simplex Cohesive
            </span>
          </div>

          {/* Metric Cards Grid */}
          <div className="flex flex-col gap-space-sm">
            {/* Metric 1: Asset Availability */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-semibold">1. Asset Availability</span>
                <span className="font-code-lg text-code-lg text-on-surface">{current.m1}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1 font-code-sm text-code-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-16 text-secondary text-[10px] uppercase">Safety</span>
                  <div className="flex-1 bg-surface-container-highest h-2 rounded overflow-hidden">
                    <div className="bg-secondary-fixed-dim h-full" style={{ width: '91.2%' }}></div>
                  </div>
                  <span className="w-10 text-right text-secondary text-[10px]">91.2%</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-16 font-semibold text-primary text-[10px] uppercase">Balanced</span>
                  <div className="flex-1 bg-surface-container-highest h-2 rounded overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '94.8%' }}></div>
                  </div>
                  <span className="w-10 text-right font-semibold text-primary text-[10px]">94.8%</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-16 text-secondary text-[10px] uppercase">Throughput</span>
                  <div className="flex-1 bg-surface-container-highest h-2 rounded overflow-hidden">
                    <div className="bg-outline-variant h-full" style={{ width: '97.4%' }}></div>
                  </div>
                  <span className="w-10 text-right text-secondary text-[10px]">97.4%</span>
                </div>
              </div>
            </div>

            {/* Metric 2: Total Corridor Downtime */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-semibold">2. Total Corridor Downtime</span>
                <span className="font-code-lg text-code-lg text-on-surface">{current.m2}</span>
              </div>
              <div className="flex flex-col gap-1 mt-1 font-code-sm text-code-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-16 text-secondary text-[10px] uppercase">Safety</span>
                  <div className="flex-1 bg-surface-container-highest h-2 rounded overflow-hidden">
                    <div className="bg-secondary-fixed-dim h-full" style={{ width: '100%' }}></div>
                  </div>
                  <span className="w-10 text-right text-secondary text-[10px]">380m</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-16 font-semibold text-primary text-[10px] uppercase">Balanced</span>
                  <div className="flex-1 bg-surface-container-highest h-2 rounded overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: '55.2%' }}></div>
                  </div>
                  <span className="w-10 text-right font-semibold text-primary text-[10px]">210m</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-16 text-secondary text-[10px] uppercase">Throughput</span>
                  <div className="flex-1 bg-surface-container-highest h-2 rounded overflow-hidden">
                    <div className="bg-outline-variant h-full" style={{ width: '28.9%' }}></div>
                  </div>
                  <span className="w-10 text-right text-secondary text-[10px]">110m</span>
                </div>
              </div>
            </div>

            {/* Metric 3: Maintenance Blocks Granted */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-semibold">3. Maintenance Blocks Granted</span>
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-lg text-code-lg text-on-surface">{current.m3}</span>
                  <span className="font-label-caps text-label-caps text-on-tertiary-container bg-surface-container-high px-space-xs py-0.5 rounded">
                    {selectedPreset === 'safety' ? '88.9%' : selectedPreset === 'balanced' ? '77.8%' : '44.4%'} SATISFIED
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-space-xs pt-space-xs text-center font-code-sm text-code-sm">
                <div
                  className={`p-space-xs rounded ${
                    selectedPreset === 'safety' ? 'bg-secondary-container' : 'bg-surface-container-lowest'
                  }`}
                >
                  <div className="font-label-caps text-secondary">SAFETY</div>
                  <div className="font-bold text-on-surface">16 / 18</div>
                </div>
                <div
                  className={`p-space-xs rounded ${
                    selectedPreset === 'balanced' ? 'bg-secondary-container' : 'bg-surface-container-lowest'
                  }`}
                >
                  <div className="font-label-caps text-on-secondary-fixed">BALANCED</div>
                  <div className="font-bold text-on-secondary-fixed">14 / 18</div>
                </div>
                <div
                  className={`p-space-xs rounded ${
                    selectedPreset === 'throughput' ? 'bg-secondary-container' : 'bg-surface-container-lowest'
                  }`}
                >
                  <div className="font-label-caps text-secondary">THROUGHPUT</div>
                  <div className="font-bold text-error">8 / 18</div>
                </div>
              </div>
            </div>

            {/* Metric 4: Unresolved Path Conflicts */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-semibold">4. Unresolved Path Conflicts</span>
                <span
                  className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded font-bold ${
                    current.m4.includes('0')
                      ? 'text-on-tertiary-container bg-surface-container-highest'
                      : 'text-error bg-error-container'
                  }`}
                >
                  {current.m4}
                </span>
              </div>
              <div className="flex items-center justify-between bg-surface-container-lowest px-space-sm py-space-xs rounded font-code-sm text-code-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                  <span className="text-on-surface">
                    Safety: <strong className="font-semibold">0</strong>
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                  <span className="text-on-surface">
                    Balanced: <strong className="font-semibold">0</strong>
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                  <span className="text-error">
                    Throughput: <strong className="font-semibold">4 Tight (&lt;3m)</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 5: Schedule Robustness Index */}
            <div className="bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-body-md text-body-md text-on-surface font-semibold">
                  5. Schedule Robustness Index (Ripple Buffer)
                </span>
                <span className="font-code-lg text-code-lg text-primary font-bold">{current.m5}</span>
              </div>
              <div className="relative w-full bg-surface-container-highest h-3 rounded overflow-hidden flex">
                <div className="bg-secondary-fixed-dim h-full" style={{ width: '30%' }}></div>
                <div className="bg-primary h-full" style={{ width: `${parseFloat(current.m5) * 0.6}%` }}></div>
                <div className="bg-error-container h-full" style={{ width: '11.5%' }}></div>
              </div>
              <div className="flex justify-between font-label-caps text-label-caps text-secondary">
                <span>THROUGHPUT: 62.1% (High Ripple)</span>
                <span>BALANCED: 88.5%</span>
                <span>SAFETY: 94.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Delight: Timetable Shift Inspection */}
        <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">timelapse</span>
              <span className="font-headline-sm text-headline-sm text-on-surface">Timetable Shift Inspection</span>
            </div>
            <span className="font-code-sm text-code-sm text-secondary">Delta vs Master Graph</span>
          </div>

          {/* Train 1: Vande Bharat Premium */}
          <div className="flex flex-col bg-surface-container-low p-space-sm rounded-lg gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-primary text-[18px]">train</span>
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">Vande Bharat Exp (22436)</span>
              </div>
              <span className="font-code-sm text-code-sm bg-surface-container-highest px-space-xs py-0.5 rounded text-primary font-semibold">
                0m DELTA (ALL PRESETS)
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              Absolute priority corridor locked. Section clearance guaranteed through Prayagraj Jn (PRYJ) without speed restriction.
            </p>
          </div>

          {/* Train 2: Freight BOXN Coal */}
          <div className="flex flex-col bg-surface-container-low p-space-sm rounded-lg gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-secondary text-[18px]">directions_boat</span>
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">Freight BOXN Coal Rake</span>
              </div>
              <span className="font-code-sm text-code-sm bg-secondary-container px-space-xs py-0.5 rounded text-on-secondary-fixed font-bold">
                {selectedPreset === 'throughput' ? '-18m QUICK RUN' : '+24m YARD HOLD'}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-secondary">
              Held at Chheoki Yard siding to allow civil engineering safety window. Throughput preset would accelerate by +18m at expense
              of track defect maintenance.
            </p>
          </div>

          {/* Track Asset: Critical USFD Track Defect Repair */}
          <div className="flex flex-col bg-surface-container-low p-space-sm rounded-lg gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-error text-[18px]">handyman</span>
                <span className="font-headline-sm text-headline-sm text-on-surface truncate">USFD Rail Defect Repair (Km 1082)</span>
              </div>
              <span
                className={`font-code-sm text-code-sm px-space-xs py-0.5 rounded font-bold ${
                  selectedPreset === 'throughput'
                    ? 'bg-error-container text-on-error-container'
                    : 'bg-tertiary-container text-tertiary-fixed'
                }`}
              >
                {selectedPreset === 'throughput' ? 'DEFERRED (HIGH RISK)' : '15:30 IST ALLOCATED'}
              </span>
            </div>
            <div className="flex items-start gap-space-xs text-secondary font-body-sm text-body-sm">
              <span className="material-symbols-outlined text-secondary text-[14px] mt-0.5">verified_user</span>
              <span>
                Allocated in <strong className="text-on-surface">Balanced &amp; Safety</strong> modes. In Throughput-first, this critical
                block is deferred past 00:00 (Severe derailment risk warning).
              </span>
            </div>
          </div>
        </div>

        {/* Station Master's Dispatch Ledger & Pareto Trajectory */}
        <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Pareto Trade-off Trajectory</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Optimal Boundary Curve</span>
          </div>

          {/* SVG Pareto Curve */}
          <div className="relative w-full h-24 bg-surface-container-low rounded-lg p-space-sm flex flex-col justify-between overflow-hidden">
            <svg className="absolute inset-0 w-full h-full text-secondary-container" preserveAspectRatio="none" viewBox="0 0 300 80">
              <path d="M 20 15 Q 120 25 280 70" fill="none" stroke="currentColor" strokeDasharray="4 2" strokeWidth="3" />
            </svg>
            <div className="relative z-10 flex justify-between h-full items-end pb-1 px-4">
              {/* Safety Point */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => setSelectedPreset('safety')}>
                <span className={`font-label-caps text-[9px] ${selectedPreset === 'safety' ? 'font-bold text-primary' : 'text-secondary'}`}>
                  SAFETY
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded-full my-0.5 transition-transform ${
                    selectedPreset === 'safety' ? 'bg-primary ring-2 ring-surface-container-lowest scale-125' : 'bg-secondary-fixed-dim'
                  }`}
                ></div>
                <span className="font-code-sm text-[10px] text-on-surface">380m dt</span>
              </div>

              {/* Balanced Point */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => setSelectedPreset('balanced')}>
                <span
                  className={`font-label-caps text-[9px] font-bold ${
                    selectedPreset === 'balanced' ? 'text-primary' : 'text-secondary'
                  }`}
                >
                  BALANCED
                </span>
                <div
                  className={`w-4 h-4 rounded-full my-0.5 shadow-md flex items-center justify-center transition-transform ${
                    selectedPreset === 'balanced'
                      ? 'bg-primary ring-2 ring-surface-container-lowest scale-125'
                      : 'bg-primary/40'
                  }`}
                >
                  <span className="w-1.5 h-1.5 bg-tertiary-fixed rounded-full"></span>
                </div>
                <span className="font-code-sm text-[10px] font-bold text-primary">210m dt</span>
              </div>

              {/* Throughput Point */}
              <div className="flex flex-col items-center cursor-pointer" onClick={() => setSelectedPreset('throughput')}>
                <span
                  className={`font-label-caps text-[9px] ${
                    selectedPreset === 'throughput' ? 'font-bold text-primary' : 'text-secondary'
                  }`}
                >
                  THROUGHPUT
                </span>
                <div
                  className={`w-3.5 h-3.5 rounded-full my-0.5 transition-transform ${
                    selectedPreset === 'throughput'
                      ? 'bg-primary ring-2 ring-surface-container-lowest scale-125'
                      : 'bg-outline-variant'
                  }`}
                ></div>
                <span className="font-code-sm text-[10px] text-on-surface">110m dt</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between font-label-caps text-label-caps text-secondary px-space-xs">
            <span>← Higher Safety Margin</span>
            <span>Maximum Train Volume →</span>
          </div>
        </div>

        {/* Solvers & Convergence Stats Deck */}
        <div className="flex flex-col bg-surface-container-high p-space-md rounded-lg shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Solver Convergence Telemetry</span>
            <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">GAP: 0.04%</span>
          </div>
          <div className="grid grid-cols-2 gap-space-xs font-code-sm text-code-sm">
            <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
              <span className="font-label-caps text-secondary">ALGORITHM</span>
              <span className="text-on-surface font-semibold truncate">MILP (Branch &amp; Cut)</span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
              <span className="font-label-caps text-secondary">EXECUTION TIME</span>
              <span className="text-on-surface font-semibold">3.14s (5 Iterations)</span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
              <span className="font-label-caps text-secondary">DECISION VARIABLES</span>
              <span className="text-on-surface font-semibold">14,280 Vars</span>
            </div>
            <div className="flex flex-col bg-surface-container-lowest p-space-xs rounded">
              <span className="font-label-caps text-secondary">CONSTRAINTS</span>
              <span className="text-on-surface font-semibold">38,910 Rows</span>
            </div>
          </div>
        </div>

        {/* Primary Action Dispatch Button */}
        <div className="sticky bottom-2 z-20 flex flex-col pt-space-xs">
          <button
            className="flex items-center justify-center gap-space-sm bg-primary text-on-primary py-space-md px-gutter rounded-lg shadow-lg active:opacity-95 transition-all"
            onClick={handleDispatch}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">bolt</span>
            <span className="font-code-lg text-code-lg tracking-wide uppercase">
              {dispatching
                ? 'TRANSMITTING TO COA/FOIS...'
                : dispatched
                ? 'PRESET COMMITTED TO DISPATCH ✓'
                : current.btnLabel}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
