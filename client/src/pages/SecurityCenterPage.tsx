import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, Button, Badge, Input } from '../components/ui';
import { Shield, Lock, Key, Smartphone, Trash2, Clock, UserCheck } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { authApi } from '../lib/api';

export const SecurityCenterPage = () => {
    const { user, logout } = useContext(AuthContext);
    const [inactivityEnabled, setInactivityEnabled] = useState(true);
    const [modReason, setModReason] = useState('');
    const [modSubmitting, setModSubmitting] = useState(false);
    const [modStatus, setModStatus] = useState<string | null>(null);

    useEffect(() => {
        // Load current inactivity setting from /auth/me extended
        authApi.me().then((u: any) => {
            if (u && u.inactivityEnabled !== undefined) setInactivityEnabled(u.inactivityEnabled);
        }).catch(() => {});
    }, []);

    const toggleInactivity = async () => {
        const next = !inactivityEnabled;
        setInactivityEnabled(next);
        try {
            await authApi.updateSettings({ inactivityEnabled: next });
        } catch {
            setInactivityEnabled(!next); // revert on failure
        }
    };

    const handleModApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setModSubmitting(true);
        setModStatus(null);
        try {
            await authApi.applyModerator(modReason);
            setModStatus('success');
            setModReason('');
        } catch (err: any) {
            setModStatus(err.message || 'Failed to submit');
        } finally {
            setModSubmitting(false);
        }
    };

    const handleNuke = async () => {
        if(confirm("PERMANENTLY DELETE ACCOUNT? This cannot be undone.")) {
            if(user) await StorageService.deleteAccount(user.id);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 dark:text-white"><Shield className="text-green-500 h-8 w-8" /> Security Center</h1>
            
            <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><Lock className="w-5 h-5"/> Encryption Status</h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900 text-green-800 dark:text-green-300">
                    <p className="font-bold flex items-center gap-2"><CheckIcon/> Zero-Knowledge Active</p>
                    <p className="text-sm mt-1">Your data is encrypted on this device (AES-256). We cannot read your journal or messages.</p>
                </div>
            </Card>

            {/* Inactivity Policy Toggle */}
            <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><Clock className="w-5 h-5"/> Inactivity Policy</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    When enabled, your account will be automatically suspended after 90 days of inactivity to protect your data. You can re-activate by logging in.
                </p>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                        <p className="font-bold dark:text-white">Auto-suspend after 90 days</p>
                        <p className="text-sm text-gray-500">Currently {inactivityEnabled ? 'enabled' : 'disabled'}</p>
                    </div>
                    <button
                        onClick={toggleInactivity}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${inactivityEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${inactivityEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><Key className="w-5 h-5"/> Recovery Credentials</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Your 12-word recovery phrase is the only way to restore your account if you forget your password.</p>
                <div className="flex gap-4">
                    <Button variant="outline">View Recovery Phrase</Button>
                    <Button variant="outline">Change Password</Button>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><Smartphone className="w-5 h-5"/> Active Sessions</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div><p className="font-bold dark:text-white">Current Device</p><p className="text-xs text-gray-500">Last active: Just now</p></div>
                        <Badge color="green">Active</Badge>
                    </div>
                    <Button variant="secondary" onClick={logout}>Log Out All Devices</Button>
                </div>
            </Card>

            {/* Moderator Application */}
            <Card className="p-6 border-blue-200 dark:border-blue-900">
                <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-500"/> Apply to be a Moderator</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Help keep SafeHaven safe. Community Moderators review flagged content, guide discussions, and support the community.</p>
                {modStatus === 'success' ? (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                        ✅ Application submitted! You'll be notified when an admin reviews it.
                    </div>
                ) : (
                    <form onSubmit={handleModApply} className="space-y-4">
                        <textarea
                            className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                            placeholder="Why would you like to be a moderator? (minimum 10 characters)"
                            value={modReason}
                            onChange={e => setModReason(e.target.value)}
                            required
                            minLength={10}
                        />
                        {modStatus && modStatus !== 'success' && (
                            <p className="text-red-500 text-sm">{modStatus}</p>
                        )}
                        <Button type="submit" isLoading={modSubmitting}>Submit Application</Button>
                    </form>
                )}
            </Card>

            <Card className="p-6 border-red-200 dark:border-red-900">
                <h3 className="text-xl font-bold mb-4 text-red-600 flex items-center gap-2"><Trash2 className="w-5 h-5"/> Danger Zone</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Permanently delete your account and all encrypted data. This action is irreversible.</p>
                <Button variant="danger" onClick={handleNuke}>Nuke Account (Kill Switch)</Button>
            </Card>
        </div>
    );
};

const CheckIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;