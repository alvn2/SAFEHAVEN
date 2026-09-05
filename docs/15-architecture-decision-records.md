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
