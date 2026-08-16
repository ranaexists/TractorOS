/**
 * @file security.ts
 * Types for Challenge-Response Digital Key & Device Authorization
 */

export interface DigitalKey {
  keyId: string;
  tractorId: string;
  deviceName: string;
  deviceFingerprint: string;
  role: 'OWNER' | 'OPERATOR' | 'TEMPORARY_GUEST';
  createdTimestamp: number;
  lastUsedTimestamp: number;
  isActive: boolean;
  publicKeyFingerprint: string;
  algorithm: 'HMAC-SHA256' | 'ECDSA-P256';
  expiresAt: number | null; // null for permanent owner
}

export interface AuthorizedDevice {
  id: string;
  name: string;
  model: string;
  role: 'OWNER' | 'OPERATOR' | 'TEMPORARY_GUEST';
  isCurrentDevice: boolean;
  addedAt: number;
  lastActive: number;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  accessPermissions: {
    canIgnition: boolean;
    canStartEngine: boolean;
    canChangeSettings: boolean;
    canAddDevices: boolean;
  };
}

export interface AuthChallenge {
  challengeId: string;
  tractorNonce: string;
  timestamp: number;
  tractorId: string;
}

export interface AuthResponsePayload {
  challengeId: string;
  phoneNonce: string;
  keyId: string;
  hmacSignature: string;
  timestamp: number;
}
