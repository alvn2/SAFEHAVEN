import React, { useState } from 'react';
import { StorageService } from '../lib/storage';
import { VolunteerApplication, ForumPost } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { ShieldCheck, Flag, Check, Trash2, Eye } from 'lucide-react';

export const AdminDashboard = () => {
    const [apps, setApps] = useState<VolunteerApplication[]>(StorageService.getVolunteerApps());
    const [posts, setPosts] = useState<ForumPost[]>(StorageService.getForumPosts());
    const [activeTab, setActiveTab] = useState<'volunteers' | 'moderation'>('volunteers');
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const pendingApps = apps.filter(a => a.status === 'pending');
    const flaggedPosts = posts.filter(p => p.isFlagged);

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setApps(StorageService.approveVolunteer(id));
        setApprovingId(null);
    };

    const handleDeletePost = (id: string) => {
        if (confirm("Are you sure you want to permanently delete this post?")) {
            setPosts(StorageService.deleteForumPost(id));
        }
    };

    const handleDismissFlag = (id: string) => {
        setPosts(StorageService.dismissFlag(id));
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
                    <Flag className="w-4 h-4" /> Flagged Content ({flaggedPosts.length})
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
        </div>
    );
};