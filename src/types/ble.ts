/**
 * @file ble.ts
 * Bluetooth Low Energy protocol constants, characteristics, command types and frame formats
 */

export const BLE_CONFIG = {
  // Custom GATT Service UUID for Tractor Controller ESP32
  SERVICE_UUID: '0000ffa0-0000-1000-8000-00805f9b34fb',
  
  // Characteristic UUIDs
  AUTH_CHAR_UUID: '0000ffa1-0000-1000-8000-00805f9b34fb',       // Read/Write (Challenge-Response)
  COMMAND_CHAR_UUID: '0000ffa2-0000-1000-8000-00805f9b34fb',    // WriteWithResponse (Commands)
  STATUS_CHAR_UUID: '0000ffa3-0000-1000-8000-00805f9b34fb',     // Read/Notify (Telemetry stream)
  CONFIG_CHAR_UUID: '0000ffa4-0000-1000-8000-00805f9b34fb',     // Read/Write (Thresholds, timeouts)
  NOTIFICATION_CHAR_UUID: '0000ffa5-0000-1000-8000-00805f9b34fb', // Notify (Asynchronous alerts, Tamper, Cutoff)
  
  DEVICE_NAME_PREFIX: 'TRACTOR_ESP32_',
  PROTOCOL_VERSION: '2.4.0',
};

export type BleCommandType =
  | 'AUTH_REQUEST'
  | 'AUTH_RESPONSE'
  | 'GET_STATUS'
  | 'UNLOCK'
  | 'LOCK'
  | 'IGNITION_ON'
  | 'IGNITION_OFF'
  | 'START_ENGINE'
  | 'STOP_ENGINE'
  | 'GET_PROXIMITY'
  | 'SET_PROXIMITY_THRESHOLD'
  | 'SET_AUTO_CUTOFF'
  | 'CANCEL_CUTOFF_WARNING'
  | 'GET_CONFIGURATION'
  | 'TRIGGER_HORN_CHIRP'
  | 'TOGGLE_HAZARD_LIGHTS'
  | 'RESET_TAMPER_ALERT'
  | 'HEARTBEAT';

export type BleEventType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILED'
  | 'LOCK_CHANGED'
  | 'IGNITION_CHANGED'
  | 'ENGINE_STARTED'
  | 'ENGINE_STOPPED'
  | 'PROXIMITY_CHANGED'
  | 'BLE_LOST'
  | 'AUTO_CUTOFF_WARNING'
  | 'AUTO_CUTOFF_TRIGGERED'
  | 'AUTO_CUTOFF_CANCELLED'
  | 'SAFETY_BLOCK'
  | 'LOW_VOLTAGE'
  | 'TAMPER_DETECTED'
  | 'STATUS_UPDATE';

export interface BlePacket {
  version: string;
  command: BleCommandType;
  sequenceId: number;
  timestamp: number;
  nonce: string;
  payload: Record<string, unknown>;
  signature?: string;
}

export interface BleDeviceScanResult {
  id: string;
  name: string;
  rssi: number;
  isPaired: boolean;
  advertisedServiceUuids: string[];
}
