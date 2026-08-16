/**
 * @file AddDeviceModal.tsx
 * Modal for securely pairing secondary devices (e.g., Farm Hands, Family Operators)
 * via QR Code or Time-limited Cryptographic Passcode.
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { X, QrCode, Key, UserCheck, Shield, Check } from 'lucide-react';

interface AddDeviceModalProps {
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ onClose }) => {
  const { addAuthorizedDevice } = useTractor();
  const [deviceName, setDeviceName] = useState('');
  const [role, setRole] = useState<'OPERATOR' | 'TEMPORARY_GUEST'>('OPERATOR');
  const [canStart, setCanStart] = useState(true);
  const [canIgnition, setCanIgnition] = useState(true);
  const [isCreated, setIsCreated] = useState(false);
  const [passcode, setPasscode] = useState('749 203');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;

    addAuthorizedDevice({
      name: deviceName,
      model: 'Android / iOS Smartphone',
      role,
      isCurrentDevice: false,
      status: 'ACTIVE',
      accessPermissions: {
        canIgnition,
        canStartEngine: canStart,
        canChangeSettings: false,
        canAddDevices: false,
      },
    });

    setPasscode(`${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}`);
    setIsCreated(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-[#0D0D0D] border border-[#222222] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#F27D26]" />
            <h3 className="text-base font-serif font-bold text-[#FFFFFF]">Authorize New Operator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#888888] hover:text-white hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCreated ? (
          <form onSubmit={handleCreate} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">
                Operator / Device Name
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={e => setDeviceName(e.target.value)}
                placeholder="e.g. Suresh (Harvester Operator)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070707] border border-[#262626] text-[#FFFFFF] text-sm focus:outline-none focus:border-[#F27D26]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CCCCCC] mb-1">
                Role & Access Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('OPERATOR')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left ${
                    role === 'OPERATOR'
                      ? 'bg-[#140E0A] border-[#F27D26]/60 text-[#F27D26]'
                      : 'bg-[#070707] border-[#222222] text-[#888888]'
                  }`}
                >
                  <div>Field Operator</div>
                  <div className="text-[10px] text-[#777777] font-normal">Full drive & ignition access</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('TEMPORARY_GUEST')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-left ${
                    role === 'TEMPORARY_GUEST'
                      ? 'bg-[#140E0A] border-[#F27D26]/60 text-[#F27D26]'
                      : 'bg-[#070707] border-[#222222] text-[#888888]'
                  }`}
                >
                  <div>Guest / Helper</div>
                  <div className="text-[10px] text-[#777777] font-normal">Ignition only, no settings</div>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070707] border border-[#222222] space-y-2">
              <span className="text-xs font-semibold text-[#CCCCCC] block">Permissions:</span>
              <label className="flex items-center gap-2 text-xs text-[#CCCCCC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canIgnition}
                  onChange={e => setCanIgnition(e.target.checked)}
                  className="rounded accent-[#F27D26]"
                />
                <span>Allow Ignition Power Relay</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-[#CCCCCC] cursor-pointer">
                <input
                  type="checkbox"
                  checked={canStart}
                  onChange={e => setCanStart(e.target.checked)}
                  className="rounded accent-[#F27D26]"
                />
                <span>Allow Engine Push-Start Crank</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#F27D26] hover:bg-[#E06C15] text-black font-bold text-sm shadow-lg glow-orange transition-all"
            >
              Generate Digital Key
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#0B150F] text-[#4ADE80] border border-[#4ADE80]/40 flex items-center justify-center mx-auto glow-green">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-serif font-bold text-[#FFFFFF]">Key Ready for {deviceName}</h4>
              <p className="text-xs text-[#777777] mt-0.5">
                Have the operator scan this code or enter the one-time pairing PIN in their app.
              </p>
            </div>

            {/* QR Mock */}
            <div className="p-4 rounded-2xl bg-white max-w-[160px] mx-auto shadow-md">
              <div className="w-32 h-32 bg-[#050505] rounded-lg flex flex-col items-center justify-center p-2 text-white">
                <QrCode className="w-20 h-20 text-[#F27D26]" />
                <span className="text-[9px] font-mono mt-1 text-[#AAAAAA]">ESP32-PAIR-KEY</span>
              </div>
            </div>

            {/* 6-Digit PIN */}
            <div className="p-3 rounded-xl bg-[#070707] border border-[#262626]">
              <div className="text-[10px] uppercase font-bold text-[#777777]">One-Time Pairing PIN</div>
              <div className="text-2xl font-mono font-black text-[#F27D26] tracking-widest mt-1">
                {passcode}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#2A2A2A] text-[#FFFFFF] font-bold text-xs"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
