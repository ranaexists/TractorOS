/**
 * @file activity.ts
 * Event logging types for tractor telemetry, security and driver presence
 */

export type EventCategory =
  | 'SECURITY'
  | 'CONNECTION'
  | 'ENGINE'
  | 'PROXIMITY'
  | 'CONFIGURATION'
  | 'ERROR';

export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface TractorEvent {
  id: string;
  timestamp: number;
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  description: string;
  tractorId: string;
  metadata?: Record<string, unknown>;
}
