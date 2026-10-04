# EverGreen One quick start

Use the repository root for all commands. See [README.md](README.md) for environment configuration and initial database setup.

1. Install dependencies with `npm install`.
2. Configure `apps/api/.env` and the root `.env` with the same `DATABASE_URL`. Use a unique JWT secret and bootstrap administrator credentials; there is no shared default login.
3. Run `npm run setup:check`. This read-only check reports configuration problems without printing credentials or changing your database.
4. For a new empty database only, follow the database setup in README. Existing operational databases need a verified backup and reviewed migration.
5. Run `npm run dev`. Wait for the launcher to report ready, then open the web application.

| Service | Default URL | Availability |
| --- | --- | --- |
| Staff application | http://localhost:4000/ | Started by npm run dev |
| Business workspace | http://localhost:4000/workspace | Staff login required |
| Workflow documentation | http://localhost:4000/tutorial | Staff login required |
| Health hub | http://localhost:4000/health | HTML in a browser |
| Health telemetry | http://localhost:4000/health?format=json | JSON |
| API explorer | http://localhost:4000/api/docs | Development only |
| Database Studio | http://localhost:5555/ | Start separately with npm run db:studio |

Database Studio binds to loopback and allows direct database editing. Use it as a local administrator tool, not as the normal business workflow. The internal API defaults to 127.0.0.1:4301. Browser requests use /api/backend. Set EVERGREEN_PUBLIC_PORT and EVERGREEN_API_PORT before launching to override ports.

## Run the business flow

Open Business Workspace, then use the searchable “From material to payment” guide. Each step explains the handoff and links to its screen: company setup, inward receipt, production, inventory review, invoice and collection. Review the [business flow](docs/BUSINESS_FLOW.md) for reconciliation boundaries.

The workspace refreshes every 30 seconds while visible. Pause polling with the switch or request a manual refresh. Missing data displays as unavailable; a failed refresh warns that retained values may be stale. Registered machines are a count of records, not live machine telemetry.

## Verification

Run `npm run build -w apps/web`, `npm run test -w apps/web -- --run`, and `npm run test -w apps/api -- --runInBand`. Passing checks do not replace the release gates in [PARITY_REGISTER.md](PARITY_REGISTER.md).
