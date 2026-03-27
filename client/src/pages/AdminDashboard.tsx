import React, { useState, useEffect } from 'react';
import { adminApi, forumApi } from '../lib/api';
import { VolunteerApplication, ForumPost } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { ShieldCheck, Flag, Check, Trash2, Eye, LayoutList, UserCheck, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminDashboard = () => {
    const [apps, setApps] = useState<VolunteerApplication[]>([]);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [ugc, setUgc] = useState<any>({ groups: [], events: [], orgs: [], quotes: [] });
    const [modApps, setModApps] = useState<any[]>([]);
    const [modAppsOpen, setModAppsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'volunteers' | 'moderation' | 'ugc' | 'moderators'>('volunteers');
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const loadData = async () => {
        const [a, p, u, ma, ss] = await Promise.all([
            adminApi.getApplications().catch(() => []),
            adminApi.getFlaggedPosts().catch(() => []),
            adminApi.getPendingUGC().catch(() => ({ groups: [], events: [], orgs: [], quotes: [] })),
            adminApi.getModApplications().catch(() => []),
            adminApi.getSystemSettings().catch(() => ({ modApplicationsOpen: false }))
        ]);
        setApps(a);
        setPosts(p);
        setUgc(u);
        setModApps(ma);
        setModAppsOpen(ss.modApplicationsOpen);
    };

    useEffect(() => {
        loadData();
    }, []);

    const pendingApps = apps.filter(a => a.status === 'pending');
    const flaggedPosts = posts.filter(p => p.isFlagged);

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        await adminApi.approveApp(id).catch(() => {});
        loadData();
        setApprovingId(null);
    };

    const handleDeletePost = async (id: string) => {
        if (confirm("Are you sure you want to permanently delete this post?")) {
            await forumApi.delete(id).catch(() => {});
            loadData();
        }
    };

    const handleDismissFlag = async (id: string) => {
        await forumApi.dismiss(id).catch(() => {});
        loadData();
    };

    const handleModerateUGC = async (type: 'group'|'event'|'org'|'quote', id: string, action: 'approve'|'reject') => {
        await adminApi.moderateUGC(type, id, action);
        loadData();
    };

    const handleModerateModApp = async (id: string, action: 'approve' | 'reject') => {
        await adminApi.moderateModApp(id, action);
        loadData();
    };

    const toggleModApplications = async () => {
        const next = !modAppsOpen;
        setModAppsOpen(next);
        await adminApi.updateSystemSettings({ modApplicationsOpen: next });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-serif dark:text-white">Admin Dashboard</h1>

            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button 
                    className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'volunteers' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('volunteers')}
                >
                    <ShieldCheck className="w-4 h-4" /> Vetting Queue ({pendingApps.length})
                </button>
                <button 
                    className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'moderation' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('moderation')}
                >
                    <Flag className="w-4 h-4" /> Flagged Forum ({flaggedPosts.length})
                </button>
                <button 
                    className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ugc' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('ugc')}
                >
                    <LayoutList className="w-4 h-4" /> Community UGC ({ugc.groups.length + ugc.events.length + ugc.orgs.length + ugc.quotes.length})
                </button>
                <button 
                    className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'moderators' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('moderators')}
                >
                    <UserCheck className="w-4 h-4" /> Mod Applications ({modApps.length})
                </button>
            </div>

            {activeTab === 'volunteers' && (
                <Card className="p-0 overflow-hidden">
                    {pendingApps.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No pending applications.</div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pendingApps.map(app => (
                                <div key={app.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{app.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <Badge color="blue">{app.role}</Badge>
                                                <span className="text-sm text-gray-500">{app.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="danger">Reject</Button>
                                            <Button size="sm" onClick={() => handleApprove(app.id)} isLoading={approvingId === app.id} disabled={approvingId !== null}>
                                                Approve & Verify
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                        <div>
                                            <span className="block font-semibold text-gray-500">License / ID</span>
                                            <p className="font-mono dark:text-gray-300">{app.role === 'licensed' ? app.licenseNumber : app.idNumber}</p>
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-500">Qualification</span>
                                            <p className="dark:text-gray-300">{app.qualification}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="block font-semibold text-gray-500">Experience</span>
                                            <p className="dark:text-gray-300">{app.experience}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'moderation' && (
                <Card className="p-0 overflow-hidden">
                     {flaggedPosts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No flagged posts requiring review.</div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {flaggedPosts.map(post => (
                                <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <Flag className="w-5 h-5 text-red-500" />
                                            <div>
                                                <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Flagged Post</h3>
                                                <div className="flex gap-2 text-sm text-gray-500">
                                                    <span>by {post.author}</span>
                                                    <span>•</span>
                                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => handleDismissFlag(post.id)}>
                                                <Check className="w-4 h-4 mr-1" /> Dismiss
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeletePost(post.id)}>
                                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl">
                                        <h4 className="font-bold mb-1 dark:text-white">{post.title}</h4>
                                        <p className="text-gray-700 dark:text-gray-300">{post.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'ugc' && (
                <div className="space-y-6">
                    {/* Groups */}
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-bold text-lg dark:text-white">Community Groups ({ugc.groups.length})</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {ugc.groups.map((g: any) => (
                                <div key={g.id} className="p-6 flex justify-between items-start dark:text-gray-300">
                                    <div><p className="font-bold text-gray-900 dark:text-white">{g.name}</p> <p className="text-sm mt-1">{g.description}</p></div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="danger" onClick={() => handleModerateUGC('group', g.id, 'reject')}>Reject</Button>
                                        <Button size="sm" onClick={() => handleModerateUGC('group', g.id, 'approve')}>Approve</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Events */}
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-bold text-lg dark:text-white">Events ({ugc.events.length})</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {ugc.events.map((e: any) => (
                                <div key={e.id} className="p-6 flex justify-between items-start dark:text-gray-300">
                                    <div><p className="font-bold text-gray-900 dark:text-white">{e.title}</p> <p className="text-sm mt-1">{e.description}</p></div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="danger" onClick={() => handleModerateUGC('event', e.id, 'reject')}>Reject</Button>
                                        <Button size="sm" onClick={() => handleModerateUGC('event', e.id, 'approve')}>Approve</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Orgs */}
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-bold text-lg dark:text-white">Organizations ({ugc.orgs.length})</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {ugc.orgs.map((o: any) => (
                                <div key={o.id} className="p-6 flex justify-between items-start dark:text-gray-300">
                                    <div><p className="font-bold text-gray-900 dark:text-white">{o.name}</p> <p className="text-sm mt-1">{o.description}</p></div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="danger" onClick={() => handleModerateUGC('org', o.id, 'reject')}>Reject</Button>
                                        <Button size="sm" onClick={() => handleModerateUGC('org', o.id, 'approve')}>Approve</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quotes */}
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-bold text-lg dark:text-white">Daily Quotes ({ugc.quotes.length})</h2>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {ugc.quotes.map((q: any) => (
                                <div key={q.id} className="p-6 flex justify-between items-start dark:text-gray-300">
                                    <div><p className="font-bold italic text-gray-900 dark:text-white">"{q.text}"</p> <p className="text-sm font-bold mt-1">— {q.author}</p></div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="danger" onClick={() => handleModerateUGC('quote', q.id, 'reject')}>Reject</Button>
                                        <Button size="sm" onClick={() => handleModerateUGC('quote', q.id, 'approve')}>Approve</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
            {activeTab === 'moderators' && (
                <div className="space-y-6">
                    {/* Master Toggle */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Moderator Applications</h3>
                                <p className="text-sm text-gray-500 mt-1">Control whether users can submit moderator applications.</p>
                            </div>
                            <button onClick={toggleModApplications} className="flex items-center gap-2 text-sm font-bold">
                                {modAppsOpen ? (
                                    <><ToggleRight className="w-8 h-8 text-green-500" /> <span className="text-green-600">Open</span></>
                                ) : (
                                    <><ToggleLeft className="w-8 h-8 text-gray-400" /> <span className="text-gray-500">Closed</span></>
                                )}
                            </button>
                        </div>
                    </Card>

                    {/* Pending Applications */}
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-bold text-lg dark:text-white">Pending ({modApps.length})</h2>
                        </div>
                        {modApps.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No pending moderator applications.</div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {modApps.map((app: any) => (
                                    <div key={app.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg dark:text-white">{app.user?.username || 'Unknown'}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge color="blue">{app.user?.role || 'USER'}</Badge>
                                                    <span className="text-sm text-gray-500">Joined {app.user?.createdAt ? new Date(app.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="danger" onClick={() => handleModerateModApp(app.id, 'reject')}>Reject</Button>
                                                <Button size="sm" onClick={() => handleModerateModApp(app.id, 'approve')}>Approve</Button>
                                            </div>
                                        </div>
                                        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl">
                                            <span className="block text-xs font-bold text-gray-500 mb-1 uppercase">Reason for Applying</span>
                                            <p className="dark:text-gray-300">{app.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};