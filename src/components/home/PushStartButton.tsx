/**
 * @file PushStartButton.tsx
 * The primary automotive two-stage Push-Start control button.
 * Press 1: Power ON (Energize Ignition Relays)
 * Press 2: Start Engine (Engage Starter Solenoid with Safety Check)
 * When Running: Stop Engine (Clean shutdown)
 */

import React, { useState } from 'react';
import { useTractor } from '../../context/TractorContext';
import { TractorStateMachine } from '../../domain/stateMachine/TractorStateMachine';
import { Power, Zap, AlertTriangle } from 'lucide-react';

export const PushStartButton: React.FC = () => {
  const {
    status,
    turnIgnitionOn,
    turnIgnitionOff,
    startEngine,
    stopEngine,
    unlockTractor,
  } = useTractor();

  const [isPressing, setIsPressing] = useState(false);
  const pushStage = TractorStateMachine.getPushStartStage(status);

  const handleClick = async () => {
    if (isPressing) return;
    setIsPressing(true);

    try {
      if (pushStage.stage === 'LOCKED') {
        // Prompt unlock
        await unlockTractor();
      } else if (pushStage.stage === 'POWER_ON') {
        await turnIgnitionOn();
      } else if (pushStage.stage === 'START_ENGINE') {
        await startEngine();
      } else if (pushStage.stage === 'STOP_ENGINE') {
        await stopEngine();
      }
    } finally {
      setTimeout(() => setIsPressing(false), 300);
    }
  };

  const isCranking = status.engineState === 'CRANKING';
  const isRunning = status.engineState === 'RUNNING';
  const isIgnitionOn = status.ignitionState === 'IGNITION_ON';

  return (
    <div className="flex flex-col items-center justify-center my-4 space-y-3">
      {/* Push-Start Circular Housing */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Halo Ring */}
        <div
          className={`absolute -inset-4 rounded-full transition-all duration-700 blur-2xl ${
            isRunning
              ? 'bg-[#4ADE80]/20 animate-pulse'
              : isIgnitionOn
              ? 'bg-[#F27D26]/20'
              : 'bg-transparent'
          }`}
        />

        {/* Concentric Bezel Ring */}
        <div className="relative p-2 rounded-full bg-gradient-to-b from-[#1E1E1E] via-[#0F0F0F] to-[#050505] border border-[#2A2A2A] shadow-2xl">
          {/* Inner Textured Button Ring */}
          <button
            id="btn-push-start-master"
            onClick={handleClick}
            disabled={!pushStage.isEnabled && pushStage.stage !== 'LOCKED'}
            className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center p-4 transition-all duration-300 transform active:scale-95 select-none ${
              pushStage.stage === 'STOP_ENGINE'
                ? 'bg-gradient-to-b from-[#240D0D] to-[#0D0505] border-2 border-rose-500 text-white shadow-lg shadow-rose-950/60 hover:border-rose-400'
                : pushStage.stage === 'START_ENGINE' && pushStage.isEnabled
                ? 'bg-gradient-to-b from-[#1F1208] to-[#0A0704] border-2 border-[#F27D26] text-white glow-orange-lg hover:border-[#F27D26]/90'
                : pushStage.stage === 'POWER_ON'
                ? 'bg-gradient-to-b from-[#191008] to-[#080604] border-2 border-[#F27D26]/80 text-white glow-orange hover:border-[#F27D26]'
                : isCranking
                ? 'bg-gradient-to-b from-[#261508] to-[#0A0704] border-2 border-[#F27D26] text-white animate-pulse'
                : 'bg-gradient-to-b from-[#111111] to-[#080808] border-2 border-[#222222] text-[#666666] opacity-80 cursor-not-allowed'
            }`}
          >
            {/* Top Indicator Light */}
            <div
              className={`w-2.5 h-2.5 rounded-full mb-2 border transition-all duration-300 ${
                isRunning
                  ? 'bg-[#4ADE80] border-[#4ADE80] glow-green animate-pulse'
                  : isIgnitionOn
                  ? 'bg-[#F27D26] border-[#F27D26] glow-orange'
                  : 'bg-[#222222] border-[#333333]'
              }`}
            />

            {/* Icon */}
            <div className="mb-1">
              {isRunning ? (
                <Power className="w-8 h-8 text-rose-400 animate-pulse" />
              ) : isCranking ? (
                <Zap className="w-8 h-8 text-[#F27D26] animate-spin" />
              ) : (
                <Power className={`w-8 h-8 ${pushStage.stage === 'POWER_ON' || pushStage.stage === 'START_ENGINE' ? 'text-[#F27D26]' : 'text-current'}`} />
              )}
            </div>

            {/* Main Label */}
            <div className="text-base font-serif font-bold tracking-tight uppercase text-center leading-tight text-[#FFFFFF]">
              {pushStage.label}
            </div>

            {/* Sub-label */}
            <div className="text-[9px] text-[#888888] font-mono uppercase tracking-wider mt-1 text-center truncate max-w-[130px]">
              {pushStage.subLabel}
            </div>
          </button>
        </div>
      </div>

      {/* Safety / Status Guidance Tip */}
      {!pushStage.isEnabled && pushStage.stage === 'START_ENGINE' && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#140E0A] border border-[#F27D26]/40 text-[#F27D26] text-xs font-medium text-center shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{pushStage.subLabel}</span>
        </div>
      )}

      {/* Secondary Switch: Turn Ignition Power OFF without stopping app */}
      {isIgnitionOn && !isRunning && (
        <button
          id="btn-ignition-off-secondary"
          onClick={() => turnIgnitionOff()}
          className="text-xs text-[#777777] hover:text-[#CCCCCC] underline underline-offset-4 font-mono transition-colors"
        >
          Turn Ignition Power OFF
        </button>
      )}
    </div>
  );
};
