/**
 * @file BleInterface.ts
 * Abstract interface for Bluetooth Low Energy communication with ESP32 Tractor Controller
 */

import { BleCommandType, BleDeviceScanResult, BlePacket } from '../../types/ble';
import { TractorStatus } from '../../types/tractor';

export type BlePacketListener = (packet: BlePacket) => void;
export type BleStatusListener = (status: TractorStatus) => void;
export type BleConnectionListener = (connected: boolean, deviceId?: string) => void;
export type BleRssiListener = (rssi: number) => void;

export interface IBleService {
  isSupported(): boolean;
  scanForDevices(timeoutMs?: number): Promise<BleDeviceScanResult[]>;
  connect(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectedDeviceId(): string | null;
  
  sendCommand(command: BleCommandType, payload?: Record<string, unknown>): Promise<boolean>;
  
  // Event subscriptions
  onPacketReceived(listener: BlePacketListener): () => void;
  onStatusUpdated(listener: BleStatusListener): () => void;
  onConnectionChanged(listener: BleConnectionListener): () => void;
  onRssiUpdated(listener: BleRssiListener): () => void;
  
  // Direct RSSI polling
  pollRssi(): Promise<number>;
}
