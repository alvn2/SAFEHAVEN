import CryptoJS from 'crypto-js';

export const encrypt = (text: string, passphrase: string): string => {
  if (!passphrase || !text) return text;
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

export const decrypt = (ciphertext: string, passphrase: string): string => {
  if (!passphrase || !ciphertext) return ciphertext;
  if (!ciphertext.startsWith('U2FsdGVkX1')) return ciphertext; // Legacy plaintext fallback
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    if (!bytes || bytes.sigBytes <= 0) return "";
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption produced non-printable control characters, it is random noise from a wrong key
    if (!decrypted || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(decrypted)) {
      return "";
    }
    return decrypted;
  } catch (e) {
    return "";
  }
};