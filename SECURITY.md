# Security Policy 🛡️

SafeHaven is committed to protecting the privacy, anonymity, and safety of seekers, volunteers, and counselors across Kenya and globally. Because mental health disclosures carry significant social, personal, and legal risks, security is the core trust foundation of the platform.

---

## 📦 Supported Versions

Security fixes and hardening patches are applied exclusively to the latest active release on `main`.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, de-anonymization attack vector, or cryptographic weakness, please **do not open a public GitHub issue**.

Instead, report vulnerabilities privately by emailing:
**`security@safehavenkenya.org`**

### What to Include:
1. Description of the vulnerability or de-anonymization vector.
2. Step-by-step reproduction instructions or proof-of-concept.
3. Potential impact on seeker anonymity, data confidentiality, or platform availability.
4. Suggested remediation if available.

### Response Timelines:
- **Initial Acknowledgement**: Within 24 hours.
- **Triage & Impact Assessment**: Within 48 hours.
- **Fix & Disclosure Coordination**: We will coordinate with you on patch deployment before public disclosure.

---

## 🛡️ Core Security Architecture & Threat Model

SafeHaven assumes an adversarial environment where network traffic may be intercepted, server hosting infrastructure may be compromised, and platform administrators may face coercion or subpoena. To mitigate these risks, the architecture enforces:

### 1. Seeker De-Tracking & Administrative Isolation
- The administrative user endpoint (`GET /api/admin/users`) strictly filters `where: { role: { not: 'USER' } }`.
- Anonymous seekers are structurally unreachable via administrative tools. Administrators cannot enumerate, search, view, or alter seeker accounts.

### 2. Client-Side End-to-End Encryption
- **Journal Entries & Safety Plans**: Encrypted client-side using AES-256 via CryptoJS with key derivation in the browser. Decryption keys (`sh_key`) are cached only in ephemeral `sessionStorage` and never transmitted over the wire.
- **Peer Chat**: 1-on-1 messages are encrypted client-side using deterministic session keys derived from the conversation ID (`SHA-256("safehaven:chat:v1:" + conversationId)`).

### 3. Backdoor-Free WebSockets
- Socket handlers for `join_room` and `send_message` strictly verify verified participant status in `conversationParticipant`.
- Administrators possess zero privilege bypass into private peer chat rooms.

### 4. Anonymized Audit Trails
- All `targetId` fields and actor IDs recorded in `AuditLog` are irreversibly hashed with SHA-256 (`safehaven:audit:<id>`).
- Audit log messages reference pseudonyms via short hashes (`user [ref: #<hash>]`), preventing retroactive user correlation even if the database is subpoenaed.

### 5. Atomic Emergency Account Deletion ("Nuke")
- `DELETE /api/auth/nuke` executes an atomic database transaction that cascades cleanly across all child entities (`Message`, `ConversationParticipant`, orphaned `Conversation`, `QuoteSuggestion`, `ModeratorApplication`, `CommunityGroup`, `Event`, `JournalEntry`, `SafetyPlan`, `VolunteerProfile`, and `User`).
- Automatically purges local browser storage and session cookies.

### 6. Zero Third-Party Trackers & CDN Leakage
- Native typography is enforced (Google Fonts CDN link removed).
- User avatars are rendered via deterministic offline SVGs (`Avatar.tsx`), eliminating third-party IP address and name leaks to `ui-avatars.com`.
- Strict HTTP referrer policies (`no-referrer`) prevent URL leakages to external sites.

---

## 📜 Security Auditing & Automated Tests

All security controls and invariants are validated on every build:
- **Backend Security Tests (22 tests)**: Located in [`server/src/test/security.test.ts`](./server/src/test/security.test.ts) covering API error envelopes, idempotency replay, rate limiting, SWR caching, JWT cryptographic rigor, auth middleware, and recovery key hashing.
- **Frontend Security Tests (45 tests)**: Located in [`client/src/test/`](./client/src/test/) validating AES-256 encryption, key derivation, KeePassXC vault export/import, offline avatars, and route guards.
