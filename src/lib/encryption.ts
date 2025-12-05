import CryptoJS from 'crypto-js';

export const encrypt = (text: string, passphrase: string): string => {
  if (!passphrase || !text) return text;
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

export const decrypt = (ciphertext: string, passphrase: string): string => {
  if (!passphrase || !ciphertext) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decryption failed", e);
    return "";
  }
};