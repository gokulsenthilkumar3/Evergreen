# EverGreen web application

React, Material UI and TanStack Query power the staff application and public shop. Start the full system from the repository root with `npm run dev`; the default public URL is http://localhost:4000/.

- [Setup and service directory](../../QUICK_START.md)
- [Business flow and verification](../../docs/BUSINESS_FLOW.md)
- [2030 development direction](../../docs/2030_ROADMAP.md)

Business Workspace (`/workspace`) provides live commerce summaries, a machine register count, API health, manual refresh and optional 30-second polling. Failed requests remain visible instead of becoming zero balances. Its searchable business guide is shared with Tutorial (`/tutorial`), and its navigation updates browser history.

`src/components/BusinessFlowGuide.tsx` owns the shared operational handoffs. Update this guide when a workflow changes. Detailed tutorials remain in `src/pages/Tutorial.tsx`. Do not present planned features as operational capabilities.

Run from the root:

```sh
npm run build -w apps/web
npm run test -w apps/web -- --run
```

Browser API calls use `/api/backend`. The Vite development and preview proxies forward that prefix to the internal API. Configure equivalent routing when deploying static assets behind a production reverse proxy.
