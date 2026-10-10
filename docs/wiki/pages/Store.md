# Store

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Store.tsx](../../../apps/web/src/pages/Store.tsx).

Direct routes: `/store`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Open public shop | `delegated / form submit` | [apps/web/src/pages/Store.tsx:49](../../../apps/web/src/pages/Store.tsx) |
| Manage catalogue | `{() => onNavigate?.('catalogue')}` | [apps/web/src/pages/Store.tsx:49](../../../apps/web/src/pages/Store.tsx) |
| Sales orders | `{() => onNavigate?.('orders')}` | [apps/web/src/pages/Store.tsx:49](../../../apps/web/src/pages/Store.tsx) |
| Add to order | `{() => changeQuantity(item, 1)}` | [apps/web/src/pages/Store.tsx:60](../../../apps/web/src/pages/Store.tsx) |
| Add customer | `{() => onNavigate?.('customers')}` | [apps/web/src/pages/Store.tsx:68](../../../apps/web/src/pages/Store.tsx) |
| {`Remove ${row.item!.name}`} | `{() => changeQuantity(row.item!, -1)}` | [apps/web/src/pages/Store.tsx:69](../../../apps/web/src/pages/Store.tsx) |
| {`Add ${row.item!.name}`} | `{() => changeQuantity(row.item!, 1)}` | [apps/web/src/pages/Store.tsx:69](../../../apps/web/src/pages/Store.tsx) |
| {saving ? 'Reserving…' : 'Create sales order'} | `{reserveOrder}` | [apps/web/src/pages/Store.tsx:73](../../../apps/web/src/pages/Store.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/items` | [apps/web/src/pages/Store.tsx:20](../../../apps/web/src/pages/Store.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/Store.tsx:21](../../../apps/web/src/pages/Store.tsx) |
| POST | `/commerce/orders` | [apps/web/src/pages/Store.tsx:38](../../../apps/web/src/pages/Store.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
