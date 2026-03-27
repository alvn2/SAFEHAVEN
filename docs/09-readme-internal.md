# SafeHaven — Developer Guide (Internal Documentation)

> **For Developers** — How to set up, understand, and contribute to the SafeHaven codebase.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Project Structure](#2-project-structure)
3. [Environment Setup](#3-environment-setup)
4. [Database](#4-database)
5. [API Reference](#5-api-reference)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Authentication](#7-authentication)
8. [Real-Time Features](#8-real-time-features)
9. [Testing](#9-testing)
10. [Deployment](#10-deployment)
11. [Code Standards](#11-code-standards)

---

## 1. Quick Start

```bash
# Clone the repository
git clone <your-repo-url> safehaven
cd safehaven

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up database
cd ../server
cp .env.example .env  # Edit with your database URL
npx prisma db push
npx prisma generate

# Start development
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

Open `http://localhost:5173` in your browser.

**Admin login:** `admin` / `SafeHaven@Admin2026`

---

## 2. Project Structure

```
safehaven/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Layout.tsx       # Root layout (nav + footer)
│   │   │   ├── VolunteerCard.tsx # Volunteer display card
│   │   │   ├── SubmitUGCModal.tsx # Community submission modal
│   │   │   └── ui.tsx           # Button, Badge, Modal primitives
│   │   ├── context/
│   │   │   ├── AuthContext.tsx   # Auth state management
│   │   │   └── ThemeContext.tsx  # Dark/light mode
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/
│   │   │   ├── api.ts           # API client (fetch wrapper)
│   │   │   ├── encryption.ts    # CryptoJS E2E encryption
│   │   │   ├── storage.ts       # localStorage helpers
│   │   │   └── constants.ts     # Seed data, static content
│   │   ├── pages/               # 18 page components
│   │   ├── test/                # Vitest test files
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Helper utilities
│   ├── .env                     # Local dev environment
│   ├── .env.production          # Production environment
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── index.ts             # Entry point (Express + Socket.IO)
│   │   ├── db.ts                # Prisma client export
│   │   ├── seed.ts              # Database seeder
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT authentication middleware
│   │   └── routes/
│   │       ├── auth.ts          # Auth routes (register, login, recover)
│   │       ├── journal.ts       # Journal CRUD
│   │       ├── forum.ts         # Forum + comments
│   │       ├── chat.ts          # Chat conversations + messages
│   │       ├── volunteer.ts     # Volunteer profiles + applications
│   │       ├── safety.ts        # Safety plan CRUD
│   │       ├── community.ts     # Community content
│   │       └── admin.ts         # Admin operations
│   ├── prisma/
│   │   └── schema.prisma        # Database schema (16 models)
│   ├── .env                     # Server environment variables
│   └── package.json
│
├── docs/                        # Project documentation
└── README.md                    # Project overview
```

---

## 3. Environment Setup

### Backend (`server/.env`)

```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
JWT_SECRET="your-secret-key"
PORT=5000
CLIENT_URL="http://localhost:5173"     # Frontend URL for CORS
```

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

### Production (`client/.env.production`)

```env
VITE_API_URL=https://safehaven-backend-hmes.onrender.com/api
```

---

## 4. Database

### Tech
- **Engine:** PostgreSQL 15 (Neon serverless)
- **ORM:** Prisma 5.22
- **Schema:** `server/prisma/schema.prisma`

### Common Commands

```bash
cd server

# Push schema changes to database
npx prisma db push

# Regenerate Prisma client after schema changes
npx prisma generate

# Open Prisma Studio (GUI database browser)
npx prisma studio

# Seed database with initial data
npx tsx src/seed.ts
```

### Schema Overview (16 Models)

| Model | Purpose |
|-------|---------|
| `User` | Accounts with roles (USER, ADMIN, VOLUNTEER_*, MODERATOR) |
| `VolunteerProfile` | Extended profile for approved volunteers |
| `JournalEntry` | Encrypted journal entries with mood data |
| `SafetyPlan` | Encrypted crisis plan |
| `ForumPost` | Anonymous forum threads |
| `ForumComment` | Nested thread replies |
| `Conversation` | Chat rooms (dm/group) |
| `ConversationParticipant` | Chat membership |
| `Message` | Chat messages |
| `Resource` | Library content (articles, books, videos) |
| `Event` | Community events |
| `CommunityGroup` | Support groups |
| `Organization` | NGO listings |
| `QuoteSuggestion` | User-submitted quotes |
| `VolunteerApplication` | Application forms |
| `AuditLog` | Admin action trail |
| `ModeratorApplication` | Moderator requests |
| `SystemSetting` | Platform key-value config |

---

## 5. API Reference

### Base URL
- **Local:** `http://localhost:5000/api`
- **Production:** `https://safehaven-backend-hmes.onrender.com/api`

### Authentication

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| POST | `/register` | ❌ | `{username, password, recoveryKey?, agreedToTerms?, becomePeerListener?}` | Register new user |
| POST | `/login` | ❌ | `{username, password}` | Login |
| POST | `/recover` | ❌ | `{username, recoveryKey, newPassword}` | Recover account |
| GET | `/me` | ✅ | — | Get current user |
| DELETE | `/nuke` | ✅ | — | Delete all user data |
| PATCH | `/settings` | ✅ | `{inactivityEnabled}` | Update settings |
| POST | `/moderator-apply` | ✅ | `{reason}` | Apply for moderator |

### Journal Routes (`/api/journal`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | — | Get all journal entries |
| POST | `/` | ✅ | `{id?, date, mood, energy, sleep, entry, tags, isDraft?}` | Create/update entry |
| DELETE | `/:id` | ✅ | — | Delete entry |

### Forum Routes (`/api/forum`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ❌ | — | Get all posts |
| POST | `/` | ✅ | `{title, body, category, author?, isTriggering?}` | Create post |
| GET | `/:id/comments` | ❌ | — | Get comments for post |
| POST | `/:id/comments` | ✅ | `{body, parentId?}` | Add comment |
| POST | `/:id/hug` | ✅ | — | Hug a post |
| POST | `/:id/flag` | ✅ | — | Flag a post |
| POST | `/:id/dismiss` | ✅ | — | Dismiss flag |
| DELETE | `/:id` | ✅ | — | Delete post |

### Chat Routes (`/api/chat`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/conversations` | ✅ | — | Get user's conversations |
| GET | `/:id/messages` | ✅ | — | Get messages for conversation |
| POST | `/:id/messages` | ✅ | `{content, senderName}` | Send message |

### Volunteer Routes (`/api/volunteers`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ❌ | — | Get all approved volunteers |
| GET | `/me` | ✅ | — | Get own volunteer profile |
| GET | `/:id` | ❌ | — | Get volunteer by ID |
| POST | `/apply` | ❌ | `{name, email, phone, role, qualification, experience, licenseNumber?}` | Apply as volunteer |

### Safety Routes (`/api/safety`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/` | ✅ | — | Get safety plan |
| PUT | `/` | ✅ | `{warningSigns, copingStrategies, safeContacts, professionalContacts, environmentChanges}` | Save safety plan |

### Community Routes (`/api/community`)

| Method | Endpoint | Auth | Body | Description |
|--------|----------|------|------|-------------|
| GET | `/groups` | ❌ | — | Get approved groups |
| GET | `/events` | ❌ | — | Get approved events |
| GET | `/organizations` | ❌ | — | Get approved orgs |
| GET | `/quotes` | ❌ | — | Get approved quotes |
| GET | `/resources` | ❌ | — | Get approved resources |
| POST | `/groups` | ✅ | `{name, description, category, link?, platform?}` | Submit group |
| POST | `/events` | ✅ | `{title, description, date, location, link?}` | Submit event |
| POST | `/organizations` | ✅ | `{name, description, category, link}` | Submit org |
| POST | `/quotes` | ✅ | `{text, author}` | Submit quote |

### Admin Routes (`/api/admin`) — Requires ADMIN role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform statistics |
| GET | `/users` | All users |
| GET | `/audit-logs` | Audit trail |
| GET | `/applications` | Volunteer applications |
| POST | `/applications/:id/approve` | Approve volunteer |
| POST | `/applications/:id/reject` | Reject volunteer |
| GET | `/flagged-posts` | Flagged forum posts |
| GET | `/articles` | Resource articles |
| POST | `/articles` | Create article |
| PUT | `/articles/:id` | Update article |
| DELETE | `/articles/:id` | Delete article |
| GET | `/ugc/pending` | Pending community content |
| POST | `/ugc/:type/:id/:action` | Moderate UGC |
| GET | `/mod-applications` | Moderator applications |
| POST | `/mod-applications/:id/:action` | Approve/reject mod |
| GET | `/system-settings` | System settings |
| POST | `/system-settings` | Update settings |

---

## 6. Frontend Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | Central API client — all backend calls go through `request<T>()` |
| `src/lib/encryption.ts` | CryptoJS AES encrypt/decrypt functions |
| `src/context/AuthContext.tsx` | Auth state, login/logout/register, session timeout |
| `src/components/ui.tsx` | Reusable UI primitives (Button, Badge, Modal) |
| `src/types/index.ts` | All TypeScript interfaces |

### Adding a New Page

1. Create `src/pages/NewPage.tsx`
2. Export the component
3. Add route in `src/App.tsx` inside `<Routes>`
4. Add navigation link in `src/components/Layout.tsx` if needed

---

## 7. Authentication

### Flow
1. User registers/logs in → backend returns JWT token
2. Token stored in `sessionStorage` (not localStorage — clears on tab close)
3. `api.ts` attaches `Authorization: Bearer <token>` to all requests
4. `AuthContext` checks token on mount via `GET /api/auth/me`
5. Session auto-locks after 15 minutes of no mouse/keyboard/scroll activity

### Roles
- `USER` — Default seeker role
- `VOLUNTEER_PENDING` — Applied but not yet approved
- `VOLUNTEER_APPROVED` — Approved volunteer with profile
- `MODERATOR` — Content moderation permissions
- `ADMIN` — Full platform access

---

## 8. Real-Time Features

### Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join_room` | Client → Server | `roomId: string` | Join chat room |
| `leave_room` | Client → Server | `roomId: string` | Leave chat room |
| `send_message` | Client → Server | `{conversationId, message}` | Send chat message |
| `receive_message` | Server → Client | `message` | Receive chat message |
| `typing` | Client → Server | `{conversationId, username}` | Typing indicator |
| `user_typing` | Server → Client | `username` | Show typing indicator |

---

## 9. Testing

```bash
cd client
npm test        # Run all tests
npm test -- --reporter=verbose  # Verbose output
```

### Test Files
- `src/test/components.test.tsx` — UI primitives (Button, Badge, Modal, VolunteerCard)
- `src/test/features.test.tsx` — Encryption, auth logic, recovery flow
- `src/test/pages.test.tsx` — SeekerDashboard, VolunteerNetwork page rendering

### Test Stack
- **Vitest** — Test runner
- **@testing-library/react** — React component testing
- **jsdom** — Browser environment simulation

---

## 10. Deployment

### Frontend (Vercel)
1. Push to main branch → Vercel auto-deploys
2. Set environment variable: `VITE_API_URL=https://safehaven-backend-hmes.onrender.com/api`
3. Build command: `cd client && npm run build`
4. Output directory: `client/dist`

### Backend (Render)
1. Connect GitHub repo
2. Build command: `cd server && npm install && npx prisma generate && npm run build`
3. Start command: `cd server && npm start`
4. Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CLIENT_URL`

### Database (Neon)
- Managed PostgreSQL — no deployment needed
- Schema changes: `npx prisma db push` from local machine

---

## 11. Code Standards

### TypeScript
- Strict mode enabled
- All API responses typed
- No `any` in production code (legacy exceptions documented)

### Naming Conventions
- **Files:** PascalCase for components (`HomePage.tsx`), camelCase for utilities (`api.ts`)
- **Variables:** camelCase
- **Types/Interfaces:** PascalCase
- **Constants:** SCREAMING_SNAKE_CASE

### Security Rules
- Never store plaintext sensitive data
- Always encrypt journal/safety plan content client-side before sending
- Never log user content on the server
- Use parameterized queries (Prisma handles this)
- Validate all input with Zod schemas
