# 🛡️ SafeHaven — Privacy-First Mental Health Support Platform

SafeHaven is a full-stack web platform that connects people in need ("Seekers") with trained Volunteers for peer support, crisis resources, and community engagement — all built with privacy at its core.

## 🌐 Live Deployment

| Environment | URL |
|-------------|-----|
| **Frontend** | [safehavenkenya.vercel.app](https://safehavenkenya.vercel.app) |
| **Backend API** | [safehaven-backend-hmes.onrender.com](https://safehaven-backend-hmes.onrender.com) |

## 🏗️ Architecture

```
safehaven/
├── client/          # React + Vite frontend (Tailwind CSS)
├── server/          # Node.js + Express backend (Prisma + PostgreSQL)
├── docs/            # Full project documentation (14 documents)
└── README.md        # ← You are here
```

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express 4, TypeScript, Prisma ORM, Socket.IO, Zod validation |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | JWT tokens, bcrypt password hashing, 12-word recovery keys |
| **Real-time** | Socket.IO for chat & messaging |
| **Hosting** | Vercel (frontend), Render (backend), Neon (database) |

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL database (or [Neon](https://neon.tech) account)

### 1. Clone & Install

```bash
git clone <your-repo-url> safehaven
cd safehaven

# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Environment Setup

**Backend** — create `server/.env`:
```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
JWT_SECRET="your-secret-key-change-in-production"
PORT=5000
CLIENT_URL="http://localhost:5173"
```

**Frontend** — create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

```bash
cd server
npx prisma db push      # Push schema to database
npx prisma generate     # Generate Prisma client
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend (port 5000)
cd server && npm run dev

# Terminal 2: Frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔐 Admin Access

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `SafeHaven@Admin2026` |
| **Dashboard** | `/admin` |

> ⚠️ **Change the admin password immediately in production.**

## 📦 Features

### For Seekers
- 📔 **Encrypted Journal** — End-to-end encrypted entries with mood tracking & audio recording
- 🛡️ **Safety Plan** — Personal crisis management plan (warning signs, coping strategies, contacts)
- 💬 **Secure Chat** — Real-time messaging with volunteers via Socket.IO
- 🏠 **Quick Exit** — Emergency button that instantly redirects to a safe page

### For Volunteers
- 👤 **Professional & Peer Listener** tracks with separate verification flows
- 📊 **Impact Dashboard** — Track reach and engagement
- 🔒 **Verified Profiles** — Admin-approved with qualifications displayed

### Community
- 💬 **Peer Support Forum** — Threaded discussions with trigger content blurring
- 🤝 **Community Groups** — In-app and external support groups
- 📅 **Events** — Community events with registration
- 📚 **Resource Library** — Articles, books, and video content

### Admin
- 👥 **User Management** — Role assignment, volunteer approval
- 📊 **Analytics Dashboard** — Platform statistics
- 🔧 **Content Moderation** — Forum post flagging, community content review

## 📂 Documentation

Complete project documentation is available in the [`docs/`](./docs/) folder:

### Business & Strategy
| # | Document | Description |
|---|----------|-------------|
| 1 | [Problem/Solution Statement](./docs/01-problem-solution.md) | The pain point and our solution |
| 2 | [Pitch Deck](./docs/02-pitch-deck.md) | 12-slide investor pitch |
| 3 | [Market Research](./docs/03-market-research.md) | Market analysis & competitor landscape |
| 4 | [Lean Canvas](./docs/04-lean-canvas.md) | One-page business model |

### Product & Technical
| # | Document | Description |
|---|----------|-------------|
| 5 | [PRD](./docs/05-prd.md) | Product Requirements Document |
| 6 | [MVP Scope](./docs/06-mvp-scope.md) | What's in v1.0 vs. deferred |
| 7 | [System Architecture](./docs/07-system-architecture.md) | Technical design with diagrams |

### Guides
| # | Document | Description |
|---|----------|-------------|
| 8 | [User Guide](./docs/08-readme-external.md) | How to use SafeHaven (for users) |
| 9 | [Developer Guide](./docs/09-readme-internal.md) | Setup, API reference, code standards |

### Financial & Market
| # | Document | Description |
|---|----------|-------------|
| 10 | [Financial Model](./docs/10-financial-model.md) | 3-year projection & burn rate |
| 11 | [User Personas](./docs/11-user-personas.md) | 5 detailed user profiles |

### Legal
| # | Document | Description |
|---|----------|-------------|
| 12 | [Privacy Policy](./docs/12-privacy-policy.md) | Kenya DPA compliant |
| 13 | [Terms of Service](./docs/13-terms-of-service.md) | Platform terms |
| 14 | [Founder Agreement](./docs/14-founder-agreement.md) | Template equity/roles agreement |

## 🛡️ Security

- JWT-based authentication with 15-minute session timeout
- bcrypt password hashing (12 salt rounds)
- 12-word recovery key system (client-generated)
- End-to-end encrypted journal entries (CryptoJS AES-256)
- CORS + Helmet middleware
- Session auto-logout on inactivity
- Zero PII collection (no email, phone, or real name)

## 🧪 Testing

```bash
cd client
npm test    # Run Vitest test suite
```

Test coverage:
- UI primitives (Button, Badge, Modal)
- Encryption (AES encrypt/decrypt)
- Authentication flow (register, login, recovery)
- Page rendering (SeekerDashboard, VolunteerNetwork)

## 📄 License

MIT
