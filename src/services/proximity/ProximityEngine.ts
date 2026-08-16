/**
 * @file ProximityEngine.ts
 * Signal processing engine for BLE RSSI. Uses Exponential Moving Average (EMA)
 * to smooth RF signal spikes and accurately classify proximity zones.
 */

import { ProximityState } from '../../types/tractor';
import { ProximityConfig } from '../../types/settings';

export class ProximityEngine {
  private smoothedRssi: number | null = null;
  private lastRssiTimestamp: number = 0;
  private config: ProximityConfig;

  constructor(config: ProximityConfig) {
    this.config = config;
  }

  public updateConfig(newConfig: ProximityConfig) {
    this.config = newConfig;
  }

  /**
   * Push raw RSSI sample and receive smoothed value & classified proximity zone
   */
  public processRssi(rawRssi: number): {
    smoothedRssi: number;
    proximityState: ProximityState;
  } {
    this.lastRssiTimestamp = Date.now();

    if (this.smoothedRssi === null) {
      this.smoothedRssi = rawRssi;
    } else {
      const alpha = this.config.rssiSmoothingFactor; // e.g. 0.35
      this.smoothedRssi = alpha * rawRssi + (1 - alpha) * this.smoothedRssi;
    }

    const state = this.classifyZone(this.smoothedRssi);
    return {
      smoothedRssi: Math.round(this.smoothedRssi),
      proximityState: state,
    };
  }

  public classifyZone(rssi: number): ProximityState {
    // Calibrated dynamic thresholds based on sensitivity setting
    // Sensitivity 1-5 adjusts threshold +/- 6 dBm
    const sensitivityOffset = (this.config.sensitivity - 3) * 3;
    const nearThresh = this.config.nearThresholdDbm + sensitivityOffset;
    const farThresh = this.config.farThresholdDbm + sensitivityOffset;

    if (rssi > -60) {
      return 'VERY_CLOSE'; // Directly in cab / on seat
    } else if (rssi >= nearThresh) {
      return 'NEAR'; // Near tractor perimeter (< 5m)
    } else if (rssi >= farThresh) {
      return 'FAR'; // Walking away (5 - 12m)
    } else {
      return 'LOST'; // Out of safe operating boundary
    }
  }

  public isSignalTimedOut(): boolean {
    if (this.lastRssiTimestamp === 0) return true;
    return (Date.now() - this.lastRssiTimestamp) > (this.config.lostTimeoutSeconds * 1000);
  }

  public reset() {
    this.smoothedRssi = null;
    this.lastRssiTimestamp = 0;
  }
}
