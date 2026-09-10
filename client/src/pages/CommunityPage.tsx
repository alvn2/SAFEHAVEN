import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityApi } from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { COMMUNITY_GROUPS, ORGANIZATIONS } from '../utils/constants';
import { Card, Badge, Button } from '../components/ui';
import { ExternalLinkWarning } from '../components/ExternalLinkWarning';
import { SubmitUGCModal } from '../components/SubmitUGCModal';
import { Users, Calendar, Briefcase, ExternalLink, MapPin, Sun, MessageSquare, ShieldCheck, AlertTriangle, PlusCircle } from 'lucide-react';

export const CommunityPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'groups' | 'events' | 'orgs'>('groups');
    const [poll, setPoll] = useState<any>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [externalLink, setExternalLink] = useState<string | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    
    const [groups, setGroups] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [orgs, setOrgs] = useState<any[]>([]);
    const [dailyQuote, setDailyQuote] = useState<any>(null);

    useEffect(() => {
        communityApi.getGroups().then(data => {
            setGroups(data && data.length > 0 ? data : COMMUNITY_GROUPS);
        }).catch(() => setGroups(COMMUNITY_GROUPS));

        communityApi.getEvents().then(data => {
            setEvents(data && data.length > 0 ? data : []);
        }).catch(() => setEvents([]));

        communityApi.getOrganizations().then(data => {
            setOrgs(data && data.length > 0 ? data : ORGANIZATIONS);
        }).catch(() => setOrgs(ORGANIZATIONS));

        communityApi.getQuotes().then(q => {
            if (q && q.length > 0) {
                const dayIndex = Math.floor(Date.now() / 86400000) % q.length;
                setDailyQuote(q[dayIndex]);
            }
        }).catch(() => {});
    }, []);

    const handleJoinGroup = (groupId: string) => {
        if (!user) { navigate('/auth'); return; }
        navigate(`/chat?id=${groupId}`);
    };

    const handleExternalLink = (url: string) => {
        setExternalLink(url);
    };

    const handleOpenSubmit = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
        setShowSubmitModal(true);
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <ExternalLinkWarning isOpen={!!externalLink} onClose={() => setExternalLink(null)} url={externalLink || ''} />
            <SubmitUGCModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} />

            <div className="lg:col-span-2 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif mb-2 dark:text-white">Community Hub</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Anonymous peer support circles and local mental health organizations in Kenya.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleOpenSubmit} className="flex items-center justify-center gap-1.5 w-full sm:w-auto min-h-[44px]">
                        <PlusCircle className="w-4 h-4" /> Propose Content
                    </Button>
                </div>
                
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                    {[{ id: 'groups', label: 'Support Circles', icon: Users }, { id: 'orgs', label: 'Organizations', icon: Briefcase }, { id: 'events', label: 'Workshops & Events', icon: Calendar }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 sm:px-6 py-3 font-medium border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap min-h-[44px] shrink-0 text-sm sm:text-base ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500'}`}>
                            <tab.icon className="w-4 h-4" /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {activeTab === 'groups' && (groups.length === 0 ? (
                        <div className="col-span-2 text-center py-16 px-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/60">
                            <Users className="w-12 h-12 text-primary-500 mx-auto mb-3 opacity-80" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Peer Circles Active Yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 leading-relaxed">SafeHaven peer circles are anonymous, community-moderated spaces for shared healing. You can propose a new topic circle.</p>
                            <Button onClick={handleOpenSubmit} size="sm" variant="primary" className="min-h-[44px]">Propose a Peer Circle</Button>
                        </div>
                    ) : groups.map(g => (
                        <Card key={g.id} className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex gap-2 items-center flex-wrap">
                                    <Badge color="blue">{g.category}</Badge>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${g.platform === 'In-App' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'}`}>
                                        {g.platform === 'In-App' ? 'In-App Encrypted Chat' : `External (${g.platform || 'Link'})`}
                                    </span>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded font-bold border ${g.safetyRating === 'Verified Safe' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                                    {g.safetyRating === 'Verified Safe' ? <ShieldCheck className="w-3 h-3 inline mr-1"/> : <AlertTriangle className="w-3 h-3 inline mr-1"/>}
                                    {g.safetyRating}
                                </span>
                            </div>
                            <h3 className="font-bold text-xl mb-2 dark:text-white">{g.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-1">{g.description}</p>
                            
                            {g.platform === 'In-App' ? (
                                <button onClick={() => handleJoinGroup(g.chatGroupId || g.id)} className="block w-full text-center py-2.5 rounded-xl border-2 border-primary-500 text-primary-600 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]">
                                    <MessageSquare className="w-4 h-4" /> Enter Chat Room
                                </button>
                            ) : (
                                <button onClick={() => handleExternalLink(g.link)} className="block w-full text-center py-2.5 rounded-xl border-2 border-primary-500 text-primary-600 font-bold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px]">
                                    <ExternalLink className="w-4 h-4" /> Join External Group
                                </button>
                            )}
                        </Card>
                    )))}

                    {activeTab === 'events' && (events.length === 0 ? (
                        <div className="col-span-2 text-center py-16 px-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/60">
                            <Calendar className="w-12 h-12 text-primary-500 mx-auto mb-3 opacity-80" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Scheduled Events Currently</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 leading-relaxed">Upcoming workshops, wellness sessions, and community listening hours will appear here. Community organizers can submit event listings for review.</p>
                            <Button onClick={handleOpenSubmit} size="sm" variant="primary" className="min-h-[44px]">Submit an Event Proposal</Button>
                        </div>
                    ) : events.map(e => (
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
                                <Button size="sm" variant="outline" className="w-full min-h-[44px]">Register Interest</Button>
                            </div>
                        </Card>
                    )))}

                    {activeTab === 'orgs' && (orgs.length === 0 ? (
                        <div className="col-span-2 text-center py-16 px-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/60">
                            <Briefcase className="w-12 h-12 text-primary-500 mx-auto mb-3 opacity-80" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Organizations Listed</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 leading-relaxed">Verified mental health NGOs and clinics across Kenya are vetted before listing.</p>
                            <Button onClick={handleOpenSubmit} size="sm" variant="primary" className="min-h-[44px]">Submit Organization</Button>
                        </div>
                    ) : orgs.map((o: any) => (
                         <Card key={o.id} className="p-6 h-full flex flex-col hover:shadow-lg transition-shadow">
                             <h3 className="font-bold text-xl mb-2 flex items-center justify-between dark:text-white">
                                 <span>{o.name}</span>
                                 <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                             </h3>
                             <Badge color="blue" className="self-start mb-4">{o.category}</Badge>
                             <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 flex-1">{o.description}</p>
                             <button onClick={() => handleExternalLink(o.link)} className="text-primary-600 font-bold hover:underline text-sm mt-auto text-left flex items-center gap-1.5 min-h-[44px]">
                                 <span>Visit Official Website</span>
                                 <ExternalLink className="w-3.5 h-3.5 inline" />
                             </button>
                         </Card>
                    )))}
                </div>
            </div>
            
            <div className="space-y-6">
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-3 text-orange-700 dark:text-orange-400">
                        <Sun className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Daily Wisdom</h3>
                    </div>
                    {dailyQuote ? (
                        <>
                            <p className="italic font-serif text-lg text-gray-800 dark:text-gray-200 mb-2">"{dailyQuote.text}"</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">— {dailyQuote.author || 'Anonymous'}</p>
                        </>
                    ) : (
                        <>
                            <p className="italic font-serif text-lg text-gray-800 dark:text-gray-200 mb-2">"Haba na haba, hujaza kibaba. (Little by little, the measure is filled. Healing takes time.)"</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">— Swahili Proverb</p>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
};