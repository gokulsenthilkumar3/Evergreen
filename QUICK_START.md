# Quick Start

Run every command from the repository root.

## 1. Install

```sh
npm ci
```

Use Node.js 22.12 or newer. On Windows, run `npm.cmd` if PowerShell blocks `npm.ps1`.

## 2. Configure

1. Copy `.env.example` to `.env` at the root and to `apps/api/.env`. Both must use the same `DATABASE_URL`.
2. Set a unique `JWT_SECRET` of at least 32 characters. For the first sign-in, set `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_EMAIL` and a `BOOTSTRAP_ADMIN_PASSWORD` of 12 or more characters in `apps/api/.env`. The API creates that administrator once, when no users exist. There is no shared default login.
3. Run the read-only setup check. It reports problems without printing secrets or touching the database:

   ```sh
   npm run setup:check
   ```

## 3. Create the database

For a new, empty development database:

```sh
npm run generate -w @evergreen/database
npm run migrate:deploy -w @evergreen/database
```

Never run these against a database that holds real records until you have a verified backup and have reviewed the migration. See [back up and restore](docs/MAINTENANCE_RUNBOOK.md#back-up-and-restore).

## 4. Start

```sh
npm run dev
```

This starts the staff app and its API. To start everything (staff, provider and marketing web apps plus both APIs), run `npm run dev:all`.

| Service | Address | Notes |
| --- | --- | --- |
| Staff application | http://localhost:4000/ | `npm run dev` or `dev:all` |
| Business workspace | http://localhost:4000/workspace | Staff sign-in required |
| Workflow guide | http://localhost:4000/tutorial | Staff sign-in required |
| Health probe | http://localhost:4000/health | Public; returns service, status and time only |
| Operational status | http://localhost:4000/api/backend/status | Administrator sign-in required |
| Customer API explorer | http://localhost:4000/api/docs | Development only |
| Provider workspace | http://localhost:5174/ | `dev:all` only |
| Provider API explorer | http://localhost:4300/api/docs | `dev:all` only |
| Marketing site | http://localhost:3300/ | `dev:all` only |
| Prisma Studio | http://127.0.0.1:5555/ | Development only; start with `npm run db:studio` |

The customer API listens on 127.0.0.1:4301, and the browser reaches it through `/api/backend`. Set `EVERGREEN_PUBLIC_PORT` and `EVERGREEN_API_PORT` to change the ports.

Prisma Studio edits the database directly and skips every business rule. Use it only on development data, never on a customer installation.

## 5. Walk through the business flow

Open Business Workspace and follow the "From material to payment" guide. Each step explains the handoff and links to its screen: company setup, inward receipt, production, inventory review, invoice and collection. The [business flow](docs/BUSINESS_FLOW.md) page has the full checklist.

The workspace refreshes every 30 seconds while it is visible. You can pause it or refresh by hand. Missing data shows as unavailable, and a failed refresh warns that the values may be out of date. The machine count is the number of registered machines, not live telemetry.

## 6. Check your work

```sh
npm run verify
```

Passing checks are necessary but not sufficient for a release. See the [project status](docs/PROJECT_AUDIT.md) for the open acceptance gates.
