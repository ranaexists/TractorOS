/**
 * @file TractorStateMachine.ts
 * Strongly typed State Machine rules and pre-flight validation.
 * Ensures the mobile app strictly respects authoritative tractor state transitions.
 */

import { TractorOperationalState, TractorStatus } from '../../types/tractor';

export class TractorStateMachine {
  /**
   * Check if a specific command is valid given the current tractor status
   */
  public static canUnlock(status: TractorStatus): { allowed: boolean; reason?: string } {
    if (status.connection !== 'CONNECTED') {
      return { allowed: false, reason: 'Tractor BLE connection is not active.' };
    }
    if (!status.isOwnerAuthenticated) {
      return { allowed: false, reason: 'Digital key authentication required.' };
    }
    return { allowed: true };
  }

  public static canLock(status: TractorStatus): { allowed: boolean; reason?: string } {
    if (status.engineState === 'RUNNING') {
      return { allowed: false, reason: 'Cannot lock while engine is running.' };
    }
    return { allowed: true };
  }

  public static canTurnIgnitionOn(status: TractorStatus): { allowed: boolean; reason?: string } {
    if (status.connection !== 'CONNECTED') {
      return { allowed: false, reason: 'Tractor disconnected.' };
    }
    if (!status.isOwnerAuthenticated || status.lockState === 'LOCKED') {
      return { allowed: false, reason: 'Tractor is locked. Unlock first.' };
    }
    if (status.operationalState === 'ERROR') {
      return { allowed: false, reason: 'Controller in ERROR state. Clear faults first.' };
    }
    return { allowed: true };
  }

  public static canStartEngine(status: TractorStatus): { allowed: boolean; reason?: string } {
    if (status.connection !== 'CONNECTED') {
      return { allowed: false, reason: 'Bluetooth connection lost.' };
    }
    if (!status.isOwnerAuthenticated) {
      return { allowed: false, reason: 'Digital Key not verified.' };
    }
    if (status.lockState === 'LOCKED') {
      return { allowed: false, reason: 'Tractor is locked.' };
    }
    if (status.ignitionState !== 'IGNITION_ON') {
      return { allowed: false, reason: 'Ignition power must be turned ON first.' };
    }
    if (status.engineState === 'RUNNING') {
      return { allowed: false, reason: 'Engine is already running.' };
    }
    if (status.engineState === 'CRANKING') {
      return { allowed: false, reason: 'Starter motor crank currently in progress.' };
    }

    // Safety Interlocks Check
    if (!status.safety.emergencyStopDisengaged) {
      return { allowed: false, reason: 'Safety Interlock: Emergency Stop switch is engaged.' };
    }
    if (!status.safety.neutralGearEngaged) {
      return { allowed: false, reason: 'Safety Interlock: Transmission must be in Neutral.' };
    }
    if (!status.safety.clutchBrakePressed) {
      return { allowed: false, reason: 'Safety Interlock: Clutch / Brake pedal must be depressed.' };
    }
    if (!status.safety.operatorSeatOccupied) {
      return { allowed: false, reason: 'Safety Interlock: Operator seat switch not triggered.' };
    }
    if (status.safety.hardwareFaultDetected) {
      return { allowed: false, reason: 'Safety Interlock: ECU reported active hardware fault.' };
    }

    return { allowed: true };
  }

  public static canStopEngine(status: TractorStatus): { allowed: boolean; reason?: string } {
    if (status.engineState !== 'RUNNING' && status.engineState !== 'CRANKING') {
      return { allowed: false, reason: 'Engine is not running.' };
    }
    return { allowed: true };
  }

  /**
   * Determine primary push-start button label & action stage
   */
  public static getPushStartStage(status: TractorStatus): {
    stage: 'LOCKED' | 'POWER_ON' | 'START_ENGINE' | 'STOP_ENGINE' | 'CRANKING';
    label: string;
    subLabel: string;
    isEnabled: boolean;
    colorScheme: 'emerald' | 'amber' | 'rose' | 'slate';
  } {
    if (status.connection !== 'CONNECTED' || status.lockState === 'LOCKED' || !status.isOwnerAuthenticated) {
      return {
        stage: 'LOCKED',
        label: 'SYSTEM LOCKED',
        subLabel: 'Authorize & Unlock Tractor First',
        isEnabled: false,
        colorScheme: 'slate',
      };
    }

    if (status.engineState === 'CRANKING') {
      return {
        stage: 'CRANKING',
        label: 'CRANKING MOTOR...',
        subLabel: 'Engaging starter solenoid (1.5s)',
        isEnabled: false,
        colorScheme: 'amber',
      };
    }

    if (status.engineState === 'RUNNING') {
      return {
        stage: 'STOP_ENGINE',
        label: 'STOP ENGINE',
        subLabel: `${status.engineRpm} RPM • Tap to Shut Down`,
        isEnabled: true,
        colorScheme: 'rose',
      };
    }

    if (status.ignitionState === 'OFF') {
      return {
        stage: 'POWER_ON',
        label: 'PUSH 1: POWER ON',
        subLabel: 'Energize Cab Ignition Relay',
        isEnabled: true,
        colorScheme: 'amber',
      };
    }

    // Ignition is ON, engine STOPPED -> Ready for Push 2
    const startCheck = this.canStartEngine(status);
    return {
      stage: 'START_ENGINE',
      label: 'PUSH 2: START ENGINE',
      subLabel: startCheck.allowed ? 'Ready to Crank Diesel Engine' : (startCheck.reason || 'Check Safety Conditions'),
      isEnabled: startCheck.allowed,
      colorScheme: startCheck.allowed ? 'emerald' : 'slate',
    };
  }
}
