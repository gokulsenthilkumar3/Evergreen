# Environment variable register

Static source/configuration references; values deliberately omitted. Validation means a central typed fail-fast contract, not merely parsing a number or providing a fallback. Shell expansion, external secret stores and production values are UNVERIFIED. Commented examples do not activate integrations.

| Variable | Locations | Boot validation status |
| --- | --- | --- |
| ADMIN_API_KEY | apps/admin-api/src/guards/provider-access.guard.ts:8; docker-compose.production.yml:78 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| ADMIN_API_PORT | apps/admin-api/src/main.ts:444; deploy/docker/admin-entrypoint.sh:11; deploy/docker/Dockerfile.admin-api:35; docker-compose.production.yml:75 | Partial parse/range checks in selected launchers; no unified server contract |
| ADMIN_API_URL | deploy/linux/deploy-factory-vm.sh:54; docker-compose.production.yml:40 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| ADMIN_DATABASE_URL | docker-compose.production.yml:77 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| ADMIN_JWT_SECRET | docker-compose.production.yml:79 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| API | deploy/linux/deploy-factory-vm.sh:108 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| AUTO_MIGRATE | apps/api/src/main.ts:15 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| BOOTSTRAP_ADMIN_EMAIL | apps/admin-api/test/app.e2e-spec.ts:27; apps/api/src/modules/auth/auth.service.ts:36; apps/api/test/app.e2e-spec.ts:27; .env.example:30 | Partial: checked inside caught bootstrap path, does not fail startup |
| BOOTSTRAP_ADMIN_PASSWORD | apps/admin-api/test/app.e2e-spec.ts:28; apps/api/src/modules/auth/auth.service.ts:35; apps/api/test/app.e2e-spec.ts:28; .env.example:31 | Partial: checked inside caught bootstrap path, does not fail startup |
| BOOTSTRAP_ADMIN_USERNAME | apps/admin-api/test/app.e2e-spec.ts:26; apps/api/src/modules/auth/auth.service.ts:34; apps/api/test/app.e2e-spec.ts:26; .env.example:29 | Partial: checked inside caught bootstrap path, does not fail startup |
| COMPANY_ID | apps/api/src/services/admin-sync.service.ts:11 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| CONFIG_DIR | deploy/linux/deploy-factory-vm.sh:26 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| CYAN | deploy/linux/deploy-factory-vm.sh:12; deploy/linux/deploy-factory-vm.sh:15; deploy/linux/deploy-factory-vm.sh:28; deploy/linux/deploy-factory-vm.sh:108 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| DAILY_SUMMARY_EMAIL | apps/admin-api/test/app.e2e-spec.ts:30; apps/api/src/modules/dashboard/daily-summary.service.ts:38; apps/api/test/app.e2e-spec.ts:30; .env.example:42 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| DATABASE_URL | apps/admin-api/test/app.e2e-spec.ts:24; apps/api/test/app.e2e-spec.ts:24; deploy/linux/deploy-factory-vm.sh:53; .env.example:7; .env.example:9; docker-compose.production.yml:38 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| DATA_DIR | deploy/linux/deploy-factory-vm.sh:25; deploy/linux/deploy-factory-vm.sh:53 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| DB_STUDIO_PORT | scripts/database-studio.js:11 | Partial parse/range checks in selected launchers; no unified server contract |
| ELECTRON_IS_DEV | apps/desktop/main.js:11 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| ENCRYPTION_SECRET | apps/api/src/utils/crypto.ts:9 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| EVERGREEN_API_HOST | apps/admin-api/src/main.ts:446; apps/api/src/main.ts:454; .env.example:20 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| EVERGREEN_API_PORT | apps/api/src/app.service.ts:84; apps/api/src/main.ts:452; apps/web/vite.config.ts:5; scripts/dev-evergreen.js:6; scripts/setup-check.js:27; deploy/docker/Dockerfile.tenant-api:46; deploy/docker/tenant-entrypoint.sh:12; deploy/linux/deploy-factory-vm.sh:51; .env.example:17; docker-compose.production.yml:36 | Partial parse/range checks in selected launchers; no unified server contract |
| EVERGREEN_PUBLIC_PORT | apps/api/src/app.service.ts:85; apps/web/vite.config.ts:4; scripts/dev-evergreen.js:5; scripts/setup-check.js:27; .env.example:18 | Partial parse/range checks in selected launchers; no unified server contract |
| EVERGREEN_SETTLE_GAP_MS | apps/admin-api/src/utils/delete-guard.ts:8; apps/api/src/utils/delete-guard.ts:8 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| FRONTEND_URL | apps/api/src/main.ts:28; .env.example:23 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| GEOLOCATION_URL | apps/api/src/modules/auth/auth.service.ts:182; .env.example:53 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| GREEN | deploy/linux/deploy-factory-vm.sh:11; deploy/linux/deploy-factory-vm.sh:32; deploy/linux/deploy-factory-vm.sh:42; deploy/linux/deploy-factory-vm.sh:60; deploy/linux/deploy-factory-vm.sh:67; deploy/linux/deploy-factory-vm.sh:107 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| HEARTBEAT_INTERVAL_MS | deploy/linux/deploy-factory-vm.sh:55; docker-compose.production.yml:41 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| INSTALL_DIR | deploy/linux/deploy-factory-vm.sh:24 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| JWT_SECRET | apps/admin-api/test/app.e2e-spec.ts:25; apps/api/src/modules/auth/jwt-secret.ts:4; apps/api/test/app.e2e-spec.ts:25; scripts/database-studio.js:13; .env.example:14; docker-compose.production.yml:39; docker-compose.production.yml:79 | Partial: length/pattern validator in tenant JWT setup; known compose fallback passes pattern |
| NC | deploy/linux/deploy-factory-vm.sh:13; deploy/linux/deploy-factory-vm.sh:15; deploy/linux/deploy-factory-vm.sh:19; deploy/linux/deploy-factory-vm.sh:28; deploy/linux/deploy-factory-vm.sh:32; deploy/linux/deploy-factory-vm.sh:42; deploy/linux/deploy-factory-vm.sh:60; deploy/linux/deploy-factory-vm.sh:67; deploy/linux/deploy-factory-vm.sh:107; deploy/linux/deploy-factory-vm.sh:108 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| NODE_ENV | apps/admin-api/src/guards/provider-access.guard.ts:12; apps/admin-api/src/main.ts:66; apps/admin-api/src/main.ts:447; apps/admin-api/src/main.ts:450; apps/admin-api/test/app.e2e-spec.ts:23; apps/api/src/app.service.ts:106; apps/api/src/app.service.ts:423; apps/api/src/main.ts:74; apps/api/src/main.ts:455; apps/api/src/main.ts:458; apps/api/test/app.e2e-spec.ts:23; apps/web/src/components/common/ErrorBoundary.tsx:35; apps/web/src/components/common/ErrorBoundary.tsx:94; packages/database/deleteUsers.js:18; deploy/docker/Dockerfile.admin-api:34; deploy/docker/Dockerfile.tenant-api:45; deploy/linux/deploy-factory-vm.sh:49; .env.example:26; docker-compose.production.yml:35; docker-compose.production.yml:74 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| PORT | apps/api/src/app.service.ts:84; apps/api/src/main.ts:452; deploy/docker/Dockerfile.admin-api:36; deploy/docker/Dockerfile.tenant-api:47; deploy/linux/deploy-factory-vm.sh:52; docker-compose.production.yml:37; docker-compose.production.yml:76 | Partial parse/range checks in selected launchers; no unified server contract |
| POSTGRES_DB | docker-compose.yml:10 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| POSTGRES_PASSWORD | docker-compose.yml:9 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| POSTGRES_USER | docker-compose.yml:8 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| PROVIDER_ADMIN_API_KEY | docker-compose.production.yml:78 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| PROVIDER_API_KEY | apps/api/src/guards/provider-admin.guard.ts:9 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| RED | deploy/linux/deploy-factory-vm.sh:10; deploy/linux/deploy-factory-vm.sh:19 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| REDIS_URL | .env.example:45 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| SMTP_HOST | apps/admin-api/test/app.e2e-spec.ts:29; apps/api/src/app.service.ts:405; apps/api/src/modules/auth/email.service.ts:9; apps/api/src/modules/dashboard/daily-summary.service.ts:17; apps/api/test/app.e2e-spec.ts:29; .env.example:34 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| SMTP_PASSWORD | apps/api/src/modules/auth/email.service.ts:12; apps/api/src/modules/dashboard/daily-summary.service.ts:23; .env.example:38 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| SMTP_PORT | apps/api/src/modules/auth/email.service.ts:15; apps/api/src/modules/dashboard/daily-summary.service.ts:26; .env.example:35 | Partial parse/range checks in selected launchers; no unified server contract |
| SMTP_SECURE | apps/api/src/modules/auth/email.service.ts:16; apps/api/src/modules/dashboard/daily-summary.service.ts:27; .env.example:36 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| SMTP_USER | apps/api/src/modules/auth/email.service.ts:11; apps/api/src/modules/dashboard/daily-summary.service.ts:22; .env.example:37 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| TENANT_JWT_SECRET | docker-compose.production.yml:39 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| TENANT_SLUG | deploy/linux/deploy-factory-vm.sh:23; deploy/linux/deploy-factory-vm.sh:28; deploy/linux/deploy-factory-vm.sh:50 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| TOTP_ISSUER | apps/api/src/modules/auth/auth.service.ts:246 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| VITEST | apps/web/vite.config.ts:6 | No comprehensive boot schema found; source fallback/usage must be reviewed |
| VITE_API_URL | apps/web/src/utils/api.ts:7; .env.example:49 | No comprehensive boot schema found; source fallback/usage must be reviewed |
