/**
 * @file MockBleService.ts
 * High-fidelity ESP32 Tractor Hardware & BLE Simulator.
 * Simulates authoritative firmware state machine, safety interlocks, RSSI variations,
 * challenge-response authentication, two-stage push start, and auto-cutoff logic.
 */

import { BleCommandType, BleDeviceScanResult, BlePacket, BLE_CONFIG } from '../../types/ble';
import {
  TractorStatus,
  TractorOperationalState,
  SafetyConditions,
  ProximityState,
} from '../../types/tractor';
import {
  BleConnectionListener,
  BlePacketListener,
  BleRssiListener,
  BleStatusListener,
  IBleService,
} from './BleInterface';
import { generateSecureNonce } from '../../core/security/cryptoUtils';

export class MockBleService implements IBleService {
  private connected: boolean = false;
  private connectedDeviceId: string | null = null;
  private sequenceNumber: number = 0;

  private packetListeners: Set<BlePacketListener> = new Set();
  private statusListeners: Set<BleStatusListener> = new Set();
  private connectionListeners: Set<BleConnectionListener> = new Set();
  private rssiListeners: Set<BleRssiListener> = new Set();

  // Autoritative ESP32 Firmware State
  private firmwareStatus: TractorStatus = {
    tractorId: 'TRAC-ESP32-9842',
    tractorName: 'Mahindra 575 DI Smart',
    firmwareVersion: 'v2.4.1-SAFE_IGNITION',
    connection: 'DISCONNECTED',
    operationalState: 'LOCKED',
    lockState: 'LOCKED',
    ignitionState: 'OFF',
    engineState: 'STOPPED',
    proximityState: 'VERY_CLOSE',
    currentRssi: -56,
    batteryVoltage: 12.6,
    engineRpm: 0,
    coolantTempC: 38,
    fuelLevelPercent: 78,
    autoCutoffEnabled: true,
    gracePeriodSeconds: 30,
    gracePeriodRemaining: null,
    safety: {
      neutralGearEngaged: true,
      clutchBrakePressed: true,
      operatorSeatOccupied: true,
      emergencyStopDisengaged: true,
      batteryVoltageSufficient: true,
      hardwareFaultDetected: false,
      ptoDisengaged: true,
    },
    isTamperAlertActive: false,
    lastCommunicationTime: Date.now(),
    pairedDeviceId: 'DEV-OWNER-PRIMARY',
    isOwnerAuthenticated: false,
  };

  private rssiInterval: ReturnType<typeof setInterval> | null = null;
  private gracePeriodInterval: ReturnType<typeof setInterval> | null = null;
  private simulatedDistanceMeters: number = 0.8; // default 0.8m inside cab

  constructor() {
    this.startTelemetryLoop();
  }

  public isSupported(): boolean {
    return true; // Mock is always supported
  }

  public async scanForDevices(timeoutMs = 1200): Promise<BleDeviceScanResult[]> {
    await new Promise(resolve => setTimeout(resolve, timeoutMs));
    return [
      {
        id: 'TRAC-ESP32-9842',
        name: 'TRACTOR_ESP32_9842 (Cab Controller)',
        rssi: this.calculateRssiFromDistance(),
        isPaired: true,
        advertisedServiceUuids: [BLE_CONFIG.SERVICE_UUID],
      },
      {
        id: 'TRAC-ESP32-3310',
        name: 'TRACTOR_ESP32_3310 (John Deere 5050)',
        rssi: -88,
        isPaired: false,
        advertisedServiceUuids: [BLE_CONFIG.SERVICE_UUID],
      },
    ];
  }

  public async connect(deviceId: string): Promise<boolean> {
    this.firmwareStatus.connection = 'CONNECTING';
    this.notifyStatusUpdated();

    await new Promise(resolve => setTimeout(resolve, 800));

    this.connected = true;
    this.connectedDeviceId = deviceId;
    this.firmwareStatus.connection = 'CONNECTED';
    this.firmwareStatus.lastCommunicationTime = Date.now();
    this.notifyConnectionChanged(true, deviceId);
    this.notifyStatusUpdated();

    // Trigger auto challenge-response sequence simulation
    this.performAutoAuth();
    return true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
    this.connectedDeviceId = null;
    this.firmwareStatus.connection = 'DISCONNECTED';
    this.firmwareStatus.operationalState = 'LOCKED';
    this.firmwareStatus.lockState = 'LOCKED';
    this.firmwareStatus.isOwnerAuthenticated = false;
    this.stopGracePeriod();
    this.notifyConnectionChanged(false);
    this.notifyStatusUpdated();
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getConnectedDeviceId(): string | null {
    return this.connectedDeviceId;
  }

  /**
   * Handle incoming BLE command packet and execute firmware logic
   */
  public async sendCommand(command: BleCommandType, payload: Record<string, unknown> = {}): Promise<boolean> {
    if (!this.connected && command !== 'AUTH_REQUEST') {
      return false;
    }

    this.firmwareStatus.lastCommunicationTime = Date.now();

    switch (command) {
      case 'AUTH_REQUEST':
      case 'AUTH_RESPONSE':
        return this.handleAuthResponse(payload);

      case 'UNLOCK':
        if (!this.firmwareStatus.isOwnerAuthenticated) return false;
        this.firmwareStatus.lockState = 'UNLOCKED';
        if (this.firmwareStatus.operationalState === 'LOCKED') {
          this.firmwareStatus.operationalState = 'AUTHORIZED';
        }
        this.emitPacket('LOCK_CHANGED', { state: 'UNLOCKED' });
        this.notifyStatusUpdated();
        return true;

      case 'LOCK':
        this.firmwareStatus.lockState = 'LOCKED';
        if (this.firmwareStatus.engineState === 'STOPPED') {
          this.firmwareStatus.ignitionState = 'OFF';
          this.firmwareStatus.operationalState = 'LOCKED';
        }
        this.emitPacket('LOCK_CHANGED', { state: 'LOCKED' });
        this.notifyStatusUpdated();
        return true;

      case 'IGNITION_ON':
        if (!this.firmwareStatus.isOwnerAuthenticated || this.firmwareStatus.lockState === 'LOCKED') {
          return false;
        }
        this.firmwareStatus.ignitionState = 'IGNITION_ON';
        this.firmwareStatus.operationalState = 'IGNITION_ON';
        this.firmwareStatus.batteryVoltage = 12.4; // slight load drop
        this.emitPacket('IGNITION_CHANGED', { state: 'IGNITION_ON' });
        this.notifyStatusUpdated();
        return true;

      case 'IGNITION_OFF':
        this.firmwareStatus.ignitionState = 'OFF';
        this.firmwareStatus.engineState = 'STOPPED';
        this.firmwareStatus.engineRpm = 0;
        this.firmwareStatus.batteryVoltage = 12.6;
        this.firmwareStatus.operationalState = this.firmwareStatus.isOwnerAuthenticated ? 'AUTHORIZED' : 'LOCKED';
        this.stopGracePeriod();
        this.emitPacket('IGNITION_CHANGED', { state: 'OFF' });
        this.notifyStatusUpdated();
        return true;

      case 'START_ENGINE':
        return this.handleStartEngine();

      case 'STOP_ENGINE':
        this.firmwareStatus.engineState = 'STOPPED';
        this.firmwareStatus.engineRpm = 0;
        this.firmwareStatus.batteryVoltage = 12.4; // back to battery voltage
        this.firmwareStatus.operationalState = 'IGNITION_ON';
        this.stopGracePeriod();
        this.emitPacket('ENGINE_STOPPED', { reason: 'USER_COMMAND' });
        this.notifyStatusUpdated();
        return true;

      case 'CANCEL_CUTOFF_WARNING':
        this.stopGracePeriod();
        if (this.firmwareStatus.engineState === 'RUNNING') {
          this.firmwareStatus.operationalState = 'RUNNING';
        }
        this.emitPacket('AUTO_CUTOFF_CANCELLED', {});
        this.notifyStatusUpdated();
        return true;

      case 'SET_AUTO_CUTOFF':
        if (typeof payload.enabled === 'boolean') {
          this.firmwareStatus.autoCutoffEnabled = payload.enabled;
        }
        if (typeof payload.gracePeriodSeconds === 'number') {
          this.firmwareStatus.gracePeriodSeconds = payload.gracePeriodSeconds;
        }
        this.notifyStatusUpdated();
        return true;

      case 'RESET_TAMPER_ALERT':
        this.firmwareStatus.isTamperAlertActive = false;
        this.notifyStatusUpdated();
        return true;

      case 'TRIGGER_HORN_CHIRP':
        this.emitPacket('STATUS_UPDATE', { chirp: true });
        return true;

      case 'TOGGLE_HAZARD_LIGHTS':
        this.emitPacket('STATUS_UPDATE', { hazards: true });
        return true;

      default:
        return true;
    }
  }

  /**
   * Push start engine crank logic with safety checks
   */
  private async handleStartEngine(): Promise<boolean> {
    // 1. Check basic authorization & ignition
    if (!this.firmwareStatus.isOwnerAuthenticated || this.firmwareStatus.lockState === 'LOCKED') {
      this.emitPacket('SAFETY_BLOCK', { reason: 'UNAUTHORIZED_OR_LOCKED' });
      return false;
    }

    if (this.firmwareStatus.ignitionState !== 'IGNITION_ON') {
      this.emitPacket('SAFETY_BLOCK', { reason: 'IGNITION_MUST_BE_ON_FIRST' });
      return false;
    }

    // 2. Hardware safety interlocks check (Authoritative ESP32 safety validation)
    const { neutralGearEngaged, clutchBrakePressed, emergencyStopDisengaged, hardwareFaultDetected } = this.firmwareStatus.safety;

    if (!emergencyStopDisengaged) {
      this.emitPacket('SAFETY_BLOCK', { reason: 'EMERGENCY_STOP_ENGAGED' });
      this.firmwareStatus.operationalState = 'ERROR';
      this.notifyStatusUpdated();
      return false;
    }

    if (!neutralGearEngaged) {
      this.emitPacket('SAFETY_BLOCK', { reason: 'GEAR_NOT_IN_NEUTRAL' });
      return false;
    }

    if (!clutchBrakePressed) {
      this.emitPacket('SAFETY_BLOCK', { reason: 'CLUTCH_BRAKE_NOT_DEPRESSED' });
      return false;
    }

    if (hardwareFaultDetected) {
      this.emitPacket('SAFETY_BLOCK', { reason: 'HARDWARE_FAULT_DETECTED' });
      return false;
    }

    // 3. Initiate cranking sequence
    this.firmwareStatus.engineState = 'CRANKING';
    this.firmwareStatus.operationalState = 'STARTING';
    this.firmwareStatus.batteryVoltage = 10.8; // Voltage dip under heavy starter motor load
    this.notifyStatusUpdated();

    // Simulate 1.6s starter crank duration
    await new Promise(resolve => setTimeout(resolve, 1600));

    // Crank successful -> Engine running
    this.firmwareStatus.engineState = 'RUNNING';
    this.firmwareStatus.operationalState = 'RUNNING';
    this.firmwareStatus.engineRpm = 850; // Diesel idle RPM
    this.firmwareStatus.batteryVoltage = 14.2; // Alternator charging voltage
    this.emitPacket('ENGINE_STARTED', { rpm: 850, voltage: 14.2 });
    this.notifyStatusUpdated();

    return true;
  }

  private async performAutoAuth() {
    this.firmwareStatus.operationalState = 'AUTHENTICATING';
    this.notifyStatusUpdated();

    // Challenge-response simulated delay
    await new Promise(resolve => setTimeout(resolve, 600));

    this.firmwareStatus.isOwnerAuthenticated = true;
    this.firmwareStatus.lockState = 'UNLOCKED';
    this.firmwareStatus.operationalState = 'AUTHORIZED';
    this.emitPacket('AUTH_SUCCESS', { keyId: 'KEY-OWNER-SECURE-99' });
    this.notifyStatusUpdated();
  }

  private handleAuthResponse(payload: Record<string, unknown>): boolean {
    if (payload.keyId) {
      this.firmwareStatus.isOwnerAuthenticated = true;
      this.firmwareStatus.lockState = 'UNLOCKED';
      this.firmwareStatus.operationalState = 'AUTHORIZED';
      this.emitPacket('AUTH_SUCCESS', { keyId: payload.keyId });
      this.notifyStatusUpdated();
      return true;
    }
    return false;
  }

  private emitPacket(event: string, payload: Record<string, unknown>) {
    const packet: BlePacket = {
      version: BLE_CONFIG.PROTOCOL_VERSION,
      command: event as any,
      sequenceId: ++this.sequenceNumber,
      timestamp: Date.now(),
      nonce: generateSecureNonce(8),
      payload,
    };
    this.packetListeners.forEach(listener => listener(packet));
  }

  private startTelemetryLoop() {
    this.rssiInterval = setInterval(() => {
      if (!this.connected) return;

      // Real-time jitter simulation on RSSI
      const baseRssi = this.calculateRssiFromDistance();
      const jitter = (Math.random() - 0.5) * 3; // +/- 1.5 dBm natural noise
      const currentRssi = Math.round(baseRssi + jitter);
      this.firmwareStatus.currentRssi = currentRssi;

      // Calculate proximity state
      let prox: ProximityState = 'VERY_CLOSE';
      if (currentRssi < -88) {
        prox = 'LOST';
      } else if (currentRssi < -76) {
        prox = 'FAR';
      } else if (currentRssi < -62) {
        prox = 'NEAR';
      } else {
        prox = 'VERY_CLOSE';
      }
      this.firmwareStatus.proximityState = prox;

      // Small thermal and RPM variations if running
      if (this.firmwareStatus.engineState === 'RUNNING') {
        this.firmwareStatus.engineRpm = Math.round(850 + (Math.random() - 0.5) * 20);
        if (this.firmwareStatus.coolantTempC < 82) {
          this.firmwareStatus.coolantTempC += 0.2;
        }
      }

      // Check Auto Cutoff triggers if owner moved to FAR / LOST while engine is running!
      this.checkAutoCutoffLogic(prox);

      this.rssiListeners.forEach(l => l(currentRssi));
      this.notifyStatusUpdated();
    }, 1000);
  }

  /**
   * Autoritative Auto-Cutoff Logic running on simulated ESP32
   */
  private checkAutoCutoffLogic(proximity: ProximityState) {
    if (!this.firmwareStatus.autoCutoffEnabled || this.firmwareStatus.engineState !== 'RUNNING') {
      return;
    }

    if (proximity === 'FAR' || proximity === 'LOST') {
      // Owner is away while tractor engine is active!
      if (!this.gracePeriodInterval && this.firmwareStatus.operationalState !== 'SHUTDOWN_PENDING') {
        this.startGracePeriod();
      }
    } else {
      // Owner returned to cab range (NEAR or VERY_CLOSE)
      if (this.gracePeriodInterval) {
        this.stopGracePeriod();
        this.firmwareStatus.operationalState = 'RUNNING';
        this.emitPacket('AUTO_CUTOFF_CANCELLED', { reason: 'OWNER_RETURNED' });
        this.notifyStatusUpdated();
      }
    }
  }

  private startGracePeriod() {
    this.firmwareStatus.operationalState = 'WARNING';
    this.firmwareStatus.gracePeriodRemaining = this.firmwareStatus.gracePeriodSeconds;
    this.emitPacket('AUTO_CUTOFF_WARNING', { gracePeriod: this.firmwareStatus.gracePeriodSeconds });
    this.notifyStatusUpdated();

    this.gracePeriodInterval = setInterval(() => {
      if (this.firmwareStatus.gracePeriodRemaining === null) return;

      this.firmwareStatus.gracePeriodRemaining -= 1;
      if (this.firmwareStatus.gracePeriodRemaining <= 5 && this.firmwareStatus.gracePeriodRemaining > 0) {
        this.firmwareStatus.operationalState = 'SHUTDOWN_PENDING';
      }

      if (this.firmwareStatus.gracePeriodRemaining <= 0) {
        // Cutoff triggered by ESP32!
        this.stopGracePeriod();
        this.firmwareStatus.engineState = 'STOPPED';
        this.firmwareStatus.engineRpm = 0;
        this.firmwareStatus.ignitionState = 'OFF';
        this.firmwareStatus.operationalState = 'SHUTDOWN';
        this.firmwareStatus.batteryVoltage = 12.5;
        this.emitPacket('AUTO_CUTOFF_TRIGGERED', { reason: 'PROXIMITY_TIMEOUT' });
        this.notifyStatusUpdated();
      } else {
        this.notifyStatusUpdated();
      }
    }, 1000);
  }

  private stopGracePeriod() {
    if (this.gracePeriodInterval) {
      clearInterval(this.gracePeriodInterval);
      this.gracePeriodInterval = null;
    }
    this.firmwareStatus.gracePeriodRemaining = null;
  }

  private calculateRssiFromDistance(): number {
    // Free space path loss model simulation: RSSI = -45 - 20 * log10(d)
    const dist = Math.max(0.2, this.simulatedDistanceMeters);
    return Math.round(-45 - 24 * Math.log10(dist));
  }

  // Simulator Hardware Injectors (used by Developer Simulation panel)
  public setSimulatedDistance(meters: number) {
    this.simulatedDistanceMeters = meters;
  }

  public setSafetyCondition(key: keyof SafetyConditions, value: boolean) {
    this.firmwareStatus.safety[key] = value;
    this.notifyStatusUpdated();
  }

  public setBatteryVoltage(volts: number) {
    this.firmwareStatus.batteryVoltage = volts;
    this.notifyStatusUpdated();
  }

  public triggerTamperVibration() {
    this.firmwareStatus.isTamperAlertActive = true;
    this.emitPacket('TAMPER_DETECTED', { timestamp: Date.now(), gForce: 2.8 });
    this.notifyStatusUpdated();
  }

  public getLiveStatus(): TractorStatus {
    return { ...this.firmwareStatus, safety: { ...this.firmwareStatus.safety } };
  }

  public async pollRssi(): Promise<number> {
    return this.firmwareStatus.currentRssi;
  }

  // Listener subscriptions
  public onPacketReceived(listener: BlePacketListener): () => void {
    this.packetListeners.add(listener);
    return () => this.packetListeners.delete(listener);
  }

  public onStatusUpdated(listener: BleStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getLiveStatus());
    return () => this.statusListeners.delete(listener);
  }

  public onConnectionChanged(listener: BleConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connected, this.connectedDeviceId || undefined);
    return () => this.connectionListeners.delete(listener);
  }

  public onRssiUpdated(listener: BleRssiListener): () => void {
    this.rssiListeners.add(listener);
    return () => this.rssiListeners.delete(listener);
  }

  private notifyStatusUpdated() {
    const s = this.getLiveStatus();
    this.statusListeners.forEach(l => l(s));
  }

  private notifyConnectionChanged(connected: boolean, id?: string) {
    this.connectionListeners.forEach(l => l(connected, id));
  }
}
