/**
 * @file LocalStorageService.ts
 * Offline-first persistent storage for paired digital keys, activity history, and user settings
 */

import { TractorEvent } from '../../types/activity';
import { AuthorizedDevice, DigitalKey } from '../../types/security';
import { TractorAppConfig } from '../../types/settings';

const STORAGE_KEYS = {
  DIGITAL_KEYS: 'stkc_digital_keys_v1',
  AUTHORIZED_DEVICES: 'stkc_auth_devices_v1',
  ACTIVITY_LOGS: 'stkc_activity_logs_v1',
  APP_CONFIG: 'stkc_app_config_v1',
  PAIRED_TRACTORS: 'stkc_paired_tractors_v1',
};

const DEFAULT_CONFIG: TractorAppConfig = {
  proximity: {
    sensitivity: 3,
    nearThresholdDbm: -72,
    farThresholdDbm: -86,
    lostTimeoutSeconds: 6,
    rssiSmoothingFactor: 0.35,
  },
  autoCutoff: {
    enabled: true,
    gracePeriodSeconds: 30,
    audibleWarningEnabled: true,
    vibrationAlertEnabled: true,
    requireManualRestartAfterCutoff: true,
  },
  startSystem: {
    pushStartMode: 'TWO_PRESS',
    maxCrankDurationSeconds: 3,
    requireBrakePedalToCrank: true,
    autoNeutralCheck: true,
  },
  notifications: {
    tamperAlerts: true,
    autoCutoffAlerts: true,
    connectionLostAlerts: true,
    lowBatteryAlerts: true,
    engineStallAlerts: true,
  },
  isMockMode: true,
  audioFeedbackEnabled: true,
};

const DEFAULT_KEYS: DigitalKey[] = [
  {
    keyId: 'KEY-OWNER-SECURE-99',
    tractorId: 'TRAC-ESP32-9842',
    deviceName: 'Primary iPhone 16 Pro (Owner)',
    deviceFingerprint: 'DEV-FP-9A88F120',
    role: 'OWNER',
    createdTimestamp: Date.now() - 86400000 * 30,
    lastUsedTimestamp: Date.now() - 3600000,
    isActive: true,
    publicKeyFingerprint: 'PUB-8F99-2B3A-4C5D-91E0',
    algorithm: 'HMAC-SHA256',
    expiresAt: null,
  },
];

const DEFAULT_DEVICES: AuthorizedDevice[] = [
  {
    id: 'DEV-OWNER-PRIMARY',
    name: 'Farmer iPhone 16 Pro',
    model: 'Apple iPhone (iOS 18)',
    role: 'OWNER',
    isCurrentDevice: true,
    addedAt: Date.now() - 86400000 * 30,
    lastActive: Date.now(),
    status: 'ACTIVE',
    accessPermissions: {
      canIgnition: true,
      canStartEngine: true,
      canChangeSettings: true,
      canAddDevices: true,
    },
  },
  {
    id: 'DEV-OPERATOR-HARVESTER',
    name: 'Ramesh (Field Operator)',
    model: 'Samsung Galaxy A54',
    role: 'OPERATOR',
    isCurrentDevice: false,
    addedAt: Date.now() - 86400000 * 10,
    lastActive: Date.now() - 86400000 * 2,
    status: 'ACTIVE',
    accessPermissions: {
      canIgnition: true,
      canStartEngine: true,
      canChangeSettings: false,
      canAddDevices: false,
    },
  },
];

const DEFAULT_EVENTS: TractorEvent[] = [
  {
    id: 'evt-init-1',
    timestamp: Date.now() - 120000,
    category: 'CONNECTION',
    severity: 'SUCCESS',
    title: 'Tractor Connected via BLE',
    description: 'Secured channel established with ESP32 Cab Controller (TRAC-ESP32-9842).',
    tractorId: 'TRAC-ESP32-9842',
  },
  {
    id: 'evt-init-2',
    timestamp: Date.now() - 110000,
    category: 'SECURITY',
    severity: 'SUCCESS',
    title: 'Owner Digital Key Authenticated',
    description: 'HMAC-SHA256 challenge verified. Tractor access state changed to AUTHORIZED.',
    tractorId: 'TRAC-ESP32-9842',
  },
];

export class LocalStorageService {
  public static getConfig(): TractorAppConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_CONFIG);
      return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  public static saveConfig(config: TractorAppConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  public static getDigitalKeys(): DigitalKey[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIGITAL_KEYS);
      return stored ? JSON.parse(stored) : DEFAULT_KEYS;
    } catch {
      return DEFAULT_KEYS;
    }
  }

  public static saveDigitalKeys(keys: DigitalKey[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DIGITAL_KEYS, JSON.stringify(keys));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  public static getAuthorizedDevices(): AuthorizedDevice[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTHORIZED_DEVICES);
      return stored ? JSON.parse(stored) : DEFAULT_DEVICES;
    } catch {
      return DEFAULT_DEVICES;
    }
  }

  public static saveAuthorizedDevices(devices: AuthorizedDevice[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTHORIZED_DEVICES, JSON.stringify(devices));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  public static getActivityLogs(): TractorEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      return stored ? JSON.parse(stored) : DEFAULT_EVENTS;
    } catch {
      return DEFAULT_EVENTS;
    }
  }

  public static saveActivityLogs(logs: TractorEvent[]): void {
    try {
      // Keep up to 250 most recent logs
      const trimmed = logs.slice(0, 250);
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }
}
