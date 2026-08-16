/**
 * @file HardwareSimulatorDrawer.tsx
 * Interactive ESP32 Hardware & Physical Environment Simulator.
 * Allows developers and testers to simulate proximity walking, gear interlocks,
 * seat presence, battery voltage drops, and tamper triggers in real-time.
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import {
  Cpu,
  X,
  Footprints,
  Battery,
  AlertTriangle,
  Sliders,
  Shield,
  Zap,
} from 'lucide-react';

export const HardwareSimulatorDrawer: React.FC = () => {
  const {
    isSimDrawerOpen,
    setIsSimDrawerOpen,
    simDistance,
    setSimDistance,
    status,
    setSafetyCondition,
    simulateVoltage,
    triggerTamperSim,
    isMockMode,
    toggleMockMode,
  } = useTractor();

  if (!isSimDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#0D0D0D] border-t border-[#2A2A2A] p-5 shadow-2xl space-y-4">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#FFFFFF] flex items-center gap-2">
                <span>ESP32 Hardware Simulator</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#140E0A] text-[#F27D26] border border-[#F27D26]/40">
                  DEV MODE
                </span>
              </h3>
              <p className="text-xs text-[#777777]">Inject live physical hardware states & proximity</p>
            </div>
          </div>

          <button
            onClick={() => setIsSimDrawerOpen(false)}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Proximity Distance Slider Simulation */}
        <div className="p-4 rounded-2xl bg-[#070707] border border-[#1E1E1E] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FFFFFF] flex items-center gap-1.5">
              <Footprints className="w-4 h-4 text-[#F27D26]" />
              <span>Simulate Physical Distance from Tractor</span>
            </span>
            <span className="font-mono text-[#F27D26] text-xs font-bold">
              {simDistance < 1 ? `${(simDistance * 100).toFixed(0)} cm (In Cab)` : `${simDistance.toFixed(1)} meters`}
            </span>
          </div>

          <input
            type="range"
            min="0.2"
            max="25"
            step="0.2"
            value={simDistance}
            onChange={e => setSimDistance(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#F27D26]"
          />

          <div className="flex justify-between text-[10px] font-mono text-[#777777]">
            <span className={simDistance <= 1.5 ? 'text-[#4ADE80] font-bold' : ''}>Cab Range (0.5m)</span>
            <span className={simDistance > 1.5 && simDistance <= 5 ? 'text-[#4ADE80] font-bold' : ''}>Near (3m)</span>
            <span className={simDistance > 5 && simDistance <= 12 ? 'text-[#F27D26] font-bold' : ''}>Far (8m)</span>
            <span className={simDistance > 12 ? 'text-rose-400 font-bold' : ''}>Out of Range (15m+)</span>
          </div>
        </div>

        {/* Hardware Safety Interlocks Injection */}
        <div className="p-4 rounded-2xl bg-[#070707] border border-[#1E1E1E] space-y-3">
          <div className="text-xs font-bold text-[#FFFFFF] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#F27D26]" />
            <span>Tractor Safety Sensors (GPIO Interlocks)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Neutral Gear */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#050505] border border-[#1E1E1E] text-xs text-[#CCCCCC] cursor-pointer">
              <span>Neutral Gear</span>
              <input
                type="checkbox"
                checked={status.safety.neutralGearEngaged}
                onChange={e => setSafetyCondition('neutralGearEngaged', e.target.checked)}
                className="rounded accent-[#4ADE80] w-4 h-4"
              />
            </label>

            {/* Clutch / Brake */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#050505] border border-[#1E1E1E] text-xs text-[#CCCCCC] cursor-pointer">
              <span>Clutch / Brake</span>
              <input
                type="checkbox"
                checked={status.safety.clutchBrakePressed}
                onChange={e => setSafetyCondition('clutchBrakePressed', e.target.checked)}
                className="rounded accent-[#4ADE80] w-4 h-4"
              />
            </label>

            {/* Seat Switch */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#050505] border border-[#1E1E1E] text-xs text-[#CCCCCC] cursor-pointer">
              <span>Driver Seat Switch</span>
              <input
                type="checkbox"
                checked={status.safety.operatorSeatOccupied}
                onChange={e => setSafetyCondition('operatorSeatOccupied', e.target.checked)}
                className="rounded accent-[#4ADE80] w-4 h-4"
              />
            </label>

            {/* Emergency Stop Switch */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#050505] border border-[#1E1E1E] text-xs text-[#CCCCCC] cursor-pointer">
              <span>E-Stop Disengaged</span>
              <input
                type="checkbox"
                checked={status.safety.emergencyStopDisengaged}
                onChange={e => setSafetyCondition('emergencyStopDisengaged', e.target.checked)}
                className="rounded accent-[#4ADE80] w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Battery Voltage Slider & Tamper Trigger */}
        <div className="grid grid-cols-2 gap-3">
          {/* Battery Voltage */}
          <div className="p-3.5 rounded-2xl bg-[#070707] border border-[#1E1E1E] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#CCCCCC] flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-[#4ADE80]" /> Battery
              </span>
              <span className="font-mono text-[#FFFFFF] font-bold">
                {status.batteryVoltage.toFixed(1)}V
              </span>
            </div>
            <input
              type="range"
              min="10.5"
              max="14.6"
              step="0.1"
              value={status.batteryVoltage}
              onChange={e => simulateVoltage(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#4ADE80]"
            />
          </div>

          {/* Tamper Alert Trigger */}
          <div className="p-3.5 rounded-2xl bg-[#070707] border border-[#1E1E1E] flex flex-col justify-between">
            <div className="text-xs font-bold text-[#CCCCCC] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Tamper Sensor
            </div>
            <button
              onClick={triggerTamperSim}
              className="w-full py-2 rounded-xl bg-[#1A0A0A] hover:bg-[#280E0E] border border-rose-500/40 text-rose-200 font-bold text-xs transition-colors"
            >
              Trigger Vibration
            </button>
          </div>
        </div>

        {/* Execution Mode Toggle */}
        <div className="pt-2">
          <button
            onClick={toggleMockMode}
            className="w-full py-2.5 rounded-xl bg-[#141414] hover:bg-[#1F1F1F] border border-[#2A2A2A] text-[#E0E0E0] text-xs font-semibold"
          >
            Switch to {isMockMode ? 'Physical Web Bluetooth Mode' : 'ESP32 Mock Simulator Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};
