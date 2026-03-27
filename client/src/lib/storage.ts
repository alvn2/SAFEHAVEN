/**
 * StorageService — Bridge between frontend components and backend API.
 * 
 * This replaces the old localStorage-based mock. All methods now call the
 * real backend via api.ts. Journal/SafetyPlan encryption happens HERE
 * (client-side, before sending to server) to maintain zero-knowledge.
 * 
 * Static seed data (books, videos, quotes, community groups, events, poll)
 * remain client-side constants since they don't have backend models.
 */

import { JournalEntry, ForumPost, User, Volunteer, Article, SafetyPlan, VolunteerApplication, AuditLogEntry } from '../types';
import { INITIAL_FORUM_POSTS, ARTICLES as INITIAL_ARTICLES, BOOKS as INITIAL_BOOKS, VIDEOS as INITIAL_VIDEOS, QUOTES as INITIAL_QUOTES, COMMUNITY_GROUPS, EVENTS as INITIAL_EVENTS, DAILY_POLL } from '../utils/constants';
import CryptoJS from 'crypto-js';
import { encrypt, decrypt } from './encryption';
import { journalApi, forumApi, chatApi, volunteerApi, safetyApi, adminApi, authApi, setToken } from './api';

export const StorageService = {
  // --- AUDIT LOGGING (now via admin API) ---
  logAction: (_action: string, _details: string, _targetId: string) => {
    // Audit logging now happens server-side automatically
  },
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    try { return await adminApi.getAuditLogs(); } catch { return []; }
  },

  // --- AUTHENTICATION (delegated to AuthContext, kept for backward compat) ---
  getUser: (): User | null => null, // Now handled by AuthContext
  login: (_username: string, _password: string): User | null => null, // Now handled by AuthContext
  registerSeeker: (_username: string, _password: string): { user: User, recoveryKey: string } => {
    throw new Error('Use AuthContext.registerSeeker() instead');
  },
  initiateRecovery: (_username: string) => null,
  verifyRecovery: (_username: string, _word: string, _index: number, _newPassword: string) => false,
  getRecoveryPhrase: (_user: User, _passphrase: string) => null,

  logout: () => {
    setToken(null);
    sessionStorage.clear();
  },

  deleteAccount: async (_id: string) => {
    try {
      await authApi.nuke();
    } catch { /* ignore */ }
    setToken(null);
    sessionStorage.clear();
    window.location.href = '/';
  },

  // --- CMS (Articles from backend for admins, fallback to constants for public) ---
  getArticles: async (): Promise<Article[]> => {
    try {
      const articles = await adminApi.getArticles();
      return articles.map((a: any) => ({ ...a, type: 'article' as const }));
    } catch {
      return INITIAL_ARTICLES;
    }
  },
  saveArticle: async (article: Article) => {
    if (article.id && !article.id.startsWith('temp_')) {
      await adminApi.updateArticle(article.id, article);
    } else {
      await adminApi.createArticle(article);
    }
  },
  deleteArticle: async (id: string) => {
    await adminApi.deleteArticle(id);
  },

  // --- VOLUNTEERS ---
  getVolunteers: async (): Promise<Volunteer[]> => {
    try { return await volunteerApi.getAll(); } catch { return []; }
  },
  updateVolunteer: (_v: Volunteer) => {
    // Volunteer updates happen through admin panel in backend
  },

  // --- CHAT ---
  getConversations: async (uid: string) => {
    try { return await chatApi.getConversations(); } catch { return []; }
  },
  createConversation: (_participants: string[], _type: 'dm'|'group', _name?: string, _avatar?: string) => {
    // TODO: Not yet implemented on backend — would need a POST /chat/conversations endpoint
    return { id: 'temp_' + Date.now(), type: 'dm', participants: _participants, lastMessageAt: new Date().toISOString() };
  },
  sendMessage: async (cid: string, sender: User, text: string) => {
    try { return await chatApi.sendMessage(cid, text, sender.displayName || sender.username || 'Anon'); } catch { return null; }
  },
  getMessages: async (cid: string) => {
    try { return await chatApi.getMessages(cid); } catch { return []; }
  },
  markConversationAsRead: (_cid: string, _uid: string) => {},
  joinGroupChat: (_gid: string, _uid: string) => {},

  // --- JOURNAL (client-side encryption preserved) ---
  getJournalEntries: async (pass: string): Promise<JournalEntry[]> => {
    try {
      const entries = await journalApi.getAll();
      return entries.map((e: any) => ({
        ...e,
        date: e.date || e.createdAt,
        entry: decrypt(e.entry, pass)
      })).filter((e: any) => e.entry !== '');
    } catch { return []; }
  },

  upsertJournalEntry: async (entry: JournalEntry, pass: string): Promise<JournalEntry[]> => {
    const encryptedEntry = { ...entry, entry: encrypt(entry.entry, pass) };
    await journalApi.upsert(encryptedEntry);
    return StorageService.getJournalEntries(pass);
  },

  getSafetyPlan: async (uid: string, pass: string): Promise<SafetyPlan | null> => {
    try {
      const plan = await safetyApi.get();
      if (!plan) return null;
      return {
        ...plan,
        warningSigns: decrypt(plan.warningSigns, pass),
        copingStrategies: decrypt(plan.copingStrategies, pass),
        safeContacts: decrypt(plan.safeContacts, pass),
        professionalContacts: decrypt(plan.professionalContacts, pass),
        environmentChanges: decrypt(plan.environmentChanges, pass)
      };
    } catch { return null; }
  },

  saveSafetyPlan: async (plan: SafetyPlan, pass: string) => {
    await safetyApi.save({
      warningSigns: encrypt(plan.warningSigns, pass),
      copingStrategies: encrypt(plan.copingStrategies, pass),
      safeContacts: encrypt(plan.safeContacts, pass),
      professionalContacts: encrypt(plan.professionalContacts, pass),
      environmentChanges: encrypt(plan.environmentChanges, pass)
    });
  },

  // --- ADMIN VETTING ---
  getVolunteerApps: async (): Promise<VolunteerApplication[]> => {
    try { return await adminApi.getApplications(); } catch { return []; }
  },
  submitVolunteerApplication: async (app: any) => {
    await volunteerApi.apply(app);
  },
  approveVolunteer: async (id: string) => {
    await adminApi.approveApp(id);
    return StorageService.getVolunteerApps();
  },

  // --- FORUM ---
  getForumPosts: async (): Promise<ForumPost[]> => {
    try {
      const posts = await forumApi.getAll();
      return posts.map((p: any) => ({ ...p, date: p.createdAt }));
    } catch { return INITIAL_FORUM_POSTS; }
  },
  addForumPost: async (post: ForumPost): Promise<ForumPost[]> => {
    await forumApi.create({ title: post.title, body: post.body, category: post.category, author: post.author, isTriggering: post.isTriggering });
    return StorageService.getForumPosts();
  },
  flagForumPost: async (id: string): Promise<ForumPost[]> => {
    await forumApi.flag(id);
    return StorageService.getForumPosts();
  },
  deleteForumPost: async (id: string): Promise<ForumPost[]> => {
    await forumApi.delete(id);
    return StorageService.getForumPosts();
  },
  dismissFlag: async (id: string): Promise<ForumPost[]> => {
    await forumApi.dismiss(id);
    return StorageService.getForumPosts();
  },
  hugForumPost: async (id: string): Promise<ForumPost[]> => {
    await forumApi.hug(id);
    return StorageService.getForumPosts();
  },

  // --- STATIC DATA (no backend models, stay as constants) ---
  getPoll: () => DAILY_POLL,
  votePoll: (_id: string) => DAILY_POLL,
  getCommunityGroups: () => COMMUNITY_GROUPS,
  getEvents: () => INITIAL_EVENTS,
  getOrganizations: () => COMMUNITY_GROUPS,
  getBooks: () => INITIAL_BOOKS,
  getVideos: () => INITIAL_VIDEOS,
  getQuotes: () => INITIAL_QUOTES,
};