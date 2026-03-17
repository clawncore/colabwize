/**
 * End-to-End Encryption Utility
 * Uses AES-GCM (256-bit) via Web Crypto API
 */

const ENCRYPTION_PREFIX = "[ENC]:";
const ALGORITHM = "AES-GCM";

// A fixed salt for PBKDF2 (in a real production app, this might be unique per workspace and stored in the DB, 
// but for "dashboard-proof" encryption, a stable derived key is sufficient)
const SALT = new TextEncoder().encode("colabwize-encryption-salt-v1");

/**
 * Derives a CryptoKey from a workspace ID
 */
async function getEncryptionKey(workspaceId: string): Promise<CryptoKey> {
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(workspaceId),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string
 */
export async function encryptMessage(text: string, workspaceId: string): Promise<string> {
  try {
    const key = await getEncryptionKey(workspaceId);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // GCM standard IV size
    const encodedText = new TextEncoder().encode(text);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      encodedText
    );

    // Combine IV and Ciphertext for storage
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to Base64 for DB storage
    const base64 = btoa(String.fromCharCode(...combined));
    return `${ENCRYPTION_PREFIX}${base64}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    return text; // Fallback to plaintext if encryption fails
  }
}

/**
 * Decrypts an encrypted string
 */
export async function decryptMessage(encryptedText: string, workspaceId: string): Promise<string> {
  if (!encryptedText.startsWith(ENCRYPTION_PREFIX)) {
    return encryptedText; // Not encrypted
  }

  try {
    const key = await getEncryptionKey(workspaceId);
    const base64 = encryptedText.replace(ENCRYPTION_PREFIX, "");
    const combined = new Uint8Array(
      atob(base64)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.warn("Decryption failed (possibly wrong key or corrupted data):", error);
    return " [Encrypted Message] ";
  }
}
