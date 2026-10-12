# Settings

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/Settings.tsx](../../../apps/web/src/pages/Settings.tsx).

Direct routes: `/settings`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

- Company Info ([apps/web/src/pages/Settings.tsx:258](../../../apps/web/src/pages/Settings.tsx))
- System Settings ([apps/web/src/pages/Settings.tsx:259](../../../apps/web/src/pages/Settings.tsx))
- Rates & Defaults ([apps/web/src/pages/Settings.tsx:260](../../../apps/web/src/pages/Settings.tsx))
- Appearance ([apps/web/src/pages/Settings.tsx:261](../../../apps/web/src/pages/Settings.tsx))
- Audit Logs ([apps/web/src/pages/Settings.tsx:262](../../../apps/web/src/pages/Settings.tsx))

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| Upload Logo <input type="file" hidden accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { if (file.size > 500 * 1024) { // 500KB limit toast.error(ERROR_MESSAGES.FILE_TOO_LARGE('500KB')); return; } const reader = new FileReader(); reader.onloadend = () => { setCompanySe | `delegated / form submit` | [apps/web/src/pages/Settings.tsx:294](../../../apps/web/src/pages/Settings.tsx) |
| Remove | `{() => setCompanySettings({ ...companySettings, logo: '' })}` | [apps/web/src/pages/Settings.tsx:323](../../../apps/web/src/pages/Settings.tsx) |
| Save Company Info | `{handleSaveCompanySettings}` | [apps/web/src/pages/Settings.tsx:384](../../../apps/web/src/pages/Settings.tsx) |
| Save System Settings | `{handleSaveSystemSettings}` | [apps/web/src/pages/Settings.tsx:486](../../../apps/web/src/pages/Settings.tsx) |
| Save Operational Rates | `{handleSaveRates}` | [apps/web/src/pages/Settings.tsx:551](../../../apps/web/src/pages/Settings.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/settings` | [apps/web/src/pages/Settings.tsx:85](../../../apps/web/src/pages/Settings.tsx) |
| GET | `/auth/me` | [apps/web/src/pages/Settings.tsx:92](../../../apps/web/src/pages/Settings.tsx) |
| PUT | `/settings` | [apps/web/src/pages/Settings.tsx:156](../../../apps/web/src/pages/Settings.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)
- [messages.ts](../../../apps/web/src/utils/messages.ts)
- [validators.ts](../../../apps/web/src/utils/validators.ts)
- [theme.ts](../../../apps/web/src/theme.ts)
- [Logs.tsx](../../../apps/web/src/pages/Logs.tsx)
- [navigation.ts](../../../apps/web/src/utils/navigation.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
