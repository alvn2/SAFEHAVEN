# SafeHaven — Privacy Policy

**Effective Date:** March 27, 2026
**Last Updated:** March 27, 2026
**Entity:** SafeHaven Kenya Ltd ("SafeHaven", "we", "us", "our")

---

## 1. Introduction

SafeHaven ("the Platform") is a privacy-first mental health support platform. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and your rights under the Kenya Data Protection Act (2019) and applicable international standards.

**If you have questions, contact us at:** privacy@safehavenkenya.org

---

## 2. Information We Collect

### 2.1 Information We DO Collect

| Data Type | Purpose | Storage | Encryption |
|-----------|---------|---------|-----------|
| **Pseudonym** (username) | Account identification | Server (Neon PostgreSQL) | Plaintext (not sensitive) |
| **Password** | Authentication | Server (hashed) | bcrypt (12 rounds) — irreversible |
| **Recovery Key** | Account recovery | Server (encrypted) | Encrypted at rest |
| **Journal Entries** | Self-help tool | Server | AES-256 E2E encrypted — **we cannot read them** |
| **Safety Plan** | Crisis management | Server | AES-256 E2E encrypted — **we cannot read them** |
| **Forum Posts** | Peer support | Server | Plaintext (publicly visible, anonymous) |
| **Chat Messages** | 1-on-1 volunteer support | Server | Encrypted at rest |
| **Mood/Energy/Sleep Scores** | Wellness tracking | Server | Associated with pseudonym only |

### 2.2 Information We DO NOT Collect

We **never** collect, request, or store:
- ❌ Real name
- ❌ Email address
- ❌ Phone number
- ❌ Physical address
- ❌ Government ID or national ID number
- ❌ Location / GPS data
- ❌ IP address logs (beyond standard server request logs)
- ❌ Device fingerprints
- ❌ Third-party cookies or tracking pixels
- ❌ Payment information (the platform is free)

### 2.3 Volunteer Application Data

If you apply as a Volunteer, we collect additional data:
- Name, email, phone number (for verification purposes only)
- Professional qualifications and license number (if applicable)
- Experience description

This data is used **only** for volunteer vetting and is accessible **only** to SafeHaven administrators.

---

## 3. How We Use Your Information

| Purpose | Legal Basis (Kenya DPA) |
|---------|------------------------|
| Account creation and authentication | Consent (you register voluntarily) |
| Providing mental health tools (journal, safety plan) | Consent + Legitimate Interest |
| Facilitating peer support (forum, chat) | Consent |
| Volunteer verification | Legitimate Interest (user safety) |
| Platform moderation (flagged content review) | Legitimate Interest (harm prevention) |
| Aggregate analytics (total users, posts) | Legitimate Interest (no individual data) |
| Audit logging (admin actions) | Legitimate Interest (accountability) |

**We do NOT:**
- Sell your data to third parties
- Use your data for advertising
- Share individual data with governments (unless required by valid court order)
- Train AI models on your personal data
- Profile you based on your mental health data

---

## 4. Data Security

### Technical Measures

| Measure | Implementation |
|---------|---------------|
| **Transport Encryption** | HTTPS (TLS 1.3) for all communications |
| **Password Storage** | bcrypt with 12 salt rounds (irreversible hash) |
| **Journal/Safety Plan Encryption** | AES-256 client-side encryption (E2E — server cannot decrypt) |
| **Session Management** | JWT tokens with 24h expiry, 15-min inactivity timeout |
| **Token Storage** | sessionStorage only (cleared when tab/browser closes) |
| **Security Headers** | Helmet.js (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS** | Whitelist-only cross-origin requests |
| **Database** | PostgreSQL with SSL/TLS connection required |

### Organizational Measures
- Admin actions are logged in the audit trail
- Volunteer verification requires credential checks
- Content moderation follows community guidelines
- Regular security reviews

---

## 5. Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Account data | Until you delete your account |
| Journal entries | Until you delete them or nuke your account |
| Forum posts | Indefinitely (anonymous, no PII) |
| Chat messages | Until conversation is deleted |
| Volunteer applications | 2 years after decision |
| Audit logs | 3 years |

### Account Deletion ("Right to Erasure")

You can **permanently delete all your data** at any time:
1. Go to **Security Center**
2. Click **"Delete All My Data"**
3. Confirm deletion

This is **irreversible** and removes:
- Your account and credentials
- All journal entries
- Your safety plan
- All chat messages
- Your volunteer profile (if applicable)

---

## 6. Data Sharing

### We Share Data With:

| Third Party | Data Shared | Purpose |
|-------------|-------------|---------|
| **Neon (database host)** | Encrypted database contents | Data storage |
| **Render (backend host)** | Server request logs | Application hosting |
| **Vercel (frontend host)** | Static assets, deployment | Frontend hosting |

All hosting providers are bound by their own privacy policies and comply with industry security standards.

### We DO NOT Share Data With:
- Advertisers
- Data brokers
- Social media companies
- Government agencies (unless legally compelled)
- Insurance companies
- Employers

---

## 7. Your Rights (Kenya Data Protection Act 2019)

Under the Kenya DPA, you have the right to:

| Right | How to Exercise |
|-------|----------------|
| **Access** your data | View in your dashboard |
| **Correct** your data | Edit your profile/entries |
| **Delete** your data | Account nuke in Security Center |
| **Withdraw consent** | Delete your account at any time |
| **Object** to processing | Contact privacy@safehavenkenya.org |
| **Port** your data | Data export feature (coming soon) |

---

## 8. Children's Privacy

SafeHaven is intended for users **aged 13 and above**. We do not knowingly collect data from children under 13. If we discover that a child under 13 has registered, we will promptly delete their account.

---

## 9. International Data Transfers

Your data is stored on servers in the United States (Neon, Render, Vercel). These transfers are governed by:
- Standard contractual clauses
- Host provider privacy commitments
- Encryption in transit and at rest

---

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of the platform after changes constitutes acceptance of the updated policy.

---

## 11. Contact Us

**Data Protection Officer:**
- Email: privacy@safehavenkenya.org
- Web: [safehavenkenya.vercel.app/legal/privacy](https://safehavenkenya.vercel.app/legal/privacy)

**ODPC (Office of the Data Protection Commissioner Kenya):**
- Website: [odpc.go.ke](https://www.odpc.go.ke)
- For complaints about how your data is handled

---

*SafeHaven Kenya Ltd — Privacy is not a feature, it's the foundation.*
