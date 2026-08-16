/**
 * @file SafetyInterlockPanel.tsx
 * Live hardware safety conditions reported directly by the authoritative ESP32 firmware.
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export const SafetyInterlockPanel: React.FC = () => {
  const { status } = useTractor();
  const [isExpanded, setIsExpanded] = useState(false);

  const safetyItems = [
    {
      id: 'neutral',
      label: 'Neutral Gear Engaged',
      description: 'Transmission gear lever in Neutral',
      isOk: status.safety.neutralGearEngaged,
    },
    {
      id: 'clutch',
      label: 'Clutch / Brake Depressed',
      description: 'Operator foot pedal interlock pressed',
      isOk: status.safety.clutchBrakePressed,
    },
    {
      id: 'seat',
      label: 'Operator Seat Switch',
      description: 'Weight sensor confirms driver seated',
      isOk: status.safety.operatorSeatOccupied,
    },
    {
      id: 'estop',
      label: 'Emergency Stop Disengaged',
      description: 'Physical red E-stop mushroom switch normal',
      isOk: status.safety.emergencyStopDisengaged,
    },
    {
      id: 'pto',
      label: 'PTO Disengaged',
      description: 'Power Take-Off shaft clutch OFF',
      isOk: status.safety.ptoDisengaged,
    },
    {
      id: 'voltage',
      label: '12V Battery Health',
      description: 'Sufficient cranking voltage (>11.8V)',
      isOk: status.safety.batteryVoltageSufficient && status.batteryVoltage >= 11.8,
    },
  ];

  const allOk = safetyItems.every(i => i.isOk);
  const passedCount = safetyItems.filter(i => i.isOk).length;

  return (
    <div id="safety-interlocks-panel" className="p-3.5 rounded-2xl bg-[#0D0D0D] border border-[#222222]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${
              allOk
                ? 'bg-[#0B150F] border-[#4ADE80]/30 text-[#4ADE80]'
                : 'bg-[#140E0A] border-[#F27D26]/30 text-[#F27D26]'
            }`}
          >
            {allOk ? <ShieldCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-[#FFFFFF] flex items-center gap-2">
              <span>Hardware Safety Interlocks</span>
              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                  allOk ? 'bg-[#0B150F] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#140E0A] text-[#F27D26] border-[#F27D26]/30'
                }`}
              >
                {passedCount}/{safetyItems.length} PASS
              </span>
            </div>
            <p className="text-[10px] text-[#777777] mt-0.5">
              {allOk ? 'All ESP32 engine start conditions satisfied' : 'Some safety switches need attention'}
            </p>
          </div>
        </div>

        <div className="text-[#777777]">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Checklist */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#222222] space-y-2">
          {safetyItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                item.isOk
                  ? 'bg-[#070707] border-[#1E1E1E] text-[#CCCCCC]'
                  : 'bg-[#140E0A] border-[#F27D26]/30 text-[#F27D26]'
              }`}
            >
              <div>
                <div className="font-semibold text-[#FFFFFF]">{item.label}</div>
                <div className="text-[10px] text-[#777777]">{item.description}</div>
              </div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  item.isOk ? 'bg-[#0B150F] text-[#4ADE80] border border-[#4ADE80]/40' : 'bg-[#1A0A0A] text-rose-400 border border-rose-500/40'
                }`}
              >
                {item.isOk ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
              </div>
            </div>
          ))}

          <div className="text-[10px] text-[#555555] font-mono italic pt-1">
            * Note: These sensors are wired directly to the ESP32 controller GPIO and cannot be overridden by software.
          </div>
        </div>
      )}
    </div>
  );
};
