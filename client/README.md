# SafeHaven Frontend — React + Vite

A privacy-first mental health support UI built with React 18, Vite, TypeScript, and Tailwind CSS.

## 🏗️ Stack

| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| TypeScript | Type safety |
| Tailwind CSS 3 | Utility-first styling |
| React Router 6 | Client-side routing |
| Socket.IO Client | Real-time chat |
| CryptoJS | Journal encryption |
| Lucide React | Icon library |

## 📁 Project Structure

```
client/
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI primitives (Button, Card, Modal, Input, Badge)
│   │   ├── NavBar.tsx         # Main navigation (overflow-x scroll on mobile)
│   │   ├── Footer.tsx         # Site footer
│   │   ├── Logo.tsx           # Brand logo
│   │   ├── ExternalLinkWarning.tsx  # Safety modal for outbound links
│   │   ├── SubmitUGCModal.tsx # User-generated content submission
│   │   └── VolunteerCard.tsx  # Volunteer profile card
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication state (JWT + session)
│   ├── lib/
│   │   ├── api.ts             # API client (axios-like fetch wrapper)
│   │   └── storage.ts         # Local StorageService (encrypted journal)
│   ├── pages/
│   │   ├── HomePage.tsx             # Landing page with hero + crisis resources
│   │   ├── AuthPage.tsx             # Login / Register
│   │   ├── SeekerSignupPage.tsx     # Extended signup flow with recovery key
│   │   ├── SeekerDashboard.tsx      # Journal + Safety Plan + Audio Recording
│   │   ├── ForumPage.tsx            # Peer support forum with threaded comments
│   │   ├── ChatPage.tsx             # Real-time messaging (Socket.IO)
│   │   ├── VolunteerNetworkPage.tsx  # Volunteer directory + CTA
│   │   ├── VolunteerApplyPage.tsx   # Volunteer application form
│   │   ├── VolunteerDashboard.tsx   # Volunteer impact dashboard
│   │   ├── CommunityPage.tsx        # Groups, Events, Organizations
│   │   ├── ResourcesPage.tsx        # Articles, Books, Videos library
│   │   ├── AdminDashboard.tsx       # Admin panel (role: ADMIN only)
│   │   ├── SecurityCenterPage.tsx   # User security settings
│   │   ├── SecurityWhitepaperPage.tsx # Platform security docs
│   │   ├── PrivacyPolicyPage.tsx    # Privacy policy
│   │   ├── TermsPage.tsx           # Terms of service
│   │   └── ToolsPage.tsx           # Self-help interactive tools
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── .env                       # API URL config
├── index.html                 # HTML entry
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🚀 Setup

```bash
npm install
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

Open **http://localhost:5173**

## 📋 Environment Variables

| Variable | Description | Default |
|----------|------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

## 🗺️ Routes

| Path | Page | Auth Required |
|------|------|:------------:|
| `/` | Home (landing) | ❌ |
| `/auth` | Login / Register | ❌ |
| `/auth/signup` | Extended signup | ❌ |
| `/seeker/dashboard` | Journal + Safety Plan | ✅ |
| `/forum` | Peer Support Forum | ❌ (post/reply: ✅) |
| `/chat` | Secure Messaging | ✅ |
| `/volunteers` | Volunteer Directory | ❌ |
| `/volunteer/apply` | Apply as Volunteer | ✅ |
| `/volunteer/dashboard` | Volunteer Impact | ✅ (VOLUNTEER) |
| `/community` | Groups, Events, Orgs | ❌ |
| `/resources` | Article/Video Library | ❌ |
| `/admin` | Admin Dashboard | ✅ (ADMIN) |
| `/security` | Security Center | ✅ |
| `/tools` | Self-Help Tools | ❌ |
| `/privacy` | Privacy Policy | ❌ |
| `/terms` | Terms of Service | ❌ |

## 🔐 Auth Architecture

```
AuthContext.tsx
├── Stores: user, passphrase, isLoading
├── On mount: checks sessionStorage for JWT → calls /auth/me
├── login() → POST /auth/login → stores token in sessionStorage
├── registerSeeker() → generates 12-word recovery key → POST /auth/register
├── recover() → POST /auth/recover with recovery phrase
├── logout() → clears sessionStorage + state
└── Auto-timeout: 15min inactivity → auto-logout
```

**User roles**: `USER`, `VOLUNTEER_PENDING`, `VOLUNTEER_APPROVED`, `ADMIN`

## 🎨 Design System

- **Color scheme**: Primary teal-to-blue gradient, warm accents
- **Dark mode**: Full support via Tailwind `dark:` variants
- **Components**: `Button`, `Card`, `Modal`, `Input`, `Badge` (in `src/components/ui/`)
- **Icons**: Lucide React
- **Typography**: System fonts with serif headings
- **Quick Exit**: Floating red button (bottom-right) → redirects to Google

## 📦 Key Features

### Journal (SeekerDashboard)
- Mood tracking (5-point emoji scale)
- Auto-save with 3s debounce (draft system)
- Audio recording with visual timer (chunked via `start(1000)`)
- Entry edit/delete with confirmation
- End-to-end encryption (CryptoJS AES, key = user's password)

### Forum (ForumPage)
- Backend-backed posts via `/api/forum`
- Threaded replies via recursive `CommentNode` component
- Trigger content blur with hover-to-reveal
- Hugs counter + Report system

### Chat (ChatPage)
- Socket.IO real-time messaging
- Conversation list + message history
- Typing indicators
- Message types: text, system, alert

## 📋 npm Scripts

| Script | Command |
|--------|---------|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest test suite |

## 🔐 Admin Access

Login at `/auth` with:

| Field | Value |
|-------|-------|
| **Username** | `admin` |
| **Password** | `SafeHaven@Admin2026` |

Then navigate to `/admin` for the admin dashboard.
