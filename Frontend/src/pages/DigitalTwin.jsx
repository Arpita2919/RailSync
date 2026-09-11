import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DigitalTwin() {
  const [twinMode, setTwinMode] = useState('realtime');
  const [activeLayers, setActiveLayers] = useState(['P-Way Track']);
  const [segment, setSegment] = useState({
    id: 'SEG-KRJ-UP-04',
    title: 'KRJ Yard UP Main',
    status: 'Weld Flaw (AT Weld #41) Critical',
    psr: '30 km/h Caution',
    power: 'Isolated Req',
    meta: 'Km 1071.8 to 1073.4 (UP Main) • 60kg 90UTS Welded Rail (PSC Sleeper 1660/km)',
    badge: 'URGENT BLOCK REQUIRED',
    isCritical: true,
  });

  const toggleLayer = (layerName) => {
    setActiveLayers((prev) =>
      prev.includes(layerName) ? prev.filter((l) => l !== layerName) : [...prev, layerName]
    );
  };

  const selectSegment = (id, title, status, psr, power) => {
    const isCrit = id === 'SEG-KRJ-UP-04';
    setSegment({
      id,
      title,
      status,
      psr,
      power,
      meta: `${title} • ${status} • Target Speed: ${psr}`,
      badge: isCrit ? 'URGENT BLOCK REQUIRED' : 'INSPECTOR ACTIVE',
      isCritical: isCrit,
    });
  };

  const triggerBlockAssign = () => {
    alert(`Block Assignment Window Initialized for ${segment.id}. Dispatching e-Permit to Prayagraj Divisional Console.`);
  };

  const exportTelemetry = () => {
    alert('Exporting CRIS/COA Digital Twin Telemetry Snapshot (CSV / IEC-61850 JSON format)...');
  };

  const approveBlockAdvisor = () => {
    alert('Sequence approved. Route locking sequence pre-staged for 14:40 window.');
  };

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
                    UP MAIN &amp; 3RD LINE (ALJN - TDL - CNB)
                  </span>
                  <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-1 py-0.5 rounded uppercase">
                    M-QUAD 130
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-secondary">
                  Sec 4B: NCR / Prayagraj Div • Axle Counter System (SSDAC)
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
                <span>REAL-TIME (14:28)</span>
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
                <span>PLANNED (16:00 HRS)</span>
              </button>
            </div>
          </div>

          {/* Sub-Filters: Asset Classes */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pt-space-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase shrink-0 mr-1">LAYER:</span>
            {[
              { id: 'P-Way Track', icon: 'linear_scale' },
              { id: 'OHE Traction', icon: 'electric_bolt' },
              { id: 'S&T Signalling', icon: 'traffic' },
              { id: 'Rolling Stock', icon: 'train' },
            ].map((layer) => {
              const active = activeLayers.includes(layer.id);
              return (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center gap-1 px-space-md py-1 rounded font-code-sm text-code-sm transition-colors ${
                    active ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{layer.icon}</span>
                  <span>{layer.id}</span>
                </button>
              );
            })}
            <div className="ml-auto shrink-0 flex items-center gap-1 bg-surface-container px-space-sm py-1 rounded text-on-surface-variant font-code-sm text-code-sm">
              <span className="material-symbols-outlined text-[14px]">zoom_in</span>
              <span>1:25,000</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE SCHEMATIC TRACK TOPOLOGY */}
        <div className="flex flex-col bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
          {/* Schematic Header & Micro Ticker */}
          <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="material-symbols-outlined text-[16px] text-primary">hub</span>
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">Synoptic Block Topology View</span>
              <span className="font-label-caps text-label-caps bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded">
                AUTO-REFRESH 3s
              </span>
            </div>
            <div className="flex items-center gap-space-xs text-secondary font-code-sm text-code-sm">
              <span className="hidden sm:inline">Tap track block to isolate</span>
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
            </div>
          </div>

          {/* Scaled Synoptic Canvas */}
          <div className="relative w-full overflow-x-auto p-space-md bg-surface-container-low" style={{ minHeight: '240px' }}>
            <div className="relative min-w-[780px] h-[210px] select-none flex flex-col justify-between py-2">
              {/* Station Axis & Distance Ruler */}
              <div className="absolute inset-x-0 top-1 flex justify-between text-secondary font-code-sm text-code-sm pb-1">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-on-surface font-headline-sm text-headline-sm">ALJN</span>
                  <span className="text-secondary">Km 1028</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-on-surface font-headline-sm text-headline-sm">SOM</span>
                  <span className="text-secondary">Km 1054</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-error font-headline-sm text-headline-sm flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[14px]">warning</span>KRJ
                  </span>
                  <span className="text-error font-semibold">Km 1072</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-on-surface font-headline-sm text-headline-sm">TDL</span>
                  <span className="text-secondary">Km 1120</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-bold text-on-surface font-headline-sm text-headline-sm">CNB</span>
                  <span className="text-secondary">Km 1245</span>
                </div>
              </div>

              {/* Vertical Station Marker Grid Lines */}
              <div className="absolute inset-x-0 top-12 bottom-6 flex justify-between pointer-events-none px-4 opacity-30">
                <div className="w-0.5 h-full bg-secondary"></div>
                <div className="w-0.5 h-full bg-secondary"></div>
                <div className="w-0.5 h-full bg-error"></div>
                <div className="w-0.5 h-full bg-secondary"></div>
                <div className="w-0.5 h-full bg-secondary"></div>
              </div>

              {/* SVG Track Topology Network */}
              <svg className="w-full h-28 my-auto" fill="none" viewBox="0 0 780 110" xmlns="http://www.w3.org/2000/svg">
                {/* UP 3RD LINE */}
                <path d="M 0 25 L 320 25 L 370 12 L 440 12 L 490 25 L 780 25" stroke="#94A3B8" strokeLinecap="round" strokeWidth="3" />
                {/* KRJ Loop Siding 2 (BOXN) */}
                <path d="M 350 25 L 375 40 L 435 40 L 460 25" stroke="#CBD5E1" strokeDasharray="4 2" strokeWidth="2.5" />
                <rect fill="#535F74" height="12" rx="2" width="46" x="382" y="34" />
                <text fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="7" fontWeight="600" textAnchor="middle" x="405" y="43">
                  BOXN RAKE
                </text>

                {/* UP MAINLINE */}
                {/* Segment 1: Healthy Km 1028-1065 */}
                <line
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => selectSegment('SEG-UP-1028', 'Healthy Corridor Block', 'Normal headway 4.2 min', 'Normal', '130 km/h')}
                  stroke="#15803D"
                  strokeLinecap="square"
                  strokeWidth="5"
                  x1="0"
                  x2="330"
                  y1="65"
                  y2="65"
                />
                {/* Segment 2: CRITICAL FLAW (KRJ Yard) */}
                <line
                  className="cursor-pointer animate-pulse"
                  onClick={() =>
                    selectSegment('SEG-KRJ-UP-04', 'KRJ Yard UP Main', 'Weld Flaw (AT Weld #41) Critical', '30 km/h Caution', 'Isolated Req')
                  }
                  stroke="#B91C1C"
                  strokeLinecap="square"
                  strokeWidth="6"
                  x1="330"
                  x2="455"
                  y1="65"
                  y2="65"
                />
                {/* Segment 3: Healthy Continued */}
                <line
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    selectSegment('SEG-UP-TDL-01', 'TDL-CNB Outer Block', 'Clear Line Automatic Signal 1084', 'Normal', '130 km/h')
                  }
                  stroke="#15803D"
                  strokeLinecap="square"
                  strokeWidth="5"
                  x1="455"
                  x2="780"
                  y1="65"
                  y2="65"
                />

                {/* DN MAINLINE */}
                <line stroke="#94A3B8" strokeLinecap="square" strokeWidth="4" x1="0" x2="520" y1="95" y2="95" />
                <line
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() =>
                    selectSegment('SEG-DN-1120', 'TDL Down Mainline Zone', 'Planned TRD 25kV Isolation at 17:00', 'Normal now', 'De-energized')
                  }
                  stroke="#B45309"
                  strokeDasharray="6 3"
                  strokeWidth="5"
                  x1="520"
                  x2="640"
                  y1="95"
                  y2="95"
                />
                <line stroke="#94A3B8" strokeLinecap="square" strokeWidth="4" x1="640" x2="780" y1="95" y2="95" />

                {/* Crossover Turnouts */}
                <path d="M 120 65 L 140 25" stroke="#94A3B8" strokeWidth="2" />
                <path d="M 440 65 L 460 95" stroke="#94A3B8" strokeWidth="2" />

                {/* Signals */}
                <circle cx="110" cy="58" fill="#15803D" r="3.5" />
                <line stroke="#1E293B" strokeWidth="1.5" x1="110" x2="110" y1="58" y2="65" />
                <circle className="animate-ping" cx="330" cy="57" fill="#B91C1C" r="4" />
                <circle cx="330" cy="57" fill="#B91C1C" r="4" />
                <line stroke="#1E293B" strokeWidth="1.5" x1="330" x2="330" y1="57" y2="65" />
                <circle cx="520" cy="87" fill="#B45309" r="3.5" />
                <line stroke="#1E293B" strokeWidth="1.5" x1="520" x2="520" y1="87" y2="95" />

                {/* TRAIN TAG: 12302 Rajdhani Express */}
                <g transform="translate(180, 48)">
                  <line stroke="#011027" strokeWidth="1.5" x1="36" x2="36" y1="17" y2="21" />
                  <rect fill="#011027" height="18" rx="2" width="76" x="0" y="0" />
                  <circle cx="6" cy="9" fill="#79DB8D" r="2.5" />
                  <text fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="8" fontWeight="700" x="13" y="12.5">
                    12302 RAJ
                  </text>
                  <text fill="#95F8A7" fontFamily="JetBrains Mono" fontSize="7.5" fontWeight="500" x="54" y="12.5">
                    128k
                  </text>
                </g>
              </svg>

              {/* Dynamic Visual Badges along schematic bottom */}
              <div className="flex items-center justify-between text-secondary px-2 pt-1 font-code-sm text-code-sm">
                <div className="flex items-center gap-1 bg-tertiary-container px-space-xs py-0.5 rounded text-tertiary-fixed font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed"></span>
                  <span>SEG-UP-1028: Clear (Headway 4.2m)</span>
                </div>
                <div className="flex items-center gap-1 bg-error-container px-space-xs py-0.5 rounded text-on-error-container font-semibold animate-pulse">
                  <span className="material-symbols-outlined text-[13px]">emergency_home</span>
                  <span>KRJ Km 1072: WELD FLAW DETECTED</span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-high px-space-xs py-0.5 rounded text-on-surface-variant">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  <span>TDL DN: Planned TRD 17:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Telemetry Micro-Legend */}
          <div className="flex flex-wrap items-center justify-between gap-space-xs px-space-md py-space-xs bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-on-tertiary-container"></span> Healthy Track
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-error"></span> Critical Flaw / PSR
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Scheduled Isolation
              </span>
            </div>
            <span className="font-label-caps text-label-caps uppercase text-secondary">CLICK SEGMENT TO SWITCH INSPECTOR</span>
          </div>
        </div>

        {/* INSPECTOR PANEL: Active Block Telemetry */}
        <div className="flex flex-col bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden transition-all duration-200">
          {/* Inspector Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs p-space-md bg-surface-container">
            <div className="flex items-center gap-space-sm min-w-0">
              <div
                className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                  segment.isCritical ? 'bg-error-container text-error' : 'bg-primary-container text-primary-fixed'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">troubleshoot</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-headline-md text-on-surface truncate">{segment.id}</span>
                  <span
                    className={`font-label-caps text-label-caps px-1.5 py-0.5 rounded uppercase font-bold ${
                      segment.isCritical ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
                    }`}
                  >
                    {segment.badge}
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-secondary truncate">{segment.meta}</span>
              </div>
            </div>

            {/* Quick Alert State Chip */}
            <div className="flex items-center gap-space-xs shrink-0 self-end sm:self-auto bg-surface-container-lowest px-space-sm py-1 rounded shadow-sm">
              <span className={`material-symbols-outlined text-[16px] ${segment.isCritical ? 'text-error' : 'text-primary'}`}>
                speed
              </span>
              <span className="font-code-sm text-code-sm text-on-surface font-bold">
                {segment.isCritical ? 'PSR 30 km/h ACTIVE' : 'FULL SPEED ACTIVE'}
              </span>
            </div>
          </div>

          {/* Telemetry Metric Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md p-space-md bg-surface-container-low">
            {/* Current State Card */}
            <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded shadow-sm">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-space-xs">
                  <span className={`w-2 h-2 rounded-full ${segment.isCritical ? 'bg-error animate-ping' : 'bg-on-tertiary-container'}`}></span>
                  <span className={`font-label-caps text-label-caps uppercase font-bold ${segment.isCritical ? 'text-error' : 'text-secondary'}`}>
                    CURRENT OPERATIONAL DEFICIT
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-secondary">USFD Car #14 Telemetry</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Track Permissible Speed:</span>
                  <span className={`font-code-md text-code-md font-bold ${segment.isCritical ? 'text-error' : 'text-on-surface'}`}>
                    {segment.psr}
                  </span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Delay Cost per Train:</span>
                  <span className={`font-code-md text-code-md font-bold ${segment.isCritical ? 'text-error' : 'text-on-surface'}`}>
                    {segment.isCritical ? '+6.4 min / Rake' : '0 min / Rake'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">25kV Traction Power:</span>
                  <span className="font-code-md text-code-md text-on-tertiary-container font-semibold">Energized (Active Feed)</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Fatigue / Cumulative Tonnes:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-code-md text-code-md text-on-surface font-bold">14,200 GMT</span>
                    <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-1 rounded">82% Cap</span>
                  </div>
                </div>
              </div>
              {/* Defect Diagnostic Callout */}
              <div className="flex items-start gap-space-xs p-space-sm bg-error-container text-on-error-container rounded font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-[18px] text-error shrink-0">report_problem</span>
                <div>
                  <span className="font-bold">IMR Defect:</span> Transverse flaw detected in AT-Weld #41 at Km 1072.24. Clamp secured with
                  joggled fishplate. Needs immediate 90-min rail change window.
                </div>
              </div>
            </div>

            {/* Planned State Post-Block */}
            <div className="flex flex-col gap-space-sm bg-surface-container-lowest p-space-md rounded shadow-sm">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">verified</span>
                  <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase font-bold">
                    TARGET STATE (POST 90-MIN BLOCK)
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-secondary">Slot #4182 Proposed</span>
              </div>
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Restored Section Speed:</span>
                  <span className="font-code-md text-code-md text-on-tertiary-container font-bold">130 km/h (Full Speed)</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Cumulative Headway Gain:</span>
                  <span className="font-code-md text-code-md text-on-tertiary-container font-bold">+18.2 min saved / shift</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Scheduled Power Cut:</span>
                  <span className="font-code-md text-code-md text-on-surface-variant font-semibold">15:30 - 17:00 (90 min)</span>
                </div>
                <div className="flex items-center justify-between p-space-xs bg-surface-container rounded">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Asset Health Score:</span>
                  <span className="font-code-md text-code-md text-on-tertiary-container font-bold">98/100 (Weld replaced)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Chart & Visual Telemetry Micro-Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md bg-surface-container-lowest">
            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-secondary uppercase">BLOCK WINDOW OPPORTUNITY SCORE</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-28 h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-on-tertiary-container rounded-full" style={{ width: '86%' }}></div>
                  </div>
                  <span className="font-code-sm text-code-sm font-bold text-on-tertiary-container">86% (OPTIMAL)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm w-full sm:w-auto justify-end">
              <Link
                to="/segment-why"
                className="flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container-high text-primary rounded font-code-sm text-code-sm font-semibold hover:bg-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">psychology</span>
                <span>Open Segment 'Why?'</span>
              </Link>
              <button
                onClick={triggerBlockAssign}
                className="flex items-center gap-1.5 px-space-md py-1.5 bg-primary text-on-primary rounded font-code-sm text-code-sm font-semibold shadow-sm hover:opacity-90"
              >
                <span className="material-symbols-outlined text-[16px]">assignment_add</span>
                <span>Assign Quick Window</span>
              </button>
              <button
                onClick={exportTelemetry}
                className="flex items-center gap-1 px-space-sm py-1.5 bg-surface-container text-on-surface-variant rounded font-code-sm text-code-sm hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Operational Activity Feeds & Conflict Projection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Feed 1: Approaching Traffic */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">schedule_send</span>
                Approaching Traffic
              </span>
              <span className="font-label-caps text-label-caps text-secondary uppercase">NEXT 45 MIN</span>
            </div>
            <div className="flex flex-col gap-1.5 mt-space-xs">
              <div className="flex items-center justify-between p-1.5 bg-surface-container rounded text-on-surface font-code-sm text-code-sm">
                <div>
                  <span className="font-bold">12302 Rajdhani</span>
                  <span className="text-secondary block text-[10px]">Km 1042 • ETA KRJ: 14:38</span>
                </div>
                <span className="font-bold text-error">+4m PSR delay</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-surface-container rounded text-on-surface font-code-sm text-code-sm">
                <div>
                  <span className="font-bold">12876 Neelachal</span>
                  <span className="text-secondary block text-[10px]">Km 1030 • ETA KRJ: 14:52</span>
                </div>
                <span className="font-semibold text-secondary">Regulated SOM</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-surface-container rounded text-on-surface font-code-sm text-code-sm">
                <div>
                  <span className="font-bold">BOXN Container 92</span>
                  <span className="text-secondary block text-[10px]">Loop 2 Siding KRJ</span>
                </div>
                <span className="text-on-tertiary-container font-semibold">Stabled</span>
              </div>
            </div>
          </div>

          {/* Feed 2: Live Sensor Telemetry */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">sensors</span>
                IoT Sensor Stream
              </span>
              <span className="font-label-caps text-label-caps text-on-tertiary-container uppercase">CRIS TELE-09</span>
            </div>
            <div className="flex flex-col gap-1.5 mt-space-xs font-code-sm text-code-sm">
              <div className="flex items-center justify-between py-1 px-1.5 bg-surface-container rounded">
                <span className="text-on-surface-variant">Rail Vibration RMS:</span>
                <span className="font-bold text-error">4.8 mm/s² (HIGH)</span>
              </div>
              <div className="flex items-center justify-between py-1 px-1.5 bg-surface-container rounded">
                <span className="text-on-surface-variant">Rail Ambient Temp:</span>
                <span className="font-semibold text-on-surface">42.6°C (Td = 48°C)</span>
              </div>
              <div className="flex items-center justify-between py-1 px-1.5 bg-surface-container rounded">
                <span className="text-on-surface-variant">Axle Counter Res:</span>
                <span className="font-semibold text-on-tertiary-container">Zero Count Clear</span>
              </div>
              <div className="flex items-center justify-between py-1 px-1.5 bg-surface-container rounded">
                <span className="text-on-surface-variant">OHE Catenary Sag:</span>
                <span className="font-semibold text-on-surface">Normal (62mm nominal)</span>
              </div>
            </div>
          </div>

          {/* Feed 3: AI Dispatch Advisor */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded-lg shadow-sm justify-between">
            <div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">auto_fix_high</span>
                  AI Dispatch Advisor
                </span>
                <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-1 py-0.5 rounded">
                  HIGH CONFIDENCE
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Pass <span className="font-bold text-on-surface">12302 Rajdhani</span> @ 14:38; impose 80m shadow block to save{' '}
                <span className="font-bold text-on-tertiary-container">44 corridor mins</span>.
              </p>
            </div>
            <button
              onClick={approveBlockAdvisor}
              className="mt-space-sm w-full py-2 bg-primary text-on-primary rounded font-code-sm text-code-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>Approve Proposed Sequence</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
