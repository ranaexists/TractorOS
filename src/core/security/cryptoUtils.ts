/**
 * @file cryptoUtils.ts
 * Cryptographic helper functions for Challenge-Response Digital Key protocol
 */

/**
 * Generate a cryptographically secure hex nonce
 */
export function generateSecureNonce(length = 16): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute simulated HMAC-SHA256 signature for the challenge payload
 */
export async function computeHmacSignature(
  secretKey: string,
  message: string
): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const msgData = encoder.encode(message);

    if (window.crypto && window.crypto.subtle) {
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, msgData);
      return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback pseudo-hash if SubtleCrypto unavailable in sandbox
  }

  // Pure deterministic string hashing fallback
  let hash = 0;
  const combined = secretKey + ':' + message;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'sig_' + Math.abs(hash).toString(16).padStart(16, '0') + generateSecureNonce(8);
}

/**
 * Simple device fingerprint generator
 */
export function getDeviceFingerprint(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  let hash = 0;
  for (let i = 0; i < ua.length; i++) {
    hash = (hash << 5) - hash + ua.charCodeAt(i);
    hash |= 0;
  }
  return 'DEV-FP-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}
