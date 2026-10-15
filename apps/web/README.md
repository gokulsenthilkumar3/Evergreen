# EverGreen web application

React, Material UI and TanStack Query power the staff application and public shop. Start the full system from the repository root with `npm run dev`; the default public URL is http://localhost:4000/.

- [Setup and service directory](../../QUICK_START.md)
- [Business flow and verification](../../docs/BUSINESS_FLOW.md)
- [Backlog and long-term direction](../../docs/IMPLEMENTATION_BACKLOG.md)

Business Workspace (`/workspace`) provides live commerce summaries, a machine register count, API health, manual refresh and optional 30-second polling. Failed requests remain visible instead of becoming zero balances. Its searchable business guide is shared with Tutorial (`/tutorial`), and its navigation updates browser history.

`src/components/BusinessFlowGuide.tsx` owns the shared operational handoffs. Update this guide when a workflow changes. Detailed tutorials remain in `src/pages/Tutorial.tsx`. Do not present planned features as operational capabilities.

User Management (`/users`) is the administrator screen, implemented in `src/pages/UserManagement.tsx`. It provides role totals, searchable user records, and create/edit dialogs. Only administrators fetch the user list. Request failures have a retry action, and the table supports horizontal scrolling on smaller screens. Password validation follows the API's 12-character minimum and 72-byte maximum; an empty password on edit preserves the existing password.

Run from the root:

```sh
npm run build -w apps/web
npm run test -w apps/web -- --run
# Focused admin UI regression checks
npm run test -w apps/web -- src/pages/UserManagement.test.tsx
```

Browser API calls use `/api/backend`. The Vite development and preview proxies forward that prefix to the internal API. Configure equivalent routing when deploying static assets behind a production reverse proxy.
