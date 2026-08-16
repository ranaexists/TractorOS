/**
 * @file formatting.ts
 * Signal formatting, voltage health calculators, and timestamps
 */

export function formatRssi(rssi: number): {
  label: string;
  bars: number;
  color: string;
  distanceEstimate: string;
} {
  if (rssi >= -60) {
    return {
      label: 'Very Close',
      bars: 4,
      color: 'text-emerald-400',
      distanceEstimate: '< 1.5 meters (Cab Range)',
    };
  } else if (rssi >= -74) {
    return {
      label: 'Near',
      bars: 3,
      color: 'text-emerald-300',
      distanceEstimate: '1.5 - 5 meters (Implement Range)',
    };
  } else if (rssi >= -86) {
    return {
      label: 'Far',
      bars: 2,
      color: 'text-amber-400',
      distanceEstimate: '5 - 12 meters (Field Perimeter)',
    };
  } else {
    return {
      label: 'Lost / Critical',
      bars: 1,
      color: 'text-rose-500',
      distanceEstimate: '> 12 meters (Out of Range)',
    };
  }
}

export function formatVoltage(voltage: number): {
  text: string;
  status: 'OPTIMAL' | 'NORMAL' | 'LOW' | 'CRITICAL';
  color: string;
} {
  const text = `${voltage.toFixed(1)} V`;
  if (voltage >= 13.8) {
    return { text, status: 'OPTIMAL', color: 'text-emerald-400' }; // Alternator charging
  } else if (voltage >= 12.4) {
    return { text, status: 'NORMAL', color: 'text-emerald-300' }; // Resting full battery
  } else if (voltage >= 11.8) {
    return { text, status: 'LOW', color: 'text-amber-400' }; // Weak battery
  } else {
    return { text, status: 'CRITICAL', color: 'text-rose-500' }; // Critical undervoltage
  }
}

export function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatRelativeTime(ms: number): string {
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 2) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  return `${diffHrs}h ago`;
}
