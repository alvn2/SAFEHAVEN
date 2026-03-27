import express from 'express';
import { prisma } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// --- Schemas ---
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(128),
  recoveryKey: z.string().optional()
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

// --- Helpers ---
const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

// --- Register ---
router.post('/register', validate(registerSchema), async (req, res) => {
  const { username, password, recoveryKey } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(400).json({ error: 'Username taken' });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passphraseHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { username, passphraseHash, recoveryKey, role: 'USER' }
    });

    const token = signToken(user.id, user.role);

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, recoveryKey: user.recoveryKey }
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

    const token = signToken(user.id, user.role);
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, recoveryKey: user.recoveryKey }
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
      select: { id: true, username: true, role: true, recoveryKey: true, createdAt: true }
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// --- Kill Switch (Nuke) ---
router.delete('/nuke', authenticate, async (req: AuthRequest, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json({ message: 'Account and data permanently deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Nuke failed' });
  }
});

export default router;