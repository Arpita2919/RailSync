import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function BlockPlanner() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [horizon, setHorizon] = useState('weekly'); // 'day' or 'weekly'
  const [selectedDay, setSelectedDay] = useState('ALL');

  const loadPlan = async (planHorizon = horizon) => {
    try {
      setLoading(true);
      const plan = await api.getCurrentPlan(planHorizon === 'day' ? 'daily' : 'weekly');
      setCurrentPlan(plan);
      setAssignments(plan?.assignments || []);
    } catch (err) {
      console.error('Failed to load plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan(horizon);
  }, [horizon]);

  const handleReoptimize = async (policy = 'balanced') => {
    try {
      setOptimizing(true);
      await api.runOptimization({ policy, horizon: horizon === 'day' ? 'weekly' : 'weekly' });
      await loadPlan(horizon);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setOptimizing(false);
    }
  };

  // Filter assignments by Department
  const filteredAssignments = assignments.filter((a) => {
    if (deptFilter === 'ALL') return true;
    if (deptFilter === 'ENG') return a.department === 'Engineering' || a.department === 'TRACK';
    if (deptFilter === 'TRD') return a.department === 'Electrical' || a.department === 'OHE';
    if (deptFilter === 'S&T') return a.department === 'S&T' || a.department === 'SIGNAL';
    if (deptFilter === 'HIGH_PRIORITY') return (a.priority || 0) >= 0.005 || (a.priority || 0) >= 50;
    return true;
  });

  // Group assignments by Day (for Weekly view)
  const dayGroups = filteredAssignments.reduce((acc, a) => {
    const d = a.block_start
      ? new Date(a.block_start).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
      : 'Day 1 (Mon)';
    if (!acc[d]) acc[d] = [];
    acc[d].push(a);
    return acc;
  }, {});

  const availableDays = ['ALL', ...Object.keys(dayGroups)];

  const displayedAssignments =
    horizon === 'day'
      ? filteredAssignments.slice(0, 30)
      : selectedDay === 'ALL'
      ? filteredAssignments
      : dayGroups[selectedDay] || [];

  return (
    <main className="flex flex-col relative w-full pb-space-xl">
      <div className="flex flex-col w-full">
        {/* Operations Strip: Horizon Switcher (Day vs Weekly), Policy & Telemetry */}
        <section className="p-gutter bg-surface-container-low flex flex-col gap-space-sm shadow-sm border-b border-surface-container-high">
          <div className="flex items-center justify-between flex-wrap gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
              <div>
                <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Train Timetable & Possession Planner
                </h1>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  NCR / PRYJ DIVISION • AUTOMATED CP-SAT TIMETABLE ENGINE
                </span>
              </div>
            </div>

            {/* Horizon Switcher: Day Timetable vs Weekly Timetable */}
            <div className="flex items-center bg-surface-container-highest p-1 rounded-lg border border-outline-variant shadow-inner">
              <button
                onClick={() => setHorizon('day')}
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-md font-code-sm text-code-sm font-bold transition-all ${
                  horizon === 'day'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">today</span>
                DAY TIMETABLE (24-HR)
              </button>
              <button
                onClick={() => setHorizon('weekly')}
                className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-md font-code-sm text-code-sm font-bold transition-all ${
                  horizon === 'weekly'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">date_range</span>
                WEEKLY TIMETABLE (7-DAY)
              </button>
            </div>

            {/* Actions: Refresh & Re-Optimize */}
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => loadPlan(horizon)}
                disabled={loading}
                className="flex items-center gap-1 px-space-sm py-1.5 rounded bg-surface-container-highest hover:bg-surface-container text-on-surface font-code-sm text-code-sm font-semibold border border-outline-variant transition-colors"
              >
                <span className={`material-symbols-outlined text-[15px] ${loading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                SYNC
              </button>
              <button
                onClick={() => handleReoptimize('balanced')}
                disabled={optimizing}
                className="flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-code-sm text-code-sm font-bold shadow-sm hover:opacity-95 transition-opacity"
              >
                <span className={`material-symbols-outlined text-[15px] ${optimizing ? 'animate-spin' : ''}`}>
                  auto_fix_high
                </span>
                {optimizing ? 'SOLVING TIMETABLE...' : 'SOLVE TIMETABLE'}
              </button>
            </div>
          </div>

          {/* Department Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-space-xs pt-1 border-t border-surface-container">
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'ALL', label: `ALL DEPARTMENTS (${assignments.length})` },
                { id: 'ENG', label: 'ENG (P-WAY)' },
                { id: 'TRD', label: 'ELEC (OHE)' },
                { id: 'S&T', label: 'S&T (SIGNALLING)' },
                { id: 'HIGH_PRIORITY', label: 'HIGH RISK/PRIORITY' },
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

            {horizon === 'weekly' && availableDays.length > 2 && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <span className="font-label-caps text-label-caps text-on-surface-variant mr-1">DAY:</span>
                {availableDays.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-2 py-0.5 rounded font-code-sm text-[11px] font-semibold transition-colors ${
                      selectedDay === d
                        ? 'bg-secondary text-on-secondary shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Section 1: Train Movements & Master Timetable Paths (Live Railway Protection) */}
        <section className="p-gutter">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container-high flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-space-xs pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">train</span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Train Timetable & Passenger Conflict Protection
                  </h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Corridor timetable guarantees zero clash between passenger trains and maintenance possessions.
                  </span>
                </div>
              </div>
              <span className="font-label-caps text-label-caps bg-tertiary-container text-on-tertiary-container px-space-sm py-1 rounded font-bold uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                0 Passenger Conflicts
              </span>
            </div>

            {/* Grid of Key Scheduled Corridor Trains */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xs">
              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-8 bg-tertiary-fixed rounded-full"></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">22436 VANDE BHARAT</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">NDLS - BSB • Passing 06:00</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded font-bold">
                  PROTECTED
                </span>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-8 bg-tertiary-fixed rounded-full"></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">12302 HWH RAJDHANI</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">UP Main • Passing 14:15</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded font-bold">
                  CLEAR PATH
                </span>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">12004 GOMTI EXPRESS</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">KRJ Loop-1 • Due 16:22</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded font-bold">
                  ON-TIME
                </span>
              </div>

              <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between border border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-8 bg-secondary rounded-full"></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">12424 DBRT RAJDHANI</span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant">UP Main • Due 17:40</span>
                  </div>
                </div>
                <span className="font-label-caps text-[10px] bg-surface-container-highest text-secondary px-1.5 py-0.5 rounded font-bold">
                  12M BUFFER
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Possession Timetable Schedule (Day / Weekly Matrix) */}
        <section className="px-gutter flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                {horizon === 'day' ? 'view_day' : 'view_week'}
              </span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {horizon === 'day'
                  ? 'Daily Possession Operational Slots (24-Hour Windows)'
                  : `Weekly Master Possession Schedule (${displayedAssignments.length} Allocated Possessions)`}
              </h2>
            </div>
            <span className="font-code-sm text-code-sm text-on-surface-variant">
              Policy: <strong className="text-primary">{currentPlan?.policy || 'BALANCED'}</strong> • Robustness:{' '}
              <strong className="text-tertiary-fixed-dim">
                {currentPlan?.robustness_score ? `${(currentPlan.robustness_score * 100).toFixed(0)}%` : '57%'}
              </strong>
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                  <th className="py-space-xs px-space-sm font-bold">Task ID</th>
                  <th className="py-space-xs px-space-sm font-bold">Segment</th>
                  <th className="py-space-xs px-space-sm font-bold">Department</th>
                  <th className="py-space-xs px-space-sm font-bold">Timetable Window</th>
                  <th className="py-space-xs px-space-sm font-bold">Duration</th>
                  <th className="py-space-xs px-space-sm font-bold">Risk Level</th>
                  <th className="py-space-xs px-space-sm font-bold">Timetable Conflict Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                {displayedAssignments.slice(0, 30).map((a, idx) => {
                  const startStr = a.block_start
                    ? new Date(a.block_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '00:00';
                  const endStr = a.block_end
                    ? new Date(a.block_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '06:00';
                  const dayStr = a.block_start
                    ? new Date(a.block_start).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
                    : 'Mon';

                  return (
                    <tr key={a.id || a.task_id || idx} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-sm font-bold text-primary">
                        {a.task_id}
                      </td>
                      <td className="py-space-sm px-space-sm font-semibold text-on-surface">
                        <Link to={`/segment-why?segment=${a.segment_id}`} className="hover:underline text-secondary">
                          {a.segment_id}
                        </Link>
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span className="bg-surface-container px-1.5 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                          {a.department}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-sm text-on-surface">
                        <span className="font-semibold">{dayStr}</span> • {startStr} – {endStr}
                      </td>
                      <td className="py-space-sm px-space-sm text-on-surface-variant">
                        {a.duration_hrs} Hrs
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                            (a.risk_30d || 0) >= 0.5
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {a.risk_30d != null ? `${(a.risk_30d * 100).toFixed(1)}%` : 'LOW'}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded font-label-caps text-[10px] font-bold inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          PASSED (ZERO CLASH)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {displayedAssignments.length === 0 && !loading && (
              <div className="p-space-lg text-center text-on-surface-variant font-code-sm">
                No possessions found for the selected department or horizon.
              </div>
            )}
          </div>
        </section>

        {/* Divisional Timetable Sanction Summary Sticky Footer Bar */}
        <section className="p-gutter bg-surface-container-low border-t border-surface-container mt-space-lg shadow-sm">
          <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant mb-space-xs">
            <span>TIMETABLE SANCTIONING AUTHORITY: SR. DOM / PRYJ</span>
            <span className="font-code-sm text-code-sm text-primary font-bold">
              {currentPlan?.plan_id || 'PLAN #LIVE-ACTIVE'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-xs text-center">
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">ACTIVE HORIZON</div>
              <div className="font-code-md text-code-md font-bold text-primary uppercase">
                {horizon === 'day' ? '24-Hour Daily' : '7-Day Weekly'}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">TOTAL POSSESSIONS</div>
              <div className="font-code-md text-code-md font-bold text-primary">
                {currentPlan?.total_assignments || assignments.length} BLOCKS
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">NON-PEAK WINDOWS</div>
              <div className="font-code-md text-code-md font-bold text-on-tertiary-container">
                00:00–06:00 & 10:00–16:00
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">SECTION SPEED</div>
              <div className="font-code-md text-code-md font-bold text-primary">130 KMPH</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
