# `/helpdesk` — Feature Inventory

**Reading of the request:** I'm splitting into **Common** — the table-stakes features every helpdesk has, that EverGreen must ship to be usable — and **Global** — the cross-cutting, platform-spanning features that make the helpdesk _fit the rest of the portal we've been building_ (Proof Spine, tamper-evident audit, owner-key boundary, two-population identity, unified shell, honest states). A feature that can't write to the audit ledger or emit a proof state doesn't belong in the helpdesk at all.

Assumed placement: a new **Support** group in the left rail, with `/helpdesk` as its hub and subroutes `/helpdesk/queues`, `/helpdesk/tickets/:id`, `/helpdesk/kb`, `/helpdesk/sla`, `/helpdesk/reporting`. Rendered inside the three-zone shell, with the right-rail inspector, command palette, and proof badges as first-class citizens.

---

## 1. Two helpdesks, one engine

The word "ticket" hides two very different problems. Both must be supported, but they must never bleed into each other.

|                           | **P-helpdesk**                                                                                                         | **C-helpdesk**                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Who raises**            | C-users (customer staff) contacting EverGreen                                                                          | C-users inside their own mill                                                        |
| **Who resolves**          | P-users (EverGreen support operators)                                                                                  | That mill's delegated admin / owner                                                  |
| **What lives here**       | "Our ERP is slow", "version update broke X", "our API monitoring stopped", "please reset a password", billing question | "Till is down", "po creation fails", "printing is jammed", "leave requests rejected" |
| **Proof source of truth** | EverGreen's telemetry, deployments, releases, event delivery                                                           | The mill's own logs + that mill's IT                                                 |
| **Cross-link to**         | Companies, Rollouts, Release Registry, Event Delivery, Telemetry, Billing Ledger                                       | Local modules inside the customer workspace                                          |

Both run on one schema; the `tenant` field decides which side a row belongs to.

---

## 2. Common features — table stakes

### 2.1 Ticket intake (how it starts)

| #   | Feature                                                         | Raised by | Notes                                  |
| --- | --------------------------------------------------------------- | --------- | -------------------------------------- |
| 1   | Web form (portal, authenticated)                                | P + C     | Pre-fills user, company, version       |
| 2   | In-app widget inside the customer ERP                           | C         | Floating "Get help" chip               |
| 3   | Email-to-ticket (inbound parsing, threading)                    | P + C     | Reply-To header preserved              |
| 4   | API-created ticket (customer reporting)                         | C         | Bearer token from API console          |
| 5   | Auto-created ticket from monitoring alert                       | P         | Monitoring → helpdesk ticket           |
| 6   | Auto-created ticket from failed deployment                      | P         | Rollout stage `failed` → ticket        |
| 7   | Auto-created ticket from failed webhook delivery (N× in window) | P         | Event Delivery → ticket                |
| 8   | Auto-created ticket from customer heartbeat silence             | P         | Monitoring → "customer offline" ticket |
| 9   | Support-from-ChatOps escalation                                 | P         | ChatOps message → ticket               |
| 10  | Ticket imported from CSV / API bulk                             | P         | For migration                          |
| 11  | Pre-ticket search ("did we already answer this?")               | P + C     | Intercepts ~15% of duplicates          |

### 2.2 Ticket fields (the data model)

| #   | Field                                                                    | Notes                                  |
| --- | ------------------------------------------------------------------------ | -------------------------------------- |
| 12  | Subject                                                                  | Required                               |
| 13  | Description (rich text)                                                  | Markdown + inline images               |
| 14  | Requester (user id)                                                      | From session                           |
| 15  | Company (tenant)                                                         | Required for P-helpdesk                |
| 16  | Category (configurable tree)                                             | Bug / Billing / Access / How-to / Data |
| 17  | Priority (P1–P4 or Low–Urgent)                                           | Configurable labels                    |
| 18  | Status (`new → open → pending → on_hold → resolved → closed → reopened`) | State machine                          |
| 19  | Assignee (agent)                                                         | Single; queues are separate            |
| 20  | Queue / group                                                            | Team assignment                        |
| 21  | Tags (free-form)                                                         |                                        |
| 22  | Custom fields (per category)                                             | E.g. "affected module"                 |
| 23  | Attachments                                                              | Scanned; size-capped                   |
| 24  | Watchers / CC                                                            |                                        |
| 25  | Linked records (see §4.5)                                                | The proof-spine bridge                 |
| 26  | SLA policy id                                                            | Resolved by ruleset                    |
| 27  | Version-at-raise                                                         | From telemetry, not from user          |
| 28  | Environment (prod / staging / local)                                     | Default from session                   |
| 29  | Due date                                                                 |                                        |

### 2.3 Conversation & collaboration

| #   | Feature                                                        | Notes                                                  |
| --- | -------------------------------------------------------------- | ------------------------------------------------------ |
| 30  | Threaded replies                                               |                                                        |
| 31  | Public reply vs internal note                                  | Clearly visually distinguished                         |
| 32  | @mentions of agents                                            | Notifies; fanout to notification centre                |
| 33  | Canned responses / macros                                      | Insert + edit + share                                  |
| 34  | Variables in macros (`{{requester.name}}`, `{{company.plan}}`) |                                                        |
| 35  | Attachments in replies                                         |                                                        |
| 36  | Rich previews of links                                         | Markdown/safe only, no auto-fetch of untrusted content |
| 37  | Edit history on replies                                        | Older versions visible to auditors                     |
| 38  | Collision detection ("Priya is also viewing this ticket")      |                                                        |
| 39  | Live draft sharing between agents                              | Optional                                               |
| 40  | Conversation with customer inside their portal                 | The customer sees the same thread on their side        |
| 41  | Language auto-detect                                           | Ticket keeps its language for auto-replies             |
| 42  | Emoji / reaction on internal notes                             | For triage                                             |

### 2.4 Assignment & routing

| #   | Feature                                      | Notes                          |
| --- | -------------------------------------------- | ------------------------------ |
| 43  | Manual assign                                |                                |
| 44  | Auto-assign round-robin per queue            | Respects agent presence        |
| 45  | Auto-assign by category / company / language |                                |
| 46  | Load-based assign (fewest open tickets)      |                                |
| 47  | Escalation ladder (L1 → L2 → L3)             | Time-based                     |
| 48  | Transfer with reason                         |                                |
| 49  | Delegation (agent on leave → deputy)         | Ties into user-mgmt delegation |
| 50  | Queue health view (depth, age, breach count) |                                |
| 51  | Unassigned triage queue                      |                                |
| 52  | Agent capacity caps                          | Prevents overload              |
| 53  | Skill-based routing                          | For specialised modules        |

### 2.5 SLA & time

| #   | Feature                                       | Notes                                    |
| --- | --------------------------------------------- | ---------------------------------------- |
| 54  | SLA policies (per priority, per company tier) |                                          |
| 55  | First-response time target                    |                                          |
| 56  | Resolution time target                        |                                          |
| 57  | Business hours + holiday calendar             |                                          |
| 58  | SLA pause on "waiting on customer"            |                                          |
| 59  | Breach alerting (at 75%, 100%)                |                                          |
| 60  | Breach report                                 |                                          |
| 61  | Time tracking per ticket (manual)             | Optional                                 |
| 62  | **SLA state honesty (see §5)**                | SLA met vs claim-only — different badges |

### 2.6 Knowledge

| #   | Feature                                         | Notes                 |
| --- | ----------------------------------------------- | --------------------- |
| 63  | KB articles with categories                     |                       |
| 64  | Public KB (visible to C-users) vs internal-only |                       |
| 65  | Article suggestions while typing a reply        |                       |
| 66  | Link article to ticket                          |                       |
| 67  | Article versioning                              |                       |
| 68  | Article feedback (helpful / not)                | Feeds article ranking |
| 69  | Search across KB from the palette               |                       |
| 70  | Article author attribution                      |                       |
| 71  | Draft / published state                         |                       |
| 72  | Attach images / video / code blocks             |                       |

### 2.7 Automation

| #   | Feature                                           | Notes                                    |
| --- | ------------------------------------------------- | ---------------------------------------- |
| 73  | Rules engine: "when X, do Y"                      | Trigger on status / time / tag / company |
| 74  | Auto-tag by category guess                        |                                          |
| 75  | Auto-responder with KB link                       |                                          |
| 76  | Auto-close after N days of inactivity             | Emits `stale` first                      |
| 77  | Auto-reopen on customer reply                     |                                          |
| 78  | Auto-escalate on SLA breach                       |                                          |
| 79  | Auto-link tickets to same-company related tickets |                                          |
| 80  | Duplicate detection (embedding similarity)        | Surfaced to agent, never auto-merged     |
| 81  | Canned auto-reply for known incident              | "We're aware of issue X — status page"   |

### 2.8 Views & bulk

| #   | Feature                            | Notes                                          |
| --- | ---------------------------------- | ---------------------------------------------- |
| 82  | Saved views (filter + sort combos) |                                                |
| 83  | Shared team views vs private       |                                                |
| 84  | Bulk status / assign / tag         | With confirm-dialog showing affected           |
| 85  | Bulk merge / split                 |                                                |
| 86  | Merge duplicates                   | Primary survives, secondary archived with link |
| 87  | Split into subtasks                | Parent-child tickets                           |
| 88  | Link as related                    |                                                |
| 89  | Ticket export (CSV / JSON)         |                                                |
| 90  | Print / PDF export                 |                                                |
| 91  | Ticket permalinks + short IDs      |                                                |

### 2.9 Customer-facing portal

| #   | Feature                                        | Notes                                 |
| --- | ---------------------------------------------- | ------------------------------------- |
| 92  | Customer portal (only their company's tickets) |                                       |
| 93  | New-ticket form scoped to that company         |                                       |
| 94  | Thread view, reply, attach                     |                                       |
| 95  | "This is fixed" button                         | Critical: this is `executed` evidence |
| 96  | "Still broken" button                          | Anti-close; reopens with evidence     |
| 97  | CSAT survey on close                           | Optional                              |
| 98  | KB access                                      |                                       |
| 99  | Status page link                               |                                       |
| 100 | Ticket search across own history               |                                       |
| 101 | Notification preferences per user              |                                       |

### 2.10 Reporting (per-ticket / per-agent)

| #   | Feature                                      | Notes               |
| --- | -------------------------------------------- | ------------------- |
| 102 | Ticket volume over time                      |                     |
| 103 | Backlog burn-down                            |                     |
| 104 | First response / resolution time percentiles | p50/p90/p99         |
| 105 | SLA breach rate                              | Claimed vs proven   |
| 106 | Reopen rate                                  |                     |
| 107 | FCR (first-contact resolution)               | Claimed vs verified |
| 108 | Agent workload                               |                     |
| 109 | CSAT score                                   |                     |
| 110 | Category heat-map                            |                     |
| 111 | Top KB articles opened from tickets          |                     |
| 112 | Per-company health dashboard                 |                     |

### 2.11 Admin & config

| #   | Feature                                      | Notes |
| --- | -------------------------------------------- | ----- |
| 113 | Categories, priorities, custom fields editor |       |
| 114 | SLA policy editor                            |       |
| 115 | Agent groups / queues                        |       |
| 116 | Business hours / holidays                    |       |
| 117 | Email templates                              |       |
| 118 | Auto-reply settings                          |       |
| 119 | Notification routing rules                   |       |
| 120 | Retention window                             |       |

---

## 3. Global features — platform-level, what we agreed on

These are the ones that make `/helpdesk` **belong to EverGreen** rather than being Zendesk on a different skin.

### 3.1 Proof Spine integration (the differentiator)

Every ticket carries a proof state alongside its workflow status. The two are orthogonal and never conflated.

| #   | Feature                                                                                | Notes                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 121 | **Ticket proof badge** (`recorded → requested → executed → verified / failed / stale`) | Same component as everywhere else                                                                                                                                  |
| 122 | **Status ≠ proof**                                                                     | "Resolved" is a claim; only customer confirmation or telemetry read-back reaches `verified`                                                                        |
| 123 | **Server-derived proof**                                                               | `deriveProof` rule from the redesign applies — no template may set `verified`                                                                                      |
| 124 | **"Fixed" requires evidence**                                                          | Closing requires: customer clicked "this is fixed" (via portal), OR telemetry shows the underlying metric returned to baseline, OR (rare) an owner-key attestation |
| 125 | **Auto-reopen on evidence regression**                                                 | Telemetry sees the symptom return → ticket goes `stale → failed`, reopens automatically                                                                            |
| 126 | **Proof filter in ticket list**                                                        | "Show me tickets closed but not verified"                                                                                                                          |
| 127 | **Per-reply proof**                                                                    | Each outbound reply has its own receipt state: dispatched (executed) vs customer-viewed (verified)                                                                 |
| 128 | **Chain integrity**                                                                    | "Verify chain" button in the ticket inspector                                                                                                                      |
| 129 | **Terminal state honesty**                                                             | A ticket can be `closed` in status and `recorded` in proof simultaneously — the UI shows both                                                                      |
| 130 | **SLA state honesty**                                                                  | Three badges per SLA: target, claim, proof. "We replied in 2h" ≠ "customer received the reply in 2h"                                                               |

### 3.2 Multi-tenant, two populations, RBAC

| #   | Feature                                                      | Notes                                            |
| --- | ------------------------------------------------------------ | ------------------------------------------------ |
| 131 | Tenant isolation on every query                              | C-users can only see their own company's tickets |
| 132 | Provider/customer identity split                             | Same auth, distinct permission namespaces        |
| 133 | Role-scoped visibility (agent vs lead vs auditor vs billing) |                                                  |
| 134 | **Per-company scoping for agents**                           | An agent may only handle APAC mills              |
| 135 | Read-only auditor role (can view proof, cannot reply)        |                                                  |
| 136 | Delegated-admin for C-helpdesk inside a mill                 | Mill owner manages their own agents              |
| 137 | Two-person approval for ticket → deployment escalation       | Segregation of duties                            |

### 3.3 Tamper-evident audit

| #   | Feature                                        | Notes                                                |
| --- | ---------------------------------------------- | ---------------------------------------------------- |
| 138 | Every ticket mutation writes to `audit_ledger` | Append-only, hash-chained (per §3 of prior redesign) |
| 139 | Per-ticket timeline merged into Proof & Audit  |                                                      |
| 140 | Signed export per ticket for audits            |                                                      |
| 141 | Retention policy per company tier              | Preserves chain hashes after redaction               |

### 3.4 Owner-key escalation

| #   | Feature                                                                              | Notes                                            |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 142 | Security-incident escalation path                                                    | Ticket can be flagged `owner_attention_required` |
| 143 | Owner-key holders notified separately (out-of-band)                                  | Cloud cannot act alone                           |
| 144 | Owner-key action appears as ticket event with `verified` only after laptop signature |                                                  |
| 145 | Read-only "what owner would approve" preview                                         | Never fakes the approval                         |
| 146 | Break-glass path (audited, alerted)                                                  |                                                  |

### 3.5 Cross-module integration

This is what turns the helpdesk from a ticket app into a **customer-issue lifecycle** surface.

| #   | Feature                                                         | Links to         | Notes                                                    |
| --- | --------------------------------------------------------------- | ---------------- | -------------------------------------------------------- |
| 147 | Link ticket → Company registry                                  | `/companies`     | Auto                                                     |
| 148 | Link ticket → Release version                                   | Release Registry | "Customer is on 3.2.1; fix in 3.2.3"                     |
| 149 | Link ticket → Deployment job                                    | Rollouts         | "Escalate to fix" creates a rollout request              |
| 150 | Link ticket → Webhook attempt                                   | Event Delivery   | "Customer says webhook didn't fire" — show real attempts |
| 151 | Link ticket → API telemetry spike                               | Telemetry        | "Slow since 14:00" — chart embedded                      |
| 152 | Link ticket → Payment record                                    | Billing Ledger   | "Refund issued" — links to settlement proof              |
| 153 | Link ticket → Agreement                                         | Contracts        | "SLAs per contract AC-23"                                |
| 154 | Link ticket → Task (ControlRecord)                              | Workboard        | Internal work spawned from ticket                        |
| 155 | Link ticket → ChatOps thread                                    | Channels         | Escalation chat                                          |
| 156 | Link ticket → Connector health                                  | Connectors       | "Your AWS connection is fine"                            |
| 157 | Link ticket → Backup state                                      | Backups          | "Last backup 3h ago — here's the drill evidence"         |
| 158 | **Create rollout from ticket**                                  | Rollouts         | Prompts for stage, target companies, version             |
| 159 | **Create task from ticket**                                     | Workboard        | For internal follow-ups                                  |
| 160 | **Create contract amendment from ticket**                       | Contracts        | For SLA renegotiation                                    |
| 161 | Customer health signal (from helpdesk) fed back to Command Deck | Deck             | "Company X has 6 open tickets, 2 breaches"               |

### 3.6 Unified shell & interaction

| #   | Feature                                                                           | Notes                                                                                                      |
| --- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 162 | Right-rail inspector for tickets                                                  | Detail / Proof / Raw tabs — same as everywhere                                                             |
| 163 | Command palette entries                                                           | `ticket open`, `ticket assign`, `ticket reply`, `escalate to rollout`, `link release`, `close with reason` |
| 164 | Global search across tickets + companies + records + KB                           | `/control/search`                                                                                          |
| 165 | Notification centre integration                                                   | Same notifications UI as user-mgmt §M                                                                      |
| 166 | Keyboard-only flows (open ticket, reply, assign, resolve)                         | Accessibility P0                                                                                           |
| 167 | Cross-module breadcrumb (ticket shows its origin: "raised from monitoring alert") |                                                                                                            |

### 3.7 Motion & empty states (the cinematic layer)

| #   | Feature                                   | Notes                                                                                                                                                                        |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 168 | **3D empty-state scene for the helpdesk** | Pseudo-3D canvas (from prior redesign) — scene name `helpdesk`. Shape language: many small chamfered envelopes flowing toward a central in-tray, occasionally bouncing back. |
| 169 | **Per-queue empty scenes**                | Triage / My Tickets / Breached / Verified / Awaiting Customer each get a variant                                                                                             |
| 170 | **Proof badge animation per state**       | Amber pulse (requested), cyan spin (executed), lime settle + pulse-ring (verified), red glitch (failed), amber stripe + breathe (stale)                                      |
| 171 | **Stagger wipe for ticket list on load**  | Same as everywhere                                                                                                                                                           |
| 172 | **Route dissolve on `/helpdesk` enter**   | Noise wipe from prior turn                                                                                                                                                   |
| 173 | **Count-in on volume KPIs**               |                                                                                                                                                                              |
| 174 | **Sparkline draw on volume charts**       |                                                                                                                                                                              |
| 175 | **Scanline sweep on the live queue**      | Subtle; pauses when tab is hidden                                                                                                                                            |
| 176 | **Proof ticker in the ticket header**     | Last 20 state transitions on this ticket                                                                                                                                     |
| 177 | **Reduced-motion parity**                 | All of the above gate on `prefers-reduced-motion`                                                                                                                            |

### 3.8 Security & operational guardrails

| #   | Feature                                                                       | Notes                                                             |
| --- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 178 | Rate-limited intake                                                           | Anti-spam                                                         |
| 179 | Attachment virus scan before download                                         |                                                                   |
| 180 | Attachment preview disabled for untrusted types                               |                                                                   |
| 181 | No auto-execution of links in replies                                         | Renderer strips click handlers to untrusted domains               |
| 182 | Redaction of tokens / secrets in ticket body                                  | Regex + HIBP-style detection                                      |
| 183 | PII detection + redaction on export                                           |                                                                   |
| 184 | GDPR erasure workflow (preserves audit chain)                                 |                                                                   |
| 185 | Retention policy per company                                                  |                                                                   |
| 186 | Data Explorer projection includes helpdesk rows                               | `Ticket`, `TicketMessage`, `SlaEvent` — safe-tier only by default |
| 187 | Every agent session re-auth'd when opening a ticket with owner-key escalation | Step-up                                                           |

### 3.9 AI assistance (with boundaries)

| #   | Feature                                                               | Notes                                                                               |
| --- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 188 | Auto-classify category / priority / language on create                | Agent-editable, never auto-sent                                                     |
| 189 | Suggest KB article + similar tickets                                  | Advisory                                                                            |
| 190 | Draft reply from context                                              | **Cannot auto-send** — agent must click "send" (that click is the `executed` event) |
| 191 | Summarise long ticket thread                                          |                                                                                     |
| 192 | Extract structured fields from email body                             |                                                                                     |
| 193 | Never claim `verified` from AI output                                 | Enforced in code                                                                    |
| 194 | Every AI-generated text is labelled in the UI and in the audit ledger |                                                                                     |

### 3.10 Import / export / migration

| #   | Feature                            | Notes                                                                          |
| --- | ---------------------------------- | ------------------------------------------------------------------------------ |
| 195 | CSV import with dry-run preview    |                                                                                |
| 196 | API for ticket create/update/close | Bearer from API console                                                        |
| 197 | Webhook out (ticket events)        | Uses Event Delivery — so ticket events flow through the same verified pipeline |
| 198 | Signed bulk export for audit       |                                                                                |

---

## 4. The proof-state mapping (concrete, per ticket)

| Trigger                                        | Proof emitted                                        | Rationale                   |
| ---------------------------------------------- | ---------------------------------------------------- | --------------------------- |
| Ticket row created                             | `recorded`                                           | Existence                   |
| Agent assigned                                 | `executed`                                           | Actor performed             |
| Auto-assignment queued, no executor            | `requested`                                          | Queued                      |
| Agent sends reply                              | `executed` (dispatch)                                | We have send receipt        |
| Customer views reply in portal                 | `verified` (delivery)                                | Independent read-back       |
| Customer emails back                           | `executed` (further exchange)                        |                             |
| Agent marks resolved                           | `requested`                                          | A **claim**, not proof      |
| Customer clicks "This is fixed"                | `verified`                                           | Independent confirmation    |
| Telemetry confirms health return               | `verified`                                           | Second source               |
| Ticket closes without confirmation, 14d elapse | `stale`                                              | Was open, now merely closed |
| Customer clicks "Still broken"                 | `failed` on the resolution attempt                   | Regression                  |
| Auto-close after inactivity                    | `stale`                                              | Silent timeout              |
| Refund ticket links to payment row             | `verified` only when payment ledger shows settlement | Cross-module evidence       |

The rule from the previous turn survives: **`deriveProof` is the only function that can produce `verified` or `stale`, enforced by lint.**

---

## 5. Backend endpoints required

| Method  | Path                                                                 | Purpose                                  |
| ------- | -------------------------------------------------------------------- | ---------------------------------------- |
| `GET`   | `/helpdesk/tickets?cursor=&limit=&proof=&status=&company=&assignee=` | List (paginated, proof-filterable)       |
| `POST`  | `/helpdesk/tickets`                                                  | Create                                   |
| `GET`   | `/helpdesk/tickets/:id`                                              | Read + proof + audit                     |
| `PATCH` | `/helpdesk/tickets/:id`                                              | Update fields                            |
| `POST`  | `/helpdesk/tickets/:id/messages`                                     | Reply / note                             |
| `POST`  | `/helpdesk/tickets/:id/assign`                                       | Assign                                   |
| `POST`  | `/helpdesk/tickets/:id/close`                                        | Close with reason                        |
| `POST`  | `/helpdesk/tickets/:id/confirm-fixed`                                | Customer side only                       |
| `POST`  | `/helpdesk/tickets/:id/escalate-rollout`                             | Create rollout, links both               |
| `POST`  | `/helpdesk/tickets/:id/escalate-task`                                | Create ControlRecord                     |
| `POST`  | `/helpdesk/tickets/:id/merge`                                        | Merge duplicates                         |
| `POST`  | `/helpdesk/tickets/:id/verify-chain`                                 | Chain check                              |
| `GET`   | `/helpdesk/queues`                                                   | Queue health                             |
| `GET`   | `/helpdesk/kb?q=`                                                    | KB search                                |
| `POST`  | `/helpdesk/kb`                                                       | Create article                           |
| `GET`   | `/helpdesk/sla/:id`                                                  | SLA policy + state                       |
| `GET`   | `/helpdesk/reporting/*`                                              | Analytics endpoints                      |
| `POST`  | `/helpdesk/import`                                                   | Dry-run + commit                         |
| `POST`  | `/helpdesk/ai/*`                                                     | Suggest / classify / draft — never sends |

All write endpoints append to `audit_ledger` synchronously before returning.

---

## 6. Priority slices

| Slice                         | Features                                 | Why                                             |
| ----------------------------- | ---------------------------------------- | ----------------------------------------------- |
| **Slice 1 — Usable helpdesk** | 1–11, 12–29, 30–42, 43–53, 82–91, 92–101 | A support team can actually work                |
| **Slice 2 — Proof-correct**   | 121–130, 138–141, 168–177                | Becomes EverGreen's helpdesk, not a generic one |
| **Slice 3 — Cross-module**    | 147–161                                  | Turns ticket work into platform work            |
| **Slice 4 — Automation**      | 54–62, 73–81, 63–72                      | Quality of life                                 |
| **Slice 5 — Governance**      | 131–137, 142–146, 178–187                | Becomes trustworthy                             |
| **Slice 6 — AI**              | 188–194                                  | Only after 2 is proven                          |

SLA, KB, and reporting can ship in parallel with slice 2 but **must not** claim `verified` until §5 is in place — they show `recorded` badges in the meantime.

---

## 7. Guardrails (things `/helpdesk` must never do)

1. **Never mark `verified` on a ticket resolution without independent evidence** — customer portal click OR telemetry return OR owner-key attestation. Agent's own "resolved" click is `requested`.
2. **Never claim an SLA was met without a delivery receipt** — replied ≠ received. Show "replied (claim)" and "received (proof)" separately.
3. **Never impersonate a customer reply** — every message must be attributed to the authenticated principal; owner-key needed for anything else.
4. **Never auto-merge duplicates** — merge is always a human click, always audited.
5. **Never auto-send AI drafts** — the agent's send click is the `executed` event; no path bypasses it.
6. **Never leak one company's ticket into another's portal** — tenant isolation enforced at the query layer, not the template.
7. **Never escalate to a rollout silently** — a ticket-to-rollout promotion shows a blast-radius preview and requires a second approver if the target list is > 1.
8. **Never let a "closed, unverified, aged" ticket look green** — it stays `stale` (amber striped) until either confirmed or removed by retention policy.
9. **Never produce a proof state that isn't in the audit ledger** — the ledger is written in the same transaction as the state change.
10. **Never hide the underlying capability boundary** — if no connector is wired, escalation to rollout shows "provisioning not implemented; this remains `requested`" rather than a fake spinner.

---

The headline: `/helpdesk` is not an add-on. It is the **surface where the Proof Spine becomes useful to customers** — because a ticket is precisely the record where "we say we fixed it" and "it is fixed" are most easily confused, and where a customer, an auditor, and an owner-key holder each deserve to see the difference without reading the code. Everything on the Common list ships it; everything on the Global list makes it trustworthy.

---

## Current implementation checkpoint — 2026-11-02

This checkpoint supersedes the historical checkpoint below. It does **not** declare the 198-feature inventory complete. The customer installation now has the following implemented surfaces; see [setup and operating limits](HELPDESK_SETUP.md) for configuration.

- Cursor-paginated requester-scoped queues, server search/filtering, private/shared saved views, configurable queues/members/capacities/routing, configurable categories/custom fields, tags, watchers and deadlines.
- Public conversations, private notes, macros, append-only author corrections, mentions/portal notifications, process-local agent presence, independent requester fix confirmation/rejection, explicit reply acknowledgement, and versioned assignment/status changes. Ticket events remain linked to synchronous audit writes; integrity and resolution proof remain separate.
- Human-reviewed bulk assignment/status/tagging/merge/split, transactional rollback on stale versions, same-requester merge restrictions, preserved histories, split/import retry keys, bounded CSV import previews and formula-safe current-page CSV export.
- Private/draft/published knowledge articles, safe Markdown, helpfulness feedback, resource revisions, queue/SLA/calendar/category/rule/email-template configuration, and notification preferences. PNG previews are bounded; remote Markdown images are not fetched.
- Quarantined attachment storage with hash/integrity checks and fresh loopback ClamAV scanning on each download. The local scanner accepted harmless content and detected the standard antivirus test sample. No scan means no download.
- Explicit SMTP recipient/body/template preview and human dispatch of a saved administrator public reply; a durable per-reply outbox records accepted/ambiguous outcomes without automatic retry. Acceptance does not establish inbox delivery. Gmail credentials were authenticated; Zoho credentials remain absent.
- Snapshot-based business-hours SLAs, response claims versus portal acknowledgement, bounded minute threshold alerts, optional stale auto-closure of aged unconfirmed resolutions, retention review without automatic erasure, CSAT and sample-labelled reporting. Reports expose a latest-5,000-ticket limit and null quantiles for missing samples.
- Contextual header intake, ticket permalinks and knowledge/queues/SLA/reporting subroutes, local invoice/workflow/article/ticket links, time recording and owner-attention requests that remain requests.
- Signed, replay-protected normalized source ingress contracts for monitoring/deployment/webhook/heartbeat/chat/email producers. Email requires a trusted gateway assertion of aligned DKIM and an existing active verified-email requester. No real producer, IMAP poller or MIME gateway is configured.
- Reviewed-context Groq advisory drafts/summaries/classification/suggestions with explicit consent, private results and separately attributed human posting. No automatic AI reply or proof upgrade. Owner-host export signing is a separate explicit CLI operation with integrity-only scope; tests use temporary keys.
- English/Tamil copy, number-format preferences and permission-aware component tests cover the new UI paths. Native browser automation was unavailable, so visual verification remains outstanding.

### Still incomplete

Named provider-agent authentication/roles, company-scoped provider queues and customer/provider transport are not implemented. Provider registry/rollout/billing execution, owner-quorum execution, independent telemetry return proofs and a shared provider/customer engine remain substantive implementation work. Existing customer database isolation must remain intact; provider shared owner keys must not be copied into customer configuration.

The proposed complete right-rail/cinematic/global-command-palette design, shared collaborative drafts, provider analytics, native email/MIME ingestion, remote/video knowledge assets, exhaustive configurable retention/erasure and every individual item in the inventory are not complete. Resource revision history is retained, but its current UI primarily lists attribution/reasons rather than a full diff viewer. No claim is made that all six priority slices have shipped.

Validation covers real SQLite isolation, retries, stale writes/rollback, private resources/notes, tamper/proof handling, queue capacity/routing, SLA snapshots/calendars, bulk merge/split, imports, attachments, explicit email previews/outbox outcomes, signed ingress, AI consent/attribution, notifications, time/corrections, CSAT and automated stale closure. Email and AI transport are mocked in tests; no real support mail or customer context was sent during implementation. Final test/build/service results are recorded with the delivery report.

## Historical implementation checkpoint — 2026-11-01

Review finding: this inventory describes both provider and customer helpdesks and is substantially broader than the original customer implementation. The original implementation had authenticated, retry-safe intake and three statuses, but no conversation, assignment, synchronous audit or independent resolution confirmation. A green resolved badge overstated the evidence.

### First implemented workflow

- Installation-local customer tickets retain their existing IDs, descriptions and history. An additive migration adds requester ID, administrator assignment, queue and resolution/confirmation timestamps. The migration backfills requester IDs by the immutable local username; it does not fabricate historical audit events.
- Authenticated intake remains retry-safe. Public replies and administrator-only private notes use one-use submission keys, authenticated author attribution and optimistic ticket versions. Replies are plain text rendered safely in React; they do not fetch links, execute HTML or dispatch AI drafts.
- Administrators can assign active local administrators, choose TRIAGE/TECHNICAL/ACCESS/BILLING and set LOW/NORMAL/HIGH/URGENT priority, with a recorded reason. Assignment grants no new permissions and sends no external notification.
- Server-enforced transitions cover OPEN, IN_PROGRESS, PENDING, ON_HOLD, RESOLVED, CLOSED and REOPENED. Every status update needs a reason; resolving needs a resolution; closing requires a prior resolution. Existing resolution text is retained until a deliberate reopen. Concurrent updates return a conflict rather than overwriting another agent's work.
- Requesters can explicitly confirm a tracked fix or reject it and reopen the ticket. A resolving administrator cannot confirm their own fix, even when they also raised the ticket. Other users cannot impersonate the requester. Legacy resolutions need a newly tracked resolution before independent confirmation becomes available.
- Status and proof are separate. Resolving produces a requested resolution claim. Only authenticated requester confirmation of a different administrator's fix yields verified resolution. Rejection yields failed; a tracked unconfirmed closure becomes stale after 14 days. A local integrity check alone never verifies a fix or email delivery.
- Each mutation atomically writes the ticket version, a per-ticket hash-linked event, and a linked event in the existing customer `audit_ledger`. Detail reads check event hashes, version continuity, the current ticket projection and linked ledger-row hashes. Private note content is filtered in the server response. The inspector shows conversation, actor/time, audit completeness, proof and assignment controls in English/Tamil.
- Ticket intake/replies/confirmation have a separate per-user/IP process-local rate budget, so support activity does not consume the login budget. The directory and inspector query caches are scoped by signed-in username and role.

### Capability boundaries and remaining work

This checkpoint implements part of the customer conversation/proof workflow; it does not complete any entire priority slice above. Provider/customer transport, named provider-agent permissions and per-company provider scopes are not implemented. Customer installations continue to use separate local tenant databases. No cross-installation ticket delivery or shared provider ticket engine is claimed.

The list still shows the latest 100 visible tickets, with client-side search/status filters. Cursor pagination, durable queue administration, configurable categories/custom fields/tags/watchers, attachments/scanning, reply edits, mentions/presence, merge/split and bulk operations remain unfinished. The inspector is a dialog in the existing customer shell; the proposed deep subroutes/right-rail/palette are not yet added.

Portal replies are recorded locally. Email threading, outgoing reply dispatch, inbox/read receipts, notification delivery, SLAs/business calendars, knowledge-base authoring, reporting and automation are not configured. Gmail SMTP authentication was separately tested successfully; that connection does not turn Helpdesk replies into delivered email.

The local chain is tamper-evident within the checks described above, not an independent signature, owner attestation, external anchor or signed audit export. Historical changes are not retroactively proved. Owner-key escalations, rollout/task/billing/telemetry links, retention/erasure, AI ticket drafting and provider analytics remain separate work. The guardrails in §7 remain acceptance criteria for those additions.

Validation: real SQLite integration tests cover requester isolation, internal-note filtering, intake/reply replay, stale writes, independent confirmation, rejection/reopening, eligible assignment, projection tampering and full rollback when the ledger write fails. Proof unit tests cover claim-only resolution, stale closure and altered/missing events. Web interaction tests cover intake retries, administrator updates, conversation retries and explicit requester confirmation. These checks do not establish external mail delivery or visual browser verification.
