import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get Conversations
router.get('/conversations', authenticate, async (req: AuthRequest, res) => {
    try {
        const participations = await prisma.conversationParticipant.findMany({
            where: { userId: req.user?.id },
            include: { conversation: true },
            orderBy: { conversation: { lastMessageAt: 'desc' } }
        });
        
        const conversations = participations.map(p => ({
            ...p.conversation,
            unreadCount: p.hasUnread ? 1 : 0
        }));
        
        res.json(conversations);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get Messages
router.get('/:id/messages', authenticate, async (req: AuthRequest, res) => {
    try {
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId: req.user?.id!,
                    conversationId: req.params.id
                }
            }
        });

        if (!participant) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        // Mark as read
        await prisma.conversationParticipant.update({
            where: {
                userId_conversationId: {
                    userId: req.user?.id!,
                    conversationId: req.params.id
                }
            },
            data: { hasUnread: false }
        });

        const messages = await prisma.message.findMany({
            where: { conversationId: req.params.id },
            orderBy: { createdAt: 'asc' },
            take: 100
        });
        
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Send Message
router.post('/:id/messages', authenticate, async (req: AuthRequest, res) => {
    const { content, senderName } = req.body;
    
    if (!content) {
        res.status(400).json({ error: 'Content required' });
        return;
    }

    try {
        const message = await prisma.message.create({
            data: {
                conversationId: req.params.id,
                senderId: req.user?.id!,
                senderName: senderName || 'Anonymous',
                content, 
                createdAt: new Date()
            }
        });

        await prisma.conversation.update({
            where: { id: req.params.id },
            data: {
                lastMessage: 'New Message', 
                lastMessageAt: new Date()
            }
        });

        // Mark unread for others
        await prisma.conversationParticipant.updateMany({
            where: {
                conversationId: req.params.id,
                userId: { not: req.user?.id }
            },
            data: { hasUnread: true }
        });

        res.json(message);
    } catch (e) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;