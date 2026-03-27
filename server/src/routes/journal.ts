import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const journalSchema = z.object({
  id: z.string().optional(),
  date: z.string(),
  mood: z.number().min(1).max(10),
  energy: z.number().min(1).max(10),
  sleep: z.number().min(1).max(10),
  entry: z.string(), // Already encrypted by client
  tags: z.array(z.string()).default([]),
  isDraft: z.boolean().default(false)
});

// Get all entries for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' }
    });
    res.json(entries);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch journal' });
  }
});

// Upsert entry
router.post('/', authenticate, validate(journalSchema), async (req: AuthRequest, res) => {
  const { id, date, mood, energy, sleep, entry, tags, isDraft } = req.body;
  try {
    const result = await prisma.journalEntry.upsert({
      where: { id: id || 'new-entry-placeholder' },
      update: { mood, energy, sleep, entry, tags, isDraft, date: new Date(date) },
      create: {
        userId: req.user!.id,
        date: new Date(date),
        mood, energy, sleep, entry, tags, isDraft
      }
    });
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// Delete entry
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, userId: req.user!.id }
    });
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }
    await prisma.journalEntry.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;