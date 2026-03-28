const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let authToken: string | null = null;

export const setToken = (token: string | null) => { authToken = token; };
export const getToken = () => authToken;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || 'Request failed', body.details);
  }

  // Handle 204 No Content
  if (res.status === 204) return null as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  details?: any;
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// ============================================================
//  AUTH
// ============================================================
export const authApi = {
  register: (username: string, password: string, recoveryKey?: string, agreedToTerms?: boolean, becomePeerListener?: boolean) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, recoveryKey, agreedToTerms, becomePeerListener })
    }),

  login: (username: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }),

  recover: (username: string, recoveryKey: string, newPassword: string) =>
    request<{ token: string; user: any }>('/auth/recover', {
      method: 'POST',
      body: JSON.stringify({ username, recoveryKey, newPassword })
    }),

  me: () => request<any>('/auth/me'),

  nuke: () => request<{ message: string }>('/auth/nuke', { method: 'DELETE' }),

  updateSettings: (settings: { inactivityEnabled: boolean }) =>
    request<any>('/auth/settings', { method: 'PATCH', body: JSON.stringify(settings) }),

  applyModerator: (reason: string) =>
    request<any>('/auth/moderator-apply', { method: 'POST', body: JSON.stringify({ reason }) }),
};

// ============================================================
//  JOURNAL
// ============================================================
export const journalApi = {
  getAll: () => request<any[]>('/journal'),

  upsert: (entry: {
    id?: string; date: string; mood: number; energy: number;
    sleep: number; entry: string; tags: string[]; isDraft?: boolean;
  }) => request<any>('/journal', { method: 'POST', body: JSON.stringify(entry) }),

  delete: (id: string) => request<void>(`/journal/${id}`, { method: 'DELETE' }),
};

// ============================================================
//  COMMUNITY UGC
// ============================================================
export const communityApi = {
  getGroups: () => request<any[]>('/community/groups'),
  getEvents: () => request<any[]>('/community/events'),
  getOrganizations: () => request<any[]>('/community/organizations'),
  getQuotes: () => request<any[]>('/community/quotes'),
  getResources: () => request<any[]>('/community/resources'),

  submitGroup: (data: any) => request<any>('/community/groups', { method: 'POST', body: JSON.stringify(data) }),
  submitEvent: (data: any) => request<any>('/community/events', { method: 'POST', body: JSON.stringify(data) }),
  submitOrg: (data: any) => request<any>('/community/organizations', { method: 'POST', body: JSON.stringify(data) }),
  submitQuote: (data: any) => request<any>('/community/quotes', { method: 'POST', body: JSON.stringify(data) }),
};

// ============================================================
//  FORUM
// ============================================================
export const forumApi = {
  getAll: () => request<any[]>('/forum'),

  create: (post: { title: string; body: string; category: string; author?: string; isTriggering?: boolean }) =>
    request<any>('/forum', { method: 'POST', body: JSON.stringify(post) }),

  getComments: (postId: string) => request<any[]>(`/forum/${postId}/comments`),

  createComment: (postId: string, body: string, parentId?: string) =>
    request<any>(`/forum/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body, parentId })
    }),

  hug: (id: string) => request<any>(`/forum/${id}/hug`, { method: 'POST' }),

  flag: (id: string) => request<any>(`/forum/${id}/flag`, { method: 'POST' }),

  dismiss: (id: string) => request<any>(`/forum/${id}/dismiss`, { method: 'POST' }),

  delete: (id: string) => request<void>(`/forum/${id}`, { method: 'DELETE' }),
};

// ============================================================
//  CHAT
// ============================================================
export const chatApi = {
  getConversations: () => request<any[]>('/chat/conversations'),

  getMessages: (conversationId: string) =>
    request<any[]>(`/chat/${conversationId}/messages`),

  sendMessage: (conversationId: string, content: string, senderName: string) =>
    request<any>(`/chat/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, senderName })
    }),
};

// ============================================================
//  VOLUNTEERS
// ============================================================
export const volunteerApi = {
  getMe: () => request<any>('/volunteers/me'),
  getAll: () => request<any[]>('/volunteers'),

  getById: (id: string) => request<any>(`/volunteers/${id}`),

  apply: (application: {
    name: string; email: string; phone: string; role: string;
    qualification: string; experience: string; licenseNumber?: string;
  }) => request<any>('/volunteers/apply', { method: 'POST', body: JSON.stringify(application) }),

  becomeListener: () => 
    request<{ success: boolean; message: string; token: string }>('/volunteers/become-listener', {
      method: 'POST'
    }),
};

// ============================================================
//  SAFETY PLAN
// ============================================================
export const safetyApi = {
  get: () => request<any | null>('/safety'),

  save: (plan: {
    warningSigns: string; copingStrategies: string; safeContacts: string;
    professionalContacts: string; environmentChanges: string;
  }) => request<any>('/safety', { method: 'PUT', body: JSON.stringify(plan) }),
};

// ============================================================
//  ADMIN
// ============================================================
export const adminApi = {
  getStats: () => request<any>('/admin/stats'),
  getUsers: () => request<any[]>('/admin/users'),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),
  getApplications: () => request<any[]>('/admin/applications'),
  approveApp: (id: string) => request<any>(`/admin/applications/${id}/approve`, { method: 'POST' }),
  rejectApp: (id: string) => request<any>(`/admin/applications/${id}/reject`, { method: 'POST' }),
  getFlaggedPosts: () => request<any[]>('/admin/flagged-posts'),
  getArticles: () => request<any[]>('/admin/articles'),
  createArticle: (data: any) => request<any>('/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: string, data: any) => request<any>(`/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: string) => request<void>(`/admin/articles/${id}`, { method: 'DELETE' }),
  getPendingUGC: () => request<any>('/admin/ugc/pending'),
  moderateUGC: (type: 'group' | 'event' | 'org' | 'quote', id: string, action: 'approve' | 'reject') => 
    request<any>(`/admin/ugc/${type}/${id}/${action}`, { method: 'POST' }),

  getModApplications: () => request<any[]>('/admin/mod-applications'),
  moderateModApp: (id: string, action: 'approve' | 'reject') =>
    request<any>(`/admin/mod-applications/${id}/${action}`, { method: 'POST' }),

  getSystemSettings: () => request<any>('/admin/system-settings'),
  updateSystemSettings: (data: { modApplicationsOpen: boolean }) =>
    request<any>('/admin/system-settings', { method: 'POST', body: JSON.stringify(data) }),
};
