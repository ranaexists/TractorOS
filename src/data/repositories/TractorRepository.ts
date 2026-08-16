/**
 * @file TractorRepository.ts
 * Concrete repository implementation managing BLE services, Proximity Engine,
 * and dispatching domain events.
 */

import { ITractorRepository } from '../../domain/repositories/ITractorRepository';
import { IBleService } from '../../services/ble/BleInterface';
import { ProximityEngine } from '../../services/proximity/ProximityEngine';
import { LocalStorageService } from '../../services/storage/LocalStorageService';
import { TractorCommandResult, TractorStatus } from '../../types/tractor';
import { BleDeviceScanResult, BlePacket } from '../../types/ble';
import { TractorEvent, EventCategory, EventSeverity } from '../../types/activity';
import { TractorStateMachine } from '../../domain/stateMachine/TractorStateMachine';
import { audioFeedback } from '../../core/utils/audioFeedback';

export class TractorRepository implements ITractorRepository {
  private bleService: IBleService;
  private proximityEngine: ProximityEngine;
  private statusListeners: Set<(status: TractorStatus) => void> = new Set();
  private eventListeners: Set<(event: TractorEvent) => void> = new Set();
  private currentStatus: TractorStatus;

  constructor(bleService: IBleService) {
    this.bleService = bleService;
    const config = LocalStorageService.getConfig();
    this.proximityEngine = new ProximityEngine(config.proximity);

    this.currentStatus = {
      tractorId: 'TRAC-ESP32-9842',
      tractorName: 'Mahindra 575 DI Smart',
      firmwareVersion: 'v2.4.1-SAFE_IGNITION',
      connection: 'DISCONNECTED',
      operationalState: 'LOCKED',
      lockState: 'LOCKED',
      ignitionState: 'OFF',
      engineState: 'STOPPED',
      proximityState: 'UNKNOWN',
      currentRssi: -100,
      batteryVoltage: 12.6,
      engineRpm: 0,
      coolantTempC: 32,
      fuelLevelPercent: 78,
      autoCutoffEnabled: config.autoCutoff.enabled,
      gracePeriodSeconds: config.autoCutoff.gracePeriodSeconds,
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

    this.setupBleListeners();
  }

  private setupBleListeners() {
    this.bleService.onStatusUpdated(status => {
      const prevEngine = this.currentStatus.engineState;
      const prevOperational = this.currentStatus.operationalState;

      this.currentStatus = { ...status };

      // Handle sound loops
      if (prevEngine !== 'RUNNING' && status.engineState === 'RUNNING') {
        audioFeedback.startEngineRumble();
      } else if (prevEngine === 'RUNNING' && status.engineState !== 'RUNNING') {
        audioFeedback.stopEngineRumble();
      }

      // Handle warning audio
      if (status.operationalState === 'WARNING' || status.operationalState === 'SHUTDOWN_PENDING') {
        audioFeedback.playWarningBeep(status.operationalState === 'SHUTDOWN_PENDING');
      }

      this.notifyStatusUpdated();
    });

    this.bleService.onPacketReceived(packet => {
      this.handleBlePacket(packet);
    });

    this.bleService.onConnectionChanged((connected, deviceId) => {
      if (connected) {
        audioFeedback.playAuthSuccess();
        this.logEvent(
          'CONNECTION',
          'SUCCESS',
          'Tractor Connected',
          `BLE link established with tractor controller (${deviceId || 'ESP32'}).`
        );
      } else {
        audioFeedback.stopEngineRumble();
        this.logEvent(
          'CONNECTION',
          'WARNING',
          'Tractor Disconnected',
          'BLE connection terminated. Security state reset to LOCKED.'
        );
      }
    });

    this.bleService.onRssiUpdated(rawRssi => {
      const { smoothedRssi, proximityState } = this.proximityEngine.processRssi(rawRssi);
      this.currentStatus.currentRssi = smoothedRssi;
      this.currentStatus.proximityState = proximityState;
      this.notifyStatusUpdated();
    });
  }

  private handleBlePacket(packet: BlePacket) {
    switch (packet.command as string) {
      case 'AUTH_SUCCESS':
        this.logEvent('SECURITY', 'SUCCESS', 'Owner Authenticated', 'Cryptographic Challenge-Response verified.');
        break;
      case 'LOCK_CHANGED':
        this.logEvent(
          'SECURITY',
          'INFO',
          `Tractor ${packet.payload.state === 'LOCKED' ? 'Locked' : 'Unlocked'}`,
          `Door & actuator lock relays toggled to ${packet.payload.state}.`
        );
        break;
      case 'IGNITION_CHANGED':
        this.logEvent(
          'ENGINE',
          'INFO',
          `Ignition ${packet.payload.state}`,
          `Main accessory and dashboard power line ${packet.payload.state}.`
        );
        break;
      case 'ENGINE_STARTED':
        this.logEvent('ENGINE', 'SUCCESS', 'Engine Started', `Diesel engine idle stabilized at ${packet.payload.rpm} RPM.`);
        break;
      case 'ENGINE_STOPPED':
        this.logEvent('ENGINE', 'INFO', 'Engine Stopped', 'Combustion cycle terminated cleanly.');
        break;
      case 'AUTO_CUTOFF_WARNING':
        this.logEvent(
          'PROXIMITY',
          'WARNING',
          'Auto-Cutoff Warning Started',
          `Operator moved out of proximity range. ${packet.payload.gracePeriod}s countdown active.`
        );
        break;
      case 'AUTO_CUTOFF_TRIGGERED':
        this.logEvent(
          'PROXIMITY',
          'CRITICAL',
          'Auto-Cutoff Triggered',
          'Engine shut down automatically to prevent unattended operation.'
        );
        break;
      case 'AUTO_CUTOFF_CANCELLED':
        this.logEvent(
          'PROXIMITY',
          'SUCCESS',
          'Auto-Cutoff Cancelled',
          'Operator returned to cab range; shutdown sequence aborted.'
        );
        break;
      case 'SAFETY_BLOCK':
        this.logEvent(
          'ERROR',
          'CRITICAL',
          'Engine Start Blocked by ESP32',
          `Hardware Safety Interlock triggered: ${packet.payload.reason}`
        );
        break;
      case 'TAMPER_DETECTED':
        this.logEvent(
          'SECURITY',
          'CRITICAL',
          'Tamper Alert Detected',
          'Accelerometer detected unauthorized impact or motion while locked.'
        );
        break;
    }
  }

  public async scanForTractors(): Promise<BleDeviceScanResult[]> {
    return this.bleService.scanForDevices();
  }

  public async connect(deviceId: string): Promise<boolean> {
    return this.bleService.connect(deviceId);
  }

  public async disconnect(): Promise<void> {
    return this.bleService.disconnect();
  }

  public async unlockTractor(): Promise<TractorCommandResult> {
    const check = TractorStateMachine.canUnlock(this.currentStatus);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Unlock not permitted.' };
    }
    audioFeedback.playRelayClick();
    const ok = await this.bleService.sendCommand('UNLOCK');
    return { success: ok, message: ok ? 'Tractor Unlocked' : 'BLE command failed' };
  }

  public async lockTractor(): Promise<TractorCommandResult> {
    const check = TractorStateMachine.canLock(this.currentStatus);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Lock not permitted.' };
    }
    audioFeedback.playRelayClick();
    const ok = await this.bleService.sendCommand('LOCK');
    return { success: ok, message: ok ? 'Tractor Locked' : 'BLE command failed' };
  }

  public async turnIgnitionOn(): Promise<TractorCommandResult> {
    const check = TractorStateMachine.canTurnIgnitionOn(this.currentStatus);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Ignition ON not permitted.' };
    }
    audioFeedback.playRelayClick();
    const ok = await this.bleService.sendCommand('IGNITION_ON');
    return { success: ok, message: ok ? 'Ignition Relay Energized' : 'Failed to toggle ignition' };
  }

  public async turnIgnitionOff(): Promise<TractorCommandResult> {
    audioFeedback.playRelayClick();
    const ok = await this.bleService.sendCommand('IGNITION_OFF');
    return { success: ok, message: ok ? 'Ignition Switched OFF' : 'Failed to turn off ignition' };
  }

  public async startEngine(): Promise<TractorCommandResult> {
    const check = TractorStateMachine.canStartEngine(this.currentStatus);
    if (!check.allowed) {
      audioFeedback.playWarningBeep(true);
      return { success: false, message: check.reason || 'Safety condition not met' };
    }

    audioFeedback.playStarterCrank(1600);
    const ok = await this.bleService.sendCommand('START_ENGINE');
    return {
      success: ok,
      message: ok ? 'Starter Engaged -> Engine Running' : 'Start command rejected by controller',
    };
  }

  public async stopEngine(): Promise<TractorCommandResult> {
    const check = TractorStateMachine.canStopEngine(this.currentStatus);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Cannot stop engine' };
    }

    const ok = await this.bleService.sendCommand('STOP_ENGINE');
    return { success: ok, message: ok ? 'Engine Stopped' : 'Failed to send stop command' };
  }

  public async cancelCutoffWarning(): Promise<TractorCommandResult> {
    const ok = await this.bleService.sendCommand('CANCEL_CUTOFF_WARNING');
    return { success: ok, message: ok ? 'Cutoff Cancelled' : 'Failed' };
  }

  public async triggerHornChirp(): Promise<TractorCommandResult> {
    audioFeedback.playRelayClick();
    const ok = await this.bleService.sendCommand('TRIGGER_HORN_CHIRP');
    return { success: ok, message: ok ? 'Horn Chirped' : 'Failed' };
  }

  public async toggleHazards(): Promise<TractorCommandResult> {
    audioFeedback.playRelayClick();
    const ok = await this.bleService.sendCommand('TOGGLE_HAZARD_LIGHTS');
    return { success: ok, message: ok ? 'Hazards Toggled' : 'Failed' };
  }

  public async resetTamperAlert(): Promise<TractorCommandResult> {
    const ok = await this.bleService.sendCommand('RESET_TAMPER_ALERT');
    return { success: ok, message: ok ? 'Tamper Alert Reset' : 'Failed' };
  }

  public async updateAutoCutoffSettings(enabled: boolean, gracePeriodSeconds: number): Promise<boolean> {
    return this.bleService.sendCommand('SET_AUTO_CUTOFF', { enabled, gracePeriodSeconds });
  }

  public subscribeStatus(listener: (status: TractorStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.currentStatus);
    return () => this.statusListeners.delete(listener);
  }

  public subscribeEvents(listener: (event: TractorEvent) => void): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  public getLatestStatus(): TractorStatus {
    return this.currentStatus;
  }

  private notifyStatusUpdated() {
    this.statusListeners.forEach(l => l(this.currentStatus));
  }

  private logEvent(
    category: EventCategory,
    severity: EventSeverity,
    title: string,
    description: string
  ) {
    const event: TractorEvent = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      category,
      severity,
      title,
      description,
      tractorId: this.currentStatus.tractorId,
    };

    const existing = LocalStorageService.getActivityLogs();
    LocalStorageService.saveActivityLogs([event, ...existing]);

    this.eventListeners.forEach(l => l(event));
  }
}
