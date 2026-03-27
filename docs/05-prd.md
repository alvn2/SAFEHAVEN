# SafeHaven — Product Requirements Document (PRD)

**Version:** 1.0
**Last Updated:** March 27, 2026
**Status:** Implemented (MVP)

---

## 1. Product Overview

SafeHaven is a privacy-first, anonymous mental health support platform targeting Kenyans who cannot access traditional therapy due to cost, stigma, or geography. The platform connects Seekers (users in need) with Volunteers (trained counselors and peer listeners) through encrypted communications, while providing self-help tools and community resources.

**Live URLs:**
- Frontend: [safehavenkenya.vercel.app](https://safehavenkenya.vercel.app)
- Backend API: [safehaven-backend-hmes.onrender.com](https://safehaven-backend-hmes.onrender.com)

---

## 2. User Roles

| Role | Permissions | Registration |
|------|------------|-------------|
| **Seeker (USER)** | Journal, safety plan, forum, chat, resources, community | Self-signup (pseudonym + passphrase) |
| **Volunteer (VOLUNTEER_PENDING → VOLUNTEER_APPROVED)** | All seeker features + volunteer dashboard, profile | Application + admin approval |
| **Moderator (MODERATOR)** | Forum moderation, content review | Application + admin approval |
| **Admin (ADMIN)** | Full platform control, user management, analytics | Seeded account |

---

## 3. Feature Specifications

### 3.1 Authentication & Identity

| Feature | Description | User Story |
|---------|------------|-----------|
| Anonymous Registration | Signup with pseudonym + passphrase only (no email/phone) | *As a seeker, I want to create an account without revealing my identity* |
| 12-Word Recovery Key | Client-generated recovery phrase for account recovery | *As a user, I want to recover my account if I forget my password* |
| JWT Session Management | 15-minute auto-timeout with activity detection | *As a user, I want my session to auto-lock for safety* |
| Quick Exit | Emergency button redirects to safe website | *As a GBV survivor, I want to instantly leave the app if someone approaches* |
| Password Recovery | Recovery via 12-word phrase → password reset | *As a user who forgot their password, I want to regain access* |

**Success Criteria:**
- [ ] User can register with only a pseudonym and passphrase
- [ ] 12-word recovery phrase is displayed exactly once on registration
- [ ] Session auto-locks after 15 minutes of inactivity
- [ ] Quick exit button is accessible on all pages

### 3.2 Encrypted Journal

| Feature | Description | User Story |
|---------|------------|-----------|
| E2E Encrypted Entries | Journal text encrypted with user's passphrase (CryptoJS AES) | *As a seeker, I want my journal entries to be unreadable to anyone else* |
| Mood Tracking | 1-5 scale for mood, energy, and sleep | *As a seeker, I want to track my emotional patterns over time* |
| Tags | Categorize entries with custom tags | *As a seeker, I want to organize my journal entries* |
| Draft Mode | Save unfinished entries | *As a seeker, I want to save drafts without losing work* |
| Audio Entries | Record voice notes (encrypted base64) | *As a seeker, I want to sometimes speak instead of type* |
| Mood Chart | Visual timeline of mood/energy/sleep data | *As a seeker, I want to see my emotional patterns* |

**Success Criteria:**
- [ ] Entries are encrypted before leaving the browser
- [ ] Server never stores plaintext journal content
- [ ] Mood chart renders correctly with historical data
- [ ] Audio recording captures and plays back correctly

### 3.3 Safety Plan

| Feature | Description | User Story |
|---------|------------|-----------|
| Personal Crisis Plan | Warning signs, coping strategies, safe contacts, professional contacts, environment changes | *As a seeker, I want a structured plan for when I'm in crisis* |
| Encrypted Storage | All fields encrypted server-side | *As a seeker, I want my safety plan to be private* |
| Offline Access | Available via PWA offline | *As a seeker, I want to access my safety plan even without internet* |

### 3.4 Peer Support Forum

| Feature | Description | User Story |
|---------|------------|-----------|
| Anonymous Posts | Post with anonymous display name | *As a seeker, I want to share without revealing who I am* |
| Categories | Anxiety, Depression, Relationships, Grief, Self-Care, General | *As a seeker, I want to find relevant discussions* |
| Threaded Replies | Nested comment system with parent-child relationships | *As a user, I want to reply to specific comments* |
| Hugs System | Non-judgmental "hug" reactions instead of likes | *As a seeker, I want to show support without words* |
| Trigger Content Blurring | Posts marked as triggering are blurred until user opts in | *As a seeker, I want to be protected from unexpected triggering content* |
| Content Flagging | Users can flag inappropriate content for moderator review | *As a user, I want to report harmful content* |

### 3.5 Secure Chat (Real-Time)

| Feature | Description | User Story |
|---------|------------|-----------|
| 1-on-1 Messaging | Real-time DM with volunteers via Socket.IO | *As a seeker, I want to privately talk to a trained volunteer* |
| Group Chat | Group conversations for support circles | *As a seeker, I want to join group support sessions* |
| Typing Indicators | See when the other person is typing | *As a user, I want to know the other person is responding* |
| Encrypted Messages | All messages encrypted at rest | *As a user, I want my messages to be private* |

### 3.6 Volunteer Network

| Feature | Description | User Story |
|---------|------------|-----------|
| Volunteer Directory | Browse verified volunteers with search & filter | *As a seeker, I want to find a volunteer who matches my needs* |
| Volunteer Profiles | Photo, bio, qualifications, topics, languages, location | *As a seeker, I want to know a volunteer's expertise* |
| Application Flow | Apply → Admin Review → Approval → Profile Creation | *As a volunteer, I want to apply and get verified* |
| Online Status | Real-time availability indicator | *As a seeker, I want to know which volunteers are available* |
| Impact Dashboard | Views, chats, hours tracked for volunteers | *As a volunteer, I want to see my impact metrics* |

### 3.7 Community & Resources

| Feature | Description | User Story |
|---------|------------|-----------|
| Community Groups | In-app and external support groups (WhatsApp, Telegram) | *As a seeker, I want to join support communities* |
| Events Directory | Mental health events, workshops, webinars | *As a user, I want to attend mental health events* |
| Resource Library | Curated articles, books, videos | *As a seeker, I want to learn about mental health topics* |
| UGC Submissions | Users can submit groups, events, quotes for approval | *As a user, I want to contribute to the community* |
| Inspirational Quotes | Curated quotes with Swahili translations | *As a user, I want daily inspiration* |

### 3.8 Admin Dashboard

| Feature | Description | User Story |
|---------|------------|-----------|
| Platform Statistics | Total users, active users, posts, messages, volunteers | *As an admin, I want to see platform health at a glance* |
| User Management | View users, change roles, suspend accounts | *As an admin, I want to manage user accounts* |
| Volunteer Applications | Review and approve/reject volunteer applications | *As an admin, I want to vet volunteers before they can chat with seekers* |
| Content Moderation | Review flagged forum posts, moderate UGC | *As an admin, I want to remove harmful content* |
| Article Management | Create, edit, delete resource articles | *As an admin, I want to manage the resource library* |
| Audit Logs | Track all admin and security-relevant actions | *As an admin, I want accountability for all platform actions* |
| System Settings | Toggle mod applications, configure platform behavior | *As an admin, I want to control platform-wide settings* |

### 3.9 Security Features

| Feature | Description |
|---------|------------|
| Security Center | Central hub for security settings, data export, account deletion |
| Account Nuke | Complete data wipe (GDPR "right to erasure") |
| Security Whitepaper | Public transparency document on security practices |
| Offline PWA | Journal and safety plan accessible without internet |
| Content Security | Helmet middleware, CORS, rate limiting |

---

## 4. Technical Requirements

| Requirement | Specification |
|------------|--------------|
| **Response Time** | API responses < 500ms (95th percentile) |
| **Uptime** | 99.5% availability |
| **Encryption** | AES-256 for journal entries, bcrypt for passwords |
| **Browser Support** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Mobile** | Responsive design, minimum 320px viewport |
| **Accessibility** | WCAG 2.1 Level AA compliance |
| **Data Retention** | User data retained until user initiates "nuke" |

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|------------|
| **Performance** | Page load < 3 seconds on 3G connection |
| **Scalability** | Support 10,000 concurrent users by Year 2 |
| **Security** | Annual penetration testing, OWASP Top 10 mitigation |
| **Localization** | English primary, Swahili secondary (quotes) |
| **Analytics** | Privacy-preserving analytics (no third-party trackers) |
