import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const PRIORITY_COLORS = {
  rajdhani: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', label: 'RAJDHANI' },
  shatabdi: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', label: 'SHATABDI' },
  vande_bharat: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', label: 'VANDE BHARAT' },
  superfast: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', label: 'SUPERFAST' },
  express: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'EXPRESS' },
  mail: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'MAIL' },
  passenger: { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', label: 'PASSENGER' },
  goods: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', label: 'GOODS' },
};

const SOURCE_BADGE = {
  railgadi_api: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'LIVE API' },
  published_fixture: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'IR PUBLISHED' },
  fixture: { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'FIXTURE' },
};

export default function BlockPlanner() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [horizon, setHorizon] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState('ALL');

  // RailGadi live timetable state
  const [activeTab, setActiveTab] = useState('timetable'); // 'timetable' | 'blocks' | 'planner'
  const [liveTimetable, setLiveTimetable] = useState(null);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState(null);
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [blockTypeFilter, setBlockTypeFilter] = useState('ALL');

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

  const fetchLiveTimetable = useCallback(async () => {
    try {
      setTimetableLoading(true);
      setTimetableError(null);
      const data = await api.getLiveTimetable(7);
      setLiveTimetable(data);
    } catch (err) {
      console.error('Failed to fetch live timetable:', err);
      setTimetableError(err.message || 'Failed to fetch timetable');
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan(horizon);
    fetchLiveTimetable();
  }, [horizon]);

  const handleReoptimize = async (policy = 'balanced') => {
    try {
      setOptimizing(true);
      await api.runOptimization({ policy, horizon: 'weekly' });
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

  // Group assignments by Day
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

  // Filter maintenance blocks
  const maintenanceBlocks = liveTimetable?.maintenance_blocks || [];
  const filteredBlocks = maintenanceBlocks.filter((b) => {
    if (segmentFilter !== 'ALL' && b.segment_id !== segmentFilter) return false;
    if (blockTypeFilter !== 'ALL' && b.window_type !== blockTypeFilter) return false;
    return true;
  });

  const segments = [...new Set(maintenanceBlocks.map((b) => b.segment_id))].sort();

  const summary = liveTimetable?.summary || {};

  return (
    <main className="flex flex-col relative w-full pb-space-xl">
      <div className="flex flex-col w-full">
        {/* Header Strip */}
        <section className="p-gutter bg-surface-container-low flex flex-col gap-space-sm shadow-sm border-b border-surface-container-high">
          <div className="flex items-center justify-between flex-wrap gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
              <div>
                <h1 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Train Timetable & Possession Planner
                </h1>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  RAILGADI LIVE FEED • NCR / PRYJ DIVISION • AUTOMATED CP-SAT ENGINE
                </span>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-surface-container-highest p-1 rounded-lg border border-outline-variant shadow-inner">
              {[
                { id: 'timetable', label: 'TRAIN TIMETABLE', icon: 'train' },
                { id: 'blocks', label: 'MAINTENANCE BLOCKS', icon: 'construction' },
                { id: 'planner', label: 'POSSESSION PLANNER', icon: 'event_note' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-space-md py-1.5 rounded-md font-code-sm text-code-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-space-xs">
              <button
                onClick={fetchLiveTimetable}
                disabled={timetableLoading}
                className="flex items-center gap-1 px-space-sm py-1.5 rounded bg-surface-container-highest hover:bg-surface-container text-on-surface font-code-sm text-code-sm font-semibold border border-outline-variant transition-colors"
              >
                <span className={`material-symbols-outlined text-[15px] ${timetableLoading ? 'animate-spin' : ''}`}>
                  {timetableLoading ? 'progress_activity' : 'cell_tower'}
                </span>
                {timetableLoading ? 'FETCHING...' : 'FETCH RAILGADI'}
              </button>
              <button
                onClick={() => handleReoptimize('balanced')}
                disabled={optimizing}
                className="flex items-center gap-1 px-space-md py-1.5 rounded bg-primary text-on-primary font-code-sm text-code-sm font-bold shadow-sm hover:opacity-95 transition-opacity"
              >
                <span className={`material-symbols-outlined text-[15px] ${optimizing ? 'animate-spin' : ''}`}>
                  auto_fix_high
                </span>
                {optimizing ? 'SOLVING...' : 'SOLVE TIMETABLE'}
              </button>
            </div>
          </div>

          {/* Summary Stats Bar */}
          {liveTimetable && (
            <div className="flex items-center gap-space-md flex-wrap pt-1 border-t border-surface-container">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  <strong className="text-emerald-400">{summary.fetched_from_api || 0}</strong> Live API
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  <strong className="text-blue-400">{summary.from_fixtures || 0}</strong> Published
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">train</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  <strong className="text-primary">{summary.total_trains || 0}</strong> Trains
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">construction</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  <strong className="text-secondary">{summary.total_maintenance_blocks || 0}</strong> Maint. Blocks
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">schedule</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">
                  <strong className="text-tertiary-fixed">{summary.total_block_hours || 0}</strong> Block Hours
                </span>
              </div>
              {summary.execution_time_ms && (
                <span className="font-code-sm text-[11px] text-on-surface-variant ml-auto">
                  ⚡ {summary.execution_time_ms}ms
                </span>
              )}
            </div>
          )}
        </section>

        {/* ═══ TAB 1: LIVE TRAIN TIMETABLE ═══ */}
        {activeTab === 'timetable' && (
          <section className="px-gutter pt-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">train</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Live Corridor Train Schedule
                </h2>
              </div>
              <span className="font-code-sm text-code-sm text-on-surface-variant">
                Delhi–Mumbai Rajdhani Corridor •{' '}
                <strong className="text-primary">{liveTimetable?.trains?.length || 0}</strong> trains tracked
              </span>
            </div>

            {timetableError && (
              <div className="bg-error-container/30 text-on-error-container p-space-sm rounded-lg border border-error/20 font-code-sm text-code-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                API Error: {timetableError} — Showing published IR fixture data.
              </div>
            )}

            {timetableLoading && !liveTimetable ? (
              <div className="flex items-center justify-center py-space-xl">
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">
                    Connecting to RailGadi API...
                  </span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                      <th className="py-space-xs px-space-sm font-bold">Train No.</th>
                      <th className="py-space-xs px-space-sm font-bold">Train Name</th>
                      <th className="py-space-xs px-space-sm font-bold">Priority</th>
                      <th className="py-space-xs px-space-sm font-bold">Route</th>
                      <th className="py-space-xs px-space-sm font-bold">Departure</th>
                      <th className="py-space-xs px-space-sm font-bold">Arrival</th>
                      <th className="py-space-xs px-space-sm font-bold">Segments</th>
                      <th className="py-space-xs px-space-sm font-bold">Source</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                    {(liveTimetable?.trains || []).map((train, idx) => {
                      const prio = PRIORITY_COLORS[train.priority] || PRIORITY_COLORS.express;
                      const src = SOURCE_BADGE[train.source] || SOURCE_BADGE.fixture;
                      return (
                        <tr key={train.train_number + idx} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-space-sm px-space-sm font-bold text-primary">
                            {train.train_number}
                          </td>
                          <td className="py-space-sm px-space-sm font-semibold text-on-surface max-w-[260px] truncate">
                            {train.train_name}
                          </td>
                          <td className="py-space-sm px-space-sm">
                            <span className={`${prio.bg} ${prio.text} border ${prio.border} px-2 py-0.5 rounded font-label-caps text-[10px] font-bold`}>
                              {prio.label}
                            </span>
                          </td>
                          <td className="py-space-sm px-space-sm text-on-surface-variant">
                            {train.origin} → {train.destination}
                          </td>
                          <td className="py-space-sm px-space-sm font-semibold text-on-surface">
                            {train.dep_time}
                          </td>
                          <td className="py-space-sm px-space-sm text-on-surface-variant">
                            {train.arr_time}
                          </td>
                          <td className="py-space-sm px-space-sm">
                            <span className="bg-surface-container px-1.5 py-0.5 rounded font-semibold">
                              {train.segments_traversed}
                            </span>
                          </td>
                          <td className="py-space-sm px-space-sm">
                            <span className={`${src.bg} ${src.text} px-2 py-0.5 rounded font-label-caps text-[10px] font-bold inline-flex items-center gap-1`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {src.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(!liveTimetable?.trains || liveTimetable.trains.length === 0) && !timetableLoading && (
                  <div className="p-space-lg text-center text-on-surface-variant font-code-sm">
                    No trains loaded. Click "FETCH RAILGADI" to connect.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ═══ TAB 2: MAINTENANCE BLOCKS ═══ */}
        {activeTab === 'blocks' && (
          <section className="px-gutter pt-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">construction</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Optimized Maintenance Block Schedule
                </h2>
              </div>
              <div className="flex items-center gap-space-xs">
                {/* Segment Filter */}
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value)}
                  className="bg-surface-container-highest text-on-surface px-space-sm py-1 rounded font-code-sm text-code-sm border border-outline-variant focus:outline-none"
                >
                  <option value="ALL">All Segments</option>
                  {segments.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {/* Block Type Filter */}
                <select
                  value={blockTypeFilter}
                  onChange={(e) => setBlockTypeFilter(e.target.value)}
                  className="bg-surface-container-highest text-on-surface px-space-sm py-1 rounded font-code-sm text-code-sm border border-outline-variant focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="clear">Clear Windows</option>
                  <option value="adjusted">Adjusted Windows</option>
                </select>
              </div>
            </div>

            {/* Block Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-xs">
              <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high flex flex-col items-center gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant">TOTAL BLOCKS</span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">{maintenanceBlocks.length}</span>
              </div>
              <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high flex flex-col items-center gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant">CLEAR WINDOWS</span>
                <span className="font-headline-sm text-headline-sm font-bold text-on-tertiary-container">{summary.clear_windows || 0}</span>
              </div>
              <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high flex flex-col items-center gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant">ADJUSTED</span>
                <span className="font-headline-sm text-headline-sm font-bold text-secondary">{summary.adjusted_windows || 0}</span>
              </div>
              <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-high flex flex-col items-center gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant">TOTAL HOURS</span>
                <span className="font-headline-sm text-headline-sm font-bold text-tertiary-fixed">{summary.total_block_hours || 0}h</span>
              </div>
            </div>

            {/* Maintenance Block Table */}
            <div className="overflow-x-auto no-scrollbar bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                    <th className="py-space-xs px-space-sm font-bold">Block ID</th>
                    <th className="py-space-xs px-space-sm font-bold">Segment</th>
                    <th className="py-space-xs px-space-sm font-bold">Day</th>
                    <th className="py-space-xs px-space-sm font-bold">Window</th>
                    <th className="py-space-xs px-space-sm font-bold">Duration</th>
                    <th className="py-space-xs px-space-sm font-bold">Type</th>
                    <th className="py-space-xs px-space-sm font-bold">Conflict Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                  {filteredBlocks.slice(0, 50).map((block) => {
                    const startTime = block.block_start ? new Date(block.block_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                    const endTime = block.block_end ? new Date(block.block_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
                    const isClear = block.window_type === 'clear';

                    return (
                      <tr key={block.block_id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-space-sm px-space-sm font-bold text-secondary">
                          {block.block_id}
                        </td>
                        <td className="py-space-sm px-space-sm">
                          <Link to={`/segment-why?segment=${block.segment_id}`} className="hover:underline text-primary font-semibold">
                            {block.segment_id}
                          </Link>
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface font-semibold">
                          {block.day}
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface">
                          {startTime} – {endTime}
                        </td>
                        <td className="py-space-sm px-space-sm text-on-surface-variant font-semibold">
                          {block.duration_hrs}h
                        </td>
                        <td className="py-space-sm px-space-sm">
                          <span className={`px-2 py-0.5 rounded font-label-caps text-[10px] font-bold ${
                            isClear
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {isClear ? 'CLEAR' : 'ADJUSTED'}
                          </span>
                        </td>
                        <td className="py-space-sm px-space-sm">
                          {isClear ? (
                            <span className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded font-label-caps text-[10px] font-bold inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              ZERO CONFLICT
                            </span>
                          ) : (
                            <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-label-caps text-[10px] font-bold inline-flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">info</span>
                              BUFFER: {block.safety_buffer_min}m
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredBlocks.length === 0 && !timetableLoading && (
                <div className="p-space-lg text-center text-on-surface-variant font-code-sm">
                  No maintenance blocks available. Fetch timetable first.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ═══ TAB 3: POSSESSION PLANNER (existing functionality) ═══ */}
        {activeTab === 'planner' && (
          <>
            <section className="p-gutter">
              <div className="flex items-center justify-between flex-wrap gap-space-xs pb-space-xs">
                {/* Horizon Switcher */}
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
                    DAY (24-HR)
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
                    WEEKLY (7-DAY)
                  </button>
                </div>

                {/* Department Filter */}
                <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'ALL', label: `ALL (${assignments.length})` },
                    { id: 'ENG', label: 'ENG' },
                    { id: 'TRD', label: 'ELEC' },
                    { id: 'S&T', label: 'S&T' },
                    { id: 'HIGH_PRIORITY', label: 'HIGH RISK' },
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

                  {horizon === 'weekly' && availableDays.length > 2 && (
                    <div className="flex items-center gap-1 ml-2 pl-2 border-l border-surface-container">
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
              </div>
            </section>

            <section className="px-gutter flex flex-col gap-space-md">
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
                      <th className="py-space-xs px-space-sm font-bold">Conflict Status</th>
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
                          <td className="py-space-sm px-space-sm font-bold text-primary">{a.task_id}</td>
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
                          <td className="py-space-sm px-space-sm text-on-surface-variant">{a.duration_hrs} Hrs</td>
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
                    No possessions found. Run "Solve Timetable" to generate.
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* Footer Stats */}
        <section className="p-gutter bg-surface-container-low border-t border-surface-container mt-space-lg shadow-sm">
          <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant mb-space-xs">
            <span>TIMETABLE SANCTIONING AUTHORITY: SR. DOM / PRYJ</span>
            <span className="font-code-sm text-code-sm text-primary font-bold">
              {currentPlan?.plan_id || 'RAILGADI LIVE'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-space-xs text-center">
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">DATA SOURCE</div>
              <div className="font-code-md text-code-md font-bold text-primary">RAILGADI API</div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">TRAINS TRACKED</div>
              <div className="font-code-md text-code-md font-bold text-primary">
                {summary.total_trains || liveTimetable?.trains?.length || 0}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">MAINT. BLOCKS</div>
              <div className="font-code-md text-code-md font-bold text-primary">
                {summary.total_maintenance_blocks || maintenanceBlocks.length}
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">NON-PEAK WINDOWS</div>
              <div className="font-code-md text-code-md font-bold text-on-tertiary-container">
                00:00–05:30 & 10:00–14:30
              </div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded border border-surface-container">
              <div className="font-label-caps text-label-caps text-secondary">ENGINE</div>
              <div className="font-code-md text-code-md font-bold text-primary">CP-SAT v4.2</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
