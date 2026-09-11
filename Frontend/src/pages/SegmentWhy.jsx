import React, { useState } from 'react';

export default function SegmentWhy() {
  const [bookingState, setBookingState] = useState('idle');
  const [simulatedRepair, setSimulatedRepair] = useState(false);

  const handleBookBlock = () => {
    if (bookingState !== 'idle') return;
    setBookingState('transmitting');
    setTimeout(() => {
      setBookingState('requested');
    }, 1200);
  };

  const handleSimulateFix = () => {
    setSimulatedRepair((prev) => !prev);
  };

  return (
    <main className="flex flex-col relative w-full">
      <div className="flex flex-col w-full gap-space-md p-space-md">
        {/* Asset Identity & Risk Summary Master Deck */}
        <section className="flex flex-col w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          {/* Top Telemetry Pill Strip */}
          <div className="flex flex-wrap items-center justify-between gap-space-xs px-space-md py-space-xs bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
            <div className="flex items-center gap-space-xs">
              <span className={`w-2 h-2 rounded-full ${simulatedRepair ? 'bg-on-tertiary-container' : 'bg-error animate-pulse'}`}></span>
              <span>DIVISION: PRYJ / NORTH CENTRAL RAILWAY</span>
            </div>
            <div className="flex items-center gap-space-sm font-code-sm text-code-sm normal-case">
              <span>
                LAST USFD INSPECTION: <strong className="text-on-surface">21-OCT-2024</strong>
              </span>
            </div>
          </div>

          {/* Segment Header Core Metrics */}
          <div className="p-space-md flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-xl text-headline-xl text-primary tracking-tight font-bold">KRJ-UP-04</span>
                  <span
                    className={`inline-flex items-center px-space-xs py-0.5 rounded font-label-caps text-label-caps uppercase ${
                      simulatedRepair ? 'bg-tertiary-container text-tertiary-fixed font-bold' : 'bg-error text-on-error'
                    }`}
                  >
                    {simulatedRepair ? 'POST-REPAIR MITIGATED' : 'CRITICAL RISK'}
                  </span>
                </div>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  Khurja Jn – Somna UP Mainline • Km 1071.800 to Km 1073.400
                </span>
              </div>

              {/* Live Risk Percentage Metric */}
              <div className="flex items-baseline sm:items-end flex-col bg-surface-container-low px-space-md py-space-xs rounded-lg">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">30-DAY FAILURE RISK</span>
                <div className="flex items-baseline gap-space-xs">
                  <span className={`font-code-lg text-headline-xl font-bold ${simulatedRepair ? 'text-on-tertiary-container' : 'text-error'}`}>
                    {simulatedRepair ? '29.1%' : '87.4%'}
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface-variant">prob.</span>
                </div>
              </div>
            </div>

            {/* Quick Operational Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-xs pt-space-xs">
              <div className="flex flex-col p-space-sm bg-surface-container-low rounded">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">AI Confidence Metric</span>
                <span className="font-code-md text-code-md font-semibold text-primary">94.2%</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Ensemble GBM + Weibull</span>
              </div>
              <div className="flex flex-col p-space-sm bg-secondary-container rounded">
                <span className="font-label-caps text-label-caps text-on-secondary-container uppercase">Recommended Block</span>
                <span className="font-code-md text-code-md font-bold text-on-secondary-fixed">90 Minutes</span>
                <span className="font-body-sm text-body-sm text-on-secondary-container">Urgent within 48h window</span>
              </div>
              <div className="flex flex-col p-space-sm bg-surface-container-low rounded">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Potential Unplanned Loss</span>
                <span className={`font-code-md text-code-md font-bold ${simulatedRepair ? 'text-on-tertiary-container' : 'text-error'}`}>
                  {simulatedRepair ? '35 Min Downtime' : '280 Min Downtime'}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {simulatedRepair ? 'Est. Normal buffer flow' : 'Est. ~14 passenger rakes held'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Plain English Synthesis Banner */}
        <section className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-high shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-space-xs">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">PRIMARY DRIVER REASONING</span>
              <span className="font-label-caps text-label-caps px-space-xs rounded bg-surface-container-lowest text-primary font-bold">
                SYNTHESIS
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface leading-snug">
              Key drivers: <span className="font-semibold text-error">2 ultrasonic weld flaws</span>, track degradation past{' '}
              <span className="font-semibold text-on-surface">36 MGT</span>, and deep screening overdue by{' '}
              <span className="font-semibold text-error">4.2 yrs</span>.
            </p>
          </div>
        </section>

        {/* SHAP-Style Explainable Feature Contribution Vector */}
        <section className="flex flex-col w-full bg-surface-container-lowest rounded-xl p-space-md shadow-sm gap-space-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">troubleshoot</span>
              <h2 className="font-headline-sm text-headline-sm text-primary">SHAP Factor Attribution (Impact on Risk)</h2>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">BASELINE: 0.12 (STANDARD TRACK)</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Attribution scores show relative deviation pushing failure probability toward 87.4%. Positive delta increases danger; negative delta preserves integrity.
          </p>

          {/* Factor 1 */}
          <div className="flex flex-col gap-1 pt-space-xs">
            <div className="flex justify-between items-baseline font-code-sm text-code-sm">
              <span className="font-medium text-on-surface truncate">1. Severe Weld Flaws (USFD Class III)</span>
              <span className={`font-bold shrink-0 ${simulatedRepair ? 'text-on-tertiary-container' : 'text-error'}`}>
                {simulatedRepair ? '-0.15 (Repaired)' : '+0.38 (+38%)'}
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-sm overflow-hidden flex">
              <div
                className={`h-full rounded-sm transition-all duration-500 ${simulatedRepair ? 'bg-on-tertiary-container' : 'bg-error'}`}
                style={{ width: simulatedRepair ? '20%' : '78%' }}
              ></div>
            </div>
          </div>

          {/* Factor 2 */}
          <div className="flex flex-col gap-1 pt-space-xs">
            <div className="flex justify-between items-baseline font-code-sm text-code-sm">
              <span className="font-medium text-on-surface truncate">2. Cumulative Gross Tonnage (Overdue MGT)</span>
              <span className="font-bold text-secondary shrink-0">+0.24 (+24%)</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-sm overflow-hidden flex">
              <div className="h-full bg-secondary rounded-sm transition-all duration-500" style={{ width: '52%' }}></div>
            </div>
          </div>

          {/* Factor 3 */}
          <div className="flex flex-col gap-1 pt-space-xs">
            <div className="flex justify-between items-baseline font-code-sm text-code-sm">
              <span className="font-medium text-on-surface truncate">3. Ambient Rail Temperature Delta</span>
              <span className="font-bold text-secondary shrink-0">+0.14 (+14%)</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-sm overflow-hidden flex">
              <div className="h-full bg-secondary rounded-sm transition-all duration-500" style={{ width: '32%' }}></div>
            </div>
          </div>

          {/* Factor 4 */}
          <div className="flex flex-col gap-1 pt-space-xs">
            <div className="flex justify-between items-baseline font-code-sm text-code-sm">
              <span className="font-medium text-on-surface truncate">4. Asset Age &amp; Deep Metal Fatigue</span>
              <span className="font-bold text-secondary-container text-on-secondary-fixed shrink-0">+0.11 (+11%)</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-sm overflow-hidden flex">
              <div className="h-full bg-outline rounded-sm transition-all duration-500" style={{ width: '24%' }}></div>
            </div>
          </div>

          {/* Factor 5 */}
          <div className="flex flex-col gap-1 pt-space-xs">
            <div className="flex justify-between items-baseline font-code-sm text-code-sm">
              <span className="font-medium text-on-surface truncate">5. S&amp;T Track Circuit Telemetry Variance</span>
              <span className="font-bold text-on-surface-variant shrink-0">+0.07 (+7%)</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-sm overflow-hidden flex">
              <div className="h-full bg-outline-variant rounded-sm transition-all duration-500" style={{ width: '16%' }}></div>
            </div>
          </div>

          {/* Factor 6 */}
          <div className="flex flex-col gap-1 pt-space-xs">
            <div className="flex justify-between items-baseline font-code-sm text-code-sm">
              <span className="font-medium text-on-surface truncate">6. Fastener Elastic Rail Clip (ERC) Renewal</span>
              <span className="font-bold text-on-tertiary-container shrink-0">-0.06 (-6%)</span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-sm overflow-hidden flex">
              <div className="h-full bg-on-tertiary-container rounded-sm transition-all duration-500" style={{ width: '12%' }}></div>
            </div>
          </div>
        </section>

        {/* Recent Track Inspection & Defect Log */}
        <section className="flex flex-col w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="px-space-md py-space-sm bg-surface-container flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-primary">history</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">Telemetry Inspection &amp; Defect Registry</h3>
            </div>
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">PAST 30 DAYS</span>
          </div>

          {/* Defect Feed Items */}
          <div className="flex flex-col">
            {/* Item 1: High Priority USFD */}
            <div className="flex flex-col p-space-md border-b-0 bg-error-container/20">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm font-bold text-on-error-container">21-OCT-2024</span>
                  <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-error text-on-error uppercase font-bold">
                    Priority 1
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant">USFD #W-882</span>
              </div>
              <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">
                Alumino-Thermic (AT) Weld Fissure (0.8mm internal micro-crack)
              </span>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant mt-1">
                <span>Km 1072.300 • Joint ID: KRJ-SOM-W14</span>
                <span className="font-code-sm text-code-sm font-bold text-error">IMMEDIATE CLAMP / RENEWAL</span>
              </div>
            </div>

            {/* Item 2: OMS-2000 */}
            <div className="flex flex-col p-space-md bg-surface-container-lowest">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm font-bold text-on-surface">14-OCT-2024</span>
                  <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-secondary-container text-on-secondary-fixed uppercase font-bold">
                    Caution Order
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant">OMS-2000 RUN #604</span>
              </div>
              <span className="font-body-md text-body-md text-on-surface mt-1">
                High vertical track acceleration peak of <strong className="font-code-sm">0.34g</strong> registered at Km 1072.100
              </span>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant mt-1">
                <span>Speed restricted to 50 km/h under Special TSR</span>
                <span className="font-label-caps text-label-caps text-secondary font-semibold">TSR ACTIVE</span>
              </div>
            </div>

            {/* Item 3: P-Way Inspection */}
            <div className="flex flex-col p-space-md bg-surface-container-low">
              <div className="flex items-center justify-between gap-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-code-sm text-code-sm font-bold text-on-surface">02-OCT-2024</span>
                  <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-tertiary-container text-tertiary-fixed uppercase font-bold">
                    Completed
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-on-surface-variant">PW-SEC-ROUTINE</span>
              </div>
              <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant mt-1">
                <span>Km 1072.000 • Track Liners &amp; Rubber Sole Plates</span>
                <span className="font-code-sm text-code-sm text-on-tertiary-container font-semibold">VERIFIED OK</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Action Trigger Bay */}
        <section className="flex flex-col sm:flex-row gap-space-sm w-full">
          <button
            onClick={handleBookBlock}
            disabled={bookingState !== 'idle'}
            className={`flex-1 flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg font-headline-sm text-headline-sm transition-all active:scale-[0.99] ${
              bookingState === 'requested'
                ? 'bg-tertiary-container text-tertiary-fixed'
                : 'bg-primary-container text-on-primary hover:bg-primary'
            }`}
          >
            {bookingState === 'transmitting' ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Transmitting to COA Desk...</span>
              </>
            ) : bookingState === 'requested' ? (
              <>
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">check_circle</span>
                <span>Block Slot Requested (#BLK-KRJ-48H)</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
                <span>Request 90-Min Maintenance Block</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulateFix}
            className={`flex items-center justify-center gap-space-xs px-space-md py-space-sm rounded-lg font-headline-sm text-headline-sm transition-all active:scale-[0.99] ${
              simulatedRepair
                ? 'bg-on-tertiary-container text-on-primary'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>{simulatedRepair ? 'Reset Simulation' : 'What-If: Simulate Weld Repair'}</span>
          </button>
        </section>

        {/* Model Governance, Calibration & Section Authority Bar */}
        <footer className="flex flex-col gap-space-xs p-space-md rounded-xl bg-surface-container text-on-surface-variant shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-xs font-label-caps text-label-caps uppercase tracking-wider">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>MODEL: RAILTWIN-RISK-V3.4.1 (XGBOOST + COX PROPORTIONAL HAZARD)</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
              <span>CALIBRATION: BSS 0.041 (OPTIMAL)</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs pt-space-xs font-code-sm text-code-sm text-on-surface">
            <div className="flex items-center gap-space-xs">
              <span className="text-on-surface-variant">Ingested Data Pipeline:</span>
              <span className="font-semibold">CRIS / COA / USFD Digital Logger (14:21:05 IST)</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="text-on-surface-variant">Section In-Charge:</span>
              <span className="font-semibold">Sr. DEN / Co-ordination / PRYJ</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
