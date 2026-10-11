# EverGreen API

NestJS and Prisma provide the staff, commerce and operational endpoints. Use `npm run dev` from the repository root to compile the API and start both services. The API binds to 127.0.0.1:4301 in development; the web proxy exposes it under `/api/backend` at port 4000.

- [Setup and service directory](../../QUICK_START.md)
- [Business workflow](../../docs/BUSINESS_FLOW.md)
- [Release gates](../../PARITY_REGISTER.md)

## Interactive documentation

Open http://localhost:4000/api/docs in development. Search operations, choose the public web proxy server, and authorize with your own staff token. On a direct API connection, select the direct server instead. Authorization is not persisted across reloads. Try it out must be enabled for each operation and executes real requests.

The schema is generated from controllers at startup. Legacy routes with untyped bodies still need DTO and response documentation; the explorer is not evidence of complete schema coverage. API documentation is disabled in production.

## Business ownership

Use `/commerce` for catalogue items, customers, orders, invoices, invoice-linked payments and reports. Legacy mill production and inventory remain separate operational paths requiring reconciliation. A machine register is not live telemetry. See the business-flow document before connecting automation.

## Local checks

```sh
npm run setup:check
npm run build -w apps/api
npm run test -w apps/api -- --runInBand
```

Environment and database initialization instructions live in the root README. Do not log secrets or bootstrap passwords. Health HTML is available at `/health`, and JSON at `/health?format=json`.
