/**
 * @file AuthorizedDevicesList.tsx
 * Multi-device management: lists owner device, field operators, and guests with revoke capability.
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { Smartphone, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { formatRelativeTime } from '../../core/utils/formatting';

export const AuthorizedDevicesList: React.FC = () => {
  const { authorizedDevices, revokeDevice } = useTractor();

  return (
    <div id="authorized-devices-list" className="p-4 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-serif text-[#FFFFFF] flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#F27D26]" />
          <span>Authorized Devices</span>
        </h3>
        <span className="text-xs font-mono text-[#888888]">
          {authorizedDevices.filter(d => d.status === 'ACTIVE').length} Active
        </span>
      </div>

      <div className="space-y-2">
        {authorizedDevices.map(device => {
          const isRevoked = device.status === 'REVOKED';

          return (
            <div
              key={device.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                isRevoked
                  ? 'bg-[#070707] border-[#181818] opacity-50'
                  : 'bg-[#070707] border-[#1E1E1E]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    device.isCurrentDevice
                      ? 'bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/40'
                      : 'bg-[#121212] text-[#AAAAAA] border border-[#222222]'
                  }`}
                >
                  📱
                </div>
                <div>
                  <div className="text-xs font-bold text-[#FFFFFF] flex items-center gap-1.5">
                    <span>{device.name}</span>
                    {device.isCurrentDevice && (
                      <span className="px-1.5 py-0.2 text-[9px] rounded bg-[#0B150F] text-[#4ADE80] border border-[#4ADE80]/30 font-mono font-bold">
                        THIS DEVICE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#777777] font-mono mt-0.5">
                    {device.role} • Active {formatRelativeTime(device.lastActive)}
                  </div>
                </div>
              </div>

              <div>
                {!device.isCurrentDevice && !isRevoked && (
                  <button
                    onClick={() => revokeDevice(device.id)}
                    className="p-1.5 rounded-lg bg-[#1A0A0A] text-rose-300 hover:bg-[#280E0E] border border-rose-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    title="Revoke access"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                )}
                {isRevoked && (
                  <span className="text-[10px] font-bold text-rose-400 font-mono uppercase">
                    Revoked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
