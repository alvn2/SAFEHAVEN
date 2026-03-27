import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get safety plan for the current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const plan = await prisma.safetyPlan.findUnique({
      where: { userId: req.user!.id }
    });
    res.json(plan); // null if none exists, client decrypts fields
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch safety plan' });
  }
});

// Upsert safety plan
router.put('/', authenticate, async (req: AuthRequest, res) => {
  const { warningSigns, copingStrategies, safeContacts, professionalContacts, environmentChanges } = req.body;
  try {
    const plan = await prisma.safetyPlan.upsert({
      where: { userId: req.user!.id },
      update: { warningSigns, copingStrategies, safeContacts, professionalContacts, environmentChanges },
      create: {
        userId: req.user!.id,
        warningSigns: warningSigns || '',
        copingStrategies: copingStrategies || '',
        safeContacts: safeContacts || '',
        professionalContacts: professionalContacts || '',
        environmentChanges: environmentChanges || ''
      }
    });
    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save safety plan' });
  }
});

export default router;
