import React from 'react';

export default function Feedback() {
  const handleExport = () => {
    alert('Exporting RailSync Audit & Event Log (CSV / ISO-27001 signed package)...');
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full gap-space-md p-gutter">
        {/* Operational Feedback & Performance Audit Top Status Banner */}
        <div className="flex flex-col gap-space-xs bg-surface-container p-space-md rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs min-w-0">
              <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
              <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                POST-EXECUTION AUDIT &amp; MODEL CALIBRATION
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-xs py-0.5 rounded shadow-sm">
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
              <span className="font-label-caps text-label-caps text-on-surface uppercase">DIV-HQ EVALUATION ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm">
            <span>CORRIDOR: PRYJ-DDU MAINLINE (SUB-SEC 4B)</span>
            <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-space-xs py-0.5 rounded">
              ROLLING 30-DAY WINDOW
            </span>
          </div>
        </div>

        {/* 1. Key Performance Indicators Matrix */}
        <div className="grid grid-cols-2 gap-space-sm">
          {/* Block Overrun KPI */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Avg Block Overrun</span>
              <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">trending_down</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                +8.4<span className="font-code-sm text-code-sm ml-0.5">m</span>
              </span>
              <span className="font-label-caps text-label-caps text-on-tertiary-container font-bold">-75.4%</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs line-clamp-1">Prev Baseline: +34.2m</span>
          </div>

          {/* AI Prediction Accuracy */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">AI Duration Accuracy</span>
              <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">check_circle</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                93.1<span className="font-code-sm text-code-sm ml-0.5">%</span>
              </span>
              <span className="font-label-caps text-label-caps text-on-tertiary-container font-bold">+1.8%</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs line-clamp-1">High Confidence Band</span>
          </div>

          {/* Model Calibration Drift */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Calibration Drift</span>
              <span className="material-symbols-outlined text-secondary text-[16px]">tune</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">0.021</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">NOMINAL</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs line-clamp-1">Threshold: &lt; 0.050</span>
          </div>

          {/* Secondary Delays Prevented */}
          <div className="flex flex-col bg-surface-container-lowest p-space-md rounded shadow-sm">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Sec Delay Saved</span>
              <span className="material-symbols-outlined text-primary text-[16px]">timer</span>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                4,820<span className="font-code-sm text-code-sm ml-0.5">m</span>
              </span>
              <span className="font-label-caps text-label-caps text-on-tertiary-container font-bold">SAVED</span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs line-clamp-1">314 Trains Spared Cascades</span>
          </div>
        </div>

        {/* 2. Planned vs Actual Execution Track */}
        <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">timelapse</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Planned vs. Actual Execution</h3>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded">
              LAST 3 SESSIONS
            </span>
          </div>

          {/* Block 1: Khurja UP Tamping */}
          <div className="flex flex-col bg-surface-container-low p-space-sm rounded gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-lg text-code-lg text-on-surface truncate">BLK-ENG-388</span>
                  <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface px-1 py-0.5 rounded">
                    ENG
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Khurja UP Tamping Machine Gang #3</span>
              </div>
              <div className="flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-0.5 rounded shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed"></span>
                <span className="font-label-caps text-label-caps font-bold">PASS (+4m)</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-space-xs">
              <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
                <span>Plan: 120m</span>
                <span>Actual: 124m</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: '96.7%' }}></div>
                <div className="bg-secondary h-full" style={{ width: '3.3%' }}></div>
              </div>
            </div>
          </div>

          {/* Block 2: Tundla OHE Neutral Section (Overrun) */}
          <div className="flex flex-col bg-surface-container-low p-space-sm rounded gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-lg text-code-lg text-on-surface truncate">BLK-TRD-210</span>
                  <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface px-1 py-0.5 rounded">
                    TRD
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Tundla OHE Neutral Section Retrofit</span>
              </div>
              <div className="flex items-center gap-space-xs bg-error-container text-on-error-container px-space-xs py-0.5 rounded shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
                <span className="font-label-caps text-label-caps font-bold">OVERRUN (+38m)</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-space-xs">
              <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
                <span>Plan: 90m</span>
                <span className="text-error font-bold">Actual: 128m</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden flex">
                <div className="bg-primary h-full" style={{ width: '70.3%' }}></div>
                <div className="bg-error h-full" style={{ width: '29.7%' }}></div>
              </div>
            </div>
          </div>

          {/* Block 3: Somna Signal Testing */}
          <div className="flex flex-col bg-surface-container-low p-space-sm rounded gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-lg text-code-lg text-on-surface truncate">BLK-SNT-094</span>
                  <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface px-1 py-0.5 rounded">
                    S&amp;T
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Somna Electronic Interlocking Validation</span>
              </div>
              <div className="flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-xs py-0.5 rounded shrink-0">
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                <span className="font-label-caps text-label-caps font-bold">OPTIMAL (-2m)</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-space-xs">
              <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
                <span>Plan: 60m</span>
                <span className="text-on-tertiary-container font-bold">Actual: 58m</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden flex">
                <div className="bg-on-tertiary-container h-full" style={{ width: '96.6%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Overrun Root Cause Attribution */}
        <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Overrun Root Cause Attribution</h3>
            </div>
            <span className="font-code-sm text-code-sm text-on-surface-variant">PARETO RANK</span>
          </div>

          <div className="w-full bg-surface-container-highest h-3 rounded overflow-hidden flex">
            <div className="bg-primary h-full" style={{ width: '42%' }} title="TRD Machine Failure 42%"></div>
            <div className="bg-secondary h-full" style={{ width: '28%' }} title="Late Clearing 28%"></div>
            <div className="bg-secondary-fixed-dim h-full" style={{ width: '18%' }} title="Weather Expansion 18%"></div>
            <div className="bg-surface-dim h-full" style={{ width: '12%' }} title="Gang Delay 12%"></div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary shrink-0"></span>
                <span className="font-body-md text-body-md text-on-surface truncate">Tower wagon / Plant breakdown (TRD)</span>
              </div>
              <span className="font-code-lg text-code-lg text-on-surface font-bold shrink-0">42%</span>
            </div>
            <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary shrink-0"></span>
                <span className="font-body-md text-body-md text-on-surface truncate">Late line clearing by Section Controller</span>
              </div>
              <span className="font-code-lg text-code-lg text-on-surface font-bold shrink-0">28%</span>
            </div>
            <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm bg-secondary-fixed-dim shrink-0"></span>
                <span className="font-body-md text-body-md text-on-surface truncate">Extreme heat / Rail expansion constraints</span>
              </div>
              <span className="font-code-lg text-code-lg text-on-surface font-bold shrink-0">18%</span>
            </div>
            <div className="flex items-center justify-between p-space-xs bg-surface-container-low rounded">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm bg-surface-dim shrink-0"></span>
                <span className="font-body-md text-body-md text-on-surface truncate">Manual gang mobilization / Track fitment</span>
              </div>
              <span className="font-code-lg text-code-lg text-on-surface font-bold shrink-0">12%</span>
            </div>
          </div>
        </div>

        {/* 4. AI Model Calibration & Continuous Learning Trend */}
        <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_graph</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">AI Model Calibration Trend</h3>
            </div>
            <div className="flex items-center gap-1 bg-surface-container px-space-xs py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-on-surface">ONLINE RE-WEIGHTING</span>
            </div>
          </div>

          <div className="flex flex-col bg-surface-container-low p-space-sm rounded gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Prediction Error Descent (Cycle 1 → 24)</span>
              <span className="font-code-sm text-code-sm text-on-tertiary-container font-bold">-12.2% ABSOLUTE</span>
            </div>
            <div className="relative w-full h-20 flex items-end pt-2 pb-1">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 60">
                <rect className="text-tertiary-fixed-dim/20" fill="currentColor" height="18" width="300" x="0" y="42" />
                <path
                  className="text-primary"
                  d="M 0 10 Q 50 16 100 24 T 200 42 T 300 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
                <circle className="fill-primary" cx="0" cy="10" r="3.5" />
                <circle className="fill-secondary" cx="100" cy="24" r="2.5" />
                <circle className="fill-secondary" cx="200" cy="42" r="2.5" />
                <circle className="fill-on-tertiary-container" cx="300" cy="50" r="4" />
              </svg>
            </div>
            <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
              <span>C-01: 18.4% error</span>
              <span className="font-bold text-on-surface">C-24: 6.2% error</span>
            </div>
          </div>

          <div className="flex items-start gap-space-sm p-space-sm bg-surface-container rounded">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">published_with_changes</span>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-body-md font-semibold text-on-surface">Live Parameter Weight Synced</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                USFD ultrasonic sensor variance re-weighted today at 04:00 IST. Gradient descent matched to divisional track degradation
                data.
              </span>
            </div>
          </div>
        </div>

        {/* 5. Operational Audit & Event Log */}
        <div className="flex flex-col bg-surface-container-lowest rounded-lg p-space-md shadow-sm gap-space-sm">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">history</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Operational Audit &amp; Event Log</h3>
            </div>
            <button
              onClick={handleExport}
              className="font-code-sm text-code-sm text-on-primary bg-primary px-space-xs py-1 rounded flex items-center gap-1 shadow-sm active:opacity-90 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">download</span>
              <span>EXPORT</span>
            </button>
          </div>

          <div className="flex flex-col gap-space-xs overflow-hidden">
            {/* Item 1 */}
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">14:26:04 IST</span>
                <span className="font-label-caps text-label-caps bg-secondary-container text-on-secondary-container px-space-xs py-0.5 rounded">
                  SR. DOM ACTION
                </span>
              </div>
              <span className="font-body-md text-body-md text-on-surface">
                Sr. DOM / PRYJ confirmed block possession for <span className="font-code-sm text-code-sm font-semibold">BLK-2403-09</span>.
                Clearance token dispatched to station master.
              </span>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">14:21:18 IST</span>
                <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface px-space-xs py-0.5 rounded">
                  SYSTEM RUN
                </span>
              </div>
              <span className="font-body-md text-body-md text-on-surface">
                Re-optimization Run <span className="font-code-sm text-code-sm">#4102</span> completed. Pareto coefficient reached optimal
                index 91.4 across 12 candidate schedules.
              </span>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">13:45:00 IST</span>
                <span className="font-label-caps text-label-caps bg-secondary-fixed text-on-secondary-fixed px-space-xs py-0.5 rounded">
                  IOT TELEMETRY
                </span>
              </div>
              <span className="font-body-md text-body-md text-on-surface">
                USFD Digital Logger synced 4 new flaw tags at <span className="font-code-sm text-code-sm">Km 1072.3</span> (Sub-div 4).
                Immediate precautionary 30 km/h PSR logged.
              </span>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col p-space-xs bg-surface-container-low rounded gap-0.5">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-code-sm text-on-surface font-semibold">11:30:12 IST</span>
                <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface px-space-xs py-0.5 rounded">
                  WATCH DESK
                </span>
              </div>
              <span className="font-body-md text-body-md text-on-surface">
                Shift handover protocol logged. Desk Section Controller{' '}
                <span className="font-semibold text-on-surface">A. Sharma</span> active on PRYJ Division West Desk.
              </span>
            </div>
          </div>
        </div>

        {/* Divisional HQ Sign-off Footer Deck */}
        <div className="flex items-center justify-between bg-primary p-space-md rounded-lg text-on-primary shadow-sm mb-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary-fixed text-[20px]">assignment_turned_in</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm truncate">Audit Signed by HQ-NDLS</span>
              <span className="font-code-sm text-code-sm text-primary-fixed-dim">CRIS Integrity Hash: e7f2a891-c</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-tertiary-fixed text-[24px] shrink-0">verified_user</span>
        </div>
      </div>
    </main>
  );
}
