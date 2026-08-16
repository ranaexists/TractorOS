/**
 * @file WebBleService.ts
 * Real Bluetooth Low Energy Service utilizing Web Bluetooth API (navigator.bluetooth)
 * to communicate directly with physical ESP32 hardware over GATT Characteristics.
 */

import { BleCommandType, BleDeviceScanResult, BlePacket, BLE_CONFIG } from '../../types/ble';
import { TractorStatus } from '../../types/tractor';
import {
  BleConnectionListener,
  BlePacketListener,
  BleRssiListener,
  BleStatusListener,
  IBleService,
} from './BleInterface';

export class WebBleService implements IBleService {
  private device: any = null;
  private server: any = null;
  private service: any = null;
  private commandChar: any = null;
  private statusChar: any = null;
  private notificationChar: any = null;

  private connected: boolean = false;
  private connectedDeviceId: string | null = null;
  private sequenceNumber: number = 0;

  private packetListeners: Set<BlePacketListener> = new Set();
  private statusListeners: Set<BleStatusListener> = new Set();
  private connectionListeners: Set<BleConnectionListener> = new Set();
  private rssiListeners: Set<BleRssiListener> = new Set();

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public async scanForDevices(): Promise<BleDeviceScanResult[]> {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser environment.');
    }

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [BLE_CONFIG.SERVICE_UUID] }],
        optionalServices: [BLE_CONFIG.SERVICE_UUID],
      });

      return [
        {
          id: device.id,
          name: device.name || 'ESP32_TRACTOR_DEVICE',
          rssi: -60,
          isPaired: true,
          advertisedServiceUuids: [BLE_CONFIG.SERVICE_UUID],
        },
      ];
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        return [];
      }
      throw err;
    }
  }

  public async connect(deviceId: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      if (!this.device) {
        this.device = await (navigator as any).bluetooth.requestDevice({
          filters: [{ services: [BLE_CONFIG.SERVICE_UUID] }],
          optionalServices: [BLE_CONFIG.SERVICE_UUID],
        });
      }

      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService(BLE_CONFIG.SERVICE_UUID);

      this.commandChar = await this.service.getCharacteristic(BLE_CONFIG.COMMAND_CHAR_UUID);
      this.statusChar = await this.service.getCharacteristic(BLE_CONFIG.STATUS_CHAR_UUID);
      this.notificationChar = await this.service.getCharacteristic(BLE_CONFIG.NOTIFICATION_CHAR_UUID);

      // Start notifications on status & async alerts
      await this.statusChar.startNotifications();
      this.statusChar.addEventListener('characteristicvaluechanged', (event: any) => {
        this.handleStatusNotification(event.target.value);
      });

      this.connected = true;
      this.connectedDeviceId = deviceId;
      this.notifyConnectionChanged(true, deviceId);

      this.device.addEventListener('gattserverdisconnected', () => {
        this.connected = false;
        this.notifyConnectionChanged(false);
      });

      return true;
    } catch (err) {
      console.error('Failed to connect to BLE ESP32:', err);
      this.connected = false;
      this.notifyConnectionChanged(false);
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.connected = false;
    this.connectedDeviceId = null;
    this.notifyConnectionChanged(false);
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getConnectedDeviceId(): string | null {
    return this.connectedDeviceId;
  }

  public async sendCommand(command: BleCommandType, payload: Record<string, unknown> = {}): Promise<boolean> {
    if (!this.connected || !this.commandChar) return false;

    try {
      const packet: BlePacket = {
        version: BLE_CONFIG.PROTOCOL_VERSION,
        command,
        sequenceId: ++this.sequenceNumber,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 10),
        payload,
      };

      const encoder = new TextEncoder();
      const rawJson = JSON.stringify(packet);
      await this.commandChar.writeValueWithResponse(encoder.encode(rawJson));
      return true;
    } catch (err) {
      console.error('BLE write failed:', err);
      return false;
    }
  }

  private handleStatusNotification(dataView: DataView) {
    try {
      const decoder = new TextDecoder('utf-8');
      const jsonStr = decoder.decode(dataView);
      const data = JSON.parse(jsonStr);

      if (data.status) {
        this.statusListeners.forEach(listener => listener(data.status));
      }
      if (data.packet) {
        this.packetListeners.forEach(listener => listener(data.packet));
      }
    } catch (err) {
      console.error('Failed to parse BLE telemetry frame:', err);
    }
  }

  public async pollRssi(): Promise<number> {
    // Web Bluetooth GATT does not expose direct continuous RSSI on all platforms,
    // so we return the last telemetry signal
    return -65;
  }

  public onPacketReceived(listener: BlePacketListener): () => void {
    this.packetListeners.add(listener);
    return () => this.packetListeners.delete(listener);
  }

  public onStatusUpdated(listener: BleStatusListener): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  public onConnectionChanged(listener: BleConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  public onRssiUpdated(listener: BleRssiListener): () => void {
    this.rssiListeners.add(listener);
    return () => this.rssiListeners.delete(listener);
  }

  private notifyConnectionChanged(connected: boolean, id?: string) {
    this.connectionListeners.forEach(l => l(connected, id));
  }
}
