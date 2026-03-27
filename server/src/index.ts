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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
app.listen(PORT, () => {
  console.log(`SafeHaven Server running on port ${PORT}`);
});