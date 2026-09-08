import express from 'express';
import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, getJwtSecret, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// --- Schemas ---
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(128),
  recoveryKey: z.string().optional(),
  agreedToTerms: z.boolean().optional(),
  becomePeerListener: z.boolean().optional()
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

const recoverSchema = z.object({
  username: z.string().min(1),
  recoveryKey: z.string().min(1),
  newPassword: z.string().min(6)
});

// --- Helpers ---
const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, getJwtSecret(), { expiresIn: '7d' });

// --- Recover ---
router.post('/recover', validate(recoverSchema), async (req, res) => {
  const { username, recoveryKey, newPassword } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.recoveryKey) {
      res.status(401).json({ error: 'Invalid username or recovery key' });
      return;
    }

    const cleanInputKey = recoveryKey.trim().toLowerCase();
    const isMatch = await bcrypt.compare(cleanInputKey, user.recoveryKey).catch(() => false)
      || (user.recoveryKey === cleanInputKey || user.recoveryKey === recoveryKey); // backward-compatible check

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username or recovery key' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passphraseHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { passphraseHash }
    });

    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ error: 'Recovery failed' });
  }
});

// --- Register ---
router.post('/register', validate(registerSchema), async (req, res) => {
  const { username, password, recoveryKey, agreedToTerms, becomePeerListener } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(400).json({ error: 'Username taken' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passphraseHash = await bcrypt.hash(password, salt);
    // Hash recovery key with bcrypt for zero-knowledge storage
    const hashedRecoveryKey = recoveryKey 
      ? await bcrypt.hash(recoveryKey.trim().toLowerCase(), 12) 
      : null;

    let user = await prisma.user.create({
      data: { 
        username, 
        passphraseHash, 
        recoveryKey: hashedRecoveryKey, 
        role: 'USER',
        agreedToTerms: agreedToTerms || false
      }
    });

    if (becomePeerListener) {
      await prisma.volunteerProfile.create({
         data: {
             userId: user.id,
             name: username,
             role: 'listener',
             track: 'PEER_LISTENER',
             verified: false, // Must be verified by admin before public listing
             bio: 'I am here to listen and support.',
             qualification: 'Peer Listener (Pending Review)',
             topics: ['General Support'],
             languages: ['English'],
             location: 'Remote',
             whatsapp: ''
         }
      });
      // Set role to VOLUNTEER_PENDING (requires admin approval)
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'VOLUNTEER_PENDING' }
      });
      user.role = 'VOLUNTEER_PENDING';
    }

    const token = signToken(user.id, user.role);

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// --- Login ---
router.post('/login', validate(loginSchema), async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passphraseHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Account Inactivity Logic
    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Account suspended due to inactivity or policy violation.' });
      return;
    }

    if (user.role !== 'ADMIN' && user.inactivityEnabled && user.lastActive) {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      if (user.lastActive < ninetyDaysAgo) {
        await prisma.user.update({ where: { id: user.id }, data: { status: 'SUSPENDED' } });
        res.status(403).json({ error: 'Account suspended due to 90 days of inactivity.' });
        return;
      }
    }

    // Update lastActive
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Get Current User (validate token) ---
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, username: true, role: true, createdAt: true, inactivityEnabled: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    // Check if user has a volunteer profile
    const volunteerProfile = await prisma.volunteerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, track: true }
    });
    res.json({ ...user, hasVolunteerProfile: !!volunteerProfile });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// --- Kill Switch (Nuke) ---
router.delete('/nuke', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  try {
    // 1. Delete messages sent by user
    await prisma.message.deleteMany({ where: { senderId: userId } });

    // 2. Find conversations user participated in
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true }
    });
    const convIds = participations.map(p => p.conversationId);

    // Remove user from conversation participants
    await prisma.conversationParticipant.deleteMany({ where: { userId } });

    // Prune any conversations that now have no participants left
    for (const convId of convIds) {
      const remaining = await prisma.conversationParticipant.count({ where: { conversationId: convId } });
      if (remaining === 0) {
        await prisma.message.deleteMany({ where: { conversationId: convId } });
        await prisma.conversation.delete({ where: { id: convId } });
      }
    }

    // 3. Delete quote suggestions submitted by user
    await prisma.quoteSuggestion.deleteMany({ where: { submittedById: userId } });

    // 4. Delete moderator applications
    await prisma.moderatorApplication.deleteMany({ where: { userId } });

    // 5. Delete community groups and events created by user
    await prisma.communityGroup.deleteMany({ where: { ownerId: userId } });
    await prisma.event.deleteMany({ where: { creatorId: userId } });

    // 6. Delete journals and safety plan
    await prisma.journalEntry.deleteMany({ where: { userId } });
    await prisma.safetyPlan.deleteMany({ where: { userId } });

    // 7. Delete volunteer profile if exists
    await prisma.volunteerProfile.deleteMany({ where: { userId } });

    // 8. Finally delete the user account
    await prisma.user.delete({ where: { id: userId } });

    res.json({ message: 'Account and all associated records permanently purged.' });
  } catch (error) {
    console.error('Nuke execution failed:', error);
    res.status(500).json({ error: 'Nuke failed' });
  }
});
// --- Account Settings (inactivity toggle) ---
router.patch('/settings', authenticate, async (req: AuthRequest, res) => {
  const { inactivityEnabled } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { inactivityEnabled: !!inactivityEnabled },
      select: { id: true, username: true, role: true, inactivityEnabled: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Moderator Application (user-facing) ---
router.post('/moderator-apply', authenticate, async (req: AuthRequest, res) => {
  const { reason } = req.body;
  if (!reason || reason.length < 10) {
    res.status(400).json({ error: 'Please provide a reason with at least 10 characters.' });
    return;
  }
  try {
    // Check for existing pending application
    const existing = await prisma.moderatorApplication.findFirst({
      where: { userId: req.user!.id, status: 'PENDING' }
    });
    if (existing) {
      res.status(409).json({ error: 'You already have a pending application.' });
      return;
    }
    const app = await prisma.moderatorApplication.create({
      data: { userId: req.user!.id, reason, status: 'PENDING' }
    });
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;