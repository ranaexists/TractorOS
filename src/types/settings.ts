/**
 * @file settings.ts
 * System configuration definitions
 */

export interface ProximityConfig {
  sensitivity: number; // 1 (low) to 5 (high)
  nearThresholdDbm: number; // e.g. -70 dBm
  farThresholdDbm: number;  // e.g. -85 dBm
  lostTimeoutSeconds: number; // e.g. 5 seconds
  rssiSmoothingFactor: number; // e.g. 0.3 for EMA
}

export interface AutoCutoffConfig {
  enabled: boolean;
  gracePeriodSeconds: number; // 10s to 60s (default 30s)
  audibleWarningEnabled: boolean;
  vibrationAlertEnabled: boolean;
  requireManualRestartAfterCutoff: boolean;
}

export interface StartSystemConfig {
  pushStartMode: 'TWO_PRESS' | 'LONG_PRESS'; // 1st: Ignition, 2nd: Engine
  maxCrankDurationSeconds: number; // 1 to 5 seconds (safety timeout)
  requireBrakePedalToCrank: boolean;
  autoNeutralCheck: boolean;
}

export interface NotificationConfig {
  tamperAlerts: boolean;
  autoCutoffAlerts: boolean;
  connectionLostAlerts: boolean;
  lowBatteryAlerts: boolean;
  engineStallAlerts: boolean;
}

export interface TractorAppConfig {
  proximity: ProximityConfig;
  autoCutoff: AutoCutoffConfig;
  startSystem: StartSystemConfig;
  notifications: NotificationConfig;
  isMockMode: boolean;
  audioFeedbackEnabled: boolean;
}
