/**
 * @file TractorStatusCard.tsx
 * Automotive status board satisfying the 2-Second Rule:
 * 1. Is my tractor connected?
 * 2. Is the tractor authorized/unlocked?
 * 3. Can I start it?
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { LiveSignalMeter } from '../common/LiveSignalMeter';
import { formatRelativeTime } from '../../core/utils/formatting';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
  Gauge,
  Thermometer,
  Fuel,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { TractorStateMachine } from '../../domain/stateMachine/TractorStateMachine';

export const TractorStatusCard: React.FC = () => {
  const { status } = useTractor();

  const isConnected = status.connection === 'CONNECTED';
  const isUnlocked = status.lockState === 'UNLOCKED';
  const isAuthorized = status.isOwnerAuthenticated;
  const startCheck = TractorStateMachine.canStartEngine(status);
  const isEngineRunning = status.engineState === 'RUNNING';

  return (
    <div id="tractor-status-master-card" className="space-y-3">
      {/* 3 Primary Visual Pillar Assessment (2-Second Quick Read) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Pillar 1: BLE Link */}
        <div
          id="pillar-ble-link"
          className={`p-3 rounded-2xl border transition-all ${
            isConnected
              ? 'bg-[#0B150F] border-[#4ADE80]/40 text-[#4ADE80] glow-green'
              : 'bg-[#0D0D0D] border-[#222222] text-[#777777]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase font-bold tracking-[0.15em] opacity-80">Link</span>
            {isConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-[#555555]" />
            )}
          </div>
          <div className="text-xs font-bold text-[#FFFFFF] font-serif tracking-tight">
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="text-[10px] text-[#888888] font-mono mt-0.5 truncate">
            {isConnected ? `${status.currentRssi} dBm` : 'No Signal'}
          </div>
        </div>

        {/* Pillar 2: Digital Key & Lock */}
        <div
          id="pillar-auth-lock"
          className={`p-3 rounded-2xl border transition-all ${
            isAuthorized && isUnlocked
              ? 'bg-[#0B150F] border-[#4ADE80]/40 text-[#4ADE80] glow-green'
              : 'bg-[#0D0D0D] border-[#222222] text-[#777777]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase font-bold tracking-[0.15em] opacity-80">Access</span>
            {isUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-[#4ADE80]" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#F27D26]" />
            )}
          </div>
          <div className="text-xs font-bold text-[#FFFFFF] font-serif tracking-tight">
            {isAuthorized ? (isUnlocked ? 'UNLOCKED' : 'LOCKED') : 'LOCKED'}
          </div>
          <div className="text-[10px] text-[#888888] font-mono mt-0.5">
            {isAuthorized ? 'Key Verified' : 'Locked'}
          </div>
        </div>

        {/* Pillar 3: Start Condition */}
        <div
          id="pillar-start-ready"
          className={`p-3 rounded-2xl border transition-all ${
            isEngineRunning
              ? 'bg-[#0B150F] border-[#4ADE80]/40 text-[#4ADE80] glow-green'
              : startCheck.allowed
              ? 'bg-[#140E0A] border-[#F27D26]/40 text-[#F27D26] glow-orange'
              : 'bg-[#0D0D0D] border-[#222222] text-[#777777]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] uppercase font-bold tracking-[0.15em] opacity-80">Start</span>
            {isEngineRunning ? (
              <Zap className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
            ) : startCheck.allowed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F27D26]" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-[#555555]" />
            )}
          </div>
          <div className="text-xs font-bold text-[#FFFFFF] font-serif tracking-tight truncate">
            {isEngineRunning ? 'RUNNING' : startCheck.allowed ? 'READY' : 'STANDBY'}
          </div>
          <div className="text-[10px] text-[#888888] font-mono mt-0.5 truncate">
            {isEngineRunning
              ? `${status.engineRpm} RPM`
              : status.ignitionState === 'IGNITION_ON'
              ? 'Ignition ON'
              : 'Ignition OFF'}
          </div>
        </div>
      </div>

      {/* Main Automotive HUD Panel */}
      <div className="p-4 rounded-2xl bg-[#0E0E0E] border border-[#222222] shadow-xl space-y-3.5">
        {/* Top telemetry bar */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isEngineRunning ? 'bg-[#4ADE80]' : 'bg-[#F27D26]'} animate-pulse`} />
            <span className="text-xs font-bold text-[#FFFFFF] font-serif uppercase tracking-wider">
              {status.operationalState}
            </span>
          </div>

          <div className="text-[11px] font-mono text-[#777777]">
            Comm: <span className="text-[#CCCCCC]">{formatRelativeTime(status.lastCommunicationTime)}</span>
          </div>
        </div>

        {/* Live Proximity Banner */}
        <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E]">
          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#777777] mb-1 flex items-center justify-between">
            <span>Owner Proximity</span>
            <span className="text-[#555555] font-mono">Auto-Cutoff Active</span>
          </div>
          <LiveSignalMeter rssi={status.currentRssi} isConnected={isConnected} />
        </div>

        {/* Live Engine & Sensor Gauges Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Tachometer RPM */}
          <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E] text-center">
            <div className="flex items-center justify-center gap-1 text-[#888888] text-[10px] uppercase font-bold tracking-wider mb-1">
              <Gauge className="w-3 h-3 text-[#F27D26]" />
              <span>RPM</span>
            </div>
            <div className="text-lg font-serif font-bold text-[#FFFFFF]">
              {status.engineState === 'RUNNING' ? status.engineRpm : '0'}
            </div>
            <div className="text-[10px] text-[#666666] font-mono mt-0.5">
              {status.engineState === 'RUNNING' ? 'Idle Steady' : 'Stopped'}
            </div>
          </div>

          {/* Coolant Temp */}
          <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E] text-center">
            <div className="flex items-center justify-center gap-1 text-[#888888] text-[10px] uppercase font-bold tracking-wider mb-1">
              <Thermometer className="w-3 h-3 text-[#4ADE80]" />
              <span>Coolant</span>
            </div>
            <div className="text-lg font-serif font-bold text-[#FFFFFF]">
              {status.coolantTempC.toFixed(0)}°C
            </div>
            <div className="text-[10px] text-[#4ADE80] font-mono mt-0.5 font-semibold">Normal</div>
          </div>

          {/* Fuel Level */}
          <div className="p-2.5 rounded-xl bg-[#070707] border border-[#1E1E1E] text-center">
            <div className="flex items-center justify-center gap-1 text-[#888888] text-[10px] uppercase font-bold tracking-wider mb-1">
              <Fuel className="w-3 h-3 text-[#F27D26]" />
              <span>Fuel</span>
            </div>
            <div className="text-lg font-serif font-bold text-[#FFFFFF]">
              {status.fuelLevelPercent}%
            </div>
            <div className="text-[10px] text-[#777777] font-mono mt-0.5">Diesel</div>
          </div>
        </div>
      </div>
    </div>
  );
};
