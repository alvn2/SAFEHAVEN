import React, { useState, useEffect } from 'react';
import { adminApi, volunteerApi } from '../lib/api';
import { Card, Button, Badge, Input } from '../components/ui';
import { ShieldCheck, FileText, Activity, Server, Users, Trash2, Plus, ScrollText, Edit2, X, RefreshCw } from 'lucide-react';
import { Article, VolunteerApplication, AuditLogEntry } from '../types';

const RESOURCE_CATEGORIES = [
    'Mental Health', 'Legal', 'Safety', 'Crisis Support',
    'Relationships', 'Self-Care', 'Trauma', 'Grief', 'Addiction', 'Family'
];

export const DeveloperDashboard = () => {
    const [tab, setTab] = useState<'content' | 'users' | 'system' | 'audit'>('content');
    const [articles, setArticles] = useState<Article[]>([]);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', category: RESOURCE_CATEGORIES[0] });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [apps, setApps] = useState<VolunteerApplication[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const loadData = async () => {
        const [a, ap, l, us, st] = await Promise.all([
            adminApi.getArticles().catch(() => []),
            adminApi.getApplications().catch(() => []),
            adminApi.getAuditLogs().catch(() => []),
            adminApi.getUsers().catch(() => []),
            adminApi.getStats().catch(() => null)
        ]);
        setArticles(a);
        setApps(ap);
        setLogs(l);
        setUsers(us);
        setStats(st);
    };

    useEffect(() => { loadData(); }, []);

    const handlePublish = async () => {
        if (!newArticle.title.trim() || !newArticle.content.trim()) return;
        setIsPublishing(true);
        try {
            if (editingId) {
                await adminApi.updateArticle(editingId, {
                    ...newArticle,
                    readTime: Math.max(1, Math.ceil(newArticle.content.split(' ').length / 200))
                });
                setEditingId(null);
            } else {
                await adminApi.createArticle({
                    ...newArticle,
                    readTime: Math.max(1, Math.ceil(newArticle.content.split(' ').length / 200)),
                    // type is set server-side as 'ARTICLE'
                });
            }
            setNewArticle({ title: '', content: '', category: RESOURCE_CATEGORIES[0] });
            const updated = await adminApi.getArticles().catch(() => []);
            setArticles(updated);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleEdit = (a: any) => {
        setEditingId(a.id);
        setNewArticle({ title: a.title, content: a.description || '', category: a.category || RESOURCE_CATEGORIES[0] });
        setTab('content');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewArticle({ title: '', content: '', category: RESOURCE_CATEGORIES[0] });
    };

    const handleDeleteArticle = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        await adminApi.deleteArticle(id);
        const updated = await adminApi.getArticles().catch(() => []);
        setArticles(updated);
    };

    const handleApprove = async (id: string) => {
        await adminApi.approveApp(id);
        const updated = await adminApi.getApplications().catch(() => []);
        setApps(updated);
    };

    const handleReject = async (id: string, name: string) => {
        if (!confirm(`Reject ${name}'s application?`)) return;
        await adminApi.rejectApp(id);
        const updated = await adminApi.getApplications().catch(() => []);
        setApps(updated);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-serif dark:text-white flex items-center gap-2">
                    <Server className="text-primary-500" /> Developer Console
                </h1>
                <Badge color="blue">System Admin Mode</Badge>
            </div>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                {['content', 'users', 'system', 'audit'].map(t => (
                    <button key={t} onClick={() => setTab(t as any)} className={`px-6 py-3 font-medium border-b-2 capitalize transition-colors ${tab === t ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}>{t}</button>
                ))}
            </div>

            {/* ===== CONTENT TAB ===== */}
            {tab === 'content' && (
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Add / Edit form */}
                    <Card className="p-6 md:col-span-1 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold dark:text-white">{editingId ? 'Edit Resource' : 'Add Resource'}</h3>
                            {editingId && (
                                <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            <Input
                                label="Title"
                                value={newArticle.title}
                                onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                                placeholder="Resource title..."
                            />
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 dark:text-gray-200">Category</label>
                                <select
                                    className="w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={newArticle.category}
                                    onChange={e => setNewArticle({ ...newArticle, category: e.target.value })}
                                >
                                    {RESOURCE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 dark:text-gray-200">Content</label>
                                <textarea
                                    className="w-full p-3 border rounded-xl dark:bg-gray-800 dark:text-white dark:border-gray-600 h-40 focus:ring-2 focus:ring-primary-500 outline-none resize-y"
                                    placeholder="Write the resource content..."
                                    value={newArticle.content}
                                    onChange={e => setNewArticle({ ...newArticle, content: e.target.value })}
                                />
                            </div>
                            <Button onClick={handlePublish} className="w-full" isLoading={isPublishing} disabled={!newArticle.title.trim() || !newArticle.content.trim()}>
                                {editingId ? <><Edit2 className="w-4 h-4 mr-2" />Update Resource</> : <><Plus className="w-4 h-4 mr-2" />Publish Resource</>}
                            </Button>
                        </div>
                    </Card>

                    {/* Right: Resource list */}
                    <div className="md:col-span-2 space-y-3">
                        {articles.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No resources published yet.</div>
                        ) : (
                            articles.map((a: any) => (
                                <Card key={a.id} className={`p-4 flex justify-between items-center transition-colors ${editingId === a.id ? 'ring-2 ring-primary-500' : ''}`}>
                                    <div>
                                        <h4 className="font-bold dark:text-white">{a.title}</h4>
                                        <div className="flex gap-2 mt-1">
                                            <Badge color="green">{a.category}</Badge>
                                            <span className="text-xs text-gray-400">{a.readTime} min read</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(a)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Edit">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteArticle(a.id, a.title)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ===== USERS TAB ===== */}
            {tab === 'users' && (
                <div className="space-y-6">
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Registered Platform Accounts ({users.length})</h3>
                                <p className="text-xs text-gray-500">Live database accounts (Seekers, Volunteers, Admins)</p>
                            </div>
                            <Badge color="purple">{users.length} Total Accounts</Badge>
                        </div>
                        {users.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No registered users found.</div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((u: any) => {
                                    const rc = u.role === 'ADMIN' ? 'purple' : u.role === 'VOLUNTEER_APPROVED' ? 'blue' : u.role === 'MODERATOR' ? 'green' : 'gray';
                                    return (
                                        <div key={u.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center font-bold text-primary-600 text-sm">
                                                    {u.username?.slice(0, 2).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold dark:text-white">{u.username}</span>
                                                        <Badge color={rc as any}>{u.role}</Badge>
                                                        {u.status === 'SUSPENDED' && <Badge color="red">SUSPENDED</Badge>}
                                                    </div>
                                                    <span className="font-mono text-xs text-gray-400">{u.id}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Pending Volunteer Applications */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                            <h3 className="font-bold text-lg dark:text-white">Pending Volunteer Applications</h3>
                        </div>
                        {apps.filter(a => a.status === 'pending').length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No pending applications.</div>
                        ) : apps.filter(a => a.status === 'pending').map((app: any) => (
                            <div key={app.id} className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white">{app.name}</h4>
                                    <div className="flex gap-2 text-sm text-gray-500 mt-1">
                                        <span>{app.email}</span> • <span>{app.phone}</span>
                                    </div>
                                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm dark:text-gray-300">
                                        <span className="font-bold">Qual:</span> {app.qualification}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="danger" onClick={() => handleReject(app.id, app.name)}>Reject</Button>
                                    <Button size="sm" onClick={() => handleApprove(app.id)}>Approve</Button>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            )}

            {/* ===== SYSTEM TAB ===== */}
            {tab === 'system' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={loadData}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="p-6 text-center">
                            <Activity className="w-8 h-8 mx-auto text-green-500 mb-2" />
                            <h3 className="text-2xl font-bold dark:text-white">Healthy</h3>
                            <p className="text-xs text-gray-500">System Status</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                            <h3 className="text-2xl font-bold dark:text-white">{stats?.userCount ?? '—'}</h3>
                            <p className="text-xs text-gray-500">Total Users</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <ShieldCheck className="w-8 h-8 mx-auto text-teal-500 mb-2" />
                            <h3 className="text-2xl font-bold dark:text-white">{stats?.volunteerCount ?? '—'}</h3>
                            <p className="text-xs text-gray-500">Verified Volunteers</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <FileText className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                            <h3 className="text-2xl font-bold dark:text-white">{stats?.resourceCount ?? articles.length}</h3>
                            <p className="text-xs text-gray-500">Resources</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <ScrollText className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                            <h3 className="text-2xl font-bold dark:text-white">{stats?.postCount ?? '—'}</h3>
                            <p className="text-xs text-gray-500">Forum Posts</p>
                        </Card>
                        <Card className="p-6 text-center">
                            <Server className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                            <h3 className="text-2xl font-bold dark:text-white">{stats?.pendingApplications ?? '—'}</h3>
                            <p className="text-xs text-gray-500">Pending Applications</p>
                        </Card>
                    </div>
                    {stats?.lastAction && (
                        <p className="text-xs text-center text-gray-400">
                            Last admin action: {new Date(stats.lastAction).toLocaleString()}
                        </p>
                    )}
                </div>
            )}

            {/* ===== AUDIT TAB ===== */}
            {tab === 'audit' && (
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-lg dark:text-white flex gap-2 items-center">
                            <ScrollText className="w-5 h-5" /> Audit Log
                        </h3>
                        <span className="text-sm text-gray-400">{logs.length} entries</span>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {logs.map((log: any) => (
                            <div key={log.id} className="p-4 text-sm flex justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                                <div className="flex-1 min-w-0">
                                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-xs uppercase tracking-wide">{log.action}</span>
                                    <p className="text-gray-600 dark:text-gray-300 mt-0.5 truncate">{log.details}</p>
                                </div>
                                <div className="text-right text-gray-400 text-xs shrink-0">
                                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                                    {log.targetIdHash && <div className="font-mono">Ref: {log.targetIdHash.slice(0, 8)}…</div>}
                                </div>
                            </div>
                        ))}
                        {logs.length === 0 && <div className="p-8 text-center text-gray-500">No audit log entries yet.</div>}
                    </div>
                </Card>
            )}
        </div>
    );
};