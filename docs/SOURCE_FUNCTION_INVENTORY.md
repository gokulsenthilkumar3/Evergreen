# Source function inventory

Generated from retained reference code. Each row is a discovered route/screen and a destination for review, not proof of equivalent behavior. Mount prefixes, external services and source-specific policies still require comparison. No source application was executed and no business data was imported.

Discovered 497 routes/screens, 106 Prisma models and 0 SQLite snapshots. External PostgreSQL/hosted databases and browser storage are outside this local file inventory.

## Routes and screens

| Source file | Action | Local route | Canonical destination / review |
| --- | --- | --- | --- |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/api/src/app.ts | GET | /health | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | /login | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | / | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | invoices | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | invoices/new | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | products | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | products/new | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | customers | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | customers/new | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | settings | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/MSME ERP/msme-micro-erp/apps/web/src/App.tsx | SCREEN | * | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/(custom)/costing/history/page.tsx | SCREEN | /costing/history | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/(custom)/costing/page.tsx | SCREEN | /costing | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/(custom)/example/page.tsx | SCREEN | /example | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/(custom)/inventory/page.tsx | SCREEN | /inventory | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/noolstitch/src/app/(custom)/inward-entry/page.tsx | SCREEN | /inward-entry | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/(custom)/production/dispatch/page.tsx | SCREEN | /production/dispatch | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/noolstitch/src/app/(custom)/production/history/page.tsx | SCREEN | /production/history | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/noolstitch/src/app/(custom)/production/[id]/receive/page.tsx | SCREEN | /production/:id/receive | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/noolstitch/src/app/(custom)/vyapari/invoice/page.tsx | SCREEN | /vyapari/invoice | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/noolstitch/src/app/(custom)/vyapari/invoice/sample/page.tsx | SCREEN | /vyapari/invoice/sample | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/noolstitch/src/app/(custom)/vyapari/invoice/[id]/page.tsx | SCREEN | /vyapari/invoice/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/noolstitch/src/app/(setup)/page.tsx | SCREEN | /(setup) | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/api/admin/waitlist/route.ts | GET | /api/admin/waitlist | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/noolstitch/src/app/api/costings/route.ts | GET | /api/costings | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/api/costings/route.ts | POST | /api/costings | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/api/example/route.ts | GET | /api/example | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/api/example/route.ts | POST | /api/example | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/api/inventory/route.ts | GET | /api/inventory | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/noolstitch/src/app/api/inventory/route.ts | POST | /api/inventory | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/noolstitch/src/app/api/invoices/route.ts | POST | /api/invoices | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/noolstitch/src/app/api/invoices/[id]/route.ts | GET | /api/invoices/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/noolstitch/src/app/api/inward-entries/route.ts | POST | /api/inward-entries | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/api/production/dispatch/route.ts | POST | /api/production/dispatch | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/noolstitch/src/app/api/production/route.ts | GET | /api/production | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/noolstitch/src/app/api/production/[id]/receive/route.ts | POST | /api/production/:id/receive | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/noolstitch/src/app/api/waitlist/route.ts | POST | /api/waitlist | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/noolstitch/src/app/health/route.ts | GET | /health | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/app.ts | GET | /health | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/app.ts | GET | /test-ping | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/admin/admin.routes.ts | GET | /logs/stats | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/admin/admin.routes.ts | POST | /logs/purge | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/admin/admin.routes.ts | POST | /sessions/purge | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | POST | /bills | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | POST | /payments | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | GET | /ledger/:supplierId | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | GET | /outstanding | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | POST | /expenses | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | GET | /expenses | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | PATCH | /expenses/:id/status | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/ap.routes.ts | GET | /reports/expenses | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/budgets.routes.ts | GET | / | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/budgets.routes.ts | POST | / | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ap/budgets.routes.ts | GET | /vs-actual | Business flows: payable journals; budget planning needs separate acceptance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | GET | /ledger/:customerId | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | GET | /aging-report | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | POST | /payment | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | POST | /follow-up | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | GET | /metrics | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | PATCH | /credit-limit/:customerId | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/ar/ar.routes.ts | POST | /bad-debt | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /login | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /refresh | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /logout | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /forgot-password | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /mfa/setup | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /mfa/enable | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /mfa/validate | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /webauthn/register/start | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /webauthn/register/finish | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /webauthn/login/start | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | POST | /webauthn/login/finish | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | GET | /sessions | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/auth/auth.routes.ts | DELETE | /sessions/:id | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /customers | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /customers | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | PATCH | /customers/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | DELETE | /customers/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /ar/customers | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /ar/customers/:id/ledger | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /ar/payments | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /ar/follow-ups | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /ar/follow-ups | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | PATCH | /ar/follow-ups/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /ar/bad-debt | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /ar/metrics | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /invoices | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | DELETE | /invoices/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | PATCH | /invoices/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /credit-notes | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /credit-notes | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /debit-notes | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /debit-notes | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /invoices/:id/payments | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices/:id/payments | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices/:id/history | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices/:id/pdf | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /payments/:paymentId/receipt | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /payments/:paymentId/partial-receipt | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /invoices/monthly | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices/by-month/:month | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /invoices/:id/tracking | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | PATCH | /invoices/:id/status | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /invoices/:id/reminders | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | GET | /templates | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | POST | /templates | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | PATCH | /templates/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/billing.routes.ts | DELETE | /templates/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | GET | /invoices/:id/tracking | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | PATCH | /invoices/:id/status | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | POST | /invoices/:id/reminders | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | GET | /templates | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | POST | /templates | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | PATCH | /templates/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/billing/invoice-tracking.routes.ts | DELETE | /templates/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | POST | /messages | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | GET | /messages | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | GET | /messages/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | POST | /messages/:id/read | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | DELETE | /messages/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | GET | /messages/unread/count | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | POST | /announcements | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | GET | /announcements | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | GET | /announcements/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | PATCH | /announcements/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/communication/communication.routes.ts | DELETE | /announcements/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /dashboard | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /orders | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /orders/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /invoices | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /invoices/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /account | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | PUT | /account | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /payments | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | GET | /support/tickets | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customer-portal/customer-portal.routes.ts | POST | /support/tickets | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customers/customer.routes.ts | GET | / | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customers/customer.routes.ts | POST | / | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customers/customer.routes.ts | GET | /:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customers/customer.routes.ts | PATCH | /:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customers/customer.routes.ts | GET | /:id/analytics | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/customers/customer.routes.ts | GET | /:id/revenue-history | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /production-stats | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /financial-summary | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /inventory-health | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /supplier-performance | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /production-efficiency | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /wastage-analysis | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /quality-metrics | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/dashboard/dashboard.routes.ts | GET | /financial-analytics | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/demand-forecasting/demand-forecasting.routes.ts | GET | / | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/demand-forecasting/demand-forecasting.routes.ts | GET | /news | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/demand-forecasting/demand-forecasting.routes.ts | POST | /generate | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/demand-forecasting/demand-forecasting.routes.ts | GET | /history | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | GET | /keys | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | POST | /keys | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | DELETE | /keys/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | GET | /webhooks | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | POST | /webhooks | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | DELETE | /webhooks/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/developer/developer.routes.ts | GET | /logs | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | POST | /folders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | GET | /folders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | GET | /folders/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | POST | /documents | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | GET | /documents | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | GET | /documents/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | PATCH | /documents/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | DELETE | /documents/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | POST | /documents/:id/versions | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | GET | /documents/:id/versions/:versionNumber | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/documents/documents.routes.ts | GET | /stats | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/finished-goods/finished-goods.routes.ts | GET | / | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/gdpr/gdpr.routes.ts | GET | /export | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/gdpr/gdpr.routes.ts | POST | /delete-account | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/gdpr/gdpr.routes.ts | POST | /consent | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/gdpr/gdpr.routes.ts | GET | /privacy-policy | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/gdpr/gdpr.routes.ts | GET | /consent-status | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /employees | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /employees | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /employees/:id | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | PATCH | /employees/:id | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | DELETE | /employees/:id | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /departments | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /departments | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /attendance | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /attendance/bulk | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /attendance/employee/:employeeId | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /attendance/summary/:employeeId | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /leaves | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /leaves | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /leaves/:id | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /leaves/:id/approve | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /leaves/:id/reject | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /leaves/balance/:employeeId | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /payroll/generate | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /payroll/bulk-generate | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /payroll | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | GET | /payroll/:id | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /payroll/:id/process | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/hr/hr.routes.ts | POST | /payroll/:id/pay | Staff, shifts, payroll + accounting projection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/import/import.routes.ts | GET | /suppliers/import/template | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/import/import.routes.ts | GET | /raw-materials/import/template | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/import/import.routes.ts | POST | /suppliers/import | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/import/import.routes.ts | POST | /raw-materials/import | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/integration/integration.routes.ts | GET | /configs | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/integration/integration.routes.ts | POST | /connect | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/integration/integration.routes.ts | PATCH | /:id/toggle | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/integration/integration.routes.ts | POST | /:id/sync | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/integration/integration.routes.ts | GET | /:id/logs | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/optimization.routes.ts | GET | /settings | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/optimization.routes.ts | PATCH | /settings | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/optimization.routes.ts | GET | /analysis | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/reconciliation.routes.ts | GET | / | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/reconciliation.routes.ts | POST | / | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/reconciliation.routes.ts | GET | /:id | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/reconciliation.routes.ts | PATCH | /:id/items | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/reconciliation.routes.ts | POST | /:id/finalize | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | GET | /warehouses | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | POST | /warehouses | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | GET | /warehouses/:id | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | POST | /warehouses/:id/locations | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | POST | /transfer | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | GET | /movements | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | GET | /qrcode | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | GET | /analysis/aging | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/inventory/warehouse.routes.ts | GET | /suggest-materials | Inventory + Warehouse + lot ledger |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | POST | /batches/:id/oee/calculate | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | GET | /batches/:id/oee/latest | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | GET | /oee/trends | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | POST | /batches/:id/cycle-time/analyze | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | GET | /batches/:id/cycle-time/compare | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | GET | /bottlenecks | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/efficiency.routes.ts | GET | /cycle-time/trends | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | GET | /wastage/analytics-v2 | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | GET | /wastage/optimization-v2 | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | GET | /batches | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | POST | /batches | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | PATCH | /batches/:id | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | PATCH | /batches/:id/stage | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | POST | /wastage | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | GET | /wastage | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/manufacturing/manufacturing.routes.ts | POST | /batches/:id/complete | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /feed | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /breaking | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /social | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /trending | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /regions | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /sectors | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /sources | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /stats | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /search | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /by-region/:region | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | GET | /by-sector/:sector | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/news-intelligence/news-intelligence.routes.ts | POST | /refresh | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/notifications/notification.routes.ts | GET | / | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/notifications/notification.routes.ts | GET | /unread-count | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/notifications/notification.routes.ts | PATCH | /:id/read | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/notifications/notification.routes.ts | PATCH | /mark-all-read | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/notifications/notification.routes.ts | DELETE | /:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/portal/portal.routes.ts | GET | /orders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/portal/portal.routes.ts | GET | /orders/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/portal/portal.routes.ts | POST | /orders/:id/acknowledge | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/portal/portal.routes.ts | POST | /orders/:id/comments | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/portal/portal.routes.ts | POST | /orders/:id/documents | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/grn.routes.ts | GET | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/grn.routes.ts | POST | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/po.routes.ts | GET | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/po.routes.ts | GET | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/po.routes.ts | POST | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/po.routes.ts | PATCH | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/po.routes.ts | DELETE | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/rfq.routes.ts | GET | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/rfq.routes.ts | POST | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/rfq.routes.ts | GET | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/procurement/rfq.routes.ts | POST | /:id/quotations | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | GET | /machines | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | POST | /machines | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | PATCH | /machines/:id | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | GET | /machines/:id/maintenance | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | POST | /maintenance | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | GET | /machines/:id/downtime | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | POST | /downtime | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | GET | /spare-parts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/machine.routes.ts | POST | /spare-parts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/monitoring.routes.ts | GET | /dashboard | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/monitoring.routes.ts | GET | /machines/status | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/monitoring.routes.ts | PATCH | /batches/:batchId/progress | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/monitoring.routes.ts | GET | /alerts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/monitoring.routes.ts | POST | /alerts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/monitoring.routes.ts | PUT | /alerts/:alertId/resolve | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /plans | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | POST | /plans | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /forecasts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | POST | /forecasts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /machines | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | POST | /mrp | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /schedule | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | PATCH | /batches/:id/schedule | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /shifts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | POST | /shifts | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /work-orders | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | POST | /work-orders | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | PATCH | /batches/:id/assign | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/production/planning.routes.ts | GET | /operators | Production + Business flows: WIP and transformation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | POST | /upload-photos | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /inspections | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /inspections/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | POST | /inspections | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | PATCH | /inspections/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | DELETE | /inspections/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /tests | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /tests/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | POST | /tests | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | PATCH | /tests/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | DELETE | /tests/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | POST | /tests/:id/certificate | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /defects | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /defects/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | POST | /defects | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | PATCH | /defects/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | DELETE | /defects/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /defects/analytics | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /templates | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /templates/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | POST | /templates | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | PATCH | /templates/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | DELETE | /templates/:id | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /analytics/overview | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /analytics/supplier-quality | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /analytics/stage-trends | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-control/quality-control.routes.ts | GET | /analytics/rejection-rates | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-prediction/quality-prediction.routes.ts | GET | /predictions/material/:supplierId | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-prediction/quality-prediction.routes.ts | GET | /predictions/batch/:batchId | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/quality-prediction/quality-prediction.routes.ts | GET | /predictions/alerts | Quality inspections + stock holds |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/cost-optimization.routes.ts | GET | /analyze | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/cost-optimization.routes.ts | GET | /trends/:materialType | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/cost-optimization.routes.ts | GET | /compare/:materialType | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/cost-optimization.routes.ts | GET | /analytics | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/raw-materials.routes.ts | GET | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/raw-materials.routes.ts | POST | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/raw-materials.routes.ts | PATCH | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/raw-materials/raw-materials.routes.ts | DELETE | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | GET | /dashboard/kpis | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | GET | /compliance/:type | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | POST | /builder/generate | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | GET | /schedules | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | POST | /schedules | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | DELETE | /schedules/:id | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/reporting/reporting.routes.ts | POST | /engine/run | EverGreen reports; compare source-specific calculations |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | POST | /orders | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | GET | /orders | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | GET | /orders/analytics | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | GET | /orders/:id | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | PATCH | /orders/:id/status | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | POST | /orders/:id/packing-list | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/sales/sales.routes.ts | POST | /orders/:id/delivery-note | Business Desk + shop + returns and credit allocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/search/search.routes.ts | GET | / | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | GET | /:supplierId/progress | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | PUT | /:supplierId/step | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | POST | /:supplierId/submit | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | POST | /:supplierId/approve | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | POST | /:supplierId/reject | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | POST | /:supplierId/documents | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | GET | /:supplierId/documents | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | POST | /documents/:documentId/verify | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | POST | /documents/:documentId/reject | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | DELETE | /documents/:documentId | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/onboarding.routes.ts | GET | /documents/expiring | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | POST | /:supplierId/metrics | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | GET | /:supplierId/metrics/trends | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | POST | /:supplierId/metrics/update-all | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | POST | /:supplierId/ratings | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | GET | /:supplierId/ratings | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | GET | /:supplierId/ratings/statistics | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | PUT | /ratings/:ratingId | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | DELETE | /ratings/:ratingId | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | POST | /:supplierId/risks | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | GET | /:supplierId/risks | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | GET | /:supplierId/risks/summary | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | PUT | /risks/:assessmentId/status | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/performance.routes.ts | GET | /risks/review-due | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | GET | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | GET | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | POST | / | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | PATCH | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | DELETE | /:id | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | GET | /:id/account | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/suppliers/suppliers.routes.ts | PUT | /:id/account | Inward + Business flows: purchases, supplier settlement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | POST | /tickets | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | GET | /tickets | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | GET | /tickets/stats | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | GET | /tickets/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | PATCH | /tickets/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | POST | /tickets/:id/assign | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | POST | /tickets/:id/comments | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | POST | /kb/articles | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | GET | /kb/articles | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | GET | /kb/articles/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | PATCH | /kb/articles/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | POST | /kb/articles/:id/publish | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/support/support.routes.ts | POST | /kb/articles/:id/helpful | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | GET | /me | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | PATCH | /me | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | GET | / | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | POST | / | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | GET | /me/security | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | PATCH | /me/ip-whitelist | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | DELETE | /me/devices/:deviceId | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | PUT | /:id | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | DELETE | /:id | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/modules/users/users.routes.ts | POST | /invite | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | GET | /stats | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | GET | /:queueName/jobs | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | GET | /:queueName/jobs/:jobId | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | POST | /:queueName/jobs/:jobId/retry | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | DELETE | /:queueName/jobs/:jobId | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | POST | /:queueName/clean | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | POST | /:queueName/pause | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/queues/jobs.routes.ts | POST | /:queueName/resume | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/app-settings.routes.ts | POST | /logo | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/app-settings.routes.ts | GET | / | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/app-settings.routes.ts | PUT | / | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/app-settings.routes.ts | GET | /all | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/session-logs.routes.ts | GET | / | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/session-logs.routes.ts | GET | /:id | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/session-logs.routes.ts | DELETE | /:id | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/session-logs.routes.ts | POST | / | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/session-logs.routes.ts | PUT | /:id/logout | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/src/routes/session-logs.routes.ts | GET | /stats/active | EverGreen auth, users, sessions and settings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /login | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /billing/print/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | / | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /dashboard | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /procurement | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /production-planning | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /production/live | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /work-orders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /shifts | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /machines | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /manufacturing | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /production/efficiency | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /demand-forecasting | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /billing | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /billing/invoices/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /customers | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /customers/new | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /customers/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /customers/:id/edit | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /sales/orders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /sales/orders/new | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /sales/orders/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /sales/orders/:id/edit | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /hr/employees | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /hr/payroll | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /documents | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /communication | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /support | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /wastage | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /inventory | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/warehouses/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/transfer | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/movements | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/scanner | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/optimization | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/reconciliation | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /warehouse/reconciliation/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /reports | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /integrations | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /developer | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /finance/ar | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /finance/ledger/:customerId | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /finance/ap | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /finance/ap/ledger/:supplierId | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /users | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /settings | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /quality-control | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /quality-analytics | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /suppliers/onboarding | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /suppliers/:supplierId/performance | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /news-intelligence | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /portal | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | dashboard | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | orders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | orders/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | /customer-portal | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | dashboard | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | orders | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | orders/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | invoices | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | invoices/:id | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | account | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | support | Source-specific function: retain and review; no merger parity claim |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/web/src/App.tsx | SCREEN | * | Source-specific function: retain and review; no merger parity claim |

## Data contracts

| Source schema | Model |
| --- | --- |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | User |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | TrustedDevice |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Role |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Permission |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | UserRole |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | RolePermission |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | RefreshToken |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Authenticator |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | AuditLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Supplier |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierAccount |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierMaterial |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierPricing |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierPerformance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SystemSettings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | RawMaterial |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ProductionBatch |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | MaterialCostAnalysis |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ProductionStage |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | WastageLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ProductionAlert |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | OEEMetric |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | CycleTimeAnalysis |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | FinishedGood |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Notification |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | QualityInspection |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | QualityTest |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DefectLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InspectionTemplate |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | PurchaseOrder |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | PurchaseOrderItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | RequestForQuotation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | RFQItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Quotation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | QuotationItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | GoodsReceiptNote |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | GoodsReceiptNoteItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | PODocument |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | POComment |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ProductionPlan |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DemandForecast |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SeasonalityIndex |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | MarketTrend |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DemographicMetric |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | NewsItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Machine |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | MaintenanceRecord |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DowntimeLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SparePart |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Warehouse |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | WarehouseLocation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | StockTransfer |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | StockMovementLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Shift |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | WorkOrder |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InventoryOptimization |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | StockReconciliation |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ReconciliationItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Invoice |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InvoiceTemplate |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InvoiceReminder |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Customer |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | CustomerContact |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | CustomerAddress |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SalesOrder |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SalesOrderItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | PackingList |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DeliveryNote |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Department |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Employee |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Attendance |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | LeaveRequest |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Payroll |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DocumentFolder |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Document |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DocumentVersion |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Message |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Announcement |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupportTicket |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | TicketComment |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | KnowledgeBaseArticle |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ARPayment |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ARFollowUp |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | BadDebtProvision |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | CreditNote |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | DebitNote |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InvoiceItem |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InvoicePayment |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | InvoiceHistory |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | RecurringBillingConfig |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | VendorInvoice |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | VendorPayment |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Expense |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | Budget |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | IntegrationConfig |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SyncLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ApiKey |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | WebhookSubscription |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | WebhookLog |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | ReportSchedule |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierDocument |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierPerformanceMetric |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierRating |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SupplierRiskAssessment |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | AppSettings |
| backups/source_projects_archive/Yarn/Yarn-Management/apps/api/prisma/schema.prisma | SessionLog |

## Local database snapshots

No SQLite snapshot was found in the retained reference-project folders. Supply real source exports before reconciling external business data.

Reference folders are preserved. Removal and release acceptance are separate from implementation.
