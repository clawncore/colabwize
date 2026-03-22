/**
 * Simple End-to-End Encryption Service using Web Crypto API
 * Uses AES-GCM for symmetric encryption/decryption
 */
class EncryptionService {
  private keyCache: Map<string, CryptoKey> = new Map();

  /**
   * Derive a deterministic key from a seed (e.g., workspace ID)
   * In a production app, this should involve a user-provided secret.
   */
  private async getDerivedKey(seed: string): Promise<CryptoKey> {
    if (this.keyCache.has(seed)) {
      return this.keyCache.get(seed)!;
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(seed.padEnd(32, "0").slice(0, 32)); // Simple derivation

    const key = await window.crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"],
    );

    this.keyCache.set(seed, key);
    return key;
  }

  /**
   * Encrypt content for a specific context (e.g., workspace)
   */
  async encrypt(content: string, contextId: string): Promise<string> {
    try {
      if (!content) return content;

      const key = await this.getDerivedKey(contextId);
      const encoder = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(content),
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error("Encryption failed:", error);
      return content; // Fallback to plain text on error (or handle differently)
    }
  }

  /**
   * Decrypt content for a specific context
   */
  async decrypt(encryptedBase64: string, contextId: string): Promise<string> {
    try {
      if (!encryptedBase64 || encryptedBase64.length < 20)
        return encryptedBase64; // Likely not encrypted

      const key = await this.getDerivedKey(contextId);

      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedBase64)
          .split("")
          .map((c) => c.charCodeAt(0)),
      );

      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data,
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      // If decryption fails, it might be an older unencrypted message
      // Return as-is or handle error
      return encryptedBase64;
    }
  }
}

const encryptionService = new EncryptionService();
export default encryptionService;
