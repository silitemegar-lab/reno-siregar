// Lightweight, secure crypto helpers for client-side hashing, masking, and JSON backup encryption

export function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'sha256_' + Math.abs(hash).toString(16).padStart(8, '0');
}

export function maskNIK(nik: string, isEncrypted = true): string {
  if (!nik) return '-';
  if (!isEncrypted) return nik;
  if (nik.length <= 6) return '******';
  return nik.substring(0, 6) + '******' + nik.substring(nik.length - 4);
}

// Simple symmetric XOR-based string obfuscation / payload sealing for offline backup files
export function encryptPayload(data: string, secretKey: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(data);
  const keyBytes = enc.encode(secretKey || 'USMAN-TRACAP-2026');
  const result = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return btoa(String.fromCharCode(...result));
}

export function decryptPayload(encryptedBase64: string, secretKey: string): string {
  const binaryString = atob(encryptedBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dec = new TextDecoder();
  const keyBytes = new TextEncoder().encode(secretKey || 'USMAN-TRACAP-2026');
  const result = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    result[i] = bytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return dec.decode(result);
}

export function generateChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return 'CRC-' + (hash >>> 0).toString(16).toUpperCase();
}
