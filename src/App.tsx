/**
 * @file App.tsx
 * Smart Tractor Keyless Control Mobile Application
 * Clean Architecture • Riverpod-style State • Automotive Dark Theme • Web BLE & ESP32 Simulator
 */

import React, { useState } from 'react';
import { TractorProvider, useTractor } from './context/TractorContext';
import { HeaderBar } from './components/common/HeaderBar';
import { BottomNav, ActiveTab } from './components/common/BottomNav';
import { TractorStatusCard } from './components/home/TractorStatusCard';
import { PushStartButton } from './components/home/PushStartButton';
import { SafetyInterlockPanel } from './components/home/SafetyInterlockPanel';
import { QuickControls } from './components/home/QuickControls';
import { BatteryGauge } from './components/common/BatteryGauge';
import { EmergencyCutoffModal } from './components/home/EmergencyCutoffModal';
import { KeyManagementCard } from './components/digitalKey/KeyManagementCard';
import { AuthorizedDevicesList } from './components/digitalKey/AuthorizedDevicesList';
import { ChallengeResponseInspector } from './components/digitalKey/ChallengeResponseInspector';
import { ActivityTimeline } from './components/activity/ActivityTimeline';
import { ProximitySettings } from './components/settings/ProximitySettings';
import { AutoCutoffSettings } from './components/settings/AutoCutoffSettings';
import { StartSystemSettings } from './components/settings/StartSystemSettings';
import { HardwareAbout } from './components/settings/HardwareAbout';
import { PairingWizardModal } from './components/pairing/PairingWizardModal';
import { HardwareSimulatorDrawer } from './components/simulator/HardwareSimulatorDrawer';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const { status, lastActionMessage, activityLogs } = useTractor();

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#F27D26] selection:text-black pb-24">
      {/* Automotive Top Navigation */}
      <HeaderBar />

      {/* Global Action Toast Notification */}
      {lastActionMessage && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-[90%] pointer-events-none animate-fade-in">
          <div
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 shadow-2xl backdrop-blur-md ${
              lastActionMessage.isError
                ? 'bg-[#180C0C]/95 border-rose-500/60 text-rose-200 shadow-rose-950/40'
                : 'bg-[#0A160F]/95 border-[#4ADE80]/60 text-[#4ADE80] glow-green'
            }`}
          >
            {lastActionMessage.isError ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
            )}
            <span className="truncate">{lastActionMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Tab 1: HOME (Live Dashboard & Push-Start Control) */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-fade-in">
            <TractorStatusCard />
            <PushStartButton />
            <QuickControls />
            <BatteryGauge
              voltage={status.batteryVoltage}
              isEngineRunning={status.engineState === 'RUNNING'}
            />
            <SafetyInterlockPanel />
          </div>
        )}

        {/* Tab 2: DIGITAL KEY */}
        {activeTab === 'key' && (
          <div className="space-y-4 animate-fade-in">
            <KeyManagementCard />
            <AuthorizedDevicesList />
            <ChallengeResponseInspector />
          </div>
        )}

        {/* Tab 3: ACTIVITY LOGS */}
        {activeTab === 'activity' && (
          <div className="space-y-4 animate-fade-in">
            <ActivityTimeline />
          </div>
        )}

        {/* Tab 4: SETTINGS & SYSTEM CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <ProximitySettings />
            <AutoCutoffSettings />
            <StartSystemSettings />
            <HardwareAbout />
          </div>
        )}
      </main>

      {/* Global Overlays & Modals */}
      <EmergencyCutoffModal />
      <PairingWizardModal />
      <HardwareSimulatorDrawer />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        unreadEventsCount={activityLogs.length > 0 ? 1 : 0}
      />
    </div>
  );
};

export default function App() {
  return (
    <TractorProvider>
      <MainLayout />
    </TractorProvider>
  );
}
