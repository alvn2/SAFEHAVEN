import express from 'express';
import { prisma } from '../db.js';
import { authenticate, requireAdmin, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

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
    const user = await prisma.user.findUnique({ where: { username: app.name } });
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
    res.json(app);
  } catch (e) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// --- Users ---
router.get('/users', async (_req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// --- Audit Logs ---
router.get('/audit-logs', async (_req: AuthRequest, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
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
      data: { type: 'ARTICLE', title, description: content, category, imageUrl: image || '', readTime: readTime || 5 }
    });
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
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

router.delete('/articles/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.resource.delete({ where: { id: req.params.id } });
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

// --- Stats ---
router.get('/stats', async (_req: AuthRequest, res) => {
  try {
    const [userCount, volunteerCount, postCount, appCount] = await Promise.all([
      prisma.user.count(),
      prisma.volunteerProfile.count(),
      prisma.forumPost.count(),
      prisma.volunteerApplication.count({ where: { status: 'pending' } })
    ]);
    res.json({ userCount, volunteerCount, postCount, pendingApplications: appCount });
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
    if (type === 'event') await prisma.event.update({ where: { id }, data: { status } });
    if (type === 'org') await prisma.organization.update({ where: { id }, data: { status } });
    if (type === 'quote') await prisma.quoteSuggestion.update({ where: { id }, data: { status } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: `Failed to ${action} ${type}` });
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
    if (type === 'event') await prisma.event.update({ where: { id }, data: { status } });
    if (type === 'org') await prisma.organization.update({ where: { id }, data: { status } });
    if (type === 'quote') await prisma.quoteSuggestion.update({ where: { id }, data: { status } });
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
    const app = await prisma.moderatorApplication.update({
      where: { id },
      data: { status }
    });
    // On approval, elevate user to MODERATOR
    if (action === 'approve') {
      await prisma.user.update({ where: { id: app.userId }, data: { role: 'MODERATOR' } });
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
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;