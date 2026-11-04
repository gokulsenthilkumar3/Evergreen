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
| {editingId ? uiText("Update") : uiText("Add")} | `{save}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:38](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| {uiText("Cancel")} | `{() => { setEditingId(null); setName(''); }}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:39](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| {uiText("Edit")} | `{() => { setEditingId(row.id); setName(row.name); }}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:44](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| {uiText("Archive")} | `{() => void archive(row)}` | [apps/web/src/pages/CatalogueTaxonomy.tsx:44](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `'/commerce/${resource}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:15](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| PATCH | `'/commerce/${resource}/${editingId}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:19](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| POST | `'/commerce/${resource}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:20](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| DELETE | `'/commerce/${resource}/${row.id}'` | [apps/web/src/pages/CatalogueTaxonomy.tsx:29](../../../apps/web/src/pages/CatalogueTaxonomy.tsx) |

## Composed behavior

- [i18n.ts](../../../apps/web/src/i18n.ts)
- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
