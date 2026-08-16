/**
 * @file AutoCutoffSettings.tsx
 * Configuration for Auto-Cutoff safety mechanism, grace period timer, and alerts.
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { ShieldCheck, Clock, Bell, AlertTriangle } from 'lucide-react';

export const AutoCutoffSettings: React.FC = () => {
  const { config, updateConfig } = useTractor();
  const auto = config.autoCutoff;

  const handleToggle = (enabled: boolean) => {
    updateConfig({
      autoCutoff: {
        ...auto,
        enabled,
      },
    });
  };

  const handleGracePeriodChange = (val: number) => {
    updateConfig({
      autoCutoff: {
        ...auto,
        gracePeriodSeconds: val,
      },
    });
  };

  return (
    <div id="auto-cutoff-settings-card" className="p-5 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#FFFFFF]">Auto Cutoff System</h3>
            <p className="text-xs text-[#777777]">Safeguard when driver moves away</p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={auto.enabled}
            onChange={e => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#1F1F1F] border border-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F27D26]"></div>
        </label>
      </div>

      {/* Logic Flow Graphic */}
      <div className="p-3.5 rounded-2xl bg-[#070707] border border-[#1E1E1E] space-y-2">
        <div className="text-[11px] font-semibold text-[#CCCCCC]">Cutoff Safety Sequence:</div>
        <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
          <div className="text-center">
            <div className="text-[#FFFFFF] font-bold">1. Out of Range</div>
            <div className="text-[#666666]">Owner leaves cab</div>
          </div>
          <span className="text-[#444444]">➔</span>
          <div className="text-center">
            <div className="text-[#F27D26] font-bold">2. Warning</div>
            <div className="text-[#666666]">Chime & Alert</div>
          </div>
          <span className="text-[#444444]">➔</span>
          <div className="text-center">
            <div className="text-rose-400 font-bold">3. Grace Period</div>
            <div className="text-[#666666]">{auto.gracePeriodSeconds}s countdown</div>
          </div>
          <span className="text-[#444444]">➔</span>
          <div className="text-center">
            <div className="text-rose-500 font-bold">4. Shutdown</div>
            <div className="text-[#666666]">ESP32 Cutoff</div>
          </div>
        </div>
      </div>

      {/* Grace Period Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#CCCCCC] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#777777]" /> Grace Period Duration
          </span>
          <span className="font-mono text-[#F27D26] font-bold">
            {auto.gracePeriodSeconds} Seconds
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="60"
          step="5"
          value={auto.gracePeriodSeconds}
          onChange={e => handleGracePeriodChange(parseInt(e.target.value))}
          disabled={!auto.enabled}
          className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#F27D26] disabled:opacity-40"
        />

        <div className="flex justify-between text-[10px] font-mono text-[#666666]">
          <span>10s (Fast)</span>
          <span>30s (Default)</span>
          <span>60s (Extended)</span>
        </div>
      </div>

      {/* Toggles for audible and vibration */}
      <div className="space-y-2 pt-1 border-t border-[#222222]">
        <label className="flex items-center justify-between text-xs text-[#CCCCCC] cursor-pointer">
          <span className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#777777]" /> Audible Warning Alarm
          </span>
          <input
            type="checkbox"
            checked={auto.audibleWarningEnabled}
            onChange={e =>
              updateConfig({
                autoCutoff: { ...auto, audibleWarningEnabled: e.target.checked },
              })
            }
            className="rounded accent-[#F27D26]"
          />
        </label>
      </div>
    </div>
  );
};
