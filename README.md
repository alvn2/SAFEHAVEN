# 🛡️ SafeHaven — Privacy-First Mental Health Support Platform

SafeHaven is a full-stack web platform that connects people in need ("Seekers") with trained Volunteers for peer support, crisis resources, and community engagement — all built with privacy at its core.

## 🌐 Live Deployment & Repository

| Environment | URL |
|-------------|-----|
| **Frontend** | [safehavenkenya.vercel.app](https://safehavenkenya.vercel.app) |
| **Backend API** | [safehaven-backend-hmes.onrender.com](https://safehaven-backend-hmes.onrender.com) |
| **Open Source Repository** | [github.com/alvn2/SAFEHAVEN](https://github.com/alvn2/SAFEHAVEN) |

## 🏗️ Architecture

```
safehaven/
├── client/          # React + Vite frontend (Tailwind CSS, Vitest)
├── server/          # Node.js + Express backend (Prisma + PostgreSQL, Node test runner)
├── docs/            # Full project documentation (15 technical & product documents)
├── CONTRIBUTING.md   # Open-source contribution guidelines
├── SECURITY.md      # Threat model and vulnerability disclosure policy
└── README.md        # ← You are here
```

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express 4, TypeScript, Prisma ORM, Socket.IO, Zod validation |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | Pseudonymous authentication (no email/phone), bcrypt password hashing, 12-word client-derived recovery keys |
| **Real-time & Chat** | Socket.IO with client-side AES-256 encryption scoped to conversation IDs |
| **Hosting** | Vercel (frontend), Render (backend), Neon (database) |

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL database (or [Neon](https://neon.tech) serverless account)

### 1. Clone & Install

```bash
git clone https://github.com/alvn2/SAFEHAVEN.git safehaven
cd safehaven

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Environment Setup

**Backend** — create `server/.env`:
```env
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
JWT_SECRET="your-at-least-32-char-secret-key-change-in-prod"
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
npm run seed            # Seed admin, volunteers, wisdom quotes, and demo resources
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend (port 5000)
cd server && npm run dev

# Terminal 2: Frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔐 Admin Access & Staff Management

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `SafeHaven@Admin2026` |
| **Admin Dashboard** | `/admin` |
| **Developer Console** | `/developer` |

> 💡 **Admin Lockout Immunity**: Administrator accounts are exempted from the automated 90-day inactivity lockout rule.  
> 🛡️ **Zero-Knowledge Seeker De-Tracking**: Regular seekers (`USER`) are **strictly excluded** from administrative account listings (`GET /admin/users`). Administrators can manage volunteers and staff, but cannot monitor, enumerate, or track anonymous seekers.  
> ⚠️ **Change the admin password in production when deploying publicly.**

## 🔐 Security & Sovereign Privacy Architecture

- **Zero-Knowledge Seeker De-Tracking**: The admin panel and API deliberately enforce `role: { not: 'USER' }`. Anonymous seekers are structurally unreachable via administrative tools.
- **Client-Side E2E Encryption**: Journal reflections and safety plans are encrypted client-side using AES-256 before transmission. Decryption keys are derived in-browser and never touch backend servers.
- **Encrypted Peer Chat**: 1-on-1 peer chat messages are encrypted client-side using conversation-derived AES-256 keys. No plaintext therapy dialogues are readable in transit or in the database.
- **Backdoor-Free WebSockets**: Sockets enforce strict conversation participation checks; administrators have no eavesdropping bypass into private chat rooms.
- **Atomic Emergency Account Deletion ("Nuke")**: Instant cascadeless deletion (`DELETE /api/auth/nuke`) cleanly removes user records and all associated child items within an atomic transaction, wiping local device storage.
- **Anonymized Audit Trails**: All `targetId` and admin identifiers are irreversibly hashed with SHA-256, and logs contain pseudonymous references (`user [ref: #<hash>]`).
- **Sovereign Offline Vault**: Seekers can operate in 100% offline Device-Vault mode with KeePassXC-compatible `.safevault` container export and import.
- **Local Privacy Guard**: App auto-masks screen content upon OS task switching (`visibilitychange`), provides explicit phone exposure warnings for external WhatsApp/Telegram links, and runs zero third-party tracking scripts (no Google Fonts CDN, no external avatar services, strict `no-referrer`).
- **Acoustic Biometric Shield**: Voice recording is deprecated to eliminate voiceprint identification risks under Kenya DPA 2019 and protect Neon's 500 MB free tier ($0/mo indefinitely).

## 🧪 Automated Testing

Both client and server include comprehensive automated test suites:

```bash
# Run server test suite (22/22 invariant, security, and middleware tests)
cd server && npm test

# Run client test suite (45/45 unit, component, encryption, and vault tests)
cd client && npx vitest run
```

### Coverage Overview:
- **Server (22 tests)**: API structured error envelopes, idempotency replay, sliding window rate limiting, in-memory SWR caching, JWT cryptographic rigor, authentication & RBAC middleware, and recovery key hashing.
- **Client (45 tests)**: AES-256 encryption/decryption, KeePassXC `.safevault` import/export, offline PWA install banner, role-based navigation, seeker dashboard, safety plan, buttons, modals, crisis hotline bar, and offline SVG avatars.

## 📦 Features

### Progressive Web App (PWA)
- 📱 **Installable on Mobile & Desktop** — Web App Manifest and Service Worker support with offline SPA routing.
- ⚡ **Offline-Ready Shell** — Fast-loading client with emergency Quick Exit and local sovereign vault encryption.

### For Seekers
- 📔 **Encrypted Journal** — Client-side AES-256 encrypted entries with mood tracking & tags.
- 🛡️ **KeePassXC Sovereign Vault** — Download/upload `.safevault` encrypted backup files for 100% offline, serverless diary storage.
- 🛡️ **Safety Plan** — Personal crisis management plan (warning signs, coping strategies, safe contacts).
- 💬 **Encrypted Chat** — Real-time peer messaging with verified volunteers protected with E2E AES-256 encryption.
- 🏠 **Quick Exit** — Instant emergency redirect to a neutral page (e.g., weather or search).
- 🔒 **Task Switcher Mask** — Obscures screen contents in mobile OS app switchers.

### For Volunteers
- 👤 **Professional & Peer Listener Tracks** — Vetted through official Kenyan government regulatory bodies and recognized NGO health partner channels.
- 📊 **Impact Dashboard** — Track volunteer status, activity, and direct peer chats.
- 🔒 **Verified Badges** — Clear differentiation between licensed clinical practitioners and certified peer listeners.

### Community & Wisdom
- 🌍 **African & Kenyan Wisdom Library** — 323 curated proverbs and mental health quotes (Swahili, Kikuyu, Luo, Luhya, Maasai, Kamba, Kalenjin, Somali, Wangari Maathai, Desmond Tutu, Chinua Achebe) with instant community submissions.
- 💬 **Peer Support Forum** — Anonymous threaded discussions with trigger content blurring and reactions.
- 🤝 **Community Groups & Events** — In-app and external community connections.
- 📚 **Resource Library** — Curated self-help articles, books, and verified emergency helplines.

### Admin & Staff Management
- 👥 **Volunteers & Staff Directory** — Comprehensive management of listeners, counselors, and moderators (`/admin`). Anonymous seekers are structurally excluded.
- 🛡️ **Volunteer Vetting Queue** — Review certifications, credentials, and approve/reject applications with audit logging.
- 📊 **Platform Metrics & Health** — Platform activity indicators without compromising seeker anonymity.
- 🔧 **Content Moderation** — Review flagged forum discussions and community user-generated content (UGC).

## 📂 Documentation

Complete project documentation is maintained in the [`docs/`](./docs/) directory:

### Architecture & Technical
| # | Document | Description |
|---|----------|-------------|
| 7 | [System Architecture](./docs/07-system-architecture.md) | Full technical design, E2E crypto flows, and ER diagrams |
| 9 | [Developer Guide](./docs/09-readme-internal.md) | Setup, API reference, cryptographic standards, and testing |
| 15 | [Architecture Decision Records](./docs/15-architecture-decision-records.md) | Historical record of all architectural and security decisions |

### Product & Strategy
| # | Document | Description |
|---|----------|-------------|
| 1 | [Problem/Solution Statement](./docs/01-problem-solution.md) | Mental health crisis and stigma landscape in Kenya |
| 2 | [Pitch Deck](./docs/02-pitch-deck.md) | 12-slide non-profit / philanthropic initiative overview |
| 3 | [Market Research](./docs/03-market-research.md) | Regional analysis & competitive landscape |
| 4 | [Lean Canvas](./docs/04-lean-canvas.md) | Open-source non-profit operational model |
| 5 | [PRD](./docs/05-prd.md) | Complete Product Requirements Document |
| 6 | [MVP Scope](./docs/06-mvp-scope.md) | Shipped capabilities vs. deferred roadmap |
| 10 | [Financial Model](./docs/10-financial-model.md) | Free-tier sustainability and grant funding requirements |
| 11 | [User Personas](./docs/11-user-personas.md) | Seeker, peer volunteer, and licensed counselor personas |

### Guides & Legal
| # | Document | Description |
|---|----------|-------------|
| 8 | [User Guide](./docs/08-readme-external.md) | Seeker and volunteer instructions |
| 12 | [Privacy Policy](./docs/12-privacy-policy.md) | Kenya DPA 2019 compliant privacy framework |
| 13 | [Terms of Service](./docs/13-terms-of-service.md) | Safe harbor, peer boundaries, and crisis guidelines |
| 14 | [Founder Agreement](./docs/14-founder-agreement.md) | Core maintainer governance and open-source IP |

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
