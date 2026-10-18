# EverGreen API

NestJS and Prisma provide the staff, commerce and operational endpoints. Use `npm run dev` from the repository root to compile the API and start both services. The API binds to 127.0.0.1:4301 in development; the web proxy exposes it under `/api/backend` at port 4000.

- [Setup and service directory](../../QUICK_START.md)
- [Business workflow](../../docs/BUSINESS_FLOW.md)
- [Project status and open gates](../../docs/PROJECT_AUDIT.md)

## Interactive documentation

Open http://localhost:4000/api/docs in development. Search operations, choose the public web proxy server, and authorize with your own staff token. On a direct API connection, select the direct server instead. Authorization is not persisted across reloads. Try it out must be enabled for each operation and executes real requests.

The schema is generated from controllers at startup. Legacy routes with untyped bodies still need DTO and response documentation; the explorer is not evidence of complete schema coverage. API documentation is disabled in production.

## Business ownership

Use `/commerce` for catalogue items, customers, orders, invoices, invoice-linked payments and reports. Legacy mill production and inventory remain separate operational paths requiring reconciliation. A machine register is not live telemetry. See the business-flow document before connecting automation.

## Local checks

```sh
npm run setup:check
npm run typecheck -w apps/api
npm run build -w apps/api
npm run test -w apps/api -- --runInBand
```

The type-check covers application source, unit tests and HTTP test fixtures. Jest transpiles tests with isolated modules, so passing tests alone does not establish that their TypeScript contracts are valid. The root `npm run typecheck` and CI's `npm run verify` include this check.

Environment and database initialization instructions live in the [Quick Start](../../QUICK_START.md). Do not log secrets or bootstrap passwords. `/health` always returns a public JSON probe containing `service`, `status`, `database` and `timestamp`; it returns HTTP 503 when the database is unreachable. Operational details are available at `/status` only to an authenticated administrator. There is no HTML health page or format selector.

## Optional provider sync

The hourly sync job is disabled until both `ADMIN_API_URL` and `COMPANY_ID` are set. Invalid or partial configuration skips database reads and network requests. Use the provider API base URL (an optional path prefix is preserved) and the provider-issued company ID, containing 1–128 letters, digits, underscores or hyphens. URLs must use HTTPS and contain no credentials, query or fragment. Outside production, HTTP is allowed for `localhost`, `127.0.0.1` and `[::1]` only.

Requests reject redirects and have a 10-second deadline covering both headers and response-body reading. Only one sync runs at a time per API process; the next hourly run can try again after a failure. There is no immediate retry or durable delivery queue. `HEARTBEAT_INTERVAL_MS` is not supported. Transport or response-validation failures leave local license settings unchanged, and logs omit raw errors, endpoint values and response bodies.

Metrics are lifetime counts of receipt, dispatch and retained invoice records (including voided invoices), plus users with at least one valid session. They are not billing-period usage or monthly quota enforcement.

Connected rollout remains blocked on tenant-scoped authentication: the provider currently requires its operator credential, which this client deliberately does not send. Do not install `ADMIN_API_KEY` on a customer machine. Keep sync disabled outside a controlled integration environment until that contract is implemented and accepted. See [EG-02 / EG-09](../../docs/IMPLEMENTATION_BACKLOG.md#eg-02--eg-09--tenant-scoped-sync-p0-before-connected-rollout-securityapi-owner-m).
