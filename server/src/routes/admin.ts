import express from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

const shortHash = (id: string, len: number = 8) =>
  crypto.createHash('sha256').update(id).digest('hex').substring(0, len);

// Anonymized audit log entry without exposing plaintext usernames
const audit = async (adminId: string, action: string, details: string, rawTargetId?: string) => {
  try {
    const targetIdHash = rawTargetId ? shortHash(rawTargetId, 16) : '';
    const adminHash = adminId ? shortHash(adminId, 8) : 'system';

    await prisma.auditLog.create({
      data: {
        action,
        details: `[Admin: #${adminHash}] ${details}`,
        targetIdHash,
        timestamp: new Date()
      }
    });
  } catch { /* audit failure must never block admin actions */ }
};

// --- Volunteer Applications ---
router.get('/applications', async (_req: AuthRequest, res) => {
  try {
    const apps = await prisma.volunteerApplication.findMany({
      orderBy: { submittedAt: 'desc' }
    });
    res.json(apps);
  } catch (e) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/applications/:id/approve', async (req: AuthRequest, res) => {
  try {
    const app = await prisma.volunteerApplication.update({
      where: { id: req.params.id },
      data: { status: 'approved' }
    });

    // Provision User Profile
    const user = await prisma.user.findFirst({ where: { username: app.name } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'VOLUNTEER_APPROVED' } });
      const track = app.role.toLowerCase() === 'listener' ? 'PEER_LISTENER' : 'PROFESSIONAL';
      await prisma.volunteerProfile.upsert({
        where: { userId: user.id },
        update: { verified: true, track, qualification: app.qualification },
        create: {
          userId: user.id,
          name: app.name,
          role: app.role as any,
          track,
          verified: true,
          bio: `Approved SafeHaven ${app.role}`,
          qualification: app.qualification,
          topics: ['General Support'],
          languages: ['English'],
          location: 'Remote',
          whatsapp: app.phone || ''
        }
      });
    }

    await audit(req.user!.id, 'VOLUNTEER_APPROVED', `Approved volunteer application: ${app.name} (${app.email})`, app.id);
    res.json(app);
  } catch (e) {
    res.status(500).json({ error: 'Approval failed' });
  }
});

router.post('/applications/:id/reject', async (req: AuthRequest, res) => {
  try {
    const app = await prisma.volunteerApplication.update({
      where: { id: req.params.id },
      data: { status: 'rejected' }
    });
    await audit(req.user!.id, 'VOLUNTEER_REJECTED', `Rejected volunteer application: ${app.name} (${app.email})`, app.id);
    res.json(app);
  } catch (e) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// --- Volunteers & Staff (Seekers are completely excluded to protect zero-knowledge anonymity) ---
router.get('/users', async (_req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { not: 'USER' }
      },
      select: { id: true, username: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.patch('/users/:id/suspend', async (req: AuthRequest, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) { res.status(404).json({ error: 'User not found' }); return; }
    if (target.role === 'ADMIN') { res.status(403).json({ error: 'Cannot suspend admin accounts' }); return; }
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'SUSPENDED' } });
    await audit(req.user!.id, 'USER_SUSPENDED', `Suspended user [ref: #${shortHash(target.id)}]`, target.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

router.patch('/users/:id/reactivate', async (req: AuthRequest, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) { res.status(404).json({ error: 'User not found' }); return; }
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'ACTIVE' } });
    await audit(req.user!.id, 'USER_REACTIVATED', `Reactivated user [ref: #${shortHash(target.id)}]`, target.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

router.patch('/users/:id/role', async (req: AuthRequest, res) => {
  const { role } = req.body;
  const ALLOWED_ROLES = ['USER', 'VOLUNTEER_PENDING', 'VOLUNTEER_APPROVED', 'MODERATOR'];
  if (!ALLOWED_ROLES.includes(role)) {
    res.status(400).json({ error: 'Invalid role. Cannot promote to ADMIN via this panel.' });
    return;
  }
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) { res.status(404).json({ error: 'User not found' }); return; }
    if (target.role === 'ADMIN') { res.status(403).json({ error: 'Cannot change role of admin accounts' }); return; }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, username: true, role: true, status: true, createdAt: true }
    });
    await audit(req.user!.id, 'USER_ROLE_CHANGED', `Changed role for user [ref: #${shortHash(target.id)}]: ${target.role} → ${role}`, target.id);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to change role' });
  }
});

router.delete('/users/:id', async (req: AuthRequest, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) { res.status(404).json({ error: 'User not found' }); return; }
    if (target.role === 'ADMIN') { res.status(403).json({ error: 'Cannot delete admin accounts' }); return; }
    await prisma.user.delete({ where: { id: req.params.id } });
    await audit(req.user!.id, 'USER_DELETED', `Deleted user account [ref: #${shortHash(target.id)}]`, target.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// --- Audit Logs ---
router.get('/audit-logs', async (_req: AuthRequest, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 200
    });
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// --- Articles CRUD ---
router.get('/articles', async (_req: AuthRequest, res) => {
  try {
    const articles = await prisma.resource.findMany({
      where: { type: 'ARTICLE' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(articles);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.post('/articles', async (req: AuthRequest, res) => {
  const { title, content, category, image, readTime } = req.body;
  try {
    const article = await prisma.resource.create({
      data: { type: 'ARTICLE', title, description: content, category, imageUrl: image || '', readTime: readTime || 5, status: 'APPROVED' }
    });
    await audit(req.user!.id, 'RESOURCE_CREATED', `Published resource: "${title}" [${category}]`, article.id);
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create article' });
  }
});

router.put('/articles/:id', async (req: AuthRequest, res) => {
  const { title, content, category, image, readTime } = req.body;
  try {
    const article = await prisma.resource.update({
      where: { id: req.params.id },
      data: { title, description: content, category, imageUrl: image, readTime }
    });
    await audit(req.user!.id, 'RESOURCE_UPDATED', `Updated resource: "${title}" [${category}]`, article.id);
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

router.delete('/articles/:id', async (req: AuthRequest, res) => {
  try {
    const article = await prisma.resource.findUnique({ where: { id: req.params.id } });
    await prisma.resource.delete({ where: { id: req.params.id } });
    await audit(req.user!.id, 'RESOURCE_DELETED', `Deleted resource: "${article?.title || req.params.id}"`, req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// --- Flagged Forum Posts ---
router.get('/flagged-posts', async (_req: AuthRequest, res) => {
  try {
    const posts = await prisma.forumPost.findMany({
      where: { isFlagged: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch flagged posts' });
  }
});

// All forum posts (for proactive moderation view)
router.get('/all-posts', async (req: AuthRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
  try {
    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.forumPost.count()
    ]);
    res.json({ posts, total, page, limit });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// --- Stats ---
router.get('/stats', async (_req: AuthRequest, res) => {
  try {
    const [userCount, volunteerCount, postCount, appCount, resourceCount, logCount] = await Promise.all([
      prisma.user.count(),
      prisma.volunteerProfile.count({ where: { verified: true } }),
      prisma.forumPost.count(),
      prisma.volunteerApplication.count({ where: { status: 'pending' } }),
      prisma.resource.count(),
      prisma.auditLog.count()
    ]);
    const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
    res.json({ userCount, volunteerCount, postCount, pendingApplications: appCount, resourceCount, auditLogCount: logCount, lastAction: lastLog?.timestamp || null });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- UGC Moderation ---
router.get('/ugc/pending', async (_req: AuthRequest, res) => {
  try {
    const [groups, events, orgs, quotes] = await Promise.all([
      prisma.communityGroup.findMany({ where: { status: 'PENDING' } }),
      prisma.event.findMany({ where: { status: 'PENDING' } }),
      prisma.organization.findMany({ where: { status: 'PENDING' } }),
      prisma.quoteSuggestion.findMany({ where: { status: 'PENDING' } })
    ]);
    res.json({ groups, events, orgs, quotes });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch UGC queue' });
  }
});

router.post('/ugc/:type/:id/:action', async (req: AuthRequest, res) => {
  const { type, id, action } = req.params;
  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

  try {
    if (type === 'group') await prisma.communityGroup.update({ where: { id }, data: { status } });
    else if (type === 'event') await prisma.event.update({ where: { id }, data: { status } });
    else if (type === 'org') await prisma.organization.update({ where: { id }, data: { status } });
    else if (type === 'quote') await prisma.quoteSuggestion.update({ where: { id }, data: { status } });
    else { res.status(400).json({ error: 'Unknown UGC type' }); return; }
    await audit(req.user!.id, 'UGC_MODERATED', `${action.toUpperCase()} ${type} (id: ${id})`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: `Failed to ${action} ${type}` });
  }
});

// --- Moderator Application Review ---
router.get('/mod-applications', async (_req: AuthRequest, res) => {
  try {
    const apps = await prisma.moderatorApplication.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true, role: true, createdAt: true } } }
    });
    res.json(apps);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch mod applications' });
  }
});

router.post('/mod-applications/:id/:action', async (req: AuthRequest, res) => {
  const { id, action } = req.params;
  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
  try {
    const app = await prisma.moderatorApplication.update({ where: { id }, data: { status } });
    if (action === 'approve') {
      const user = await prisma.user.update({ where: { id: app.userId }, data: { role: 'MODERATOR' },
        select: { username: true } });
      await audit(req.user!.id, 'MOD_APP_APPROVED', `Approved moderator application for ${user.username}`, app.userId);
    } else {
      await audit(req.user!.id, 'MOD_APP_REJECTED', `Rejected moderator application (userId: ${app.userId})`, app.userId);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: `Failed to ${action} moderator application` });
  }
});

// --- System Settings (toggle mod applications open/closed) ---
router.get('/system-settings', async (_req: AuthRequest, res) => {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'mod_applications_open' } });
    res.json({ modApplicationsOpen: setting?.value === 'true' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/system-settings', async (req: AuthRequest, res) => {
  const { modApplicationsOpen } = req.body;
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'mod_applications_open' },
      update: { value: String(modApplicationsOpen) },
      create: { key: 'mod_applications_open', value: String(modApplicationsOpen) }
    });
    await audit(req.user!.id, 'SETTINGS_CHANGED', `Moderator applications set to: ${modApplicationsOpen ? 'OPEN' : 'CLOSED'}`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;