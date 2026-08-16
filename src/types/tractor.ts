/**
 * @file tractor.ts
 * Core domain types for Smart Tractor Keyless Access & Control System
 */

export type TractorConnectionState =
  | 'DISCONNECTED'
  | 'SCANNING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'AUTHENTICATED'
  | 'CONNECTION_LOST';

export type TractorOperationalState =
  | 'LOCKED'
  | 'AUTHENTICATING'
  | 'AUTHORIZED'
  | 'IGNITION_ON'
  | 'STARTING'
  | 'RUNNING'
  | 'WARNING'
  | 'SHUTDOWN_PENDING'
  | 'SHUTDOWN'
  | 'ERROR';

export type ProximityState =
  | 'UNKNOWN'
  | 'VERY_CLOSE' // < 1.5m (~ -45 to -60 dBm)
  | 'NEAR'       // 1.5 - 5m (~ -61 to -75 dBm)
  | 'FAR'        // 5 - 12m (~ -76 to -90 dBm)
  | 'LOST';      // > 12m or no packet (> -90 dBm or timeout)

export type LockState = 'LOCKED' | 'UNLOCKED';
export type IgnitionState = 'OFF' | 'ACCESSORY' | 'IGNITION_ON';
export type EngineState = 'STOPPED' | 'CRANKING' | 'RUNNING' | 'STALLED';

export interface SafetyConditions {
  neutralGearEngaged: boolean;
  clutchBrakePressed: boolean;
  operatorSeatOccupied: boolean;
  emergencyStopDisengaged: boolean;
  batteryVoltageSufficient: boolean;
  hardwareFaultDetected: boolean;
  ptoDisengaged: boolean; // Power Take-Off safety switch
}

export interface TractorStatus {
  tractorId: string;
  tractorName: string;
  firmwareVersion: string;
  connection: TractorConnectionState;
  operationalState: TractorOperationalState;
  lockState: LockState;
  ignitionState: IgnitionState;
  engineState: EngineState;
  proximityState: ProximityState;
  currentRssi: number; // dBm e.g. -65
  batteryVoltage: number; // e.g. 12.7V or 14.2V while running
  engineRpm: number;
  coolantTempC: number;
  fuelLevelPercent: number;
  autoCutoffEnabled: boolean;
  gracePeriodSeconds: number;
  gracePeriodRemaining: number | null;
  safety: SafetyConditions;
  isTamperAlertActive: boolean;
  lastCommunicationTime: number; // timestamp ms
  pairedDeviceId: string;
  isOwnerAuthenticated: boolean;
}

export interface TractorCommandResult {
  success: boolean;
  message: string;
  errorCode?: string;
  updatedState?: TractorOperationalState;
}
