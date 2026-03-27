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

dotenv.config();

import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on('send_message', (data: any) => {
    // data should contain { conversationId, message }
    io.to(data.conversationId).emit('receive_message', data.message);
  });

  socket.on('typing', (data: { conversationId: string, username: string }) => {
    socket.to(data.conversationId).emit('user_typing', data.username);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));

// Health Check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'SafeHaven API is running securely.' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/community', communityRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
server.listen(PORT, () => {
  console.log(`SafeHaven Server (API + WebSockets) running on port ${PORT}`);
});