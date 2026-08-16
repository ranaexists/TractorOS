/**
 * @file ITractorRepository.ts
 * Domain repository interface for tractor operations
 */

import { TractorCommandResult, TractorOperationalState, TractorStatus } from '../../types/tractor';
import { BleDeviceScanResult } from '../../types/ble';
import { TractorEvent } from '../../types/activity';

export interface ITractorRepository {
  scanForTractors(): Promise<BleDeviceScanResult[]>;
  connect(deviceId: string): Promise<boolean>;
  disconnect(): Promise<void>;
  
  // Tractor control actions
  unlockTractor(): Promise<TractorCommandResult>;
  lockTractor(): Promise<TractorCommandResult>;
  turnIgnitionOn(): Promise<TractorCommandResult>;
  turnIgnitionOff(): Promise<TractorCommandResult>;
  startEngine(): Promise<TractorCommandResult>;
  stopEngine(): Promise<TractorCommandResult>;
  cancelCutoffWarning(): Promise<TractorCommandResult>;
  triggerHornChirp(): Promise<TractorCommandResult>;
  toggleHazards(): Promise<TractorCommandResult>;
  resetTamperAlert(): Promise<TractorCommandResult>;
  updateAutoCutoffSettings(enabled: boolean, gracePeriodSeconds: number): Promise<boolean>;
  
  // State streams
  subscribeStatus(listener: (status: TractorStatus) => void): () => void;
  subscribeEvents(listener: (event: TractorEvent) => void): () => void;
  getLatestStatus(): TractorStatus;
}
