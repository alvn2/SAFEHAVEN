# SafeHaven Architecture Decision Records (ADRs)

This document records the architectural and design decisions made for **SafeHaven Kenya**, the alternatives evaluated, and the accepted tradeoffs.

---

## ADR Template

```markdown
### ADR-XXX: [Title]
- **Status**: [Proposed | Accepted | Superseded | Deprecated]
- **Date**: YYYY-MM-DD
- **Context**: [What was the problem or constraint driving this decision?]
- **Decision**: [What did we decide to do?]
- **Alternatives Considered & Rejected**:
  - [Alternative 1]: [Why rejected]
  - [Alternative 2]: [Why rejected]
- **Consequences & Tradeoffs**:
  - Positive: [Benefits gained]
  - Negative/Risks: [Accepted costs or constraints]
```

---

## ADR-001: Zero-Knowledge Client-Side AES-256 Encryption for Journals & Safety Plans
- **Status**: Accepted
- **Date**: 2026-09-05
- **Context**: Seekers using SafeHaven in Kenya face severe social stigma, familial discovery risks, and potential legal exposure around mental health crises and self-harm disclosures. Storing unencrypted journal entries in PostgreSQL creates catastrophic data breach and subpoena liability.
- **Decision**: Encrypt all journal text entries and safety plans client-side in the browser using AES-256 (OpenSSL-compatible PBKDF2 key derivation with random salt) before sending any data over the wire. The decryption key is derived strictly from the seeker's passphrase and cached only in `sessionStorage` (`sh_key`) for the active session.
- **Alternatives Considered & Rejected**:
  - *Server-Side Encryption at Rest (pgenocrypto / AWS KMS)*: Rejected. If server infrastructure or database credentials are compromised, all seeker diaries can be decrypted in plaintext.
  - *Asymmetric RSA/ECC Public Key Encryption*: Rejected for journal entries. Adds computational overhead for mobile devices and requires complex public key management for single-user journal entries.
- **Consequences & Tradeoffs**:
  - **Positive**: Zero plaintext data reaches the database or server logs. The backend cannot read entries even under court order or database compromise.
  - **Negative**: If a seeker permanently loses both their password and 12-word recovery mnemonic, their diary is mathematically unrecoverable.

---

## ADR-002: Sovereign KeePassXC-Style Offline Vault (`.safevault`) vs Mandatory Cloud Sync
- **Status**: Accepted
- **Date**: 2026-09-05
- **Context**: Many Kenyan users in rural or informal settlements have intermittent, metered 2G/3G mobile data connections. Requiring continuous cloud synchronization prevents offline crisis management and diary writing.
- **Decision**: Implement a dual-mode hybrid storage engine. Users can toggle between **Cloud Sync (Text-Only)** and **Device Vault (KeePassXC-style)**. In Device Vault mode, zero bytes are transmitted to any server. Seekers can export and import an encrypted `.safevault` container file directly to their device storage.
- **Alternatives Considered & Rejected**:
  - *Cloud-Only Synchronized Database*: Rejected. Breaks completely when the user is offline or out of mobile data bundles.
  - *Unencrypted LocalStorage Only*: Rejected. Device inspection by family members or police would expose unencrypted crisis diaries.
- **Consequences & Tradeoffs**:
  - **Positive**: Complete user sovereignty. 100% functionality with zero network access. Zero server storage cost.
  - **Negative**: The user is solely responsible for exporting and backing up their `.safevault` file to avoid device loss.

---

## ADR-003: Deprecation of Audio Voice Recording to Protect Neon 500 MB Free-Tier
- **Status**: Accepted
- **Date**: 2026-09-05
- **Context**: SafeHaven operates on a strict $0.00/month budget using Neon PostgreSQL's Free Tier (500 MB limit). Base64 audio recordings consume 1 MB to 3 MB each. Storing voice recordings would exhaust the entire database quota within ~200 entries, forcing paid tier upgrades ($19+/month) or catastrophic write outages. Furthermore, voice recordings introduce acoustic biometric liability under KDPA 2019.
- **Decision**: Deprecate and remove client-side voice recording. Enforce text-only reflections for cloud synchronization (~500 bytes per entry). Maintain backward-compatible playback for pre-existing audio recordings.
- **Alternatives Considered & Rejected**:
  - *AWS S3 / Cloudflare R2 Audio Bucket*: Rejected. Introduces recurring credit card requirements, egress bandwidth costs, and additional infrastructure complexity outside the zero-dollar mandate.
  - *Client-Side Audio Compression*: Rejected. Even heavily compressed Opus audio (~100 KB) exhausts 500 MB quota 200x faster than text.
- **Consequences & Tradeoffs**:
  - **Positive**: 500 MB quota can support over 500,000 text journal entries indefinitely at $0.00/month. Eliminates biometric voiceprint legal liabilities under the Kenyan Data Protection Act 2019.
  - **Negative**: Seekers who prefer speaking over typing must use external voice memos or dictate via OS speech-to-text.

---

## ADR-004: In-Process Sliding-Window Rate Limiting & SWR Caching vs Managed Redis
- **Status**: Accepted
- **Date**: 2026-09-05
- **Context**: High-frequency scraping of the volunteer directory and brute-force authentication attacks threaten server availability. However, hosted Redis (Upstash / Redis Cloud) incurs external network latency, connection limits, and potential monthly billing.
- **Decision**: Implement in-process, sliding-window rate limiters (`rateLimit.ts`) and memory caching with HTTP `stale-while-revalidate` headers (`cache.ts`). Automatically clean up stale keys via `.unref()` timers to avoid holding Node's event loop.
- **Alternatives Considered & Rejected**:
  - *Redis / BullMQ Queue*: Rejected for current single-instance deployment. Unnecessary operational overhead and financial cost for SafeHaven's current scale.
  - *No Caching / Raw DB Queries*: Rejected. Repeated directory lookups unnecessarily consume Neon PostgreSQL compute hours and connection pool slots.
- **Consequences & Tradeoffs**:
  - **Positive**: Zero external dependencies, instant sub-millisecond lookups, zero monthly cost, clean test exit times.
  - **Negative**: If scaled horizontally to multiple Render container replicas in the future, rate limits and caches will be local to each replica until migrated to a shared store.

---

## ADR-005: Structural Seeker De-Tracking from Admin Roster & Surveillance Isolation
- **Status**: Accepted
- **Date**: 2026-09-07
- **Context**: In mental health platforms, internal administrative surveillance represents a major de-anonymization threat vector. A compromised administrator account or insider threat could observe which pseudonyms exist, correlating them with community activities or timestamps.
- **Decision**: Structurally exclude regular seekers (`role: 'USER'`) from all administrative user listings on the backend (`server/src/routes/admin.ts` enforces `where: { role: { not: 'USER' } }`). Rename the administrative management view to **"Volunteers & Staff"**, restricting admin oversight strictly to verified listeners, licensed counselors, and moderators.
- **Alternatives Considered & Rejected**:
  - *Show Hashed/Masked Usernames to Admins*: Rejected. Even masked entries leak total user counts, registration velocity, and activity timestamps to administrative eyes.
  - *Full Seeker Admin Management*: Rejected. Administrators have no operational reason to view or alter anonymous seeker accounts.
- **Consequences & Tradeoffs**:
  - **Positive**: Eliminates administrative surveillance liability. It is mathematically and architecturally impossible for an administrator to list or enumerate seekers via the UI or admin endpoints.
  - **Negative**: If a seeker experiences account lockouts, administrators cannot manually assist them; seekers must rely on their sovereign 12-word recovery key.

---

## ADR-006: Client-Side End-to-End Peer Chat Encryption & Backdoor Elimination
- **Status**: Accepted
- **Date**: 2026-09-07
- **Context**: Real-time crisis dialogues between seekers and volunteers must be private. In previous iterations, messages were stored in plaintext, and administrators possessed an unlogged bypass (`&& user.role !== 'ADMIN'`) to join any private chat room.
- **Decision**: 
  1. Derive a deterministic session key per conversation (`deriveChatKey(conversationId)` using SHA-256) and encrypt all chat messages client-side using AES-256 before transmitting over WebSockets or HTTP.
  2. Eliminate the administrator room-join backdoor in `server/src/index.ts`. Only verified conversation participants may join socket rooms or receive real-time messages.
- **Alternatives Considered & Rejected**:
  - *Server-Side DB Encryption*: Rejected. Server holds the key in memory and can inspect messages in transit.
  - *Public Key Double Ratchet (Signal Protocol)*: Deferred. Highly complex for browser ephemeral sessions without continuous multi-device key exchange infrastructure.
- **Consequences & Tradeoffs**:
  - **Positive**: Server and database administrators cannot read private support dialogues. Eavesdropping backdoors are eliminated.
  - **Negative**: Conversation participants must compute client-side decryption on load.

---

## ADR-007: Atomic Cascadeless Emergency Account Deletion ("Nuke")
- **Status**: Accepted
- **Date**: 2026-09-07
- **Context**: The emergency account deletion feature crashed with PostgreSQL foreign key constraint violation (`23503`) when deleting users who had sent messages, joined conversations, submitted quotes, or created journal entries.
- **Decision**: Implement an atomic `prisma.$transaction` in `server/src/routes/auth.ts` that systematically sweeps all dependent records (`Message`, `ConversationParticipant`, orphaned `Conversation`, `QuoteSuggestion`, `ModeratorApplication`, `CommunityGroup`, `Event`, `JournalEntry`, `SafetyPlan`, `VolunteerProfile`) before deleting the `User` record.
- **Alternatives Considered & Rejected**:
  - *Soft Deletion (`deletedAt` flag)*: Rejected. Soft-deleted records leave sensitive residual data and relationship graphs on disk.
  - *Database `ON DELETE CASCADE`*: Partially rejected as primary mechanism because Prisma client and raw migration schemas can desynchronize across different staging environments. The explicit transaction guarantees safety regardless of migration drift.
- **Consequences & Tradeoffs**:
  - **Positive**: Guaranteed 100% clean erasure of all user traces without database constraint crashes.
  - **Negative**: Transaction locks dependent records for a few milliseconds during deletion.

---

## ADR-008: Local Privacy Guard & Elimination of Third-Party Trackers
- **Status**: Accepted
- **Date**: 2026-09-07
- **Context**: Mobile OS task switchers take unencrypted screenshots of background apps, external messenger links (WhatsApp/Telegram) can expose real phone numbers, and third-party CDNs (Google Fonts, avatar generators) leak user IP addresses.
- **Decision**:
  1. Add a full-viewport `PrivacyMask` triggered by `document.visibilitychange` to obscure the UI whenever the app is backgrounded.
  2. Implement `ExternalLinkWarning` with explicit de-anonymization warnings for WhatsApp (`wa.me`) and Telegram (`t.me`).
  3. Remove all external Google Fonts links (use native system typography).
  4. Replace `ui-avatars.com` with fully offline SVG initials avatars (`Avatar.tsx`).
  5. Enforce `<meta name="referrer" content="no-referrer">` and Helmet HTTP referrer policy.
- **Alternatives Considered & Rejected**:
  - *Self-hosted WOFF2 webfonts*: Rejected to minimize network payload on Kenyan 2G/3G mobile networks and improve Largest Contentful Paint (LCP).
- **Consequences & Tradeoffs**:
  - **Positive**: Zero outbound network requests to analytics or CDN trackers; zero phone leaks; screenshot-proof task switching.
  - **Negative**: External links require a 1-click confirmation modal.
