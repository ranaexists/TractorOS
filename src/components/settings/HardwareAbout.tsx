/**
 * @file HardwareAbout.tsx
 * System metadata, ESP32 device ID, BLE GATT UUIDs, and developer switch.
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { BLE_CONFIG } from '../../types/ble';
import { Cpu, Terminal, Copy, Check, ChevronDown, ChevronUp, Code } from 'lucide-react';

export const HardwareAbout: React.FC = () => {
  const { status, isMockMode, toggleMockMode, setIsPairingWizardOpen } = useTractor();
  const [copied, setCopied] = useState(false);
  const [showUuids, setShowUuids] = useState(false);

  const copyConfig = () => {
    const data = JSON.stringify(
      {
        tractorId: status.tractorId,
        firmware: status.firmwareVersion,
        protocol: BLE_CONFIG.PROTOCOL_VERSION,
        serviceUuid: BLE_CONFIG.SERVICE_UUID,
        commandChar: BLE_CONFIG.COMMAND_CHAR_UUID,
        statusChar: BLE_CONFIG.STATUS_CHAR_UUID,
        authChar: BLE_CONFIG.AUTH_CHAR_UUID,
      },
      null,
      2
    );
    navigator.clipboard?.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="hardware-about-card" className="p-5 rounded-3xl bg-[#0D0D0D] border border-[#222222] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#FFFFFF]">Hardware & Firmware</h3>
            <p className="text-xs text-[#777777]">ESP32 BLE Controller Architecture</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Toggle */}
      <div className="p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-[#FFFFFF]">Hardware Execution Mode</div>
          <div className="text-[11px] text-[#777777]">
            {isMockMode ? 'Interactive ESP32 Simulator' : 'Physical Web Bluetooth (GATT)'}
          </div>
        </div>
        <button
          onClick={toggleMockMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            isMockMode
              ? 'bg-[#140E0A] border-[#F27D26]/50 text-[#F27D26]'
              : 'bg-[#0B150F] border-[#4ADE80]/50 text-[#4ADE80]'
          }`}
        >
          {isMockMode ? 'Simulator Active' : 'Real BLE Active'}
        </button>
      </div>

      {/* Hardware Specs Table */}
      <div className="space-y-2 text-xs font-mono border-t border-[#222222] pt-3">
        <div className="flex justify-between">
          <span className="text-[#777777]">Tractor Model</span>
          <span className="text-[#FFFFFF] font-bold">{status.tractorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#777777]">Device ID</span>
          <span className="text-[#CCCCCC]">{status.tractorId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#777777]">Firmware Version</span>
          <span className="text-[#4ADE80] font-bold">{status.firmwareVersion}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#777777]">Protocol Spec</span>
          <span className="text-[#CCCCCC]">v{BLE_CONFIG.PROTOCOL_VERSION}</span>
        </div>
      </div>

      {/* Expandable UUIDs */}
      <div className="border-t border-[#222222] pt-2">
        <button
          onClick={() => setShowUuids(!showUuids)}
          className="w-full flex items-center justify-between text-xs text-[#888888] hover:text-[#FFFFFF] py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5" /> BLE GATT Characteristic UUIDs
          </span>
          {showUuids ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showUuids && (
          <div className="mt-2 p-3 rounded-2xl bg-[#070707] border border-[#1E1E1E] text-[10px] font-mono space-y-1.5 text-[#AAAAAA] overflow-x-auto">
            <div>
              <span className="text-[#F27D26]">SERVICE: </span>
              {BLE_CONFIG.SERVICE_UUID}
            </div>
            <div>
              <span className="text-[#4ADE80]">COMMAND: </span>
              {BLE_CONFIG.COMMAND_CHAR_UUID}
            </div>
            <div>
              <span className="text-[#4ADE80]">STATUS: </span>
              {BLE_CONFIG.STATUS_CHAR_UUID}
            </div>
            <div>
              <span className="text-[#F27D26]">AUTH: </span>
              {BLE_CONFIG.AUTH_CHAR_UUID}
            </div>
          </div>
        )}
      </div>

      {/* Diagnostic Export & Re-pair */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#222222]">
        <button
          onClick={copyConfig}
          className="py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-[#1F1F1F] text-[#E0E0E0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#2A2A2A]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied JSON' : 'Export UUIDs'}</span>
        </button>

        <button
          onClick={() => setIsPairingWizardOpen(true)}
          className="py-2.5 px-3 rounded-xl bg-[#140E0A] hover:bg-[#1F1208] text-[#F27D26] border border-[#F27D26]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Pairing Wizard</span>
        </button>
      </div>
    </div>
  );
};
