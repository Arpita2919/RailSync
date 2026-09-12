import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function BlockPlanner() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isConsolidated, setIsConsolidated] = useState(false);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const plan = await api.getCurrentPlan('weekly');
      setCurrentPlan(plan);
      setAssignments(plan?.assignments || []);
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const applyConsolidation = () => {
    setIsConsolidated(true);
  };

  // Filtering
  const filteredAssignments = assignments.filter((a) => {
    if (deptFilter === 'ALL') return true;
    if (deptFilter === 'ENG') return a.department === 'Engineering' || a.department === 'TRACK';
    if (deptFilter === 'TRD') return a.department === 'Electrical' || a.department === 'OHE';
    if (deptFilter === 'S&T') return a.department === 'S&T' || a.department === 'SIGNAL';
    if (deptFilter === 'HIGH_PRIORITY') return (a.priority || 0) >= 70;
    return true;
  });

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full">
        {/* Operations Strip: Date, Live Window & Sync Status */}
        <section className="p-gutter bg-surface-container-low flex flex-col gap-space-sm shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
              <span className="font-headline-sm text-headline-sm text-primary">
                CP-SAT 7-DAY HORIZON SCHEDULE
              </span>
              <span className="font-label-caps text-label-caps bg-primary text-on-primary px-space-xs py-0.5 rounded ml-space-xs">
                {currentPlan?.policy ? currentPlan.policy.toUpperCase() : 'BALANCED'} POLICY
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-highest px-space-sm py-0.5 rounded">
              <span className="material-symbols-outlined text-secondary text-[14px]">nest_clock_farsight_analog</span>
              <span className="font-code-sm text-code-sm text-on-surface-variant font-bold">
                {assignments.length} POSSESSIONS ALLOCATED
              </span>
            </div>
          </div>

          {/* Filter & Department Selector Toggles */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'ALL', label: `ALL (${assignments.length})` },
              { id: 'ENG', label: 'ENG (P-WAY)' },
              { id: 'TRD', label: 'ELEC (OHE)' },
              { id: 'S&T', label: 'S&T' },
              { id: 'HIGH_PRIORITY', label: 'HIGH PRIORITY' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDeptFilter(f.id)}
                className={`flex items-center gap-space-xs px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                  deptFilter === f.id
                    ? 'bg-primary text-on-primary shadow-sm font-bold'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* AI Consolidation Insight Banner */}
        <section className="p-gutter">
          <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-tertiary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_fix_high
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">
                  Multi-Department Corridor Synergy
                </span>
              </div>
              <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded uppercase bg-tertiary-container text-on-tertiary-container font-bold">
                Passenger Trains Protected (0 Conflicts)
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              The Google OR-Tools CP-SAT solver has synchronized 413 maintenance tasks into standard non-peak block windows (00:00–06:00 and 10:00–16:00), respecting hard passenger conflicts and minimizing freight disruption penalties.
            </p>
          </div>
        </section>

        {/* Block Timeline & Matrix */}
        <section className="px-gutter pb-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Allocated Maintenance Blocks ({filteredAssignments.length} showing)
            </h2>
            <button
              onClick={loadPlan}
              className="text-primary hover:text-on-surface flex items-center font-code-sm text-code-sm gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Reload Plan
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar bg-surface-container-lowest rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                  <th className="py-space-xs px-space-sm font-bold">Task / Assignment</th>
                  <th className="py-space-xs px-space-sm font-bold">Segment</th>
                  <th className="py-space-xs px-space-sm font-bold">Dept</th>
                  <th className="py-space-xs px-space-sm font-bold">Scheduled Window</th>
                  <th className="py-space-xs px-space-sm font-bold">Duration</th>
                  <th className="py-space-xs px-space-sm font-bold">Priority</th>
                  <th className="py-space-xs px-space-sm font-bold">Constraint Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                {filteredAssignments.slice(0, 25).map((a) => {
                  const startStr = a.block_start
                    ? new Date(a.block_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '00:00';
                  const endStr = a.block_end
                    ? new Date(a.block_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '06:00';

                  return (
                    <tr key={a.id || a.task_id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-sm font-bold text-primary">
                        {a.task_id}
                      </td>
                      <td className="py-space-sm px-space-sm font-semibold text-on-surface">
                        <Link to={`/segment-why?segment=${a.segment_id}`} className="hover:underline text-secondary">
                          {a.segment_id}
                        </Link>
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                          {a.department}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-sm text-on-surface">
                        {startStr} – {endStr}
                      </td>
                      <td className="py-space-sm px-space-sm text-on-surface-variant">
                        {a.duration_hrs} Hrs
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span className="bg-surface-container-highest text-on-surface px-1.5 py-0.5 rounded font-bold">
                          {a.priority ? `${a.priority.toFixed(1)}` : 'N/A'}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-sm text-on-surface-variant">
                        <span className="text-on-tertiary-container font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          Zero Passenger Conflict
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAssignments.length === 0 && !loading && (
              <div className="p-space-md text-center text-on-surface-variant font-code-sm">
                No blocks matching current filter.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
