import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const applicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  role: z.string().min(1),
  qualification: z.string().min(2),
  experience: z.string().min(10),
  licenseNumber: z.string().optional()
});

// Get current volunteer profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const v = await prisma.volunteerProfile.findUnique({ where: { userId: req.user!.id } });
    if (!v) {
      res.status(404).json({ error: 'Volunteer profile not found' });
      return;
    }
    res.json({
      id: v.id, userId: v.userId, name: v.name, track: v.track,
      photo: v.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=random`,
      role: v.role, qualification: v.qualification, topics: v.topics, location: v.location,
      whatsapp: v.whatsapp, telegram: v.telegram, languages: v.languages,
      isOnline: v.isOnline, verified: v.verified, bio: v.bio,
      impact: { views: v.views, chats: v.chats }
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch your volunteer profile' });
  }
});

// Get all volunteers (public)
router.get('/', async (_req, res) => {
  try {
    const volunteers = await prisma.volunteerProfile.findMany({
      orderBy: { name: 'asc' }
    });
    const mapped = volunteers.map(v => ({
      id: v.id,
      userId: v.userId,
      name: v.name,
      photo: v.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=random`,
      role: v.role,
      qualification: v.qualification,
      topics: v.topics,
      location: v.location,
      whatsapp: v.whatsapp,
      telegram: v.telegram,
      languages: v.languages,
      isOnline: v.isOnline,
      verified: v.verified,
      bio: v.bio,
      impact: { views: v.views, chats: v.chats }
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
});

// Get single volunteer
router.get('/:id', async (req, res) => {
  try {
    const v = await prisma.volunteerProfile.findUnique({ where: { id: req.params.id } });
    if (!v) {
      res.status(404).json({ error: 'Volunteer not found' });
      return;
    }
    // Increment views
    await prisma.volunteerProfile.update({ where: { id: v.id }, data: { views: { increment: 1 } } });
    res.json({
      id: v.id, userId: v.userId, name: v.name,
      photo: v.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(v.name)}&background=random`,
      role: v.role, qualification: v.qualification, topics: v.topics, location: v.location,
      whatsapp: v.whatsapp, telegram: v.telegram, languages: v.languages,
      isOnline: v.isOnline, verified: v.verified, bio: v.bio,
      impact: { views: v.views + 1, chats: v.chats }
    });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch volunteer' });
  }
});

// Submit application (public)
router.post('/apply', validate(applicationSchema), async (req, res) => {
  const { name, email, phone, role, qualification, experience, licenseNumber } = req.body;
  try {
    const app = await prisma.volunteerApplication.create({
      data: { name, email, phone, role, qualification, experience, licenseNumber, status: 'pending' }
    });
    res.json(app);
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;
