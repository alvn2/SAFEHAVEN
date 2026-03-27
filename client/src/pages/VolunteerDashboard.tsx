import React, { useState, useEffect } from 'react';
import { volunteerApi } from '../lib/api';
import { Card, Button } from '../components/ui';
import { WifiOff, Moon, TrendingUp, Award, UserCheck } from 'lucide-react';

export const VolunteerDashboard = () => {
    const [myProfile, setMyProfile] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        volunteerApi.getMe()
            .then(profile => {
                setMyProfile(profile);
                setIsOnline(profile.isOnline);
                setBio(profile.bio);
            })
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;
    if (!myProfile) return <div className="text-center py-20 text-gray-500">No volunteer profile found. Please contact support.</div>;

    const handleUpdate = () => {
        // TO-DO: wire up update endpoint
        alert("Profile update feature coming soon.");
    };

    const handleStatusChange = async (status: boolean) => {
        setIsOnline(status);
        // TO-DO: wire up status change endpoint
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-serif dark:text-white">Volunteer Dashboard</h1>
            
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 md:col-span-2">
                     <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold dark:text-white">Availability Status</h2>
                        <div className={`px-4 py-1 rounded-full text-sm font-bold ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                        <button 
                            onClick={() => handleStatusChange(true)}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${isOnline ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 opacity-50 dark:text-gray-400'}`}
                        >
                            <WifiOff className="w-6 h-6 rotate-45" /> 
                            <span className="font-bold">Go Online</span>
                        </button>
                        <button 
                            onClick={() => handleStatusChange(false)}
                            className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${!isOnline ? 'border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200' : 'border-gray-200 dark:border-gray-700 opacity-50 dark:text-gray-400'}`}
                        >
                            <Moon className="w-6 h-6" /> 
                            <span className="font-bold">Go Offline</span>
                        </button>
                    </div>

                    <h3 className="font-bold mb-2 dark:text-white">My Bio</h3>
                    <textarea 
                        className="w-full p-4 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-700 h-32 mb-4" 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                    <Button onClick={handleUpdate}>Save Changes</Button>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-gray-500 font-medium mb-2">Total Impact</h3>
                        <div className="text-4xl font-bold mb-1 dark:text-white">{myProfile.impact?.chats ?? 0}</div>
                        <div className="text-sm text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> People supported</div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-gray-500 font-medium mb-2">Profile Views</h3>
                        <div className="text-4xl font-bold mb-1 dark:text-white">{myProfile.impact?.views ?? 0}</div>
                    </Card>
                </div>
            </div>

            {myProfile.track === 'PROFESSIONAL' && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2"><Award className="text-primary-500" /> Professional Credentials</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="font-bold text-blue-900 dark:text-blue-100">License Verification</p>
                            <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">{myProfile.verified ? 'Verified & Active' : 'Pending Review'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <p className="font-bold text-gray-900 dark:text-gray-100">Specialty</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{myProfile.qualification}</p>
                        </div>
                    </div>
                </Card>
            )}

            {myProfile.track === 'PEER_LISTENER' && (
                <Card className="p-6">
                    <h2 className="text-xl font-bold dark:text-white mb-4 flex items-center gap-2"><UserCheck className="text-primary-500" /> Peer Support Guidelines</h2>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-2 list-disc ml-5">
                        <li>Always listen actively and without judgment.</li>
                        <li>Do not offer medical or professional advice.</li>
                        <li>If a user is in immediate crisis, guide them to the Emergency Resources.</li>
                    </ul>
                </Card>
            )}
        </div>
    );
};