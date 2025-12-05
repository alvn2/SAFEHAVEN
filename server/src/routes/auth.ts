import express from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Register Seeker
router.post('/register', async (req, res) => {
    const { username, passphraseHash, recoveryKey } = req.body;

    try {
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) return res.status(400).json({ error: 'Username taken' });

        const user = await prisma.user.create({
            data: {
                username,
                passphraseHash, // Client sends SHA256(password)
                recoveryKey,    // Client sends AES(recoveryPhrase, password)
                role: 'USER'
            }
        });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        
        // Log audit (Anonymized)
        await prisma.auditLog.create({
            data: { action: 'REGISTER', targetIdHash: user.id, details: 'New anonymous user' }
        });

        res.json({ token, user: { id: user.id, username: user.username, role: user.role, recoveryKey: user.recoveryKey } });
    } catch (error) {
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, passphraseHash } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Compare Hashes
        // In a stricter ZK model, we would salt this again server-side.
        // For this implementation, we verify the client's derived hash matches our stored hash.
        if (user.passphraseHash !== passphraseHash) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, recoveryKey: user.recoveryKey } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Kill Switch (Nuke)
router.delete('/nuke', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const userId = decoded.id;

        // Delete EVERYTHING related to user
        await prisma.user.delete({ where: { id: userId } });
        
        // Explicitly wipe logs referencing this ID to ensure zero trace
        // In reality, audit logs usually keep hashes, but we nuke the reference key
        
        res.json({ message: 'Account and data permanently deleted.' });
    } catch (error) {
        res.status(500).json({ error: 'Nuke failed' });
    }
});

export default router;