/**
 * @file KeyManagementCard.tsx
 * Digital Key overview: Owner Key Active, Device Info, Cryptographic Security & Revocation
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { KeyRound, ShieldCheck, Smartphone, Lock, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { AddDeviceModal } from './AddDeviceModal';

export const KeyManagementCard: React.FC = () => {
  const { digitalKeys, status, setIsPairingWizardOpen } = useTractor();
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const activeKey = digitalKeys.find(k => k.isActive) || digitalKeys[0];

  const handleRevoke = () => {
    if (confirm('Are you sure you want to revoke this digital key? You will need to re-pair with the physical tractor.')) {
      setIsRevoking(true);
      setTimeout(() => {
        setIsRevoking(false);
        setIsPairingWizardOpen(true);
      }, 500);
    }
  };

  return (
    <div id="digital-key-management-card" className="space-y-4">
      {/* Master Digital Key Card */}
      <div className="p-5 rounded-3xl bg-[#0D0D0D] border border-[#222222] shadow-2xl relative overflow-hidden">
        {/* Holographic corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F27D26]/10 rounded-full blur-3xl" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#140E0A] border border-[#F27D26]/40 flex items-center justify-center text-[#F27D26]">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#F27D26] font-bold uppercase tracking-widest">
                Digital Key
              </div>
              <h2 className="text-lg font-serif font-bold text-[#FFFFFF]">Owner Key</h2>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-[#0B150F] border border-[#4ADE80]/40 text-[#4ADE80] text-xs font-bold flex items-center gap-1.5 shadow-sm glow-green">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            ACTIVE
          </span>
        </div>

        {/* Security Matrix */}
        <div className="space-y-2.5 pt-2 border-t border-[#222222]">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#888888] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#888888]" /> Device
            </span>
            <span className="font-semibold text-[#FFFFFF]">{activeKey?.deviceName || 'This Phone'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#888888] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80]" /> Authentication
            </span>
            <span className="font-semibold text-[#4ADE80]">Secure (HMAC-SHA256)</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#888888]">Key Fingerprint</span>
            <span className="text-[#CCCCCC] text-[11px]">{activeKey?.publicKeyFingerprint || 'PUB-8F99-2B3A-4C5D'}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#888888]">Tractor Binding</span>
            <span className="text-[#CCCCCC] text-[11px]">{status.tractorId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-4 mt-2 border-t border-[#222222]">
          <button
            id="btn-revoke-key"
            onClick={handleRevoke}
            disabled={isRevoking}
            className="py-2.5 px-3 rounded-xl bg-[#1A0A0A] hover:bg-[#250E0E] border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Revoke Key</span>
          </button>

          <button
            id="btn-add-device"
            onClick={() => setIsAddDeviceOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-[#140E0A] hover:bg-[#1F150E] border border-[#F27D26]/50 text-[#F27D26] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 glow-orange"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {isAddDeviceOpen && <AddDeviceModal onClose={() => setIsAddDeviceOpen(false)} />}
    </div>
  );
};
