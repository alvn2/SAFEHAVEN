import React, { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { StorageService } from '../lib/storage';
import { Conversation, Message } from '../types';
import { CRISIS_KEYWORDS } from '../utils/constants';
import { Card, Button, Modal } from '../components/ui';
import { Send, Hash, MessageSquare, AlertTriangle, Search, Lock, MoreVertical, Shield, Pin, Check, CheckCheck, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');

export const ChatPage = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    
    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const [filter, setFilter] = useState<'all' | 'dm' | 'group'>('all');
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [lastSentTime, setLastSentTime] = useState<number>(0);
    const [slowModeLeft, setSlowModeLeft] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (!user) return;
        const loadChats = async () => {
            const convs = await StorageService.getConversations(user.id);
            setConversations(convs);
        };
        loadChats();
        const interval = setInterval(loadChats, 5000); 
        
        const params = new URLSearchParams(location.search);
        const initialChatId = params.get('id');
        if (initialChatId && !selectedChatId) setSelectedChatId(initialChatId);
        return () => clearInterval(interval);
    }, [user, location, selectedChatId]);

    // Message WebSocket
    useEffect(() => {
        if (!selectedChatId || !user) return;
        
        StorageService.markConversationAsRead(selectedChatId, user.id);
        
        const loadMessages = async () => {
            const msgs = await StorageService.getMessages(selectedChatId);
            setMessages(msgs);
        };
        loadMessages();

        // Join WebSocket Room
        socket.emit('join_room', selectedChatId);

        const handleNewMessage = (msg: Message) => {
            setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            StorageService.markConversationAsRead(selectedChatId, user.id);
        };

        const handleTyping = (username: string) => {
            if (username !== user.username) {
                setTypingUser(`${username} is typing...`);
                setTimeout(() => setTypingUser(null), 3000);
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        
        return () => {
            socket.emit('leave_room', selectedChatId);
            socket.off('receive_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
        };
    }, [selectedChatId, user]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUser]);

    // Slow Mode
    useEffect(() => {
        if (slowModeLeft > 0) {
            const timer = setInterval(() => setSlowModeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [slowModeLeft]);

    const handleTypingStart = () => {
        if (selectedChatId && user) {
            socket.emit('typing', { conversationId: selectedChatId, username: user.username || user.id });
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !user || !selectedChatId) return;

        const chat = conversations.find(c => c.id === selectedChatId);
        if (chat?.slowMode) {
            const now = Date.now();
            if ((now - lastSentTime) / 1000 < chat.slowMode) return;
            setLastSentTime(now);
            setSlowModeLeft(chat.slowMode);
        }

        if (CRISIS_KEYWORDS.some(k => newMessage.toLowerCase().includes(k.toLowerCase()))) {
            setShowCrisisAlert(true);
            return;
        }

        const msg = await StorageService.sendMessage(selectedChatId, user, newMessage);
        socket.emit('send_message', { conversationId: selectedChatId, message: msg });
        
        setNewMessage('');
    };

    const selectedChat = conversations.find(c => c.id === selectedChatId);
    const filteredConversations = conversations.filter(c => filter === 'all' || c.type === filter);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
             <Modal isOpen={showCrisisAlert} onClose={() => setShowCrisisAlert(false)} title="Safety Check">
                <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl flex gap-3 text-orange-800 dark:text-orange-300">
                        <AlertTriangle className="w-8 h-8 shrink-0" />
                        <div><h4 className="font-bold text-lg">Are you safe?</h4><p className="text-sm mt-2">Your message contains distressing words.</p></div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button className="w-full bg-red-600 hover:bg-red-700">Get Immediate Help</Button>
                        <Button variant="secondary" onClick={async () => { setShowCrisisAlert(false); await StorageService.sendMessage(selectedChatId!, user!, newMessage); setNewMessage(''); }}>Send Anyway</Button>
                    </div>
                </div>
            </Modal>

            <Card className={`flex-col w-full md:w-80 h-full overflow-hidden ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-xl font-serif dark:text-white">Messages</h2><Shield className="w-4 h-4 text-green-500" /></div>
                    <div className="flex gap-2">
                        {['all', 'dm', 'group'].map(f => (
                            <button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize ${filter === f ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 dark:text-gray-300'}`}>{f}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? <div className="p-8 text-center text-gray-400 text-sm">No conversations.</div> : filteredConversations.map(chat => (
                        <button key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`w-full p-4 flex items-start gap-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-left relative ${selectedChatId === chat.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${chat.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{chat.avatar ? <img src={chat.avatar} className="w-full h-full rounded-full object-cover"/> : (chat.type === 'group' ? <Hash size={20}/> : <MessageSquare size={20}/>)}</div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1"><h3 className="font-bold text-sm truncate dark:text-white">{chat.name}</h3>{chat.lastMessageAt && <span className="text-[10px] text-gray-400">{new Date(chat.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}</div>
                                <div className="flex items-center gap-1 text-xs text-gray-500"><span className="truncate">{chat.lastMessage || 'Start conversation'}</span></div>
                            </div>
                            {chat.unreadCount && chat.unreadCount > 0 ? <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unreadCount}</span> : null}
                        </button>
                    ))}
                </div>
            </Card>

            <Card className={`flex-col flex-1 h-full overflow-hidden relative ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2 -ml-2 text-gray-500"><Search className="w-5 h-5"/></button>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${selectedChat.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{selectedChat.avatar ? <img src={selectedChat.avatar} className="w-full h-full rounded-full object-cover"/> : <MessageSquare size={20}/>}</div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">{selectedChat.name}{selectedChat.type === 'dm' && <Lock className="w-3 h-3 text-green-500" />}</h3>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">{selectedChat.type === 'group' ? `${selectedChat.participants.length} participants • Encrypted` : 'Private End-to-End Encrypted'}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm"><MoreVertical className="w-5 h-5" /></Button>
                        </div>
                        {selectedChat.pinnedMessageId && <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 px-4 flex items-center gap-2 border-b border-yellow-100 dark:border-yellow-900/30 text-sm text-yellow-800 dark:text-yellow-200"><Pin className="w-3 h-3 fill-current" /><span className="font-bold">Pinned:</span><span>Welcome to the group!</span></div>}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                            {messages.map(msg => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm relative group ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'}`}>
                                            {!isMe && selectedChat.type === 'group' && <p className="text-[10px] font-bold opacity-70 mb-1">{msg.senderName}</p>}
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            <div className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${isMe ? 'text-primary-200' : 'text-gray-400'}`}><span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>{isMe && (msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            {typingUser && <div className="flex justify-start"><div className="bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs px-3 py-1.5 rounded-full animate-pulse">{typingUser}</div></div>}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <div className="relative flex-1">
                                <input className="w-full bg-gray-100 dark:bg-gray-900 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-950 rounded-xl px-4 py-3 outline-none transition-all dark:text-white" placeholder={slowModeLeft > 0 ? `Wait ${slowModeLeft}s...` : "Type a secure message..."} value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={slowModeLeft > 0} />
                                {slowModeLeft > 0 && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center gap-1 text-xs"><Clock className="w-3 h-3" /> {slowModeLeft}s</div>}
                            </div>
                            <Button type="submit" className="w-12 h-12 rounded-xl flex items-center justify-center" disabled={slowModeLeft > 0}><Send className="w-5 h-5 ml-0.5" /></Button>
                        </form>
                    </>
                ) : <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center"><Lock className="w-12 h-12 mb-4 opacity-50" /><h3 className="text-xl font-bold">Secure Messaging</h3><p>End-to-End Encrypted. Select a chat to begin.</p></div>}
            </Card>
        </div>
    );
};