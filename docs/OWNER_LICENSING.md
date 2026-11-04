# Owner-controlled installation licences

The application now verifies an owner-signed licence before either API starts and on business requests. Tenant/customer routes use the tenant licence. Provider administration needs the provider licence, its signed ADMIN scope, and the existing provider credential. Staff authentication and permissions still apply: a licence can restrict roles but cannot promote a user.

The owner signing key is **not in Git or in a browser bundle**. The repository contains its public verification key. Changing editable licence fields in an application database does not change the signed authorization.

## Your current installation

- Owner signing key: `C:\Users\gokul\AppData\Local\EverGreen\owner-keys\owner-signing-key.dpapi`
- Tenant activation: `C:\Users\gokul\.evergreen\licenses\tenant.json`
- Provider activation: `C:\Users\gokul\.evergreen\licenses\provider.json`
- Current period: 30 days, displayed in Tamil numerals as **௩௦**; expires **30 November 2026**.
- Current roles: `VIEWER`, `MODIFIER`, `ADMIN`, subject to each staff account's existing permissions.
- Current local activations work offline for the signed period. No public renewal URL is configured yet.

The signing key and local activations use Windows DPAPI CurrentUser encryption. The signing-key file also has an explicit owner-only Windows ACL. Another ordinary Windows account cannot decrypt it by copying the file. Keep the owner Windows account and its recovery material protected; losing its DPAPI recovery information can prevent future signing. Back up the protected key and the Windows recovery material to owner-controlled storage. Never put them in a repository, Docker image, browser, shared drive, or customer installation.

## Owner-hosted local operation

`scripts/security/owner-host.cjs activate` takes consistent SQLite snapshots after stopping only verified EverGreen API/Studio processes, verifies each snapshot, stores both databases beneath the owner's private Local AppData directory, and writes a DPAPI-encrypted runtime configuration. It retains the original databases for recovery and limits their file access to the owner. Both APIs bind to loopback. JWT keys are separate for the two planes; existing staff sessions must sign in again after activation.

After initial activation, restart the owner-hosted APIs with:

```powershell
node scripts/security/owner-host.cjs start
```

Retrieve the provider console credential **in your own terminal** when needed:

```powershell
node scripts/security/owner-license.cjs show-provider-key --key-dir "$env:LOCALAPPDATA\EverGreen\owner-keys"
```

Enter it only into the provider sign-in form. The key is exchanged for an eight-hour HttpOnly, SameSite=Strict session cookie and cleared from the input. It is not saved in localStorage or sessionStorage. Browser mutations require a trusted provider origin; root credentials remain available for deliberate server/CLI operations. Use **Lock provider console** when finished. The shared development credential and frontend build-time credential fallback have been removed. Database Studio is no longer started automatically.

For a remote owner server, provision the target account, private encrypted storage, TLS and monitoring first. `deploy/owner-hosted/Caddyfile` separates tenant, provider and licensing domains; only the licensing lease endpoint is exposed on the licensing hostname. Set `ADMIN_CORS_ORIGIN` to the exact HTTPS provider-console origin for browser session protection. The API ports and database files stay private. Domain names, server addresses, certificates and a hosting account have not been supplied, so no external service has been deployed. Do not copy a running SQLite file: take a verified snapshot and test recovery before handover. See the [Caddy routing reference](https://caddyserver.com/docs/caddyfile/directives/handle).

Tamil numerals are a display/input format, not encryption. Actual protection uses Ed25519 signatures, Windows DPAPI, and, for transferable activations, AES-256-GCM with an RSA-OAEP-wrapped installation key. [Node cryptography reference](https://nodejs.org/api/crypto.html).

## Issue a licence without handling cryptography

Run commands from the repository root. Commands refuse to overwrite existing keys or licence outputs.

### Renew your own offline installation

Choose a fresh output directory, issue the licences, then retain a copy of the old activation files and replace only the tenant/provider activation files with the new files. Do not replace the signing key. The signing key stays on your machine.

```powershell
node scripts/security/owner-license.cjs issue --key-dir "$env:LOCALAPPDATA\EverGreen\owner-keys" --license-dir "$env:USERPROFILE\.evergreen\renewal-2026-11" --days 30 --offline-days 30 --roles VIEWER,MODIFIER,ADMIN
```

Tamil input works too: `--days "௩௦" --offline-days "௩"` means a 30-day subscription with a three-day offline allowance. Offline allowance cannot exceed the subscription period. The tool prints IDs, periods and output paths, never the private signing key.

### Activate a different installation

1. On the **target machine**, under the account that runs the API, generate its request. Retain the installation key there.

   ```powershell
   node scripts/security/owner-license.cjs request --license-dir "$env:USERPROFILE\.evergreen\licenses"
   ```

2. Send **only `installation-request.json`** to the owner. It contains a public encryption key and an installation identifier. Do not send `installation-key.json`.

3. On the **owner machine**, issue an activation for that request:

   ```powershell
   node scripts/security/owner-license.cjs issue --key-dir "$env:LOCALAPPDATA\EverGreen\owner-keys" --license-dir "$env:USERPROFILE\.evergreen\issued-customer-001" --request "C:\Requests\installation-request.json" --days 30 --offline-days 3 --roles VIEWER,MODIFIER,ADMIN
   ```

4. Copy the issued tenant/provider files to the target's licence directory, beside its installation key. Each API uses only its matching plane. The owner signing key never leaves the owner machine.

For offline-only customers, set `--offline-days` equal to `--days`. For online customers, use a shorter offline window. A changed host/account changes the deployment binding and needs a new installation request.

## Online renewal and revocation

The owner provider API implements `POST /licensing/lease`. It requires an existing owner grant plus a fresh RSA-PSS proof made with the installation's private key. It does not distribute the provider administrator credential. Requests have a five-minute freshness limit, replay checks and rate limiting. The returned licence is encrypted for the installation and remains limited by the owner grant's roles and subscription expiry.

To operate the issuer, run the provider API under the owner Windows account, behind an owner-controlled HTTPS domain, with:

```text
EVERGREEN_OWNER_KEY_DIRECTORY=C:\Users\gokul\AppData\Local\EverGreen\owner-keys
```

On each online installation, configure the exact endpoint:

```text
EVERGREEN_LICENSE_RENEWAL_URL=https://YOUR-OWNER-DOMAIN/licensing/lease
```

No domain has been selected or contacted automatically. Configure DNS, TLS, access monitoring and durable backup of the owner grant registry before using this online. The issuer currently uses Windows DPAPI; putting that signing key into a Linux container will not work.

APIs attempt renewal before startup and hourly. Network failure does not extend the signed offline deadline. A valid offline licence keeps working until its signed deadline. Expired subscriptions cannot renew themselves.

Revoke online renewal using the licence ID printed by the issuance command:

```powershell
node scripts/security/owner-license.cjs revoke --key-dir "$env:LOCALAPPDATA\EverGreen\owner-keys" --licence-id "THE-ISSUED-LICENCE-ID"
```

Revocation prevents further leases. Previously granted offline access remains valid until its offline deadline. Immediate remote revocation and unlimited offline operation cannot both be guaranteed. The local owner activations issued during setup are offline licences, renewed manually with the first command above.

## Linux/container installations

Create the request inside the actual container under the `node` account, with the stable hostname from Compose. Native Linux installation keys use mode `0600`; use a protected secret volume and encrypted host storage. Mount the activation directory using `EVERGREEN_TENANT_LICENSE_DIRECTORY` / `EVERGREEN_PROVIDER_LICENSE_DIRECTORY`. The API reads `EVERGREEN_LICENSE_FILE` and `EVERGREEN_INSTALLATION_KEY_FILE` from that mount. Its process must be able to atomically replace the activation file for online renewal.

The Docker image includes the request command. Provision the private installation directory with owner-only access first; send its public request to the Windows owner issuer. Do not copy the owner's Windows activation files into Linux. Migrations and API startup require a valid activation.

## What this cannot protect

**This does not make source code unpatchable or encrypt the existing live SQLite databases.** Someone controlling the host, source and a decrypted database can remove local checks or read that plaintext. To keep data confidential even from a copied application, the data encryption key must remain outside the attacker's control, for example in an owner-controlled key service or appropriately protected offline key store.

The current machine's Windows filesystem-encryption probe returned “The request is not supported.” Therefore filesystem encryption cannot be silently enabled for the current databases. Full database encryption needs a supported encrypted SQLite/SQLCipher or managed-database design, a verified backup, recovery procedures and a tested migration. The existing Prisma SQLite database format has not been changed. Signing licences alone does not solve database encryption.

## Validation

Cryptographic tests cover signature/payload tampering, alternate signers, deployment/plane binding, role scopes, subscription/offline expiry, renewal device proofs, and authenticated encryption. HTTP guard tests cover direct staff, login and customer routes. UI gates keep the tenant and provider workspace unmounted until the corresponding API reports an active licence.
