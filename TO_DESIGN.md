# To Design — EverGreen Strategy-Game Dashboard

Design and analysis plan • 7 October 2026 • Application implementation deferred

## 1. Direction

Turn EverGreen into a readable miniature of the entire business: suppliers deliver cotton bales, production transforms material, yarn becomes bags, warehouses hold stock, dispatch connects to customers, and quality, maintenance, staffing, orders, payments, and costs explain what is happening around that flow.

Use the reference video's spatial presentation and selection behavior. Keep numerical truth, permissions, and existing business workflows authoritative. The map is a command center and navigation surface; detailed transactions continue in their existing screens.

The plan is named **To Design**. Suggested navigation label: **Operations Map**. This document does not rename the chat or implement the application.

## 2. Reference video: observed visual language

Local source: `C:\Users\gokul\Downloads\What if managing an entire warehouse felt like playing a strategy game 📦🚛Built with Claude Opu.mp4`.

The filename originally supplied omitted emojis. The matching file is approximately 29.97 seconds, 720 × 1280, at 30 fps. It is a portrait recording containing a landscape application view and promotional text. Analysis used timestamped sampled frames; audio was not transcribed. Small UI text has limited resolution. The video's claims about its creator/model are promotional text, not independently verified facts.

Evidence: [contact sheet](design-reference/video-contact-sheet.jpg), detailed crops at [0 seconds](design-reference/frame-0s.png), [8 seconds](design-reference/frame-8s.png), [16 seconds](design-reference/frame-16s.png), [24 seconds](design-reference/frame-24s.png), and [29 seconds](design-reference/frame-29s.png).

| Time | Visible presentation | EverGreen application |
|---|---|---|
| 0–3 s | Elevated oblique warehouse overview; blue buildings, pale ground, pallets, trucks, forklifts; KPI overlays and site detail panel | An immediately readable factory campus with cotton stores, production buildings, yarn stores, and loading bays |
| 5–14 s | Changing viewpoints around roads and loading bays; physical separation of assets and spaces | Pan/zoom between receiving, manufacturing, storage, and dispatch; stable named zones |
| Around 16 s | Selected forklift with outline and object detail panel showing charging-related information | Selected machine with inspection history and recorded status; telemetry only when available |
| Around 24 s | Site/network selector, selected truck, shipment details and dock activity | Site/domain switcher and dispatch/customer detail drawer |
| 27–30 s | Closer loading-bay view with vehicles and cargo | Inspect a dispatch, bag group, or location without losing the surrounding context |

The recognizable style is **bright, low-poly 3D with restrained overlays**. White panels, blue structures, rounded miniature trees, yellow handling equipment, soft shadows, selection markers, asset motion, and camera movement create the strategy-game feeling. Frames demonstrate changing vehicle positions and viewpoints; they do not establish that underlying data is genuinely live.

Dark navy glass panels, neon status rings, particle streams, confetti, and floating staff avatars are ideas from the supplied draft. Treat these as optional adaptations, not observed reference features. The video does not disclose its rendering library or backend architecture.

## 3. Repository findings and corrections

Reviewed the main Prisma schema, frontend dependency manifest, dashboard and domain controllers/services, existing scene component, and local Command Center prototype. This is a code-level design audit, not a runtime or production-data audit. Desktop schema parity still needs a separate check.

| Finding | Design consequence |
|---|---|
| React/Vite frontend, NestJS API, database schema, and Electron desktop structure exist | Design for web and desktop; validate parity before promising identical behavior |
| Motion, React Query, MUI, Recharts, Zustand, Three.js, R3F, and Drei are declared | Existing tools can support the proposed interface; installed dependencies alone do not prove runtime performance |
| `DashboardScene.tsx` contains a Three.js yarn object | Reuse its integration pattern; it is not evidence that a whole factory scene is production-ready |
| Uncommitted `CommandCenter.tsx`, `FloorCanvas.tsx`, `KpiRibbon.tsx`, `ActivityFeed.tsx`, and App navigation already exist | Evaluate and evolve this prototype rather than proposing all of it as new work; preserve current local changes |
| `GET /dashboard/summary`, `/dashboard/charts`, and `/dashboard/recent-activity` exist | Reuse numeric `meta` and chart data; start the feed with the existing aggregate |
| Cotton/yarn inventory endpoints currently return empty placeholder arrays and zero stock | Do not use these endpoints as the authoritative map sources; inspect ledger/available-batch and yarn-stock calculations |
| Main schema calls the production entity `Production`, not `ProductionRun`; it has totals and consumption/output rows, but no machine link or running lifecycle | Show recorded production; machine-specific moving material needs additional provenance |
| `Machine.active` is a registry flag, not operational telemetry | Label “Active asset,” not “Running”; unknown operational state must be explicit |
| Inspection statuses are `PENDING`, `IN_PROGRESS`, `COMPLETED` | Correct the prototype's `RESOLVED`/`CLOSED` assumptions before trusting counts or alerts |
| Sales orders use `DRAFT`, `CONFIRMED`, `PARTIALLY_INVOICED`, `INVOICED`, `CANCELLED`; lines have no `reservedQty` field | Show fulfillment, invoicing, and payment separately; do not imply stock reservations already exist |
| Summary computes bags using 60 kg equivalents and cotton bales using estimated average bale weight | Label equivalents/estimates; distinguish these from entered physical quantities |
| Quality uses `QualityInspection`, including `HOLD` and disposition fields | A hold marker is supported; physical quarantine movement and enforced inventory blocking need verification/additional design |
| HR has assignments in schema, but the reviewed API exposes staff, shifts, and payroll, without an assignment read endpoint | Department groups are feasible; verified attendance, current shift coverage, and machine placement need more data |
| Warehouse API returns recent movement subsets | Recent movements cannot establish complete location balances; transfers need explicit directional/pairing rules |
| Supplier is text on inward batches; job workers and customers have models | Supplier clustering is possible, but procurement lifecycle and canonical supplier identities are separate work |

The reviewed main schema does not contain dedicated WIP-lot/conversion-subcontracting or purchase-order models. Production has an intermediate total, which can support a summary WIP indicator but not traceable WIP lots. The named `SETTLE_GAP_MS` was not found in the reviewed API module search; verify any intended settling rule before displaying a countdown.

Prototype risks already visible in code: inward feed expects `batchNo/quantity/bales` while batch records use `batchId/kg/bale`; outward feed expects `weight` while the dashboard uses `totalWeight`; production is called running if an entry is under four hours old; dispatch count is the length of at most five historical records; quality holds are hard-coded zero. Treat these as design blockers to truthful presentation, not validated operational indicators.

Key evidence paths:

- `packages/database/prisma/schema.prisma`
- `apps/web/package.json`
- `apps/web/src/pages/CommandCenter.tsx`
- `apps/web/src/components/command-center/FloorCanvas.tsx`
- `apps/web/src/components/DashboardScene.tsx`
- `apps/api/src/modules/dashboard/dashboard.controller.ts`
- `apps/api/src/modules/inventory/inventory.controller.ts`
- `apps/api/src/modules/inventory/inventory.service.ts`
- Machine, warehouse, quality, and HR services under `apps/api/src/modules/`

## 4. One business world, multiple readable layers

Avoid putting every domain into the scene simultaneously. Keep one campus with selectable layers and progressive detail.

**Campus:** supplier receiving → cotton store → production buildings → yarn/packing → warehouse → dispatch → customer connections. Include maintenance workshop, QC area, staff/shift area, office/finance, waste storage, and external job workers. The initial layout is schematic. Label it accordingly until a real floor plan and asset coordinates are supplied.

**Material layer:** cotton, recorded transformations, yarn count groups, loose stock, waste, warehouse movements, dispatch, and job work.

**Equipment layer:** named machines, asset activity flag, open inspections, inspection cost, maintenance history. Running/stopped telemetry is a later integration.

**People layer:** departments, staff counts, shift schedules, verified assignments when exposed, payroll summaries according to role. No invented employee locations.

**Commercial layer:** customers, sales orders, partial invoicing, outstanding balances, collections, catalogue, brands, and storefront. Customers and suppliers appear as connected external nodes, not fake geographic destinations.

**Quality/risk layer:** pending inspection, hold, fail/pass, disposition, affected batch or production reference, and exceptions. Unmapped references belong in a visible exception list.

**Finance layer:** cost categories, invoice totals, payments, receivables, and customer ledger links. Separate invoiced sales from cash collections and costs; a date filter must not silently mix different periods or definitions.

**Administration:** users, sessions, settings, search, and audit logs are available through navigation and context actions. They belong in the complete product design, but need no artificial factory objects. Role restrictions govern both map and drawer content.

## 5. Screen and interaction specification

```text
┌────────────────────────────────────────────────────────────────────┐
│ Search · Site/schematic · Material/Equipment/People/Commerce/Finance│
│ As-of time · Period · Updated timestamp · Refresh · Motion control  │
├───────────────────────────────────────────┬────────────────────────┤
│                                           │ Selection / Exceptions │
│       MINIATURE EVERGREEN CAMPUS          │ Machine, stock group,  │
│       Pan · zoom · reset · legend         │ customer or order      │
│                                           │ Facts → evidence →     │
│       Click a named object or zone        │ existing detail screen │
├───────────────────────────────────────────┴────────────────────────┤
│ Layer-specific KPIs · Recent recorded events · Replay controls     │
└────────────────────────────────────────────────────────────────────┘
```

Default to the whole campus. Selecting an object outlines it and opens a stable right drawer. A deliberate “Focus” action moves the camera; ordinary refreshes never move it. Search selects the relevant entity and provides an alternative list result. Each drawer contains identifier, units, source timestamp, state, related records, and an “Open details” link.

Offer “Current records” and “Replay recorded activity” as distinct modes. A connected sensor mode can be introduced later. An idle scene may have quiet decorative movement, but decorative machinery must not communicate operational state.

On narrow screens, use zone/list navigation and a full-width detail sheet. Provide a table/list counterpart and keyboard selection independently of WebGL.

## 6. Domain objects and animation rules

| Domain | Scene object and useful interaction | Motion and data boundary |
|---|---|---|
| Cotton bales | Stacked textured bales grouped by identifiable batch; stock and receipt details | A newly recorded receipt adds a group once; existing batches do not bounce on every poll. Age is information, not proof of deterioration |
| Machines | Distinct simplified blow-room, carding, drawing, OE/ring, and winding assets where registered | Moving rollers only for verified running state or clearly labeled replay/demo. Maintenance icons follow recorded inspection status |
| Production | Process links with consumed and produced quantities, intermediate total and waste breakdown | Animate a recorded transformation once in replay; do not draw unsupported batch-to-machine links as facts |
| Bags and loose yarn | Bag stacks grouped by count, with loose-weight container and exact label | Use bounded representative stacks plus “represents X”; retain kg as authoritative and label 60 kg bag equivalents |
| Warehouse | Named zones and location panels | Transfer animation requires identified source/destination and confirmed movement; never infer balances from the last five movements |
| Dispatch | Loading bay and truck symbol linked to outward record and customer | Recorded dispatch produces one departure animation. No ETA, speed, vehicle position, or pending load inference without data |
| Job work | Dashed external work area with challan state and sent/received/scrap quantities | Animate recorded dispatch and receipt separately; preserve partial-return states |
| Quality | Hold/inspection marker on resolvable batch or production group | PASS/FAIL/HOLD changes marker once. Do not move stock into quarantine unless a physical movement is recorded |
| Staff and HR | Department groups, shift board, attendance when available | Show assignment/attendance state, not simulated walking people. Payroll animation stays private and restrained |
| Customers | External account nodes with orders, invoices and ledger | Payment receipt briefly updates collection total; no public confetti or exposed payroll/customer balances |
| Suppliers | Inward-source nodes, deliveries and supplier-text clustering | Incoming movement represents recorded receipt. Purchase order/in-transit states are future capabilities |
| Finance and costing | Office node with linked cost/revenue overlays and drill-down charts | Smooth numerical transition preserves exact final amount; comparisons appear only with computed comparable periods |
| Catalogue/storefront | Product/count/brand filter connected to inventory and orders | Illuminate affected groups on selection; validate item-to-yarn-count mapping before combining balances |
| Waste | Separate waste area by blow room/carding/OE/other category | Recorded quantities explain loss streams; avoid suggesting real-time waste rate from daily totals |

Use separate zone identity and status signals. Stable zone colors identify domains; status combines text/icon/color so an orange carding zone cannot be mistaken for an alert. Unknown data is neutral, not healthy green.

## 7. Visual and motion direction

Primary reference direction: pale industrial ground, soft shadows, low-poly buildings and machinery, emerald EverGreen accents, restrained blue wayfinding, warm bales, white yarn bags, and yellow handling equipment. Preserve existing typography and UI controls pending a visual audit. White detail panels should be readable over the scene; limited translucency can show spatial context.

Build a consistent asset family: same scale, edge treatment, lighting, camera projection, and level of detail. Begin with bales, bags, machine families, warehouse buildings, dispatch truck, QC marker, department group, and external account node. Multiple distinct machines must not collapse into one slot by type.

Suggested design targets: 150–250 ms hover/selection feedback, 250–400 ms panel transitions, 400–700 ms deliberate camera focus, 600–1,200 ms event movement. These are prototype targets to evaluate, not observed video timings. Continuous loops are reserved for verified state or explicitly labeled ambient/replay behavior.

Reduced-motion mode removes camera flights, repeating pulses, and moving flows while keeping static paths, labels, and state changes. Pause motion when the page is hidden. Provide a visible animation toggle and reset-view button. The default view should explain the business before the user touches controls.

## 8. Rendering decision

Use a **hybrid design direction**: Three.js/R3F for the low-poly campus and vehicles; ordinary React/MUI for all panels, search, KPIs, event lists, controls, and accessible details. The reference's camera travel, depth, and 3D object silhouettes favor this direction.

Keep the existing SVG prototype as a useful fallback and rapid data-mapping surface. SVG with Motion is a valid simpler product choice, but a flat zone diagram will not reproduce the video's miniature 3D appearance. Before committing to full 3D, prototype one cotton store, two machines, a bag group, and a loading bay on representative desktop hardware. Check readability, object picking, keyboard parity, load time, and animation smoothness.

Rendering must consume a normalized business view model. Avoid embedding calculations, API calls, payroll access, or inventory accounting in meshes. Use stable entity IDs for selection, shared cached queries, bounded representative objects, and lazy-loaded scene assets. Keep optional machine-detail 3D secondary to making the complete campus useful.

## 9. Data and event contract to design before coding

Do not add `/dashboard/live` merely to return speculative booleans. First define the semantics; a possible future aggregate is `/dashboard/operations`, named “live” only when freshness and telemetry justify it.

Contract requirements:

- Snapshot timestamp, stock as-of time, reporting period, timezone, and per-domain freshness.
- Typed numeric quantities and units; estimated/equivalent flags; unknown distinct from zero.
- Stable entity IDs, source module, deep link, and explicit relationship evidence.
- Machine registry status separate from operational state and maintenance state.
- Production recorded date separate from event creation time and any future start/end timestamps.
- Invoice totals, paid amounts, outstanding balance and overdue conditions defined separately; no uncomputed trend badges.
- Warehouse balances from full authoritative accounting, with unmapped stock visible.
- Domain-level availability/error state so a failed quality query never becomes “0 holds.”
- Role-filtered results and alerts; sensitive salary and financial values never sent to unauthorized clients.
- Bounded/paginated records and reconciliation rules for yarn-ledger, catalogue stock and warehouse movements.

A trustworthy event envelope needs stable ID, kind, entity/reference ID, occurred-at and recorded-at timestamps, quantity/unit, source and target when known, and correction/reversal/version information. Existing recent activity is a useful initial feed but lacks stable event IDs in its returned entries and is a short combined snapshot, not a complete event stream.

Polling is sufficient initially for recorded activity: reuse shared React Query keys, pause hidden-tab polling, refetch on focus, back off on failure, and show last successful refresh. Animate only newly observed events after the initial baseline; polling an existing receipt must not replay it. Changes, reversals, late entries, and deletes require explicit reconciliation. Historical replay must not change current inventory.

Server-sent events/WebSocket delivery and sensor feeds can be considered later. They do not create missing business relationships or real-time machine state by themselves.

## 10. Analysis and design phases

| Phase | Work | Reviewable output / exit condition |
|---|---|---|
| 0 — Reference and repository baseline | Inspect video, schema, endpoint behavior, existing prototype and local changes | This plan and reference frames; observed/proposed/unsupported behavior separated |
| 1 — Full EverGreen domain audit | Trace ledger calculations, endpoint response shapes, guards/roles, navigation, desktop schema parity, catalogue mapping, quality enforcement, shift assignment exposure, settlement rules and reversal behavior | Domain-to-source register with sample response shapes and confirmed/derived/missing field classification; all domains accounted for |
| 2 — Information architecture | Finalize campus zones, layers, KPI definitions, drawer content, list counterpart and drill-down routes | Annotated desktop/mobile wireframes; answer “what is here, what changed, what needs attention?” |
| 3 — Art direction and motion storyboard | Create bright reference-style overview, machine selection, bag/warehouse view, dispatch/customer view, people view and finance view | Static mockups plus a short motion prototype; meaningful state and decorative movement distinguished |
| 4 — Technical feasibility spike, later | Compare minimal R3F campus with existing SVG fallback on target hardware | Choose renderer using measured smoothness/load/readability and accessibility; no speculative full asset library first |
| 5 — Contract and implementation backlog, later | Normalize sources, define snapshot/events, aggregation, permissions and reconciliation | Typed contract proposal, missing-data migrations/endpoints, implementation tasks and acceptance criteria |
| 6 — Recorded-data pilot, later | Connect cotton/yarn stock, machines/inspections, recorded production/dispatch and quality | Every visible quantity ties to a source; unknown states remain explicit; existing screens remain reachable |
| 7 — Complete business layers, later | Add customers/orders/invoices/collections, supplier/job work, HR, catalogue/storefront, cost overlays and administration links | Whole-business navigation with role-appropriate data and reconciliation checks |
| 8 — Genuine live operations, optional later | Add explicit machine lifecycle, production-machine links, physical allocations, verified shifts, sensors and event infrastructure | Only verified operational signals drive continuous production/machine movement |

Phases 1–3 are the next design work. Coding begins after the source register, wireframes and motion storyboards make the behavior concrete. No application code was changed during this analysis.

## 11. Acceptance scenarios for the later build

1. Cotton receipt changes the correct stock group once; a refresh does not replay it, and estimated bale count is labeled.
2. A completed inspection leaves the open count; an active machine with no telemetry still says operational state unknown.
3. Historical production animates only in replay/recorded-event context, without asserting an unsupported machine assignment.
4. Bag equivalents and loose kg reconcile to the authoritative yarn-stock source per count; large inventory uses representative stacks.
5. A hold shows the affected reference; missing mappings and failed requests stay visible and do not become zero holds.
6. Partial invoice and partial payment remain distinct; collections and invoiced sales use separate labels and periods.
7. A warehouse transfer is visible only with valid source/destination semantics; location totals reconcile to complete movement accounting.
8. Night shift handling uses the defined timezone; hidden salary/finance data is absent from unauthorized responses as well as the UI.
9. Corrections and reversals reconcile stock and event state; reconnect/refetch does not duplicate animations.
10. Keyboard, reduced motion, mobile and unavailable-WebGL users can inspect the same permitted business facts.

The intended experience is a miniature EverGreen that makes the whole business understandable: the physical world explains material and equipment, connected layers explain people and money, and each visual statement has a traceable source.
