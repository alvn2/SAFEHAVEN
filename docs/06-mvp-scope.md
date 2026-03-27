# SafeHaven — MVP Scope Document

**Version:** 1.0 (Shipped)
**Status:** ✅ MVP Complete & Deployed

---

## 1. MVP Philosophy

> Ship the simplest thing that solves the core problem: **connect a person in crisis with someone who can help — anonymously and safely.**

Everything in the MVP must pass this test:
- Does it reduce barriers to seeking help? → **Include**
- Is it nice-to-have but not essential for first contact? → **Defer**

---

## 2. MVP Feature Matrix

### ✅ In MVP (v1.0) — Shipped

| Feature | Priority | Status |
|---------|----------|--------|
| Anonymous registration (pseudonym + passphrase) | P0 | ✅ Shipped |
| 12-word recovery key system | P0 | ✅ Shipped |
| JWT auth with 15-min auto-timeout | P0 | ✅ Shipped |
| Quick exit button | P0 | ✅ Shipped |
| Encrypted journal (text + mood tracking) | P0 | ✅ Shipped |
| Audio journal entries | P1 | ✅ Shipped |
| Safety plan builder | P0 | ✅ Shipped |
| Peer support forum (anonymous posting) | P0 | ✅ Shipped |
| Threaded forum replies | P1 | ✅ Shipped |
| Hugs system (reactions) | P1 | ✅ Shipped |
| Trigger content blurring | P0 | ✅ Shipped |
| Content flagging | P1 | ✅ Shipped |
| Real-time 1-on-1 chat (Socket.IO) | P0 | ✅ Shipped |
| Volunteer directory with search/filter | P0 | ✅ Shipped |
| Volunteer application flow | P0 | ✅ Shipped |
| Admin dashboard (stats, users, moderation) | P0 | ✅ Shipped |
| Volunteer approval workflow | P0 | ✅ Shipped |
| Community groups directory | P1 | ✅ Shipped |
| Events directory | P1 | ✅ Shipped |
| Resource library (articles, books, videos) | P1 | ✅ Shipped |
| UGC submissions with admin approval | P1 | ✅ Shipped |
| Privacy policy & terms of service pages | P0 | ✅ Shipped |
| Security whitepaper page | P1 | ✅ Shipped |
| Dark mode toggle | P2 | ✅ Shipped |
| Offline PWA support (journal + safety plan) | P1 | ✅ Shipped |
| Responsive mobile design | P0 | ✅ Shipped |
| Account nuke (data wipe) | P1 | ✅ Shipped |
| Developer dashboard | P2 | ✅ Shipped |
| Audit logging | P1 | ✅ Shipped |

### 🔲 Deferred to v2.0+

| Feature | Priority | Target |
|---------|----------|--------|
| Mobile app (React Native) | P1 | Q4 2026 |
| Video/voice call support | P2 | v2.0 |
| AI chatbot for immediate crisis triage | P2 | v2.0 |
| Multi-language UI (full Swahili translation) | P1 | v2.0 |
| Group therapy scheduling | P2 | v2.0 |
| Push notifications | P1 | v2.0 |
| Professional matching algorithm | P2 | v2.0 |
| Analytics dashboard for volunteers | P2 | v2.0 |
| B2B corporate portal | P1 | v2.0 |
| Payment integration (M-Pesa for premium) | P2 | v2.0 |
| SMS/USSD fallback for non-smartphone users | P2 | v3.0 |
| AI-powered mood pattern analysis | P3 | v3.0 |
| Integration with national crisis hotlines | P1 | v2.0 |
| Multi-region deployment (Uganda, Tanzania) | P2 | v3.0 |

---

## 3. Architecture Summary (MVP)

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   React + Vite   │  HTTPS  │  Express + Node  │  SQL    │  PostgreSQL      │
│   (Vercel)       │────────→│  (Render)        │────────→│  (Neon)          │
│                  │         │                  │         │                  │
│ • 18 Pages       │         │ • 8 Route Groups │         │ • 16 Models      │
│ • Auth Context   │←────────│ • JWT Auth       │←────────│ • Prisma ORM     │
│ • Socket.IO      │  WS     │ • Socket.IO      │         │ • UUID PKs       │
│ • CryptoJS E2E   │         │ • Helmet + CORS  │         │ • Encrypted cols │
└──────────────────┘         └──────────────────┘         └──────────────────┘
```

---

## 4. MVP Success Metrics

| Metric | Target (90 days post-launch) | Measurement |
|--------|------------------------------|-------------|
| Registered users | 500 | Database count |
| Weekly active users | 100 | Login frequency |
| Journal entries created | 1,000 | Database count |
| Forum posts | 200 | Database count |
| Volunteer applications | 30 | Admin dashboard |
| Average chat response time | < 15 minutes | Message timestamps |
| User satisfaction | ≥ 3.5/5 | In-app survey |
| Zero data breaches | 0 incidents | Security monitoring |

---

## 5. What We Deliberately Excluded (and Why)

| Excluded Feature | Reason |
|------------------|--------|
| Email verification | Breaks anonymity — our core value prop |
| Social media login | Same — leaks identity |
| Payment processing | Core services must be free; B2B is backend not user-facing |
| Complex recommendation engine | Over-engineering for initial user base |
| Native mobile app | Web PWA covers mobile needs at lower cost for launch |
| Video therapy sessions | Requires infrastructure we don't need to validate the core hypothesis |

---

*MVP = Minimum Viable Product. The goal is to validate that anonymous, free peer support works in the Kenyan market before investing in premium features.*
