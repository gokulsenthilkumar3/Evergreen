# EverGreen provider admin

The provider workspace runs at http://localhost:5174/ and manages the separate provider API on port 4300. This is distinct from the staff application's User Management page on port 4000.

From the repository root:

```sh
npm run dev -w apps/admin-web
npm run build -w apps/admin-web
npm run lint -w apps/admin-web
npm run test -w apps/admin-web
```

The sidebar contains all 16 modules, with a group filter for core operations, cloud, connectivity, finance, and developer tools. On smaller screens, open **Modules** in the header to navigate. **Customize overview** controls dashboard widgets.

## UI structure

- `src/index.css`: full-width foundation, dark native controls, typography inheritance, and keyboard focus indicators.
- `src/App.css`: module components and theme tokens.
- `src/layout.css`: shared workspace layout, table and filter styles, responsive grids, and narrow-screen overrides; imported last.
- `src/WorkspaceIcon.tsx`: consistent navigation icons without an external icon dependency.
- `src/AdminModal.tsx`: native dialogs with focus containment, Escape dismissal, and background scroll locking.

Tables scroll within their panels. Task boards, card grids, database panels, chat, and AI studio stack as space becomes limited. Dialog headers and actions remain accessible while their content scrolls. System fonts keep the interface usable without a font download.

The UI currently includes sample records and simulated terminal, connector, and AI responses. A visible status is not proof that the external operation ran. This UI update does not change API authorization or implement those integrations.

License renewal saves provider settings and a server-attributed audit note. The dialog prevents another save or dismissal while the request is pending, preserves inputs on failure, and explicitly leaves tenant synchronization unconfirmed. A UTR is an operator note, not bank verification. Installation details do not offer an unverified installer command or expose company enrollment keys.

For visual checks, review each module at desktop, tablet, and phone widths; check long tenant names, empty filters, keyboard navigation, and tall dialogs. Component tests cover all module views, navigation, filter recovery, and dialog dismissal, but do not measure browser layout.
