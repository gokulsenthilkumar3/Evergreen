# EverGreen

EverGreen is an ERP for textile businesses: mills, traders, warehouses and job-work units. It covers material receipts, production, stock and lots, job work, sales orders, invoices and customer payments, with a separate provider workspace for managing customer companies and licenses.

Built with React, NestJS and Prisma. Both databases use SQLite today; one PostgreSQL database per customer is the planned target.

- **New here?** Follow the [Quick Start](QUICK_START.md).
- **How it works:** [Architecture](docs/ARCHITECTURE.md) and [business flow](docs/BUSINESS_FLOW.md).
- **What's done and what's open:** [Project status](docs/PROJECT_AUDIT.md) and [backlog](docs/IMPLEMENTATION_BACKLOG.md).
- **All documentation:** [docs/README.md](docs/README.md).
- **Install or update:** [Windows installer and hosted deployment](docs/ONE_CLICK_DELIVERY.md).

## Applications

| Workspace | Purpose | Development address |
| --- | --- | --- |
| `apps/web` | Staff application and public shop | http://localhost:4000 |
| `apps/api` | Customer API: operations, validation and ledgers | http://127.0.0.1:4301 |
| `apps/admin-web` | Provider workspace for companies and licenses | http://localhost:5174 |
| `apps/admin-api` | Provider API with its own database | http://localhost:4300 |
| `apps/marketing-web` | Marketing site | http://localhost:3300 |
| `apps/desktop` | Electron package of a local installation | See [desktop delivery](docs/DESKTOP_DELIVERY.md) |
| `apps/weighbridge-agent` | Weighbridge parser and signing library | See [weighbridge agent](docs/WEIGHBRIDGE_AGENT_ARCHITECTURE.md) |

Each customer gets its own installation: web app, API, database and secrets. A provider company record does not create that infrastructure.

## Business flow

Receive material → check stock and quality → produce or send out for job work → dispatch → invoice → collect payment.

Every command must preserve lot ownership, available quantities, links between documents, duplicate-request handling and closed accounting periods. Staff roles are `VIEWER`, `MODIFIER` and `ADMIN`, with stricter rules on some endpoints. Provider credentials are separate and must never be installed on a customer machine.

## Development

You need Node.js 22.12 or newer and npm. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

```sh
npm ci
npm run setup:check
npm run dev
```

`npm run dev` starts the staff app and its API. `npm run dev:all` starts all three web apps and both APIs. See the [Quick Start](QUICK_START.md) for environment variables and the first database setup.

Before opening a pull request, run:

```sh
npm run verify
```

It checks migrations against both schemas, type-checks, runs every test suite, checks that generated docs are current, and builds all workspaces. The [maintenance runbook](docs/MAINTENANCE_RUNBOOK.md) lists the separate lint and dependency checks.

## Repository layout

- `apps/`: applications, APIs, desktop shell and hardware tooling.
- `packages/`: shared types, invoice calculations, database schemas and helpers.
- `scripts/`, `deploy/`, `.github/`: development scripts, deployment recipes and CI.
- `docs/`: guides, generated references and dated audit evidence.
- `agent-system/`: instructions and checks for AI coding agents working in this repo.

## Status

EverGreen is not yet release-ready. Trusted provider-to-customer sync, recoverable deployment, physical devices and external integrations still need acceptance. See the [project status](docs/PROJECT_AUDIT.md).

## License

There is no license file yet, and the workspace package metadata disagrees. The owner needs to choose the source license and redistribution terms. Until then, this repository grants no license.
