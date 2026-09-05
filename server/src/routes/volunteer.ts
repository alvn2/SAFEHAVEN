import express from 'express';
import { prisma } from '../db.js';
import { authenticate, getJwtSecret, type AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import jwt from 'jsonwebtoken';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

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

// Become a peer listener (requires verification before listing)
router.post('/become-listener', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    
    // Check if already a volunteer
    const existing = await prisma.volunteerProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
        res.status(400).json({ error: 'Already a volunteer' });
        return;
    }

    await prisma.volunteerProfile.create({
         data: {
             userId: user.id,
             name: user.username,
             role: 'listener',
             track: 'PEER_LISTENER',
             verified: false,
             bio: 'I am here to listen and support.',
             qualification: 'Peer Listener',
             topics: ['General Support'],
             languages: ['English'],
             location: 'Remote',
             whatsapp: ''
         }
    }); 
    
    if (user.role === 'USER') {
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'VOLUNTEER_PENDING' }
        });
    }

    invalidateCache('/api/volunteers');
    const token = jwt.sign({ id: user.id, role: 'VOLUNTEER_PENDING' }, getJwtSecret(), { expiresIn: '7d' });
    res.json({ success: true, message: 'Your peer listener application has been submitted and is pending verification.', token });
  } catch (e) {
    res.status(500).json({ error: 'Failed to become peer listener' });
  }
});

// Get all volunteers (public - cached for 30s with 60s stale-while-revalidate, verified only)
router.get('/', cacheMiddleware(30, 60), async (_req, res) => {
  try {
    const volunteers = await prisma.volunteerProfile.findMany({
      where: { verified: true },
      orderBy: { name: 'asc' }
    });
    const mapped = volunteers.map((v: any) => ({
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
