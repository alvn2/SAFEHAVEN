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

import { JournalEntry, ForumPost, Volunteer, Article, SafetyPlan, VolunteerApplication, AuditLogEntry, CommunityGroup, Event as AppEvent, Quote, Book, Video } from '../types';
import { INITIAL_FORUM_POSTS, ARTICLES as INITIAL_ARTICLES, BOOKS as INITIAL_BOOKS, VIDEOS as INITIAL_VIDEOS, QUOTES as INITIAL_QUOTES, COMMUNITY_GROUPS, EVENTS as INITIAL_EVENTS, DAILY_POLL } from '../utils/constants';
import { encrypt, decrypt } from './encryption';
import { journalApi, forumApi, chatApi, volunteerApi, safetyApi, adminApi, authApi, communityApi, setToken } from './api';

export const StorageService = {
  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    try { return await adminApi.getAuditLogs(); } catch { return []; }
  },

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

  // --- CHAT ---
  getConversations: async (_uid: string) => {
    try { return await chatApi.getConversations(); } catch { return []; }
  },
  createConversation: (_participants: string[], _type: 'dm'|'group', _name?: string, _avatar?: string) => {
    return { id: 'temp_' + Date.now(), type: 'dm', participants: _participants, lastMessageAt: new Date().toISOString() };
  },
  sendMessage: async (cid: string, sender: { displayName?: string; username?: string }, text: string) => {
    try { return await chatApi.sendMessage(cid, text, sender.displayName || sender.username || 'Anon'); } catch { return null; }
  },
  getMessages: async (cid: string) => {
    try { return await chatApi.getMessages(cid); } catch { return []; }
  },

  // --- JOURNAL (client-side encryption preserved) ---
  getJournalEntries: async (pass: string): Promise<JournalEntry[]> => {
    try {
      const entries = await journalApi.getAll();
      return entries.map((e: any) => ({
        ...e,
        date: e.date || e.createdAt,
        entry: decrypt(e.entry, pass),
        audioData: (e.audioData && pass) ? (decrypt(e.audioData, pass) || e.audioData) : e.audioData
      })).filter((e: any) => e.entry !== '');
    } catch { return []; }
  },

  upsertJournalEntry: async (entry: JournalEntry, pass: string): Promise<JournalEntry[]> => {
    const encryptedEntry = { ...entry, entry: encrypt(entry.entry, pass) };
    if (entry.audioData) encryptedEntry.audioData = encrypt(entry.audioData, pass);
    await journalApi.upsert(encryptedEntry);
    return StorageService.getJournalEntries(pass);
  },

  deleteJournalEntry: async (id: string, pass: string): Promise<JournalEntry[]> => {
    await journalApi.delete(id);
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

  // --- DYNAMIC CONTENT (falling back to constants if unseeded) ---
  getPoll: () => DAILY_POLL,
  votePoll: (_id: string) => DAILY_POLL,

  getCommunityGroups: async (): Promise<CommunityGroup[]> => {
    try { const groups = await communityApi.getGroups(); return groups.length ? groups : COMMUNITY_GROUPS; } catch { return COMMUNITY_GROUPS; }
  },
  getEvents: async (): Promise<AppEvent[]> => {
    try { const events = await communityApi.getEvents(); return events.length ? events : INITIAL_EVENTS; } catch { return INITIAL_EVENTS; }
  },
  getOrganizations: async (): Promise<any[]> => {
    try { const orgs = await communityApi.getOrganizations(); return orgs.length ? orgs : COMMUNITY_GROUPS; } catch { return COMMUNITY_GROUPS; }
  },
  getQuotes: async (): Promise<Quote[]> => {
    try { const quotes = await communityApi.getQuotes(); return quotes.length ? quotes.map((q: any) => ({ ...q, type: 'quote' })) : INITIAL_QUOTES; } catch { return INITIAL_QUOTES; }
  },
  getBooks: async (): Promise<Book[]> => {
    try { const resources = await communityApi.getResources(); const books = resources.filter(r => r.type === 'BOOK'); return books.length ? books.map(r => ({ ...r, type: 'book', cover: r.imageUrl })) : INITIAL_BOOKS; } catch { return INITIAL_BOOKS; }
  },
  getVideos: async (): Promise<Video[]> => {
    try { const resources = await communityApi.getResources(); const vids = resources.filter(r => r.type === 'VIDEO'); return vids.length ? vids.map(r => ({ ...r, type: 'video', thumbnail: r.imageUrl, presenter: r.author })) : INITIAL_VIDEOS; } catch { return INITIAL_VIDEOS; }
  },
};