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
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(articles);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

router.post('/articles', async (req: AuthRequest, res) => {
  const { title, content, category, image, readTime } = req.body;
  try {
    const article = await prisma.article.create({
      data: { title, content, category, image: image || '', readTime: readTime || 5 }
    });
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create article' });
  }
});

router.put('/articles/:id', async (req: AuthRequest, res) => {
  const { title, content, category, image, readTime } = req.body;
  try {
    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { title, content, category, image, readTime }
    });
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

router.delete('/articles/:id', async (req: AuthRequest, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } });
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

export default router;