# Contributing to SafeHaven 🛡️

Thank you for your interest in contributing to **SafeHaven**! SafeHaven is an open-source, privacy-first mental health platform designed to connect people in need with trained volunteers and culturally grounded community resources while preserving absolute anonymity.

Because SafeHaven protects vulnerable people in mental health crises, **privacy and security are non-negotiable architectural requirements**. Every contribution must uphold our cryptographic standards.

---

## 🧭 Code of Conduct

We are committed to providing a welcoming, compassionate, and harassment-free environment for all contributors and community members. Please treat fellow contributors with empathy, respect, and constructive collaboration.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 9.0.0
- **PostgreSQL**: Local instance or free [Neon](https://neon.tech) serverless database

### Step-by-Step Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/alvn2/SAFEHAVEN.git safehaven
   cd safehaven
   ```

2. **Install Dependencies**:
   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. **Configure Environment Variables**:
   - In `server/.env`:
     ```env
     DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
     JWT_SECRET="your-development-secret-minimum-32-characters-long"
     PORT=5000
     CLIENT_URL="http://localhost:5173"
     ```
   - In `client/.env`:
     ```env
     VITE_API_URL="http://localhost:5000/api"
     ```

4. **Initialize the Database**:
   ```bash
   cd server
   npx prisma db push
   npx prisma generate
   npm run seed
   ```

5. **Start Development Daemons**:
   ```bash
   # Terminal 1 (Backend API & Socket.IO):
   cd server && npm run dev

   # Terminal 2 (Vite Frontend):
   cd client && npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔒 Cryptographic & Anonymity Invariants

Before submitting any Pull Request, verify that your changes **do not violate** any of our core privacy invariants:

1. **Zero Seeker Enumeration in Administrative Tools**:
   - Administrators manage volunteers, counselors, and moderators.
   - The backend `GET /api/admin/users` query MUST filter `role: { not: 'USER' }`. Regular seekers must never appear in administrative rosters.
2. **Client-Side Encryption for Sensitive Content**:
   - Journal entries, safety plans, and peer chat messages must be encrypted client-side using AES-256 before network transmission.
   - Plaintext passphrases and decryption keys must NEVER be transmitted to the backend.
3. **No Administrative Eavesdropping on Chat**:
   - WebSocket handlers (`join_room`, `send_message`) must strictly verify that the connecting user is an explicit participant in `conversationParticipant`.
   - Never reintroduce role-based bypasses (such as `role !== 'ADMIN'`).
4. **Anonymized Audit Trails**:
   - Target IDs and administrative actor IDs recorded in `AuditLog` must be hashed with SHA-256 (`safehaven:audit:<id>`).
   - Never write plaintext seeker usernames or identifiable information to audit descriptions or server logs.
5. **Zero Third-Party Trackers & CDNs**:
   - Do not load fonts, scripts, or images from external CDNs (e.g., Google Fonts, ui-avatars.com).
   - Use local/system fonts and offline SVG components (`Avatar.tsx`).
   - Enforce `<meta name="referrer" content="no-referrer">`.
6. **Zero PII Collection**:
   - Never require or prompt seekers for real names, email addresses, phone numbers, or GPS location.

---

## 🧪 Testing & Validation

All automated test suites must pass cleanly without regressions:

```bash
# 1. Run Server Tests (22 invariant and security tests)
cd server && npm test

# 2. Run Client Tests (45 unit, component, encryption, and vault tests)
cd client && npx vitest run

# 3. Verify Production Builds
cd server && npm run build
cd ../client && npm run build
```

---

## 🌿 Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-description
   ```
2. Commit your changes using conventional commit messages (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
3. Ensure all tests and production builds pass.
4. Push to your fork and submit a Pull Request against `main`.
5. Describe the problem your PR solves, the cryptographic impact, and attach screenshots or test output.

---

## 📄 License

By contributing to SafeHaven, you agree that your contributions will be licensed under the project's [MIT License](./README.md).
