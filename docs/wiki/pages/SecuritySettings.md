# SecuritySettings

[Wiki home](../README.md) · [Operating guide](../OPERATING_GUIDE.md)

Source: [apps/web/src/pages/SecuritySettings.tsx](../../../apps/web/src/pages/SecuritySettings.tsx).

Direct routes: `/security`

## Before you start

Sign in to the company installation. VIEWER reads records, MODIFIER performs ordinary operational changes, and ADMIN manages restricted operations. Endpoint-specific decorators take precedence. Guided navigation is a preference; API permissions remain authoritative.

## Tabs

No literal Tab controls in this file. Check composed components and dynamic navigation below.

## Actions

| Control / label | Handler | Source |
| --- | --- | --- |
| {showCurrentPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} | `{() => setShowCurrentPass(!showCurrentPass)}` | [apps/web/src/pages/SecuritySettings.tsx:279](../../../apps/web/src/pages/SecuritySettings.tsx) |
| {showNewPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />} | `{() => setShowNewPass(!showNewPass)}` | [apps/web/src/pages/SecuritySettings.tsx:303](../../../apps/web/src/pages/SecuritySettings.tsx) |
| {passwordBusy ? 'Updating Password...' : 'Update Password'} | `delegated / form submit` | [apps/web/src/pages/SecuritySettings.tsx:333](../../../apps/web/src/pages/SecuritySettings.tsx) |
| Disable 2FA | `{handleDisableTotp}` | [apps/web/src/pages/SecuritySettings.tsx:379](../../../apps/web/src/pages/SecuritySettings.tsx) |
| Set Up Authenticator App | `{handleGenerateTotp}` | [apps/web/src/pages/SecuritySettings.tsx:390](../../../apps/web/src/pages/SecuritySettings.tsx) |
| Verify & Enable | `{handleVerifyTotp}` | [apps/web/src/pages/SecuritySettings.tsx:420](../../../apps/web/src/pages/SecuritySettings.tsx) |
| Register New Passkey on this Device | `{handleRegisterPasskey}` | [apps/web/src/pages/SecuritySettings.tsx:450](../../../apps/web/src/pages/SecuritySettings.tsx) |

## API calls

Paths are relative to the client API base (`/api/backend` by default in the browser). Template expressions contain runtime identifiers. This lists calls in this file; composed components can own additional requests.

| Method | Path expression | Source |
| --- | --- | --- |
| GET | `/auth/me` | [apps/web/src/pages/SecuritySettings.tsx:57](../../../apps/web/src/pages/SecuritySettings.tsx) |
| GET | `/auth/totp/generate` | [apps/web/src/pages/SecuritySettings.tsx:65](../../../apps/web/src/pages/SecuritySettings.tsx) |
| POST | `/auth/totp/verify` | [apps/web/src/pages/SecuritySettings.tsx:78](../../../apps/web/src/pages/SecuritySettings.tsx) |
| POST | `/auth/totp/disable` | [apps/web/src/pages/SecuritySettings.tsx:96](../../../apps/web/src/pages/SecuritySettings.tsx) |
| GET | `/auth/passkey/register-options` | [apps/web/src/pages/SecuritySettings.tsx:112](../../../apps/web/src/pages/SecuritySettings.tsx) |
| POST | `/auth/passkey/register-verify` | [apps/web/src/pages/SecuritySettings.tsx:115](../../../apps/web/src/pages/SecuritySettings.tsx) |
| PUT | `/auth/change-password` | [apps/web/src/pages/SecuritySettings.tsx:139](../../../apps/web/src/pages/SecuritySettings.tsx) |

## Composed behavior

- [api.ts](../../../apps/web/src/utils/api.ts)

## Verify the workflow

Follow the relevant business scenario in the operating guide. Confirm the saved record by reloading the page and compare the owning stock or financial ledger. On an error, retain the draft and correct the displayed issue before retrying. Do not infer success from an animation or a navigation badge.

For detailed contracts use [API reference](../../reference/API.md), [all UI controls](../../reference/UI_CONTROLS.md), and [workflow actions](../../reference/WORKFLOWS.md).
