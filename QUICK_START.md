# EverGreen One quick start

Use the repository root for all commands. See [README.md](README.md) for environment configuration and initial database setup.

1. Install dependencies with `npm install`.
2. Configure `apps/api/.env` and the root `.env` with the same `DATABASE_URL`. Use a unique JWT secret and bootstrap administrator credentials; there is no shared default login.
3. Run `npm run setup:check`. This read-only check reports configuration problems without printing credentials or changing your database.
4. For a new empty database only, follow the database setup in README. Existing operational databases need a verified backup and reviewed migration.
5. Run `npm run dev:all` (or `npm start`) to launch all 5 surfaces (Customer Web, Admin Web, Marketing Web, APIs, and DBs in 1 step). Alternatively, run `npm run dev` to launch only the staff app and its API.

| Service | Default URL | Availability |
| --- | --- | --- |
| Staff application | http://localhost:4000/ | Started by npm run dev:all / npm run dev |
| Provider Admin Web | http://localhost:5174/ | Started by npm run dev:all |
| Public Marketing Web | http://localhost:3300/ | Started by npm run dev:all |
| Provider Admin API Docs | http://localhost:4300/api/docs | Started by npm run dev:all |
| Business workspace | http://localhost:4000/workspace | Staff login required |
| Workflow documentation | http://localhost:4000/tutorial | Staff login required |
| Health probe | http://localhost:4000/health | Public; returns only service, status and time |
| Operational status | http://localhost:4000/api/backend/status | Administrator sign-in required |
| API explorer | http://localhost:4000/api/docs | Development only |
| Prisma Studio | http://127.0.0.1:5555/ | Development only; start separately with npm run db:studio |

Prisma Studio binds to this machine only and edits the database directly, bypassing every business rule. Use it for development, never on a customer installation. The internal API defaults to 127.0.0.1:4301. Browser requests use /api/backend. Set EVERGREEN_PUBLIC_PORT and EVERGREEN_API_PORT before launching to override ports.

## Run the business flow

Open Business Workspace, then use the searchable “From material to payment” guide. Each step explains the handoff and links to its screen: company setup, inward receipt, production, inventory review, invoice and collection. Review the [business flow](docs/BUSINESS_FLOW.md) for reconciliation boundaries.

The workspace refreshes every 30 seconds while visible. Pause polling with the switch or request a manual refresh. Missing data displays as unavailable; a failed refresh warns that retained values may be stale. Registered machines are a count of records, not live machine telemetry.

## Verification

Run `npm run build -w apps/web`, `npm run test -w apps/web -- --run`, and `npm run test -w apps/api -- --runInBand`. Passing checks do not replace the release gates in [PARITY_REGISTER.md](PARITY_REGISTER.md).
