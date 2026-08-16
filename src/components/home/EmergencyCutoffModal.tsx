/**
 * @file EmergencyCutoffModal.tsx
 * High-priority auto-cutoff alert overlay with remaining grace period countdown
 * and "I'm Present / Cancel Cutoff" button.
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { AlertTriangle, ShieldCheck, Footprints } from 'lucide-react';

export const EmergencyCutoffModal: React.FC = () => {
  const { status, cancelCutoffWarning } = useTractor();

  const isWarningActive =
    status.operationalState === 'WARNING' || status.operationalState === 'SHUTDOWN_PENDING';
  const remaining = status.gracePeriodRemaining ?? 0;

  if (!isWarningActive) return null;

  return (
    <div
      id="emergency-cutoff-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-950 border-2 border-rose-500 shadow-2xl shadow-rose-950/80 text-center space-y-4">
        {/* Flashing Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 animate-bounce">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-wide">
            AUTO-CUTOFF WARNING
          </h2>
          <p className="text-xs text-rose-300/90 mt-1 font-medium">
            Owner moved away beyond proximity perimeter while engine is running!
          </p>
        </div>

        {/* Big Countdown Timer */}
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40">
          <div className="text-4xl font-mono font-black text-rose-400">
            {remaining} <span className="text-base font-sans font-bold">SEC</span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono mt-1">
            Engine will shut down automatically if unattended
          </div>
        </div>

        {/* Instructions */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl">
          <Footprints className="w-4 h-4 text-emerald-400" />
          <span>Walk back toward tractor cab or tap below</span>
        </div>

        {/* Action Button */}
        <button
          id="btn-cancel-cutoff-override"
          onClick={cancelCutoffWarning}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>I am Present — Cancel Cutoff</span>
        </button>
      </div>
    </div>
  );
};
