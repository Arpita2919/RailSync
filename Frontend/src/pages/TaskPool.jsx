import React, { useState } from 'react';

export default function TaskPool() {
  const [toastMessage, setToastMessage] = useState(null);
  const [trdRevised, setTrdRevised] = useState(false);
  const [filterDept, setFilterDept] = useState('All');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const approveConsolidatedBatch = () => {
    showToast("Batch Approved: ENG-891, SNT-112 locked for 150m corridor window. Notices dispatched to Control Desk.");
  };

  const requestTRDEvidence = () => {
    showToast("Audit Notice Sent to TRD Dy.CEE: Thermal imaging log & OHE wear logs requested for TSK-TRD-304.");
  };

  const triggerTRDReEvaluation = () => {
    setTrdRevised(true);
    showToast("TSK-TRD-304 trimmed to 45 min shadow occupancy. Priority status set to LOW.");
  };

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
                CYCLE 24-B
              </span>
              <span className="font-label-caps text-label-caps bg-surface-container-highest text-on-surface-variant px-space-xs py-0.5 rounded">
                DIV: PRYJ // SECTION: NDLS-DDU
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
              <span className="font-code-sm text-code-sm text-on-surface-variant font-medium">EVAL ENGINE v4.2</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Maintenance Possession Negotiation</h1>
            <span className="font-code-sm text-code-sm text-on-secondary-container bg-surface-container px-space-xs py-0.5 rounded">
              WINDOW: 13:30 - 18:00 IST
            </span>
          </div>
        </div>

        {/* Telemetry Strip & Quick Stats Bento */}
        <div className="px-gutter py-space-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
            {/* Total Demands */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant">TOTAL SUBMITTED</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">format_list_bulleted</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-primary font-bold">18</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Demands</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-primary h-full w-full"></div>
              </div>
            </div>

            {/* Pre-Approved */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-tertiary-container">PRE-APPROVED</span>
                <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">check_circle</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-on-tertiary-container font-bold">6</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Slots booked</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-tertiary-fixed-dim h-full w-1/3"></div>
              </div>
            </div>

            {/* Consolidated Candidates */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant">SYNERGY POOL</span>
                <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[16px]">merge_type</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-on-secondary-fixed font-bold">5</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Coordinated</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-secondary-fixed-dim h-full w-5/12"></div>
              </div>
            </div>

            {/* Inflated Claims */}
            <div className="bg-surface-container-lowest p-space-sm rounded-lg flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-error">INFLATED / AUDIT</span>
                <span className="material-symbols-outlined text-error text-[16px]">gavel</span>
              </div>
              <div className="flex items-baseline gap-space-xs mt-space-xs">
                <span className="font-headline-xl text-headline-xl text-error font-bold">{trdRevised ? '2' : '3'}</span>
                <span className="font-code-sm text-code-sm text-error">Flagged AI</span>
              </div>
              <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden mt-space-xs">
                <div className="bg-error h-full" style={{ width: trdRevised ? '16%' : '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Consolidated Synergy Banner Spotlight */}
        <div className="px-gutter pt-space-sm">
          <div className="bg-primary-container text-on-primary rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary-fixed text-[20px]">hub</span>
                <span className="font-code-lg text-code-lg text-on-primary">SYNERGY CLUSTER #04</span>
                <span className="font-label-caps text-label-caps bg-secondary/40 text-on-primary px-space-xs py-0.5 rounded">
                  RECOMMENDED COMBO
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-tertiary-fixed bg-tertiary-container px-space-xs py-0.5 rounded">
                  NET SAVINGS: 160 MIN
                </span>
              </div>
            </div>

            {/* Visual Metric Comparison Strip */}
            <div className="bg-primary/60 rounded p-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-on-primary-container">SUM INDIVIDUAL REQUESTS</span>
                  <span className="font-code-md text-code-md text-error-container line-through">310 min</span>
                </div>
                <span className="material-symbols-outlined text-on-primary-container text-[18px]">trending_flat</span>
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-tertiary-fixed">OPTIMIZED OCCUPANCY</span>
                  <span className="font-code-lg text-code-lg text-on-primary font-bold">150 min (14:00 - 16:30)</span>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto">
                <span className="font-body-sm text-body-sm text-on-primary-container">Km 1044-1048 Section Corridor</span>
                <div className="font-code-sm text-code-sm text-tertiary-fixed">Pass Capacity Gain: +3 Paths</div>
              </div>
            </div>

            {/* Quick Group Chips */}
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="font-code-sm text-code-sm bg-surface-container-lowest text-primary px-space-xs py-0.5 rounded font-semibold">
                ENG-891 (Heavy)
              </span>
              <span className="text-on-primary-container">+</span>
              <span className="font-code-sm text-code-sm bg-surface-container-lowest text-primary px-space-xs py-0.5 rounded font-semibold">
                SNT-112 (Shadow)
              </span>
              <span className="text-on-primary-container">+</span>
              <span className="font-code-sm text-code-sm bg-surface-container-lowest text-primary px-space-xs py-0.5 rounded font-semibold">
                TRD-304 (Trimmed)
              </span>
            </div>
          </div>
        </div>

        {/* Operational Task Demands List */}
        <div className="px-gutter pt-space-md pb-space-lg flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">Department Demands Analysis</span>
              <span className="font-label-caps text-label-caps bg-surface-container-high text-on-surface-variant px-space-xs py-0.5 rounded">
                EVIDENCE AUDITED
              </span>
            </div>
            <button
              onClick={() => setFilterDept((prev) => (prev === 'All' ? 'Critical' : 'All'))}
              className="font-code-sm text-code-sm text-on-secondary-fixed bg-secondary-container px-space-sm py-1 rounded flex items-center gap-space-xs"
            >
              <span className="material-symbols-outlined text-[14px]">filter_list</span>
              <span>Filter ({filterDept})</span>
            </button>
          </div>

          {/* ITEM 1: Engineering (P-Way) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-start justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-code-lg text-code-lg text-primary font-bold">TSK-ENG-891</span>
                <span className="font-label-caps text-label-caps bg-surface-container-high text-on-surface px-space-xs py-0.5 rounded uppercase">
                  Engineering (P-Way)
                </span>
                <span className="font-code-sm text-code-sm bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-semibold">
                  CRITICAL (LVL 1)
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-on-surface-variant">OMS AUDIT</span>
                <span className="font-code-md text-code-md bg-tertiary-container text-tertiary-fixed px-space-xs py-0.5 rounded font-bold">
                  88 / 100
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-on-surface font-headline-sm text-headline-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary">construction</span>
                <span>Deep Screening Ballast Cleaner Machine (BCM-12)</span>
              </div>
              <div className="flex items-center gap-space-md text-on-surface-variant font-code-sm text-code-sm flex-wrap">
                <span>Location: Km 1044.200 - 1048.800 (Down Main)</span>
                <span>•</span>
                <span>Tamping Unit Follow-up: Plasser 08-32</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded p-space-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">analytics</span>
                <div className="flex flex-col">
                  <span className="font-code-sm text-code-sm text-on-surface font-semibold">Evidence: OMS-2000 Peak Value 0.28g</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Last track recording run #104 detects high acceleration peaks. Validated by P-Way ADEN.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center shrink-0">
                <div className="text-right">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">MIN: 120m</span>
                  <span className="font-code-sm text-code-sm text-on-surface block font-bold">REQ: 180m</span>
                </div>
                <div className="h-6 w-[1px] bg-outline-variant"></div>
                <div className="text-right">
                  <span className="font-label-caps text-label-caps text-on-tertiary-container">REC ALLOC</span>
                  <span className="font-code-lg text-code-lg text-on-tertiary-container block font-bold">150 min</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container p-space-sm rounded flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-on-secondary-container text-[16px]">call_merge</span>
                <span className="font-body-md text-body-md text-on-secondary-container">
                  <strong className="font-semibold text-on-surface">AI Rec:</strong> Consolidate with S&T Circuit Swap and TRD OHE Window at
                  14:00. Approve 150m.
                </span>
              </div>
              <span className="font-label-caps text-label-caps bg-tertiary-container text-tertiary-fixed px-space-xs py-0.5 rounded">
                PRIORITY: HIGH
              </span>
            </div>
          </div>

          {/* ITEM 2: Traction (TRD) */}
          <div
            className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm ring-1 ${
              trdRevised ? 'ring-on-tertiary-container/20' : 'ring-error/20'
            }`}
          >
            <div className="flex items-start justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-code-lg text-code-lg text-primary font-bold">TSK-TRD-304</span>
                <span className="font-label-caps text-label-caps bg-surface-container-high text-on-surface px-space-xs py-0.5 rounded uppercase">
                  Traction (TRD / OHE)
                </span>
                <div
                  className={`flex items-center gap-space-xs px-space-xs py-0.5 rounded ${
                    trdRevised ? 'bg-tertiary-container text-tertiary-fixed' : 'bg-error-container text-on-error-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{trdRevised ? 'check' : 'warning'}</span>
                  <span className="font-code-sm text-code-sm font-semibold">
                    {trdRevised ? 'REVISED: ROUTINE (LVL 3)' : 'CLAIMED: CRITICAL (LVL 1)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-error font-bold">AUDIT SCORE</span>
                <span className="font-code-md text-code-md bg-error-container text-on-error-container px-space-xs py-0.5 rounded font-bold">
                  34 / 100
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-on-surface font-headline-sm text-headline-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary">flash_on</span>
                <span>Routine Isolator Cleaning & Contact Wire Tensioning</span>
              </div>
              <div className="flex items-center gap-space-md text-on-surface-variant font-code-sm text-code-sm flex-wrap">
                <span>Location: Somna Sub-station Feeder (Up & Down)</span>
                <span>•</span>
                <span>Tower Wagon TW-44 requested</span>
              </div>
            </div>

            <div className="bg-error-container/30 rounded p-space-sm flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-error">
                <span className="material-symbols-outlined text-[18px]">gavel</span>
                <span className="font-headline-sm text-headline-sm font-semibold">INFLATED-CLAIM WARNING DETECTED</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface">
                Claimed Critical Level 1, but telemetry shows last contact wire wear was only <strong>12%</strong> and thermal imaging shows
                normal gradient (38°C ambient). No arcing recorded by locomotive pantograph telemetry.
              </p>
              <div className="flex items-center justify-between flex-wrap gap-space-xs pt-space-xs">
                <span className="font-code-sm text-code-sm text-error font-medium">
                  {trdRevised
                    ? 'Successfully revised to 45 min shadow block.'
                    : 'Downgraded to Routine Level 3. Evidence Score: 34/100'}
                </span>
                <div className="flex items-center gap-space-sm font-code-sm text-code-sm text-on-surface-variant">
                  <span>Min Req: 60m</span>
                  <span>|</span>
                  <span className="text-error line-through">Requested: 150m</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-space-xs pt-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-space-xs py-0.5 rounded">
                  {trdRevised ? 'STATUS: REVISED & CONFIRMED' : 'RECOMMENDATION: DEFER OR TRIM TO 45M'}
                </span>
              </div>
              {!trdRevised && (
                <button
                  onClick={triggerTRDReEvaluation}
                  className="font-code-sm text-code-sm bg-surface-container-highest text-on-surface px-space-sm py-1 rounded hover:bg-surface-container-high flex items-center gap-space-xs transition"
                >
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span>Force Downward Revision (45m)</span>
                </button>
              )}
            </div>
          </div>

          {/* ITEM 3: Signalling & Telecom (S&T) */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-sm">
            <div className="flex items-start justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-code-lg text-code-lg text-primary font-bold">TSK-SNT-112</span>
                <span className="font-label-caps text-label-caps bg-surface-container-high text-on-surface px-space-xs py-0.5 rounded uppercase">
                  Signalling & Telecom (S&T)
                </span>
                <span className="font-code-sm text-code-sm bg-secondary-container text-on-secondary-fixed px-space-xs py-0.5 rounded font-semibold">
                  URGENT (LVL 2)
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="font-label-caps text-label-caps text-on-tertiary-container">VERIFIED</span>
                <span className="font-code-md text-code-md bg-tertiary-container text-tertiary-fixed px-space-xs py-0.5 rounded font-bold">
                  92 / 100
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-on-surface font-headline-sm text-headline-sm">
                <span className="material-symbols-outlined text-[18px] text-secondary">alt_route</span>
                <span>Dual SSDAC Track Circuit Sensor Replacement</span>
              </div>
              <div className="flex items-center gap-space-md text-on-surface-variant font-code-sm text-code-sm flex-wrap">
                <span>Location: KRJ Yard Outer Point 214-A/B</span>
                <span>•</span>
                <span>Axle Counter Relay Rack Relocation</span>
              </div>
            </div>

            <div className="bg-surface-container-low rounded p-space-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">troubleshoot</span>
                <div className="flex flex-col">
                  <span className="font-code-sm text-code-sm text-on-surface font-semibold">Event Log: 4 Axle-counter transient reset flags</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Intermittent reset pulse logged over last 72 hours. High safety impact.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-md self-end sm:self-center shrink-0">
                <div className="text-right">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">MIN: 45m</span>
                  <span className="font-code-sm text-code-sm text-on-surface block font-bold">REQ: 60m</span>
                </div>
                <div className="h-6 w-[1px] bg-outline-variant"></div>
                <div className="text-right">
                  <span className="font-label-caps text-label-caps text-on-tertiary-container">APPROVED</span>
                  <span className="font-code-lg text-code-lg text-on-tertiary-container block font-bold">60 min</span>
                </div>
              </div>
            </div>

            <div className="bg-surface-container p-space-sm rounded flex items-center justify-between flex-wrap gap-space-xs">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">layers</span>
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  Status: Approved as Zero-Impact Shadowing Block during ENG-891 closure.
                </span>
              </div>
              <span className="font-label-caps text-label-caps bg-tertiary-container text-tertiary-fixed px-space-xs py-0.5 rounded">
                ZERO ADDED DETENTION
              </span>
            </div>
          </div>
        </div>

        {/* Sticky Operational Command Bar */}
        <div className="p-gutter bg-surface-container-lowest shadow-[0_-2px_10px_rgba(0,0,0,0.06)] sticky bottom-0 z-40">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">handshake</span>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Consolidated Batch Ready</span>
                <span className="font-code-sm text-code-sm text-on-surface-variant">Cluster #04 (3 Tasks) saves 160 corridor minutes</span>
              </div>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <button
                onClick={requestTRDEvidence}
                className="flex-1 sm:flex-initial px-space-md py-space-sm rounded bg-surface-container-high text-on-surface font-code-sm text-code-sm flex items-center justify-center gap-space-xs hover:bg-surface-container-highest transition"
              >
                <span className="material-symbols-outlined text-[16px]">help_outline</span>
                <span>Request TRD Evidence</span>
              </button>
              <button
                onClick={approveConsolidatedBatch}
                className="flex-1 sm:flex-initial px-space-lg py-space-sm rounded bg-primary text-on-primary font-code-md text-code-md font-semibold flex items-center justify-center gap-space-xs hover:bg-primary-container transition shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Approve Consolidated Batch</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
