# 🛡️ SafeHaven — Privacy-First Mental Health Support Platform

SafeHaven is a full-stack web platform that connects people in need ("Seekers") with trained Volunteers for peer support, crisis resources, and community engagement — all built with privacy at its core.

## 🏗️ Architecture

```
safehaven/
├── client/          # React + Vite frontend (Tailwind CSS)
├── server/          # Node.js + Express backend (Prisma + PostgreSQL)
└── README.md        # ← You are here
```

| Layer | Stack |
|-------|-------|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3, Lucide Icons, Socket.IO Client |
| **Backend** | Node.js, Express 4, TypeScript, Prisma ORM, Socket.IO, Zod validation |
| **Database** | PostgreSQL (Neon serverless) |
| **Auth** | JWT tokens, bcrypt password hashing, 12-word recovery keys |
| **Real-time** | Socket.IO for chat & messaging |

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
| **Dashboard** | `http://localhost:5173/admin` |

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

## 📂 Detailed Documentation

- 📖 [**Frontend Documentation**](./client/README.md) — Component architecture, pages, routing
- 📖 [**Backend Documentation**](./server/README.md) — API endpoints, database schema, authentication

## 🛡️ Security

- JWT-based authentication with 15-minute session timeout
- bcrypt password hashing (12 salt rounds)
- 12-word recovery key system (client-generated)
- End-to-end encrypted journal entries (CryptoJS AES)
- CORS + Helmet middleware
- Session auto-logout on inactivity

## 📄 License

MIT
