# ShopPortal

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/ShopPortal.tsx](../../../apps/web/src/pages/ShopPortal.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {language === 'en' ? 'தமிழ்' : 'English'} | `{switchLanguage}` | [apps/web/src/pages/ShopPortal.tsx:72](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.staff} | `delegated / form submit` | [apps/web/src/pages/ShopPortal.tsx:72](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.retry} | `{() => void refetch()}` | [apps/web/src/pages/ShopPortal.tsx:77](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.view} | `{() => setSelected(product)}` | [apps/web/src/pages/ShopPortal.tsx:80](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.add} | `{() => setQuantity(product, quantityFor(product.id) + 1)}` | [apps/web/src/pages/ShopPortal.tsx:80](../../../apps/web/src/pages/ShopPortal.tsx) |
| {`Remove ${row.product!.name}`} | `{() => setQuantity(row.product!, row.quantity - 1)}` | [apps/web/src/pages/ShopPortal.tsx:83](../../../apps/web/src/pages/ShopPortal.tsx) |
| {`Add ${row.product!.name}`} | `{() => setQuantity(row.product!, row.quantity + 1)}` | [apps/web/src/pages/ShopPortal.tsx:83](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.checkout} | `{() => { setError(''); setCheckoutOpen(true); }}` | [apps/web/src/pages/ShopPortal.tsx:83](../../../apps/web/src/pages/ShopPortal.tsx) |
| <Close /> | `{() => setSelected(null)}` | [apps/web/src/pages/ShopPortal.tsx:85](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.add} | `{() => { if (selected) setQuantity(selected, quantityFor(selected.id) + 1); setSelected(null); }}` | [apps/web/src/pages/ShopPortal.tsx:85](../../../apps/web/src/pages/ShopPortal.tsx) |
| <Close /> | `{() => setCheckoutOpen(false)}` | [apps/web/src/pages/ShopPortal.tsx:86](../../../apps/web/src/pages/ShopPortal.tsx) |
| {submitting ? t.placing : t.place} | `{() => void placeOrder()}` | [apps/web/src/pages/ShopPortal.tsx:86](../../../apps/web/src/pages/ShopPortal.tsx) |
| {t.back} | `{() => setResult(null)}` | [apps/web/src/pages/ShopPortal.tsx:87](../../../apps/web/src/pages/ShopPortal.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |

## Composed behavior

- [AiAssistant.tsx](../../../packages/portal-ui/AiAssistant.tsx)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
