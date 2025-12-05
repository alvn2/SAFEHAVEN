import express from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get Entries
router.get('/', authenticate, async (req: AuthRequest, res) => {
    try {
        const entries = await prisma.journalEntry.findMany({
            where: { userId: req.user.id },
            orderBy: { date: 'desc' }
        });
        res.json(entries);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch journal' });
    }
});

// Sync Entry (Upsert)
router.post('/', authenticate, async (req: AuthRequest, res) => {
    const { id, date, mood, energy, sleep, entry, tags, isDraft } = req.body;
    try {
        const result = await prisma.journalEntry.upsert({
            where: { id: id || 'new' }, // If ID exists, update. Else create.
            update: { mood, energy, sleep, entry, tags, isDraft },
            create: {
                userId: req.user.id,
                date, mood, energy, sleep, entry, tags, isDraft
            }
        });
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: 'Failed to save entry' });
    }
});

export default router;