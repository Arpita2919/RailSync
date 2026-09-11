import React, { useState } from 'react';

export default function BlockPlanner() {
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isConsolidated, setIsConsolidated] = useState(false);

  const applyConsolidation = () => {
    setIsConsolidated(true);
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full">
        {/* Operations Strip: Date, Live Window & Sync Status */}
        <section className="p-gutter bg-surface-container-low flex flex-col gap-space-sm shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
              <span className="font-headline-sm text-headline-sm text-primary">24-OCT-2024 (THU)</span>
              <span className="font-label-caps text-label-caps bg-primary text-on-primary px-space-xs py-0.5 rounded ml-space-xs">
                PRYJ-ALJN SEC
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-highest px-space-sm py-0.5 rounded">
              <span className="material-symbols-outlined text-secondary text-[14px]">nest_clock_farsight_analog</span>
              <span className="font-code-sm text-code-sm text-on-surface-variant font-bold">12:00 - 24:00 (12H)</span>
            </div>
          </div>

          {/* Filter & Department Selector Toggles */}
          <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setDeptFilter('ALL')}
              className={`flex items-center gap-space-xs px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                deptFilter === 'ALL'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span>DEPTS: ALL (3)</span>
            </button>
            <button
              onClick={() => setDeptFilter('ENG')}
              className={`flex items-center gap-space-xs px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                deptFilter === 'ENG'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span>ENG (P-WAY)</span>
            </button>
            <button
              onClick={() => setDeptFilter('TRD')}
              className={`flex items-center gap-space-xs px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                deptFilter === 'TRD'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span>TRD (OHE)</span>
            </button>
            <button
              onClick={() => setDeptFilter('S&T')}
              className={`flex items-center gap-space-xs px-space-sm py-1 rounded font-code-sm text-code-sm shrink-0 transition-colors ${
                deptFilter === 'S&T'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span>S&T</span>
            </button>
            <button
              onClick={() => setDeptFilter('CONFLICTS')}
              className={`flex items-center gap-space-xs px-space-sm py-1 rounded bg-error-container text-on-error-container font-code-sm text-code-sm shrink-0 font-semibold shadow-sm transition-opacity ${
                deptFilter === 'CONFLICTS' ? 'ring-2 ring-error' : ''
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              <span>CONFLICTS ({isConsolidated ? '0' : '2'})</span>
            </button>
          </div>
        </section>

        {/* AI Consolidation Insight & Quick Action Banner */}
        <section className="p-gutter">
          <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-start justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs text-primary">
                <span className="material-symbols-outlined text-tertiary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_fix_high
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Integrated Block Suggestion</span>
              </div>
              <span
                className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded uppercase ${
                  isConsolidated ? 'bg-tertiary-container text-tertiary-fixed font-bold' : 'bg-error text-on-error'
                }`}
              >
                {isConsolidated ? 'All Clashes Resolved' : '2 Clashes Resolved'}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-tight">
              Shift <span className="font-code-sm text-code-sm font-bold text-primary">BLK-TRD-109</span> to{' '}
              <span className="font-code-sm text-code-sm font-semibold text-primary">16:45 - 18:15</span> to shadow S&T maintenance. Frees loop-1 at Khurja Jn for train{' '}
              <span className="font-code-sm text-code-sm font-bold text-on-surface">12004 Gomti Express</span> without speed restriction penalty.
            </p>
            <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
              <div className="bg-surface-container-low p-space-xs rounded flex flex-col">
                <span className="font-label-caps text-label-caps text-secondary">NET DETENTION SAVED</span>
                <span className="font-code-lg text-code-lg text-on-tertiary-container font-bold">+75 MINS</span>
              </div>
              <div className="bg-surface-container-low p-space-xs rounded flex flex-col">
                <span className="font-label-caps text-label-caps text-secondary">PUNCTUALITY PRESERVED</span>
                <span className="font-code-lg text-code-lg text-primary font-bold">98.4%</span>
              </div>
            </div>

            <button
              id="applyBtn"
              disabled={isConsolidated}
              onClick={applyConsolidation}
              className={`w-full mt-space-xs py-space-sm px-space-md rounded font-code-sm text-code-sm flex items-center justify-center gap-space-xs shadow-sm active:scale-[0.99] transition-all ${
                isConsolidated
                  ? 'bg-tertiary-container text-tertiary-fixed cursor-default'
                  : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              {isConsolidated ? (
                <>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>CONSOLIDATION APPLIED & SANCTIONED</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">merge_type</span>
                  <span>APPLY CONSOLIDATION & SHADOWING</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Interactive Visual Schedule Timeline */}
        <section className="px-gutter pb-gutter flex flex-col gap-space-md">
          {/* Gantt Horizontal Scale Indicator */}
          <div className="bg-surface-container rounded-t-lg p-space-xs flex justify-between items-center text-on-surface-variant font-code-sm text-code-sm font-medium">
            <span className="w-10 text-center">12:00</span>
            <span className="w-10 text-center">14:00</span>
            <span className="w-10 text-center">16:00</span>
            <span className="w-10 text-center">18:00</span>
            <span className="w-10 text-center">20:00</span>
            <span className="w-10 text-center">22:00</span>
            <span className="w-10 text-center">24:00</span>
          </div>

          {/* Timeline Body Stack */}
          <div className="flex flex-col gap-space-md">
            {/* SECTION 1: ENGINEERING (P-WAY) */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">construction</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">P-Way (Engineering)</span>
                </div>
                <span className="font-label-caps text-label-caps text-secondary bg-surface-container px-space-xs py-0.5 rounded">
                  2 POSSESSIONS
                </span>
              </div>
              {/* Block 1: Active In-Progress */}
              <div className="bg-primary-container text-on-primary rounded p-space-sm flex flex-col gap-space-xs relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse"></span>
                    <span className="font-code-sm text-code-sm font-bold tracking-wide">BLK-ENG-401</span>
                    <span className="font-label-caps text-label-caps bg-surface-container/20 text-on-primary px-space-xs py-0.5 rounded">
                      SOM-KRJ UP
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-tertiary-fixed font-bold">13:00 - 15:00 (120m)</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-primary-container">
                  Tamping Machine 09-3X deployed at Km 1042/12. Deep screening ballast regulator in buffer mode.
                </p>
                <div className="w-full bg-primary/40 h-1 rounded-full overflow-hidden mt-1">
                  <div className="bg-tertiary-fixed h-full w-[72%]"></div>
                </div>
              </div>

              {/* Block 2: Critical Weld Replacement */}
              <div className="bg-surface-container-high rounded p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-error text-[16px]">report_problem</span>
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">BLK-ENG-404</span>
                    <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-bold">
                      KRJ UP MAIN
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-error font-bold">15:30 - 17:00 (90m)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Critical thermit weld fracture replacement & ultrasonic testing.
                  </span>
                  <span className="font-label-caps text-label-caps bg-surface-container px-space-xs py-0.5 rounded text-secondary font-bold">
                    SHADOW CANDIDATE
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: TRACTION & ELECTRICAL (TRD) */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Traction & Power (TRD)</span>
                </div>
                <span
                  className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded font-bold ${
                    isConsolidated
                      ? 'bg-tertiary-container text-tertiary-fixed'
                      : 'text-error bg-error-container'
                  }`}
                >
                  {isConsolidated ? 'SYNCHRONIZED' : 'UNRESOLVED CONFLICT'}
                </span>
              </div>

              {/* TRD Block */}
              <div
                className={`rounded p-space-sm flex flex-col gap-space-xs shadow-sm transition-all duration-300 ${
                  isConsolidated ? 'bg-surface-container-high text-on-surface' : 'bg-error-container text-on-error-container'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className={`material-symbols-outlined text-[16px] ${isConsolidated ? 'text-primary' : 'text-error'}`}>
                      {isConsolidated ? 'task_alt' : 'crisis_alert'}
                    </span>
                    <span className="font-code-sm text-code-sm font-bold">BLK-TRD-109</span>
                    <span className="font-label-caps text-label-caps bg-surface-container-lowest text-on-surface px-space-xs py-0.5 rounded">
                      KRJ-TDL UP OHE
                    </span>
                  </div>
                  <span
                    className={`font-code-sm text-code-sm font-bold ${
                      isConsolidated ? 'text-primary' : 'text-error'
                    }`}
                  >
                    {isConsolidated ? '16:45 - 18:15 (90m)' : '16:00 - 18:00 (120m)'}
                  </span>
                </div>
                <div className="bg-surface-container-lowest/80 p-space-xs rounded flex items-start gap-space-xs">
                  <span className={`material-symbols-outlined text-[16px] shrink-0 ${isConsolidated ? 'text-on-tertiary-container' : 'text-error'}`}>
                    {isConsolidated ? 'check_circle' : 'emergency'}
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-tight">
                    {isConsolidated ? (
                      <>
                        <span className="text-on-tertiary-container font-semibold">SYNCHRONIZED:</span> Successfully shadowed inside S&T slot.
                        Corridor Loop-1 clear.
                      </>
                    ) : (
                      'CLASH DETECTED: Blocks 12004 Gomti Exp path on UP fast line. Incompatible with S&T slot.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: SIGNALLING & TELECOM (S&T) */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">sensors</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Signalling & Interlocking (S&T)</span>
                </div>
                <span className="font-label-caps text-label-caps text-secondary bg-surface-container px-space-xs py-0.5 rounded">
                  1 WORK PERMIT
                </span>
              </div>
              <div className="bg-surface-container-high rounded p-space-sm flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[16px]">settings_input_component</span>
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">BLK-SNT-082</span>
                    <span className="font-label-caps text-label-caps bg-surface-container text-on-surface px-space-xs py-0.5 rounded">
                      KRJ CABIN-B
                    </span>
                  </div>
                  <span className="font-code-sm text-code-sm text-primary font-bold">16:00 - 17:30 (90m)</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Solid-State Interlocking (SSI) CPU standby failover certification & point machine #14B overhaul.
                </p>
              </div>

              {/* Integrated Corridor Block Bracket Opportunity */}
              <div className="bg-secondary-container text-on-secondary-fixed rounded p-space-xs flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]">hub</span>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps font-bold text-primary">INTEGRATED BLOCK WINDOW OPPORTUNITY</span>
                    <span className="font-body-sm text-body-sm text-on-secondary-variant">
                      P-Way (404) + TRD (109) + S&T (082) simultaneous lock
                    </span>
                  </div>
                </div>
                <span className="font-code-sm text-code-sm bg-surface-container-lowest text-primary px-space-xs py-0.5 rounded font-bold">
                  SAVES 75M
                </span>
              </div>
            </div>

            {/* SECTION 4: TRAIN MOVEMENT SCHEDULE */}
            <div className="bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col gap-space-xs">
              <div className="flex items-center justify-between pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">train</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface">Train Movements & Priority Paths</span>
                </div>
                <span className="font-label-caps text-label-caps text-secondary bg-surface-container px-space-xs py-0.5 rounded">
                  HIGH DENSITY (NCR)
                </span>
              </div>
              {/* Train 1 */}
              <div className="bg-surface-container-low p-space-xs rounded flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-6 bg-tertiary-fixed rounded-full"></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">12302 HWH RAJDHANI</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Passing KRJ UP Main at 14:15</span>
                  </div>
                </div>
                <span className="font-label-caps text-label-caps bg-tertiary-container text-tertiary-fixed px-space-xs py-0.5 rounded font-bold">
                  CLEAR PATH
                </span>
              </div>

              {/* Train 2: Gomti Express */}
              <div
                className={`p-space-xs rounded flex items-center justify-between transition-colors ${
                  isConsolidated ? 'bg-surface-container-low' : 'bg-error-container/40'
                }`}
              >
                <div className="flex items-center gap-space-xs">
                  <span className={`w-1.5 h-6 rounded-full ${isConsolidated ? 'bg-tertiary-fixed' : 'bg-error'}`}></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">12004 GOMTI EXPRESS</span>
                    <span
                      className={`font-body-sm text-body-sm font-medium ${
                        isConsolidated ? 'text-on-surface-variant' : 'text-error'
                      }`}
                    >
                      {isConsolidated
                        ? 'Due KRJ 16:22 (Routing on Loop-1 without halt)'
                        : 'Due KRJ 16:22 (+45 min projected detention)'}
                    </span>
                  </div>
                </div>
                <span
                  className={`font-label-caps text-label-caps px-space-xs py-0.5 rounded font-bold uppercase ${
                    isConsolidated ? 'bg-tertiary-container text-tertiary-fixed' : 'bg-error text-on-error'
                  }`}
                >
                  {isConsolidated ? 'ON-TIME CLEARED' : 'CRITICAL DELAY'}
                </span>
              </div>

              {/* Train 3 */}
              <div className="bg-surface-container-low p-space-xs rounded flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                  <div className="flex flex-col">
                    <span className="font-code-sm text-code-sm font-bold text-on-surface">12424 DBRT RAJDHANI</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Due KRJ UP at 17:40</span>
                  </div>
                </div>
                <span className="font-label-caps text-label-caps bg-surface-container-highest text-secondary px-space-xs py-0.5 rounded font-bold">
                  12M BUFFER
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Divisional Block Sanction Summary Sticky Footer Bar */}
        <section className="p-gutter bg-surface-container-low flex flex-col gap-space-xs mt-auto">
          <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant">
            <span>SANCTIONING AUTHORITY: SR. DOM / PRYJ</span>
            <span className="font-code-sm text-code-sm text-primary font-bold">SESSION #2024-B10</span>
          </div>
          <div className="grid grid-cols-3 gap-space-xs text-center">
            <div className="bg-surface-container-lowest p-space-xs rounded">
              <div className="font-label-caps text-label-caps text-secondary">ACTIVE BLOCKS</div>
              <div className="font-code-md text-code-md font-bold text-primary">{isConsolidated ? '2 / 4' : '1 / 4'}</div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded">
              <div className="font-label-caps text-label-caps text-secondary">SHADOW TIME</div>
              <div className="font-code-md text-code-md font-bold text-on-tertiary-container">90 MIN</div>
            </div>
            <div className="bg-surface-container-lowest p-space-xs rounded">
              <div className="font-label-caps text-label-caps text-secondary">SECTION SPEED</div>
              <div className="font-code-md text-code-md font-bold text-primary">130 KMPH</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
