import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../lib/storage';
import { AuthContext } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { ExternalLinkWarning } from '../components/ExternalLinkWarning';
import { Users, Calendar, Briefcase, ExternalLink, MapPin, Sun, MessageSquare, ShieldCheck, AlertTriangle } from 'lucide-react';

export const CommunityPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'groups' | 'events' | 'orgs'>('groups');
    const [poll, setPoll] = useState(StorageService.getPoll());
    const [hasVoted, setHasVoted] = useState(false);
    const [externalLink, setExternalLink] = useState<string | null>(null);
    
    const groups = StorageService.getCommunityGroups();
    const events = StorageService.getEvents();
    const orgs = StorageService.getOrganizations();
    const dailyQuote = StorageService.getQuotes()[0]; 

    const handleVote = (optionId: string) => {
        if (hasVoted) return;
        setPoll(StorageService.votePoll(optionId));
        setHasVoted(true);
    };

    const handleJoinGroup = (groupId: string) => {
        if (!user) { navigate('/auth'); return; }
        StorageService.joinGroupChat(groupId, user.id);
        navigate(`/chat?id=${groupId}`);
    };

    // Fix: Use setExternalLink directly
    const handleExternalLink = (url: string) => {
        setExternalLink(url);
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <ExternalLinkWarning isOpen={!!externalLink} onClose={() => setExternalLink(null)} url={externalLink || ''} />

            <div className="lg:col-span-2 space-y-8">
                <div><h1 className="text-3xl font-bold font-serif mb-2 dark:text-white">Community Hub</h1><p className="text-gray-500">Connect, share, and find your tribe.</p></div>
                
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1">
                    {[{ id: 'groups', label: 'Groups', icon: Users }, { id: 'events', label: 'Events', icon: Calendar }, { id: 'orgs', label: 'Orgs', icon: Briefcase }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {activeTab === 'groups' && groups.map(g => (
                        <Card key={g.id} className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <Badge color="blue">{g.category}</Badge>
                                <span className={`text-[10px] px-2 py-1 rounded font-bold border ${g.safetyRating === 'Verified Safe' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                                    {g.safetyRating === 'Verified Safe' ? <ShieldCheck className="w-3 h-3 inline mr-1"/> : <AlertTriangle className="w-3 h-3 inline mr-1"/>}
                                    {g.safetyRating}
                                </span>
                            </div>
                            <h3 className="font-bold text-xl mb-2 dark:text-white">{g.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-1">{g.description}</p>
                            
                            {g.platform === 'In-App' ? (
                                <button onClick={() => g.chatGroupId && handleJoinGroup(g.chatGroupId)} className="block w-full text-center py-2.5 rounded-xl border-2 border-primary-500 text-primary-600 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Enter Chat Room
                                </button>
                            ) : (
                                <button onClick={() => handleExternalLink(g.link)} className="block w-full text-center py-2.5 rounded-xl border-2 border-primary-500 text-primary-600 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                    Join External Group
                                </button>
                            )}
                        </Card>
                    ))}

                    {activeTab === 'events' && events.map(e => (
                        <Card key={e.id} className="flex flex-col overflow-hidden h-full hover:shadow-lg transition-shadow">
                            <div className="bg-primary-600 text-white p-4 text-center">
                                <span className="block text-3xl font-bold">{new Date(e.date).getDate()}</span>
                                <span className="uppercase text-sm tracking-widest opacity-80">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-xl mb-2 dark:text-white">{e.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4" /> {e.location}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-1">{e.description}</p>
                                <Button size="sm" variant="outline" className="w-full">Register Now</Button>
                            </div>
                        </Card>
                    ))}

                    {activeTab === 'orgs' && orgs.map((o: any) => (
                         <Card key={o.id} className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                             <h3 className="font-bold text-xl mb-2 flex items-center gap-2 dark:text-white">
                                 {o.name} <ExternalLink className="w-4 h-4 text-gray-400" />
                             </h3>
                             <Badge color="blue" className="self-start mb-4">{o.category}</Badge>
                             <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-1">{o.description}</p>
                             <button onClick={() => handleExternalLink(o.link)} className="text-primary-600 font-bold hover:underline text-sm mt-auto text-left">
                                 Visit Website
                             </button>
                         </Card>
                    ))}
                </div>
            </div>
            
            <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-3 text-orange-700 dark:text-orange-400">
                        <Sun className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Daily Wisdom</h3>
                    </div>
                    <p className="italic font-serif text-lg text-gray-800 dark:text-gray-200 mb-2">"{dailyQuote?.text}"</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">— {dailyQuote?.author}</p>
                </Card>
            </div>
        </div>
    );
};