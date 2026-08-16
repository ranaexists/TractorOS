/**
 * @file ProximitySettings.tsx
 * BLE RSSI Proximity Sensitivity Calibration & RF Smoothing Configuration
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { Radio, AlertCircle } from 'lucide-react';
import { LiveSignalMeter } from '../common/LiveSignalMeter';

export const ProximitySettings: React.FC = () => {
  const { config, updateConfig, status } = useTractor();
  const prox = config.proximity;

  const handleSensitivityChange = (val: number) => {
    updateConfig({
      proximity: {
        ...prox,
        sensitivity: val,
      },
    });
  };

  return (
    <div id="proximity-settings-card" className="p-5 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/30">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#FFFFFF]">Proximity Detection</h3>
            <p className="text-xs text-[#777777]">BLE RSSI boundary calibration</p>
          </div>
        </div>
      </div>

      {/* Live Proximity Readout */}
      <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E]">
        <div className="text-[11px] font-semibold text-[#888888] mb-1.5">Live Tractor Signal:</div>
        <LiveSignalMeter rssi={status.currentRssi} isConnected={status.connection === 'CONNECTED'} />
      </div>

      {/* Sensitivity Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#CCCCCC]">Sensitivity Level</span>
          <span className="font-mono text-[#F27D26] font-bold">
            {prox.sensitivity === 1
              ? 'Low (Cab Strict)'
              : prox.sensitivity === 3
              ? 'Medium (Balanced)'
              : prox.sensitivity === 5
              ? 'High (Wide Field)'
              : `Level ${prox.sensitivity}`}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={prox.sensitivity}
          onChange={e => handleSensitivityChange(parseInt(e.target.value))}
          className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#F27D26]"
        />

        <div className="flex justify-between text-[10px] font-mono text-[#666666]">
          <span>Near Only (1)</span>
          <span>Standard (3)</span>
          <span>Wide Range (5)</span>
        </div>
      </div>

      {/* Engineering RF Note */}
      <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] text-[11px] text-[#777777] flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-[#F27D26] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#CCCCCC]">RF Propagation Notice:</span> Bluetooth signal strength naturally fluctuates based on tractor metal body panels, implement attachments, and phone pocket placement. The software applies Exponential Moving Average smoothing.
        </div>
      </div>
    </div>
  );
};
