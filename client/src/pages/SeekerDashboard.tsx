import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { journalApi, safetyApi, authApi } from '../lib/api';
import { JournalEntry, SafetyPlan } from '../types';
import { Button, Card, Input, Modal } from '../components/ui';
import { Trash2, Edit2, X, Lock, Shield, AlertTriangle, Cloud, Check, KeyRound, HardDrive, Download, Upload } from 'lucide-react';
import { encrypt, decrypt } from '../lib/encryption';
import {
    getStorageMode,
    setStorageMode,
    StorageMode,
    loadLocalVault,
    saveLocalVault,
    exportVault,
    importVault,
    downloadVaultFile
} from '../lib/vault';

export const SeekerDashboard = () => {
    const { user, passphrase, setPassphrase, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
        id: '', userId: '', warningSigns: '', copingStrategies: '', safeContacts: '', professionalContacts: '', environmentChanges: ''
    });
    const [activeTab, setActiveTab] = useState<'journal' | 'safety'>('journal');
    const [storageMode, setStorageModeState] = useState<StorageMode>(getStorageMode());
    const vaultFileInputRef = useRef<HTMLInputElement>(null);

    const [mood, setMood] = useState(3);
    const [entryText, setEntryText] = useState('');
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSavingRef = useRef(false);

    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);

    const [showNukeModal, setShowNukeModal] = useState(false);
    const [nukeConfirmation, setNukeConfirmation] = useState('');
    const [challengeWord, setChallengeWord] = useState<string | null>(null);
    const [challengeIndex, setChallengeIndex] = useState<number | null>(null);
    const [wordInput, setWordInput] = useState('');

    const handleToggleStorageMode = (mode: StorageMode) => {
        setStorageMode(mode);
        setStorageModeState(mode);
    };

    const loadData = async () => {
        if (!user) return;
        // Resolve passphrase: use context value or fall back to sessionStorage.
        // This prevents a race condition where the component mounts before
        // AuthContext has finished calling setPassphrase() from the saved sh_key.
        const effectivePassphrase = passphrase || sessionStorage.getItem('sh_key') || '';

        if (storageMode === 'local') {
            const localData = loadLocalVault(effectivePassphrase);
            setEntries(localData.entries);
            if (localData.safetyPlan) {
                setSafetyPlan({
                    id: 'local-plan',
                    userId: user.id,
                    ...localData.safetyPlan
                });
            }
            return;
        }

        // Cloud mode: fetch from API with local cache fallback
        try {
            const journalEntries = await journalApi.getAll();
            const decryptedEntries = journalEntries.map((e: JournalEntry) => ({
                ...e,
                entry: effectivePassphrase ? decrypt(e.entry, effectivePassphrase) : e.entry,
                audioData: (e.audioData && effectivePassphrase) ? (decrypt(e.audioData, effectivePassphrase) || e.audioData) : e.audioData
            }));
            setEntries(decryptedEntries);
            saveLocalVault(decryptedEntries, safetyPlan, effectivePassphrase);
        } catch {
            const localData = loadLocalVault(effectivePassphrase);
            setEntries(localData.entries);
        }
        try {
            const plan = await safetyApi.get();
            if (plan) {
                const decryptedPlan = {
                    ...plan,
                    warningSigns: effectivePassphrase ? decrypt(plan.warningSigns, effectivePassphrase) : plan.warningSigns,
                    copingStrategies: effectivePassphrase ? decrypt(plan.copingStrategies, effectivePassphrase) : plan.copingStrategies,
                    safeContacts: effectivePassphrase ? decrypt(plan.safeContacts, effectivePassphrase) : plan.safeContacts,
                    professionalContacts: effectivePassphrase ? decrypt(plan.professionalContacts, effectivePassphrase) : plan.professionalContacts,
                    environmentChanges: effectivePassphrase ? decrypt(plan.environmentChanges, effectivePassphrase) : plan.environmentChanges,
                };
                setSafetyPlan(decryptedPlan);
                saveLocalVault(entries, decryptedPlan, effectivePassphrase);
            }
        } catch { /* no plan yet */ }
    };

    useEffect(() => {
        loadData();
    }, [user, passphrase, storageMode]);

    // Autosave Logic — handles both local vault and cloud sync
    useEffect(() => {
        if (!showJournalForm || !entryText.trim() || !currentEntryId) return;
        setSaveStatus('unsaved');
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(async () => {
            if (isSavingRef.current) return;
            isSavingRef.current = true;
            setSaveStatus('saving');
            try {
                const existingIndex = entries.findIndex(e => e.id === currentEntryId);
                const existingEntry = existingIndex >= 0 ? entries[existingIndex] : undefined;
                const newEntry: JournalEntry = {
                    id: currentEntryId,
                    date: new Date().toISOString(),
                    mood, energy: 3, sleep: 3,
                    entry: entryText,
                    tags: [],
                    isDraft: true,
                    audioData: existingEntry?.audioData
                };

                const updatedEntries = existingIndex >= 0 
                    ? entries.map(e => e.id === currentEntryId ? newEntry : e)
                    : [newEntry, ...entries];
                const effectivePassphrase = passphrase || sessionStorage.getItem('sh_key') || '';
                setEntries(updatedEntries);
                saveLocalVault(updatedEntries, safetyPlan, effectivePassphrase);

                if (storageMode === 'cloud' && effectivePassphrase) {
                    const encryptedText = encrypt(entryText, effectivePassphrase);
                    const encryptedAudio = newEntry.audioData ? encrypt(newEntry.audioData, effectivePassphrase) : undefined;
                    await journalApi.upsert({
                        ...newEntry,
                        entry: encryptedText,
                        audioData: encryptedAudio
                    });
                }
                setSaveStatus('saved');
            } catch { /* ignore */ }
            isSavingRef.current = false;
        }, 3000);
        return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
    }, [entryText, mood, passphrase, storageMode, entries, safetyPlan]);

    const handleOpenJournal = () => {
        // Use crypto.randomUUID() for a proper RFC-4122 UUID so it doesn't
        // collide with Prisma CUIDs in the backend. Fallback for older browsers.
        const newId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setCurrentEntryId(newId);
        setEntryText('');
        setMood(3);
        setShowJournalForm(true);
        setSaveStatus('saved');
    };

    const handleEditEntry = (entry: JournalEntry) => {
        setCurrentEntryId(entry.id);
        setEntryText(entry.entry);
        setMood(entry.mood);
        setShowJournalForm(true);
        setSaveStatus('saved');
    };

    const handleSaveEntry = async (isDraft: boolean = false) => {
        if (!currentEntryId || isSavingRef.current) return;
        
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
            autosaveTimerRef.current = null;
        }
        
        isSavingRef.current = true;
        setSaveStatus('saving');
        
        const existingIndex = entries.findIndex(e => e.id === currentEntryId);
        const existingEntry = existingIndex >= 0 ? entries[existingIndex] : undefined;
        const newEntry: JournalEntry = {
            id: currentEntryId,
            date: new Date().toISOString(),
            mood, energy: 3, sleep: 3,
            entry: entryText,
            tags: [],
            isDraft,
            audioData: existingEntry?.audioData
        };

        const updatedEntries = existingIndex >= 0
            ? entries.map(e => e.id === currentEntryId ? newEntry : e)
            : [newEntry, ...entries];
        const effectiveSavePassphrase = passphrase || sessionStorage.getItem('sh_key') || '';
        setEntries(updatedEntries);
        saveLocalVault(updatedEntries, safetyPlan, effectiveSavePassphrase);

        if (storageMode === 'cloud') {
            const effectivePassphrase = passphrase || sessionStorage.getItem('sh_key') || '';
            if (!effectivePassphrase) {
                alert('Zero-Knowledge Security Notice: A vault passphrase is required to encrypt your reflections before cloud sync. To ensure your private thoughts are never transmitted in plaintext, this entry has been saved strictly in your offline Device Vault.');
                setStorageMode('local');
                setStorageModeState('local');
            } else {
                try {
                    const encryptedText = encrypt(entryText, effectivePassphrase);
                    const encryptedAudio = newEntry.audioData ? encrypt(newEntry.audioData, effectivePassphrase) : undefined;
                    const saved = await journalApi.upsert({
                        ...newEntry,
                        entry: encryptedText,
                        audioData: encryptedAudio
                    });
                    // Sync back the server-assigned ID if it changed (e.g. server converted UUID to CUID)
                    if (saved && saved.id && saved.id !== currentEntryId) {
                        setCurrentEntryId(saved.id);
                        const syncedEntries = updatedEntries.map(e =>
                            e.id === currentEntryId ? { ...e, id: saved.id } : e
                        );
                        setEntries(syncedEntries);
                        saveLocalVault(syncedEntries, safetyPlan, effectivePassphrase);
                    }
                } catch (err) {
                    console.error('Cloud sync failed, entry saved locally:', err);
                }
            }
        }
        
        isSavingRef.current = false;
        
        if (isDraft) {
            setSaveStatus('saved');
        } else {
            setEntryText('');
            setShowJournalForm(false);
            setCurrentEntryId(null);
            setSaveStatus('saved');
        }
    };

    const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to permanently delete this entry?')) return;
        const updated = entries.filter(item => item.id !== id);
        setEntries(updated);
        saveLocalVault(updated, safetyPlan, passphrase);
        if (storageMode === 'cloud') {
            try {
                await journalApi.delete(id);
            } catch { /* ignore */ }
        }
    };

    const handleSavePlan = async () => {
        setIsSavingPlan(true);
        try {
            saveLocalVault(entries, safetyPlan, passphrase);
            if (storageMode === 'cloud' && user) {
                if (!passphrase) {
                    alert('Zero-Knowledge Security Notice: A vault passphrase is required to encrypt your safety plan before cloud sync. Your plan has been saved strictly to your offline Device Vault.');
                    setStorageMode('local');
                    setStorageModeState('local');
                } else {
                    await safetyApi.save({
                        warningSigns: encrypt(safetyPlan.warningSigns, passphrase),
                        copingStrategies: encrypt(safetyPlan.copingStrategies, passphrase),
                        safeContacts: encrypt(safetyPlan.safeContacts, passphrase),
                        professionalContacts: encrypt(safetyPlan.professionalContacts, passphrase),
                        environmentChanges: encrypt(safetyPlan.environmentChanges, passphrase)
                    });
                }
            }
        } catch { /* ignore */ }
        setIsSavingPlan(false);
        setIsEditingPlan(false);
    };

    const handleExportVault = () => {
        try {
            const encryptedVault = exportVault(entries, safetyPlan, passphrase);
            const dateStr = new Date().toISOString().slice(0, 10);
            downloadVaultFile(encryptedVault, `safehaven-vault-${dateStr}.safevault`);
        } catch (err: any) {
            alert('Failed to export vault: ' + (err.message || 'Unknown error'));
        }
    };

    const handleImportVault = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result as string;
                const payload = importVault(content, passphrase);
                setEntries(payload.entries);
                if (payload.safetyPlan) {
                    setSafetyPlan({
                        id: safetyPlan.id || 'local-plan',
                        userId: user?.id || 'local-user',
                        ...payload.safetyPlan
                    });
                }
                saveLocalVault(payload.entries, payload.safetyPlan || null, passphrase);
                if (storageMode === 'cloud') {
                    if (!passphrase) {
                        alert('Zero-Knowledge Security Notice: A vault passphrase is required to encrypt reflections before cloud sync. The imported reflections remain safely stored in your offline Device Vault.');
                    } else {
                        for (const entry of payload.entries) {
                            const encryptedText = encrypt(entry.entry, passphrase);
                            const encryptedAudio = entry.audioData ? encrypt(entry.audioData, passphrase) : undefined;
                            await journalApi.upsert({
                                id: entry.id,
                                date: entry.date,
                                mood: entry.mood,
                                energy: entry.energy,
                                sleep: entry.sleep,
                                entry: encryptedText,
                                audioData: encryptedAudio,
                                tags: entry.tags || [],
                                isDraft: entry.isDraft
                            });
                        }
                    }
                }
                alert(`Successfully imported ${payload.entries.length} reflections from vault!`);
            } catch (err: any) {
                alert('Import failed: ' + (err.message || 'Could not decrypt vault file.'));
            }
            if (vaultFileInputRef.current) vaultFileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const handleOpenNukeModal = () => {
        setShowNukeModal(true);
    };

    const handleNukeData = async () => {
        if (nukeConfirmation !== 'DELETE') return;
        if (user) {
            try {
                await authApi.nuke();
            } catch (err) {
                console.error("Server nuke failed", err);
            }
            // Irrevocably clear all local, cached, and session storage
            localStorage.clear();
            sessionStorage.clear();
            logout();
            window.location.replace('/');
        }
    };


    return (
        <div className="space-y-8">
            {user?.role === 'VOLUNTEER_PENDING' && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-900 dark:text-amber-300">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Volunteer Application Under Review</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400">Our team is reviewing your credentials. You will be notified once approved.</p>
                        </div>
                    </div>
                </div>
            )}
            {user?.role === 'VOLUNTEER_APPROVED' && (
                <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 rounded-2xl p-4 flex items-center justify-between gap-4 text-primary-900 dark:text-primary-300">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/60 flex items-center justify-center shrink-0">
                            <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">You are a Verified SafeHaven Volunteer!</p>
                            <p className="text-xs text-primary-700 dark:text-primary-400">Manage your chats, active status, and listener profile in the volunteer dashboard.</p>
                        </div>
                    </div>
                    <Button size="sm" onClick={() => navigate('/volunteer/dashboard')}>
                        Volunteer Portal →
                    </Button>
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif dark:text-white">Hello, {user?.username}</h1>
                    <p className="text-gray-500 text-sm">Your private sanctuary.</p>
                </div>
                             <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                    {/* KeePassXC Hybrid Storage Mode Toggle */}
                    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => handleToggleStorageMode('local')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${storageMode === 'local' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                            title="KeePassXC style: Data stays 100% on your device, 0 bytes sent to server"
                        >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Device Vault</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggleStorageMode('cloud')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px] ${storageMode === 'cloud' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                            title="Encrypted text sync with zero-knowledge server"
                        >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>Cloud Sync</span>
                        </button>
                    </div>

                    {/* Vault Backup & Restore Buttons */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportVault} className="flex-1 sm:flex-initial gap-1.5 text-xs min-h-[40px] sm:min-h-[36px]">
                            <Download className="w-3.5 h-3.5" /> Export
                        </Button>

                        <input
                            type="file"
                            ref={vaultFileInputRef}
                            accept=".safevault,.json"
                            onChange={handleImportVault}
                            className="hidden"
                        />
                        <Button variant="outline" size="sm" onClick={() => vaultFileInputRef.current?.click()} className="flex-1 sm:flex-initial gap-1.5 text-xs min-h-[40px] sm:min-h-[36px]">
                            <Upload className="w-3.5 h-3.5" /> Import
                        </Button>

                        <Button variant="danger" size="sm" onClick={handleOpenNukeModal} className="flex-1 sm:flex-initial gap-1.5 text-xs min-h-[40px] sm:min-h-[36px]">
                            <Trash2 className="w-3.5 h-3.5" /> Nuke
                        </Button>
                    </div>
                </div>
            </div>

            {!passphrase && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-3">
                        <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <p className="text-sm">Enter your passphrase to unlock and decrypt your private journal entries.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <input
                            type="password"
                            placeholder="Account passphrase"
                            className="px-3 py-2 text-base sm:text-sm rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 flex-1 sm:w-48 min-h-[44px] sm:min-h-[38px]"
                            id="unlock-passphrase-input"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) {
                                        setPassphrase(val);
                                        sessionStorage.setItem('sh_key', val);
                                    }
                                }
                            }}
                        />
                        <Button size="sm" className="min-h-[44px] sm:min-h-[38px]" onClick={() => {
                            const el = document.getElementById('unlock-passphrase-input') as HTMLInputElement;
                            if (el?.value) {
                                setPassphrase(el.value);
                                sessionStorage.setItem('sh_key', el.value);
                            }
                        }}>Unlock</Button>
                    </div>
                </div>
            )}

            <Modal isOpen={showNukeModal} onClose={() => setShowNukeModal(false)} title="Permanent Account Deletion">
                <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900 flex gap-3 text-red-800 dark:text-red-300 text-sm">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div><p className="font-bold">Irreversible Action</p><p>This deletes your account, journal, and messages forever. Data cannot be recovered.</p></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        To confirm this permanent action, you must verify your identity.
                    </p>
                    <div className="space-y-4">
                        {challengeWord && (
                            <div>
                                <label className="block text-sm font-semibold mb-2 dark:text-gray-200">Security Check: Enter Word #{challengeIndex}</label>
                                <Input value={wordInput} onChange={(e) => setWordInput(e.target.value)} placeholder={`e.g. ${challengeWord.substring(0,2)}...`} className="font-mono" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-red-600">Type "DELETE" to confirm</label>
                            <Input value={nukeConfirmation} onChange={(e) => setNukeConfirmation(e.target.value)} placeholder="DELETE" className="uppercase border-red-300 focus:ring-red-500" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowNukeModal(false)} className="flex-1">Cancel</Button>
                        <Button variant="danger" onClick={handleNukeData} disabled={nukeConfirmation !== 'DELETE' || (!!challengeWord && !wordInput)} className="flex-1">Delete Forever</Button>
                    </div>
                </div>
            </Modal>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
                <button className={`px-4 py-2 font-medium border-b-2 transition-colors min-h-[44px] ${activeTab === 'journal' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('journal')}>Journal</button>
                <button className={`px-4 py-2 font-medium border-b-2 transition-colors min-h-[44px] ${activeTab === 'safety' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('safety')}>Safety Plan</button>
            </div>

            {activeTab === 'journal' && (
                <>
                    {!showJournalForm ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-md transition-all group" onClick={handleOpenJournal}>
                            <div className="flex items-center gap-4 text-gray-500 group-hover:text-primary-600 transition-colors">
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20"><Edit2 className="w-6 h-6" /></div>
                                <span className="text-lg font-medium">How are you feeling right now?</span>
                            </div>
                        </div>
                    ) : (
                        <Card className="p-6 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
                                    {currentEntryId && entries.some(e => e.id === currentEntryId) ? 'Edit Entry' : 'New Entry'}
                                    {saveStatus === 'saving' && <span className="text-xs text-gray-400 font-normal flex items-center gap-1"><Cloud className="w-3 h-3 animate-pulse" /> Saving...</span>}
                                    {saveStatus === 'saved' && entryText.trim() && <span className="text-xs text-green-500 font-normal flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                                </h3>
                                <button onClick={() => { setShowJournalForm(false); if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); }} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="flex justify-between mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                {[1, 2, 3, 4, 5].map(m => (
                                    <button key={m} onClick={() => setMood(m)} className={`text-3xl transition-all transform hover:scale-125 min-h-[44px] min-w-[44px] flex items-center justify-center ${mood === m ? 'scale-125' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}>{['😢', '😟', '😐', '🙂', '😊'][m-1]}</button>
                                ))}
                            </div>
                            <textarea className="w-full h-32 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent mb-4 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white resize-none text-base sm:text-sm" placeholder="Write your thoughts here..." value={entryText} onChange={(e) => setEntryText(e.target.value)} />
                            
                            {/* Privacy & Zero-Knowledge Vault Indicator */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>
                                        {storageMode === 'local' 
                                            ? 'Device Vault Active: Reflections stay strictly on your phone/browser (0 bytes sent to server).'
                                            : 'Cloud Sync Active: Reflections are encrypted with AES-256 before transit.'}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold whitespace-nowrap self-start sm:self-auto">
                                    {storageMode === 'local' ? 'OFFLINE SECURE' : 'AES-256 SYNC'}
                                </span>
                            </div>

                             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"><Lock className="w-3.5 h-3.5 shrink-0" /><span>End-to-End Encrypted</span></div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button variant="secondary" className="flex-1 sm:flex-initial" onClick={() => handleSaveEntry(true)}>Save Draft</Button>
                                    <Button className="flex-1 sm:flex-initial" onClick={() => handleSaveEntry(false)}>Post Entry</Button>
                                </div>
                            </div>
                        </Card>
                    )}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-500 uppercase text-sm tracking-wider">Past Entries</h3>
                        {entries.length === 0 && <p className="text-gray-400 italic">No entries yet.</p>}
                        {entries.map(entry => (
                            <Card key={entry.id} className="p-5 relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2"><span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>{entry.isDraft && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Draft</span>}</div>
                                    <span className="text-xl">{['😢', '😟', '😐', '🙂', '😊'][entry.mood-1]}</span>
                                </div>
                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{entry.entry}</p>
                                {entry.audioData && (
                                    <div className="mt-4">
                                        <audio src={entry.audioData} controls className="h-10 w-full max-w-sm outline-none" />
                                    </div>
                                )}
                                {/* Edit + Delete buttons — always visible, not just on hover */}
                                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button onClick={() => handleEditEntry(entry)} className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                                        <Edit2 className="w-3.5 h-3.5"/> Edit
                                    </button>
                                    <button onClick={(e) => handleDeleteEntry(entry.id, e)} className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5"/> Delete
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'safety' && (
                <Card className="p-6 border-l-4 border-l-red-500">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3"><Shield className="w-8 h-8 text-red-500" /><h2 className="text-2xl font-bold dark:text-white">My Safety Plan</h2></div>
                        <Button variant="outline" size="sm" onClick={() => isEditingPlan ? handleSavePlan() : setIsEditingPlan(true)} isLoading={isSavingPlan}>{isEditingPlan ? 'Save Plan' : 'Edit Plan'}</Button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: 'Warning Signs', field: 'warningSigns', help: 'Thoughts or situations that indicate a crisis.' },
                            { label: 'Internal Coping Strategies', field: 'copingStrategies', help: 'Things I can do to distract myself.' },
                            { label: 'People I can ask for help', field: 'safeContacts', help: 'Friends or family I trust.' }
                        ].map((item: any) => (
                            <div className="grid gap-2" key={item.field}>
                                <label className="font-bold text-gray-700 dark:text-gray-300">{item.label}</label>
                                <p className="text-sm text-gray-500">{item.help}</p>
                                {isEditingPlan ? (
                                    <textarea className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700" rows={3} value={(safetyPlan as any)[item.field]} onChange={e => setSafetyPlan({...safetyPlan, [item.field]: e.target.value})} />
                                ) : (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl min-h-[3rem] dark:text-white whitespace-pre-wrap">{(safetyPlan as any)[item.field] || "Not set"}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};