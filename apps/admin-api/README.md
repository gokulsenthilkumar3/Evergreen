# EverGreen provider API

This NestJS application serves the separate provider control plane, normally at `http://127.0.0.1:4300`. It uses `packages/admin-database` and `ADMIN_DATABASE_URL`; it is not the tenant API on port 4301.

Configure a strong `ADMIN_API_KEY` (at least 32 characters) and optionally `ADMIN_API_ACTOR`. Protected requests use `Authorization: Bearer <provider-key>` or `X-Provider-Key`. The actor is server-owned. Health/root probes are public; customer staff JWTs do not grant provider access. Never distribute this provider credential to tenant installations.

```sh
npm run build -w apps/admin-api
npm run test -w apps/admin-api -- --runInBand
npm run dev -w apps/admin-api
```

Development documentation is at `/api/docs`; it is disabled in production. Interactive operations use the configured database. Browser CORS defaults target the provider web origins and can be restricted with `ADMIN_CORS_ORIGIN`.

## Company contract

| Route | Contract |
| --- | --- |
| `POST /companies` | Runtime DTO, explicit writable fields, bounded quotas and supported configuration enums; enrollment key returned at creation |
| `GET /companies`, `GET /companies/:id` | Company registry and selected history; enrollment keys omitted |
| `POST /companies/:id/license` | Partial allowlisted license settings; strict dates (null clears a date); nonempty update required; optional audit reason in `details` |
| `POST /companies/:id/sync` | Four required nonnegative integer counters; optional version; one UTC daily snapshot |
| `POST /companies/:id/v1/sync` | Same counters plus required version |
| `POST /companies/:id/actions` | Known actions only; maintenance saves provider preference, other unsupported execution returns 503 |

IDs must be UUIDs. Unknown body fields, null nonnullable values, numeric strings and out-of-range counters are rejected. License updates and their audit entry commit atomically. Metrics upsert and company projection also share a transaction. Rejected validation must leave state unchanged.

The sync endpoints still use the provider guard. They are not yet a safe tenant-enrollment protocol. Do not work around this by copying the master key to tenant machines. Scoped credentials, key rotation, exact usage periods and validated tenant response application remain EG-02 acceptance work.

A saved provider preference does not prove a tenant applied it. Package/control records and UI simulations are not evidence that a deployment, bank transaction, migration or external integration executed.

## Verification

`companies.http.spec.ts` creates a disposable database, applies the actual provider migrations and drives authenticated HTTP requests through validation, guards and Prisma. It tests rejected inputs without writes, response secret omission, audit attribution, sync retries and transaction rollback using temporary failure triggers. No live provider database is used.

See the [architecture](../../docs/ARCHITECTURE.md), [validation record](../../docs/PROJECT_AUDIT.md#validation-record) and [acceptance backlog](../../docs/IMPLEMENTATION_BACKLOG.md).
