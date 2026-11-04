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
| {uiText("Open public shop")} | `delegated / form submit` | [apps/web/src/pages/Store.tsx:51](../../../apps/web/src/pages/Store.tsx) |
| {uiText("Manage catalogue")} | `{() => onNavigate?.('catalogue')}` | [apps/web/src/pages/Store.tsx:51](../../../apps/web/src/pages/Store.tsx) |
| {uiText("Sales orders")} | `{() => onNavigate?.('orders')}` | [apps/web/src/pages/Store.tsx:51](../../../apps/web/src/pages/Store.tsx) |
| {uiText("Add to order")} | `{() => changeQuantity(item, 1)}` | [apps/web/src/pages/Store.tsx:62](../../../apps/web/src/pages/Store.tsx) |
| {uiText("Add customer")} | `{() => onNavigate?.('customers')}` | [apps/web/src/pages/Store.tsx:70](../../../apps/web/src/pages/Store.tsx) |
| {uiTemplate`Remove ${row.item!.name}`} | `{() => changeQuantity(row.item!, -1)}` | [apps/web/src/pages/Store.tsx:71](../../../apps/web/src/pages/Store.tsx) |
| {uiTemplate`Add ${row.item!.name}`} | `{() => changeQuantity(row.item!, 1)}` | [apps/web/src/pages/Store.tsx:71](../../../apps/web/src/pages/Store.tsx) |
| {saving ? uiText("Reserving…") : uiText("Create sales order")} | `{reserveOrder}` | [apps/web/src/pages/Store.tsx:75](../../../apps/web/src/pages/Store.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/commerce/items` | [apps/web/src/pages/Store.tsx:22](../../../apps/web/src/pages/Store.tsx) |
| GET | `/commerce/customers` | [apps/web/src/pages/Store.tsx:23](../../../apps/web/src/pages/Store.tsx) |
| POST | `/commerce/orders` | [apps/web/src/pages/Store.tsx:40](../../../apps/web/src/pages/Store.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
