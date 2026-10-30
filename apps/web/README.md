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

## Layout, motion and offline behaviour

- Below 900 px the navigation is an overlay that closes after a choice. Each page renders in its own error boundary and is pinned to the content width, so a page root using `maxWidth` with `mx: 'auto'` cannot widen the screen.
- Decorative 3D scenes go through `SafeScene` (`src/components/common/SceneFallback.tsx`). They are lit by local `Lightformer` panels, never a downloaded environment preset, and fall back to an animated 2D cone without WebGL, while loading or after a failure.
- `src/index.css` stops decorative motion under `prefers-reduced-motion`. Theme-dependent CSS follows the app's own light/dark toggle through `data-theme-mode` on the root element, not the operating-system setting.
- GST rules shown in forms (GSTIN format, state from GSTIN, state names) come from `@evergreen/types`, the same rules the API enforces.

Build-time settings: `VITE_API_URL` overrides the API prefix, and `VITE_SUPPORT_PHONE` (international digits without `+`) enables the call and WhatsApp buttons on licence notices. Without it those buttons are hidden.
