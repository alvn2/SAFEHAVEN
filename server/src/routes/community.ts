import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.post('/groups', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, link, platform, category, safetyRating } = req.body;
    const group = await prisma.communityGroup.create({
      data: { name, description, link, platform, category, safetyRating, status: 'PENDING', ownerId: req.user!.id }
    });
    res.json(group);
  } catch (e) { res.status(500).json({ error: 'Failed to submit group' }); }
});

router.post('/events', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, date, location, link, organizer } = req.body;
    const event = await prisma.event.create({
      data: { title, description, date: new Date(date), location, link, organizer, status: 'PENDING', creatorId: req.user!.id }
    });
    res.json(event);
  } catch (e) { res.status(500).json({ error: 'Failed to submit event' }); }
});

router.post('/organizations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, link, category } = req.body;
    const org = await prisma.organization.create({
      data: { name, description, link, category, status: 'PENDING' }
    });
    res.json(org);
  } catch (e) { res.status(500).json({ error: 'Failed to submit org' }); }
});

router.post('/quotes', authenticate, async (req: AuthRequest, res) => {
  try {
    const { text, author } = req.body;
    const quote = await prisma.quoteSuggestion.create({
      data: { text, author, status: 'PENDING', submittedById: req.user!.id }
    });
    res.json(quote);
  } catch (e) { res.status(500).json({ error: 'Failed to submit quote' }); }
});

router.get('/groups', async (_req, res) => {
  try {
    const groups = await prisma.communityGroup.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(groups);
  } catch (e) { res.status(500).json({ error: 'DB Error' }); }
});

router.get('/events', async (_req, res) => {
  try {
    const events = await prisma.event.findMany({ 
      where: { status: 'APPROVED' },
      orderBy: { date: 'asc' } 
    });
    res.json(events);
  } catch (e) { res.status(500).json({ error: 'DB Error' }); }
});

router.get('/organizations', async (_req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orgs);
  } catch (e) { res.status(500).json({ error: 'DB Error' }); }
});

router.get('/quotes', async (_req, res) => {
  try {
    const quotes = await prisma.quoteSuggestion.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (e) { res.status(500).json({ error: 'DB Error' }); }
});

router.get('/resources', async (_req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (e) { res.status(500).json({ error: 'DB Error' }); }
});

export default router;
