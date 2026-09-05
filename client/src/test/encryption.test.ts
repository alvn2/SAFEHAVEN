import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../lib/encryption';

describe('Zero-Knowledge Client-Side Encryption', () => {
  it('returns plaintext if passphrase is empty', () => {
    const raw = 'Unencrypted entry';
    expect(encrypt(raw, '')).toBe(raw);
    expect(decrypt(raw, '')).toBe(raw);
  });

  it('encrypts plaintext into CryptoJS OpenSSL salted ciphertext format', () => {
    const plaintext = 'My personal reflections and feelings';
    const passphrase = 'sample-test-passphrase-1234';
    const ciphertext = encrypt(plaintext, passphrase);

    expect(ciphertext).not.toBe(plaintext);
    // CryptoJS AES formatted ciphertext starts with "U2FsdGVkX1" (base64 for "Salted__")
    expect(ciphertext.startsWith('U2FsdGVkX1')).toBe(true);
  });

  it('decrypts encrypted ciphertext with correct passphrase', () => {
    const originalText = 'Private journal text content with emojis 🌿🛡️';
    const passphrase = 'secure-session-key-xyz';
    const ciphertext = encrypt(originalText, passphrase);
    const decrypted = decrypt(ciphertext, passphrase);

    expect(decrypted).toBe(originalText);
  });

  it('gracefully returns empty string on wrong passphrase without throwing', () => {
    const originalText = 'Secret thought';
    const correctPassphrase = 'correct-password';
    const wrongPassphrase = 'wrong-password';
    const ciphertext = encrypt(originalText, correctPassphrase);
    const decrypted = decrypt(ciphertext, wrongPassphrase);

    expect(decrypted).toBe('');
  });

  it('handles legacy unencrypted plaintext backward compatibility gracefully', () => {
    const legacyPlaintext = 'Plain unencrypted entry from before ZK encryption';
    const passphrase = 'any-passphrase';
    const result = decrypt(legacyPlaintext, passphrase);

    expect(result).toBe(legacyPlaintext);
  });

  it('handles empty strings without errors', () => {
    expect(encrypt('', 'key')).toBe('');
    expect(decrypt('', 'key')).toBe('');
  });
});
