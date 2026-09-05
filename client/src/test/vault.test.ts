import { describe, it, expect, beforeEach } from 'vitest';
import { exportVault, importVault, loadLocalVault, saveLocalVault, VaultSafetyPlan } from '../lib/vault';
import { JournalEntry } from '../types';

describe('KeePassXC-Style Sovereign Vault (.safevault)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockEntries: JournalEntry[] = [
    {
      id: 'entry-1',
      date: '2026-09-05T12:00:00.000Z',
      mood: 4,
      energy: 3,
      sleep: 4,
      entry: 'Felt calm and hopeful after talking with a peer listener.',
      tags: ['peace', 'recovery'],
      isDraft: false
    }
  ];

  const mockSafetyPlan: VaultSafetyPlan = {
    warningSigns: 'Feeling overwhelmed, skipping meals',
    copingStrategies: '5-4-3-2-1 grounding, box breathing',
    safeContacts: 'Sister +254700000000',
    professionalContacts: '1199 Red Cross',
    environmentChanges: 'Leave room, walk outside'
  };

  const passphrase = 'secret-twelve-word-recovery-mnemonic-phrase';

  it('exports vault into an encrypted ciphertext starting with Salted__ header', () => {
    const exportedData = exportVault(mockEntries, mockSafetyPlan, passphrase);

    expect(typeof exportedData).toBe('string');
    // Salted__ in base64 is U2FsdGVkX1
    expect(exportedData.startsWith('U2FsdGVkX1')).toBe(true);
    expect(exportedData).not.toContain('Felt calm and hopeful');
  });

  it('imports and decrypts exported vault with correct passphrase', () => {
    const exportedData = exportVault(mockEntries, mockSafetyPlan, passphrase);
    const imported = importVault(exportedData, passphrase);

    expect(imported.appName).toBe('SafeHaven Kenya');
    expect(imported.version).toBe(1);
    expect(imported.entries.length).toBe(1);
    expect(imported.entries[0].entry).toBe('Felt calm and hopeful after talking with a peer listener.');
    expect(imported.safetyPlan?.copingStrategies).toBe('5-4-3-2-1 grounding, box breathing');
  });

  it('throws error when importing encrypted vault with wrong passphrase', () => {
    const exportedData = exportVault(mockEntries, mockSafetyPlan, passphrase);

    expect(() => {
      importVault(exportedData, 'wrong-passphrase');
    }).toThrow(/Invalid passphrase or corrupted vault file/i);
  });

  it('throws error when importing encrypted vault without passphrase', () => {
    const exportedData = exportVault(mockEntries, mockSafetyPlan, passphrase);

    expect(() => {
      importVault(exportedData, '');
    }).toThrow(/Passphrase required/i);
  });

  it('persists and loads local-first vault in browser storage', () => {
    saveLocalVault(mockEntries, mockSafetyPlan, passphrase);

    const loaded = loadLocalVault(passphrase);
    expect(loaded.entries.length).toBe(1);
    expect(loaded.entries[0].id).toBe('entry-1');
    expect(loaded.safetyPlan?.warningSigns).toBe('Feeling overwhelmed, skipping meals');
  });

  it('returns empty vault if local storage is empty or unparseable', () => {
    const empty = loadLocalVault(passphrase);
    expect(empty.entries).toEqual([]);
    expect(empty.safetyPlan).toBeNull();
  });
});
