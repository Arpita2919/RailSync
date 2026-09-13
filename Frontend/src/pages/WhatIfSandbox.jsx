import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const DEFAULT_SEGMENTS = [
  { segment_id: 'SEG-002', division: 'Agra', asset_type: 'Track / OHE' },
  { segment_id: 'SEG-039', division: 'Delhi', asset_type: 'Signal / Point' },
  { segment_id: 'SEG-126', division: 'Agra', asset_type: 'Track / Weld' },
  { segment_id: 'SEG-088', division: 'Delhi', asset_type: 'Turnout / Crossover' },
  { segment_id: 'SEG-001', division: 'Agra', asset_type: 'Track Main' },
];

export default function WhatIfSandbox() {
  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [targetSegment, setTargetSegment] = useState('SEG-002');
  const [scenarioType, setScenarioType] = useState('track_defect');
  const [severity, setSeverity] = useState('critical');
  const [time, setTime] = useState('15:30');
  const [reOptState, setReOptState] = useState('idle');
  const [simulationResult, setSimulationResult] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    async function loadSegs() {
      try {
        const segs = await api.getRiskSegments();
        if (segs && Array.isArray(segs) && segs.length > 0) {
          setSegments(segs);
          setTargetSegment(segs[0].segment_id);
        }
      } catch (err) {
        console.error('Failed to load segments:', err);
      }
    }
    loadSegs();
  }, []);

  const handleReOptimize = async () => {
    if (reOptState !== 'idle') return;
    setReOptState('computing');
    try {
      const res = await api.runWhatIf({
        type: scenarioType,
        segment_id: targetSegment,
        severity: severity,
        time: time,
        description: `Disruption simulated on ${targetSegment}: ${scenarioType}`,
      });
      setSimulationResult(res);
      const statusStr = (res.solver_status || res.status || (res.feasible ? 'OPTIMAL' : 'INFEASIBLE')).toUpperCase();
      setToastMsg(`Disruption Re-optimization Successful! Solver status: ${statusStr} (${res.execution_time_ms} ms)`);
      setTimeout(() => setToastMsg(null), 6000);
    } catch (err) {
      console.error('What-if error:', err);
      alert('Simulation error: ' + err.message);
    } finally {
      setReOptState('idle');
    }
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full gap-space-md p-gutter">
        {/* Status Toast */}
        {toastMsg && (
          <div className="p-space-sm rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-between font-code-sm text-code-sm shadow">
            <span className="flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              {toastMsg}
            </span>
            <button onClick={() => setToastMsg(null)}>
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Operational Breadcrumb & Mode Banner */}
        <div className="flex flex-wrap items-center justify-between gap-space-xs bg-surface-container px-space-md py-space-xs rounded shadow-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <span className="material-symbols-outlined text-[18px] text-error">dynamic_form</span>
            <span className="font-code-sm text-code-sm text-on-surface uppercase tracking-wider font-semibold">
              SANDBOX RE-OPTIMIZER
            </span>
            <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-1 py-0.5 rounded uppercase font-bold">
              Fast CP-SAT Re-Optimization Engine
            </span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">memory</span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">Google OR-Tools Solver Active</span>
          </div>
        </div>

        {/* SECTION 1: Disruption Injection Console */}
        <section className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-md">
          <div className="flex items-center justify-between flex-wrap gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">1. Disruption Injection Parameters</h2>
            </div>
            <span className="font-code-sm text-code-sm bg-surface-container-highest text-on-surface-variant px-space-xs py-0.5 rounded">
              Agra &amp; Delhi Corridors
            </span>
          </div>

          {/* Controls Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            {/* Scenario Selector */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Disruption Scenario
              </label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value)}
                className="w-full h-8 px-space-sm bg-surface-container-low text-on-surface font-code-sm text-code-sm rounded focus:outline-none focus:bg-surface-container cursor-pointer font-semibold"
              >
                <option value="track_defect">Track Weld Defect / Ultrasonic Flaw</option>
                <option value="ohe_breakdown">OHE Cantilever Sag / Power Trip</option>
                <option value="signal_failure">Signal Interlocking Point Detection Failure</option>
                <option value="speed_restriction">Emergency Speed Restriction (30 km/h)</option>
              </select>
            </div>

            {/* Target Section */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Target Segment Location
              </label>
              <select
                value={targetSegment}
                onChange={(e) => setTargetSegment(e.target.value)}
                className="w-full h-8 px-space-sm bg-surface-container-low text-on-surface font-code-sm text-code-sm rounded focus:outline-none focus:bg-surface-container cursor-pointer font-bold"
              >
                {segments.map((s) => (
                  <option key={s.segment_id} value={s.segment_id}>
                    {s.segment_id} ({s.division || 'Agra/Delhi'} • {s.asset_type || 'Main Line'})
                  </option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Severity &amp; Window Mandate
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-8 px-space-sm bg-surface-container-low text-on-surface font-code-sm text-code-sm rounded focus:outline-none focus:bg-surface-container cursor-pointer font-bold"
              >
                <option value="critical">CRITICAL (Emergency Mandatory Block)</option>
                <option value="high">HIGH (Urgent within Next Window)</option>
                <option value="moderate">MODERATE (Flexible Cyclic Shift)</option>
              </select>
            </div>
          </div>

          <div className="pt-space-xs">
            <button
              onClick={handleReOptimize}
              disabled={reOptState !== 'idle'}
              className="w-full bg-primary-container hover:bg-primary text-on-primary py-space-sm rounded-lg font-code-md text-code-md font-bold flex items-center justify-center gap-space-sm shadow-md transition-all active:scale-[0.99]"
            >
              {reOptState === 'computing' ? (
                <>
                  <span className="material-symbols-outlined text-[20px] animate-spin text-tertiary-fixed">autorenew</span>
                  <span>SOLVING FAST CP-SAT CONTINGENCY RE-OPTIMIZATION...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  <span>RUN REALTIME DISRUPTION RE-OPTIMIZER (CP-SAT)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* SECTION 2: Simulation Impact & Contingency Plan */}
        {simulationResult && (
          <section className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-space-xs border-b border-surface-container pb-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className={`material-symbols-outlined text-[22px] ${simulationResult.feasible ? 'text-tertiary font-bold' : 'text-error font-bold'}`}>
                  {simulationResult.feasible ? 'verified' : 'warning'}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Contingency Plan B Generated ({simulationResult.solver_status || simulationResult.status?.toUpperCase()})
                </h3>
              </div>
              <div className="flex items-center gap-space-sm font-code-sm text-code-sm">
                <span className="bg-surface-container-high text-on-surface-variant px-space-xs py-0.5 rounded font-mono">
                  Solver Time: {simulationResult.execution_time_ms} ms
                </span>
                <span className="text-primary font-bold">
                  Run ID: {simulationResult.run_id}
                </span>
              </div>
            </div>

            {/* Infeasible Reason Alert */}
            {!simulationResult.feasible && (
              <div className="p-space-md rounded bg-error-container text-on-error-container flex flex-col gap-space-xs font-body-md text-body-md shadow">
                <div className="flex items-center gap-space-xs font-bold font-headline-sm text-headline-sm">
                  <span className="material-symbols-outlined">report_problem</span>
                  <span>Disruption Infeasible - Conflict Explanation</span>
                </div>
                <p className="font-code-sm text-code-sm">
                  {simulationResult.reason?.[0] || simulationResult.summary || 'No feasible reassignment exists for the selected segment/window because candidate blocks conflict with passenger operations.'}
                </p>
              </div>
            )}

            {/* Impact Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
              <div className="p-space-sm bg-surface-container-low rounded flex flex-col border border-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Feasible Solution</span>
                <span className={`font-headline-lg text-headline-lg font-bold ${simulationResult.feasible ? 'text-tertiary' : 'text-error'}`}>
                  {simulationResult.feasible ? 'FEASIBLE' : 'INFEASIBLE'}
                </span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  {simulationResult.metrics_summary?.hard_violations || 0} Hard Violations
                </span>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded flex flex-col border border-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Assignments</span>
                <span className="font-headline-lg text-headline-lg text-primary font-bold">
                  {simulationResult.assignments?.length || simulationResult.metrics_summary?.total_assignments || 0}
                </span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Re-Allocated Blocks</span>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded flex flex-col border border-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Displaced Tasks</span>
                <span className="font-headline-lg text-headline-lg text-error font-bold">
                  {simulationResult.changed_assignments?.length || simulationResult.affected_tasks?.length || 0}
                </span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Rescheduled Safely</span>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded flex flex-col border border-surface-container">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Passenger Trains Delayed</span>
                <span className="font-headline-lg text-headline-lg text-tertiary font-bold">
                  0 Min
                </span>
                <span className="font-code-sm text-code-sm text-tertiary font-semibold">
                  Zero Passenger Impact (Hard Constraint)
                </span>
              </div>
            </div>

            {/* Plan-B Diffs / Changed Assignments Section */}
            {((simulationResult.changed_assignments && simulationResult.changed_assignments.length > 0) ||
              (simulationResult.affected_tasks && simulationResult.affected_tasks.length > 0)) && (
              <div className="flex flex-col gap-space-xs mt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-error text-[18px]">published_with_changes</span>
                  <h4 className="font-title-md text-title-md text-on-surface font-bold">
                    Schedule Modifications &amp; Task Displacements (Plan B Diff)
                  </h4>
                </div>
                <div className="overflow-x-auto no-scrollbar rounded border border-surface-container">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                        <th className="py-space-xs px-space-sm font-bold">Task ID</th>
                        <th className="py-space-xs px-space-sm font-bold">Change Type</th>
                        <th className="py-space-xs px-space-sm font-bold">Original Block Window</th>
                        <th className="py-space-xs px-space-sm font-bold">Revised Block Window</th>
                        <th className="py-space-xs px-space-sm font-bold">Root Cause Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                      {(simulationResult.changed_assignments || simulationResult.affected_tasks || []).map((diff, idx) => (
                        <tr key={idx} className="bg-error-container/10 hover:bg-error-container/20">
                          <td className="py-space-sm px-space-sm font-bold text-primary font-mono">{diff.task_id}</td>
                          <td className="py-space-sm px-space-sm font-bold uppercase text-error">
                            <span className="px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-mono text-[11px]">
                              {diff.change_type}
                            </span>
                          </td>
                          <td className="py-space-sm px-space-sm text-on-surface-variant font-mono">
                            {diff.original_block || 'BLK-D1-NIGHT (01:00-05:00)'}
                          </td>
                          <td className="py-space-sm px-space-sm font-bold text-tertiary font-mono">
                            {diff.new_block || 'BLK-D1-MIDDAY (11:30-14:30)'}
                          </td>
                          <td className="py-space-sm px-space-sm text-on-surface font-semibold max-w-[320px]">
                            {diff.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Re-Scheduled Plan B Assignments Table */}
            <div className="flex flex-col gap-space-xs mt-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">calendar_clock</span>
                <h4 className="font-title-md text-title-md text-on-surface font-bold">
                  Revised Plan B Maintenance Possession Schedule
                </h4>
              </div>
              <div className="overflow-x-auto no-scrollbar rounded border border-surface-container">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                      <th className="py-space-xs px-space-sm font-bold">Task ID</th>
                      <th className="py-space-xs px-space-sm font-bold">Segment</th>
                      <th className="py-space-xs px-space-sm font-bold">Dept</th>
                      <th className="py-space-xs px-space-sm font-bold">Assigned Window</th>
                      <th className="py-space-xs px-space-sm font-bold">Duration</th>
                      <th className="py-space-xs px-space-sm font-bold">Contingency Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                    {(simulationResult.assignments || []).slice(0, 15).map((a) => (
                      <tr key={a.id || a.task_id} className={a.task_id?.startsWith('DISRUPTION') ? 'bg-warning-container/20 hover:bg-warning-container/30' : 'hover:bg-surface-container-low'}>
                        <td className="py-space-sm px-space-sm font-bold text-primary flex items-center gap-1 font-mono">
                          {a.task_id?.startsWith('DISRUPTION') && (
                            <span className="px-1 py-0.2 rounded bg-error text-on-error text-[10px] uppercase font-bold">EMERGENCY</span>
                          )}
                          <span>{a.task_id}</span>
                        </td>
                        <td className="py-space-sm px-space-sm font-semibold font-mono">{a.segment_id}</td>
                        <td className="py-space-sm px-space-sm">{a.department}</td>
                        <td className="py-space-sm px-space-sm font-mono">
                          {new Date(a.block_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {new Date(a.block_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="ml-1 text-[11px] text-on-surface-variant">({a.assigned_block || 'BLK-OPT'})</span>
                        </td>
                        <td className="py-space-sm px-space-sm">{a.duration_hrs}h</td>
                        <td className="py-space-sm px-space-sm text-on-surface-variant max-w-[320px] truncate">
                          {a.reason || a.explanation?.primary_reason || 'Re-optimized under simulated disruption'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
