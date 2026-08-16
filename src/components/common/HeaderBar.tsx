/**
 * @file HeaderBar.tsx
 * Top automotive navigation bar with tractor identity, connection pill, sound toggle, and simulator launcher.
 */

import React from 'react';
import { useTractor } from '../../context/TractorContext';
import { Bluetooth, Volume2, VolumeX, Cpu, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const {
    status,
    isMockMode,
    isAudioMuted,
    toggleAudio,
    setIsSimDrawerOpen,
    setIsPairingWizardOpen,
    connectTractor,
    disconnectTractor,
  } = useTractor();

  const isConnected = status.connection === 'CONNECTED';

  return (
    <header id="app-header-bar" className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-[#222222] px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Tractor Branding & State */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] flex items-center justify-center text-lg shadow-inner shadow-black/60">
            🚜
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-[#FFFFFF] leading-tight font-serif tracking-tight">
                <span className="text-white">SMART</span>{' '}
                <span className="text-[#F27D26]">TRACTOR</span>
              </h1>
            </div>
            <p className="text-[10px] font-mono text-[#777777] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
              <span>{status.tractorId}</span>
              <span className="text-[#333333]">•</span>
              <span className={status.isOwnerAuthenticated ? 'text-[#4ADE80] flex items-center gap-0.5 font-semibold' : 'text-[#666666]'}>
                {status.isOwnerAuthenticated ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#4ADE80]" />
                    <span>Owner Key</span>
                  </>
                ) : (
                  'Unverified'
                )}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Connection Status Pill */}
          <button
            id="btn-connection-toggle"
            onClick={() => (isConnected ? disconnectTractor() : connectTractor())}
            title={isConnected ? 'Tap to disconnect' : 'Tap to connect'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isConnected
                ? 'bg-[#0B150F] border-[#4ADE80]/40 text-[#4ADE80] hover:bg-[#0E2015] glow-green'
                : 'bg-[#0A0A0A] border-[#222222] text-[#888888] hover:text-[#CCCCCC] hover:border-[#333333]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? 'bg-[#4ADE80] animate-pulse'
                  : status.connection === 'CONNECTING'
                  ? 'bg-[#F27D26] animate-ping'
                  : 'bg-[#444444]'
              }`}
            />
            <Bluetooth className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isConnected ? 'Connected' : status.connection === 'CONNECTING' ? 'Linking...' : 'Offline'}
            </span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            id="btn-audio-toggle"
            onClick={toggleAudio}
            title={isAudioMuted ? 'Unmute automotive chimes' : 'Mute chimes'}
            aria-label="Toggle Audio Chimes"
            className="p-2 rounded-lg bg-[#0A0A0A] border border-[#222222] text-[#888888] hover:text-white hover:border-[#333333] transition-colors"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-[#555555]" /> : <Volume2 className="w-4 h-4 text-[#F27D26]" />}
          </button>

          {/* Hardware Simulator Launcher */}
          <button
            id="btn-sim-drawer-toggle"
            onClick={() => setIsSimDrawerOpen(true)}
            title="Open ESP32 Hardware & Proximity Simulator"
            className="p-2 rounded-lg bg-[#140F0A] border border-[#F27D26]/40 text-[#F27D26] hover:bg-[#1F150E] transition-colors relative"
          >
            <Cpu className="w-4 h-4" />
            {isMockMode && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F27D26] animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Global Tamper Alert Banner */}
      {status.isTamperAlertActive && (
        <div className="mt-2.5 max-w-xl mx-auto p-2.5 rounded-xl bg-[#1A0A0A] border border-rose-500/70 text-rose-200 flex items-center justify-between text-xs animate-bounce shadow-lg shadow-black/80">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold tracking-wide">🚨 SECURITY ALERT:</span> Accelerometer detected unauthorized motion while locked!
            </div>
          </div>
          <button
            id="btn-clear-tamper-banner"
            onClick={() => status.isTamperAlertActive && window.dispatchEvent(new CustomEvent('clear-tamper'))}
            className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-600 text-white font-medium shrink-0 ml-2 shadow-sm"
          >
            Acknowledge
          </button>
        </div>
      )}
    </header>
  );
};
