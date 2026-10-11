# Custom Database Studio route register

This is the custom Node HTTP service in scripts/database-studio.js, launched by root `db:studio`, not Prisma's bundled Studio. It sits outside the Nest route/guard inventory. All routes below were traced statically; the service was not launched against existing data because it creates sessions, accepts SQL and can mutate data. It listens on all interfaces at configured DB_STUDIO_PORT (default 5555).

| Method | Route | Actual access policy | Validation/data behavior | Runtime result |
| --- | --- | --- | --- | --- |
| POST | /api/auth/login | Anonymous password login, no TOTP or role requirement | Unbounded body; bcrypt or legacy plaintext; creates tenant Session and seven-day JWT; returns token and non-Secure cookie | UNVERIFIED HTTP; source confirms alternate factor policy |
| POST | /api/auth/logout | Optional session | Revokes matching session if present, clears cookie | UNVERIFIED |
| GET/HEAD | /api/auth/me | Anonymous allowed | Returns authentication state and session/user if valid | UNVERIFIED |
| GET/HEAD | / | Public | Enumerates valid tables before rendering Studio shell | UNVERIFIED |
| GET/HEAD | /table/:tableName | Public shell | Checks table exists; renders shell/table selection | UNVERIFIED |
| GET/HEAD | /api/tables | Any valid tenant session; no role restriction | Counts all tables with raw SQL | UNVERIFIED; SEC-019 |
| GET/HEAD | /api/table/:tableName | Any valid tenant session; no role/field restriction | SELECT * including sensitive fields; table/sort identifiers allowlisted, numeric bounds partially parsed | UNVERIFIED; SEC-019 |
| POST | /api/query | Any valid tenant session; no role/write policy | Caller SQL passed directly to $queryRawUnsafe; unbounded body/results, no read-only DB enforcement | UNVERIFIED destructive behavior; SEC-020 |
| GET/HEAD | /api/stats | Any valid tenant session | Hardcoded dev.db metadata can differ from actual configured datasource; inferred ONLINE | UNVERIFIED |
| OPTIONS | Any path | Public | Wildcard CORS response; Content-Type/Authorization allowed | Static confirmed; network exposure unverified |

authenticateRequest verifies JWT/session/current user, but does not restrict roles. Token can arrive as bearer, query parameter or cookie. CORS is not authentication. No blanket SQL-injection claim is made for table/sort identifiers because those use database-derived allowlists; the intentionally raw query endpoint itself is the critical unrestricted capability.
