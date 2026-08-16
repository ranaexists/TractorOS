/**
 * @file TractorContext.tsx
 * Central Reactive State Provider for the Smart Tractor Mobile App.
 * Exposes live telemetry, commands, hardware simulation hooks, and configuration.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { TractorStatus, SafetyConditions, TractorOperationalState } from '../types/tractor';
import { TractorAppConfig } from '../types/settings';
import { TractorEvent } from '../types/activity';
import { DigitalKey, AuthorizedDevice } from '../types/security';
import { MockBleService } from '../services/ble/MockBleService';
import { WebBleService } from '../services/ble/WebBleService';
import { TractorRepository } from '../data/repositories/TractorRepository';
import { LocalStorageService } from '../services/storage/LocalStorageService';
import { audioFeedback } from '../core/utils/audioFeedback';

interface TractorContextValue {
  status: TractorStatus;
  config: TractorAppConfig;
  activityLogs: TractorEvent[];
  digitalKeys: DigitalKey[];
  authorizedDevices: AuthorizedDevice[];
  isMockMode: boolean;
  isAudioMuted: boolean;
  isPairingWizardOpen: boolean;
  isSimDrawerOpen: boolean;
  simDistance: number;
  lastActionMessage: { text: string; isError?: boolean } | null;

  // Actions
  connectTractor: (deviceId?: string) => Promise<boolean>;
  disconnectTractor: () => Promise<void>;
  unlockTractor: () => Promise<void>;
  lockTractor: () => Promise<void>;
  turnIgnitionOn: () => Promise<void>;
  turnIgnitionOff: () => Promise<void>;
  startEngine: () => Promise<void>;
  stopEngine: () => Promise<void>;
  cancelCutoffWarning: () => Promise<void>;
  chirpHorn: () => Promise<void>;
  toggleHazards: () => Promise<void>;
  clearTamperAlert: () => Promise<void>;

  // Configuration & Modals
  updateConfig: (newConfig: Partial<TractorAppConfig>) => void;
  toggleMockMode: () => void;
  toggleAudio: () => void;
  setIsPairingWizardOpen: (open: boolean) => void;
  setIsSimDrawerOpen: (open: boolean) => void;
  clearActivityLogs: () => void;
  revokeDevice: (deviceId: string) => void;
  addAuthorizedDevice: (device: Omit<AuthorizedDevice, 'id' | 'addedAt' | 'lastActive'>) => void;

  // Simulator injections
  setSimDistance: (meters: number) => void;
  setSafetyCondition: (key: keyof SafetyConditions, val: boolean) => void;
  simulateVoltage: (volts: number) => void;
  triggerTamperSim: () => void;
}

const TractorContext = createContext<TractorContextValue | null>(null);

export const TractorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TractorAppConfig>(LocalStorageService.getConfig());
  const [isMockMode, setIsMockMode] = useState<boolean>(config.isMockMode);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!config.audioFeedbackEnabled);
  const [activityLogs, setActivityLogs] = useState<TractorEvent[]>(LocalStorageService.getActivityLogs());
  const [digitalKeys, setDigitalKeys] = useState<DigitalKey[]>(LocalStorageService.getDigitalKeys());
  const [authorizedDevices, setAuthorizedDevices] = useState<AuthorizedDevice[]>(LocalStorageService.getAuthorizedDevices());

  const [isPairingWizardOpen, setIsPairingWizardOpen] = useState<boolean>(false);
  const [isSimDrawerOpen, setIsSimDrawerOpen] = useState<boolean>(false);
  const [simDistance, setSimDistanceState] = useState<number>(0.8);
  const [lastActionMessage, setLastActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Instantiate BLE service & repository
  const mockService = useMemo(() => new MockBleService(), []);
  const webBleService = useMemo(() => new WebBleService(), []);

  const repository = useMemo(() => {
    return new TractorRepository(isMockMode ? mockService : webBleService);
  }, [isMockMode, mockService, webBleService]);

  const [status, setStatus] = useState<TractorStatus>(() => repository.getLatestStatus());

  useEffect(() => {
    audioFeedback.setMuted(isAudioMuted);
  }, [isAudioMuted]);

  // Subscribe to repository telemetry & events
  useEffect(() => {
    const unsubStatus = repository.subscribeStatus(newStatus => {
      setStatus({ ...newStatus });
    });

    const unsubEvents = repository.subscribeEvents(newEvent => {
      setActivityLogs(prev => [newEvent, ...prev.slice(0, 249)]);
    });

    return () => {
      unsubStatus();
      unsubEvents();
    };
  }, [repository]);

  // Auto-connect in mock mode on initial boot
  useEffect(() => {
    if (isMockMode) {
      repository.connect('TRAC-ESP32-9842');
    }
  }, [isMockMode, repository]);

  const showToast = (text: string, isError = false) => {
    setLastActionMessage({ text, isError });
    setTimeout(() => {
      setLastActionMessage(prev => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const connectTractor = useCallback(async (deviceId = 'TRAC-ESP32-9842'): Promise<boolean> => {
    const ok = await repository.connect(deviceId);
    if (ok) {
      showToast('Connected to Tractor ESP32 Controller');
    } else {
      showToast('Failed to establish BLE connection', true);
    }
    return ok;
  }, [repository]);

  const disconnectTractor = useCallback(async (): Promise<void> => {
    await repository.disconnect();
    showToast('Disconnected from Tractor');
  }, [repository]);

  const unlockTractor = useCallback(async (): Promise<void> => {
    const res = await repository.unlockTractor();
    showToast(res.message, !res.success);
  }, [repository]);

  const lockTractor = useCallback(async (): Promise<void> => {
    const res = await repository.lockTractor();
    showToast(res.message, !res.success);
  }, [repository]);

  const turnIgnitionOn = useCallback(async (): Promise<void> => {
    const res = await repository.turnIgnitionOn();
    showToast(res.message, !res.success);
  }, [repository]);

  const turnIgnitionOff = useCallback(async (): Promise<void> => {
    const res = await repository.turnIgnitionOff();
    showToast(res.message, !res.success);
  }, [repository]);

  const startEngine = useCallback(async (): Promise<void> => {
    const res = await repository.startEngine();
    showToast(res.message, !res.success);
  }, [repository]);

  const stopEngine = useCallback(async (): Promise<void> => {
    const res = await repository.stopEngine();
    showToast(res.message, !res.success);
  }, [repository]);

  const cancelCutoffWarning = useCallback(async (): Promise<void> => {
    const res = await repository.cancelCutoffWarning();
    showToast(res.message, !res.success);
  }, [repository]);

  const chirpHorn = useCallback(async (): Promise<void> => {
    const res = await repository.triggerHornChirp();
    showToast(res.message, !res.success);
  }, [repository]);

  const toggleHazards = useCallback(async (): Promise<void> => {
    const res = await repository.toggleHazards();
    showToast(res.message, !res.success);
  }, [repository]);

  const clearTamperAlert = useCallback(async (): Promise<void> => {
    const res = await repository.resetTamperAlert();
    showToast(res.message, !res.success);
  }, [repository]);

  const updateConfig = useCallback((newConfig: Partial<TractorAppConfig>) => {
    setConfig(prev => {
      const updated = {
        ...prev,
        ...newConfig,
        proximity: { ...prev.proximity, ...(newConfig.proximity || {}) },
        autoCutoff: { ...prev.autoCutoff, ...(newConfig.autoCutoff || {}) },
        startSystem: { ...prev.startSystem, ...(newConfig.startSystem || {}) },
        notifications: { ...prev.notifications, ...(newConfig.notifications || {}) },
      };
      LocalStorageService.saveConfig(updated);
      return updated;
    });
  }, []);

  const toggleMockMode = useCallback(() => {
    const nextMode = !isMockMode;
    setIsMockMode(nextMode);
    updateConfig({ isMockMode: nextMode });
    showToast(nextMode ? 'Switched to ESP32 Hardware Simulator' : 'Switched to Physical Web Bluetooth');
  }, [isMockMode, updateConfig]);

  const toggleAudio = useCallback(() => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    updateConfig({ audioFeedbackEnabled: !nextMute });
    showToast(nextMute ? 'Chimes Muted' : 'Audio Feedback Enabled');
  }, [isAudioMuted, updateConfig]);

  const clearActivityLogs = useCallback(() => {
    LocalStorageService.saveActivityLogs([]);
    setActivityLogs([]);
    showToast('Activity logs cleared');
  }, []);

  const revokeDevice = useCallback((deviceId: string) => {
    setAuthorizedDevices(prev => {
      const updated = prev.map(d => (d.id === deviceId ? { ...d, status: 'REVOKED' as const } : d));
      LocalStorageService.saveAuthorizedDevices(updated);
      return updated;
    });
    showToast('Device authorization revoked');
  }, []);

  const addAuthorizedDevice = useCallback((newDev: Omit<AuthorizedDevice, 'id' | 'addedAt' | 'lastActive'>) => {
    const dev: AuthorizedDevice = {
      ...newDev,
      id: 'DEV-OP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      addedAt: Date.now(),
      lastActive: Date.now(),
    };
    setAuthorizedDevices(prev => {
      const updated = [dev, ...prev];
      LocalStorageService.saveAuthorizedDevices(updated);
      return updated;
    });
    showToast(`Added authorized device: ${dev.name}`);
  }, []);

  // Simulator injections
  const setSimDistance = useCallback((meters: number) => {
    setSimDistanceState(meters);
    if (isMockMode) {
      mockService.setSimDistance(meters);
    }
  }, [isMockMode, mockService]);

  const setSafetyCondition = useCallback((key: keyof SafetyConditions, val: boolean) => {
    if (isMockMode) {
      mockService.setSafetyCondition(key, val);
    }
  }, [isMockMode, mockService]);

  const simulateVoltage = useCallback((volts: number) => {
    if (isMockMode) {
      mockService.setBatteryVoltage(volts);
    }
  }, [isMockMode, mockService]);

  const triggerTamperSim = useCallback(() => {
    if (isMockMode) {
      mockService.triggerTamperVibration();
      showToast('Simulated Tamper Vibration Triggered!', true);
    }
  }, [isMockMode, mockService]);

  const value: TractorContextValue = {
    status,
    config,
    activityLogs,
    digitalKeys,
    authorizedDevices,
    isMockMode,
    isAudioMuted,
    isPairingWizardOpen,
    isSimDrawerOpen,
    simDistance,
    lastActionMessage,

    connectTractor,
    disconnectTractor,
    unlockTractor,
    lockTractor,
    turnIgnitionOn,
    turnIgnitionOff,
    startEngine,
    stopEngine,
    cancelCutoffWarning,
    chirpHorn,
    toggleHazards,
    clearTamperAlert,

    updateConfig,
    toggleMockMode,
    toggleAudio,
    setIsPairingWizardOpen,
    setIsSimDrawerOpen,
    clearActivityLogs,
    revokeDevice,
    addAuthorizedDevice,

    setSimDistance,
    setSafetyCondition,
    simulateVoltage,
    triggerTamperSim,
  };

  return <TractorContext.Provider value={value}>{children}</TractorContext.Provider>;
};

export const useTractor = (): TractorContextValue => {
  const context = useContext(TractorContext);
  if (!context) {
    throw new Error('useTractor must be used within a TractorProvider');
  }
  return context;
};
