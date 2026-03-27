import React, { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';
import { Volunteer } from '../types';
import { Card, Button } from '../components/ui';
import { WifiOff, Moon, TrendingUp } from 'lucide-react';

export const VolunteerDashboard = () => {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [isOnline, setIsOnline] = useState(false);
    const [bio, setBio] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        StorageService.getVolunteers().then(vols => {
            setVolunteers(vols);
            if (vols[0]) {
                setIsOnline(vols[0].isOnline);
                setBio(vols[0].bio);
            }
            setIsLoading(false);
        });
    }, []);

    const myProfile = volunteers[0];

    if (isLoading) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;
    if (!myProfile) return <div className="text-center py-20 text-gray-500">No volunteer profile found.</div>;

    const handleUpdate = () => {
        const updated = { ...myProfile, isOnline, bio };
        StorageService.updateVolunteer(updated);
        alert("Profile Updated!");
    };

    const handleStatusChange = async (status: boolean) => {
        setIsOnline(status);
        const updated = { ...myProfile, isOnline: status };
        StorageService.updateVolunteer(updated);
        setVolunteers(prev => prev.map(v => v.id === updated.id ? updated : v));
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
        </div>
    );
};