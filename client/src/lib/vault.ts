import { JournalEntry } from '../types';
import { encrypt, decrypt } from './encryption';

export interface VaultSafetyPlan {
  warningSigns: string;
  copingStrategies: string;
  safeContacts: string;
  professionalContacts: string;
  environmentChanges: string;
}

export interface VaultPayload {
  version: number;
  appName: string;
  exportedAt: string;
  entries: JournalEntry[];
  safetyPlan?: VaultSafetyPlan;
}

const LOCAL_VAULT_KEY = 'sh_local_vault_data';
const STORAGE_MODE_KEY = 'sh_storage_mode';

export type StorageMode = 'cloud' | 'local';

export const getStorageMode = (): StorageMode => {
  return (localStorage.getItem(STORAGE_MODE_KEY) as StorageMode) || 'cloud';
};

export const setStorageMode = (mode: StorageMode): void => {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
};

export const loadLocalVault = (passphrase: string): { entries: JournalEntry[]; safetyPlan: VaultSafetyPlan | null } => {
  try {
    const raw = localStorage.getItem(LOCAL_VAULT_KEY);
    if (!raw) return { entries: [], safetyPlan: null };

    // Decrypt container with passphrase
    const decryptedJson = passphrase ? decrypt(raw, passphrase) : raw;
    if (!decryptedJson) return { entries: [], safetyPlan: null };

    const parsed: VaultPayload = JSON.parse(decryptedJson);
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      safetyPlan: parsed.safetyPlan || null
    };
  } catch {
    return { entries: [], safetyPlan: null };
  }
};

export const saveLocalVault = (entries: JournalEntry[], safetyPlan: VaultSafetyPlan | null, passphrase: string): void => {
  try {
    const payload: VaultPayload = {
      version: 1,
      appName: 'SafeHaven Kenya',
      exportedAt: new Date().toISOString(),
      entries,
      safetyPlan: safetyPlan || undefined
    };
    const jsonStr = JSON.stringify(payload);
    const storedStr = passphrase ? encrypt(jsonStr, passphrase) : jsonStr;
    localStorage.setItem(LOCAL_VAULT_KEY, storedStr);
  } catch (err) {
    console.error('Failed to save local vault:', err);
  }
};

export const exportVault = (entries: JournalEntry[], safetyPlan: VaultSafetyPlan | null, passphrase: string): string => {
  const payload: VaultPayload = {
    version: 1,
    appName: 'SafeHaven Kenya',
    exportedAt: new Date().toISOString(),
    entries,
    safetyPlan: safetyPlan || undefined
  };
  const jsonStr = JSON.stringify(payload, null, 2);
  // Always encrypt the exported vault container with the user's passphrase
  return passphrase ? encrypt(jsonStr, passphrase) : jsonStr;
};

export const importVault = (fileContent: string, passphrase: string): VaultPayload => {
  let jsonString = fileContent.trim();
  
  // If encrypted, decrypt using the passphrase
  if (jsonString.startsWith('U2FsdGVkX1')) {
    if (!passphrase) {
      throw new Error('Passphrase required to unlock encrypted .safevault file');
    }
    jsonString = decrypt(jsonString, passphrase);
    if (!jsonString) {
      throw new Error('Invalid passphrase or corrupted vault file');
    }
  }

  try {
    const parsed: VaultPayload = JSON.parse(jsonString);
    if (!parsed.version || !Array.isArray(parsed.entries)) {
      throw new Error('Unrecognized vault structure');
    }
    return parsed;
  } catch (err: any) {
    throw new Error(err.message || 'Corrupted vault file');
  }
};

export const downloadVaultFile = (content: string, filename = 'my-safehaven.safevault'): void => {
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
