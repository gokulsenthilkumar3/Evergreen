# Cloud, web, desktop and assisted installation

Status: implementation plan, 1 November 2026. The admin overview now reads provider records; a hosted environment has not been provisioned by this change.

## Current implementation

The Windows Electron installer packages the web renderer, local Node API and Prisma SQLite runtime. First launch creates a local account and database. It does not install a cloud client today. Docker deployment hosts the web/API stack with persistent SQLite volumes. Prisma is the database access library; Prisma Studio is an optional development editor, not the cloud database console. Neither is a cloud hosting service.

The AI assistant provides guidance and drafts; it does not currently install or provision infrastructure. Existing API monitoring is process-local and requires per-customer configuration; production monitoring and durable history still need implementation. The provider overview displays records from its database, including any demo records already seeded. Demo seeding is now explicit opt-in; existing records are retained for review.

## Target experience

One cloud tenant API and database serve both the browser and desktop app. Desktop cloud mode is a signed Electron client loading the approved tenant HTTPS origin. It creates no local ERP database and runs no local business API. Web and desktop share accounts, permissions and data. Local/offline deployment remains a separately selected mode, with a clear explanation of its data location and recovery requirements. Offline synchronization is not promised in cloud mode.

## Required setup before installation

1. **Choose delivery mode:** cloud browser, cloud-connected desktop, or explicitly approved local installation. Show where the data will live and the service owner.
2. **Company setup:** register the real company, assign an administrator and required modules, choose region and subscription, and record contact and retention requirements.
3. **Prepare hosting:** select the cloud account/project, region, domain, TLS and storage. Validate DNS, connectivity, backup destination and estimated cost. Generate a reviewable deployment manifest before provisioning.
4. **Owner activation:** issue a tenant-bound activation from the owner laptop. Only the public installation request is transferred to the owner. Private signing keys remain on the laptop; provider operator keys never enter customer artifacts.
5. **Deploy and verify:** deploy an immutable release, run controlled migrations, validate API/database health, create an encrypted independent backup and perform a restore check. Record results and deployment evidence.
6. **Custom business setup:** configure timezone, currency, business/workspace mode, opening balances, tax details and integration secret references. Preview and validate imports before committing them. Mark incomplete optional integrations clearly.
7. **Connect monitoring:** bind the real company ID to its approved telemetry target. Confirm identity, route inventory and observed requests. Production telemetry must work independently of public Swagger exposure and support replicas plus durable history.
8. **Invite and connect:** send a one-time staff invitation. Browser users open their tenant URL. Desktop users install the signed cloud client and import a signed connection profile containing tenant ID, approved HTTPS origin and owner verification metadata, with no root credentials.
9. **Acceptance:** verify the same test transaction appears through both browser and desktop, permission boundaries hold, backup restoration works and failed updates recover before enabling business traffic.

## Desktop implementation sequence

- Introduce a delivery-mode choice before the current local account wizard. Preserve current installations and their databases; do not silently switch their data source.
- Verify a signed connection profile, require HTTPS and reject embedded credentials, redirects to unapproved origins and certificate failures. Validate tenant identity with a dedicated public identity endpoint before opening the application.
- Keep Electron sandboxing, context isolation and disabled Node integration. Restrict navigation and popups to approved origins. Use the system browser for deliberate external links.
- In cloud mode bypass local secrets, database setup, migrations and API startup. Store the connection profile separately from local installation state. Never place customer passwords or provider credentials in the profile.
- Adapt update preparation for cloud mode: client updates must not snapshot or migrate a nonexistent local database. Server upgrades remain a separate controlled workflow.
- Provide a connection diagnostics screen, account sign-out and an unavailable-service view. Desktop logout must end the server session. Do not cache sensitive tenant pages for offline operation without a separately designed encrypted cache.

## AI-assisted installer sequence

Build a deterministic installer wizard first. AI may explain steps, collect preferences, validate missing inputs and draft the deployment manifest. A bounded server-side workflow validates every field and executes only approved operations. AI output is not a shell command to execute.

Persist each job and step with an idempotency key, actor, target, input fingerprint, status and evidence. Resume interrupted jobs from recorded state. Show preview, actual progress and actionable failures. Require operator approval of the concrete deployment manifest before creating billable infrastructure. Use workload identity and secret references; redact secrets from prompts, logs and exports. Reuse the release/deployment helpers for snapshots, migrations and rollback. Failed readiness checks block the install link.

## Cloud database console sequence

Extend the inventory into verified cloud connectors with narrowly scoped identities for AWS, Azure and GCP. Collect engine/version, connectivity, storage, backup age, replica state and measured query/request latency through provider APIs or approved agents. Track each value with its source and timestamp. Do not label a registered asset healthy based solely on its registration status.

Deploy one instance per SQLite tenant initially, with persistent storage and tested backups. Do not horizontally scale a file-based SQLite API across hosts. Evaluate managed PostgreSQL separately: update schemas and migrations, validate provider-specific queries and test import/reconciliation on copied databases before switching production traffic. Database migration is not accomplished by replacing the connection URL.

## Owner credential boundary

Source code is editable by whoever possesses it. Authorization must be enforced by the service holding the data. Copies of the repository and login script do not contain the private owner key. Current credentials use Windows DPAPI CurrentUser outside the checkout: another Windows account or laptop cannot decrypt the copied ciphertext under normal operation. A process running under the owner account can invoke the same decryption routine; malware or an administrator with access to that account is outside this protection.

For cloud administration, introduce individual operator identities, passkeys or hardware security keys, short server sessions and audit trails. Keep the offline signing key on the owner laptop, preferably protected by hardware-backed signing. The cloud should hold verification material and scoped runtime credentials, not the owner's signing key. Windows DPAPI files cannot simply be copied into Linux cloud containers. Retire shared operator-key sign-in after the new identity flow and recovery path are accepted.

## Delivery gates

| Phase | Deliverable | Completion evidence |
| --- | --- | --- |
| Current | Record-backed admin views and honest disconnected states | Type check/build; record changes reflected in views |
| Next | Preflight wizard and signed connection profile | Invalid profile rejected; correct tenant verified |
| Next | Cloud desktop mode and browser parity | Shared transaction and session acceptance on Windows |
| Next | Cloud monitoring and database connectors | Timestamped metrics from a real approved installation |
| Next | AI-assisted deployment workflow | Preview, approval, interruption recovery and rollback tests |
| Release | Signed distribution and managed operations | Signing, backup restore, monitoring and owner recovery accepted |

Hosting provider/account, region, production domain, cost limit and staff identity provider remain deployment inputs. No cloud resources are created by this plan.
