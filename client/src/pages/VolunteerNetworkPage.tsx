import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { volunteerApi } from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { Volunteer } from '../types';
import { VolunteerCard } from '../components/VolunteerCard';
import { ExternalLinkWarning } from '../components/ExternalLinkWarning';
import { TOPICS } from '../utils/constants';
import { Search, Handshake } from 'lucide-react';

export const VolunteerNetworkPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [filterTopic, setFilterTopic] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterLang, setFilterLang] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [externalLink, setExternalLink] = useState<string | null>(null);

    useEffect(() => {
        volunteerApi.getAll().then(data => {
            // Map API response to Volunteer type (impact is nested differently)
            const mapped = data.map((v: any) => ({
                ...v,
                impact: { views: v.views ?? v.impact?.views ?? 0, chats: v.chats ?? v.impact?.chats ?? 0 }
            }));
            setVolunteers(mapped);
        }).catch(() => setVolunteers([]));
    }, []);

    const filtered = volunteers.filter(v => {
        if (!v.verified) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!v.name.toLowerCase().includes(query) && !v.bio.toLowerCase().includes(query)) return false;
        }
        if (filterTopic && !v.topics.includes(filterTopic)) return false;
        if (filterType && v.role !== filterType) return false;
        if (filterLang && !v.languages.includes(filterLang)) return false;
        return true;
    });

    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Hide CTA if user is already a volunteer or has a volunteer profile
    const isVolunteer = user && (
        user.role === 'VOLUNTEER_APPROVED' ||
        user.role === 'VOLUNTEER_PENDING' ||
        user.hasVolunteerProfile
    );

    const handleApplyNow = () => {
        if (!user) { navigate('/auth'); return; }
        navigate('/volunteer/apply');
    };

    const handleBecomePeerListener = async () => {
        if (!user) { navigate('/auth'); return; }
        setErrorMsg(null);
        try {
            const res = await volunteerApi.becomeListener();
            if (res.token) {
                sessionStorage.setItem('sh_token', res.token);
                window.location.href = '/volunteer/dashboard';
            }
        } catch (err: any) {
            setErrorMsg(err.message || "Failed to become peer listener. You might already have a profile.");
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setFilterTopic('');
        setFilterType('');
        setFilterLang('');
    };

    const hasActiveFilters = Boolean(searchQuery || filterTopic || filterType || filterLang);

    return (
        <div className="space-y-8">
            <ExternalLinkWarning 
                isOpen={!!externalLink} 
                onClose={() => setExternalLink(null)} 
                url={externalLink || ''} 
            />

            {errorMsg && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex justify-between items-center">
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="text-xs font-bold hover:underline">Dismiss</button>
                </div>
            )}

            <div className="flex flex-col gap-6">
                <div><h1 className="text-3xl font-bold mb-2 font-serif dark:text-white">Volunteer Directory</h1><p className="text-gray-500">Connect with verified professionals and listeners.</p></div>
                
                {!isVolunteer && (
                    <div className="bg-gray-900 dark:bg-gray-850 border border-primary-900/50 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                        <div className="max-w-xl">
                            <h2 className="text-2xl font-bold mb-2">Want to support seekers?</h2>
                            <p className="text-gray-300 mb-5 leading-relaxed text-sm">Join our network of trained Peer Listeners or apply as a Verified Mental Health Professional to provide confidential support.</p>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={handleApplyNow} className="w-full sm:w-auto min-h-[44px] flex items-center justify-center bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">Apply as Professional</button>
                                <button onClick={handleBecomePeerListener} className="w-full sm:w-auto min-h-[44px] flex items-center justify-center bg-white/10 hover:bg-white/15 text-white border border-white/20 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">Become a Peer Listener</button>
                            </div>
                        </div>
                        <div className="hidden md:flex w-24 h-24 bg-primary-950/60 rounded-2xl items-center justify-center border border-primary-800/40 shadow-inner shrink-0">
                            <Handshake className="w-12 h-12 text-primary-400" />
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 mt-2">
                    <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search by name or bio..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white text-base sm:text-sm min-h-[44px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
                        <select className="w-full min-h-[44px] text-base sm:text-sm pl-3 pr-8 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">All Roles</option><option value="licensed">Licensed</option><option value="listener">Listener</option><option value="intern">Intern / Trainee</option></select>
                        <select className="w-full min-h-[44px] text-base sm:text-sm pl-3 pr-8 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}><option value="">All Topics</option>{TOPICS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select className="w-full min-h-[44px] text-base sm:text-sm pl-3 pr-8 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" value={filterLang} onChange={e => setFilterLang(e.target.value)}><option value="">All Languages</option><option value="English">English</option><option value="Swahili">Swahili</option><option value="Kalenjin">Kalenjin</option></select>
                    </div>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/60">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Handshake className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {hasActiveFilters ? "No volunteers found matching your filters" : "Volunteer Network Is Onboarding"}
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto text-sm mb-6 leading-relaxed">
                        {hasActiveFilters 
                            ? "Try broadening your search criteria or resetting filters to connect with all active listeners and licensed professionals."
                            : "Our verified listener community is actively onboarding. Real volunteers and licensed counselors join as our outreach expands. You can apply to offer peer support today."}
                    </p>
                    {hasActiveFilters ? (
                        <button onClick={resetFilters} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                            Clear Filters
                        </button>
                    ) : (
                        <div className="flex gap-3 justify-center">
                            <button onClick={handleApplyNow} className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                Apply to Volunteer
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(volunteer => <VolunteerCard key={volunteer.id} volunteer={volunteer} onExternalLink={setExternalLink} />)}
                </div>
            )}
        </div>
    );
};