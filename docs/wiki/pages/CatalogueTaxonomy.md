# CatalogueTaxonomy

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/CatalogueTaxonomy.tsx](../../../apps/web/src/pages/CatalogueTaxonomy.tsx).

Direct routes: **Not directly mounted by App.tsx.** This file may be composed by another page or retained from an earlier implementation; its existence does not establish a supported route.

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {editingId ? 'Update' : 'Add'} | `{save}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:36](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| Cancel | `{() => { setEditingId(null); setName(''); }}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:37](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| Edit | `{() => { setEditingId(row.id); setName(row.name); }}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:42](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| Archive | `{() => void archive(row)}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:42](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `'/commerce/${resource}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:13](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| PATCH | `'/commerce/${resource}/${editingId}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:17](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| POST | `'/commerce/${resource}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:18](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| DELETE | `'/commerce/${resource}/${row.id}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:27](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
