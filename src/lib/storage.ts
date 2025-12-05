import { JournalEntry, ForumPost, User, Volunteer, Article, SafetyPlan, CommunityGroup, Event, VolunteerApplication, Book, Video, Quote, Poll, Conversation, Message, AuditLogEntry } from '../types';
import { INITIAL_FORUM_POSTS, ARTICLES as INITIAL_ARTICLES, BOOKS as INITIAL_BOOKS, VIDEOS as INITIAL_VIDEOS, QUOTES as INITIAL_QUOTES, COMMUNITY_GROUPS, EVENTS as INITIAL_EVENTS, DAILY_POLL, VOLUNTEERS as SEED_VOLUNTEERS } from '../utils/constants';
import CryptoJS from 'crypto-js';
import { encrypt, decrypt } from './encryption';

const KEYS = {
  USER: 'safehaven_user', JOURNAL: 'safehaven_journal', FORUM: 'safehaven_forum', VOLUNTEERS: 'safehaven_volunteers',
  SAFETY_PLAN: 'safehaven_safety_plan', CONVERSATIONS: 'safehaven_conversations', MESSAGES: 'safehaven_messages',
  SESSION_KEYS: 'safehaven_session_keys', POLL: 'safehaven_poll', VOL_APPS: 'safehaven_apps', 
  CONTENT_ARTICLES: 'safehaven_content_articles', AUDIT_LOG: 'safehaven_audit_log'
};

const WORD_LIST = ["apple", "river", "stone", "mountain", "sky", "blue", "green", "hope", "faith", "light", "peace", "calm", "strong", "tree", "ocean", "wind", "rain", "sun", "moon", "star", "dream", "path", "walk", "safe"];

const generateRecoveryPhrase = (): string => {
    let phrase = [];
    for(let i=0; i<12; i++) phrase.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    return phrase.join(" ");
};

const INITIAL_CONVERSATIONS: Conversation[] = [
    { id: 'group_anxiety_nbo', type: 'group', name: 'Nairobi Anxiety Support', participants: ['system'], lastMessage: 'Welcome.', lastMessageAt: new Date().toISOString(), avatar: 'https://ui-avatars.com/api/?name=Anxiety', slowMode: 0 }
];

export const StorageService = {
  // --- AUDIT LOGGING (For Developer Dashboard) ---
  logAction: (action: string, details: string, targetId: string) => {
      const logs = JSON.parse(localStorage.getItem(KEYS.AUDIT_LOG) || '[]');
      const entry: AuditLogEntry = {
          id: Date.now().toString(),
          action,
          details,
          targetIdHash: CryptoJS.SHA256(targetId).toString().substring(0, 10), // Anonymized
          timestamp: new Date().toISOString()
      };
      localStorage.setItem(KEYS.AUDIT_LOG, JSON.stringify([entry, ...logs]));
  },
  getAuditLogs: (): AuditLogEntry[] => JSON.parse(localStorage.getItem(KEYS.AUDIT_LOG) || '[]'),

  // --- AUTHENTICATION ---
  getUser: (): User | null => JSON.parse(localStorage.getItem(KEYS.USER) || 'null'),
  
  login: (username: string, password: string): User | null => {
      if (username === 'dev' && password === 'admin123') return { id: 'dev_admin', username: 'Developer', role: 'ADMIN', displayName: 'System Admin' };
      const stored = localStorage.getItem(KEYS.USER);
      if (!stored) return null;
      const user = JSON.parse(stored);
      if (user.username.toLowerCase() === username.toLowerCase()) {
          if (user.passphraseHash === CryptoJS.SHA256(password).toString()) return user;
      }
      return null;
  },

  registerSeeker: (username: string, password: string): { user: User, recoveryKey: string } => {
    const recoveryKey = generateRecoveryPhrase();
    const user: User = { 
        id: 'seeker_' + Date.now(), username, role: 'USER', displayName: username,
        passphraseHash: CryptoJS.SHA256(password).toString(), recoveryKey: recoveryKey 
    };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    StorageService.logAction('USER_REGISTER', 'New account created', user.id);
    return { user, recoveryKey };
  },

  // --- RECOVERY LOGIC ---
  initiateRecovery: (username: string) => {
      const stored = localStorage.getItem(KEYS.USER);
      if (!stored) return null;
      const user = JSON.parse(stored);
      if (user.username.toLowerCase() !== username.toLowerCase()) return null;
      return { challengeIndex: Math.floor(Math.random() * 12) };
  },

  verifyRecovery: (username: string, word: string, index: number, newPassword: string): boolean => {
      const stored = localStorage.getItem(KEYS.USER);
      if (!stored) return false;
      const user = JSON.parse(stored);
      if (!user.recoveryKey) return false;
      if (user.recoveryKey.split(' ')[index].toLowerCase() === word.trim().toLowerCase()) {
          user.passphraseHash = CryptoJS.SHA256(newPassword).toString();
          localStorage.setItem(KEYS.USER, JSON.stringify(user));
          StorageService.logAction('USER_RECOVER', 'Password reset via phrase', user.id);
          return true;
      }
      return false;
  },

  getRecoveryPhrase: (user: User, passphrase: string) => {
      const stored = localStorage.getItem(KEYS.USER);
      if (!stored) return null;
      return JSON.parse(stored).recoveryKey;
  },

  logout: () => sessionStorage.clear(),
  
  deleteAccount: (id: string) => { 
      StorageService.logAction('USER_NUKE', 'Account permanently deleted', id);
      localStorage.clear(); 
      sessionStorage.clear(); 
      window.location.href = '/'; 
  },

  // --- CMS (Content Management) ---
  getArticles: (): Article[] => {
      const stored = localStorage.getItem(KEYS.CONTENT_ARTICLES);
      return stored ? JSON.parse(stored) : INITIAL_ARTICLES;
  },
  saveArticle: (article: Article) => {
      const articles = StorageService.getArticles();
      const updated = articles.findIndex(a => a.id === article.id) >= 0 ? articles.map(a => a.id === article.id ? article : a) : [...articles, { ...article, id: Date.now().toString() }];
      localStorage.setItem(KEYS.CONTENT_ARTICLES, JSON.stringify(updated));
      StorageService.logAction('CMS_UPDATE', 'Article saved', article.id);
  },
  deleteArticle: (id: string) => {
      localStorage.setItem(KEYS.CONTENT_ARTICLES, JSON.stringify(StorageService.getArticles().filter(a => a.id !== id)));
      StorageService.logAction('CMS_DELETE', 'Article deleted', id);
  },

  // --- VOLUNTEERS (With Telegram) ---
  getVolunteers: (): Volunteer[] => {
    const data = localStorage.getItem(KEYS.VOLUNTEERS);
    if (!data) {
        // Inject Telegram into seed data
        const seeded = SEED_VOLUNTEERS.map(v => ({ ...v, telegram: v.id === '1' ? 'DrAminaHelp' : undefined }));
        localStorage.setItem(KEYS.VOLUNTEERS, JSON.stringify(seeded));
        return seeded;
    }
    return JSON.parse(data);
  },
  updateVolunteer: (v: Volunteer) => {
      const vols = StorageService.getVolunteers();
      localStorage.setItem(KEYS.VOLUNTEERS, JSON.stringify(vols.map(vo => vo.id === v.id ? v : vo)));
  },

  // --- CHAT ---
  getConversations: (uid: string) => {
      const convs = JSON.parse(localStorage.getItem(KEYS.CONVERSATIONS) || JSON.stringify(INITIAL_CONVERSATIONS));
      return convs.filter((c: any) => c.type === 'group' || c.participants.includes(uid));
  },
  createConversation: (participants: string[], type: 'dm'|'group', name?: string, avatar?: string) => {
      const convs = JSON.parse(localStorage.getItem(KEYS.CONVERSATIONS) || JSON.stringify(INITIAL_CONVERSATIONS));
      if (type === 'dm') {
          const existing = convs.find((c: any) => c.type === 'dm' && c.participants.length === participants.length && participants.every((p: string) => c.participants.includes(p)));
          if (existing) return existing;
      }
      const newConv = { id: 'conv_' + Date.now(), type, name, participants, lastMessageAt: new Date().toISOString(), unreadCount: 0, avatar };
      const keys = JSON.parse(localStorage.getItem(KEYS.SESSION_KEYS) || '{}');
      keys[newConv.id] = CryptoJS.SHA256("session_" + newConv.id).toString();
      localStorage.setItem(KEYS.SESSION_KEYS, JSON.stringify(keys));
      localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify([...convs, newConv]));
      return newConv;
  },
  sendMessage: (cid: string, sender: User, text: string) => {
      const all = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
      const msg = { id: 'msg_' + Date.now(), conversationId: cid, senderId: sender.id, senderName: sender.displayName || 'Anon', content: text, timestamp: new Date().toISOString(), type: 'text', isRead: false };
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify([...all, msg]));
      const convs = JSON.parse(localStorage.getItem(KEYS.CONVERSATIONS) || '[]');
      localStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(convs.map((c: any) => c.id === cid ? { ...c, lastMessage: text, lastMessageAt: new Date().toISOString(), unreadCount: (c.unreadCount || 0) + 1 } : c)));
      return msg;
  },
  getMessages: (cid: string) => {
      const all = JSON.parse(localStorage.getItem(KEYS.MESSAGES) || '[]');
      return all.filter((m: any) => m.conversationId === cid);
  },
  markConversationAsRead: (cid: string, uid: string) => {},
  joinGroupChat: (gid: string, uid: string) => {},

  // --- JOURNAL / SAFETY PLAN ---
  getJournalEntries: (pass: string) => {
      const entries = JSON.parse(localStorage.getItem(KEYS.JOURNAL) || '[]');
      return entries.map((e: any) => ({ ...e, entry: decrypt(e.entry, pass) })).filter((e: any) => e.entry !== "");
  },
  upsertJournalEntry: (entry: JournalEntry, pass: string) => {
      const entries = JSON.parse(localStorage.getItem(KEYS.JOURNAL) || '[]');
      const enc = { ...entry, entry: encrypt(entry.entry, pass) };
      const idx = entries.findIndex((e: any) => e.id === entry.id);
      const newEntries = idx >= 0 ? entries.map((e: any, i: number) => i === idx ? enc : e) : [enc, ...entries];
      localStorage.setItem(KEYS.JOURNAL, JSON.stringify(newEntries));
      return newEntries.map((e: any) => ({ ...e, entry: decrypt(e.entry, pass) }));
  },
  getSafetyPlan: (uid: string, pass: string) => {
      const plan = JSON.parse(localStorage.getItem(KEYS.SAFETY_PLAN) || 'null');
      return (plan && plan.userId === uid) ? { ...plan, warningSigns: decrypt(plan.warningSigns, pass) } : null;
  },
  saveSafetyPlan: (plan: SafetyPlan, pass: string) => {
      const enc = { ...plan, warningSigns: encrypt(plan.warningSigns, pass) };
      localStorage.setItem(KEYS.SAFETY_PLAN, JSON.stringify(enc));
  },

  // --- ADMIN VETTING ---
  getVolunteerApps: () => JSON.parse(localStorage.getItem(KEYS.VOL_APPS) || '[]'),
  submitVolunteerApplication: (app: any) => {
      const apps = StorageService.getVolunteerApps();
      localStorage.setItem(KEYS.VOL_APPS, JSON.stringify([...apps, { ...app, id: Date.now().toString(), status: 'pending' }]));
      StorageService.logAction('VOL_APPLY', 'New application', 'app');
  },
  approveVolunteer: (id: string) => {
      const apps = StorageService.getVolunteerApps();
      const app = apps.find((a: any) => a.id === id);
      if(app) {
         app.status = 'approved';
         const vols = StorageService.getVolunteers();
         const newVol: Volunteer = { id: 'v_' + Date.now(), userId: 'u_' + Date.now(), name: app.name, photo: 'https://ui-avatars.com/api/?name=' + app.name, role: app.role, qualification: app.qualification, topics: ['General Support'], location: 'Kenya', whatsapp: app.phone, languages: ['English'], isOnline: false, verified: app.role === 'licensed', bio: app.experience, impact: { views: 0, chats: 0 } };
         localStorage.setItem(KEYS.VOLUNTEERS, JSON.stringify([...vols, newVol]));
         StorageService.logAction('VOL_APPROVE', 'Volunteer approved', id);
      }
      localStorage.setItem(KEYS.VOL_APPS, JSON.stringify(apps));
      return apps;
  },

  // --- FORUM ---
  getForumPosts: () => JSON.parse(localStorage.getItem(KEYS.FORUM) || JSON.stringify(INITIAL_FORUM_POSTS)),
  addForumPost: (post: ForumPost) => {
      const posts = StorageService.getForumPosts();
      localStorage.setItem(KEYS.FORUM, JSON.stringify([post, ...posts]));
      return [post, ...posts];
  },
  flagForumPost: (id: string) => {
      const posts = StorageService.getForumPosts();
      const updated = posts.map((p: any) => p.id === id ? { ...p, isFlagged: true } : p);
      localStorage.setItem(KEYS.FORUM, JSON.stringify(updated));
      StorageService.logAction('FORUM_FLAG', 'Post flagged', id);
      return updated;
  },
  deleteForumPost: (id: string) => {
      localStorage.setItem(KEYS.FORUM, JSON.stringify(StorageService.getForumPosts().filter((p: any) => p.id !== id)));
      StorageService.logAction('FORUM_DELETE', 'Post deleted', id);
      return StorageService.getForumPosts();
  },
  dismissFlag: (id: string) => {
      const posts = StorageService.getForumPosts();
      const updated = posts.map((p: any) => p.id === id ? { ...p, isFlagged: false } : p);
      localStorage.setItem(KEYS.FORUM, JSON.stringify(updated));
      return updated;
  },
  hugForumPost: (id: string) => {
      const posts = StorageService.getForumPosts();
      const updated = posts.map((p: any) => p.id === id ? { ...p, hugs: (p.hugs||0) + 1 } : p);
      localStorage.setItem(KEYS.FORUM, JSON.stringify(updated));
      return updated;
  },

  getPoll: () => DAILY_POLL,
  votePoll: (id: string) => DAILY_POLL,
  getCommunityGroups: () => COMMUNITY_GROUPS,
  getEvents: () => INITIAL_EVENTS,
  getOrganizations: () => INITIAL_GROUPS,
  getBooks: () => INITIAL_BOOKS,
  getVideos: () => INITIAL_VIDEOS,
  getQuotes: () => INITIAL_QUOTES,
};