import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function DigitalTwin() {
  const [twinMode, setTwinMode] = useState('realtime');
  const [activeLayers, setActiveLayers] = useState(['P-Way Track', 'OHE Traction', 'S&T Signalling']);
  const [segments, setSegments] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [divisionsList, setDivisionsList] = useState([]);
  const [divisionFilter, setDivisionFilter] = useState('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [segsData, planData, divData] = await Promise.allSettled([
          api.getRiskSegments(),
          api.getCurrentPlan('weekly'),
          api.getDivisions(),
        ]);
        if (segsData.status === 'fulfilled' && segsData.value) {
          setSegments(segsData.value);
          const sorted = [...segsData.value].sort((a, b) => b.risk_30d - a.risk_30d);
          setSelectedSegment(sorted[0]);
        }
        if (planData.status === 'fulfilled') {
          setCurrentPlan(planData.value);
        }
        if (divData.status === 'fulfilled' && divData.value?.divisions) {
          setDivisionsList(divData.value.divisions);
        }
      } catch (err) {
        console.error('Failed to load digital twin data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleLayer = (layerName) => {
    setActiveLayers((prev) =>
      prev.includes(layerName) ? prev.filter((l) => l !== layerName) : [...prev, layerName]
    );
  };

  const handleSelectSegment = (seg) => {
    setSelectedSegment(seg);
  };

  const isCrit = (selectedSegment?.risk_30d || 0) >= 0.70;
  const isMed = (selectedSegment?.risk_30d || 0) >= 0.30 && (selectedSegment?.risk_30d || 0) < 0.70;

  const filteredSegments = segments.filter((s) => {
    if (divisionFilter === 'ALL') return true;
    return (s.division || '').toLowerCase() === divisionFilter.toLowerCase();
  });

  const activeDivisionsNames = divisionsList.length > 0 
    ? divisionsList.map((d) => d.division).join(', ')
    : 'Delhi, Agra, Kota, Ratlam, Vadodara, Mumbai';

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full gap-space-md p-gutter">
        {/* TOP BAR: Control Strip & Corridor State Switcher */}
        <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <span
                className="material-symbols-outlined text-[20px] text-primary shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                alt_route
              </span>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                    INDIAN RAILWAYS MULTI-DIVISION DIGITAL TWIN
                  </span>
                  <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-1 py-0.5 rounded uppercase">
                    {segments.length} ASSETS SYNCHRONIZED
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-secondary">
                  Divisions: {activeDivisionsNames} • Real-Time Digital Twin Telemetry &amp; Block Twin
                </span>
              </div>
            </div>

            {/* Real-time vs Planned State Switcher */}
            <div className="flex items-center p-0.5 bg-surface-container-high rounded-lg w-full sm:w-auto self-stretch sm:self-auto">
              <button
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-space-xs px-space-md py-1 rounded transition-all font-code-sm text-code-sm ${
                  twinMode === 'realtime'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-secondary'
                }`}
                onClick={() => setTwinMode('realtime')}
              >
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                <span>REAL-TIME STATE</span>
              </button>
              <button
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-space-xs px-space-md py-1 rounded transition-all font-code-sm text-code-sm ${
                  twinMode === 'planned'
                    ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                    : 'text-secondary'
                }`}
                onClick={() => setTwinMode('planned')}
              >
                <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                <span>CP-SAT PLANNED ({currentPlan?.assignments?.length || 413} BLOCKS)</span>
              </button>
            </div>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-space-xs flex-wrap border-t border-surface-container-high pt-space-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase mr-1">
              Active Layers:
            </span>
            {['P-Way Track', 'OHE Traction', 'S&T Signalling'].map((layer) => {
              const active = activeLayers.includes(layer);
              return (
                <button
                  key={layer}
                  onClick={() => toggleLayer(layer)}
                  className={`px-2 py-0.5 rounded font-code-sm text-code-sm font-semibold transition-colors ${
                    active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {active ? '✓ ' : '+ '} {layer}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN TWIN DECK: Interactive Segment Grid + Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {/* Left: 50 Real Corridor Segments Grid */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Railway Physical Network Topology ({filteredSegments.length} Segments)
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="bg-surface-container-highest text-primary font-bold px-2 py-1 rounded font-code-sm text-code-sm border border-outline-variant focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Divisions</option>
                  {(divisionsList.length > 0 ? divisionsList : [
                    { division: 'Delhi' },
                    { division: 'Agra' },
                    { division: 'Kota' },
                    { division: 'Ratlam' },
                    { division: 'Vadodara' },
                    { division: 'Mumbai' },
                  ]).map((d) => (
                    <option key={d.division} value={d.division}>
                      {d.division} Division
                    </option>
                  ))}
                </select>
                <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">
                  Click any segment to inspect
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[500px] overflow-y-auto p-1">
              {filteredSegments.map((seg) => {
                const segCrit = seg.risk_30d >= 0.70;
                const segMed = seg.risk_30d >= 0.30 && seg.risk_30d < 0.70;
                const isSelected = selectedSegment?.segment_id === seg.segment_id;

                return (
                  <button
                    key={seg.segment_id}
                    onClick={() => handleSelectSegment(seg)}
                    className={`flex flex-col p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary bg-surface-container'
                        : segCrit
                        ? 'bg-error-container/20 border-error hover:bg-error-container/30'
                        : segMed
                        ? 'bg-secondary-container/20 border-secondary hover:bg-secondary-container/30'
                        : 'bg-surface-container-low border-surface-container-high hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-code-sm font-bold text-on-surface">{seg.segment_id}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          segCrit ? 'bg-error animate-pulse' : segMed ? 'bg-secondary' : 'bg-on-tertiary-container'
                        }`}
                      ></span>
                    </div>
                    <span className="text-[10px] font-label-caps text-on-surface-variant mt-1">
                      {seg.division} • {seg.asset_type}
                    </span>
                    <span
                      className={`text-[11px] font-code-sm font-bold mt-1 ${
                        segCrit ? 'text-error' : segMed ? 'text-secondary' : 'text-on-tertiary-container'
                      }`}
                    >
                      {(seg.risk_30d * 100).toFixed(0)}% Risk
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Focused Segment Telemetry Inspector */}
          <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col gap-space-sm justify-between">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  TELEMETRY INSPECTOR
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded font-label-caps text-label-caps font-bold ${
                    isCrit ? 'bg-error text-on-error' : isMed ? 'bg-secondary text-on-secondary' : 'bg-tertiary-container text-on-tertiary-container'
                  }`}
                >
                  {isCrit ? 'CRITICAL RISK' : isMed ? 'MODERATE RISK' : 'NORMAL / LOW RISK'}
                </span>
              </div>

              <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                {selectedSegment?.segment_id || 'SELECT SEGMENT'}
              </h2>

              <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-2 font-code-sm text-code-sm mt-space-xs">
                <div className="flex justify-between border-b border-surface-container-high pb-1">
                  <span className="text-on-surface-variant">Division:</span>
                  <span className="text-on-surface font-bold">{selectedSegment?.division || 'Agra'}</span>
                </div>
                <div className="flex justify-between border-b border-surface-container-high pb-1">
                  <span className="text-on-surface-variant">Asset Type:</span>
                  <span className="text-on-surface font-bold">{selectedSegment?.asset_type || 'Track'}</span>
                </div>
                <div className="flex justify-between border-b border-surface-container-high pb-1">
                  <span className="text-on-surface-variant">30-Day Failure Risk:</span>
                  <span className={`font-bold ${isCrit ? 'text-error' : 'text-on-surface'}`}>
                    {selectedSegment ? (selectedSegment.risk_30d * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between border-b border-surface-container-high pb-1">
                  <span className="text-on-surface-variant">Recommended Block:</span>
                  <span className="text-on-surface font-bold">
                    {selectedSegment?.preventive_block_duration_hrs ? `${selectedSegment.preventive_block_duration_hrs}h` : '4.5h'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Expected Loss / Downtime:</span>
                  <span className="text-error font-bold">
                    {selectedSegment?.expected_downtime_days ? `${selectedSegment.expected_downtime_days} Days` : '7.5 Days'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs mt-space-sm">
              <Link
                to={`/segment-why?segment=${selectedSegment?.segment_id}`}
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-2 rounded font-code-sm text-code-sm font-bold text-center shadow transition-all"
              >
                OPEN AI WHY EXPLAINER →
              </Link>
              <Link
                to="/planner"
                className="w-full bg-surface-container hover:bg-surface-container-highest text-on-surface py-2 rounded font-code-sm text-code-sm font-semibold text-center transition-all"
              >
                VIEW CORRESPONDING BLOCKS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
