import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import type { Request, Response, NextFunction } from 'express';

import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
import chatRoutes from './routes/chat.js';
import forumRoutes from './routes/forum.js';
import adminRoutes from './routes/admin.js';
import volunteerRoutes from './routes/volunteer.js';
import safetyRoutes from './routes/safety.js';
import communityRoutes from './routes/community.js';

import { generalRateLimiter, authRateLimiter } from './middleware/rateLimit.js';
import { idempotency } from './middleware/idempotency.js';
import { errorHandler } from './middleware/errorHandler.js';
import { formatErrorResponse } from './utils/errors.js';
import { startPruningScheduler } from './jobs/pruneOldChats.js';
import { getJwtSecret } from './middleware/auth.js';
import { prisma } from './db.js';
import jwt from 'jsonwebtoken';

dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

const app = express();
// Enable reverse proxy support for Render/Cloudflare so req.ip reads X-Forwarded-For
app.set('trust proxy', 1);
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO Authentication Middleware (Zero-Trust)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || 
    (socket.handshake.headers['authorization']?.startsWith('Bearer ') 
      ? socket.handshake.headers['authorization'].substring(7) 
      : null);

  if (!token) {
    return next(new Error('Authentication required for real-time crisis chat.'));
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string };
    socket.data.user = decoded;
    next();
  } catch {
    return next(new Error('Invalid authentication token for real-time chat.'));
  }
});

io.on('connection', (socket) => {
  const user = socket.data.user;

  socket.on('join_room', async (roomId: string) => {
    if (!roomId || !user?.id) return;

    try {
      // Strictly enforce that only explicit participants can access the room (no admin eavesdropping)
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId: roomId
          }
        }
      });

      if (!participant) {
        socket.emit('error', { message: 'Access denied: You are not a participant in this conversation.' });
        return;
      }

      socket.join(roomId);
    } catch {
      socket.emit('error', { message: 'Failed to authorize room access.' });
    }
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on('send_message', async (data: any) => {
    if (!data?.conversationId || !data?.message || !user?.id) return;

    try {
      // Strictly enforce that only explicit participants can broadcast messages
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId: data.conversationId
          }
        }
      });

      if (!participant) {
        socket.emit('error', { message: 'Unauthorized: Cannot send messages to this conversation.' });
        return;
      }

      // Ensure senderId matches authenticated user
      if (typeof data.message === 'object') {
        data.message.senderId = user.id;
      }

      io.to(data.conversationId).emit('receive_message', data.message);
    } catch {
      socket.emit('error', { message: 'Failed to process message broadcast.' });
    }
  });

  socket.on('typing', async (data: { conversationId: string, username: string }) => {
    if (!data?.conversationId || !user?.id) return;
    try {
      const participant = await prisma.conversationParticipant.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId: data.conversationId
          }
        }
      });

      if (participant) {
        socket.to(data.conversationId).emit('user_typing', data.username);
      }
    } catch {
      /* ignore typing errors */
    }
  });

  socket.on('disconnect', () => {
    /* cleaned up by socket.io */
  });
});

// Middleware
app.use(helmet({
  referrerPolicy: { policy: 'no-referrer' }
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// Global resilient middlewares
app.use(generalRateLimiter);
app.use(idempotency);

// Health Check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'SafeHaven API is running securely.' });
});

// Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/community', communityRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json(formatErrorResponse('NOT_FOUND', 'Route not found', 404));
});

// Centralized error handler
app.use(errorHandler);

// Start Server
(server as any).listen(PORT, () => {
  console.log(`SafeHaven Server (API + WebSockets) running on port ${PORT}`);
  // Start background async tasks
  startPruningScheduler();
});