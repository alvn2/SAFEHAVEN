# SafeHaven Backend — API & WebSocket Server

Express.js REST API with Prisma ORM, Socket.IO real-time messaging, and JWT authentication.

## 🏗️ Stack

| Technology | Purpose |
|-----------|---------|
| Express 4 | HTTP server & routing |
| Prisma 5 | ORM + PostgreSQL client |
| Socket.IO 4 | Real-time chat |
| Zod 4 | Request validation |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth tokens |
| Helmet | Security headers |

## 📁 Project Structure

```
server/
├── prisma/
│   └── schema.prisma        # Data models & enums
├── src/
│   ├── index.ts              # Entry point (Express + Socket.IO setup)
│   ├── middleware/
│   │   └── auth.ts           # JWT verify middleware
│   └── routes/
│       ├── auth.ts           # Register, Login, Recovery, /me
│       ├── admin.ts          # Admin dashboard operations
│       ├── chat.ts           # Conversations & messages
│       ├── community.ts      # Groups, Events, Organizations
│       ├── forum.ts          # Forum posts & threaded comments
│       ├── journal.ts        # Encrypted journal entries
│       ├── safety.ts         # Safety plans
│       └── volunteer.ts      # Volunteer profiles & applications
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```

## 🚀 Setup

```bash
npm install
cp .env.example .env  # Edit with your database URL
npx prisma db push
npx prisma generate
npm run dev
```

## 📋 Environment Variables

| Variable | Description | Example |
|----------|------------|---------|
| `DATABASE_URL` | PostgreSQL connection (pooled) | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `PORT` | Server port | `5000` |

## 🔌 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Create account (username, password, recoveryKey) |
| `POST` | `/login` | ❌ | Login → JWT token |
| `POST` | `/recover` | ❌ | Recover account with recovery key |
| `GET` | `/me` | ✅ | Get current user + `hasVolunteerProfile` flag |

### Forum — `/api/forum`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | List all posts |
| `POST` | `/` | ✅ | Create post |
| `PUT` | `/:id/hug` | ❌ | Increment hugs counter |
| `PUT` | `/:id/report` | ✅ | Flag post for review |
| `GET` | `/:id/comments` | ❌ | Get threaded comment tree |
| `POST` | `/:id/comments` | ✅ | Add comment/reply (optional `parentId`) |

### Volunteers — `/api/volunteers`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ❌ | List volunteer profiles |
| `POST` | `/apply` | ✅ | Submit volunteer application |

### Chat — `/api/chat`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/conversations` | ✅ | User's conversations |
| `GET` | `/:conversationId/messages` | ✅ | Conversation history |
| `POST` | `/send` | ✅ | Send message |

### Journal — `/api/journal`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | Get encrypted entries |
| `POST` | `/` | ✅ | Upsert entry |
| `DELETE` | `/:id` | ✅ | Delete entry |

### Safety Plans — `/api/safety`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ | Get safety plan |
| `POST` | `/` | ✅ | Save/update safety plan |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/stats` | ADMIN | Dashboard analytics |
| `GET` | `/users` | ADMIN | All users |
| `POST` | `/volunteers/:id/approve` | ADMIN | Approve volunteer |
| `POST` | `/volunteers/:id/reject` | ADMIN | Reject volunteer |

## 🗄️ Database Schema (Key Models)

```
User              → id, username, passphraseHash, role, recoveryKey
VolunteerProfile  → userId, name, role, track, bio, qualification, topics
ForumPost         → id, authorId, title, body, category, hugs
ForumComment      → id, postId, authorId, body, parentId (self-ref for threads)
JournalEntry      → id, userId, encryptedData
SafetyPlan        → id, userId, data
Conversation      → id, type (dm/group), participants
Message           → id, conversationId, senderId, content
```

## 🔒 Authentication Flow

1. User registers → password hashed with bcrypt (12 rounds) → 12-word recovery key generated client-side
2. Login → JWT issued (payload: `{ userId, role }`) → stored in `sessionStorage`
3. Each protected request sends `Authorization: Bearer <token>`
4. `/auth/me` validates token and returns user + `hasVolunteerProfile`
5. Session auto-expires after 15 minutes of inactivity (client-side)

## 📋 npm Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run prisma:push` | Push schema changes to database |
| `npm run prisma:generate` | Regenerate Prisma client types |

## 🔐 Admin Credentials

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `SafeHaven@Admin2026` |

> Created via seed script. Change immediately in production.
