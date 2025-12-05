import React, { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';
import { Volunteer } from '../types';
import { VolunteerCard } from '../components/VolunteerCard';
import { TOPICS } from '../utils/constants';
import { Search } from 'lucide-react';

export const VolunteerNetworkPage = () => {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [filterTopic, setFilterTopic] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterLang, setFilterLang] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setVolunteers(StorageService.getVolunteers());
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

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-6">
                <div><h1 className="text-3xl font-bold mb-2 font-serif dark:text-white">Volunteer Directory</h1><p className="text-gray-500">Connect with verified professionals and listeners.</p></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                    <div className="flex gap-2">
                        <select className="pl-4 pr-8 py-2.5 rounded-xl border bg-transparent dark:text-white dark:border-gray-600" value={filterType} onChange={e => setFilterType(e.target.value)}><option value="">All Roles</option><option value="licensed">Licensed</option><option value="listener">Listener</option></select>
                        <select className="pl-4 pr-8 py-2.5 rounded-xl border bg-transparent dark:text-white dark:border-gray-600" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}><option value="">All Topics</option>{TOPICS.map(t => <option key={t} value={t}>{t}</option>)}</select>
                        <select className="pl-4 pr-8 py-2.5 rounded-xl border bg-transparent dark:text-white dark:border-gray-600" value={filterLang} onChange={e => setFilterLang(e.target.value)}><option value="">All Languages</option><option value="English">English</option><option value="Swahili">Swahili</option></select>
                    </div>
                </div>
            </div>
            {filtered.length === 0 ? <div className="text-center py-20 text-gray-500">No volunteers found.</div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(volunteer => <VolunteerCard key={volunteer.id} volunteer={volunteer} />)}</div>}
        </div>
    );
};