import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeMessage(message: string): string {
  return btoa(unescape(encodeURIComponent(message)));
}

export function decodeMessage(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return encoded;
  }
}

// AES-GCM encryption/decryption utilities (demo: static key)
const AES_KEY_HEX = '0123456789abcdef0123456789abcdef'; // 32 hex chars = 16 bytes = 128 bits
const AES_IV_HEX = 'abcdef9876543210abcdef9876543210'; // 32 hex chars = 16 bytes

function hexToBytes(hex: string) {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

async function getAesKey() {
  return await window.crypto.subtle.importKey(
    'raw',
    hexToBytes(AES_KEY_HEX),
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(plain: string): Promise<string> {
  const key = await getAesKey();
  const iv = hexToBytes(AES_IV_HEX);
  const encoded = new TextEncoder().encode(plain);
  const cipher = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  return btoa(String.fromCharCode(...new Uint8Array(cipher)));
}

export async function decryptMessage(cipher: string): Promise<string> {
  const key = await getAesKey();
  const iv = hexToBytes(AES_IV_HEX);
  const data = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
  try {
    const plain = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    return new TextDecoder().decode(plain);
  } catch {
    return cipher;
  }
}
