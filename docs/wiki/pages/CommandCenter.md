# CommandCenter

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CommandCenter.tsx](../../../apps/web/src/pages/CommandCenter.tsx).

Direct routes: `/command-center`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Close | `{onClose}` | [apps/web/src/pages/CommandCenter.tsx:287](../../../apps/web/src/pages/CommandCenter.tsx) |
| Open Machine Register | `{() => { onClose(); onNavigate?.('yarnmachine'); }}` | [apps/web/src/pages/CommandCenter.tsx:406](../../../apps/web/src/pages/CommandCenter.tsx) |
| Toggle Strategy Audio Effects | `{handleSoundToggle}` | [apps/web/src/pages/CommandCenter.tsx:699](../../../apps/web/src/pages/CommandCenter.tsx) |
| Refresh all data | `{handleRefresh}` | [apps/web/src/pages/CommandCenter.tsx:740](../../../apps/web/src/pages/CommandCenter.tsx) |
| {floorExpanded ? 'Collapse floor' : 'Expand floor'} | `{() => { sfx.playClick(); setFloorExpanded((v) => !v); }}` | [apps/web/src/pages/CommandCenter.tsx:756](../../../apps/web/src/pages/CommandCenter.tsx) |
| Retry | `{handleRefresh}` | [apps/web/src/pages/CommandCenter.tsx:825](../../../apps/web/src/pages/CommandCenter.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/dashboard/summary` | [apps/web/src/pages/CommandCenter.tsx:446](../../../apps/web/src/pages/CommandCenter.tsx) |
| GET | `/machines` | [apps/web/src/pages/CommandCenter.tsx:452](../../../apps/web/src/pages/CommandCenter.tsx) |
| GET | `/machines/inspections` | [apps/web/src/pages/CommandCenter.tsx:458](../../../apps/web/src/pages/CommandCenter.tsx) |
| GET | `/inventory/inward` | [apps/web/src/pages/CommandCenter.tsx:464](../../../apps/web/src/pages/CommandCenter.tsx) |
| GET | `/inventory/outward` | [apps/web/src/pages/CommandCenter.tsx:470](../../../apps/web/src/pages/CommandCenter.tsx) |
| GET | `/production` | [apps/web/src/pages/CommandCenter.tsx:476](../../../apps/web/src/pages/CommandCenter.tsx) |
| GET | `/quality/inspections` | [apps/web/src/pages/CommandCenter.tsx:482](../../../apps/web/src/pages/CommandCenter.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [FloorCanvas.tsx](../../../apps/web/src/components/command-center/FloorCanvas.tsx)
- [CampusScene.tsx](../../../apps/web/src/components/command-center/CampusScene.tsx)
- [WarRoomView.tsx](../../../apps/web/src/components/command-center/WarRoomView.tsx)
- [ShipmentStepperHud.tsx](../../../apps/web/src/components/command-center/ShipmentStepperHud.tsx)
- [FleetDockTableHud.tsx](../../../apps/web/src/components/command-center/FleetDockTableHud.tsx)
- [KpiRibbon.tsx](../../../apps/web/src/components/command-center/KpiRibbon.tsx)
- [ActivityFeed.tsx](../../../apps/web/src/components/command-center/ActivityFeed.tsx)
- [sfx.ts](../../../apps/web/src/utils/sfx.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
