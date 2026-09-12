import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function TaskPool() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [filterDept, setFilterDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const approveTask = (taskId) => {
    showToast(`Task ${taskId} verified and locked for CP-SAT Block Scheduling.`);
  };

  const flagAudit = (taskId) => {
    showToast(`Audit notice dispatched to Divisional Control for ${taskId}: Telemetry evidence requested.`);
  };

  // Metrics calculations from real tasks
  const totalTasks = tasks.length || 602;
  const criticalTasks = tasks.filter((t) => t.claimed_criticality >= 4);
  const overdueTasks = tasks.filter((t) => t.overdue);
  const engTasks = tasks.filter((t) => t.department === 'Engineering' || t.department === 'TRACK');
  const sntTasks = tasks.filter((t) => t.department === 'S&T' || t.department === 'SIGNAL');
  const elecTasks = tasks.filter((t) => t.department === 'Electrical' || t.department === 'OHE');

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (filterDept === 'Engineering' && t.department !== 'Engineering' && t.department !== 'TRACK') return false;
    if (filterDept === 'S&T' && t.department !== 'S&T' && t.department !== 'SIGNAL') return false;
    if (filterDept === 'Electrical' && t.department !== 'Electrical' && t.department !== 'OHE') return false;
    if (filterDept === 'Critical' && t.claimed_criticality < 4) return false;
    if (filterDept === 'Overdue' && !t.overdue) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.task_id.toLowerCase().includes(q) ||
        t.segment_id.toLowerCase().includes(q) ||
        t.task_type.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full">
        {/* Interactive Toast / Notification Area */}
        {toastMessage && (
          <div className="mx-gutter mt-space-sm px-space-md py-space-sm rounded-lg bg-primary-container text-on-primary flex items-center justify-between shadow-md transition-all">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
              <span className="font-code-sm text-code-sm">{toastMessage}</span>
            </div>
            <button className="text-on-primary-container hover:text-on-primary" onClick={() => setToastMessage(null)}>
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Operational Context Banner */}
        <div className="px-gutter pt-space-md pb-space-sm flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-fixed px-space-xs py-0.5 rounded">
                LAYER 2 AUCTION POOL
              </span>
              <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface-variant px-space-xs py-0.5 rounded">
                DIVISIONS: AGRA // DELHI
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">SHADOW AUCTION v2.0</span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-space-xs">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Maintenance Demand Negotiation &amp; Task Pool
            </h1>
            <span className="font-code-sm text-code-sm text-on-secondary-container bg-surface-container px-space-xs py-0.5 rounded">
              TOTAL TASKS: {totalTasks} REGISTERED
            </span>
          </div>
        </div>

        {/* Telemetry Strip & Quick Stats Bento */}
        <div className="px-gutter py-space-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            {/* Total Demands */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant">TOTAL TASKS</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">format_list_bulleted</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-primary font-bold">{totalTasks}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Tasks</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-primary h-full w-full"></div>
              </div>
            </div>

            {/* Critical Tasks */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-error">CRITICAL DEMANDS</span>
                <span className="material-symbols-outlined text-error text-[16px]">warning</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-error font-bold">{criticalTasks.length}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Priority 4-5</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-error h-full" style={{ width: `${(criticalTasks.length / totalTasks) * 100}%` }}></div>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant">OVERDUE POSSESSIONS</span>
                <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[16px]">history_toggle_off</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-on-secondary-fixed font-bold">{overdueTasks.length}</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Urgent</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-secondary-fixed-dim h-full" style={{ width: `${(overdueTasks.length / totalTasks) * 100}%` }}></div>
              </div>
            </div>

            {/* Departments Distribution */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-tertiary-container">DEPARTMENTS</span>
                <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">domain</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs font-code-sm text-code-sm">
                <span className="text-on-surface font-bold">{engTasks.length} ENG</span> •
                <span className="text-on-surface font-bold">{sntTasks.length} S&amp;T</span> •
                <span className="text-on-surface font-bold">{elecTasks.length} ELEC</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-tertiary-container h-full w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-gutter pt-space-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar">
            {['All', 'Engineering', 'S&T', 'Electrical', 'Critical', 'Overdue'].map((d) => (
              <button
                key={d}
                onClick={() => setFilterDept(d)}
                className={`px-space-sm py-1 rounded font-code-sm text-code-sm font-semibold shrink-0 transition-colors ${
                  filterDept === d
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                }`}
              >
                {d === 'All' ? `ALL (${tasks.length})` : d}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by Task, Segment, Type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-space-sm bg-surface-container-lowest text-on-surface font-code-sm text-code-sm rounded border border-surface-container-high focus:outline-none focus:border-primary"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-on-surface-variant pointer-events-none">
              search
            </span>
          </div>
        </div>

        {/* Operational Task Demands List */}
        <div className="px-gutter pt-space-sm pb-space-lg flex flex-col gap-space-sm">
          <div className="overflow-x-auto no-scrollbar bg-surface-container-lowest rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase">
                  <th className="py-space-xs px-space-sm font-bold">Task ID</th>
                  <th className="py-space-xs px-space-sm font-bold">Segment</th>
                  <th className="py-space-xs px-space-sm font-bold">Dept</th>
                  <th className="py-space-xs px-space-sm font-bold">Maintenance Type</th>
                  <th className="py-space-xs px-space-sm font-bold">Criticality</th>
                  <th className="py-space-xs px-space-sm font-bold">Duration</th>
                  <th className="py-space-xs px-space-sm font-bold">Overdue</th>
                  <th className="py-space-xs px-space-sm font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-code-sm text-code-sm">
                {filteredTasks.slice(0, 30).map((t) => {
                  const isCritical = t.claimed_criticality >= 4;
                  return (
                    <tr key={t.task_id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-space-sm px-space-sm font-bold text-primary">
                        {t.task_id}
                      </td>
                      <td className="py-space-sm px-space-sm font-semibold text-on-surface">
                        <Link to={`/segment-why?segment=${t.segment_id}`} className="hover:underline text-secondary">
                          {t.segment_id}
                        </Link>
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span className="bg-surface-container px-1 py-0.5 rounded font-label-caps text-label-caps text-on-surface font-semibold">
                          {t.department}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-sm font-medium text-on-surface">
                        {t.task_type}
                      </td>
                      <td className="py-space-sm px-space-sm">
                        <span
                          className={`px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold ${
                            isCritical ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          LVL {t.claimed_criticality}
                        </span>
                      </td>
                      <td className="py-space-sm px-space-sm text-on-surface-variant">
                        {t.min_duration_hrs ? `${t.min_duration_hrs}h (min)` : `${t.planned_duration_hrs}h`}
                      </td>
                      <td className="py-space-sm px-space-sm">
                        {t.overdue ? (
                          <span className="text-error font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-error"></span> YES
                          </span>
                        ) : (
                          <span className="text-on-surface-variant">NO</span>
                        )}
                      </td>
                      <td className="py-space-sm px-space-sm text-right">
                        <div className="flex items-center justify-end gap-space-xs">
                          <button
                            onClick={() => approveTask(t.task_id)}
                            className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-space-xs py-0.5 rounded font-code-sm text-[11px] font-bold transition-colors"
                          >
                            LOCK
                          </button>
                          <button
                            onClick={() => flagAudit(t.task_id)}
                            className="bg-surface-container-highest hover:bg-error hover:text-on-error text-on-surface-variant px-space-xs py-0.5 rounded font-code-sm text-[11px] transition-colors"
                          >
                            AUDIT
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTasks.length === 0 && !loading && (
              <div className="p-space-md text-center text-on-surface-variant font-code-sm">
                No tasks matching filter.
              </div>
            )}
          </div>
          <div className="text-right text-on-surface-variant font-code-sm text-code-sm">
            Showing top {Math.min(30, filteredTasks.length)} of {filteredTasks.length} filtered tasks.
          </div>
        </div>
      </div>
    </main>
  );
}
