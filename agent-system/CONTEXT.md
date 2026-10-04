# EverGreen context brief

## Confirmed by the user

- Improve the existing end-to-end business workflow and its UI, documentation, setup and features.
- Support both local desktop and hosted web.
- Plan for one small business, multiple sites within a business, and multiple customer businesses.
- Use a comprehensive skill/guideline system to build and maintain this specific application.
- Treat 2030 as the development horizon, not a claim of future capability.

## Repository evidence

| Area | Observed context | Source |
| --- | --- | --- |
| Domain | Yarn/textile operations, job work, commerce, invoicing, customer payments | ../README.md, ../PARITY_REGISTER.md |
| Web | React 19, TypeScript, Material UI, TanStack Query, Vite | ../apps/web/package.json |
| API | NestJS, JWT/session and role controls, Prisma | ../apps/api/package.json, ../apps/api/src/modules/auth |
| Data | SQLite; legacy mill paths coexist with commerce StockMovement | ../packages/database/prisma/schema.prisma, ../PARITY_REGISTER.md |
| Desktop | Electron packaging, bundled backend and web assets | ../apps/desktop/package.json |
| Shared packages | Types, PDF, i18n, email and config | ../packages |
| Localization | English/Tamil foundation; action-level QA pending | ../PARITY_REGISTER.md |
| Services | Public web 4000, internal API 4301, optional Studio 5555 | ../QUICK_START.md |
| Existing uncertainty | Parity register includes older prototype assessments; code has newer connected modules | ../PARITY_REGISTER.md, ../apps/api/src/modules |

When evidence conflicts, inspect the actual endpoint and record the discrepancy. Never silently upgrade a parity row to accepted.

## Proposed personas to validate

Business owner, inventory clerk, production supervisor, accounts staff, administrator, public-shop customer, and operational support. Do not infer permission from a persona label: trace role enforcement in the API.

## Target topology, not current capability

1. Single business: reconcile physical stock and invoice/payment records; prove recoverability.
2. Multiple sites: define organization/site boundaries, transfer ownership and reporting scope. Prevent duplicate stock during transfers.
3. Multiple businesses: enforce tenant scope on every record, query, export, cache, background job, attachment and authorization decision. Prove cross-tenant denials before onboarding customer businesses.
4. Desktop + hosted: choose whether desktop connects online to hosted data or owns a local database. Offline writes and bidirectional sync require conflict, idempotency and cutover design. Do not assume the packaged backend provides safe synchronization.

## Open questions

Hosting provider/region; deployment owner; tenant count and peak concurrent staff; database sizes; required availability and recovery objectives; desktop offline requirements; supported Windows versions; team size, timeline and budget; data residency; retention; applicable legal obligations; external accounting/payment/tax providers; named release approver; who operates backups and incident response.

These unknowns block their dependent rollout decisions, not routine local UI, documentation or test improvements. No tax/legal determination is asserted in this package. Obtain current authoritative sources when implementing a regulated requirement.

## Definition of success

The receipt → production → stock → sale → invoice → payment loop reconciles, survives errors without duplicate effects, enforces role/site/tenant boundaries, produces consistent saved documents, and can be restored from backup. Each supported desktop/web release has test evidence, observable failures, deployment instructions and a verified recovery plan.
