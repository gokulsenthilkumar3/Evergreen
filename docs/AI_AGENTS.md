# EverGreen portal assistants

| Assistant | UI | Purpose | Access |
| --- | --- | --- | --- |
| Atlas | Provider AI studio | Licence explanations, deployment/recovery checklists and drafting | Owner session/key + ADMIN installation |
| Loom | Mill helpdesk | Workflows, imports, learning and troubleshooting | Staff JWT + installation scope |
| Weave | Customer shop | Textile concepts and shop/checkout guidance | Public, licensed installation |
| Scout | Marketing | Product fit, readiness and demo preparation | Public, licensed installation |

All model calls run on the backend. No Groq key is included in frontend bundles. These are read-only assistants: no SQL, filesystem, deployment, licence issuance, payment or mutation tools. They receive the supplied conversation and curated product guidance, not private database records. Customer prices/stock must be checked on the shop page. There is no private order lookup. Each route fixes the assistant identity and scope on the server. Answers render as plain text.

## Configure Groq on your Windows owner host

Create keys in your own [Groq console](https://console.groq.com/keys). Use a separate restricted project/key for public assistants and configure Groq spending limits. Do not paste credentials into chat or frontend variables.

Run in your own PowerShell terminal under the Windows owner account:

```powershell
cd D:\Projects\EverGreen
& .\scripts\security\configure-groq.ps1 -Scope private
& .\scripts\security\configure-groq.ps1 -Scope public
npm run owner:start
```

Input is hidden. Configuration is saved with CurrentUser DPAPI encryption at `%LOCALAPPDATA%\EverGreen\owner-host\groq.dpapi`, outside Git. Each scope update preserves the other key. Follow your organization's signed-script policy if script execution is restricted.

On other hosts inject `GROQ_API_KEY` for Atlas/Loom, `GROQ_PUBLIC_API_KEY` for Weave/Scout, and optional `GROQ_MODEL` through the server secret manager. Public scopes never fall back to the private key. Default model: `openai/gpt-oss-20b`; confirm availability in your Groq project. The marketing proxy exposes only `/marketing-api/ai/marketing`, not private tenant routes.

## Data sharing and limits

Users opt in before sending their conversation to Groq. History stays in component memory and disappears on unmount/clear. Keep secrets, personal data and confidential records out of prompts. Groq processes supplied text under your account's applicable policies. Clearing the UI does not erase provider-side processing records.

- Message: 1–2,000 characters. At most 8 history messages and 12,000 total characters.
- Requests cannot set system messages, model, tools or custom endpoint.
- Upstream deadline: 20 seconds; response cap: 128 KiB / 6,000 answer characters.
- Four simultaneous calls per API process.
- Per scope/client/minute: 6 public or 15 authenticated requests.
- Per process/24-hour budget window: 200 public and 1,000 private calls. Counters reset on restart. Use Groq spending limits and a shared/edge limiter for production replicas; these are not durable billing controls.
- Missing key: 503. Limits: 429. Sanitized provider failure: 502. No simulated answer is substituted.

Live model validation requires real keys and network access. Automated tests use a fake transport to verify isolation, validation, limits and failures without spending tokens.

## Helpdesk, training and database tools

Tickets persist in the tenant `SupportTicket` table. Staff see their own tickets; installation administrators see the queue. Create is retry-safe using a unique request key. Administrator updates require the current version and a note when resolving. Tickets remain in the installation: no external email or response-time guarantee is implied. Old browser drafts remain available for manual review/import.

Tutorial now covers activation/security, integrations and AI/helpdesk alongside business lessons. Progress persists locally per username, with searchable chapters and revisitable steps. Completing a lesson does not execute a business operation.

Owner-only Prisma launchers target the active private databases and bind loopback:

```powershell
npm run db:studio:tenant
npm run db:studio:provider
```

Tenant uses port 5555; provider uses 5556. Take a snapshot before editing. Prisma Studio is a separate editor; the in-app database workspace displays live diagnostics/schema and does not simulate maintenance. Prisma remains compatible with installed version 5.22 rather than silently upgrading a major version.

## API references

Tenant: `http://localhost:4001/api/docs` or `http://127.0.0.1:4301/api/docs`. Provider: `http://127.0.0.1:4300/api/docs`. Append `-json` for OpenAPI JSON. Docs remain disabled by default in production. Authentication, AI bodies, ticket DTOs and errors are documented. Try it out executes real requests; Swagger does not persist credentials.

Sources: [Groq API](https://console.groq.com/docs/api-reference), [models](https://console.groq.com/docs/models), [Prisma Studio](https://www.prisma.io/docs/orm/tools/prisma-studio).



## Portal environment configuration

The three supplied portal credentials are stored in ignored server .env files. Never put values in documentation or frontend variables.

| Portal | Server variable | Assistant scope |
| --- | --- | --- |
| Admin | `GROQ_ADMIN_API_KEY` | Atlas (owner), Loom (staff) |
| Customer | `GROQ_CUSTOMER_API_KEY` | Weave |
| Marketing | `GROQ_MARKETING_API_KEY` | Scout |

Local development loads the root .env; API-local .env files contain the relevant credentials too. Restart API processes after changes. GROQ_MODEL defaults to openai/gpt-oss-20b.

Dedicated variables take precedence over legacy GROQ_API_KEY (admin/staff) and GROQ_PUBLIC_API_KEY (customer/marketing). Public scopes never use the admin key. For Windows owner-host startup, save each key with scripts/security/configure-groq.ps1 -Scope admin, -Scope customer, or -Scope marketing under the owner account, then restart npm run owner:start.

## Main portal UI and demo boundary

- Main marketing: Scout is embedded in the support section, reached through Ask Scout navigation. It uses /marketing-api/ai/marketing; the old canned-response chatbot has been removed.
- Customer shop: Ask Weave uses the tenant /ai/customer endpoint through the configured frontend API proxy.
- Provider admin: AI studio contains Atlas and uses the authenticated /ai/owner endpoint.
- Demo themes are unlisted from the main homepage. Thread Story at /demo/ThemeThreadStory/ uses a separate local-only Scout preview, no readiness probe and no Groq connection. Its CSP blocks network connections.
- Owner-host APIs were restarted to load the saved portal keys. Readiness checks reported Scout, Weave and authenticated Atlas configured. No live Groq completion was submitted during this verification.
