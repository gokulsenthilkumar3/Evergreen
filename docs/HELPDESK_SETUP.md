# Helpdesk setup and operating limits

Updated 2 November 2026. This guide covers the customer installation. The [feature inventory](Helpdesk.md) also describes a provider product that is not yet implemented in full.

## Start and configure

Use `npm run start:all` for the local applications. Owner-protected APIs use `npm run owner:start`; this restarts the tenant/provider APIs and stops the protected Prisma Studio process. Start Studio separately with `npm run db:studio:tenant` when needed. Apply database changes through the owner-host upgrade workflow, with its snapshot, rather than resetting a live database.

Open `/helpdesk`. Administrators can configure queues, members, capacities, routing rules, categories/custom fields, macros, shared views, SLA policies, business calendars, email templates and retention review. Staff see their own tickets, published public articles and private saved preferences/views. Internal notes, other requesters' tickets and other users' private views are filtered by the API.

Queue keys and category keys are stable identifiers. Configure an active queue before routing rules or SLA policies refer to it. New tickets snapshot the chosen SLA/calendar; editing a policy does not rewrite old promises. Business time excludes configured weekdays/holidays and follows the selected timezone. Reports distinguish recorded response times from requester acknowledgement and expose the latest-5,000-ticket sample limit.

`RETENTION.closedDays` selects records for review. `autoCloseResolvedDays` defaults to `0` (disabled). An explicit positive value enables closure of old, resolved, unconfirmed tickets during the bounded minute sweep. Those closures are **stale**, preserve history and do not verify a fix. There is no automatic erasure job.

## SMTP and explicit email dispatch

See [email and sign-in setup](EMAIL_SIGNIN_SETUP.md). Gmail authentication was verified for `gokulkangeyan@gmail.com`; no real message was sent during implementation. The Zoho account `gokulsenthilkumar3@zohomail.in` still needs its own local app credentials and account-appropriate SMTP host. OIDC remains disabled until an identity provider client is configured. Never paste passwords into documentation, chat, `VITE_*` variables or source control.

An administrator selects a saved public reply, previews the verified requester's exact recipient/body, checks the review box and explicitly sends. The server binds the preview hash to the recipient, reply and template version. An active email template with key `DEFAULT` can use `{{requester.name}}`, `{{ticket.id}}`, `{{ticket.subject}}` and `{{reply.body}}`. The reply is appended if the wrapper omits its body placeholder.

The durable outbox claims each reply before contacting SMTP. SMTP acceptance is recorded separately from inbox delivery. Ambiguous or interrupted attempts are not retried automatically and do not silently switch senders; inspect the sender's sent-mail/provider logs first. Tests mock transport. Portal acknowledgement is an explicit requester action, not an inferred email read receipt.

## Local antivirus and previews

The official `clamav/clamav:stable` container is installed as `evergreen-helpdesk-antivirus`, bound only to `127.0.0.1:3310`, with signatures persisted in Docker volume `evergreen-helpdesk-clamav-db`. The installation image digest was `sha256:bda39705e291105049c3936e2803ac90b955172af8030f94f05dce1252df6c6d`.

To create it on another machine:

```powershell
docker run -d --name evergreen-helpdesk-antivirus --label com.evergreen.project=EverGreen --publish 127.0.0.1:3310:3310 --mount type=volume,source=evergreen-helpdesk-clamav-db,target=/var/lib/clamav --memory=2g --restart unless-stopped clamav/clamav:stable
docker inspect --format '{{.State.Health.Status}}' evergreen-helpdesk-antivirus
```

Set these server-only values in the local API environment, then restart it:

```dotenv
HELPDESK_CLAMAV_HOST=127.0.0.1
HELPDESK_CLAMAV_PORT=3310
```

Do not expose clamd TCP publicly; its protocol has no transport authentication. The app permits a loopback scanner only. See the official [protocol](https://docs.clamav.net/manual/Usage/ClamdProtocol.html) and [Docker guide](https://docs.clamav.net/manual/Installing/Docker.html).

Uploads are limited to 512 KiB each and ten per ticket. Unavailable/failed scanning quarantines the file. Every download requires another clean scan plus content-hash and ticket-integrity checks. The UI previews PNG only, up to 4,096 pixels per dimension and four megapixels total. Other files remain downloads. Markdown does not execute raw HTML or fetch remote images. Local checks detected the standard EICAR antivirus test sample and accepted a harmless sample without writing either to disk.

## Signed incoming connectors

The API accepts normalized, signed events at `POST /helpdesk/ingress/:source` on the tenant API (or the web proxy `/api/backend/helpdesk/ingress/:source`). Sources are uppercase `MONITOR`, `DEPLOYMENT`, `WEBHOOK`, `HEARTBEAT`, `CHATOPS`, `EMAIL`. These are connector contracts; no monitoring service, chat bot or mailbox poller is configured automatically.

Generate a separate random secret of at least 32 characters locally for each source. Store it only on the API and its trusted producer as `HELPDESK_INGRESS_<SOURCE>_SECRET`. Unset sources reject requests. Do not reuse a provider administrative key or an owner signing key.

Required JSON fields: `externalId` (1–160 characters), `subject` (3–160), `description` (10–4,000), `category` (`BUG`, `QUESTION`, `ACCESS`, `INTEGRATION`, `BILLING`, `DATA`), and `priority` (`LOW`, `NORMAL`, `HIGH`, `URGENT`). Canonicalize JSON recursively: sort object keys, omit undefined object fields, preserve array order and JSON primitive encoding. Compute the lowercase SHA-256 hex digest of that canonical body. Sign this exact UTF-8 string using HMAC-SHA256 and the source secret:

```text
v1\nSOURCE\nTIMESTAMP\nNONCE\nBODY_DIGEST
```

Here `\n` means an actual newline. Send the lowercase hex signature in `x-support-signature`, a 13-digit Unix millisecond timestamp in `x-support-timestamp`, and a fresh 16–100-character alphanumeric/underscore/hyphen nonce in `x-support-nonce`. The timestamp window is five minutes. Nonces and source/external-ID receipts are stored transactionally; retries are content-bound and cannot silently replace an earlier event.

Non-email events are explicitly attributed to a machine integration, not a fictional customer. For `EMAIL`, a trusted gateway must independently validate aligned DKIM, then sign `senderEmail` plus `senderAssurance: "DKIM_PASS_ALIGNED"`. Only an existing active user with that verified email can submit. Optional `ticketId` may reference only that user's ticket. An untrusted `From` header is insufficient. The app does not parse raw MIME, fetch IMAP, validate DKIM itself, create accounts from inbound email or accept arbitrary attachments through this endpoint.

## AI assistance

AI uses the existing server-side Groq configuration and budget. An administrator previews and may edit the exact context, opts into including private notes separately, and gives explicit consent before sending. Recognized credentials and common personal data are redacted on a best-effort basis; review remains necessary. Generated drafts/summaries/classifications/suggestions stay private and advisory. Inserting a draft and posting a reply are separate human actions, with AI attribution retained. No customer data was sent to Groq during implementation tests.

### Floating Loom Agent

The signed-in customer app includes a floating sprout character on every page. Click it to open Loom's workflow chat. Drag the character or the panel's title handle to reposition it; use arrow keys on either handle, Shift for larger steps, or Home/reset to restore its position. Minimize or press Escape to return to the page while retaining the current draft and conversation in memory.

Choose **2D** or **3D** in the panel. The latter uses vector shading and CSS perspective, without a WebGL scene or additional model downloads. Motion includes hovering, blinking, a swaying sprout and a thinking state. The Motion control pauses it, and the operating system's reduced-motion preference takes priority. The panel supports touch, stays within the visual viewport during resize/zoom/keyboard changes, and follows English/Tamil and light/dark settings.

Only position and appearance preferences are stored locally, under the signed-in username. Conversations are not written to browser storage; the widget unmounts and aborts requests on logout. Readiness is checked when first opened. Sending still requires explicit Groq consent; only the typed question and bounded chat history are sent, with no automatic page, ticket or business-record context. The Agent provides guidance and cannot modify records or execute operations.

Validation: 22 focused Agent/conversation/navigation/Tamil checks and the customer production build passed. A separate headless browser using mocked APIs checked desktop dragging, minimized drafts, 2D/3D presentation, phone-sized Tamil/dark layout and screen bounds, with no page errors or real AI messages. This preview does not establish a live Groq conversation or authenticated end-to-end integration.

## Audit export

The ordinary JSON export is unsigned and applies best-effort personal-data redaction. Owner signing is a separate host-local CLI action against a deliberately selected export:

```powershell
node scripts/security/support-export.cjs --mode sign --input C:/private/ticket.json --output C:/private/ticket.signed.json
node scripts/security/support-export.cjs --mode verify --input C:/private/ticket.signed.json
```

The signer checks the owner key against the pinned public key and refuses to overwrite an output. The private key remains in owner storage. Its scope is `EXPORT_INTEGRITY_ONLY`: it attests export integrity, not that a fix worked or mail was delivered. Implementation tests use temporary keys; no production owner signature was created.

## Remaining provider work

Named provider operators, provider role/company scopes, authenticated customer-to-provider ticket transport, provider registry/rollout/billing execution, owner quorum approvals and signed execution/telemetry return evidence are not complete. An owner-attention request records intent only. Local links to tickets/articles/invoices/workflow documents do not execute those systems. Presence is process-local and expires; it is not shared draft collaboration. Never give customer installations the provider shared owner key to bypass these boundaries.

English/Tamil component tests and API integration tests cover the implemented paths. The backend regression selection passed 48 tests; owner-export crypto tests passed two. The full UI run passed 272 of 278 tests initially. The six failures were corrected and passed focused reruns: two stale rendering assertions, the missing login-test query provider, and login behavior fixes (immediate continuation, opt-in persistent storage, trimmed usernames and actionable network/account help). The focused preview/localization checks also passed. This is a full run followed by targeted reruns, not a second complete UI-suite run.

The tenant API build passed. Customer, provider and marketing UIs, both APIs and tenant Studio returned HTTP 200 on ports 4000, 5174, 3300, 4301, 4300 and 5555. Unauthenticated Helpdesk access and unsigned ingress returned 401. ClamAV was running healthy. The native browser host was unavailable. Full authenticated Helpdesk browser verification remains outstanding; the floating Agent received the separate mocked browser checks described above.
