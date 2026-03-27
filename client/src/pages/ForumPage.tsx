import React, { useState, useEffect, useContext } from 'react';
import { forumApi } from '../lib/api';
import { AuthContext } from '../context/AuthContext';
import { CRISIS_KEYWORDS } from '../utils/constants';
import { Card, Button, Input, Badge, Modal } from '../components/ui';
import { Plus, MessageCircle, Heart, Flag, X, EyeOff, AlertTriangle, CornerDownRight, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Nested Comment Component ---
const CommentNode: React.FC<{ comment: any; postId: string; onReplyAdded: () => void }> = ({ comment, postId, onReplyAdded }) => {
    const { user } = useContext(AuthContext);
    const [showReply, setShowReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReply = async () => {
        if (!replyText.trim() || submitting) return;
        setSubmitting(true);
        try {
            await forumApi.createComment(postId, replyText.trim(), comment.id);
            setReplyText('');
            setShowReply(false);
            onReplyAdded();
        } catch { /* ignore */ }
        setSubmitting(false);
    };

    return (
        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 mt-3">
            <div className="flex items-start gap-2">
                <CornerDownRight className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <span className="font-bold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{comment.author}</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{comment.body}</p>
                    {user && (
                        <button onClick={() => setShowReply(!showReply)} className="text-xs text-primary-500 hover:text-primary-700 font-medium">
                            Reply
                        </button>
                    )}
                    {showReply && (
                        <div className="flex gap-2 mt-2">
                            <input
                                className="flex-1 text-sm px-3 py-1.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="Write a reply..."
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSubmitReply()}
                            />
                            <Button size="sm" onClick={handleSubmitReply} isLoading={submitting}><Send className="w-3 h-3" /></Button>
                        </div>
                    )}
                    {comment.children?.map((child: any) => (
                        <CommentNode key={child.id} comment={child} postId={postId} onReplyAdded={onReplyAdded} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ForumPage = () => {
    const { user } = useContext(AuthContext);
    const [posts, setPosts] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', body: '', category: 'General', isTriggering: false });
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const navigate = useNavigate();

    // Comment/reply state per post
    const [expandedPost, setExpandedPost] = useState<string | null>(null);
    const [comments, setComments] = useState<Record<string, any[]>>({});
    const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
    const [replySubmitting, setReplySubmitting] = useState<string | null>(null);

    const loadPosts = () => {
        forumApi.getAll().then(setPosts).catch(() => setPosts([]));
    };

    useEffect(() => { loadPosts(); }, []);

    const loadComments = async (postId: string) => {
        try {
            const c = await forumApi.getComments(postId);
            setComments(prev => ({ ...prev, [postId]: c }));
        } catch { /* ignore */ }
    };

    const toggleComments = (postId: string) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            loadComments(postId);
        }
    };

    const handleSubmitTopLevelReply = async (postId: string) => {
        const text = replyTexts[postId]?.trim();
        if (!text) return;
        setReplySubmitting(postId);
        try {
            await forumApi.createComment(postId, text);
            setReplyTexts(prev => ({ ...prev, [postId]: '' }));
            loadComments(postId);
        } catch { /* ignore */ }
        setReplySubmitting(null);
    };

    const checkForCrisisKeywords = (text: string) => {
        return CRISIS_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.title.trim() || !newPost.body.trim()) return;
        if (checkForCrisisKeywords(newPost.title) || checkForCrisisKeywords(newPost.body)) {
            setShowCrisisAlert(true);
            return;
        }
        submitPost(false, newPost.isTriggering);
    };

    const submitPost = async (forceFlagged: boolean, forceTriggering: boolean) => {
        try {
            await forumApi.create({
                title: newPost.title,
                body: newPost.body,
                category: newPost.category,
                isTriggering: forceTriggering,
                author: 'Anonymous'
            });
            loadPosts();
        } catch { /* ignore */ }
        setNewPost({ title: '', body: '', category: 'General', isTriggering: false });
        setIsCreating(false);
        setShowCrisisAlert(false);
    };

    const handleReport = async (postId: string) => {
        if (confirm("Are you sure you want to report this post as inappropriate?")) {
            await forumApi.flag(postId);
            loadPosts();
        }
    };

    const handleHug = async (postId: string) => {
        await forumApi.hug(postId);
        loadPosts();
    };

    return (
        <div className="space-y-8">
            <Modal isOpen={showCrisisAlert} onClose={() => setShowCrisisAlert(false)} title="Safety Check">
                <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl flex gap-3">
                        <AlertTriangle className="w-8 h-8 text-orange-600 shrink-0" />
                        <div>
                            <h4 className="font-bold text-lg text-orange-800 dark:text-orange-300">We noticed you might be going through a tough time.</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-400 mt-2">Your post contains words that indicate you might be in distress. You are not alone.</p>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Would you like to speak to a volunteer or get immediate help instead of posting?</p>
                    <div className="flex flex-col gap-3">
                        <Button onClick={() => navigate('/')} className="w-full bg-green-600 hover:bg-green-700">Get Immediate Help (Home)</Button>
                        <Button variant="secondary" onClick={() => submitPost(true, true)} className="w-full">No, post anyway (Mark as Sensitive)</Button>
                    </div>
                </div>
            </Modal>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-serif dark:text-white">Peer Support</h1>
                    <p className="text-gray-500">Share your story safely and anonymously.</p>
                </div>
                {!isCreating && user && (
                    <Button onClick={() => setIsCreating(true)} className="gap-2">
                        <Plus className="w-5 h-5" /> New Post
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="p-6 border-2 border-primary-100 dark:border-primary-900 animate-fade-in-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg dark:text-white">Create New Post</h3>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input placeholder="Title" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} required />
                            <select className="w-full px-4 py-2.5 border rounded-xl bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600" value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})}>
                                <option value="General">General</option>
                                <option value="Anxiety & Stress">Anxiety & Stress</option>
                                <option value="Depression">Depression</option>
                                <option value="Success Stories">Success Stories</option>
                                <option value="Relationships">Relationships</option>
                            </select>
                        </div>
                        <textarea className="w-full h-32 px-4 py-3 border rounded-xl bg-white dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Share your thoughts..." value={newPost.body} onChange={e => setNewPost({...newPost, body: e.target.value})} required />
                        <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <input type="checkbox" checked={newPost.isTriggering} onChange={e => setNewPost({...newPost, isTriggering: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <div className="flex-1">
                                <span className="block font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"><EyeOff className="w-4 h-4" /> Add Trigger Warning</span>
                                <span className="block text-xs text-gray-500">Content will be blurred until clicked.</span>
                            </div>
                        </label>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button type="submit">Post Anonymously</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="space-y-4">
                {posts.length === 0 && <div className="text-center py-20 text-gray-400">No posts yet. Be the first to share.</div>}
                {posts.map(post => (
                    <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm bg-gray-100 dark:bg-gray-800 dark:text-gray-300 px-2 py-1 rounded-lg">{post.author}</span>
                                <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <Badge color="blue">{post.category}</Badge>
                        </div>
                        <h3 className="font-bold text-xl mb-2 dark:text-white">{post.title}</h3>
                        <p className={`text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap ${post.isTriggering ? 'blur-sm hover:blur-none transition-all cursor-pointer select-none' : ''}`} title={post.isTriggering ? "Click to reveal content" : ""}>{post.body}</p>
                        {post.isTriggering && <p className="text-xs text-red-500 mb-4 italic font-medium -mt-2">⚠️ Trigger Warning: Blur active</p>}

                        <div className="flex gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <button onClick={() => handleHug(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-pink-500 transition-colors text-sm font-medium group">
                                <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" /> {post.hugs} Hugs
                            </button>
                            <button onClick={() => toggleComments(post.id)} className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-sm font-medium group">
                                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" /> Reply
                            </button>
                            <button
                                onClick={() => !post.isFlagged && handleReport(post.id)}
                                className={`flex items-center gap-1.5 ml-auto text-xs group transition-colors ${post.isFlagged ? 'text-red-500 cursor-default' : 'text-gray-400 hover:text-red-500'}`}
                                disabled={post.isFlagged}
                            >
                                <Flag className={`w-3 h-3 ${!post.isFlagged && 'group-hover:scale-110 transition-transform'}`} fill={post.isFlagged ? "currentColor" : "none"} />
                                {post.isFlagged ? 'Reported' : 'Report'}
                            </button>
                        </div>

                        {/* Threaded Comments Section */}
                        {expandedPost === post.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                {/* Top-level reply input — always visible */}
                                <div className="flex gap-2 mb-4">
                                    {user ? (
                                        <>
                                            <input
                                                className="flex-1 px-3 py-2 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                                placeholder="Write a comment..."
                                                value={replyTexts[post.id] || ''}
                                                onChange={e => setReplyTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                onKeyDown={e => e.key === 'Enter' && handleSubmitTopLevelReply(post.id)}
                                            />
                                            <Button size="sm" onClick={() => handleSubmitTopLevelReply(post.id)} isLoading={replySubmitting === post.id}>
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <button onClick={() => navigate('/auth')} className="w-full text-center py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                                            Log in to reply
                                        </button>
                                    )}
                                </div>
                                {/* Comment tree */}
                                {(comments[post.id] || []).length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm py-4">No comments yet.</p>
                                ) : (
                                    (comments[post.id] || []).map((c: any) => (
                                        <CommentNode key={c.id} comment={c} postId={post.id} onReplyAdded={() => loadComments(post.id)} />
                                    ))
                                )}
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};