import React, { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';
import { Card, Button, Badge, Input } from '../components/ui';
import { ShieldCheck, FileText, Activity, Server, Users, Trash2, Plus, ScrollText } from 'lucide-react';
import { Article, VolunteerApplication, AuditLogEntry } from '../types';

export const DeveloperDashboard = () => {
    const [tab, setTab] = useState<'content' | 'users' | 'system' | 'audit'>('content');
    const [articles, setArticles] = useState<Article[]>([]);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: '' });
    const [apps, setApps] = useState<VolunteerApplication[]>([]);
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [volCount, setVolCount] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            const [a, ap, l, v] = await Promise.all([
                StorageService.getArticles(),
                StorageService.getVolunteerApps(),
                StorageService.getAuditLogs(),
                StorageService.getVolunteers()
            ]);
            setArticles(a);
            setApps(ap);
            setLogs(l);
            setVolCount(v.length);
        };
        loadData();
    }, []);
    
    const handleAddArticle = async () => {
        if(!newArticle.title) return;
        await StorageService.saveArticle({ id: Date.now().toString(), ...newArticle, readTime: 5, image: 'https://placehold.co/600x400', type: 'article' });
        const updated = await StorageService.getArticles();
        setArticles(updated);
        setNewArticle({ title: '', content: '', category: '' });
    };

    const handleDeleteArticle = async (id: string) => {
        await StorageService.deleteArticle(id);
        const updated = await StorageService.getArticles();
        setArticles(updated);
    };

    const handleApprove = async (id: string) => {
        const updated = await StorageService.approveVolunteer(id);
        setApps(updated);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-serif dark:text-white flex items-center gap-2"><Server className="text-primary-500" /> Developer Console</h1>
                <Badge color="blue">System Admin Mode</Badge>
            </div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {['content', 'users', 'system', 'audit'].map(t => (
                    <button key={t} onClick={() => setTab(t as any)} className={`px-6 py-3 font-medium border-b-2 capitalize transition-colors ${tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>{t}</button>
                ))}
            </div>

            {tab === 'content' && (
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="p-6 md:col-span-1 h-fit">
                        <h3 className="font-bold mb-4 dark:text-white">Add Resource</h3>
                        <div className="space-y-4">
                            <Input label="Title" value={newArticle.title} onChange={e => setNewArticle({...newArticle, title: e.target.value})} />
                            <Input label="Category" value={newArticle.category} onChange={e => setNewArticle({...newArticle, category: e.target.value})} />
                            <textarea className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white" rows={6} placeholder="Content..." value={newArticle.content} onChange={e => setNewArticle({...newArticle, content: e.target.value})} />
                            <Button onClick={handleAddArticle} className="w-full"><Plus className="w-4 h-4 mr-2"/> Publish</Button>
                        </div>
                    </Card>
                    <div className="md:col-span-2 space-y-4">
                        {articles.map((a: any) => (
                            <Card key={a.id} className="p-4 flex justify-between items-center">
                                <div><h4 className="font-bold dark:text-white">{a.title}</h4><Badge color="green" className="mt-1">{a.category}</Badge></div>
                                <button onClick={() => handleDeleteArticle(a.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'users' && (
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800"><h3 className="font-bold text-lg dark:text-white">Pending Applications</h3></div>
                    {apps.filter((a: any) => a.status === 'pending').length === 0 ? <div className="p-8 text-center text-gray-500">No pending applications.</div> : 
                    apps.filter((a: any) => a.status === 'pending').map((app: any) => (
                        <div key={app.id} className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
                            <div><h4 className="font-bold text-lg dark:text-white">{app.name}</h4><div className="flex gap-2 text-sm text-gray-500 mt-1"><span>{app.email}</span> • <span>{app.phone}</span></div><div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm dark:text-gray-300"><span className="font-bold">Qual:</span> {app.qualification}</div></div>
                            <div className="flex gap-2"><Button size="sm" variant="danger">Reject</Button><Button size="sm" onClick={() => handleApprove(app.id)}>Approve</Button></div>
                        </div>
                    ))}
                </Card>
            )}

             {tab === 'system' && (
                <div className="grid md:grid-cols-4 gap-6">
                    <Card className="p-6 text-center"><Activity className="w-8 h-8 mx-auto text-green-500 mb-2" /><h3 className="text-2xl font-bold dark:text-white">Healthy</h3><p className="text-xs text-gray-500">System Status</p></Card>
                    <Card className="p-6 text-center"><Users className="w-8 h-8 mx-auto text-blue-500 mb-2" /><h3 className="text-2xl font-bold dark:text-white">{volCount}</h3><p className="text-xs text-gray-500">Volunteers</p></Card>
                    <Card className="p-6 text-center"><FileText className="w-8 h-8 mx-auto text-purple-500 mb-2" /><h3 className="text-2xl font-bold dark:text-white">{articles.length}</h3><p className="text-xs text-gray-500">Resources</p></Card>
                </div>
            )}

            {tab === 'audit' && (
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800"><h3 className="font-bold text-lg dark:text-white flex gap-2"><ScrollText/> Audit Log</h3></div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.map((log: any) => (
                            <div key={log.id} className="p-4 text-sm flex justify-between">
                                <div><span className="font-mono font-bold text-blue-600">{log.action}</span> <span className="text-gray-600 dark:text-gray-300 ml-2">{log.details}</span></div>
                                <div className="text-right text-gray-400 text-xs"><div>{new Date(log.timestamp).toLocaleString()}</div><div className="font-mono">Ref: {log.targetIdHash}</div></div>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="p-8 text-center text-gray-500">No logs found.</div>}
                    </div>
                </Card>
            )}
        </div>
    );
};