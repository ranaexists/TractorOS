/**
 * @file BatteryGauge.tsx
 * High precision 12V automotive battery and alternator charging gauge
 */

import React from 'react';
import { formatVoltage } from '../../core/utils/formatting';
import { BatteryCharging, Battery, Zap } from 'lucide-react';

interface BatteryGaugeProps {
  voltage: number;
  isEngineRunning: boolean;
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({ voltage, isEngineRunning }) => {
  const vData = formatVoltage(voltage);

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D0D0D] border border-[#222222]">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-[#060606] border border-[#1A1A1A] text-slate-300">
          {isEngineRunning ? (
            <BatteryCharging className="w-4 h-4 text-[#4ADE80] animate-pulse" />
          ) : (
            <Battery className="w-4 h-4 text-[#888888]" />
          )}
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#777777]">
            {isEngineRunning ? 'Alternator Charging' : '12V Battery'}
          </div>
          <div className="text-xs font-mono font-bold text-[#FFFFFF] flex items-center gap-1.5 mt-0.5">
            <span>{vData.text}</span>
            {isEngineRunning && (
              <span className="text-[9px] uppercase tracking-wider text-[#4ADE80] font-sans font-semibold flex items-center">
                <Zap className="w-2.5 h-2.5 inline mr-0.5" /> Active
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
            vData.status === 'OPTIMAL'
              ? 'bg-[#0B150F] border-[#4ADE80]/40 text-[#4ADE80]'
              : vData.status === 'NORMAL'
              ? 'bg-[#141414] border-[#2A2A2A] text-[#CCCCCC]'
              : vData.status === 'LOW'
              ? 'bg-[#140E0A] border-[#F27D26]/40 text-[#F27D26]'
              : 'bg-[#1A0A0A] border-rose-500/40 text-rose-300'
          }`}
        >
          {vData.status}
        </span>
      </div>
    </div>
  );
};
