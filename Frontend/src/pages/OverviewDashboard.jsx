import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getHealth, getRiskSegments, getCurrentPlan, getTasks, runOptimization,
  riskLevel, formatTime, deptLabel, formatDuration,
} from '../services/api';

export default function OverviewDashboard() {
  const [optimizingState, setOptimizingState] = useState('idle');
  const [activeFilter, setActiveFilter] = useState('ALL DEPTS');
  const [selectedNode, setSelectedNode] = useState(null);

  // Real data state
  const [health, setHealth] = useState(null);
  const [risks, setRisks] = useState([]);
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthData, riskData, taskData] = await Promise.all([
        getHealth().catch(() => null),
        getRiskSegments().catch(() => []),
        getTasks().catch(() => []),
      ]);
      // Plan might not exist yet (404)
      let planData = null;
      try { planData = await getCurrentPlan(); } catch {}

      setHealth(healthData);
      setRisks(riskData);
      setTasks(taskData);
      setPlan(planData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerOptimization = async () => {
    if (optimizingState !== 'idle') return;
    setOptimizingState('solving');
    try {
      const result = await runOptimization('balanced', 'both');
      setOptimizingState('optimized');
      // Reload plan data after optimization
      try { const newPlan = await getCurrentPlan(); setPlan(newPlan); } catch {}
      setTimeout(() => setOptimizingState('idle'), 2500);
    } catch (err) {
      setOptimizingState('idle');
      alert('Optimization failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const inspectNode = (stationCode) => {
    setSelectedNode(stationCode);
  };

  // Computed KPIs from real data
  const highRiskSegments = risks.filter(r => r.risk_30d >= 0.4);
  const criticalSegments = risks.filter(r => r.risk_30d >= 0.7);
  const assignments = plan?.assignments || [];
  const todayBlocks = assignments.length;
  const avgRisk = risks.length > 0 ? (risks.reduce((s, r) => s + (1 - r.risk_30d), 0) / risks.length * 100).toFixed(1) : '—';

  // Department breakdown from assignments
  const deptCounts = {};
  assignments.forEach(a => { deptCounts[a.department] = (deptCounts[a.department] || 0) + 1; });

  // Filter assignments based on active filter
  const filteredAssignments = activeFilter === 'CRITICAL ONLY'
    ? assignments.filter(a => a.risk_30d >= 0.7 || a.priority >= 0.8)
    : assignments;

  // Map segment risks to corridor nodes
  const getSegmentStatus = (segId) => {
    const seg = risks.find(r => r.segment_id === segId);
    if (!seg) return { status: 'CLEAR', risk: 0 };
    const rl = riskLevel(seg.risk_30d);
    return { status: rl.label, risk: seg.risk_30d, ...seg };
  };

  if (loading) {
    return (
      <main className="flex flex-col relative w-full">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-space-sm">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">autorenew</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Loading real-time data from all layers...</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full">

        {/* Connection Status Banner */}
        {error && (
          <div className="mx-gutter mt-space-sm px-space-md py-space-sm rounded bg-error-container text-on-error-container flex items-center gap-space-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span className="font-code-sm text-code-sm">Backend connection error: {error}</span>
            <button onClick={loadDashboardData} className="ml-auto font-code-sm text-code-sm font-bold underline">RETRY</button>
          </div>
        )}

        {/* Main Content Container */}
        <div className="p-gutter flex flex-col gap-space-lg">
          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-sm">
            {/* KPI 1: Availability (computed from avg risk) */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Asset Availability</span>
                <span className="material-symbols-outlined text-[14px]">speed</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{avgRisk}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface-variant">TGT: 96.0%</span>
                <span className={`font-label-caps text-label-caps px-1 py-0.5 rounded uppercase font-bold ${
                  parseFloat(avgRisk) >= 96 ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error-container text-on-error-container'
                }`}>
                  {parseFloat(avgRisk) >= 96 ? 'ON TARGET' : 'SUB-PAR'}
                </span>
              </div>
            </div>

            {/* KPI 2: Active High Risks (from Layer 1 ML model) */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Active High Risks</span>
                {highRiskSegments.length > 0 && <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>}
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className={`font-headline-lg text-headline-lg font-bold ${highRiskSegments.length > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
                  {highRiskSegments.length}
                </span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Track Segs</span>
              </div>
              <span className="font-code-sm text-code-sm text-error truncate font-semibold">
                {highRiskSegments.slice(0, 2).map(s => s.segment_id).join(' / ') || 'All clear'}
              </span>
            </div>

            {/* KPI 3: Planned Blocks (from current plan) */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Planned Blocks</span>
                <span className="material-symbols-outlined text-[14px]">event_note</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{todayBlocks}</span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">
                  {plan ? 'APPROVED' : 'NO PLAN'}
                </span>
              </div>
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant">
                {Object.entries(deptCounts).map(([dept, count], i) => (
                  <span key={dept}>{i > 0 && '•'}{count} {dept}</span>
                ))}
                {Object.keys(deptCounts).length === 0 && <span>Run optimization to generate</span>}
              </div>
            </div>

            {/* KPI 4: Total Tasks */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">Pending Tasks</span>
                <span className="material-symbols-outlined text-[14px] text-secondary">assignment</span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">{tasks.length}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">DEMANDS</span>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant truncate">
                {tasks.filter(t => t.claimed_criticality <= 2).length} critical / {tasks.filter(t => t.overdue).length} overdue
              </span>
            </div>

            {/* KPI 5: System Health */}
            <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm col-span-2 sm:col-span-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary">
                <span className="font-label-caps text-label-caps uppercase">System Health</span>
                <span className={`material-symbols-outlined text-[14px] ${health?.status === 'ok' ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {health?.status === 'ok' ? 'check_circle' : 'error'}
                </span>
              </div>
              <div className="my-space-xs flex items-baseline gap-space-xs">
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  {health?.status === 'ok' ? 'OK' : health?.status?.toUpperCase() || '—'}
                </span>
              </div>
              <div className="flex items-center gap-space-xs font-code-sm text-code-sm text-on-surface-variant">
                <span>L1:{health?.layer1 === 'available' ? '✓' : '✗'}</span>
                <span>L2:{health?.layer2 === 'available' ? '✓' : '✗'}</span>
                <span>L3:{health?.layer3 === 'available' ? '✓' : '✗'}</span>
              </div>
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
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">SOLVING CP-SAT...</span>
                  </>
                ) : optimizingState === 'optimized' ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">check_circle</span>
                    <span className="font-code-sm text-code-sm uppercase font-bold tracking-wide">OPTIMIZED ✓</span>
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
                <span className="font-code-sm text-code-sm text-primary font-semibold">
                  {health?.layer3 === 'available' ? 'CP-SAT (OR-Tools)' : 'UNAVAILABLE'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
              {['ALL DEPTS', 'CRITICAL ONLY'].map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold shrink-0 transition-colors ${
                    activeFilter === f
                      ? (f === 'CRITICAL ONLY' ? 'bg-error text-on-error' : 'bg-primary text-on-primary')
                      : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Corridor Schematic Ribbon — Built from real risk segments */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">linear_scale</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Corridor Segments (Layer 1 Risk)</h2>
              </div>
              <div className="flex items-center gap-space-md font-label-caps text-label-caps">
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-tertiary-container"></span> LOW
                </span>
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span> HIGH
                </span>
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-2 h-2 rounded-full bg-error"></span> CRITICAL
                </span>
              </div>
            </div>

            {/* Segment Grid */}
            <div className="relative w-full overflow-x-auto py-space-sm no-scrollbar">
              {risks.length === 0 ? (
                <div className="text-center py-space-md font-code-sm text-code-sm text-on-surface-variant">
                  No risk segments available. Check Layer 1 connection.
                </div>
              ) : (
                <div className="min-w-[700px] flex flex-col gap-2">
                  {/* Track Line — colored by risk level */}
                  <div className="relative h-2 bg-surface-container-highest rounded-full w-full flex items-center">
                    {risks.map((seg, i) => {
                      const width = 100 / risks.length;
                      const rl = riskLevel(seg.risk_30d);
                      const bgColor = rl.color === 'error' ? 'bg-error'
                        : rl.color === 'secondary' ? 'bg-secondary-fixed-dim'
                        : 'bg-tertiary-fixed-dim';
                      return (
                        <div
                          key={seg.segment_id}
                          className={`absolute h-2 ${bgColor} ${i === 0 ? 'rounded-l-full' : ''} ${i === risks.length - 1 ? 'rounded-r-full' : ''}`}
                          style={{ left: `${i * width}%`, width: `${width}%` }}
                        ></div>
                      );
                    })}
                  </div>

                  {/* Segment Nodes */}
                  <div className={`grid gap-space-xs text-left pt-space-xs`} style={{ gridTemplateColumns: `repeat(${Math.min(risks.length, 6)}, 1fr)` }}>
                    {risks.slice(0, 6).map(seg => {
                      const rl = riskLevel(seg.risk_30d);
                      const isCrit = rl.label === 'CRITICAL';
                      const isHigh = rl.label === 'HIGH' || isCrit;
                      return (
                        <div
                          key={seg.segment_id}
                          className={`flex flex-col gap-0.5 cursor-pointer p-1 rounded transition-colors ${
                            isCrit ? 'bg-error-container/40' : ''
                          } ${selectedNode === seg.segment_id ? `ring-2 ring-${rl.color} bg-surface-container-low` : ''}`}
                          onClick={() => inspectNode(seg.segment_id)}
                        >
                          <div className="flex items-center gap-1">
                            <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${
                              isCrit ? 'bg-error animate-pulse' : isHigh ? 'bg-secondary' : 'bg-tertiary-container'
                            }`}></span>
                            <span className={`font-code-lg text-code-lg font-bold ${isCrit ? 'text-error' : 'text-on-surface'}`}>
                              {seg.segment_id.replace('SEG-', '').slice(0, 8)}
                            </span>
                          </div>
                          <span className={`font-label-caps text-label-caps font-semibold ${
                            isCrit ? 'text-error font-bold' : isHigh ? 'text-on-secondary-fixed-variant' : 'text-on-tertiary-container'
                          }`}>
                            Risk: {(seg.risk_30d * 100).toFixed(1)}% • {rl.label}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                            {seg.corridor || seg.division || '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Critical Alerts — from real risk segments */}
          {criticalSegments.length > 0 && (
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-error">notifications_active</span>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Critical Risk Alerts (ML Predictions)</h2>
                </div>
                <span className="font-label-caps text-label-caps bg-error text-on-error px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  {criticalSegments.length} CRITICAL
                </span>
              </div>

              {criticalSegments.slice(0, 3).map(seg => (
                <div key={seg.segment_id} className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm border-l-4 border-l-error">
                  <div className="flex items-start gap-space-sm min-w-0">
                    <div className="p-1 bg-error-container text-on-error-container rounded shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">fmd_bad</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-xs flex-wrap">
                        <span className="font-label-caps text-label-caps bg-error text-on-error px-1 rounded uppercase font-bold">
                          CRITICAL RISK
                        </span>
                        <span className="font-code-sm text-code-sm font-bold text-on-surface">{seg.segment_id}</span>
                        <span className="font-code-sm text-code-sm text-secondary font-medium">
                          | Risk: {(seg.risk_30d * 100).toFixed(1)}% | Downtime: {seg.expected_downtime_days?.toFixed(1)}d
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 w-full md:w-auto justify-end">
                    <Link
                      to="/segment-why"
                      className="bg-surface-container hover:bg-surface-container-highest text-on-surface px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold"
                    >
                      VIEW DETAILS
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
              ))}
            </div>
          )}

          {/* Maintenance Schedule Table — from real plan assignments */}
          <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px] text-secondary">handyman</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Maintenance Operational Windows</h2>
              </div>
              <div className="flex items-center gap-space-sm">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  {plan ? `PLAN: ${plan.plan_id}` : 'NO ACTIVE PLAN'}
                </span>
                <button onClick={loadDashboardData} className="text-primary hover:text-on-surface flex items-center font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                    <th className="py-space-xs px-space-sm font-bold">Task ID</th>
                    <th className="py-space-xs px-space-sm font-bold">Dept</th>
                    <th className="py-space-xs px-space-sm font-bold">Segment</th>
                    <th className="py-space-xs px-space-sm font-bold">Time Window</th>
                    <th className="py-space-xs px-space-sm font-bold">Duration</th>
                    <th className="py-space-xs px-space-sm font-bold">Risk</th>
                    <th className="py-space-xs px-space-sm font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-space-md px-space-sm text-center text-on-surface-variant">
                        {plan ? 'No assignments match the current filter.' : 'No plan generated yet. Click "GENERATE OPTIMIZATION" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((a, i) => (
                      <tr key={a.task_id + i} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-space-sm px-space-sm font-bold text-primary">{a.task_id}</td>
                        <td className="py-space-sm px-space-sm">
                          <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                            {a.department}
                          </span>
                        </td>
                        <td className="py-space-sm px-space-sm font-semibold text-on-surface">{a.segment_id}</td>
                        <td className="py-space-sm px-space-sm text-on-surface">
                          {formatTime(a.block_start)} - {formatTime(a.block_end)}
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface-variant">{formatDuration(a.duration_hrs)}</td>
                        <td className="py-space-sm px-space-sm text-on-surface-variant">
                          {a.risk_30d != null ? `${(a.risk_30d * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td className="py-space-sm px-space-sm text-right">
                          <span className="bg-tertiary-fixed text-on-tertiary-fixed px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold">
                            SCHEDULED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-space-xs text-secondary">
              <span className="font-body-sm text-body-sm">
                Showing {filteredAssignments.length} of {assignments.length} assignments
                {plan && ` • Policy: ${plan.policy}`}
              </span>
              <Link to="/planner" className="font-code-sm text-code-sm text-primary font-bold hover:underline flex items-center gap-0.5">
                FULL BLOCK PLANNER
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
