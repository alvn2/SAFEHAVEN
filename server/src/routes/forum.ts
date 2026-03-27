import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const forumPostSchema = z.object({
  title: z.string().min(3).max(200),
  body: z.string().min(10).max(5000),
  category: z.string().min(1),
  author: z.string().default('Anonymous'),
  isTriggering: z.boolean().default(false)
});

// Get all posts (public)
router.get('/', async (_req, res) => {
  try {
    const posts = await prisma.forumPost.findMany({
      where: { isFlagged: false },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(posts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load forum' });
  }
});

// Create post
router.post('/', authenticate, validate(forumPostSchema), async (req: AuthRequest, res) => {
  const { title, body, category, isTriggering, author } = req.body;
  try {
    const post = await prisma.forumPost.create({
      data: { title, body, category, isTriggering, author, createdAt: new Date() }
    });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: 'Failed to post' });
  }
});

// Hug a post
router.post('/:id/hug', async (req, res) => {
  try {
    const post = await prisma.forumPost.update({
      where: { id: req.params.id },
      data: { hugs: { increment: 1 } }
    });
    res.json(post);
  } catch (e) {
    res.status(500).json({ error: 'Failed to hug post' });
  }
});

// Flag a post
router.post('/:id/flag', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.forumPost.update({
      where: { id: req.params.id },
      data: { isFlagged: true }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to flag post' });
  }
});

// Dismiss flag (admin)
router.post('/:id/dismiss', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.forumPost.update({
      where: { id: req.params.id },
      data: { isFlagged: false }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to dismiss flag' });
  }
});

// Delete post (admin)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.forumPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;