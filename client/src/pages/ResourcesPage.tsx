import React, { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';
import { Article, Book, Video, Quote } from '../types';
import { Card, Badge, Input } from '../components/ui';
import { BookOpen, Video as VideoIcon, ArrowRight, Quote as QuoteIcon, Search, Book as BookIcon, PlayCircle } from 'lucide-react';

export const ResourcesPage = () => {
    const [filter, setFilter] = useState<'all' | 'article' | 'book' | 'video' | 'quote'>('all');
    const [search, setSearch] = useState('');
    const [articles, setArticles] = useState<Article[]>([]);

    const [books, setBooks] = useState<Book[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);

    useEffect(() => {
        StorageService.getArticles().then(setArticles);
        StorageService.getBooks().then(setBooks);
        StorageService.getVideos().then(setVideos);
        StorageService.getQuotes().then(setQuotes);
    }, []);

    const allResources = [
        ...articles,
        ...books,
        ...videos,
        ...quotes
    ];

    const filtered = allResources.filter(r => {
        if (filter !== 'all' && r.type !== filter) return false;
        if (search) {
            const term = search.toLowerCase();
            // Check properties based on type
            if ('title' in r && r.title?.toLowerCase().includes(term)) return true;
            if ('text' in r && r.text?.toLowerCase().includes(term)) return true;
            if ('author' in r && r.author?.toLowerCase().includes(term)) return true;
            if ('presenter' in r && r.presenter?.toLowerCase().includes(term)) return true;
            return false;
        }
        return true;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold font-serif mb-2 dark:text-white">Self-Help Library</h1>
                    <p className="text-gray-500">Curated resources for your journey.</p>
                </div>
                <div className="w-full md:w-auto relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search topics..." 
                        className="w-full md:w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'all', label: 'All Resources' },
                    { id: 'article', label: 'Articles' },
                    { id: 'book', label: 'Books' },
                    { id: 'video', label: 'Watch & Learn' },
                    { id: 'quote', label: 'Wisdom' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as any)}
                        className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-colors ${filter === f.id ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((r, idx) => {
                    if (r.type === 'article') {
                        return (
                            <div key={idx} className="group cursor-pointer">
                                <Card hoverable className="h-full flex flex-col">
                                    <div className="h-48 overflow-hidden bg-gray-200 relative">
                                        <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <span className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">Article</span>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="mb-2"><Badge color="green">{r.category}</Badge></div>
                                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary-600 transition-colors dark:text-white">{r.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">{r.content}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                                            <span>{r.readTime} min read</span>
                                            <span className="font-semibold text-primary-600 flex items-center gap-1">Read <ArrowRight className="w-4 h-4" /></span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        );
                    }
                    if (r.type === 'book') {
                        return (
                            <Card key={idx} hoverable className="flex flex-col h-full bg-[#fdfbf7] dark:bg-gray-800/50">
                                <div className="p-6 flex gap-4">
                                    <div className="w-24 shrink-0 shadow-lg rounded-r overflow-hidden">
                                        <img src={r.cover} alt={r.title} className="w-full h-auto object-cover aspect-[2/3]" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Book Recommendation</span>
                                        <h3 className="font-bold text-lg leading-tight mb-1 dark:text-white">{r.title}</h3>
                                        <p className="text-sm text-gray-500 italic mb-2">by {r.author}</p>
                                        <Badge color="yellow">{r.category}</Badge>
                                    </div>
                                </div>
                                <div className="px-6 pb-6 mt-auto">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{r.description}</p>
                                    <a href={r.link} className="inline-flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white hover:underline">
                                        <BookIcon className="w-4 h-4" /> Get this book
                                    </a>
                                </div>
                            </Card>
                        );
                    }
                    if (r.type === 'video') {
                        return (
                            <Card key={idx} hoverable className="flex flex-col h-full overflow-hidden group">
                                <div className="relative h-48 bg-gray-900">
                                    <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <PlayCircle className="w-12 h-12 text-white opacity-90 group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{r.duration}</span>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <Badge color="blue" className="self-start mb-2">{r.category}</Badge>
                                    <h3 className="font-bold text-lg mb-1 dark:text-white">{r.title}</h3>
                                    <p className="text-sm text-gray-500 mb-3">{r.presenter}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{r.description}</p>
                                </div>
                            </Card>
                        );
                    }
                    if (r.type === 'quote') {
                        return (
                            <Card key={idx} className="p-8 bg-gradient-to-br from-primary-600 to-teal-600 text-white flex flex-col justify-center text-center h-full min-h-[300px]">
                                <QuoteIcon className="w-8 h-8 mx-auto mb-6 opacity-50" />
                                <p className="text-xl md:text-2xl font-serif leading-relaxed mb-4">"{r.text}"</p>
                                {r.textSw && <p className="text-lg italic opacity-80 mb-6">"{r.textSw}"</p>}
                                <div className="mt-auto pt-6 border-t border-white/20">
                                    <p className="font-bold text-sm uppercase tracking-widest">{r.author}</p>
                                </div>
                            </Card>
                        );
                    }
                    return null;
                })}
            </div>
            
            {filtered.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-lg">No resources found matching your criteria.</p>
                </div>
            )}
        </div>
    );
};