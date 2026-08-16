/**
 * @file LiveSignalMeter.tsx
 * Real-time BLE RSSI signal meter with calibrated zones & multi-bar indicator
 */

import React from 'react';
import { formatRssi } from '../../core/utils/formatting';
import { Radio } from 'lucide-react';

interface LiveSignalMeterProps {
  rssi: number;
  isConnected: boolean;
  compact?: boolean;
}

export const LiveSignalMeter: React.FC<LiveSignalMeterProps> = ({ rssi, isConnected, compact = false }) => {
  const signal = formatRssi(rssi);

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-[#666666] font-mono text-xs">
        <Radio className="w-3.5 h-3.5 opacity-50" />
        <span>Signal: Disconnected</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center gap-2">
        {/* Visual 4-bar RSSI ladder */}
        <div className="flex items-end gap-0.5 h-4 px-1 py-0.5 bg-[#0D0D0D] rounded border border-[#222222]">
          {[1, 2, 3, 4].map(barNum => {
            const isFilled = isConnected && barNum <= signal.bars;
            return (
              <div
                key={barNum}
                className={`w-1 rounded-xs transition-all duration-300 ${
                  isFilled
                    ? barNum === 4
                      ? 'bg-[#4ADE80]'
                      : barNum === 3
                      ? 'bg-[#4ADE80]'
                      : barNum === 2
                      ? 'bg-[#F27D26]'
                      : 'bg-rose-500'
                    : 'bg-[#222222]'
                }`}
                style={{ height: `${barNum * 25}%` }}
              />
            );
          })}
        </div>

        <span className={`font-semibold ${signal.bars >= 3 ? 'text-[#4ADE80]' : signal.bars === 2 ? 'text-[#F27D26]' : 'text-rose-400'}`}>
          {signal.label}
        </span>
      </div>

      <div className="font-mono text-xs text-[#777777]">
        <span className="text-[#E0E0E0] font-bold">{rssi}</span> dBm
      </div>
    </div>
  );
};
