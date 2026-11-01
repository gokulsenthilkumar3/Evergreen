# User Management — Complete Feature Inventory

Two populations share the word "user" in EverGreen and must not be conflated. Every feature below is tagged to one, both, or bridging.

- **P-users** — Provider-side operators using the admin portal (EverGreen's own team).
- **C-users** — Customer-side staff using an ERP workspace (spinning-mill employees).
- **S-users** — Non-human identities (API tokens, service accounts, webhook receivers, owner approval tool credentials).

Each feature is tagged `P0` (foundation), `P1` (needed for a real product), `P2` (mature / enterprise). Features that touch the Proof Spine note which state they emit or consume.

---

## A. Identity & Account Foundation

| #   | Feature                                                                           | Pop   | Pri | Notes                                           |
| --- | --------------------------------------------------------------------------------- | ----- | --- | ----------------------------------------------- |
| A1  | User CRUD (create, read, update, soft-delete)                                     | P + C | P0  | Every mutation writes an audit row → `recorded` |
| A2  | Unique identity: username + verified email                                        | P + C | P0  | Email change requires re-verification           |
| A3  | Human-readable display name + avatar (initials fallback)                          | P + C | P1  |                                                 |
| A4  | Stable user ID (UUID) separate from email                                         | P + C | P0  | Email changes must not orphan audits            |
| A5  | Profile completeness score                                                        | P + C | P2  | Drives onboarding nudges                        |
| A6  | Account status state machine: `pending → active → suspended → disabled → deleted` | P + C | P0  | Each transition = audit row                     |
| A7  | Linked identities (same human, multiple accounts)                                 | P     | P2  | E.g. operator with admin + auditor logins       |
| A8  | Timezone, locale, date/time format per user                                       | P + C | P1  |                                                 |
| A9  | Custom attributes / metadata (JSON)                                               | P     | P2  | For enterprise tiering                          |
| A10 | Account recovery contacts                                                         | P     | P2  | Out-of-band, not a security answer              |

**Proof hooks:** A1 → `recorded`; A6 → `recorded`; A2 (email verify) → `verified` when the confirmation token is redeemed.

---

## B. Authentication

| #   | Feature                                                                        | Pop   | Pri | Notes                                                          |
| --- | ------------------------------------------------------------------------------ | ----- | --- | -------------------------------------------------------------- |
| B1  | Password login with Argon2id hashing                                           | P + C | P0  |                                                                |
| B2  | Password strength meter + breach list (HIBP k-anonymity)                       | P + C | P0  |                                                                |
| B3  | Password rotation policy (configurable, not forced)                            | P     | P1  | Don't expire on schedule; expire on suspicion                  |
| B4  | Password reset via time-boxed token (single-use, 15 min)                       | P + C | P0  | → `verified` when redeemed                                     |
| B5  | Email OTP / magic link                                                         | P + C | P1  | Passwordless path                                              |
| B6  | TOTP (RFC 6238) second factor                                                  | P + C | P0  |                                                                |
| B7  | WebAuthn / passkeys (platform + roaming)                                       | P + C | P0  | The impl doc lists this as required; `verified` on attestation |
| B8  | Recovery codes (10 × single-use)                                               | P + C | P0  | Required when passkeys enabled                                 |
| B9  | Hardware security key support (FIDO2)                                          | P     | P1  | For owner-key holders                                          |
| B10 | SMS OTP (fallback only)                                                        | P + C | P2  | Discouraged; carrier risk                                      |
| B11 | SSO via OIDC / SAML 2.0                                                        | P     | P1  | For enterprise customers' operators                            |
| B12 | SCIM 2.0 for user provisioning                                                 | P     | P2  | Enterprise tier                                                |
| B13 | Passkey re-attestation cadence (e.g. annually)                                 | P     | P1  | Emits `stale` when overdue                                     |
| B14 | Step-up authentication for sensitive actions                                   | P     | P0  | Re-auth within N minutes for key actions                       |
| B15 | Login attempt throttling (per IP + per account)                                | P + C | P0  |                                                                |
| B16 | Account lockout with time-boxed release                                        | P + C | P0  | Prefer exponential backoff over hard lock                      |
| B17 | Trusted device registration + revoke                                           | P + C | P1  |                                                                |
| B18 | Device fingerprint display (UA, IP country, last seen)                         | P + C | P1  |                                                                |
| B19 | Sign-in notifications (new device, new country)                                | P     | P1  |                                                                |
| B20 | Risk-based auth (impossible travel, new ASN)                                   | P     | P2  | Requires geo-IP enrichment                                     |
| B21 | Passkey upgrade nudge (password → passkey)                                     | P + C | P1  | Track adoption %                                               |
| B22 | Owner signing key bind: some P-users hold a role requiring the laptop-side key | P     | P0  | EverGreen-specific: key never leaves owner laptop              |

**Proof hooks:** B4 → `verified` on token redeem; B7 → `verified` on attestation, `stale` on expiry; B13 → `stale` when due; B14 → new audit row per step-up.

---

## C. Authorization & RBAC

| #   | Feature                                                                            | Pop   | Pri | Notes                                               |
| --- | ---------------------------------------------------------------------------------- | ----- | --- | --------------------------------------------------- |
| C1  | Role definitions (built-in + custom)                                               | P + C | P0  |                                                     |
| C2  | Permission catalogue (resource.action, e.g. `company.read`, `deployment.rollback`) | P + C | P0  | Explicit list, versioned                            |
| C3  | Role → permission matrix editor                                                    | P     | P0  |                                                     |
| C4  | User → role assignment (multiple roles per user)                                   | P + C | P0  |                                                     |
| C5  | **Scoped access**: role grant bound to company / region / module / environment     | P     | P0  | An operator may be Ops only for two mills           |
| C6  | Time-bound role grants (expire automatically)                                      | P     | P1  | Emits `stale` when near expiry                      |
| C7  | Conditional access (IP allow-list, VPN required, MFA-verified session)             | P     | P1  |                                                     |
| C8  | Deny-overrides-allow precedence, auditable                                         | P     | P0  | Explicit, not implicit                              |
| C9  | Effective-permission preview ("what can this user do right now?")                  | P     | P1  |                                                     |
| C10 | Bulk role reassignment                                                             | P     | P1  |                                                     |
| C11 | Default role on invitation                                                         | P + C | P0  |                                                     |
| C12 | Role templates for new companies                                                   | P     | P1  | When registering a mill, auto-create standard roles |
| C13 | Cross-company roles (account manager, support engineer)                            | P     | P0  |                                                     |
| C14 | Delegated admin (customer tenant admin manages own users)                          | C     | P1  |                                                     |
| C15 | Per-staff endpoint enablement (route enabled vs route existing)                    | C     | P0  | The doc calls this out explicitly                   |
| C16 | Feature flag per user (beta features, pilot programs)                              | P     | P1  |                                                     |
| C17 | Approval workflows for sensitive grants (two-person rule)                          | P     | P1  | Emits `requested → executed → verified`             |
| C18 | Segregation of duties (e.g. nobody can approve their own deploy + sign-off)        | P     | P0  | EverGreen-critical                                  |

**Proof hooks:** C4 → `recorded`; C5 → `recorded`; C6 → `stale` on near-expiry, `failed` on attempted use after expiry; C17 → full `requested → executed → verified` chain.

---

## D. Tenant & Organisational Structure

| #   | Feature                                                           | Pop   | Pri | Notes                                  |
| --- | ----------------------------------------------------------------- | ----- | --- | -------------------------------------- |
| D1  | Provider org (single, "EverGreen") vs customer org (one per mill) | Both  | P0  | Two distinct tenant roots              |
| D2  | Teams / sub-groups within a provider org                          | P     | P1  | Ops team, Billing team, Support pod    |
| D3  | Team → role mappings                                              | P     | P1  |                                        |
| D4  | Teams scoped to a subset of customers                             | P     | P1  | "APAC support pod"                     |
| D5  | Department structure inside a customer ERP workspace              | C     | P1  | Production, Sales, Accounts, Stores    |
| D6  | Department-scoped permissions for C-users                         | C     | P1  | A storekeeper sees stores, not payroll |
| D7  | Reporting lines / manager field                                   | P + C | P2  | For approval routing                   |
| D8  | Cost-centre / billing entity association                          | P     | P2  |                                        |
| D9  | Region / territory assignment                                     | P     | P1  |                                        |
| D10 | Customer-tenant admin delegation (see C14)                        | C     | P1  |                                        |
| D11 | Cross-tenant contract relationships (reseller, MSP)               | P     | P2  | If EverGreen ever has partners         |

---

## E. Sessions & Devices

| #   | Feature                                                                       | Pop   | Pri | Notes                                               |
| --- | ----------------------------------------------------------------------------- | ----- | --- | --------------------------------------------------- |
| E1  | Active session list per user (IP, UA, last-seen, device fingerprint)          | P + C | P0  |                                                     |
| E2  | Force-revoke a single session                                                 | P + C | P0  |                                                     |
| E3  | Force-revoke all sessions for a user                                          | P     | P0  |                                                     |
| E4  | Force-revoke all sessions for a company (incident response)                   | P     | P0  |                                                     |
| E5  | Session timeout (absolute + idle) configurable per role                       | P     | P1  |                                                     |
| E6  | Concurrent session limit (per user, per role)                                 | P     | P1  |                                                     |
| E7  | Trusted device register / trust duration                                      | P + C | P1  |                                                     |
| E8  | Session riding protection (CSRF, SameSite, rotation)                          | P + C | P0  | Implementation detail surfaced in UI as "protected" |
| E9  | "Last active" + "current session" indicator                                   | P + C | P0  |                                                     |
| E10 | Session anomaly alert (new country, new device, impossible travel)            | P     | P1  |                                                     |
| E11 | Global session timeline in Proof & Audit                                      | P     | P1  | Merge auth events into the ledger                   |
| E12 | Session-narrowing on privilege change (roles changed → sessions re-validated) | P     | P0  |                                                     |

**Proof hooks:** E1 → `executed` on session create; E2/E3/E4 → `executed` when confirmed revoked; E10 → `failed` state on the parent entity if abuse suspected.

---

## F. Invitations & Onboarding

| #   | Feature                                                            | Pop   | Pri | Notes                               |
| --- | ------------------------------------------------------------------ | ----- | --- | ----------------------------------- |
| F1  | Invite by email (single)                                           | P + C | P0  |                                     |
| F2  | Bulk invite (CSV paste, max N per batch)                           | P     | P1  |                                     |
| F3  | Invite link with configurable TTL + single-use                     | P + C | P0  | → `requested → executed → verified` |
| F4  | Role preselection in invite                                        | P + C | P0  |                                     |
| F5  | Scoped invite (this user only sees company X)                      | P     | P1  |                                     |
| F6  | Invite status tracking (sent, opened, accepted, expired)           | P     | P1  | Per-invite proof states             |
| F7  | Resend / revoke invite                                             | P     | P0  |                                     |
| F8  | Personalised onboarding checklist                                  | P + C | P1  | Track completion                    |
| F9  | Guided setup: MFA enrollment before first login                    | P + C | P0  | Fail closed                         |
| F10 | Passkey enrolment on first login                                   | P + C | P1  |                                     |
| F11 | Terms acceptance with version tracking                             | P + C | P1  | Recorded with timestamp + IP        |
| F12 | Welcome tour / tooltip walkthrough                                 | P + C | P2  |                                     |
| F13 | Onboarding completion gates (cannot access until X done)           | P     | P1  |                                     |
| F14 | Domain-verified self-signup (if a customer's email domain matches) | C     | P2  |                                     |
| F15 | Referral / re-invite by existing user                              | C     | P2  |                                     |
| F16 | Approval-required onboarding (manager must approve)                | P + C | P1  | → `requested → executed → verified` |

**Proof hooks:** The full invitation lifecycle is the cleanest demonstration of the spine — `recorded` (invite row) → `requested` (email dispatched, we have a send receipt) → `executed` (recipient clicked link) → `verified` (user completed MFA enrolment).

---

## G. Lifecycle & Offboarding

| #   | Feature                                                               | Pop   | Pri | Notes                                                |
| --- | --------------------------------------------------------------------- | ----- | --- | ---------------------------------------------------- |
| G1  | Suspend user (temporary, reversible)                                  | P + C | P0  | Active sessions revoked                              |
| G2  | Disable user (permanent until re-enabled)                             | P + C | P0  |                                                      |
| G3  | Delete user (soft → hard after retention window)                      | P + C | P0  | Hard delete audited separately                       |
| G4  | Transfer ownership of records before deletion                         | P + C | P0  | Company registry entries, deployments, webhooks      |
| G5  | Offboarding checklist (revoke sessions, rotate tokens, reassign work) | P     | P1  |                                                      |
| G6  | Retire unused API tokens / service accounts owned by the user         | P     | P0  |                                                      |
| G7  | Deactivation reason capture                                           | P     | P1  |                                                      |
| G8  | Rehire / reactivate path                                              | P + C | P2  |                                                      |
| G9  | Data retention policy per tenant                                      | P     | P1  | GDPR/PII                                             |
| G10 | Right-to-erasure workflow (GDPR Art. 17)                              | P + C | P1  | Anonymises audit references but preserves chain hash |
| G11 | Scheduled deletions (next purge date preview)                         | P     | P2  |                                                      |
| G12 | Orphan-record detection (a user who owned records is being deleted)   | P     | P0  | Block or require transfer first                      |

**Proof hooks:** G1–G3 → `executed` (revocation confirmed by session-list read-back); G10 → preserved as a "redacted" audit variant, never removed from the chain.

---

## H. Self-Service Profile

| #   | Feature                                      | Pop   | Pri | Notes                                      |
| --- | -------------------------------------------- | ----- | --- | ------------------------------------------ |
| H1  | Change password                              | P + C | P0  |                                            |
| H2  | Change display name / avatar                 | P + C | P1  |                                            |
| H3  | Change email (re-verify)                     | P + C | P0  | → `verified` after confirmation            |
| H4  | Add / remove MFA methods                     | P + C | P0  |                                            |
| H5  | Add / remove passkeys                        | P + C | P0  |                                            |
| H6  | View and revoke own sessions                 | P + C | P0  |                                            |
| H7  | View own permission set (self-audit)         | P + C | P1  | "What can I do?"                           |
| H8  | Notification preferences                     | P + C | P1  |                                            |
| H9  | Timezone / locale / theme                    | P + C | P1  |                                            |
| H10 | Personal API tokens (issue, rotate, revoke)  | P     | P1  | Scoped by user's own permissions           |
| H11 | Download personal data export                | P + C | P1  |                                            |
| H12 | Delete-own-account request flow              | P + C | P2  | Goes through approval                      |
| H13 | Emergency contacts                           | P     | P2  |                                            |
| H14 | Accessibility preferences (motion, contrast) | P + C | P1  | Feeds the shell's `prefers-reduced-motion` |

---

## I. Security & Threat Response

| #   | Feature                                                             | Pop   | Pri | Notes                                                    |
| --- | ------------------------------------------------------------------- | ----- | --- | -------------------------------------------------------- |
| I1  | Failed-login dashboard (per user, per IP)                           | P     | P0  |                                                          |
| I2  | Impossible-travel detection                                         | P     | P2  |                                                          |
| I3  | Credential-stuffing detection (same password across N users)        | P     | P1  |                                                          |
| I4  | Compromise workflow ("this user is compromised, freeze everything") | P     | P0  | One-click: revoke sessions, rotate tokens, force re-auth |
| I5  | Breach notification workflow                                        | P     | P1  | Produce a disclosure record                              |
| I6  | IP allow-list per user / per role                                   | P     | P1  |                                                          |
| I7  | IP deny-list (global)                                               | P     | P0  |                                                          |
| I8  | Bot detection on auth endpoints                                     | P + C | P2  |                                                          |
| I9  | Security key attestation for owner-key holders                      | P     | P0  | EverGreen-specific                                       |
| I10 | Session replay protection (one-time tokens)                         | Both  | P0  |                                                          |
| I11 | Step-up re-auth for sensitive actions (B14 surfaced)                | P     | P0  |                                                          |
| I12 | Break-glass emergency access (audited, alerted, time-boxed)         | P     | P1  |                                                          |
| I13 | Lockout-status overview (all locked users)                          | P     | P0  |                                                          |
| I14 | Password-spray detection on customer side                           | C     | P2  |                                                          |

**Proof hooks:** I4 → `failed` on user, `executed` on each revocation step; I12 → `executed` on open, `verified` on close with reason.

---

## J. Audit, Compliance & Proof-Spine Integration

| #   | Feature                                                        | Pop   | Pri | Notes                        |
| --- | -------------------------------------------------------------- | ----- | --- | ---------------------------- |
| J1  | Every user-management mutation writes an `audit_ledger` row    | P + C | P0  | Non-negotiable               |
| J2  | Per-user audit timeline ("everything this user did")           | P     | P0  |                              |
| J3  | Per-role audit timeline ("everyone who has this role")         | P     | P1  |                              |
| J4  | Per-grant timeline ("how long has this user been an admin?")   | P     | P1  |                              |
| J5  | Access-review evidence export (signed JSON bundle)             | P     | P1  |                              |
| J6  | Attestation of role grants (user or manager attests quarterly) | P     | P1  | `verified` or `stale`        |
| J7  | Chain-verification button in user inspector                    | P     | P1  | Same as ledger               |
| J8  | Tamper-evidence indicator per user                             | P     | P1  | Red spine on broken chain    |
| J9  | Auth-event stream (logins, logouts, MFA events)                | P + C | P0  |                              |
| J10 | Export of audit for an external auditor                        | P     | P1  | Signed, redactable           |
| J11 | Retention policy per user class                                | P     | P1  |                              |
| J12 | Proof state change history for the user entity                 | P     | P0  |                              |
| J13 | "Why was this user's proof state changed?" drill-down          | P     | P0  | The whole point of the spine |

**Proof hooks:** The user entity itself carries a proof state; its transitions are the audit ledger.

---

## K. Delegation & Impersonation

| #   | Feature                                                    | Pop   | Pri | Notes                                       |
| --- | ---------------------------------------------------------- | ----- | --- | ------------------------------------------- |
| K1  | Support impersonation ("view as user X")                   | P     | P1  | Never a silent login; produces an audit row |
| K2  | Impersonation banner in the UI (cannot be dismissed)       | P     | P0  |                                             |
| K3  | Impersonation capability scoped to read-only by default    | P     | P0  |                                             |
| K4  | Write-impersonation requires a second approval             | P     | P1  | → `requested → executed`                    |
| K5  | Time-boxed delegation (user A acts for user B for N hours) | P + C | P1  |                                             |
| K6  | Delegation revocation                                      | P + C | P0  |                                             |
| K7  | View-as-customer (see the mill's workspace as they do)     | P     | P1  | Different from impersonating a user         |
| K8  | Approval delegation (approver is away, deputy approves)    | P + C | P1  |                                             |
| K9  | Break-glass impersonation (emergency, notified)            | P     | P1  |                                             |

**Proof hooks:** Every impersonation begins a new audit context and produces at minimum `executed`; the impersonated user sees it in their own session log.

---

## L. Service Accounts & Non-Human Identity (S-users)

| #   | Feature                                                           | Pop | Pri | Notes                  |
| --- | ----------------------------------------------------------------- | --- | --- | ---------------------- |
| L1  | Service account creation (machine identity, no password)          | P   | P0  |                        |
| L2  | API token issuance (scoped, time-boxed, max 1 per purpose)        | P   | P0  |                        |
| L3  | Token scopes (per-resource, per-action)                           | P   | P0  |                        |
| L4  | Token rotation schedule + rotate-now button                       | P   | P0  |                        |
| L5  | Token expiry + last-used display                                  | P   | P0  |                        |
| L6  | Token fingerprint (visible), token value (hidden after creation)  | P   | P0  |                        |
| L7  | Customer API monitoring credential (per company)                  | P   | P0  | The doc calls this out |
| L8  | Webhook signing secret (per endpoint)                             | P   | P0  |                        |
| L9  | Owner approval tool credential (laptop-side)                      | P   | P0  |                        |
| L10 | Connector credential (per integrated service)                     | P   | P0  | AWS, GCP, Slack, etc.  |
| L11 | Credential rotation reminders                                     | P   | P1  | `stale` on overdue     |
| L12 | Scope minimisation assistant ("this token has 40 scopes, uses 3") | P   | P1  |                        |
| L13 | Token leaked-in-public detection (GitHub scanning)                | P   | P2  |                        |
| L14 | Per-service-account rate limit                                    | P   | P0  |                        |
| L15 | Audit trail per service account                                   | P   | P0  |                        |
| L16 | Human-readable purpose / owner field                              | P   | P1  |                        |
| L17 | Deprecation path (mark token as deprecated, grace period)         | P   | P1  |                        |

**Proof hooks:** L2 → `recorded` on issue; L5 → `stale` when last-used exceeds TTL; L13 → `failed` if leaked; L12 → advisory.

---

## M. Notifications & Communication

| #   | Feature                                              | Pop   | Pri | Notes                                |
| --- | ---------------------------------------------------- | ----- | --- | ------------------------------------ |
| M1  | In-app notification centre                           | P + C | P0  |                                      |
| M2  | Per-channel preference (email, in-app, webhook)      | P + C | P1  |                                      |
| M3  | Security-critical notifications (cannot be disabled) | P     | P0  |                                      |
| M4  | Broadcast messaging (an operator to a set of users)  | P     | P1  |                                      |
| M5  | Bulk email with template                             | P     | P1  |                                      |
| M6  | Message templates (per event type)                   | P     | P1  |                                      |
| M7  | Delivery status tracking per message                 | P     | P1  | Proof spine applied to notifications |
| M8  | Scheduled notifications                              | P     | P2  |                                      |
| M9  | User-to-user direct message (Channels)               | P     | P1  | Overlaps ChatOps                     |
| M10 | Digest mode (daily / weekly summary)                 | P + C | P2  |                                      |

---

## N. Access Reviews & Attestation

| #   | Feature                                                        | Pop | Pri | Notes            |
| --- | -------------------------------------------------------------- | --- | --- | ---------------- |
| N1  | Scheduled access-review campaigns (quarterly)                  | P   | P1  |                  |
| N2  | Reviewer assignment (manager, role owner)                      | P   | P1  |                  |
| N3  | Approve / revoke in bulk                                       | P   | P1  |                  |
| N4  | Auto-revoke on missed review window                            | P   | P1  | `stale → failed` |
| N5  | Per-grant attestation ("I confirm X should still be an admin") | P   | P1  | `verified`       |
| N6  | Evidence export                                                | P   | P1  |                  |
| N7  | Self-attestation for sensitive roles (owner-key holders)       | P   | P0  |                  |
| N8  | Drift detection ("role differs from baseline")                 | P   | P2  |                  |

---

## O. Owner-Key Custody (EverGreen-specific)

The doc is emphatic: _"Your laptop → Owner signing key and owner approval tools"_. This is a distinct class of user-management feature because it involves operations the _portal cannot perform_.

| #   | Feature                                                              | Pop | Pri | Notes                                             |
| --- | -------------------------------------------------------------------- | --- | --- | ------------------------------------------------- |
| O1  | Identify which P-users hold the owner-approval role                  | P   | P0  | Portal-side registry                              |
| O2  | Bind a user to a specific owner-key fingerprint (laptop-generated)   | P   | P0  | Cannot be generated from cloud                    |
| O3  | Require hardware key for owner-approval actions                      | P   | P0  |                                                   |
| O4  | Two-of-N approval for critical actions (key rotation, restore drill) | P   | P1  | Needs ≥2 owner-key holders                        |
| O5  | Owner-key holder registry with re-attestation cadence                | P   | P1  | `stale` after window                              |
| O6  | Emergency removal of an owner-key holder                             | P   | P1  | Requires another key holder                       |
| O7  | "Laptop unavailable" contingency workflow                            | P   | P0  | What happens when the laptop is offline           |
| O8  | Signed-action ledger linking a portal record to a laptop signature   | P   | P1  | The **only** path to `verified` for owner actions |
| O9  | Read-only preview of what a pending owner approval would authorise   | P   | P0  |                                                   |
| O10 | Alerting when owner-key use is attempted from an unexpected device   | P   | P1  |                                                   |

**Proof hooks:** This is the strongest case for `verified` in the whole system — a laptop signature over a known digest is _independent, cryptographic_ evidence the cloud did not forge.

---

## P. Customer ERP Staff Management (C-users, per mill)

| #   | Feature                                                                                  | Pop  | Pri | Notes                                   |
| --- | ---------------------------------------------------------------------------------------- | ---- | --- | --------------------------------------- |
| P1  | Provision a C-user inside a specific company workspace                                   | C    | P0  |                                         |
| P2  | Per-staff endpoint enablement (doc: "route being enabled for a particular staff member") | C    | P0  |                                         |
| P3  | Business roles inside ERP (owner, manager, accountant, storekeeper, production)          | C    | P0  |                                         |
| P4  | Department scope (stores only, sales only)                                               | C    | P1  |                                         |
| P5  | Branch / site scope (multi-location mills)                                               | C    | P1  |                                         |
| P6  | Shift / roster association                                                               | C    | P2  |                                         |
| P7  | Reporting-manager link for approvals                                                     | C    | P1  |                                         |
| P8  | Delegation inside the mill (manager away, deputy acts)                                   | C    | P1  |                                         |
| P9  | Mill-owner billing responsibilities                                                      | C    | P1  |                                         |
| P10 | Access-review by the mill's own admin (delegated admin)                                  | C    | P1  |                                         |
| P11 | Staff-count enforcement against licence quota                                            | Both | P0  | Registration form already tracks quotas |
| P12 | Cross-company staff (rare — e.g. a group finance manager)                                | C    | P2  |                                         |
| P13 | Staff-account suspension when licence lapses                                             | Both | P0  | Automatic, audited                      |
| P14 | Onboarding walkthrough tailored to the staff role                                        | C    | P1  |                                         |

---

## Q. Cross-Cutting Infrastructure

| #   | Feature                                                                      | Pop   | Pri | Notes                                                 |
| --- | ---------------------------------------------------------------------------- | ----- | --- | ----------------------------------------------------- |
| Q1  | Search across users (name, email, role, company)                             | P + C | P0  | Fed by `GET /control/search`                          |
| Q2  | Saved views / filters                                                        | P     | P1  |                                                       |
| Q3  | Bulk operations (assign role, revoke sessions, disable)                      | P     | P0  | Always with a confirm dialog showing what will happen |
| Q4  | User-management analytics (adoption, MFA %, inactive users)                  | P     | P1  |                                                       |
| Q5  | Tenant-level user quotas                                                     | P     | P1  |                                                       |
| Q6  | Username / email collision handling across tenants                           | Both  | P0  | Distinct roots (D1) resolve this                      |
| Q7  | Import / export users (CSV)                                                  | P     | P1  | With dry-run preview                                  |
| Q8  | API for user management (SCIM + custom REST)                                 | P     | P1  |                                                       |
| Q9  | Audit log of admin actions _on_ users                                        | P     | P0  | Meta-audit                                            |
| Q10 | Feature-flag new user-management behaviour                                   | P     | P1  | Ship safely                                           |
| Q11 | Timezone-aware display of "last active"                                      | P + C | P1  |                                                       |
| Q12 | Empty-state scenes per user-management surface (Companies, Roles, Sessions…) | P     | P1  | Reuses the pseudo-3D engine                           |
| Q13 | Keyboard-only flows for every action                                         | P + C | P0  | Accessibility                                         |
| Q14 | Command palette entries (`user invite`, `user suspend`, `session revoke`)    | P     | P1  |                                                       |
| Q15 | Proof-state filter on user list ("show me unverified owner-key holders")     | P     | P0  | Feeds Access & Roles tab                              |
| Q16 | Per-user "risk score" surfaced as a chip, not a mandate                      | P     | P2  | Advisory only                                         |

---

## R. What must be built _together_ for this to be coherent

Three clusters, and each is a "vertical slice" that cannot be shipped half-done:

1. **Auth + Proof Spine (P0):** B1–B4, B6–B8, B14, C1–C5, C8, J1, J2 — otherwise "verified" remains unreachable (the flaw we fixed last turn).
2. **Owner-Key Vertical (P0):** O1–O4, O7–O10 — without this, the portal can never attain `verified` on its most consequential actions (deploys, restore drills, key rotation). It is also the one class of feature the _cloud cannot fake_ — which is exactly why it matters.
3. **Customer-ERP staff (P0):** P1–P3, P5, P11, P13 — a mill cannot use the workspace without this; today's portal doesn't expose it.

Everything else (`P1`/`P2`) is sequencing, not scope.

---

## S. Guardrails specific to this product

- **Never mark `verified` without independent evidence** (last turn's lint rule applies to user management too).
- **Owner actions that cross the laptop boundary cannot be `executed` by the cloud alone.** The UI must show `requested` until the laptop signs, then `executed` on receipt, then `verified` on chain-check.
- **Impersonation is never silent.** Any user-management tab that offers "view as" must display the banner and write the audit row synchronously, before navigation.
- **Per-staff endpoint enablement is not the same as route existence.** Every UI that toggles it must show which proof state the route currently occupies (`recorded` enabled-for-staff ≠ `executed` was-tried ≠ `verified` returned-200-last-poll).
- **Deletion transfers ownership first.** No soft-delete path may leave `provider.db` with orphaned references to a deleted user — the audit chain will then have a dangling actor that no export can resolve.
- **Every user-management mutation is a ledger row.** If a feature can't write to `audit_ledger`, it doesn't belong in user management; it belongs in a preferences table with no security meaning.

---

That's the full inventory. The highest-leverage additions, given where the implementation stopped, are the **Owner-Key vertical (O)** and the **Customer-ERP staff vertical (P)** — both are currently listed as "backend work still required" without any UI design, and both are the only paths to making the portal's strongest claims (`verified`, `stale`) actually mean something for the people who matter most.

## Implementation review — 2026-11-01

This is a target inventory, not a delivery claim. The customer `/users` workspace and provider administration remain distinct. Additive tenant migrations were applied after verified private-database backups; existing accounts and history were retained.

### Implemented customer workflows

- Directory search, role/status/lock filters, stable sorting, pagination, CSV export, refresh, account details and username-scoped local saved views. English/Tamil controls and localized metadata dates are included.
- Stable public UUIDs alongside retained integer IDs; immutable usernames; ACTIVE/PENDING/SUSPENDED/DISABLED/DELETED lifecycle, reasoned transitions, soft deletion, transactional licence quotas and last-active-admin safeguards. Existing active accounts are retained; new accounts remain pending until verified-email/MFA onboarding.
- Argon2id for new passwords, race-safe upgrade of verified legacy hashes, password policy, failed-authentication lockouts, password changes with other-session revocation, and sensitive authenticator/passkey actions requiring current-password proof plus TOTP when enabled.
- Invitation creation/resend/revocation, single-use hashed expiry-bound tokens, recipient password/MFA enrollment, password-reset requests, verified-email changes and one-use hashed recovery codes. Explicit primary/secondary SMTP selection, authenticated connection testing, mail-server acceptance receipts and onboarding completion are distinct states.
- OIDC PKCE/state/nonce flow, explicit issuer/subject account linking, browser-bound one-use sign-in completion and local MFA. No email/domain auto-linking. Google client registration and live provider testing remain external setup steps.
- Per-staff endpoint allow-list mode with deny precedence and optional grant expiry, retained rule history, optimistic update protection, and base-role/licence ceilings. The preview describes calculated authorization; it does not claim endpoint execution or row-level isolation.
- Own/admin session listings without session tokens, individual/account-wide revocation, per-role idle/absolute expiry and concurrency policies, and own-passkey listing/removal. Purpose-bound five-minute passkey challenges are consumed atomically before counter updates.
- Account mutations in the implemented services append a local hash-linked `audit_ledger` event and compatibility activity record in the same transaction. Stable actor/subject UUIDs are retained. Tests cover database rollback, chain linkage and payload tampering. This local chain is not independent custody evidence, an external attestation, or a signed export; historical activity is not retroactively verified.

### Setup still needed

Neither SMTP app password nor a Google OAuth client secret is present. No real email delivery or Google sign-in has been verified. See [Email and sign-in setup](../docs/EMAIL_SIGNIN_SETUP.md) for hidden-input local SMTP configuration, provider registration and connection testing. The supplied Gmail/Zoho addresses do not establish ownership of any custom domain.

### Remaining inventory

- Custom/multiple roles, branch/department row scopes, reporting managers, delegation and approval workflows.
- Named provider-operator authentication and complete provider RBAC, owner-key bindings, signed quorum approvals, key rotation/contingency and laptop evidence verification. Configurable quorum requested by the owner remains unfinished.
- Configurable retention, ownership transfer and erasure workflows, personal-data export, full lost-MFA re-enrollment, trusted devices, breach/risk enrichment and incident response.
- Service accounts and scoped token lifecycle; SCIM/SAML; bulk mutations and invitation/import dry-runs; notification channels and delivery webhooks.
- Access-review campaigns, independent attestations/signed audit exports, provider analytics, mutation command palette and proof-state filters.

The three vertical slices in section R are not complete. The original guardrails remain acceptance criteria. Do not describe this checkpoint as completion of every P0, P1 or P2 item.
