import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { journalApi, safetyApi, authApi } from '../lib/api';
import { JournalEntry, SafetyPlan } from '../types';
import { Button, Card, Input, Modal } from '../components/ui';
import { Trash2, Edit2, X, Lock, Shield, AlertTriangle, Cloud, Check, Mic, Square } from 'lucide-react';

export const SeekerDashboard = () => {
    const { user, passphrase, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [safetyPlan, setSafetyPlan] = useState<SafetyPlan>({
        id: '', userId: '', warningSigns: '', copingStrategies: '', safeContacts: '', professionalContacts: '', environmentChanges: ''
    });
    const [activeTab, setActiveTab] = useState<'journal' | 'safety'>('journal');
    
    // Journal State
    const [mood, setMood] = useState(3);
    const [entryText, setEntryText] = useState('');
    const [showJournalForm, setShowJournalForm] = useState(false);
    const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
    const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSavingRef = useRef(false); // Prevent concurrent saves

    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            const chunks: BlobPart[] = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => setAudioBase64(reader.result as string);
                stream.getTracks().forEach(t => t.stop());
            };
            recorder.start(1000); // 1-second timeslice for continuous recording — NO 28s cap
            setIsRecording(true);
            setRecordingDuration(0);
            // Start visual timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            alert('Microphone access denied or unavailable.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    };

    // Safety Plan State
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);

    // Nuke State
    const [showNukeModal, setShowNukeModal] = useState(false);
    const [nukeConfirmation, setNukeConfirmation] = useState('');
    const [challengeWord, setChallengeWord] = useState<string | null>(null);
    const [challengeIndex, setChallengeIndex] = useState<number | null>(null);
    const [wordInput, setWordInput] = useState('');

    useEffect(() => {
        if (!user || !passphrase) return;
        const loadData = async () => {
            try {
                const journalEntries = await journalApi.getAll();
                setEntries(journalEntries);
            } catch { setEntries([]); }
            try {
                const plan = await safetyApi.get();
                if (plan) setSafetyPlan(plan);
            } catch { /* no plan yet */ }
        };
        loadData();
    }, [user, passphrase]);

    // Autosave Logic — FIXED: uses ref to prevent concurrent saves + proper cleanup
    useEffect(() => {
        if (!showJournalForm || !entryText.trim() || !currentEntryId) return;
        setSaveStatus('unsaved');
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = setTimeout(async () => {
            if (isSavingRef.current) return; // Don't autosave while a manual save is in progress
            isSavingRef.current = true;
            setSaveStatus('saving');
            try {
                const newEntry: JournalEntry = {
                    id: currentEntryId,
                    date: new Date().toISOString(),
                    mood, energy: 3, sleep: 3,
                    entry: entryText,
                    tags: [],
                    isDraft: true,
                    audioData: audioBase64 || undefined
                };
                const updated = await journalApi.upsert(newEntry);
                // Reload entries
                const all = await journalApi.getAll();
                setEntries(all);
                setSaveStatus('saved');
            } catch { /* ignore */ }
            isSavingRef.current = false;
        }, 3000);
        return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
    }, [entryText, mood]);

    const handleOpenJournal = () => {
        setCurrentEntryId(Date.now().toString());
        setEntryText('');
        setMood(3);
        setAudioBlob(null);
        setAudioBase64(null);
        setShowJournalForm(true);
        setSaveStatus('saved');
    };

    const handleEditEntry = (entry: JournalEntry) => {
        setCurrentEntryId(entry.id);
        setEntryText(entry.entry);
        setMood(entry.mood);
        setAudioBase64(entry.audioData || null);
        setAudioBlob(null);
        setShowJournalForm(true);
        setSaveStatus('saved');
    };

    const handleSaveEntry = async (isDraft: boolean = false) => {
        if (!currentEntryId || isSavingRef.current) return;
        
        // CRITICAL: Cancel any pending autosave to prevent double-save
        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
            autosaveTimerRef.current = null;
        }
        
        isSavingRef.current = true;
        setSaveStatus('saving');
        
        const newEntry: JournalEntry = {
            id: currentEntryId,
            date: new Date().toISOString(),
            mood, energy: 3, sleep: 3,
            entry: entryText,
            tags: [],
            isDraft,
            audioData: audioBase64 || undefined
        };
        await journalApi.upsert(newEntry);
        const updated = await journalApi.getAll();
        setEntries(updated);
        
        isSavingRef.current = false;
        
        if (isDraft) {
            setSaveStatus('saved');
        } else {
            // Close form and reset
            setEntryText('');
            setAudioBlob(null);
            setAudioBase64(null);
            setShowJournalForm(false);
            setCurrentEntryId(null);
            setSaveStatus('saved');
        }
    };

    const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to permanently delete this entry?')) return;
        if (passphrase) {
            await journalApi.delete(id);
            const updated = await journalApi.getAll();
            setEntries(updated);
        }
    };

    const handleSavePlan = async () => {
        setIsSavingPlan(true);
        try {
            if (user) await safetyApi.save({
                warningSigns: safetyPlan.warningSigns,
                copingStrategies: safetyPlan.copingStrategies,
                safeContacts: safetyPlan.safeContacts,
                professionalContacts: safetyPlan.professionalContacts,
                environmentChanges: safetyPlan.environmentChanges
            });
        } catch { /* ignore */ }
        setIsSavingPlan(false);
        setIsEditingPlan(false);
    };

    const handleOpenNukeModal = () => {
        setShowNukeModal(true);
    };

    const handleNukeData = async () => {
        if (nukeConfirmation !== 'DELETE') return;
        if (user) {
            await authApi.nuke();
            logout();
            window.location.href = '/';
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-serif dark:text-white">Hello, {user?.username}</h1>
                    <p className="text-gray-500">Your safe space.</p>
                </div>
                <Button variant="danger" size="sm" onClick={handleOpenNukeModal} className="gap-2">
                    <Trash2 className="w-4 h-4" /> Nuke Data
                </Button>
            </div>

            <Modal isOpen={showNukeModal} onClose={() => setShowNukeModal(false)} title="Permanent Account Deletion">
                <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900 flex gap-3 text-red-800 dark:text-red-300 text-sm">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <div><p className="font-bold">Irreversible Action</p><p>This deletes your account, journal, and messages forever. Data cannot be recovered.</p></div>
                    </div>
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
                <button className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'journal' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('journal')}>Journal</button>
                <button className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'safety' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('safety')}>Safety Plan</button>
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
                                <button onClick={() => { setShowJournalForm(false); if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); }}><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="flex justify-between mb-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                {[1, 2, 3, 4, 5].map(m => (
                                    <button key={m} onClick={() => setMood(m)} className={`text-3xl transition-all transform hover:scale-125 ${mood === m ? 'scale-125' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}>{['😢', '😟', '😐', '🙂', '😊'][m-1]}</button>
                                ))}
                            </div>
                            <textarea className="w-full h-32 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent mb-4 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white resize-none" placeholder="Write your thoughts here..." value={entryText} onChange={(e) => setEntryText(e.target.value)} />
                            
                            {/* Audio Recording — FIXED: visual timer & proper chunked recording */}
                            <div className="flex gap-4 mb-4 items-center flex-wrap">
                                {!isRecording && !audioBlob && !audioBase64 && (
                                    <Button variant="outline" size="sm" onClick={startRecording} type="button">
                                        <Mic className="w-4 h-4 mr-2"/> Record Audio
                                    </Button>
                                )}
                                {isRecording && (
                                    <div className="flex items-center gap-3">
                                        <Button variant="danger" size="sm" onClick={stopRecording} type="button" className="animate-pulse">
                                            <Square className="w-4 h-4 mr-2"/> Stop
                                        </Button>
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-mono font-bold">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            REC {formatTime(recordingDuration)}
                                        </div>
                                    </div>
                                )}
                                {audioBlob && (
                                    <div className="flex items-center gap-2">
                                        <audio src={URL.createObjectURL(audioBlob)} controls className="h-10 outline-none" />
                                        <button onClick={() => { setAudioBlob(null); setAudioBase64(null); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                                    </div>
                                )}
                                {!audioBlob && audioBase64 && (
                                    <div className="flex items-center gap-2">
                                        <audio src={audioBase64} controls className="h-10 outline-none" />
                                        <button onClick={() => setAudioBase64(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                                    </div>
                                )}
                            </div>

                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400"><Lock className="w-3 h-3" /><span>End-to-End Encrypted</span></div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => handleSaveEntry(true)}>Save Draft</Button>
                                    <Button onClick={() => handleSaveEntry(false)}>Post Entry</Button>
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
                                    <button onClick={() => handleEditEntry(entry)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors">
                                        <Edit2 className="w-3 h-3"/> Edit
                                    </button>
                                    <button onClick={(e) => handleDeleteEntry(entry.id, e)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                                        <Trash2 className="w-3 h-3"/> Delete
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