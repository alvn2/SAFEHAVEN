import React, { useState, useEffect, useRef } from 'react';
import { adminApi, forumApi } from '../lib/api';
import { VolunteerApplication, ForumPost } from '../types';
import { Card, Badge, Button } from '../components/ui';
import {
    ShieldCheck, Flag, Check, Trash2, LayoutList, UserCheck,
    ToggleLeft, ToggleRight, Users, Search, ChevronDown,
    MoreVertical, Ban, RefreshCw, UserX, AlertTriangle, Eye
} from 'lucide-react';

// --------------------------------------------------
// Small user-action dropdown
// --------------------------------------------------
const UserActionMenu = ({
    user,
    onSuspend,
    onReactivate,
    onRoleChange,
    onDelete
}: {
    user: any;
    onSuspend: () => void;
    onReactivate: () => void;
    onRoleChange: (role: string) => void;
    onDelete: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const ROLES = ['USER', 'VOLUNTEER_PENDING', 'VOLUNTEER_APPROVED', 'MODERATOR'];
    const isSuspended = user.status === 'SUSPENDED';
    const isAdmin = user.role === 'ADMIN';

    if (isAdmin) return null; // Cannot act on admin accounts

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(o => !o)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="User actions"
            >
                <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {open && (
                <div className="absolute right-0 top-9 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    {/* Role change */}
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Change Role</p>
                        {ROLES.filter(r => r !== user.role).map(role => (
                            <button
                                key={role}
                                onClick={() => { onRoleChange(role); setOpen(false); }}
                                className="block w-full text-left px-2 py-1.5 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
                            >
                                → {role}
                            </button>
                        ))}
                    </div>
                    {/* Suspend/Reactivate */}
                    {isSuspended ? (
                        <button onClick={() => { onReactivate(); setOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                            <RefreshCw className="w-3.5 h-3.5" /> Reactivate Account
                        </button>
                    ) : (
                        <button onClick={() => { onSuspend(); setOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20">
                            <Ban className="w-3.5 h-3.5" /> Suspend Account
                        </button>
                    )}
                    {/* Delete */}
                    <button onClick={() => { onDelete(); setOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-100 dark:border-gray-700">
                        <UserX className="w-3.5 h-3.5" /> Delete Account
                    </button>
                </div>
            )}
        </div>
    );
};

// --------------------------------------------------
// Main dashboard
// --------------------------------------------------
export const AdminDashboard = () => {
    const [apps, setApps] = useState<VolunteerApplication[]>([]);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [ugc, setUgc] = useState<any>({ groups: [], events: [], orgs: [], quotes: [] });
    const [modApps, setModApps] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [modAppsOpen, setModAppsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'volunteers' | 'moderation' | 'ugc' | 'moderators' | 'users'>('volunteers');
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [forumView, setForumView] = useState<'flagged' | 'all'>('flagged');

    // Users tab filters
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const loadData = async () => {
        const [
            applicationsData,
            flaggedPostsData,
            pendingUgcData,
            modApplicationsData,
            systemSettingsData,
            usersData,
            allPostsData
        ] = await Promise.all([
            adminApi.getApplications().catch(() => []),
            adminApi.getFlaggedPosts().catch(() => []),
            adminApi.getPendingUGC().catch(() => ({ groups: [], events: [], orgs: [], quotes: [] })),
            adminApi.getModApplications().catch(() => []),
            adminApi.getSystemSettings().catch(() => ({ modApplicationsOpen: false })),
            adminApi.getUsers().catch(() => []),
            adminApi.getAllPosts().catch(() => ({ posts: [] }))
        ]);
        setApps(applicationsData);
        setPosts(flaggedPostsData);
        setUgc(pendingUgcData);
        setModApps(modApplicationsData);
        setModAppsOpen(systemSettingsData.modApplicationsOpen);
        setUsers(usersData);
        setAllPosts(allPostsData.posts || []);
    };

    useEffect(() => { loadData(); }, []);

    const pendingApps = apps.filter(a => a.status === 'pending');
    const flaggedPosts = posts.filter(p => p.isFlagged);

    // --- Volunteer vetting handlers ---
    const handleApprove = async (id: string) => {
        setApprovingId(id);
        await adminApi.approveApp(id).catch(() => {});
        await loadData();
        setApprovingId(null);
    };

    const handleReject = async (id: string, name: string) => {
        if (!confirm(`Reject ${name}'s application? This cannot be undone.`)) return;
        await adminApi.rejectApp(id).catch(() => {});
        loadData();
    };

    // --- Forum handlers ---
    const handleDeletePost = async (id: string) => {
        if (confirm('Permanently delete this post?')) {
            await forumApi.delete(id).catch(() => {});
            loadData();
        }
    };
    const handleDismissFlag = async (id: string) => {
        await forumApi.dismiss(id).catch(() => {});
        loadData();
    };

    // --- UGC handlers ---
    const handleModerateUGC = async (type: 'group' | 'event' | 'org' | 'quote', id: string, action: 'approve' | 'reject') => {
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

    // --- User management handlers ---
    const handleSuspend = async (id: string, username: string) => {
        if (!confirm(`Suspend ${username}? They will be unable to log in.`)) return;
        await adminApi.suspendUser(id).catch(() => {});
        loadData();
    };

    const handleReactivate = async (id: string) => {
        await adminApi.reactivateUser(id).catch(() => {});
        loadData();
    };

    const handleRoleChange = async (id: string, username: string, role: string) => {
        if (!confirm(`Change ${username}'s role to ${role}?`)) return;
        await adminApi.changeUserRole(id, role).catch(() => {});
        loadData();
    };

    const handleDeleteUser = async (id: string, username: string) => {
        const input = prompt(`Type "${username}" to permanently delete this account and all their data:`);
        if (input !== username) return;
        await adminApi.deleteUser(id).catch(() => {});
        loadData();
    };

    // Filtered users
    const filteredUsers = users.filter(u => {
        if (userSearch && !u.username.toLowerCase().includes(userSearch.toLowerCase())) return false;
        if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
        return true;
    });

    const roleColor = (role: string) =>
        role === 'ADMIN' ? 'purple' :
        role === 'VOLUNTEER_APPROVED' ? 'blue' :
        role === 'MODERATOR' ? 'green' :
        role === 'VOLUNTEER_PENDING' ? 'yellow' : 'gray';

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-serif dark:text-white">Admin Dashboard</h1>

            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                {[
                    { id: 'volunteers', label: `Vetting Queue (${pendingApps.length})`, icon: <ShieldCheck className="w-4 h-4" /> },
                    { id: 'moderation', label: `Flagged Forum (${flaggedPosts.length})`, icon: <Flag className="w-4 h-4" /> },
                    { id: 'ugc', label: `Community UGC (${ugc.groups.length + ugc.events.length + ugc.orgs.length + ugc.quotes.length})`, icon: <LayoutList className="w-4 h-4" /> },
                    { id: 'moderators', label: `Mod Applications (${modApps.length})`, icon: <UserCheck className="w-4 h-4" /> },
                    { id: 'users', label: `Volunteers & Staff (${users.length})`, icon: <Users className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        className={`px-4 py-2.5 font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap min-h-[44px] shrink-0 text-sm ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
                        onClick={() => setActiveTab(tab.id as any)}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== VETTING QUEUE ===== */}
            {activeTab === 'volunteers' && (
                <Card className="p-0 overflow-hidden">
                    {pendingApps.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No pending applications.</div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pendingApps.map(app => (
                                <div key={app.id} className="p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{app.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <Badge color="blue">{app.role}</Badge>
                                                <span className="text-sm text-gray-500">{app.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <Button size="sm" variant="danger" onClick={() => handleReject(app.id, app.name)} className="flex-1 sm:flex-initial min-h-[40px]">Reject</Button>
                                            <Button size="sm" onClick={() => handleApprove(app.id)} isLoading={approvingId === app.id} disabled={approvingId !== null} className="flex-1 sm:flex-initial min-h-[40px]">
                                                Approve & Verify
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                        {(app.licenseNumber || (app as any).idNumber) && (
                                            <div>
                                                <span className="block font-semibold text-gray-500">License / ID</span>
                                                <p className="font-mono dark:text-gray-300">{app.licenseNumber || (app as any).idNumber}</p>
                                            </div>
                                        )}
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

            {/* ===== FORUM MODERATION ===== */}
            {activeTab === 'moderation' && (
                <div className="space-y-4">
                    {/* Sub-tabs: Flagged vs All */}
                    <div className="flex gap-2">
                        <button onClick={() => setForumView('flagged')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${forumView === 'flagged' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            <Flag className="w-3.5 h-3.5 inline mr-1.5" />Flagged ({flaggedPosts.length})
                        </button>
                        <button onClick={() => setForumView('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${forumView === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                            <Eye className="w-3.5 h-3.5 inline mr-1.5" />All Posts ({allPosts.length})
                        </button>
                    </div>

                    <Card className="p-0 overflow-hidden">
                        {forumView === 'flagged' ? (
                            flaggedPosts.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No flagged posts requiring review.</div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {flaggedPosts.map(post => (
                                        <div key={post.id} className="p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Flag className="w-5 h-5 text-red-500 shrink-0" />
                                                    <div>
                                                        <h3 className="font-bold text-lg text-red-600 dark:text-red-400">Flagged Post</h3>
                                                        <div className="flex gap-2 text-sm text-gray-500">
                                                            <span>by {post.author}</span><span>•</span>
                                                            <span>{new Date(post.date).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <Button size="sm" variant="ghost" onClick={() => handleDismissFlag(post.id)} className="flex-1 sm:flex-initial min-h-[40px]">
                                                        <Check className="w-4 h-4 mr-1" /> Dismiss
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleDeletePost(post.id)} className="flex-1 sm:flex-initial min-h-[40px]">
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
                            )
                        ) : (
                            allPosts.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No forum posts found.</div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {allPosts.map((post: any) => (
                                        <div key={post.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-bold dark:text-white">{post.title}</h4>
                                                    {post.isFlagged && <Badge color="red">Flagged</Badge>}
                                                    {post.isTriggering && <Badge color="yellow">Trigger Warning</Badge>}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{post.body}</p>
                                                <p className="text-xs text-gray-400 mt-1">by {post.author} · {new Date(post.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex gap-1 shrink-0">
                                                {!post.isFlagged && (
                                                    <button onClick={() => handleDismissFlag(post.id)} title="Flag" className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg">
                                                        <Flag className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeletePost(post.id)} title="Delete" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </Card>
                </div>
            )}

            {/* ===== COMMUNITY UGC ===== */}
            {activeTab === 'ugc' && (
                <div className="space-y-6">
                    {[
                        { label: 'Community Groups', items: ugc.groups, type: 'group' as const, renderItem: (g: any) => <><p className="font-bold text-gray-900 dark:text-white">{g.name}</p><p className="text-sm mt-1 dark:text-gray-400">{g.description}</p></> },
                        { label: 'Events', items: ugc.events, type: 'event' as const, renderItem: (e: any) => <><p className="font-bold text-gray-900 dark:text-white">{e.title}</p><p className="text-sm mt-1 dark:text-gray-400">{e.description}</p></> },
                        { label: 'Organizations', items: ugc.orgs, type: 'org' as const, renderItem: (o: any) => <><p className="font-bold text-gray-900 dark:text-white">{o.name}</p><p className="text-sm mt-1 dark:text-gray-400">{o.description}</p></> },
                        { label: 'Daily Quotes', items: ugc.quotes, type: 'quote' as const, renderItem: (q: any) => <><p className="font-bold italic text-gray-900 dark:text-white">"{q.text}"</p><p className="text-sm font-bold mt-1 dark:text-gray-400">— {q.author}</p></> },
                    ].map(section => (
                        <Card key={section.label} className="p-0 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="font-bold text-lg dark:text-white">{section.label} ({section.items.length})</h2>
                            </div>
                            {section.items.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Nothing pending in this category.</div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {section.items.map((item: any) => (
                                        <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center dark:text-gray-300 gap-4">
                                            <div className="flex-1 min-w-0">{section.renderItem(item)}</div>
                                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                                <Button size="sm" variant="danger" onClick={() => handleModerateUGC(section.type, item.id, 'reject')} className="flex-1 sm:flex-initial min-h-[40px]">Reject</Button>
                                                <Button size="sm" onClick={() => handleModerateUGC(section.type, item.id, 'approve')} className="flex-1 sm:flex-initial min-h-[40px]">Approve</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* ===== MOD APPLICATIONS ===== */}
            {activeTab === 'moderators' && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Moderator Applications</h3>
                                <p className="text-sm text-gray-500 mt-1">Control whether users can submit moderator applications.</p>
                            </div>
                            <button onClick={toggleModApplications} className="flex items-center gap-2 text-sm font-bold min-h-[44px]">
                                {modAppsOpen ? <><ToggleRight className="w-8 h-8 text-green-500" /><span className="text-green-600">Open</span></> : <><ToggleLeft className="w-8 h-8 text-gray-400" /><span className="text-gray-500">Closed</span></>}
                            </button>
                        </div>
                    </Card>
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="font-bold text-lg dark:text-white">Pending ({modApps.length})</h2>
                        </div>
                        {modApps.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">No pending moderator applications.</div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {modApps.map((app: any) => (
                                    <div key={app.id} className="p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg dark:text-white">{app.user?.username || 'Unknown'}</h3>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge color="blue">{app.user?.role || 'USER'}</Badge>
                                                    <span className="text-sm text-gray-500">Joined {app.user?.createdAt ? new Date(app.user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Button size="sm" variant="danger" onClick={() => handleModerateModApp(app.id, 'reject')} className="flex-1 sm:flex-initial min-h-[40px]">Reject</Button>
                                                <Button size="sm" onClick={() => handleModerateModApp(app.id, 'approve')} className="flex-1 sm:flex-initial min-h-[40px]">Approve</Button>
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

            {/* ===== VOLUNTEERS & STAFF ===== */}
            {activeTab === 'users' && (
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/80 flex items-start gap-3 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold">Zero-Knowledge Privacy Standard:</span> Regular seekers are never tracked, profiled, or listed in administrative rosters. Only volunteer applicants, verified listeners, moderators, and platform administrators appear here.
                        </div>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-lg dark:text-white">Volunteers & Staff Accounts ({filteredUsers.length}/{users.length})</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Community listeners, licensed professionals, moderators, and team leads</p>
                            </div>
                        </div>
                        {/* Search + Filter */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search volunteers & staff..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-base sm:text-sm border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px]"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="px-3 py-2 text-base sm:text-sm border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none min-h-[44px]"
                            >
                                <option value="ALL">All Staff Roles</option>
                                <option value="VOLUNTEER_APPROVED">VOLUNTEER_APPROVED</option>
                                <option value="VOLUNTEER_PENDING">VOLUNTEER_PENDING</option>
                                <option value="MODERATOR">MODERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                    </div>
                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No users match your filters.</div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((u: any) => (
                                <div key={u.id} className="p-4 px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 text-sm shrink-0">
                                            {u.username?.slice(0, 2).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold dark:text-white text-base">{u.username}</span>
                                                <Badge color={roleColor(u.role) as any}>{u.role}</Badge>
                                                {u.status === 'SUSPENDED' && <Badge color="red">SUSPENDED</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                                            Registered: {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown'}
                                        </div>
                                        <UserActionMenu
                                            user={u}
                                            onSuspend={() => handleSuspend(u.id, u.username)}
                                            onReactivate={() => handleReactivate(u.id)}
                                            onRoleChange={(role) => handleRoleChange(u.id, u.username, role)}
                                            onDelete={() => handleDeleteUser(u.id, u.username)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};