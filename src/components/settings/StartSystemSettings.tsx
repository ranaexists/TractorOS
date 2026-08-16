/**
 * @file StartSystemSettings.tsx
 * Push-start safety timeout, starter crank duration limits, and interlock rules.
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { Zap, ShieldCheck } from 'lucide-react';

export const StartSystemSettings: React.FC = () => {
  const { config, updateConfig } = useTractor();
  const startSys = config.startSystem;

  return (
    <div id="start-system-settings-card" className="p-5 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/30">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-serif font-bold text-[#FFFFFF]">Push-Start System</h3>
          <p className="text-xs text-[#777777]">Solenoid crank timeouts and safety logic</p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {/* Push-Start Mode Description */}
        <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] space-y-1">
          <div className="text-xs font-serif font-bold text-[#FFFFFF]">2-Stage Sequential Push (Active)</div>
          <p className="text-[11px] text-[#888888]">
            • 1st Push: Energizes Ignition Relay & Electronics<br />
            • 2nd Push: Validates Safety Interlocks & Cranks Engine
          </p>
        </div>

        {/* Max Crank Duration */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#CCCCCC]">Starter Solenoid Timeout</span>
            <span className="font-mono text-[#F27D26] font-bold">
              {startSys.maxCrankDurationSeconds}s Max Crank
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={startSys.maxCrankDurationSeconds}
            onChange={e =>
              updateConfig({
                startSystem: {
                  ...startSys,
                  maxCrankDurationSeconds: parseFloat(e.target.value),
                },
              })
            }
            className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#F27D26]"
          />
          <div className="text-[10px] font-mono text-[#666666]">
            Protects starter motor from overheating and battery drainage.
          </div>
        </div>

        {/* Interlock requirement checkboxes */}
        <div className="space-y-2 pt-2 border-t border-[#222222]">
          <label className="flex items-center justify-between text-xs text-[#CCCCCC] cursor-pointer">
            <span>Require Clutch/Brake Pedal to Crank</span>
            <input
              type="checkbox"
              checked={startSys.requireBrakePedalToCrank}
              onChange={e =>
                updateConfig({
                  startSystem: { ...startSys, requireBrakePedalToCrank: e.target.checked },
                })
              }
              className="rounded accent-[#F27D26]"
            />
          </label>

          <label className="flex items-center justify-between text-xs text-[#CCCCCC] cursor-pointer">
            <span>Require Transmission in Neutral</span>
            <input
              type="checkbox"
              checked={startSys.autoNeutralCheck}
              onChange={e =>
                updateConfig({
                  startSystem: { ...startSys, autoNeutralCheck: e.target.checked },
                })
              }
              className="rounded accent-[#F27D26]"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
