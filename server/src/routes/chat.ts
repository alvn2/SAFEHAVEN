import express from 'express';
import { prisma } from '../db.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Create or retrieve a conversation with a volunteer
router.post('/conversations', authenticate, async (req: AuthRequest, res) => {
    const { volunteerId } = req.body;
    if (!volunteerId) {
        res.status(400).json({ error: 'volunteerId is required' });
        return;
    }
    try {
        // Validate volunteer exists and is verified (support either profile ID or user ID)
        const volunteerProfile = await prisma.volunteerProfile.findFirst({
            where: {
                OR: [
                    { id: volunteerId },
                    { userId: volunteerId }
                ]
            }
        });
        if (!volunteerProfile || !volunteerProfile.verified) {
            res.status(404).json({ error: 'Volunteer not found or not verified' });
            return;
        }

        // Check if a conversation already exists between these two users
        const existing = await prisma.conversationParticipant.findFirst({
            where: {
                userId: req.user!.id,
                conversation: {
                    participants: {
                        some: { userId: volunteerProfile.userId }
                    }
                }
            },
            include: { conversation: true }
        });

        if (existing) {
            res.json(existing.conversation);
            return;
        }

        // Create new conversation + participants
        const conversation = await prisma.conversation.create({
            data: {
                type: 'dm',
                lastMessage: '',
                lastMessageAt: new Date(),
                participants: {
                    create: [
                        { userId: req.user!.id, hasUnread: false },
                        { userId: volunteerProfile.userId, hasUnread: true }
                    ]
                }
            }
        });

        res.json(conversation);
    } catch (e) {
        res.status(500).json({ error: 'Failed to create conversation' });
    }
});

// Get Conversations
router.get('/conversations', authenticate, async (req: AuthRequest, res) => {
    try {
        const participations = await prisma.conversationParticipant.findMany({
            where: { userId: req.user?.id },
            include: { conversation: true },
            orderBy: { conversation: { lastMessageAt: 'desc' } }
        });
        
        const conversations = participations.map((p: any) => ({
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
    const { content } = req.body;
    
    if (!content) {
        res.status(400).json({ error: 'Content required' });
        return;
    }

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
            res.status(403).json({ error: 'Access denied: You are not a participant in this conversation.' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            select: { username: true, role: true }
        });

        const senderName = user?.username || (req.user?.role === 'VOLUNTEER' ? 'Peer Listener' : 'Anonymous');

        const message = await prisma.message.create({
            data: {
                conversationId: req.params.id,
                senderId: req.user?.id!,
                senderName,
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