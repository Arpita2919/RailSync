import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function OverviewDashboard() {
  const [optimizingState, setOptimizingState] = useState('idle');
  const [activeFilter, setActiveFilter] = useState('ALL DEPTS');
  const [selectedNode, setSelectedNode] = useState(null);

  const triggerOptimization = () => {
    if (optimizingState !== 'idle') return;
    setOptimizingState('solving');
    setTimeout(() => {
      setOptimizingState('optimized');
      setTimeout(() => {
        setOptimizingState('idle');
      }, 2500);
    }, 1800);
  };

  const inspectNode = (stationCode) => {
    setSelectedNode(stationCode);
    console.log("Telemetry synoptic inspector focused on: " + stationCode);
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full">

        {/* Main Content Container */}
        <div className="p-gutter flex flex-col gap-space-lg">
          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm">
            {/* KPI 1: Availability */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Asset Availability</span>
                <span className="material-symbols-outlined text-[14px]">speed</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">94.2%</span>
                <span className="font-code-sm text-code-sm text-error font-medium">▼ 1.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface-variant">TGT: 96.0%</span>
                <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-1 py-0.5 rounded uppercase font-bold">
                  SUB-PAR
                </span>
              </div>
            </div>

            {/* KPI 2: Risks */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Active High Risks</span>
                <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-error">3</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Track Segs</span>
              </div>
              <span className="font-code-sm text-code-sm text-error truncate font-semibold">ALJN-UP-04 / CNB-42B</span>
            </div>

            {/* KPI 3: Planned Blocks */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Today's Blocks</span>
                <span className="material-symbols-outlined text-[14px]">event_note</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">14</span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">APPROVED</span>
              </div>
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant">
                <span>9 ENG</span>•<span>3 TRD</span>•<span>2 S&T</span>
              </div>
            </div>

            {/* KPI 4: Conflicts */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Active Conflicts</span>
                <span className="material-symbols-outlined text-[14px] text-error">warning</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-error">2</span>
                <span className="font-code-sm text-code-sm text-error font-medium">OVERLAPS</span>
              </div>
              <span className="font-code-sm text-code-sm text-error truncate">VB 22436 @ 16:15 IST</span>
            </div>

            {/* KPI 5: Solver Engine Status */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Optimizer #4102</span>
                <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">check_circle</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">91.4</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">PARETO</span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant truncate">Completed 2m 14s ago</span>
            </div>
          </div>

          {/* Optimization Trigger & Filters Bar */}
          <div className="bg-surface-container p-space-sm rounded shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <button
                className={`bg-primary-container hover:bg-primary text-on-primary px-space-md py-space-xs rounded flex items-center justify-center gap-space-sm shadow transition-all active:scale-[0.99] ${
                  optimizingState !== 'idle' ? 'opacity-90' : ''
                }`}
                id="btn-optimize"
                onClick={triggerOptimization}
              >
                {optimizingState === 'solving' ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin text-tertiary-fixed">autorenew</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">SOLVING CBC MTR...</span>
                  </>
                ) : optimizingState === 'optimized' ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">OPTIMIZED (#4103)</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">play_arrow</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">GENERATE OPTIMIZATION</span>
                  </>
                )}
              </button>
              <div className="hidden sm:flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">SOLVER ENGINE</span>
                <span className="font-code-sm text-code-sm text-primary font-semibold">COIN-OR CBC (PARALLEL)</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveFilter('ALL DEPTS')}
                className={`px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold shrink-0 transition-colors ${
                  activeFilter === 'ALL DEPTS'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                }`}
              >
                ALL DEPTS
              </button>
              <button
                onClick={() => setActiveFilter('CRITICAL ONLY')}
                className={`px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                  activeFilter === 'CRITICAL ONLY'
                    ? 'bg-error text-on-error font-semibold'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-error'
                }`}
              >
                CRITICAL ONLY
              </button>
              <button
                onClick={() => setActiveFilter('NEXT 8 HRS')}
                className={`px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                  activeFilter === 'NEXT 8 HRS'
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                }`}
              >
                NEXT 8 HRS
              </button>
              <button className="bg-surface-container-lowest hover:bg-surface-container text-on-surface p-1 rounded shrink-0">
                <span className="material-symbols-outlined text-[16px]">tune</span>
              </button>
            </div>
          </div>

          {/* Corridor Schematic Ribbon (Interactive Railway Track Map) */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">linear_scale</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Corridor Schematic (UP Quad)</h2>
              </div>
              <div className="flex items-center gap-space-md font-label-caps text-label-caps">
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container"></span> CLEAR
                </span>
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> PSR/CAUTION
                </span>
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-error"></span> DEFECT/BLOCK
                </span>
              </div>
            </div>

            {/* Linear Track Segments Visualizer */}
            <div className="relative w-full overflow-x-auto py-space-sm no-scrollbar">
              <div className="min-w-[700px] flex flex-col gap-2">
                {/* Track Line */}
                <div className="relative h-2 bg-surface-container-highest rounded-full w-full flex items-center">
                  <div className="absolute left-0 w-[18%] h-2 bg-tertiary-fixed-dim rounded-l-full"></div>
                  <div className="absolute left-[18%] w-[20%] h-2 bg-secondary-fixed-dim"></div>
                  <div className="absolute left-[38%] w-[18%] h-2 bg-error"></div>
                  <div className="absolute left-[56%] w-[22%] h-2 bg-tertiary-fixed-dim"></div>
                  <div className="absolute left-[78%] w-[12%] h-2 bg-secondary-fixed-dim"></div>
                  <div className="absolute left-[90%] w-[10%] h-2 bg-error rounded-r-full"></div>
                </div>

                {/* Waypoints / Stations Nodes */}
                <div className="grid grid-cols-6 gap-space-xs text-left pt-space-xs">
                  {/* Node 1: ALJN */}
                  <div
                    className={`flex flex-col gap-0.5 cursor-pointer p-1 rounded transition-colors ${
                      selectedNode === 'ALJN' ? 'ring-2 ring-primary bg-surface-container-low' : ''
                    }`}
                    onClick={() => inspectNode('ALJN')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container ring-2 ring-surface-container-lowest"></span>
                      <span className="font-code-lg text-code-lg font-bold text-on-surface">ALJN</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-tertiary-container font-semibold">KM 1024 • CLEAR</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Aligarh Jn. Quad</span>
                  </div>

                  {/* Node 2: SOM */}
                  <div
                    className={`flex flex-col gap-0.5 cursor-pointer p-1 rounded transition-colors ${
                      selectedNode === 'SOM' ? 'ring-2 ring-secondary bg-surface-container-low' : ''
                    }`}
                    onClick={() => inspectNode('SOM')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest"></span>
                      <span className="font-code-lg text-code-lg font-bold text-on-surface">SOM</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant font-semibold">KM 1042 • PSR 110</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">High Track Vib</span>
                  </div>

                  {/* Node 3: KRJ */}
                  <div
                    className={`flex flex-col gap-0.5 cursor-pointer bg-error-container/40 p-1 rounded transition-colors ${
                      selectedNode === 'KRJ' ? 'ring-2 ring-error' : ''
                    }`}
                    onClick={() => inspectNode('KRJ')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse"></span>
                      <span className="font-code-lg text-code-lg font-bold text-error">KRJ</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-error font-bold">KM 1134 • CRITICAL</span>
                    <span className="font-body-sm text-body-sm text-error truncate font-medium">USFD Defect 87%</span>
                  </div>

                  {/* Node 4: TDL */}
                  <div
                    className={`flex flex-col gap-0.5 cursor-pointer p-1 rounded transition-colors ${
                      selectedNode === 'TDL' ? 'ring-2 ring-primary bg-surface-container-low' : ''
                    }`}
                    onClick={() => inspectNode('TDL')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container ring-2 ring-surface-container-lowest"></span>
                      <span className="font-code-lg text-code-lg font-bold text-on-surface">TDL</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-tertiary-container font-semibold">KM 1248 • CLEAR</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Tundla Junction</span>
                  </div>

                  {/* Node 5: FZD */}
                  <div
                    className={`flex flex-col gap-0.5 cursor-pointer p-1 rounded transition-colors ${
                      selectedNode === 'FZD' ? 'ring-2 ring-secondary bg-surface-container-low' : ''
                    }`}
                    onClick={() => inspectNode('FZD')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface-container-lowest"></span>
                      <span className="font-code-lg text-code-lg font-bold text-on-surface">FZD</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant font-semibold">KM 1272 • OHE DUE</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Cantilever Check</span>
                  </div>

                  {/* Node 6: CNB */}
                  <div
                    className={`flex flex-col gap-0.5 cursor-pointer bg-error-container/40 p-1 rounded transition-colors ${
                      selectedNode === 'CNB' ? 'ring-2 ring-error' : ''
                    }`}
                    onClick={() => inspectNode('CNB')}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-error ring-2 ring-surface-container-lowest animate-pulse"></span>
                      <span className="font-code-lg text-code-lg font-bold text-error">CNB</span>
                    </div>
                    <span className="font-label-caps text-label-caps text-error font-bold">KM 1435 • FAULT</span>
                    <span className="font-body-sm text-body-sm text-error truncate font-medium">Pt. 42B Overheat</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Operational Priority Alerts (SCADA Trough) */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-error">notifications_active</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Critical Operational Directives & Clashes</h2>
              </div>
              <span className="font-label-caps text-label-caps bg-error text-on-error px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                2 UNACKNOWLEDGED
              </span>
            </div>

            {/* Alert Card 1 (Red Critical) */}
            <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm border-l-4 border-l-error">
              <div className="flex items-start gap-space-sm min-w-0">
                <div className="p-1 bg-error-container text-on-error-container rounded shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">fmd_bad</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-label-caps text-label-caps bg-error text-on-error px-1 rounded uppercase font-bold">
                      TRACK SAFETY RED
                    </span>
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">KRJ-UP Track Km 1134.2</span>
                    <span className="font-code-sm text-code-sm text-secondary font-medium">| USFD Flaw Detection</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0 w-full md:w-auto justify-end">
                <Link
                  to="/segment-why"
                  className="bg-surface-container hover:bg-surface-container-highest text-on-surface px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold"
                >
                  VIEW LOG
                </Link>
                <button
                  onClick={triggerOptimization}
                  className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-1 rounded font-code-sm text-code-sm font-bold flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  AUTO-INSERT BLOCK
                </button>
              </div>
            </div>

            {/* Alert Card 2 (Amber Conflict) */}
            <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm border-l-4 border-l-secondary">
              <div className="flex items-start gap-space-sm min-w-0">
                <div className="p-1 bg-secondary-container text-on-secondary-container rounded shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px]">history_toggle_off</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="font-label-caps text-label-caps bg-secondary-fixed text-on-secondary-fixed px-1 rounded uppercase font-bold">
                      PATH OVERLAP CONFLICT
                    </span>
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">TRD Power Block vs. 12004 Gomti Exp</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-space-xs shrink-0 w-full md:w-auto justify-end">
                <Link
                  to="/disruption"
                  className="bg-surface-container hover:bg-surface-container-highest text-on-surface px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold"
                >
                  SHIFT PATH
                </Link>
                <button className="bg-surface-container-highest hover:bg-surface-container-high text-primary px-space-md py-1 rounded font-code-sm text-code-sm font-bold flex items-center gap-1">
                  APPROVE CONFLICT
                </button>
              </div>
            </div>
          </div>

          {/* Maintenance Corridor Schedule (Data Table) */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">handyman</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Maintenance Operational Windows</h2>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="font-label-caps text-label-caps text-on-surface-variant">AUTO-REFRESH: 15s</span>
                <button className="text-primary hover:text-on-surface flex items-center font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                </button>
              </div>
            </div>

            {/* Tabular List Component */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                    <th className="py-space-xs px-space-sm font-bold">Block ID</th>
                    <th className="py-space-xs px-space-sm font-bold">Dept</th>
                    <th className="py-space-xs px-space-sm font-bold">Section</th>
                    <th className="py-space-xs px-space-sm font-bold">Time Window</th>
                    <th className="py-space-xs px-space-sm font-bold">Duration</th>
                    <th className="py-space-xs px-space-sm font-bold">Work Scope</th>
                    <th className="py-space-xs px-space-sm font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                  {/* Row 1 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-space-sm px-space-sm font-bold text-primary">BLK-2403-09</td>
                    <td className="py-space-sm px-space-sm">
                      <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                        ENG (P-WAY)
                      </span>
                    </td>
                    <td className="py-space-sm px-space-sm font-semibold text-on-surface">KRJ-UP (Km 1134)</td>
                    <td className="py-space-sm px-space-sm text-on-surface">15:30 - 17:00</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant">90 Min</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant truncate max-w-[160px]">USFD Weld Cropping & Clamp</td>
                    <td className="py-space-sm px-space-sm text-right">
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold">
                        APPROVED
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
                    <td className="py-space-sm px-space-sm font-bold text-primary">BLK-2403-11</td>
                    <td className="py-space-sm px-space-sm">
                      <span className="bg-secondary-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-secondary-container font-semibold">
                        TRD (OHE)
                      </span>
                    </td>
                    <td className="py-space-sm px-space-sm font-semibold text-on-surface">ALJN-DN Line</td>
                    <td className="py-space-sm px-space-sm text-on-surface">17:15 - 18:45</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant">90 Min</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant truncate max-w-[160px]">Contact Wire Tensioning</td>
                    <td className="py-space-sm px-space-sm text-right">
                      <span className="bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold">
                        PROVISIONAL
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-surface-container-low transition-colors bg-error-container/20">
                    <td className="py-space-sm px-space-sm font-bold text-error">BLK-2403-12</td>
                    <td className="py-space-sm px-space-sm">
                      <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                        S&T (SIG)
                      </span>
                    </td>
                    <td className="py-space-sm px-space-sm font-bold text-error">CNB Yard Pt 42B</td>
                    <td className="py-space-sm px-space-sm text-on-surface">23:00 - 02:00</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant">180 Min</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant truncate max-w-[160px]">Motor Overhaul & Interlock Check</td>
                    <td className="py-space-sm px-space-sm text-right">
                      <span className="bg-error text-on-error px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold animate-pulse">
                        CONFLICT
                      </span>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="py-space-sm px-space-sm font-bold text-primary">BLK-2403-14</td>
                    <td className="py-space-sm px-space-sm">
                      <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                        ENG (P-WAY)
                      </span>
                    </td>
                    <td className="py-space-sm px-space-sm font-semibold text-on-surface">TDL-FZD Loop</td>
                    <td className="py-space-sm px-space-sm text-on-surface">02:30 - 05:00</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant">150 Min</td>
                    <td className="py-space-sm px-space-sm text-on-surface-variant truncate max-w-[160px]">Ballast Tamping (DUOMAT)</td>
                    <td className="py-space-sm px-space-sm text-right">
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold">
                        APPROVED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Action Footnote */}
            <div className="flex items-center justify-between pt-space-xs text-secondary">
              <span className="font-body-sm text-body-sm">Showing 4 of 14 programmed operational windows for cycle 24-03</span>
              <Link to="/planner" className="font-code-sm text-code-sm text-primary font-bold hover:underline flex items-center gap-0.5">
                FULL SECTION SCHEDULE
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
