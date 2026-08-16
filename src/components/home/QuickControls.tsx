/**
 * @file QuickControls.tsx
 * Quick automotive utility buttons: Lock / Unlock, Horn Chirp, Hazard Flashers
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { Lock, Unlock, Bell, Lightbulb } from 'lucide-react';

export const QuickControls: React.FC = () => {
  const { status, lockTractor, unlockTractor, chirpHorn, toggleHazards } = useTractor();

  const isLocked = status.lockState === 'LOCKED';
  const isConnected = status.connection === 'CONNECTED';

  return (
    <div id="quick-controls-bar" className="grid grid-cols-3 gap-2.5">
      {/* Lock / Unlock Toggle */}
      <button
        id="btn-lock-toggle"
        onClick={() => (isLocked ? unlockTractor() : lockTractor())}
        disabled={!isConnected}
        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
          isLocked
            ? 'bg-[#140E0A] border-[#F27D26]/40 text-[#F27D26] hover:bg-[#1A120D]'
            : 'bg-[#0B150F] border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#0E1D13]'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <div className="p-2 rounded-xl bg-[#060606] border border-[#1A1A1A] mb-1.5 shadow-inner">
          {isLocked ? <Lock className="w-5 h-5 text-[#F27D26]" /> : <Unlock className="w-5 h-5 text-[#4ADE80]" />}
        </div>
        <span className="text-xs font-bold text-[#FFFFFF] font-serif tracking-tight">{isLocked ? 'Unlock Cab' : 'Lock Cab'}</span>
      </button>

      {/* Horn Chirp / Finder */}
      <button
        id="btn-horn-chirp"
        onClick={chirpHorn}
        disabled={!isConnected}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0D0D0D] border border-[#222222] text-[#CCCCCC] hover:border-[#333333] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="p-2 rounded-xl bg-[#060606] border border-[#1A1A1A] mb-1.5 shadow-inner">
          <Bell className="w-5 h-5 text-[#4ADE80]" />
        </div>
        <span className="text-xs font-bold text-[#FFFFFF] font-serif tracking-tight">Horn Chirp</span>
      </button>

      {/* Hazard Lights */}
      <button
        id="btn-toggle-hazards"
        onClick={toggleHazards}
        disabled={!isConnected}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0D0D0D] border border-[#222222] text-[#CCCCCC] hover:border-[#333333] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <div className="p-2 rounded-xl bg-[#060606] border border-[#1A1A1A] mb-1.5 shadow-inner">
          <Lightbulb className="w-5 h-5 text-[#F27D26]" />
        </div>
        <span className="text-xs font-bold text-[#FFFFFF] font-serif tracking-tight">Hazard Flash</span>
      </button>
    </div>
  );
};
