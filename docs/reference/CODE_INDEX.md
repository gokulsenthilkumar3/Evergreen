# Code ownership and function index

Generated declarations and methods from active API, web and shared source. Nested callbacks are not separate public contracts. Use this index to locate implementation; acceptance evidence lives in the tests.

| Symbol | Kind | Source |
| --- | --- | --- |
| `observeApi` | FunctionDeclaration | [apps/api/src/api-monitor.ts:6](../../apps/api/src/api-monitor.ts) |
| `serveMonitor` | FunctionDeclaration | [apps/api/src/api-monitor.ts:20](../../apps/api/src/api-monitor.ts) |
| `upgradeApiReference` | FunctionDeclaration | [apps/api/src/api-reference.ts:6](../../apps/api/src/api-reference.ts) |
| `AppController` | ClassDeclaration | [apps/api/src/app.controller.ts:8](../../apps/api/src/app.controller.ts) |
| `licenceStatus` | MethodDeclaration | [apps/api/src/app.controller.ts:13](../../apps/api/src/app.controller.ts) |
| `index` | MethodDeclaration | [apps/api/src/app.controller.ts:25](../../apps/api/src/app.controller.ts) |
| `health` | MethodDeclaration | [apps/api/src/app.controller.ts:32](../../apps/api/src/app.controller.ts) |
| `status` | MethodDeclaration | [apps/api/src/app.controller.ts:39](../../apps/api/src/app.controller.ts) |
| `probe` | MethodDeclaration | [apps/api/src/app.controller.ts:45](../../apps/api/src/app.controller.ts) |
| `AppModule` | ClassDeclaration | [apps/api/src/app.module.ts:39](../../apps/api/src/app.module.ts) |
| `ProcessorInfo` | InterfaceDeclaration | [apps/api/src/app.service.ts:4](../../apps/api/src/app.service.ts) |
| `PublicHealth` | InterfaceDeclaration | [apps/api/src/app.service.ts:16](../../apps/api/src/app.service.ts) |
| `SystemHealthData` | InterfaceDeclaration | [apps/api/src/app.service.ts:23](../../apps/api/src/app.service.ts) |
| `AppService` | ClassDeclaration | [apps/api/src/app.service.ts:63](../../apps/api/src/app.service.ts) |
| `getHello` | MethodDeclaration | [apps/api/src/app.service.ts:69](../../apps/api/src/app.service.ts) |
| `formatUptime` | MethodDeclaration | [apps/api/src/app.service.ts:73](../../apps/api/src/app.service.ts) |
| `getPublicHealth` | MethodDeclaration | [apps/api/src/app.service.ts:90](../../apps/api/src/app.service.ts) |
| `getHealthData` | MethodDeclaration | [apps/api/src/app.service.ts:111](../../apps/api/src/app.service.ts) |
| `Public` | Function binding | [apps/api/src/decorators/public.decorator.ts:4](../../apps/api/src/decorators/public.decorator.ts) |
| `Roles` | Function binding | [apps/api/src/decorators/roles.decorator.ts:4](../../apps/api/src/decorators/roles.decorator.ts) |
| `BusinessActionFilter` | ClassDeclaration | [apps/api/src/filters/business-action.filter.ts:13](../../apps/api/src/filters/business-action.filter.ts) |
| `catch` | MethodDeclaration | [apps/api/src/filters/business-action.filter.ts:21](../../apps/api/src/filters/business-action.filter.ts) |
| `escapeHtml` | FunctionDeclaration | [apps/api/src/filters/not-found-exception.filter.ts:10](../../apps/api/src/filters/not-found-exception.filter.ts) |
| `NotFoundExceptionFilter` | ClassDeclaration | [apps/api/src/filters/not-found-exception.filter.ts:19](../../apps/api/src/filters/not-found-exception.filter.ts) |
| `catch` | MethodDeclaration | [apps/api/src/filters/not-found-exception.filter.ts:21](../../apps/api/src/filters/not-found-exception.filter.ts) |
| `InstallationLicenseGuard` | ClassDeclaration | [apps/api/src/guards/installation-license.guard.ts:11](../../apps/api/src/guards/installation-license.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/installation-license.guard.ts:13](../../apps/api/src/guards/installation-license.guard.ts) |
| `JwtAuthGuard` | ClassDeclaration | [apps/api/src/guards/jwt-auth.guard.ts:10](../../apps/api/src/guards/jwt-auth.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/jwt-auth.guard.ts:16](../../apps/api/src/guards/jwt-auth.guard.ts) |
| `handleRequest` | MethodDeclaration | [apps/api/src/guards/jwt-auth.guard.ts:28](../../apps/api/src/guards/jwt-auth.guard.ts) |
| `LegacyBillingReadOnlyGuard` | ClassDeclaration | [apps/api/src/guards/legacy-billing-read-only.guard.ts:8](../../apps/api/src/guards/legacy-billing-read-only.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/legacy-billing-read-only.guard.ts:10](../../apps/api/src/guards/legacy-billing-read-only.guard.ts) |
| `ProviderAdminGuard` | ClassDeclaration | [apps/api/src/guards/provider-admin.guard.ts:8](../../apps/api/src/guards/provider-admin.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/provider-admin.guard.ts:10](../../apps/api/src/guards/provider-admin.guard.ts) |
| `SlidingWindowLimit` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:12](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `check` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:15](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `clientIp` | Function binding | [apps/api/src/guards/public-order-rate-limit.guard.ts:35](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `HelpdeskRateLimitGuard` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:45](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:47](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `PublicOrderRateLimitGuard` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:53](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:57](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `PublicAuthRateLimitGuard` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:66](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:68](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `RolesGuard` | ClassDeclaration | [apps/api/src/guards/roles.guard.ts:13](../../apps/api/src/guards/roles.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/roles.guard.ts:17](../../apps/api/src/guards/roles.guard.ts) |
| `bootstrap` | FunctionDeclaration | [apps/api/src/main.ts:21](../../apps/api/src/main.ts) |
| `AdminOpsController` | ClassDeclaration | [apps/api/src/modules/admin-ops/admin-ops.controller.ts:9](../../apps/api/src/modules/admin-ops/admin-ops.controller.ts) |
| `runMigration` | MethodDeclaration | [apps/api/src/modules/admin-ops/admin-ops.controller.ts:11](../../apps/api/src/modules/admin-ops/admin-ops.controller.ts) |
| `AdminOpsModule` | ClassDeclaration | [apps/api/src/modules/admin-ops/admin-ops.module.ts:4](../../apps/api/src/modules/admin-ops/admin-ops.module.ts) |
| `AssistantsController` | ClassDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:21](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `staffStatus` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:25](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `staff` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:33](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `customerStatus` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:72](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `customer` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:78](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `marketingStatus` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:88](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `marketing` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:94](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `chat` | MethodDeclaration | [apps/api/src/modules/assistants/assistants.controller.ts:104](../../apps/api/src/modules/assistants/assistants.controller.ts) |
| `AccountFlowsController` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:8](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `senders` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:12](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `verifySender` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:13](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `invite` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:14](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `invitations` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:15](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `revoke` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:16](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `reset` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:17](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `onboarding` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:18](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `redeem` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:19](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `email` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:20](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `codes` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.controller.ts:21](../../apps/api/src/modules/auth/account-flows.controller.ts) |
| `SendRecoveryDto` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.dto.ts:2](../../apps/api/src/modules/auth/account-flows.dto.ts) |
| `RedeemAccountDto` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.dto.ts:3](../../apps/api/src/modules/auth/account-flows.dto.ts) |
| `InviteAccountDto` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.dto.ts:9](../../apps/api/src/modules/auth/account-flows.dto.ts) |
| `EmailChangeDto` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.dto.ts:16](../../apps/api/src/modules/auth/account-flows.dto.ts) |
| `GenerateRecoveryCodesDto` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.dto.ts:17](../../apps/api/src/modules/auth/account-flows.dto.ts) |
| `digest` | Function binding | [apps/api/src/modules/auth/account-flows.service.ts:12](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `AccountFlowsService` | ClassDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:13](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `origin` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:16](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `senders` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:23](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `verifySender` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:24](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `deliver` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:25](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `invite` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:47](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `requestReset` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:65](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `readToken` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:74](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `startOnboarding` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:79](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `redeem` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:88](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `requestEmailChange` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:118](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `recoveryCodes` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:125](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `invitations` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:137](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `revokeInvitation` | MethodDeclaration | [apps/api/src/modules/auth/account-flows.service.ts:141](../../apps/api/src/modules/auth/account-flows.service.ts) |
| `AuthController` | ClassDeclaration | [apps/api/src/modules/auth/auth.controller.ts:32](../../apps/api/src/modules/auth/auth.controller.ts) |
| `signup` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:41](../../apps/api/src/modules/auth/auth.controller.ts) |
| `login` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:49](../../apps/api/src/modules/auth/auth.controller.ts) |
| `logout` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:76](../../apps/api/src/modules/auth/auth.controller.ts) |
| `me` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:89](../../apps/api/src/modules/auth/auth.controller.ts) |
| `generateTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:125](../../apps/api/src/modules/auth/auth.controller.ts) |
| `verifyTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:135](../../apps/api/src/modules/auth/auth.controller.ts) |
| `disableTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:141](../../apps/api/src/modules/auth/auth.controller.ts) |
| `updateProfile` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:148](../../apps/api/src/modules/auth/auth.controller.ts) |
| `changePassword` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:158](../../apps/api/src/modules/auth/auth.controller.ts) |
| `listPasskeys` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:171](../../apps/api/src/modules/auth/auth.controller.ts) |
| `removePasskey` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:177](../../apps/api/src/modules/auth/auth.controller.ts) |
| `generatePasskeyRegistrationOptions` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:189](../../apps/api/src/modules/auth/auth.controller.ts) |
| `verifyPasskeyRegistration` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:199](../../apps/api/src/modules/auth/auth.controller.ts) |
| `generatePasskeyAuthenticationOptions` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:205](../../apps/api/src/modules/auth/auth.controller.ts) |
| `verifyPasskeyAuthentication` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:214](../../apps/api/src/modules/auth/auth.controller.ts) |
| `LoginDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:11](../../apps/api/src/modules/auth/auth.dto.ts) |
| `TotpCodeDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:32](../../apps/api/src/modules/auth/auth.dto.ts) |
| `UpdateProfileDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:38](../../apps/api/src/modules/auth/auth.dto.ts) |
| `ChangePasswordDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:49](../../apps/api/src/modules/auth/auth.dto.ts) |
| `AuthModule` | ClassDeclaration | [apps/api/src/modules/auth/auth.module.ts:16](../../apps/api/src/modules/auth/auth.module.ts) |
| `AuthService` | ClassDeclaration | [apps/api/src/modules/auth/auth.service.ts:23](../../apps/api/src/modules/auth/auth.service.ts) |
| `onModuleInit` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:33](../../apps/api/src/modules/auth/auth.service.ts) |
| `signup` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:51](../../apps/api/src/modules/auth/auth.service.ts) |
| `validateUser` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:53](../../apps/api/src/modules/auth/auth.service.ts) |
| `recordFailedLogin` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:81](../../apps/api/src/modules/auth/auth.service.ts) |
| `login` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:89](../../apps/api/src/modules/auth/auth.service.ts) |
| `assertOwnerProof` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:208](../../apps/api/src/modules/auth/auth.service.ts) |
| `generateTotpSecret` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:216](../../apps/api/src/modules/auth/auth.service.ts) |
| `verifyAndEnableTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:228](../../apps/api/src/modules/auth/auth.service.ts) |
| `disableTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:241](../../apps/api/src/modules/auth/auth.service.ts) |
| `updateProfile` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:254](../../apps/api/src/modules/auth/auth.service.ts) |
| `changePassword` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:269](../../apps/api/src/modules/auth/auth.service.ts) |
| `EmailService` | ClassDeclaration | [apps/api/src/modules/auth/email.service.ts:4](../../apps/api/src/modules/auth/email.service.ts) |
| `readiness` | MethodDeclaration | [apps/api/src/modules/auth/email.service.ts:31](../../apps/api/src/modules/auth/email.service.ts) |
| `verifyAccount` | MethodDeclaration | [apps/api/src/modules/auth/email.service.ts:35](../../apps/api/src/modules/auth/email.service.ts) |
| `sendAccountMessage` | MethodDeclaration | [apps/api/src/modules/auth/email.service.ts:42](../../apps/api/src/modules/auth/email.service.ts) |
| `sendLoginNotification` | MethodDeclaration | [apps/api/src/modules/auth/email.service.ts:51](../../apps/api/src/modules/auth/email.service.ts) |
| `requireJwtSecret` | FunctionDeclaration | [apps/api/src/modules/auth/jwt-secret.ts:3](../../apps/api/src/modules/auth/jwt-secret.ts) |
| `JwtStrategy` | ClassDeclaration | [apps/api/src/modules/auth/jwt.strategy.ts:9](../../apps/api/src/modules/auth/jwt.strategy.ts) |
| `validate` | MethodDeclaration | [apps/api/src/modules/auth/jwt.strategy.ts:22](../../apps/api/src/modules/auth/jwt.strategy.ts) |
| `FinishOidcDto` | ClassDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:10](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `cookie` | Function binding | [apps/api/src/modules/auth/oidc.controller.ts:15](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `OidcController` | ClassDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:19](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `status` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:23](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `start` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:24](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `link` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:31](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `callback` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:37](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `complete` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:43](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `identities` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:49](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `unlink` | MethodDeclaration | [apps/api/src/modules/auth/oidc.controller.ts:50](../../apps/api/src/modules/auth/oidc.controller.ts) |
| `hash` | Function binding | [apps/api/src/modules/auth/oidc.service.ts:9](../../apps/api/src/modules/auth/oidc.service.ts) |
| `Pending` | InterfaceDeclaration | [apps/api/src/modules/auth/oidc.service.ts:10](../../apps/api/src/modules/auth/oidc.service.ts) |
| `Ticket` | InterfaceDeclaration | [apps/api/src/modules/auth/oidc.service.ts:11](../../apps/api/src/modules/auth/oidc.service.ts) |
| `OidcService` | ClassDeclaration | [apps/api/src/modules/auth/oidc.service.ts:12](../../apps/api/src/modules/auth/oidc.service.ts) |
| `status` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:17](../../apps/api/src/modules/auth/oidc.service.ts) |
| `urls` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:18](../../apps/api/src/modules/auth/oidc.service.ts) |
| `provider` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:25](../../apps/api/src/modules/auth/oidc.service.ts) |
| `prune` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:33](../../apps/api/src/modules/auth/oidc.service.ts) |
| `start` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:38](../../apps/api/src/modules/auth/oidc.service.ts) |
| `callback` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:55](../../apps/api/src/modules/auth/oidc.service.ts) |
| `complete` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:86](../../apps/api/src/modules/auth/oidc.service.ts) |
| `identities` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:98](../../apps/api/src/modules/auth/oidc.service.ts) |
| `unlink` | MethodDeclaration | [apps/api/src/modules/auth/oidc.service.ts:99](../../apps/api/src/modules/auth/oidc.service.ts) |
| `validatePassword` | FunctionDeclaration | [apps/api/src/modules/auth/passwords.ts:6](../../apps/api/src/modules/auth/passwords.ts) |
| `hashPassword` | FunctionDeclaration | [apps/api/src/modules/auth/passwords.ts:9](../../apps/api/src/modules/auth/passwords.ts) |
| `verifyPassword` | FunctionDeclaration | [apps/api/src/modules/auth/passwords.ts:13](../../apps/api/src/modules/auth/passwords.ts) |
| `WebAuthnService` | ClassDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:13](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `readChallenge` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:17](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `saveChallenge` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:22](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `getRegistrationOptions` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:39](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `verifyRegistration` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:69](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `getAuthenticationOptions` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:122](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `verifyAuthentication` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:145](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `BillingController` | ClassDeclaration | [apps/api/src/modules/billing/billing.controller.ts:14](../../apps/api/src/modules/billing/billing.controller.ts) |
| `createInvoice` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:19](../../apps/api/src/modules/billing/billing.controller.ts) |
| `getInvoices` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:94](../../apps/api/src/modules/billing/billing.controller.ts) |
| `getInvoice` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:102](../../apps/api/src/modules/billing/billing.controller.ts) |
| `deleteInvoice` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:116](../../apps/api/src/modules/billing/billing.controller.ts) |
| `addPayment` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:178](../../apps/api/src/modules/billing/billing.controller.ts) |
| `getPaymentHistory` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:241](../../apps/api/src/modules/billing/billing.controller.ts) |
| `deletePayment` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:252](../../apps/api/src/modules/billing/billing.controller.ts) |
| `BillingModule` | ClassDeclaration | [apps/api/src/modules/billing/billing.module.ts:4](../../apps/api/src/modules/billing/billing.module.ts) |
| `CommerceController` | ClassDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:19](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `listItems` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:26](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `createItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:29](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:32](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `archiveItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:38](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `movements` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:41](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `brands` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:44](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `brand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:47](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:50](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `archiveBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:56](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `categories` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:59](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `category` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:62](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:65](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `archiveCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:71](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `adjust` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:76](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `customers` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:86](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `customer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:89](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateCustomer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:92](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `ledger` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:98](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `whatsappStatement` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:101](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `orders` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:106](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `order` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:109](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `cancelOrder` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:112](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `inward` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:118](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `inwardList` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:124](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `costingSheets` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:127](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `costingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:130](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateCostingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:133](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `invoices` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:139](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `invoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:142](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `payment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:148](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `reversePayment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:158](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `voidInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:171](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `report` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:181](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `unInvoicedChallans` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:184](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `CommerceModule` | ClassDeclaration | [apps/api/src/modules/commerce/commerce.module.ts:9](../../apps/api/src/modules/commerce/commerce.module.ts) |
| `catalogueNumber` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:19](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `catalogueText` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:32](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `catalogueType` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:41](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `optionalReference` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:49](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `assertCatalogueGstRate` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:58](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `optionalText` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:75](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `partyContact` | FunctionDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:88](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `CommerceService` | ClassDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:115](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `stockSummary` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:119](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listItems` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:145](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:158](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:202](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `archiveItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:265](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `itemMovements` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:271](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listBrands` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:278](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:281](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:286](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `archiveBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:294](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listCategories` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:297](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:300](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:307](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `archiveCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:315](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `adjustStock` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:322](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listCustomers` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:350](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createCustomer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:369](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateCustomer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:390](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `customerLedger` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:419](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createOrder` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:427](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listOrders` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:540](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `cancelOrder` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:551](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createInwardReceipt` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:606](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listInwardReceipts` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:662](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createCostingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:669](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listCostingSheets` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:690](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateCostingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:695](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:716](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listInvoices` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1190](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `recordInvoicePayment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1204](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `reverseInvoicePayment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1301](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `voidInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1372](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `verifyInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1491](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `report` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1509](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `getUninvoicedChallans` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:1543](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `invoiceFinancialYear` | FunctionDeclaration | [apps/api/src/modules/commerce/document-number.ts:5](../../apps/api/src/modules/commerce/document-number.ts) |
| `invoiceSeries` | FunctionDeclaration | [apps/api/src/modules/commerce/document-number.ts:10](../../apps/api/src/modules/commerce/document-number.ts) |
| `nextInvoiceNumber` | FunctionDeclaration | [apps/api/src/modules/commerce/document-number.ts:16](../../apps/api/src/modules/commerce/document-number.ts) |
| `calculateInvoiceTotals` | FunctionDeclaration | [apps/api/src/modules/commerce/invoice-totals.ts:11](../../apps/api/src/modules/commerce/invoice-totals.ts) |
| `InvoiceVerificationController` | ClassDeclaration | [apps/api/src/modules/commerce/invoice-verification.controller.ts:5](../../apps/api/src/modules/commerce/invoice-verification.controller.ts) |
| `verify` | MethodDeclaration | [apps/api/src/modules/commerce/invoice-verification.controller.ts:8](../../apps/api/src/modules/commerce/invoice-verification.controller.ts) |
| `StorefrontController` | ClassDeclaration | [apps/api/src/modules/commerce/storefront.controller.ts:6](../../apps/api/src/modules/commerce/storefront.controller.ts) |
| `products` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.controller.ts:9](../../apps/api/src/modules/commerce/storefront.controller.ts) |
| `order` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.controller.ts:14](../../apps/api/src/modules/commerce/storefront.controller.ts) |
| `roundMoney` | Function binding | [apps/api/src/modules/commerce/storefront.service.ts:13](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `clean` | Function binding | [apps/api/src/modules/commerce/storefront.service.ts:15](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `StorefrontService` | ClassDeclaration | [apps/api/src/modules/commerce/storefront.service.ts:18](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `products` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.service.ts:22](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `placeOrder` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.service.ts:69](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `WhatsAppStatementResult` | InterfaceDeclaration | [apps/api/src/modules/commerce/whatsapp-collections.service.ts:4](../../apps/api/src/modules/commerce/whatsapp-collections.service.ts) |
| `WhatsAppCollectionsService` | ClassDeclaration | [apps/api/src/modules/commerce/whatsapp-collections.service.ts:15](../../apps/api/src/modules/commerce/whatsapp-collections.service.ts) |
| `generateStatement` | MethodDeclaration | [apps/api/src/modules/commerce/whatsapp-collections.service.ts:22](../../apps/api/src/modules/commerce/whatsapp-collections.service.ts) |
| `CostingController` | ClassDeclaration | [apps/api/src/modules/costing/costing.controller.ts:31](../../apps/api/src/modules/costing/costing.controller.ts) |
| `getCostingHistory` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:35](../../apps/api/src/modules/costing/costing.controller.ts) |
| `getCostEntries` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:113](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createEBCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:118](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createEmployeeCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:130](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createPackagingCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:142](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createMaintenanceCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:154](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createExpense` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:166](../../apps/api/src/modules/costing/costing.controller.ts) |
| `deleteEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:181](../../apps/api/src/modules/costing/costing.controller.ts) |
| `updateEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:188](../../apps/api/src/modules/costing/costing.controller.ts) |
| `CreateEbCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:20](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreateEmployeeCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:38](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreatePackagingCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:61](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreateMaintenanceCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:74](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreateExpenseDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:92](../../apps/api/src/modules/costing/costing.dto.ts) |
| `UpdateCostingEntryDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:114](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CostingModule` | ClassDeclaration | [apps/api/src/modules/costing/costing.module.ts:5](../../apps/api/src/modules/costing/costing.module.ts) |
| `costNumber` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:29](../../apps/api/src/modules/costing/costing.service.ts) |
| `costDate` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:53](../../apps/api/src/modules/costing/costing.service.ts) |
| `costText` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:61](../../apps/api/src/modules/costing/costing.service.ts) |
| `costFields` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:70](../../apps/api/src/modules/costing/costing.service.ts) |
| `costDetails` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:85](../../apps/api/src/modules/costing/costing.service.ts) |
| `computedTotal` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:101](../../apps/api/src/modules/costing/costing.service.ts) |
| `definedOnly` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:134](../../apps/api/src/modules/costing/costing.service.ts) |
| `CostingService` | ClassDeclaration | [apps/api/src/modules/costing/costing.service.ts:140](../../apps/api/src/modules/costing/costing.service.ts) |
| `addEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:144](../../apps/api/src/modules/costing/costing.service.ts) |
| `getCostEntries` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:188](../../apps/api/src/modules/costing/costing.service.ts) |
| `deleteEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:203](../../apps/api/src/modules/costing/costing.service.ts) |
| `updateEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:225](../../apps/api/src/modules/costing/costing.service.ts) |
| `existsOn` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:282](../../apps/api/src/modules/costing/costing.service.ts) |
| `getTotalCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:298](../../apps/api/src/modules/costing/costing.service.ts) |
| `getCostSummary` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:318](../../apps/api/src/modules/costing/costing.service.ts) |
| `getHistoryByCategory` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:351](../../apps/api/src/modules/costing/costing.service.ts) |
| `getDailyCostSummary` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:388](../../apps/api/src/modules/costing/costing.service.ts) |
| `summarizeProduction` | FunctionDeclaration | [apps/api/src/modules/dashboard/daily-summary.service.ts:14](../../apps/api/src/modules/dashboard/daily-summary.service.ts) |
| `DailySummaryService` | ClassDeclaration | [apps/api/src/modules/dashboard/daily-summary.service.ts:45](../../apps/api/src/modules/dashboard/daily-summary.service.ts) |
| `sendDailySummary` | MethodDeclaration | [apps/api/src/modules/dashboard/daily-summary.service.ts:67](../../apps/api/src/modules/dashboard/daily-summary.service.ts) |
| `DashboardController` | ClassDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:6](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `getSummary` | MethodDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:14](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `getCharts` | MethodDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:95](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `getRecentActivity` | MethodDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:216](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `DashboardModule` | ClassDeclaration | [apps/api/src/modules/dashboard/dashboard.module.ts:7](../../apps/api/src/modules/dashboard/dashboard.module.ts) |
| `DatabaseModule` | ClassDeclaration | [apps/api/src/modules/database/database.module.ts:4](../../apps/api/src/modules/database/database.module.ts) |
| `supportText` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-content.ts:2](../../apps/api/src/modules/helpdesk/helpdesk-content.ts) |
| `redactSupportPii` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-content.ts:18](../../apps/api/src/modules/helpdesk/helpdesk-content.ts) |
| `canonicalSupportPayload` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-ingress-auth.ts:14](../../apps/api/src/modules/helpdesk/helpdesk-ingress-auth.ts) |
| `verifySupportIngress` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-ingress-auth.ts:34](../../apps/api/src/modules/helpdesk/helpdesk-ingress-auth.ts) |
| `SupportIngressDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-ingress.ts:14](../../apps/api/src/modules/helpdesk/helpdesk-ingress.ts) |
| `HelpdeskIngressController` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-ingress.ts:25](../../apps/api/src/modules/helpdesk/helpdesk-ingress.ts) |
| `ingest` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-ingress.ts:28](../../apps/api/src/modules/helpdesk/helpdesk-ingress.ts) |
| `HelpdeskOperationsController` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:34](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `aiPreview` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:37](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `ai` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:38](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `capabilities` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:39](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `presence` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:44](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `presenceBeat` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:50](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `links` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:56](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `revise` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:64](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `work` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:72](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `readAll` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:79](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `emailPreview` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:82](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `dispatch` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:88](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `page` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:98](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `resources` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:104](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `save` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:111](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `revisions` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:117](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `articleFeedback` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:123](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `queues` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:130](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `reporting` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:133](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `metadata` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:138](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `bulk` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:145](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `merge` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:151](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `split` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:158](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `csat` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:165](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `acknowledge` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:172](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `upload` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:179](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `download` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:186](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `read` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:202](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `export` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:208](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `import` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:220](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `retention` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts:226](../../apps/api/src/modules/helpdesk/helpdesk-operations.controller.ts) |
| `TicketPageDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:34](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `SaveSupportResourceDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:56](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketMetadataDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:66](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `BulkTicketItem` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:81](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `BulkTicketDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:84](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `MergeTicketDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:97](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `SplitTicketDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:102](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `ArticleFeedbackDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:108](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketAttachmentDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:111](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketAcknowledgementDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:117](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketReplyRevisionDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:120](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketWorkDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:124](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketAiDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:133](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `DispatchTicketEmailDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:139](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `TicketCsatDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:145](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `ImportTicketRow` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:149](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `ImportTicketsDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts:157](../../apps/api/src/modules/helpdesk/helpdesk-operations.dto.ts) |
| `resourceData` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:42](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `hash` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:46](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `emailEnvelope` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:48](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `HelpdeskOperationsService` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:49](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `scheduledAutomation` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:53](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `runAutomations` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:54](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `aiPreview` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:72](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `aiAssist` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:73](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `presence` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:84](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `capabilities` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:114](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `ingest` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:155](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `replay` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:163](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `linkCandidates` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:277](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `emailPreview` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:322](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `reviseReply` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:331](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `work` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:367](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `dispatchEmail` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:446](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `page` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:586](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `resourceList` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:644](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `saveResource` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:718](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `revisions` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:833](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `queues` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:844](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `metadata` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:879](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `bulk` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:945](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `merge` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1041](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `split` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1077](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `csat` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1119](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `articleFeedback` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1142](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `notificationsRead` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1179](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `notificationsReadAll` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1202](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `exportTicket` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1225](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `acknowledge` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1236](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `upload` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1281](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `download` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1350](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `importTickets` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1393](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `reporting` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1482](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `counts` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1491](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `durations` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1513](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `summary` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1524](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `retentionPreview` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk-operations.service.ts:1580](../../apps/api/src/modules/helpdesk/helpdesk-operations.service.ts) |
| `TicketEventHashInput` | InterfaceDeclaration | [apps/api/src/modules/helpdesk/helpdesk-proof.ts:3](../../apps/api/src/modules/helpdesk/helpdesk-proof.ts) |
| `ticketEventHash` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-proof.ts:17](../../apps/api/src/modules/helpdesk/helpdesk-proof.ts) |
| `checkTicketChain` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-proof.ts:39](../../apps/api/src/modules/helpdesk/helpdesk-proof.ts) |
| `deriveHelpdeskProof` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-proof.ts:63](../../apps/api/src/modules/helpdesk/helpdesk-proof.ts) |
| `reject` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:2](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `text` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:5](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `integer` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:9](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `list` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:16](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `validateSupportResource` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:20](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `SupportCalendar` | InterfaceDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:142](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `parts` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:149](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `get` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:160](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `wallTime` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:171](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `businessMilliseconds` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:197](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `supportSla` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:244](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `renderSupportMacro` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:325](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `supportEmailText` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-resources.ts:339](../../apps/api/src/modules/helpdesk/helpdesk-resources.ts) |
| `scanSupportAttachment` | FunctionDeclaration | [apps/api/src/modules/helpdesk/helpdesk-scanner.ts:4](../../apps/api/src/modules/helpdesk/helpdesk-scanner.ts) |
| `finish` | Function binding | [apps/api/src/modules/helpdesk/helpdesk-scanner.ts:17](../../apps/api/src/modules/helpdesk/helpdesk-scanner.ts) |
| `HelpdeskController` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:25](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `list` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:31](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `create` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:34](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `agents` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:40](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `detail` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:43](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `update` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:49](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `message` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:56](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `assign` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:63](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `feedback` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.controller.ts:70](../../apps/api/src/modules/helpdesk/helpdesk.controller.ts) |
| `CreateTicketDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.dto.ts:20](../../apps/api/src/modules/helpdesk/helpdesk.dto.ts) |
| `TicketVersionDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.dto.ts:29](../../apps/api/src/modules/helpdesk/helpdesk.dto.ts) |
| `UpdateTicketDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.dto.ts:32](../../apps/api/src/modules/helpdesk/helpdesk.dto.ts) |
| `TicketMessageDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.dto.ts:36](../../apps/api/src/modules/helpdesk/helpdesk.dto.ts) |
| `AssignTicketDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.dto.ts:42](../../apps/api/src/modules/helpdesk/helpdesk.dto.ts) |
| `TicketFeedbackDto` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.dto.ts:48](../../apps/api/src/modules/helpdesk/helpdesk.dto.ts) |
| `snapshot` | Function binding | [apps/api/src/modules/helpdesk/helpdesk.service.ts:34](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `HelpdeskService` | ClassDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:82](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `scope` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:85](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `visible` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:97](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `principal` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:108](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `requireAdmin` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:144](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `event` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:150](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `integrity` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:261](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `list` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:301](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `detail` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:309](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `publicPayload` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:347](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `intakeConfiguration` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:355](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `create` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:456](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `replay` | Function binding | [apps/api/src/modules/helpdesk/helpdesk.service.ts:469](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `change` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:532](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `update` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:550](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `message` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:612](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `replay` | Function binding | [apps/api/src/modules/helpdesk/helpdesk.service.ts:618](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `agents` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:675](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `assign` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:683](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `feedback` | MethodDeclaration | [apps/api/src/modules/helpdesk/helpdesk.service.ts:743](../../apps/api/src/modules/helpdesk/helpdesk.service.ts) |
| `HrController` | ClassDeclaration | [apps/api/src/modules/hr/hr.controller.ts:11](../../apps/api/src/modules/hr/hr.controller.ts) |
| `listStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:15](../../apps/api/src/modules/hr/hr.controller.ts) |
| `createStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:20](../../apps/api/src/modules/hr/hr.controller.ts) |
| `listShifts` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:26](../../apps/api/src/modules/hr/hr.controller.ts) |
| `createShift` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:31](../../apps/api/src/modules/hr/hr.controller.ts) |
| `listPayroll` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:37](../../apps/api/src/modules/hr/hr.controller.ts) |
| `createPayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:42](../../apps/api/src/modules/hr/hr.controller.ts) |
| `updatePayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:48](../../apps/api/src/modules/hr/hr.controller.ts) |
| `deletePayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:56](../../apps/api/src/modules/hr/hr.controller.ts) |
| `CreateStaffDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:14](../../apps/api/src/modules/hr/hr.dto.ts) |
| `CreateShiftDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:47](../../apps/api/src/modules/hr/hr.dto.ts) |
| `CreatePayrollEntryDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:61](../../apps/api/src/modules/hr/hr.dto.ts) |
| `UpdatePayrollEntryDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:94](../../apps/api/src/modules/hr/hr.dto.ts) |
| `HrModule` | ClassDeclaration | [apps/api/src/modules/hr/hr.module.ts:5](../../apps/api/src/modules/hr/hr.module.ts) |
| `HrService` | ClassDeclaration | [apps/api/src/modules/hr/hr.service.ts:6](../../apps/api/src/modules/hr/hr.service.ts) |
| `listStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:11](../../apps/api/src/modules/hr/hr.service.ts) |
| `createStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:17](../../apps/api/src/modules/hr/hr.service.ts) |
| `listShifts` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:32](../../apps/api/src/modules/hr/hr.service.ts) |
| `createShift` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:36](../../apps/api/src/modules/hr/hr.service.ts) |
| `listPayroll` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:41](../../apps/api/src/modules/hr/hr.service.ts) |
| `createPayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:52](../../apps/api/src/modules/hr/hr.service.ts) |
| `updatePayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:81](../../apps/api/src/modules/hr/hr.service.ts) |
| `deletePayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:109](../../apps/api/src/modules/hr/hr.service.ts) |
| `ConnectorReadinessService` | ClassDeclaration | [apps/api/src/modules/integrations/connector-readiness.service.ts:9](../../apps/api/src/modules/integrations/connector-readiness.service.ts) |
| `status` | MethodDeclaration | [apps/api/src/modules/integrations/connector-readiness.service.ts:12](../../apps/api/src/modules/integrations/connector-readiness.service.ts) |
| `tallyConnection` | MethodDeclaration | [apps/api/src/modules/integrations/connector-readiness.service.ts:21](../../apps/api/src/modules/integrations/connector-readiness.service.ts) |
| `finish` | Function binding | [apps/api/src/modules/integrations/connector-readiness.service.ts:27](../../apps/api/src/modules/integrations/connector-readiness.service.ts) |
| `ewayReadiness` | MethodDeclaration | [apps/api/src/modules/integrations/connector-readiness.service.ts:78](../../apps/api/src/modules/integrations/connector-readiness.service.ts) |
| `IntegrationsController` | ClassDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:9](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `preview` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:16](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `commit` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:19](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `status` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:25](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `connection` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:28](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `readiness` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:31](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `history` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:36](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `IntegrationsModule` | ClassDeclaration | [apps/api/src/modules/integrations/integrations.module.ts:7](../../apps/api/src/modules/integrations/integrations.module.ts) |
| `IntegrationsService` | ClassDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:10](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `preview` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:14](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `previewWithConflicts` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:24](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `commit` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:65](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `replay` | Function binding | [apps/api/src/modules/integrations/integrations.service.ts:95](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `history` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:196](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `TallyExportController` | ClassDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:12](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `parseTypes` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:17](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `exportXml` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:34](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `getSummary` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:61](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `TallyModule` | ClassDeclaration | [apps/api/src/modules/integrations/tally/tally.module.ts:6](../../apps/api/src/modules/integrations/tally/tally.module.ts) |
| `percent` | Function binding | [apps/api/src/modules/integrations/tally/tally.service.ts:8](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `paise` | Function binding | [apps/api/src/modules/integrations/tally/tally.service.ts:9](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `outputTaxLedgers` | FunctionDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:16](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `split` | Function binding | [apps/api/src/modules/integrations/tally/tally.service.ts:49](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `TallyExportFilter` | InterfaceDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:85](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `TallyExportResult` | InterfaceDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:92](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `TallyExportService` | ClassDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:107](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `formatTallyDate` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:114](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `escapeXml` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:125](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `generateTallyXml` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:138](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `InventoryController` | ClassDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:20](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getInventoryHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:24](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `createInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:119](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `syncWeighbridgeReading` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:127](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `mergeBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:135](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `createOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:146](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getOutwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:154](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getInwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:162](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getAvailableBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:170](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getCottonInventory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:175](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getStockByCount` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:185](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getYarnInventory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:196](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `deleteInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:211](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `deleteOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:226](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `recycleWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:241](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `exportWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:246](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `deleteWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:251](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `InventoryModule` | ClassDeclaration | [apps/api/src/modules/inventory/inventory.module.ts:5](../../apps/api/src/modules/inventory/inventory.module.ts) |
| `InventoryService` | ClassDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:21](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getInwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:25](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getAvailableBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:81](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getOutwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:157](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `createOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:177](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `createInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:311](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `mergeBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:420](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:561](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getDashboardMetrics` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:623](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getWasteHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:708](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `deleteInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:727](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `deleteOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:885](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getYarnStockByCount` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:994](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `recycleWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:1045](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `exportWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:1124](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `deleteWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:1178](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `syncWeighbridgeSlip` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:1333](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `number` | Function binding | [apps/api/src/modules/inventory/inventory.service.ts:1340](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `JobWorkController` | ClassDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:12](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `workers` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:15](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `worker` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:18](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `list` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:21](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `summary` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:24](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `dispatch` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:27](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `receive` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:30](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `cancel` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:37](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `JobWorkModule` | ClassDeclaration | [apps/api/src/modules/jobwork/jobwork.module.ts:5](../../apps/api/src/modules/jobwork/jobwork.module.ts) |
| `JobWorkService` | ClassDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:6](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `available` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:10](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `listWorkers` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:22](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `createWorker` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:29](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `listChallans` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:42](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `dispatch` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:53](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `receive` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:112](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `cancel` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:205](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `summary` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:249](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `scrapNote` | FunctionDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:272](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `LogsController` | ClassDeclaration | [apps/api/src/modules/logs/logs.controller.ts:5](../../apps/api/src/modules/logs/logs.controller.ts) |
| `getLogs` | MethodDeclaration | [apps/api/src/modules/logs/logs.controller.ts:10](../../apps/api/src/modules/logs/logs.controller.ts) |
| `LogsModule` | ClassDeclaration | [apps/api/src/modules/logs/logs.module.ts:4](../../apps/api/src/modules/logs/logs.module.ts) |
| `MachineController` | ClassDeclaration | [apps/api/src/modules/machines/machine.controller.ts:18](../../apps/api/src/modules/machines/machine.controller.ts) |
| `listMachines` | MethodDeclaration | [apps/api/src/modules/machines/machine.controller.ts:22](../../apps/api/src/modules/machines/machine.controller.ts) |
| `createMachine` | MethodDeclaration | [apps/api/src/modules/machines/machine.controller.ts:27](../../apps/api/src/modules/machines/machine.controller.ts) |
| `listInspections` | MethodDeclaration | [apps/api/src/modules/machines/machine.controller.ts:33](../../apps/api/src/modules/machines/machine.controller.ts) |
| `createInspection` | MethodDeclaration | [apps/api/src/modules/machines/machine.controller.ts:41](../../apps/api/src/modules/machines/machine.controller.ts) |
| `listMachineInspections` | MethodDeclaration | [apps/api/src/modules/machines/machine.controller.ts:47](../../apps/api/src/modules/machines/machine.controller.ts) |
| `createMachineInspection` | MethodDeclaration | [apps/api/src/modules/machines/machine.controller.ts:52](../../apps/api/src/modules/machines/machine.controller.ts) |
| `CreateMachineDto` | ClassDeclaration | [apps/api/src/modules/machines/machine.dto.ts:12](../../apps/api/src/modules/machines/machine.dto.ts) |
| `CreateMachineInspectionDto` | ClassDeclaration | [apps/api/src/modules/machines/machine.dto.ts:36](../../apps/api/src/modules/machines/machine.dto.ts) |
| `MachineInspectionAtPathDto` | ClassDeclaration | [apps/api/src/modules/machines/machine.dto.ts:62](../../apps/api/src/modules/machines/machine.dto.ts) |
| `MachineModule` | ClassDeclaration | [apps/api/src/modules/machines/machine.module.ts:5](../../apps/api/src/modules/machines/machine.module.ts) |
| `MachineService` | ClassDeclaration | [apps/api/src/modules/machines/machine.service.ts:4](../../apps/api/src/modules/machines/machine.service.ts) |
| `listMachines` | MethodDeclaration | [apps/api/src/modules/machines/machine.service.ts:8](../../apps/api/src/modules/machines/machine.service.ts) |
| `createMachine` | MethodDeclaration | [apps/api/src/modules/machines/machine.service.ts:15](../../apps/api/src/modules/machines/machine.service.ts) |
| `listInspections` | MethodDeclaration | [apps/api/src/modules/machines/machine.service.ts:36](../../apps/api/src/modules/machines/machine.service.ts) |
| `createInspection` | MethodDeclaration | [apps/api/src/modules/machines/machine.service.ts:45](../../apps/api/src/modules/machines/machine.service.ts) |
| `ProductionController` | ClassDeclaration | [apps/api/src/modules/production/production.controller.ts:13](../../apps/api/src/modules/production/production.controller.ts) |
| `createProductionEntry` | MethodDeclaration | [apps/api/src/modules/production/production.controller.ts:17](../../apps/api/src/modules/production/production.controller.ts) |
| `getProductionHistory` | MethodDeclaration | [apps/api/src/modules/production/production.controller.ts:23](../../apps/api/src/modules/production/production.controller.ts) |
| `deleteProduction` | MethodDeclaration | [apps/api/src/modules/production/production.controller.ts:28](../../apps/api/src/modules/production/production.controller.ts) |
| `ProductionModule` | ClassDeclaration | [apps/api/src/modules/production/production.module.ts:5](../../apps/api/src/modules/production/production.module.ts) |
| `ProductionService` | ClassDeclaration | [apps/api/src/modules/production/production.service.ts:15](../../apps/api/src/modules/production/production.service.ts) |
| `create` | MethodDeclaration | [apps/api/src/modules/production/production.service.ts:19](../../apps/api/src/modules/production/production.service.ts) |
| `findAll` | MethodDeclaration | [apps/api/src/modules/production/production.service.ts:434](../../apps/api/src/modules/production/production.service.ts) |
| `delete` | MethodDeclaration | [apps/api/src/modules/production/production.service.ts:449](../../apps/api/src/modules/production/production.service.ts) |
| `QualityController` | ClassDeclaration | [apps/api/src/modules/quality/quality.controller.ts:6](../../apps/api/src/modules/quality/quality.controller.ts) |
| `listInspections` | MethodDeclaration | [apps/api/src/modules/quality/quality.controller.ts:10](../../apps/api/src/modules/quality/quality.controller.ts) |
| `createInspection` | MethodDeclaration | [apps/api/src/modules/quality/quality.controller.ts:19](../../apps/api/src/modules/quality/quality.controller.ts) |
| `CreateQualityInspectionDto` | ClassDeclaration | [apps/api/src/modules/quality/quality.dto.ts:10](../../apps/api/src/modules/quality/quality.dto.ts) |
| `QualityModule` | ClassDeclaration | [apps/api/src/modules/quality/quality.module.ts:5](../../apps/api/src/modules/quality/quality.module.ts) |
| `QualityService` | ClassDeclaration | [apps/api/src/modules/quality/quality.service.ts:5](../../apps/api/src/modules/quality/quality.service.ts) |
| `listInspections` | MethodDeclaration | [apps/api/src/modules/quality/quality.service.ts:9](../../apps/api/src/modules/quality/quality.service.ts) |
| `createInspection` | MethodDeclaration | [apps/api/src/modules/quality/quality.service.ts:26](../../apps/api/src/modules/quality/quality.service.ts) |
| `SearchController` | ClassDeclaration | [apps/api/src/modules/search/search.controller.ts:4](../../apps/api/src/modules/search/search.controller.ts) |
| `globalSearch` | MethodDeclaration | [apps/api/src/modules/search/search.controller.ts:8](../../apps/api/src/modules/search/search.controller.ts) |
| `SearchModule` | ClassDeclaration | [apps/api/src/modules/search/search.module.ts:4](../../apps/api/src/modules/search/search.module.ts) |
| `SessionsController` | ClassDeclaration | [apps/api/src/modules/sessions/sessions.controller.ts:8](../../apps/api/src/modules/sessions/sessions.controller.ts) |
| `getSessions` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.controller.ts:14](../../apps/api/src/modules/sessions/sessions.controller.ts) |
| `revokeSession` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.controller.ts:19](../../apps/api/src/modules/sessions/sessions.controller.ts) |
| `SessionsModule` | ClassDeclaration | [apps/api/src/modules/sessions/sessions.module.ts:5](../../apps/api/src/modules/sessions/sessions.module.ts) |
| `SessionsService` | ClassDeclaration | [apps/api/src/modules/sessions/sessions.service.ts:12](../../apps/api/src/modules/sessions/sessions.service.ts) |
| `findSessionsForUser` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.service.ts:16](../../apps/api/src/modules/sessions/sessions.service.ts) |
| `revokeSession` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.service.ts:39](../../apps/api/src/modules/sessions/sessions.service.ts) |
| `SettingsController` | ClassDeclaration | [apps/api/src/modules/settings/settings.controller.ts:7](../../apps/api/src/modules/settings/settings.controller.ts) |
| `getSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.controller.ts:11](../../apps/api/src/modules/settings/settings.controller.ts) |
| `updateSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.controller.ts:16](../../apps/api/src/modules/settings/settings.controller.ts) |
| `supplied` | Function binding | [apps/api/src/modules/settings/settings.dto.ts:16](../../apps/api/src/modules/settings/settings.dto.ts) |
| `UpdateSettingsDto` | ClassDeclaration | [apps/api/src/modules/settings/settings.dto.ts:18](../../apps/api/src/modules/settings/settings.dto.ts) |
| `SettingsModule` | ClassDeclaration | [apps/api/src/modules/settings/settings.module.ts:5](../../apps/api/src/modules/settings/settings.module.ts) |
| `SettingsService` | ClassDeclaration | [apps/api/src/modules/settings/settings.service.ts:34](../../apps/api/src/modules/settings/settings.service.ts) |
| `getSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.service.ts:38](../../apps/api/src/modules/settings/settings.service.ts) |
| `updateSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.service.ts:49](../../apps/api/src/modules/settings/settings.service.ts) |
| `SessionPolicyDto` | ClassDeclaration | [apps/api/src/modules/users/session-policy.controller.ts:12](../../apps/api/src/modules/users/session-policy.controller.ts) |
| `SessionPolicyController` | ClassDeclaration | [apps/api/src/modules/users/session-policy.controller.ts:21](../../apps/api/src/modules/users/session-policy.controller.ts) |
| `list` | MethodDeclaration | [apps/api/src/modules/users/session-policy.controller.ts:26](../../apps/api/src/modules/users/session-policy.controller.ts) |
| `save` | MethodDeclaration | [apps/api/src/modules/users/session-policy.controller.ts:27](../../apps/api/src/modules/users/session-policy.controller.ts) |
| `StaffRuleDto` | ClassDeclaration | [apps/api/src/modules/users/user-access.controller.ts:16](../../apps/api/src/modules/users/user-access.controller.ts) |
| `StaffPolicyDto` | ClassDeclaration | [apps/api/src/modules/users/user-access.controller.ts:22](../../apps/api/src/modules/users/user-access.controller.ts) |
| `Endpoint` | InterfaceDeclaration | [apps/api/src/modules/users/user-access.controller.ts:28](../../apps/api/src/modules/users/user-access.controller.ts) |
| `UserAccessService` | ClassDeclaration | [apps/api/src/modules/users/user-access.controller.ts:29](../../apps/api/src/modules/users/user-access.controller.ts) |
| `catalogue` | MethodDeclaration | [apps/api/src/modules/users/user-access.controller.ts:32](../../apps/api/src/modules/users/user-access.controller.ts) |
| `inspect` | MethodDeclaration | [apps/api/src/modules/users/user-access.controller.ts:55](../../apps/api/src/modules/users/user-access.controller.ts) |
| `replace` | MethodDeclaration | [apps/api/src/modules/users/user-access.controller.ts:61](../../apps/api/src/modules/users/user-access.controller.ts) |
| `UserAccessController` | ClassDeclaration | [apps/api/src/modules/users/user-access.controller.ts:82](../../apps/api/src/modules/users/user-access.controller.ts) |
| `inspect` | MethodDeclaration | [apps/api/src/modules/users/user-access.controller.ts:87](../../apps/api/src/modules/users/user-access.controller.ts) |
| `replace` | MethodDeclaration | [apps/api/src/modules/users/user-access.controller.ts:88](../../apps/api/src/modules/users/user-access.controller.ts) |
| `UsersController` | ClassDeclaration | [apps/api/src/modules/users/users.controller.ts:20](../../apps/api/src/modules/users/users.controller.ts) |
| `register` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:26](../../apps/api/src/modules/users/users.controller.ts) |
| `getUsers` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:35](../../apps/api/src/modules/users/users.controller.ts) |
| `updateUser` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:40](../../apps/api/src/modules/users/users.controller.ts) |
| `security` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:50](../../apps/api/src/modules/users/users.controller.ts) |
| `status` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:55](../../apps/api/src/modules/users/users.controller.ts) |
| `revokeSessions` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:60](../../apps/api/src/modules/users/users.controller.ts) |
| `deleteUser` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:65](../../apps/api/src/modules/users/users.controller.ts) |
| `CreateUserDto` | ClassDeclaration | [apps/api/src/modules/users/users.dto.ts:12](../../apps/api/src/modules/users/users.dto.ts) |
| `UpdateUserDto` | ClassDeclaration | [apps/api/src/modules/users/users.dto.ts:37](../../apps/api/src/modules/users/users.dto.ts) |
| `RevokeUserSessionsDto` | ClassDeclaration | [apps/api/src/modules/users/users.dto.ts:41](../../apps/api/src/modules/users/users.dto.ts) |
| `UserStatusDto` | ClassDeclaration | [apps/api/src/modules/users/users.dto.ts:49](../../apps/api/src/modules/users/users.dto.ts) |
| `UsersModule` | ClassDeclaration | [apps/api/src/modules/users/users.module.ts:9](../../apps/api/src/modules/users/users.module.ts) |
| `UsersService` | ClassDeclaration | [apps/api/src/modules/users/users.service.ts:28](../../apps/api/src/modules/users/users.service.ts) |
| `hashPassword` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:32](../../apps/api/src/modules/users/users.service.ts) |
| `handleConflict` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:41](../../apps/api/src/modules/users/users.service.ts) |
| `createUser` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:51](../../apps/api/src/modules/users/users.service.ts) |
| `findAllUsers` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:84](../../apps/api/src/modules/users/users.service.ts) |
| `securityDetails` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:91](../../apps/api/src/modules/users/users.service.ts) |
| `revokeAllSessions` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:115](../../apps/api/src/modules/users/users.service.ts) |
| `updateUser` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:126](../../apps/api/src/modules/users/users.service.ts) |
| `deleteUser` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:185](../../apps/api/src/modules/users/users.service.ts) |
| `changeStatus` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:189](../../apps/api/src/modules/users/users.service.ts) |
| `WarehouseController` | ClassDeclaration | [apps/api/src/modules/warehouse/warehouse.controller.ts:13](../../apps/api/src/modules/warehouse/warehouse.controller.ts) |
| `listLocations` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.controller.ts:17](../../apps/api/src/modules/warehouse/warehouse.controller.ts) |
| `createLocation` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.controller.ts:22](../../apps/api/src/modules/warehouse/warehouse.controller.ts) |
| `listMovements` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.controller.ts:28](../../apps/api/src/modules/warehouse/warehouse.controller.ts) |
| `createMovement` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.controller.ts:36](../../apps/api/src/modules/warehouse/warehouse.controller.ts) |
| `CreateLocationDto` | ClassDeclaration | [apps/api/src/modules/warehouse/warehouse.dto.ts:11](../../apps/api/src/modules/warehouse/warehouse.dto.ts) |
| `CreateMovementDto` | ClassDeclaration | [apps/api/src/modules/warehouse/warehouse.dto.ts:26](../../apps/api/src/modules/warehouse/warehouse.dto.ts) |
| `WarehouseModule` | ClassDeclaration | [apps/api/src/modules/warehouse/warehouse.module.ts:5](../../apps/api/src/modules/warehouse/warehouse.module.ts) |
| `WarehouseService` | ClassDeclaration | [apps/api/src/modules/warehouse/warehouse.service.ts:4](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `listLocations` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.service.ts:8](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `createLocation` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.service.ts:17](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `listMovements` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.service.ts:26](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `createMovement` | MethodDeclaration | [apps/api/src/modules/warehouse/warehouse.service.ts:35](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `signed` | Function binding | [apps/api/src/modules/warehouse/warehouse.service.ts:71](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `WorkflowsController` | ClassDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:14](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `overview` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:17](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `document` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:20](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `supplier` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:23](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `post` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:26](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `release` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:46](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `close` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:53](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `amend` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:59](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `WorkflowsModule` | ClassDeclaration | [apps/api/src/modules/workflows/workflows.module.ts:4](../../apps/api/src/modules/workflows/workflows.module.ts) |
| `positive` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:17](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `nonnegative` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:23](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `cash` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:29](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `WorkflowsService` | ClassDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:36](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `document` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:39](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `overview` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:49](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `supplier` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:147](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `post` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:172](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `line` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:486](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `inputs` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:529](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `total` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:549](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `move` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:560](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `origin` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:597](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `salesReturn` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:623](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `setPaid` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:850](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `customerFunds` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:886](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `procurement` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1037](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `supplierFunds` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1318](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `linkCottonReceipt` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1454](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `hold` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1563](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `releaseHold` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1587](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `reclassify` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1622](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `completeWip` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1667](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `transform` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:1774](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `used` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:1831](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `orderDispatch` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:2019](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `pick` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:2124](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `valueOpening` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:2190](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `closePeriod` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:2247](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `amendOrder` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:2288](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `AdminSyncResponseDto` | ClassDeclaration | [apps/api/src/services/admin-sync-response.dto.ts:19](../../apps/api/src/services/admin-sync-response.dto.ts) |
| `parseAdminSyncResponse` | FunctionDeclaration | [apps/api/src/services/admin-sync-response.dto.ts:70](../../apps/api/src/services/admin-sync-response.dto.ts) |
| `AdminSyncService` | ClassDeclaration | [apps/api/src/services/admin-sync.service.ts:6](../../apps/api/src/services/admin-sync.service.ts) |
| `getSyncUrl` | MethodDeclaration | [apps/api/src/services/admin-sync.service.ts:14](../../apps/api/src/services/admin-sync.service.ts) |
| `syncMetrics` | MethodDeclaration | [apps/api/src/services/admin-sync.service.ts:54](../../apps/api/src/services/admin-sync.service.ts) |
| `AuditLog` | InterfaceDeclaration | [apps/api/src/services/audit.service.ts:3](../../apps/api/src/services/audit.service.ts) |
| `AuditService` | ClassDeclaration | [apps/api/src/services/audit.service.ts:14](../../apps/api/src/services/audit.service.ts) |
| `log` | MethodDeclaration | [apps/api/src/services/audit.service.ts:18](../../apps/api/src/services/audit.service.ts) |
| `getLogs` | MethodDeclaration | [apps/api/src/services/audit.service.ts:35](../../apps/api/src/services/audit.service.ts) |
| `clearOldLogs` | MethodDeclaration | [apps/api/src/services/audit.service.ts:72](../../apps/api/src/services/audit.service.ts) |
| `money` | Function binding | [apps/api/src/services/business-ledger.ts:5](../../apps/api/src/services/business-ledger.ts) |
| `FinanceScope` | InterfaceDeclaration | [apps/api/src/services/business-ledger.ts:8](../../apps/api/src/services/business-ledger.ts) |
| `unavailableStock` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:14](../../apps/api/src/services/business-ledger.ts) |
| `freezeOrdersForHold` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:30](../../apps/api/src/services/business-ledger.ts) |
| `assertOpenPeriod` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:101](../../apps/api/src/services/business-ledger.ts) |
| `assertOverheadAvailable` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:113](../../apps/api/src/services/business-ledger.ts) |
| `journal` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:139](../../apps/api/src/services/business-ledger.ts) |
| `reconcileLots` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:191](../../apps/api/src/services/business-ledger.ts) |
| `guardLots` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:271](../../apps/api/src/services/business-ledger.ts) |
| `payrollProblem` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:342](../../apps/api/src/services/business-ledger.ts) |
| `reconcileFinance` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:357](../../apps/api/src/services/business-ledger.ts) |
| `reconcileValuation` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:525](../../apps/api/src/services/business-ledger.ts) |
| `InstallationLeaseService` | ClassDeclaration | [apps/api/src/services/installation-lease.service.ts:4](../../apps/api/src/services/installation-lease.service.ts) |
| `renew` | MethodDeclaration | [apps/api/src/services/installation-lease.service.ts:7](../../apps/api/src/services/installation-lease.service.ts) |
| `PrismaService` | InterfaceDeclaration | [apps/api/src/services/prisma.service.ts:22](../../apps/api/src/services/prisma.service.ts) |
| `PrismaService` | ClassDeclaration | [apps/api/src/services/prisma.service.ts:24](../../apps/api/src/services/prisma.service.ts) |
| `get` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:91](../../apps/api/src/services/prisma.service.ts) |
| `auditLedgers` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:99](../../apps/api/src/services/prisma.service.ts) |
| `onModuleInit` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:107](../../apps/api/src/services/prisma.service.ts) |
| `reconcileEverything` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:121](../../apps/api/src/services/prisma.service.ts) |
| `getStartupIssue` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:143](../../apps/api/src/services/prisma.service.ts) |
| `getDataIssues` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:148](../../apps/api/src/services/prisma.service.ts) |
| `stockTransaction` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:152](../../apps/api/src/services/prisma.service.ts) |
| `leadingReconcileBlocked` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:235](../../apps/api/src/services/prisma.service.ts) |
| `closedSnapshot` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:249](../../apps/api/src/services/prisma.service.ts) |
| `onModuleDestroy` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:311](../../apps/api/src/services/prisma.service.ts) |
| `reconcileStock` | FunctionDeclaration | [apps/api/src/services/stock-bridge.ts:8](../../apps/api/src/services/stock-bridge.ts) |
| `guardManagedStock` | FunctionDeclaration | [apps/api/src/services/stock-bridge.ts:200](../../apps/api/src/services/stock-bridge.ts) |
| `getKey` | FunctionDeclaration | [apps/api/src/utils/crypto.ts:14](../../apps/api/src/utils/crypto.ts) |
| `encryptField` | FunctionDeclaration | [apps/api/src/utils/crypto.ts:27](../../apps/api/src/utils/crypto.ts) |
| `decryptField` | FunctionDeclaration | [apps/api/src/utils/crypto.ts:45](../../apps/api/src/utils/crypto.ts) |
| `dayRange` | FunctionDeclaration | [apps/api/src/utils/day-range.ts:7](../../apps/api/src/utils/day-range.ts) |
| `day` | Function binding | [apps/api/src/utils/day-range.ts:11](../../apps/api/src/utils/day-range.ts) |
| `TraceChain` | InterfaceDeclaration | [apps/api/src/utils/delete-guard.ts:18](../../apps/api/src/utils/delete-guard.ts) |
| `DeleteGuardErrorPayload` | InterfaceDeclaration | [apps/api/src/utils/delete-guard.ts:32](../../apps/api/src/utils/delete-guard.ts) |
| `DeleteGuardConflictException` | ClassDeclaration | [apps/api/src/utils/delete-guard.ts:44](../../apps/api/src/utils/delete-guard.ts) |
| `throwInwardUnderProduction` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:53](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionTooEarly` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:75](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionInFuture` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:102](../../apps/api/src/utils/delete-guard.ts) |
| `throwMassBalanceExceeded` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:113](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionHasBilledBags` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:131](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionHasSoldWaste` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:151](../../apps/api/src/utils/delete-guard.ts) |
| `throwWasteSoldOrLinked` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:170](../../apps/api/src/utils/delete-guard.ts) |
| `throwOutwardBilled` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:211](../../apps/api/src/utils/delete-guard.ts) |
| `omit` | FunctionDeclaration | [apps/api/src/utils/omit.ts:2](../../apps/api/src/utils/omit.ts) |
| `normalizeRole` | Function binding | [apps/api/src/utils/roles.ts:7](../../apps/api/src/utils/roles.ts) |
| `sessionExpired` | FunctionDeclaration | [apps/api/src/utils/session-policy.ts:2](../../apps/api/src/utils/session-policy.ts) |
| `StaffRule` | InterfaceDeclaration | [apps/api/src/utils/staff-access.ts:1](../../apps/api/src/utils/staff-access.ts) |
| `staffRouteAllowed` | FunctionDeclaration | [apps/api/src/utils/staff-access.ts:3](../../apps/api/src/utils/staff-access.ts) |
| `stockEventDate` | FunctionDeclaration | [apps/api/src/utils/stock-event-date.ts:5](../../apps/api/src/utils/stock-event-date.ts) |
| `trustedProxies` | FunctionDeclaration | [apps/api/src/utils/trusted-proxies.ts:4](../../apps/api/src/utils/trusted-proxies.ts) |
| `UserAuditPayload` | InterfaceDeclaration | [apps/api/src/utils/user-audit.ts:4](../../apps/api/src/utils/user-audit.ts) |
| `userAuditHash` | FunctionDeclaration | [apps/api/src/utils/user-audit.ts:8](../../apps/api/src/utils/user-audit.ts) |
| `appendUserAudit` | FunctionDeclaration | [apps/api/src/utils/user-audit.ts:12](../../apps/api/src/utils/user-audit.ts) |
| `NotificationSyncRunner` | Function binding | [apps/web/src/App.tsx:92](../../apps/web/src/App.tsx) |
| `SearchResultItem` | InterfaceDeclaration | [apps/web/src/App.tsx:140](../../apps/web/src/App.tsx) |
| `PrintStyles` | Function binding | [apps/web/src/App.tsx:151](../../apps/web/src/App.tsx) |
| `GlobalSearch` | Function binding | [apps/web/src/App.tsx:156](../../apps/web/src/App.tsx) |
| `handleKeyDown` | Function binding | [apps/web/src/App.tsx:175](../../apps/web/src/App.tsx) |
| `fetchResults` | Function binding | [apps/web/src/App.tsx:190](../../apps/web/src/App.tsx) |
| `handleSearch` | Function binding | [apps/web/src/App.tsx:221](../../apps/web/src/App.tsx) |
| `handleKeyDown` | Function binding | [apps/web/src/App.tsx:225](../../apps/web/src/App.tsx) |
| `closeResults` | Function binding | [apps/web/src/App.tsx:253](../../apps/web/src/App.tsx) |
| `addToHistory` | Function binding | [apps/web/src/App.tsx:255](../../apps/web/src/App.tsx) |
| `highlightMatch` | Function binding | [apps/web/src/App.tsx:262](../../apps/web/src/App.tsx) |
| `App` | Function binding | [apps/web/src/App.tsx:386](../../apps/web/src/App.tsx) |
| `getInitialPage` | Function binding | [apps/web/src/App.tsx:400](../../apps/web/src/App.tsx) |
| `setCurrentPage` | Function binding | [apps/web/src/App.tsx:408](../../apps/web/src/App.tsx) |
| `handlePopState` | Function binding | [apps/web/src/App.tsx:421](../../apps/web/src/App.tsx) |
| `handleNavigate` | Function binding | [apps/web/src/App.tsx:477](../../apps/web/src/App.tsx) |
| `toggleTheme` | Function binding | [apps/web/src/App.tsx:487](../../apps/web/src/App.tsx) |
| `toggleLanguage` | Function binding | [apps/web/src/App.tsx:493](../../apps/web/src/App.tsx) |
| `handleProfileClick` | Function binding | [apps/web/src/App.tsx:506](../../apps/web/src/App.tsx) |
| `handleProfileClose` | Function binding | [apps/web/src/App.tsx:510](../../apps/web/src/App.tsx) |
| `handleLogout` | Function binding | [apps/web/src/App.tsx:514](../../apps/web/src/App.tsx) |
| `handleLogin` | Function binding | [apps/web/src/App.tsx:529](../../apps/web/src/App.tsx) |
| `handleDrawerToggle` | Function binding | [apps/web/src/App.tsx:535](../../apps/web/src/App.tsx) |
| `getBreadcrumbItems` | Function binding | [apps/web/src/App.tsx:541](../../apps/web/src/App.tsx) |
| `handleSync` | Function binding | [apps/web/src/App.tsx:588](../../apps/web/src/App.tsx) |
| `labelFor` | Function binding | [apps/web/src/App.tsx:689](../../apps/web/src/App.tsx) |
| `LicensedApp` | FunctionDeclaration | [apps/web/src/App.tsx:1116](../../apps/web/src/App.tsx) |
| `errorText` | Function binding | [apps/web/src/components/AccountRecovery.tsx:10](../../apps/web/src/components/AccountRecovery.tsx) |
| `RequestPasswordReset` | FunctionDeclaration | [apps/web/src/components/AccountRecovery.tsx:11](../../apps/web/src/components/AccountRecovery.tsx) |
| `AccountLinkDialog` | FunctionDeclaration | [apps/web/src/components/AccountRecovery.tsx:30](../../apps/web/src/components/AccountRecovery.tsx) |
| `AccountSecurityActions` | FunctionDeclaration | [apps/web/src/components/AccountSecurityActions.tsx:7](../../apps/web/src/components/AccountSecurityActions.tsx) |
| `close` | Function binding | [apps/web/src/components/AccountSecurityActions.tsx:12](../../apps/web/src/components/AccountSecurityActions.tsx) |
| `AgentMascot` | FunctionDeclaration | [apps/web/src/components/AgentMascot.tsx:4](../../apps/web/src/components/AgentMascot.tsx) |
| `BusinessFlowGuide` | FunctionDeclaration | [apps/web/src/components/BusinessFlowGuide.tsx:25](../../apps/web/src/components/BusinessFlowGuide.tsx) |
| `CredentialActionButton` | FunctionDeclaration | [apps/web/src/components/CredentialActionButton.tsx:8](../../apps/web/src/components/CredentialActionButton.tsx) |
| `close` | Function binding | [apps/web/src/components/CredentialActionButton.tsx:17](../../apps/web/src/components/CredentialActionButton.tsx) |
| `submit` | Function binding | [apps/web/src/components/CredentialActionButton.tsx:18](../../apps/web/src/components/CredentialActionButton.tsx) |
| `YarnCore` | Function binding | [apps/web/src/components/DashboardScene.tsx:8](../../apps/web/src/components/DashboardScene.tsx) |
| `DashboardScene` | Function binding | [apps/web/src/components/DashboardScene.tsx:52](../../apps/web/src/components/DashboardScene.tsx) |
| `readAppearance` | FunctionDeclaration | [apps/web/src/components/FloatingAgent.tsx:11](../../apps/web/src/components/FloatingAgent.tsx) |
| `FloatingAgent` | FunctionDeclaration | [apps/web/src/components/FloatingAgent.tsx:19](../../apps/web/src/components/FloatingAgent.tsx) |
| `show` | Function binding | [apps/web/src/components/FloatingAgent.tsx:32](../../apps/web/src/components/FloatingAgent.tsx) |
| `close` | Function binding | [apps/web/src/components/FloatingAgent.tsx:33](../../apps/web/src/components/FloatingAgent.tsx) |
| `reveal` | Function binding | [apps/web/src/components/FloatingAgent.tsx:36](../../apps/web/src/components/FloatingAgent.tsx) |
| `prefer` | Function binding | [apps/web/src/components/FloatingAgent.tsx:40](../../apps/web/src/components/FloatingAgent.tsx) |
| `HelpdeskAiAdvisory` | FunctionDeclaration | [apps/web/src/components/HelpdeskAiAdvisory.tsx:7](../../apps/web/src/components/HelpdeskAiAdvisory.tsx) |
| `HelpdeskBulkActions` | FunctionDeclaration | [apps/web/src/components/HelpdeskBulkImport.tsx:21](../../apps/web/src/components/HelpdeskBulkImport.tsx) |
| `HelpdeskImport` | FunctionDeclaration | [apps/web/src/components/HelpdeskBulkImport.tsx:176](../../apps/web/src/components/HelpdeskBulkImport.tsx) |
| `HelpdeskEmailDispatch` | FunctionDeclaration | [apps/web/src/components/HelpdeskEmailDispatch.tsx:20](../../apps/web/src/components/HelpdeskEmailDispatch.tsx) |
| `HelpdeskOperationsPanel` | FunctionDeclaration | [apps/web/src/components/HelpdeskOperationsPanel.tsx:115](../../apps/web/src/components/HelpdeskOperationsPanel.tsx) |
| `open` | Function binding | [apps/web/src/components/HelpdeskOperationsPanel.tsx:227](../../apps/web/src/components/HelpdeskOperationsPanel.tsx) |
| `field` | Function binding | [apps/web/src/components/HelpdeskOperationsPanel.tsx:249](../../apps/web/src/components/HelpdeskOperationsPanel.tsx) |
| `HelpdeskQuickReport` | FunctionDeclaration | [apps/web/src/components/HelpdeskQuickReport.tsx:8](../../apps/web/src/components/HelpdeskQuickReport.tsx) |
| `HelpdeskTicketInspector` | FunctionDeclaration | [apps/web/src/components/HelpdeskTicketInspector.tsx:67](../../apps/web/src/components/HelpdeskTicketInspector.tsx) |
| `beat` | Function binding | [apps/web/src/components/HelpdeskTicketInspector.tsx:104](../../apps/web/src/components/HelpdeskTicketInspector.tsx) |
| `version` | Function binding | [apps/web/src/components/HelpdeskTicketInspector.tsx:130](../../apps/web/src/components/HelpdeskTicketInspector.tsx) |
| `begin` | Function binding | [apps/web/src/components/HelpdeskTicketInspector.tsx:132](../../apps/web/src/components/HelpdeskTicketInspector.tsx) |
| `changed` | Function binding | [apps/web/src/components/HelpdeskTicketInspector.tsx:136](../../apps/web/src/components/HelpdeskTicketInspector.tsx) |
| `saveSupportBlob` | Function binding | [apps/web/src/components/HelpdeskTicketTools.tsx:21](../../apps/web/src/components/HelpdeskTicketTools.tsx) |
| `HelpdeskTicketTools` | FunctionDeclaration | [apps/web/src/components/HelpdeskTicketTools.tsx:29](../../apps/web/src/components/HelpdeskTicketTools.tsx) |
| `open` | Function binding | [apps/web/src/components/HelpdeskTicketTools.tsx:121](../../apps/web/src/components/HelpdeskTicketTools.tsx) |
| `exportTicket` | Function binding | [apps/web/src/components/HelpdeskTicketTools.tsx:146](../../apps/web/src/components/HelpdeskTicketTools.tsx) |
| `upload` | Function binding | [apps/web/src/components/HelpdeskTicketTools.tsx:160](../../apps/web/src/components/HelpdeskTicketTools.tsx) |
| `escape` | Function binding | [apps/web/src/components/HelpdeskTicketTools.tsx:212](../../apps/web/src/components/HelpdeskTicketTools.tsx) |
| `HelpdeskWorkActions` | FunctionDeclaration | [apps/web/src/components/HelpdeskWorkActions.tsx:17](../../apps/web/src/components/HelpdeskWorkActions.tsx) |
| `open` | Function binding | [apps/web/src/components/HelpdeskWorkActions.tsx:78](../../apps/web/src/components/HelpdeskWorkActions.tsx) |
| `InstallationGate` | FunctionDeclaration | [apps/web/src/components/InstallationGate.tsx:9](../../apps/web/src/components/InstallationGate.tsx) |
| `cancel` | Function binding | [apps/web/src/components/InstallationGate.tsx:25](../../apps/web/src/components/InstallationGate.tsx) |
| `focus` | Function binding | [apps/web/src/components/InstallationGate.tsx:53](../../apps/web/src/components/InstallationGate.tsx) |
| `LanguageSelector` | FunctionDeclaration | [apps/web/src/components/LanguageSelector.tsx:5](../../apps/web/src/components/LanguageSelector.tsx) |
| `LoginProps` | InterfaceDeclaration | [apps/web/src/components/Login.tsx:64](../../apps/web/src/components/Login.tsx) |
| `Login` | Function binding | [apps/web/src/components/Login.tsx:70](../../apps/web/src/components/Login.tsx) |
| `handleSubmit` | Function binding | [apps/web/src/components/Login.tsx:96](../../apps/web/src/components/Login.tsx) |
| `handlePasskeyLogin` | Function binding | [apps/web/src/components/Login.tsx:122](../../apps/web/src/components/Login.tsx) |
| `IntrinsicElements` | InterfaceDeclaration | [apps/web/src/components/LoginAvatar.tsx:12](../../apps/web/src/components/LoginAvatar.tsx) |
| `LoginAvatarProps` | InterfaceDeclaration | [apps/web/src/components/LoginAvatar.tsx:16](../../apps/web/src/components/LoginAvatar.tsx) |
| `IridescentMaterial` | Function binding | [apps/web/src/components/LoginAvatar.tsx:25](../../apps/web/src/components/LoginAvatar.tsx) |
| `Character` | Function binding | [apps/web/src/components/LoginAvatar.tsx:69](../../apps/web/src/components/LoginAvatar.tsx) |
| `LoginAvatar` | Function binding | [apps/web/src/components/LoginAvatar.tsx:178](../../apps/web/src/components/LoginAvatar.tsx) |
| `useProvider` | FunctionDeclaration | [apps/web/src/components/OidcAccess.tsx:9](../../apps/web/src/components/OidcAccess.tsx) |
| `OidcSignIn` | FunctionDeclaration | [apps/web/src/components/OidcAccess.tsx:10](../../apps/web/src/components/OidcAccess.tsx) |
| `OidcIdentitySettings` | FunctionDeclaration | [apps/web/src/components/OidcAccess.tsx:16](../../apps/web/src/components/OidcAccess.tsx) |
| `close` | Function binding | [apps/web/src/components/OidcAccess.tsx:22](../../apps/web/src/components/OidcAccess.tsx) |
| `OidcCompletion` | FunctionDeclaration | [apps/web/src/components/OidcAccess.tsx:37](../../apps/web/src/components/OidcAccess.tsx) |
| `PasskeyManager` | FunctionDeclaration | [apps/web/src/components/PasskeyManager.tsx:7](../../apps/web/src/components/PasskeyManager.tsx) |
| `ProfileModalProps` | InterfaceDeclaration | [apps/web/src/components/ProfileModal.tsx:36](../../apps/web/src/components/ProfileModal.tsx) |
| `ProfileModal` | Function binding | [apps/web/src/components/ProfileModal.tsx:47](../../apps/web/src/components/ProfileModal.tsx) |
| `handleSaveProfile` | Function binding | [apps/web/src/components/ProfileModal.tsx:116](../../apps/web/src/components/ProfileModal.tsx) |
| `handleChangePassword` | Function binding | [apps/web/src/components/ProfileModal.tsx:127](../../apps/web/src/components/ProfileModal.tsx) |
| `getRoleColor` | Function binding | [apps/web/src/components/ProfileModal.tsx:143](../../apps/web/src/components/ProfileModal.tsx) |
| `Policy` | InterfaceDeclaration | [apps/web/src/components/SessionPolicySettings.tsx:8](../../apps/web/src/components/SessionPolicySettings.tsx) |
| `SessionPolicySettings` | FunctionDeclaration | [apps/web/src/components/SessionPolicySettings.tsx:9](../../apps/web/src/components/SessionPolicySettings.tsx) |
| `close` | Function binding | [apps/web/src/components/SessionPolicySettings.tsx:14](../../apps/web/src/components/SessionPolicySettings.tsx) |
| `StaffAssistant` | FunctionDeclaration | [apps/web/src/components/StaffAssistant.tsx:5](../../apps/web/src/components/StaffAssistant.tsx) |
| `boundedPng` | FunctionDeclaration | [apps/web/src/components/SupportAttachmentPreview.tsx:6](../../apps/web/src/components/SupportAttachmentPreview.tsx) |
| `SupportAttachmentPreview` | FunctionDeclaration | [apps/web/src/components/SupportAttachmentPreview.tsx:10](../../apps/web/src/components/SupportAttachmentPreview.tsx) |
| `SupportMarkdown` | FunctionDeclaration | [apps/web/src/components/SupportMarkdown.tsx:6](../../apps/web/src/components/SupportMarkdown.tsx) |
| `TamilOptions` | FunctionDeclaration | [apps/web/src/components/TamilOptions.tsx:30](../../apps/web/src/components/TamilOptions.tsx) |
| `change` | Function binding | [apps/web/src/components/TamilOptions.tsx:32](../../apps/web/src/components/TamilOptions.tsx) |
| `Rule` | InterfaceDeclaration | [apps/web/src/components/UserEndpointAccess.tsx:8](../../apps/web/src/components/UserEndpointAccess.tsx) |
| `Policy` | InterfaceDeclaration | [apps/web/src/components/UserEndpointAccess.tsx:9](../../apps/web/src/components/UserEndpointAccess.tsx) |
| `UserEndpointAccess` | FunctionDeclaration | [apps/web/src/components/UserEndpointAccess.tsx:10](../../apps/web/src/components/UserEndpointAccess.tsx) |
| `update` | Function binding | [apps/web/src/components/UserEndpointAccess.tsx:16](../../apps/web/src/components/UserEndpointAccess.tsx) |
| `close` | Function binding | [apps/web/src/components/UserEndpointAccess.tsx:17](../../apps/web/src/components/UserEndpointAccess.tsx) |
| `Invitation` | InterfaceDeclaration | [apps/web/src/components/UserInvitations.tsx:8](../../apps/web/src/components/UserInvitations.tsx) |
| `UserInvitations` | FunctionDeclaration | [apps/web/src/components/UserInvitations.tsx:9](../../apps/web/src/components/UserInvitations.tsx) |
| `UserLifecycleControls` | FunctionDeclaration | [apps/web/src/components/UserLifecycleControls.tsx:9](../../apps/web/src/components/UserLifecycleControls.tsx) |
| `SecurityDetails` | InterfaceDeclaration | [apps/web/src/components/UserSecurityInspector.tsx:8](../../apps/web/src/components/UserSecurityInspector.tsx) |
| `UserSecurityInspector` | FunctionDeclaration | [apps/web/src/components/UserSecurityInspector.tsx:16](../../apps/web/src/components/UserSecurityInspector.tsx) |
| `requestRevoke` | Function binding | [apps/web/src/components/UserSecurityInspector.tsx:26](../../apps/web/src/components/UserSecurityInspector.tsx) |
| `stamp` | Function binding | [apps/web/src/components/UserSecurityInspector.tsx:29](../../apps/web/src/components/UserSecurityInspector.tsx) |
| `WeighbridgeReceiptDialog` | FunctionDeclaration | [apps/web/src/components/WeighbridgeReceiptDialog.tsx:8](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) |
| `save` | Function binding | [apps/web/src/components/WeighbridgeReceiptDialog.tsx:37](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) |
| `NavItem` | InterfaceDeclaration | [apps/web/src/components/WorkspaceNavigation.tsx:29](../../apps/web/src/components/WorkspaceNavigation.tsx) |
| `NavGroup` | InterfaceDeclaration | [apps/web/src/components/WorkspaceNavigation.tsx:37](../../apps/web/src/components/WorkspaceNavigation.tsx) |
| `Props` | InterfaceDeclaration | [apps/web/src/components/WorkspaceNavigation.tsx:42](../../apps/web/src/components/WorkspaceNavigation.tsx) |
| `NavigationSection` | FunctionDeclaration | [apps/web/src/components/WorkspaceNavigation.tsx:58](../../apps/web/src/components/WorkspaceNavigation.tsx) |
| `WorkspaceNavigation` | FunctionDeclaration | [apps/web/src/components/WorkspaceNavigation.tsx:273](../../apps/web/src/components/WorkspaceNavigation.tsx) |
| `FeedEvent` | InterfaceDeclaration | [apps/web/src/components/command-center/ActivityFeed.tsx:20](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `ActivityFeedProps` | InterfaceDeclaration | [apps/web/src/components/command-center/ActivityFeed.tsx:30](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `timeAgo` | FunctionDeclaration | [apps/web/src/components/command-center/ActivityFeed.tsx:49](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `EventRow` | Function binding | [apps/web/src/components/command-center/ActivityFeed.tsx:64](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `FeedSkeleton` | Function binding | [apps/web/src/components/command-center/ActivityFeed.tsx:154](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `ActivityFeed` | Function binding | [apps/web/src/components/command-center/ActivityFeed.tsx:208](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `Solid` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:7](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `FactoryBuilding` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:12](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `HazardBayPad` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:46](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `DockBeacon` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:63](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `MachineModel` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:75](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `Landscape` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:93](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `CameraRig` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:19](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Block` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:64](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Label` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:70](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `PinCallout` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:80](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Building` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:110](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Wheel` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:117](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Stock` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:127](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Forklift` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:138](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `ParkedTruck` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:204](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Truck` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:229](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `World` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:257](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `SceneBoundary` | ClassDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:362](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `getDerivedStateFromError` | MethodDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:364](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `render` | MethodDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:365](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `CampusScene` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:368](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `update` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:384](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `focus` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:395](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `escape` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:399](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `selectMachine` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:408](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `number` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:419](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `ZoneInfo` | InterfaceDeclaration | [apps/web/src/components/command-center/CampusWorkspace.tsx:6](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `Props` | InterfaceDeclaration | [apps/web/src/components/command-center/CampusWorkspace.tsx:7](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `CampusWorkspace` | FunctionDeclaration | [apps/web/src/components/command-center/CampusWorkspace.tsx:23](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `focus` | Function binding | [apps/web/src/components/command-center/CampusWorkspace.tsx:38](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `FleetDockTableHudProps` | InterfaceDeclaration | [apps/web/src/components/command-center/FleetDockTableHud.tsx:26](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) |
| `FleetDockTableHud` | Function binding | [apps/web/src/components/command-center/FleetDockTableHud.tsx:35](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) |
| `MachineData` | InterfaceDeclaration | [apps/web/src/components/command-center/FloorCanvas.tsx:8](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `FloorCanvasProps` | InterfaceDeclaration | [apps/web/src/components/command-center/FloorCanvas.tsx:16](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `ZoneRect` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:66](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `MachineStatusRing` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:97](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `FlowParticle` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:143](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `BaleStack` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:161](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `BagGrid` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:205](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `TruckIcon` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:240](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `GridBackground` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:270](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `FloorCanvas` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:283](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `useCountUp` | FunctionDeclaration | [apps/web/src/components/command-center/KpiRibbon.tsx:15](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `step` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:32](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `KpiCard` | InterfaceDeclaration | [apps/web/src/components/command-center/KpiRibbon.tsx:50](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `KpiRibbonProps` | InterfaceDeclaration | [apps/web/src/components/command-center/KpiRibbon.tsx:64](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `StatCard` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:71](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `SkeletonCard` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:202](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `KpiRibbon` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:229](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `ActiveShipment` | InterfaceDeclaration | [apps/web/src/components/command-center/ShipmentStepperHud.tsx:26](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) |
| `ShipmentStepperHudProps` | InterfaceDeclaration | [apps/web/src/components/command-center/ShipmentStepperHud.tsx:39](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) |
| `ShipmentStepperHud` | Function binding | [apps/web/src/components/command-center/ShipmentStepperHud.tsx:44](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) |
| `WarRoomViewProps` | InterfaceDeclaration | [apps/web/src/components/command-center/WarRoomView.tsx:32](../../apps/web/src/components/command-center/WarRoomView.tsx) |
| `WarRoomView` | Function binding | [apps/web/src/components/command-center/WarRoomView.tsx:49](../../apps/web/src/components/command-center/WarRoomView.tsx) |
| `BarcodeQRModalProps` | InterfaceDeclaration | [apps/web/src/components/common/BarcodeQRModal.tsx:28](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `escapeHtml` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:40](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `labelPrintDocument` | FunctionDeclaration | [apps/web/src/components/common/BarcodeQRModal.tsx:47](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `SimpleSVGBarcode` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:131](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `BarcodeQRModal` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:188](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `handlePrint` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:201](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `handleCopy` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:213](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `BatchCodeBuilderProps` | InterfaceDeclaration | [apps/web/src/components/common/BatchCodeBuilder.tsx:8](../../apps/web/src/components/common/BatchCodeBuilder.tsx) |
| `BatchCodeBuilder` | FunctionDeclaration | [apps/web/src/components/common/BatchCodeBuilder.tsx:15](../../apps/web/src/components/common/BatchCodeBuilder.tsx) |
| `BreadcrumbItem` | InterfaceDeclaration | [apps/web/src/components/common/Breadcrumbs.tsx:14](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `BreadcrumbsProps` | InterfaceDeclaration | [apps/web/src/components/common/Breadcrumbs.tsx:20](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `Breadcrumbs` | Function binding | [apps/web/src/components/common/Breadcrumbs.tsx:25](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `handleClick` | Function binding | [apps/web/src/components/common/Breadcrumbs.tsx:27](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `ConfirmDialogProps` | InterfaceDeclaration | [apps/web/src/components/common/ConfirmDialog.tsx:14](../../apps/web/src/components/common/ConfirmDialog.tsx) |
| `ConfirmDialog` | Function binding | [apps/web/src/components/common/ConfirmDialog.tsx:25](../../apps/web/src/components/common/ConfirmDialog.tsx) |
| `EmptyStateProps` | InterfaceDeclaration | [apps/web/src/components/common/EmptyState.tsx:12](../../apps/web/src/components/common/EmptyState.tsx) |
| `EmptyState` | Function binding | [apps/web/src/components/common/EmptyState.tsx:21](../../apps/web/src/components/common/EmptyState.tsx) |
| `EntryWizardHeaderProps` | InterfaceDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:7](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `EntryWizardHeader` | FunctionDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:17](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `EntrySummary` | FunctionDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:37](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `SummaryValue` | FunctionDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:48](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `Props` | InterfaceDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:6](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `State` | InterfaceDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:11](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `ErrorBoundary` | ClassDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:21](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `getDerivedStateFromError` | MethodDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:27](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `componentDidCatch` | MethodDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:31](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `render` | MethodDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:53](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `ExportButtonsProps` | InterfaceDeclaration | [apps/web/src/components/common/ExportButtons.tsx:11](../../apps/web/src/components/common/ExportButtons.tsx) |
| `ExportBtn` | InterfaceDeclaration | [apps/web/src/components/common/ExportButtons.tsx:25](../../apps/web/src/components/common/ExportButtons.tsx) |
| `ExportButtons` | Function binding | [apps/web/src/components/common/ExportButtons.tsx:35](../../apps/web/src/components/common/ExportButtons.tsx) |
| `parseDate` | FunctionDeclaration | [apps/web/src/components/common/GlassDatePicker.tsx:24](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `toISO` | FunctionDeclaration | [apps/web/src/components/common/GlassDatePicker.tsx:29](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `formatDisplay` | FunctionDeclaration | [apps/web/src/components/common/GlassDatePicker.tsx:32](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `GlassDatePicker` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:39](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `handler` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:56](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `isSameDay` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:85](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `isToday` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:87](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `NotFoundProps` | InterfaceDeclaration | [apps/web/src/components/common/NotFound404.tsx:6](../../apps/web/src/components/common/NotFound404.tsx) |
| `NotFound404` | Function binding | [apps/web/src/components/common/NotFound404.tsx:11](../../apps/web/src/components/common/NotFound404.tsx) |
| `ProductionTimingAlert` | FunctionDeclaration | [apps/web/src/components/common/ProductionTimingAlert.tsx:7](../../apps/web/src/components/common/ProductionTimingAlert.tsx) |
| `RequiredLabelProps` | InterfaceDeclaration | [apps/web/src/components/common/RequiredLabel.tsx:5](../../apps/web/src/components/common/RequiredLabel.tsx) |
| `RequiredLabel` | Function binding | [apps/web/src/components/common/RequiredLabel.tsx:15](../../apps/web/src/components/common/RequiredLabel.tsx) |
| `canUseWebGL` | FunctionDeclaration | [apps/web/src/components/common/SceneFallback.tsx:20](../../apps/web/src/components/common/SceneFallback.tsx) |
| `SceneFallbackProps` | InterfaceDeclaration | [apps/web/src/components/common/SceneFallback.tsx:31](../../apps/web/src/components/common/SceneFallback.tsx) |
| `SceneFallback` | FunctionDeclaration | [apps/web/src/components/common/SceneFallback.tsx:40](../../apps/web/src/components/common/SceneFallback.tsx) |
| `SafeScene` | FunctionDeclaration | [apps/web/src/components/common/SceneFallback.tsx:105](../../apps/web/src/components/common/SceneFallback.tsx) |
| `useScreenReaderAnnouncer` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:8](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `announce` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:12](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `ScreenReaderAnnouncerProps` | InterfaceDeclaration | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:20](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `ScreenReaderAnnouncer` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:29](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `handleAnnounce` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:34](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `announceToScreenReader` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:87](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `TableSkeletonProps` | InterfaceDeclaration | [apps/web/src/components/common/TableSkeleton.tsx:13](../../apps/web/src/components/common/TableSkeleton.tsx) |
| `TableSkeleton` | Function binding | [apps/web/src/components/common/TableSkeleton.tsx:19](../../apps/web/src/components/common/TableSkeleton.tsx) |
| `EwayBill` | InterfaceDeclaration | [apps/web/src/components/insights/EwayBills.tsx:11](../../apps/web/src/components/insights/EwayBills.tsx) |
| `EwayBills` | Function binding | [apps/web/src/components/insights/EwayBills.tsx:22](../../apps/web/src/components/insights/EwayBills.tsx) |
| `handleGenerate` | Function binding | [apps/web/src/components/insights/EwayBills.tsx:28](../../apps/web/src/components/insights/EwayBills.tsx) |
| `handleCancel` | Function binding | [apps/web/src/components/insights/EwayBills.tsx:32](../../apps/web/src/components/insights/EwayBills.tsx) |
| `TallySync` | Function binding | [apps/web/src/components/insights/TallySync.tsx:11](../../apps/web/src/components/insights/TallySync.tsx) |
| `handleSync` | Function binding | [apps/web/src/components/insights/TallySync.tsx:17](../../apps/web/src/components/insights/TallySync.tsx) |
| `ConfirmOptions` | InterfaceDeclaration | [apps/web/src/context/ConfirmContext.tsx:5](../../apps/web/src/context/ConfirmContext.tsx) |
| `ConfirmContextType` | InterfaceDeclaration | [apps/web/src/context/ConfirmContext.tsx:13](../../apps/web/src/context/ConfirmContext.tsx) |
| `ConfirmProvider` | Function binding | [apps/web/src/context/ConfirmContext.tsx:19](../../apps/web/src/context/ConfirmContext.tsx) |
| `useConfirm` | Function binding | [apps/web/src/context/ConfirmContext.tsx:62](../../apps/web/src/context/ConfirmContext.tsx) |
| `Shortcut` | InterfaceDeclaration | [apps/web/src/context/KeyboardShortcutsContext.tsx:5](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `KeyboardShortcutsContextType` | InterfaceDeclaration | [apps/web/src/context/KeyboardShortcutsContext.tsx:14](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `useKeyboardShortcuts` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:22](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `KeyboardShortcutsProvider` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:30](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `handleKeyDown` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:59](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `useShortcut` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:92](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `Notification` | InterfaceDeclaration | [apps/web/src/context/NotificationsContext.tsx:27](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsContextType` | InterfaceDeclaration | [apps/web/src/context/NotificationsContext.tsx:38](../../apps/web/src/context/NotificationsContext.tsx) |
| `loadFromStorage` | FunctionDeclaration | [apps/web/src/context/NotificationsContext.tsx:53](../../apps/web/src/context/NotificationsContext.tsx) |
| `saveToStorage` | FunctionDeclaration | [apps/web/src/context/NotificationsContext.tsx:62](../../apps/web/src/context/NotificationsContext.tsx) |
| `useNotifications` | Function binding | [apps/web/src/context/NotificationsContext.tsx:72](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsProvider` | Function binding | [apps/web/src/context/NotificationsContext.tsx:78](../../apps/web/src/context/NotificationsContext.tsx) |
| `sync` | Function binding | [apps/web/src/context/NotificationsContext.tsx:84](../../apps/web/src/context/NotificationsContext.tsx) |
| `formatTime` | FunctionDeclaration | [apps/web/src/context/NotificationsContext.tsx:153](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsBellProps` | InterfaceDeclaration | [apps/web/src/context/NotificationsContext.tsx:166](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsBell` | Function binding | [apps/web/src/context/NotificationsContext.tsx:170](../../apps/web/src/context/NotificationsContext.tsx) |
| `handleItemClick` | Function binding | [apps/web/src/context/NotificationsContext.tsx:178](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotifItem` | Function binding | [apps/web/src/context/NotificationsContext.tsx:188](../../apps/web/src/context/NotificationsContext.tsx) |
| `useDebounce` | FunctionDeclaration | [apps/web/src/hooks/useDebounce.ts:3](../../apps/web/src/hooks/useDebounce.ts) |
| `agentViewport` | FunctionDeclaration | [apps/web/src/hooks/useFloatingAgent.ts:8](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `clampAgent` | FunctionDeclaration | [apps/web/src/hooks/useFloatingAgent.ts:18](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `defaultAgentPosition` | FunctionDeclaration | [apps/web/src/hooks/useFloatingAgent.ts:25](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `agentPanelPosition` | FunctionDeclaration | [apps/web/src/hooks/useFloatingAgent.ts:33](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `readPosition` | FunctionDeclaration | [apps/web/src/hooks/useFloatingAgent.ts:45](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `useFloatingAgent` | FunctionDeclaration | [apps/web/src/hooks/useFloatingAgent.ts:54](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `move` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:65](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `save` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:69](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `resize` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:74](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `finish` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:93](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `onPointerDown` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:103](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `onPointerMove` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:113](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `onKeyDown` | Function binding | [apps/web/src/hooks/useFloatingAgent.ts:122](../../apps/web/src/hooks/useFloatingAgent.ts) |
| `useFullscreen` | FunctionDeclaration | [apps/web/src/hooks/useFullscreen.ts:4](../../apps/web/src/hooks/useFullscreen.ts) |
| `sync` | Function binding | [apps/web/src/hooks/useFullscreen.ts:8](../../apps/web/src/hooks/useFullscreen.ts) |
| `toggle` | Function binding | [apps/web/src/hooks/useFullscreen.ts:13](../../apps/web/src/hooks/useFullscreen.ts) |
| `useNotificationSync` | FunctionDeclaration | [apps/web/src/hooks/useNotificationSync.ts:21](../../apps/web/src/hooks/useNotificationSync.ts) |
| `usePersist` | FunctionDeclaration | [apps/web/src/hooks/usePersist.ts:5](../../apps/web/src/hooks/usePersist.ts) |
| `persist` | Function binding | [apps/web/src/hooks/usePersist.ts:15](../../apps/web/src/hooks/usePersist.ts) |
| `add` | Function binding | [apps/web/src/hooks/usePersist.ts:20](../../apps/web/src/hooks/usePersist.ts) |
| `update` | Function binding | [apps/web/src/hooks/usePersist.ts:26](../../apps/web/src/hooks/usePersist.ts) |
| `remove` | Function binding | [apps/web/src/hooks/usePersist.ts:30](../../apps/web/src/hooks/usePersist.ts) |
| `today` | Function binding | [apps/web/src/hooks/usePersist.ts:37](../../apps/web/src/hooks/usePersist.ts) |
| `fmtDate` | Function binding | [apps/web/src/hooks/usePersist.ts:38](../../apps/web/src/hooks/usePersist.ts) |
| `fmtAmt` | Function binding | [apps/web/src/hooks/usePersist.ts:39](../../apps/web/src/hooks/usePersist.ts) |
| `loadUiLanguage` | FunctionDeclaration | [apps/web/src/i18n.ts:6](../../apps/web/src/i18n.ts) |
| `readSavedLanguage` | Function binding | [apps/web/src/i18n.ts:18](../../apps/web/src/i18n.ts) |
| `readPreferences` | FunctionDeclaration | [apps/web/src/i18n.ts:27](../../apps/web/src/i18n.ts) |
| `getRevision` | Function binding | [apps/web/src/i18n.ts:34](../../apps/web/src/i18n.ts) |
| `subscribe` | Function binding | [apps/web/src/i18n.ts:36](../../apps/web/src/i18n.ts) |
| `getUiLanguage` | Function binding | [apps/web/src/i18n.ts:37](../../apps/web/src/i18n.ts) |
| `useUiLanguage` | FunctionDeclaration | [apps/web/src/i18n.ts:38](../../apps/web/src/i18n.ts) |
| `useTamilPreferences` | Function binding | [apps/web/src/i18n.ts:39](../../apps/web/src/i18n.ts) |
| `setTamilPreferences` | FunctionDeclaration | [apps/web/src/i18n.ts:40](../../apps/web/src/i18n.ts) |
| `uiLocale` | Function binding | [apps/web/src/i18n.ts:46](../../apps/web/src/i18n.ts) |
| `uiDateLocale` | Function binding | [apps/web/src/i18n.ts:47](../../apps/web/src/i18n.ts) |
| `uiCurrencySymbol` | Function binding | [apps/web/src/i18n.ts:48](../../apps/web/src/i18n.ts) |
| `formatUiNumber` | Function binding | [apps/web/src/i18n.ts:49](../../apps/web/src/i18n.ts) |
| `formatUiDate` | Function binding | [apps/web/src/i18n.ts:50](../../apps/web/src/i18n.ts) |
| `formatUiCurrency` | Function binding | [apps/web/src/i18n.ts:51](../../apps/web/src/i18n.ts) |
| `formatUiDecimal` | Function binding | [apps/web/src/i18n.ts:52](../../apps/web/src/i18n.ts) |
| `uiMetric` | FunctionDeclaration | [apps/web/src/i18n.ts:54](../../apps/web/src/i18n.ts) |
| `setUiLanguage` | FunctionDeclaration | [apps/web/src/i18n.ts:70](../../apps/web/src/i18n.ts) |
| `uiText` | FunctionDeclaration | [apps/web/src/i18n.ts:100](../../apps/web/src/i18n.ts) |
| `interpolate` | FunctionDeclaration | [apps/web/src/i18n.ts:111](../../apps/web/src/i18n.ts) |
| `uiTemplate` | Function binding | [apps/web/src/i18n.ts:116](../../apps/web/src/i18n.ts) |
| `uiScopedTemplate` | Function binding | [apps/web/src/i18n.ts:117](../../apps/web/src/i18n.ts) |
| `BookRecord` | InterfaceDeclaration | [apps/web/src/pages/BookEllam.tsx:39](../../apps/web/src/pages/BookEllam.tsx) |
| `BookEllam` | FunctionDeclaration | [apps/web/src/pages/BookEllam.tsx:52](../../apps/web/src/pages/BookEllam.tsx) |
| `exportToCSV` | Function binding | [apps/web/src/pages/BookEllam.tsx:226](../../apps/web/src/pages/BookEllam.tsx) |
| `TaxonomyEditor` | FunctionDeclaration | [apps/web/src/pages/CatalogueTaxonomy.tsx:10](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `save` | Function binding | [apps/web/src/pages/CatalogueTaxonomy.tsx:16](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `archive` | Function binding | [apps/web/src/pages/CatalogueTaxonomy.tsx:26](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `CatalogueTaxonomy` | FunctionDeclaration | [apps/web/src/pages/CatalogueTaxonomy.tsx:49](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `SummaryResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:38](../../apps/web/src/pages/CommandCenter.tsx) |
| `MachineResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:50](../../apps/web/src/pages/CommandCenter.tsx) |
| `InspectionResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:56](../../apps/web/src/pages/CommandCenter.tsx) |
| `InwardResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:61](../../apps/web/src/pages/CommandCenter.tsx) |
| `OutwardResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:73](../../apps/web/src/pages/CommandCenter.tsx) |
| `ProductionResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:83](../../apps/web/src/pages/CommandCenter.tsx) |
| `formatQuantity` | FunctionDeclaration | [apps/web/src/pages/CommandCenter.tsx:95](../../apps/web/src/pages/CommandCenter.tsx) |
| `buildKpiCards` | FunctionDeclaration | [apps/web/src/pages/CommandCenter.tsx:101](../../apps/web/src/pages/CommandCenter.tsx) |
| `buildFeedEvents` | FunctionDeclaration | [apps/web/src/pages/CommandCenter.tsx:180](../../apps/web/src/pages/CommandCenter.tsx) |
| `MachineDetailDialog` | Function binding | [apps/web/src/pages/CommandCenter.tsx:249](../../apps/web/src/pages/CommandCenter.tsx) |
| `CommandCenterProps` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:421](../../apps/web/src/pages/CommandCenter.tsx) |
| `CommandCenter` | Function binding | [apps/web/src/pages/CommandCenter.tsx:425](../../apps/web/src/pages/CommandCenter.tsx) |
| `CommerceDesk` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:19](../../apps/web/src/pages/CommerceDesk.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:44](../../apps/web/src/pages/CommerceDesk.tsx) |
| `emptyItem` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:45](../../apps/web/src/pages/CommerceDesk.tsx) |
| `emptyCustomer` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:46](../../apps/web/src/pages/CommerceDesk.tsx) |
| `emptySales` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:49](../../apps/web/src/pages/CommerceDesk.tsx) |
| `guarded` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:53](../../apps/web/src/pages/CommerceDesk.tsx) |
| `amountError` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:55](../../apps/web/src/pages/CommerceDesk.tsx) |
| `customerField` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:60](../../apps/web/src/pages/CommerceDesk.tsx) |
| `editItem` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:63](../../apps/web/src/pages/CommerceDesk.tsx) |
| `editCustomer` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:64](../../apps/web/src/pages/CommerceDesk.tsx) |
| `submitInvoice` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:67](../../apps/web/src/pages/CommerceDesk.tsx) |
| `convertOrder` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:97](../../apps/web/src/pages/CommerceDesk.tsx) |
| `lineEditor` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:99](../../apps/web/src/pages/CommerceDesk.tsx) |
| `CommerceReports` | Function binding | [apps/web/src/pages/CommerceReports.tsx:55](../../apps/web/src/pages/CommerceReports.tsx) |
| `handleRefresh` | Function binding | [apps/web/src/pages/CommerceReports.tsx:81](../../apps/web/src/pages/CommerceReports.tsx) |
| `handlePrint` | Function binding | [apps/web/src/pages/CommerceReports.tsx:90](../../apps/web/src/pages/CommerceReports.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Costing.tsx:51](../../apps/web/src/pages/Costing.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/Costing.tsx:57](../../apps/web/src/pages/Costing.tsx) |
| `CostingKPI` | InterfaceDeclaration | [apps/web/src/pages/Costing.tsx:67](../../apps/web/src/pages/Costing.tsx) |
| `Costing` | Function binding | [apps/web/src/pages/Costing.tsx:76](../../apps/web/src/pages/Costing.tsx) |
| `getFilteredEntries` | Function binding | [apps/web/src/pages/Costing.tsx:117](../../apps/web/src/pages/Costing.tsx) |
| `handleSuccess` | Function binding | [apps/web/src/pages/Costing.tsx:197](../../apps/web/src/pages/Costing.tsx) |
| `handleItemSaved` | Function binding | [apps/web/src/pages/Costing.tsx:202](../../apps/web/src/pages/Costing.tsx) |
| `handleDeleteEntry` | Function binding | [apps/web/src/pages/Costing.tsx:206](../../apps/web/src/pages/Costing.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/CostingEntry.tsx:25](../../apps/web/src/pages/CostingEntry.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/CostingEntry.tsx:31](../../apps/web/src/pages/CostingEntry.tsx) |
| `CostingEntryProps` | InterfaceDeclaration | [apps/web/src/pages/CostingEntry.tsx:41](../../apps/web/src/pages/CostingEntry.tsx) |
| `CostingEntry` | Function binding | [apps/web/src/pages/CostingEntry.tsx:50](../../apps/web/src/pages/CostingEntry.tsx) |
| `handleDelete` | Function binding | [apps/web/src/pages/CostingEntry.tsx:239](../../apps/web/src/pages/CostingEntry.tsx) |
| `once` | Function binding | [apps/web/src/pages/CostingEntry.tsx:252](../../apps/web/src/pages/CostingEntry.tsx) |
| `KPI` | InterfaceDeclaration | [apps/web/src/pages/Dashboard.tsx:63](../../apps/web/src/pages/Dashboard.tsx) |
| `DashboardSummary` | InterfaceDeclaration | [apps/web/src/pages/Dashboard.tsx:73](../../apps/web/src/pages/Dashboard.tsx) |
| `DashboardProps` | InterfaceDeclaration | [apps/web/src/pages/Dashboard.tsx:78](../../apps/web/src/pages/Dashboard.tsx) |
| `useCountUp` | FunctionDeclaration | [apps/web/src/pages/Dashboard.tsx:84](../../apps/web/src/pages/Dashboard.tsx) |
| `step` | Function binding | [apps/web/src/pages/Dashboard.tsx:91](../../apps/web/src/pages/Dashboard.tsx) |
| `Sparkline` | Function binding | [apps/web/src/pages/Dashboard.tsx:108](../../apps/web/src/pages/Dashboard.tsx) |
| `ActivityIcon` | Function binding | [apps/web/src/pages/Dashboard.tsx:132](../../apps/web/src/pages/Dashboard.tsx) |
| `groupByDay` | FunctionDeclaration | [apps/web/src/pages/Dashboard.tsx:148](../../apps/web/src/pages/Dashboard.tsx) |
| `CustomTooltip` | Function binding | [apps/web/src/pages/Dashboard.tsx:169](../../apps/web/src/pages/Dashboard.tsx) |
| `CostTooltip` | Function binding | [apps/web/src/pages/Dashboard.tsx:189](../../apps/web/src/pages/Dashboard.tsx) |
| `DonutCentreLabel` | Function binding | [apps/web/src/pages/Dashboard.tsx:211](../../apps/web/src/pages/Dashboard.tsx) |
| `EfficiencyStat` | Function binding | [apps/web/src/pages/Dashboard.tsx:226](../../apps/web/src/pages/Dashboard.tsx) |
| `Dashboard` | Function binding | [apps/web/src/pages/Dashboard.tsx:252](../../apps/web/src/pages/Dashboard.tsx) |
| `navigate` | Function binding | [apps/web/src/pages/Dashboard.tsx:254](../../apps/web/src/pages/Dashboard.tsx) |
| `getDateRange` | Function binding | [apps/web/src/pages/Dashboard.tsx:259](../../apps/web/src/pages/Dashboard.tsx) |
| `handleDateFilterChange` | Function binding | [apps/web/src/pages/Dashboard.tsx:311](../../apps/web/src/pages/Dashboard.tsx) |
| `formatDate` | Function binding | [apps/web/src/pages/Dashboard.tsx:315](../../apps/web/src/pages/Dashboard.tsx) |
| `formatRelativeTime` | Function binding | [apps/web/src/pages/Dashboard.tsx:319](../../apps/web/src/pages/Dashboard.tsx) |
| `KpiSkeleton` | Function binding | [apps/web/src/pages/Dashboard.tsx:366](../../apps/web/src/pages/Dashboard.tsx) |
| `QuickAction` | Function binding | [apps/web/src/pages/Dashboard.tsx:374](../../apps/web/src/pages/Dashboard.tsx) |
| `failureMessage` | Function binding | [apps/web/src/pages/Helpdesk.tsx:96](../../apps/web/src/pages/Helpdesk.tsx) |
| `Helpdesk` | FunctionDeclaration | [apps/web/src/pages/Helpdesk.tsx:105](../../apps/web/src/pages/Helpdesk.tsx) |
| `linkedTicket` | Function binding | [apps/web/src/pages/Helpdesk.tsx:118](../../apps/web/src/pages/Helpdesk.tsx) |
| `pop` | Function binding | [apps/web/src/pages/Helpdesk.tsx:130](../../apps/web/src/pages/Helpdesk.tsx) |
| `resetPage` | Function binding | [apps/web/src/pages/Helpdesk.tsx:139](../../apps/web/src/pages/Helpdesk.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Insights.tsx:35](../../apps/web/src/pages/Insights.tsx) |
| `TabPanel` | Function binding | [apps/web/src/pages/Insights.tsx:41](../../apps/web/src/pages/Insights.tsx) |
| `ReportsTab` | Function binding | [apps/web/src/pages/Insights.tsx:78](../../apps/web/src/pages/Insights.tsx) |
| `InsightsTab` | Function binding | [apps/web/src/pages/Insights.tsx:121](../../apps/web/src/pages/Insights.tsx) |
| `Insights` | Function binding | [apps/web/src/pages/Insights.tsx:243](../../apps/web/src/pages/Insights.tsx) |
| `download` | FunctionDeclaration | [apps/web/src/pages/Integrations.tsx:48](../../apps/web/src/pages/Integrations.tsx) |
| `errorMessage` | FunctionDeclaration | [apps/web/src/pages/Integrations.tsx:56](../../apps/web/src/pages/Integrations.tsx) |
| `Integrations` | FunctionDeclaration | [apps/web/src/pages/Integrations.tsx:108](../../apps/web/src/pages/Integrations.tsx) |
| `invalidate` | Function binding | [apps/web/src/pages/Integrations.tsx:150](../../apps/web/src/pages/Integrations.tsx) |
| `run` | Function binding | [apps/web/src/pages/Integrations.tsx:157](../../apps/web/src/pages/Integrations.tsx) |
| `template` | Function binding | [apps/web/src/pages/Integrations.tsx:173](../../apps/web/src/pages/Integrations.tsx) |
| `choose` | Function binding | [apps/web/src/pages/Integrations.tsx:192](../../apps/web/src/pages/Integrations.tsx) |
| `normalize` | Function binding | [apps/web/src/pages/Integrations.tsx:202](../../apps/web/src/pages/Integrations.tsx) |
| `check` | Function binding | [apps/web/src/pages/Integrations.tsx:214](../../apps/web/src/pages/Integrations.tsx) |
| `commit` | Function binding | [apps/web/src/pages/Integrations.tsx:222](../../apps/web/src/pages/Integrations.tsx) |
| `resetExport` | Function binding | [apps/web/src/pages/Integrations.tsx:263](../../apps/web/src/pages/Integrations.tsx) |
| `exportXml` | Function binding | [apps/web/src/pages/Integrations.tsx:267](../../apps/web/src/pages/Integrations.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:69](../../apps/web/src/pages/Inventory.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/Inventory.tsx:75](../../apps/web/src/pages/Inventory.tsx) |
| `InventoryKPI` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:91](../../apps/web/src/pages/Inventory.tsx) |
| `InventoryItem` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:100](../../apps/web/src/pages/Inventory.tsx) |
| `InventoryProps` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:115](../../apps/web/src/pages/Inventory.tsx) |
| `formatRef` | FunctionDeclaration | [apps/web/src/pages/Inventory.tsx:128](../../apps/web/src/pages/Inventory.tsx) |
| `Inventory` | Function binding | [apps/web/src/pages/Inventory.tsx:146](../../apps/web/src/pages/Inventory.tsx) |
| `handleDeleteWaste` | Function binding | [apps/web/src/pages/Inventory.tsx:161](../../apps/web/src/pages/Inventory.tsx) |
| `handleWasteSubmit` | Function binding | [apps/web/src/pages/Inventory.tsx:180](../../apps/web/src/pages/Inventory.tsx) |
| `handleDateFilterChange` | Function binding | [apps/web/src/pages/Inventory.tsx:205](../../apps/web/src/pages/Inventory.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/Inventory.tsx:260](../../apps/web/src/pages/Inventory.tsx) |
| `renderMovementTable` | Function binding | [apps/web/src/pages/Inventory.tsx:287](../../apps/web/src/pages/Inventory.tsx) |
| `BatchEntry` | InterfaceDeclaration | [apps/web/src/pages/InwardEntry.tsx:79](../../apps/web/src/pages/InwardEntry.tsx) |
| `InwardEntryProps` | InterfaceDeclaration | [apps/web/src/pages/InwardEntry.tsx:94](../../apps/web/src/pages/InwardEntry.tsx) |
| `InwardEntry` | Function binding | [apps/web/src/pages/InwardEntry.tsx:99](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleDateFilterChange` | Function binding | [apps/web/src/pages/InwardEntry.tsx:145](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleInputChange` | Function binding | [apps/web/src/pages/InwardEntry.tsx:147](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleSupplierChange` | Function binding | [apps/web/src/pages/InwardEntry.tsx:153](../../apps/web/src/pages/InwardEntry.tsx) |
| `getFieldError` | Function binding | [apps/web/src/pages/InwardEntry.tsx:168](../../apps/web/src/pages/InwardEntry.tsx) |
| `markAllTouched` | Function binding | [apps/web/src/pages/InwardEntry.tsx:173](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleDeleteBatch` | Function binding | [apps/web/src/pages/InwardEntry.tsx:177](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleSubmit` | Function binding | [apps/web/src/pages/InwardEntry.tsx:196](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleMergeBatches` | Function binding | [apps/web/src/pages/InwardEntry.tsx:237](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/InwardEntry.tsx:271](../../apps/web/src/pages/InwardEntry.tsx) |
| `JobWork` | Function binding | [apps/web/src/pages/JobWork.tsx:91](../../apps/web/src/pages/JobWork.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/JobWork.tsx:131](../../apps/web/src/pages/JobWork.tsx) |
| `once` | Function binding | [apps/web/src/pages/JobWork.tsx:143](../../apps/web/src/pages/JobWork.tsx) |
| `openReceipt` | Function binding | [apps/web/src/pages/JobWork.tsx:202](../../apps/web/src/pages/JobWork.tsx) |
| `LogEntry` | InterfaceDeclaration | [apps/web/src/pages/Logs.tsx:37](../../apps/web/src/pages/Logs.tsx) |
| `LogsProps` | InterfaceDeclaration | [apps/web/src/pages/Logs.tsx:48](../../apps/web/src/pages/Logs.tsx) |
| `Logs` | Function binding | [apps/web/src/pages/Logs.tsx:80](../../apps/web/src/pages/Logs.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/Logs.tsx:121](../../apps/web/src/pages/Logs.tsx) |
| `newRow` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:60](../../apps/web/src/pages/OperationsDesk.tsx) |
| `OperationsDesk` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:62](../../apps/web/src/pages/OperationsDesk.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:119](../../apps/web/src/pages/OperationsDesk.tsx) |
| `once` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:128](../../apps/web/src/pages/OperationsDesk.tsx) |
| `print` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:201](../../apps/web/src/pages/OperationsDesk.tsx) |
| `OutwardItem` | InterfaceDeclaration | [apps/web/src/pages/OutwardEntry.tsx:64](../../apps/web/src/pages/OutwardEntry.tsx) |
| `OutwardEntryProps` | InterfaceDeclaration | [apps/web/src/pages/OutwardEntry.tsx:71](../../apps/web/src/pages/OutwardEntry.tsx) |
| `OutwardEntry` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:76](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleMenuOpen` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:88](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleMenuClose` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:92](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleFilterChange` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:96](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleExportAction` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:104](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleItemChange` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:138](../../apps/web/src/pages/OutwardEntry.tsx) |
| `addItemRow` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:152](../../apps/web/src/pages/OutwardEntry.tsx) |
| `removeItemRow` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:157](../../apps/web/src/pages/OutwardEntry.tsx) |
| `getTotalBags` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:163](../../apps/web/src/pages/OutwardEntry.tsx) |
| `getTotalWeight` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:164](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleSave` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:166](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleDeleteOutward` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:257](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:270](../../apps/web/src/pages/OutwardEntry.tsx) |
| `ConsumptionItem` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:69](../../apps/web/src/pages/ProductionEntry.tsx) |
| `ProductionItem` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:76](../../apps/web/src/pages/ProductionEntry.tsx) |
| `WasteBreakdown` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:84](../../apps/web/src/pages/ProductionEntry.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:91](../../apps/web/src/pages/ProductionEntry.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/ProductionEntry.tsx:97](../../apps/web/src/pages/ProductionEntry.tsx) |
| `ProductionEntryProps` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:113](../../apps/web/src/pages/ProductionEntry.tsx) |
| `ProductionEntry` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:118](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getAvailableConsumption` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:198](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleConsumedChange` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:209](../../apps/web/src/pages/ProductionEntry.tsx) |
| `addConsumed` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:222](../../apps/web/src/pages/ProductionEntry.tsx) |
| `removeConsumed` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:227](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleProducedChange` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:234](../../apps/web/src/pages/ProductionEntry.tsx) |
| `addProduced` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:249](../../apps/web/src/pages/ProductionEntry.tsx) |
| `removeProduced` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:254](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleWasteChange` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:261](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalConsumed` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:265](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalProduced` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:269](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalWaste` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:273](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalIntermediate` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:277](../../apps/web/src/pages/ProductionEntry.tsx) |
| `validateStart` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:279](../../apps/web/src/pages/ProductionEntry.tsx) |
| `checkBatchTiming` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:286](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleNext` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:300](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleBack` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:349](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleSave` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:353](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleDeleteProduction` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:403](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleCloseWizard` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:426](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleOpenWizard` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:442](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:448](../../apps/web/src/pages/ProductionEntry.tsx) |
| `SecuritySettings` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:40](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleVerifyTotp` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:66](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleChangePassword` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:83](../../apps/web/src/pages/SecuritySettings.tsx) |
| `SessionManagement` | FunctionDeclaration | [apps/web/src/pages/SessionManagement.tsx:26](../../apps/web/src/pages/SessionManagement.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Settings.tsx:36](../../apps/web/src/pages/Settings.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/Settings.tsx:42](../../apps/web/src/pages/Settings.tsx) |
| `SettingsProps` | InterfaceDeclaration | [apps/web/src/pages/Settings.tsx:52](../../apps/web/src/pages/Settings.tsx) |
| `Settings` | Function binding | [apps/web/src/pages/Settings.tsx:68](../../apps/web/src/pages/Settings.tsx) |
| `handleSaveCompanySettings` | Function binding | [apps/web/src/pages/Settings.tsx:165](../../apps/web/src/pages/Settings.tsx) |
| `handleSaveRates` | Function binding | [apps/web/src/pages/Settings.tsx:188](../../apps/web/src/pages/Settings.tsx) |
| `handleSaveSystemSettings` | Function binding | [apps/web/src/pages/Settings.tsx:215](../../apps/web/src/pages/Settings.tsx) |
| `SharedPayments` | FunctionDeclaration | [apps/web/src/pages/SharedPayments.tsx:7](../../apps/web/src/pages/SharedPayments.tsx) |
| `download` | Function binding | [apps/web/src/pages/SharedPayments.tsx:12](../../apps/web/src/pages/SharedPayments.tsx) |
| `money` | Function binding | [apps/web/src/pages/ShopPortal.tsx:15](../../apps/web/src/pages/ShopPortal.tsx) |
| `ShopPortal` | FunctionDeclaration | [apps/web/src/pages/ShopPortal.tsx:22](../../apps/web/src/pages/ShopPortal.tsx) |
| `quantityFor` | Function binding | [apps/web/src/pages/ShopPortal.tsx:50](../../apps/web/src/pages/ShopPortal.tsx) |
| `setQuantity` | Function binding | [apps/web/src/pages/ShopPortal.tsx:51](../../apps/web/src/pages/ShopPortal.tsx) |
| `placeOrder` | Function binding | [apps/web/src/pages/ShopPortal.tsx:57](../../apps/web/src/pages/ShopPortal.tsx) |
| `switchLanguage` | Function binding | [apps/web/src/pages/ShopPortal.tsx:68](../../apps/web/src/pages/ShopPortal.tsx) |
| `money` | Function binding | [apps/web/src/pages/Store.tsx:12](../../apps/web/src/pages/Store.tsx) |
| `Store` | FunctionDeclaration | [apps/web/src/pages/Store.tsx:14](../../apps/web/src/pages/Store.tsx) |
| `changeQuantity` | Function binding | [apps/web/src/pages/Store.tsx:27](../../apps/web/src/pages/Store.tsx) |
| `reserveOrder` | Function binding | [apps/web/src/pages/Store.tsx:36](../../apps/web/src/pages/Store.tsx) |
| `TodayDashboardProps` | InterfaceDeclaration | [apps/web/src/pages/TodayDashboard.tsx:60](../../apps/web/src/pages/TodayDashboard.tsx) |
| `TodayDashboard` | Function binding | [apps/web/src/pages/TodayDashboard.tsx:64](../../apps/web/src/pages/TodayDashboard.tsx) |
| `navigate` | Function binding | [apps/web/src/pages/TodayDashboard.tsx:68](../../apps/web/src/pages/TodayDashboard.tsx) |
| `handleRefresh` | Function binding | [apps/web/src/pages/TodayDashboard.tsx:88](../../apps/web/src/pages/TodayDashboard.tsx) |
| `ChapterCard` | Function binding | [apps/web/src/pages/Tutorial.tsx:174](../../apps/web/src/pages/Tutorial.tsx) |
| `Tutorial` | Function binding | [apps/web/src/pages/Tutorial.tsx:193](../../apps/web/src/pages/Tutorial.tsx) |
| `handleStepComplete` | Function binding | [apps/web/src/pages/Tutorial.tsx:214](../../apps/web/src/pages/Tutorial.tsx) |
| `handleChapterChange` | Function binding | [apps/web/src/pages/Tutorial.tsx:224](../../apps/web/src/pages/Tutorial.tsx) |
| `UnifiedWorkspaceProps` | InterfaceDeclaration | [apps/web/src/pages/UnifiedWorkspace.tsx:103](../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| `UnifiedWorkspace` | Function binding | [apps/web/src/pages/UnifiedWorkspace.tsx:108](../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| `money` | Function binding | [apps/web/src/pages/UnifiedWorkspace.tsx:128](../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| `User` | InterfaceDeclaration | [apps/web/src/pages/UserManagement.tsx:60](../../apps/web/src/pages/UserManagement.tsx) |
| `UserManagementProps` | InterfaceDeclaration | [apps/web/src/pages/UserManagement.tsx:76](../../apps/web/src/pages/UserManagement.tsx) |
| `UserManagement` | Function binding | [apps/web/src/pages/UserManagement.tsx:87](../../apps/web/src/pages/UserManagement.tsx) |
| `saveView` | Function binding | [apps/web/src/pages/UserManagement.tsx:103](../../apps/web/src/pages/UserManagement.tsx) |
| `restoreView` | Function binding | [apps/web/src/pages/UserManagement.tsx:107](../../apps/web/src/pages/UserManagement.tsx) |
| `clearFilters` | Function binding | [apps/web/src/pages/UserManagement.tsx:160](../../apps/web/src/pages/UserManagement.tsx) |
| `exportUsers` | Function binding | [apps/web/src/pages/UserManagement.tsx:161](../../apps/web/src/pages/UserManagement.tsx) |
| `handleOpenDialog` | Function binding | [apps/web/src/pages/UserManagement.tsx:213](../../apps/web/src/pages/UserManagement.tsx) |
| `handleCloseDialog` | Function binding | [apps/web/src/pages/UserManagement.tsx:237](../../apps/web/src/pages/UserManagement.tsx) |
| `handleSubmit` | Function binding | [apps/web/src/pages/UserManagement.tsx:246](../../apps/web/src/pages/UserManagement.tsx) |
| `handleDelete` | Function binding | [apps/web/src/pages/UserManagement.tsx:275](../../apps/web/src/pages/UserManagement.tsx) |
| `getRoleColor` | Function binding | [apps/web/src/pages/UserManagement.tsx:281](../../apps/web/src/pages/UserManagement.tsx) |
| `field` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:14](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `titleCase` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:47](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `fmt` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:48](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `WorkflowDesk` | FunctionDeclaration | [apps/web/src/pages/WorkflowDesk.tsx:50](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `byKind` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:57](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `label` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:59](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `open` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:70](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `change` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:71](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `submit` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:78](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `changeLine` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:93](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `handleRelease` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:94](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `CommerceReport` | InterfaceDeclaration | [apps/web/src/pages/yarn/ComplianceReports.tsx:16](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `PayrollEntry` | InterfaceDeclaration | [apps/web/src/pages/yarn/ComplianceReports.tsx:21](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `ComplianceReports` | Function binding | [apps/web/src/pages/yarn/ComplianceReports.tsx:25](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/yarn/ComplianceReports.tsx:42](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `SalesOrder` | InterfaceDeclaration | [apps/web/src/pages/yarn/DemandForecasting.tsx:41](../../apps/web/src/pages/yarn/DemandForecasting.tsx) |
| `ForecastRow` | InterfaceDeclaration | [apps/web/src/pages/yarn/DemandForecasting.tsx:48](../../apps/web/src/pages/yarn/DemandForecasting.tsx) |
| `DemandForecasting` | Function binding | [apps/web/src/pages/yarn/DemandForecasting.tsx:56](../../apps/web/src/pages/yarn/DemandForecasting.tsx) |
| `Staff` | InterfaceDeclaration | [apps/web/src/pages/yarn/HRManagement.tsx:43](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `PayrollEntry` | InterfaceDeclaration | [apps/web/src/pages/yarn/HRManagement.tsx:57](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `HRManagement` | Function binding | [apps/web/src/pages/yarn/HRManagement.tsx:94](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `handleStaffSelectForPayroll` | Function binding | [apps/web/src/pages/yarn/HRManagement.tsx:183](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `STAT_CARDS` | Function binding | [apps/web/src/pages/yarn/LiveDashboard.tsx:40](../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| `LiveDashboard` | Function binding | [apps/web/src/pages/yarn/LiveDashboard.tsx:47](../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| `handleRefresh` | Function binding | [apps/web/src/pages/yarn/LiveDashboard.tsx:68](../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| `Machine` | InterfaceDeclaration | [apps/web/src/pages/yarn/MachineManagement.tsx:42](../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| `MachineInspection` | InterfaceDeclaration | [apps/web/src/pages/yarn/MachineManagement.tsx:54](../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| `MachineManagement` | Function binding | [apps/web/src/pages/yarn/MachineManagement.tsx:85](../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| `QualityInspection` | InterfaceDeclaration | [apps/web/src/pages/yarn/QualityControl.tsx:39](../../apps/web/src/pages/yarn/QualityControl.tsx) |
| `QualityControl` | Function binding | [apps/web/src/pages/yarn/QualityControl.tsx:73](../../apps/web/src/pages/yarn/QualityControl.tsx) |
| `ShiftManagement` | Function binding | [apps/web/src/pages/yarn/ShiftManagement.tsx:33](../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| `handleOpen` | Function binding | [apps/web/src/pages/yarn/ShiftManagement.tsx:56](../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| `SupplierPortal` | Function binding | [apps/web/src/pages/yarn/SupplierPortal.tsx:29](../../apps/web/src/pages/yarn/SupplierPortal.tsx) |
| `WarehouseLocation` | InterfaceDeclaration | [apps/web/src/pages/yarn/WarehouseManagement.tsx:40](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| `WarehouseMovement` | InterfaceDeclaration | [apps/web/src/pages/yarn/WarehouseManagement.tsx:48](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| `WarehouseManagement` | Function binding | [apps/web/src/pages/yarn/WarehouseManagement.tsx:76](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| `IntrinsicElements` | InterfaceDeclaration | [apps/web/src/r3f-support.d.ts:5](../../apps/web/src/r3f-support.d.ts) |
| `Matchers` | InterfaceDeclaration | [apps/web/src/test/setup.ts:13](../../apps/web/src/test/setup.ts) |
| `ThemePalette` | InterfaceDeclaration | [apps/web/src/theme.ts:6](../../apps/web/src/theme.ts) |
| `getTheme` | Function binding | [apps/web/src/theme.ts:64](../../apps/web/src/theme.ts) |
| `paginationNumber` | Function binding | [apps/web/src/theme.ts:67](../../apps/web/src/theme.ts) |
| `lowStockThreshold` | FunctionDeclaration | [apps/web/src/utils/alerts.ts:5](../../apps/web/src/utils/alerts.ts) |
| `InvoiceForAlert` | InterfaceDeclaration | [apps/web/src/utils/alerts.ts:10](../../apps/web/src/utils/alerts.ts) |
| `overdueInvoices` | FunctionDeclaration | [apps/web/src/utils/alerts.ts:21](../../apps/web/src/utils/alerts.ts) |
| `hasProductionOn` | FunctionDeclaration | [apps/web/src/utils/alerts.ts:34](../../apps/web/src/utils/alerts.ts) |
| `setMutationListener` | Function binding | [apps/web/src/utils/api.ts:5](../../apps/web/src/utils/api.ts) |
| `getToken` | Function binding | [apps/web/src/utils/authStorage.ts:2](../../apps/web/src/utils/authStorage.ts) |
| `getStoredUser` | Function binding | [apps/web/src/utils/authStorage.ts:4](../../apps/web/src/utils/authStorage.ts) |
| `clearAuth` | FunctionDeclaration | [apps/web/src/utils/authStorage.ts:6](../../apps/web/src/utils/authStorage.ts) |
| `saveSession` | FunctionDeclaration | [apps/web/src/utils/authStorage.ts:12](../../apps/web/src/utils/authStorage.ts) |
| `saveUser` | FunctionDeclaration | [apps/web/src/utils/authStorage.ts:18](../../apps/web/src/utils/authStorage.ts) |
| `padZero` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:10](../../apps/web/src/utils/codeFormatters.ts) |
| `formatDateCompact` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:16](../../apps/web/src/utils/codeFormatters.ts) |
| `generateRandomSuffix` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:24](../../apps/web/src/utils/codeFormatters.ts) |
| `formatBatchCode` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:36](../../apps/web/src/utils/codeFormatters.ts) |
| `formatBagCode` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:45](../../apps/web/src/utils/codeFormatters.ts) |
| `formatOutwardCode` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:54](../../apps/web/src/utils/codeFormatters.ts) |
| `buildBatchQRPayload` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:63](../../apps/web/src/utils/codeFormatters.ts) |
| `buildBagQRPayload` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:85](../../apps/web/src/utils/codeFormatters.ts) |
| `buildOutwardQRPayload` | FunctionDeclaration | [apps/web/src/utils/codeFormatters.ts:107](../../apps/web/src/utils/codeFormatters.ts) |
| `toNumber` | Function binding | [apps/web/src/utils/costingPayloads.ts:8](../../apps/web/src/utils/costingPayloads.ts) |
| `toShifts` | Function binding | [apps/web/src/utils/costingPayloads.ts:9](../../apps/web/src/utils/costingPayloads.ts) |
| `ebCostPayload` | Function binding | [apps/web/src/utils/costingPayloads.ts:11](../../apps/web/src/utils/costingPayloads.ts) |
| `employeeCostPayload` | Function binding | [apps/web/src/utils/costingPayloads.ts:18](../../apps/web/src/utils/costingPayloads.ts) |
| `packagingCostPayload` | Function binding | [apps/web/src/utils/costingPayloads.ts:26](../../apps/web/src/utils/costingPayloads.ts) |
| `maintenanceCostPayload` | Function binding | [apps/web/src/utils/costingPayloads.ts:32](../../apps/web/src/utils/costingPayloads.ts) |
| `expensePayload` | Function binding | [apps/web/src/utils/costingPayloads.ts:42](../../apps/web/src/utils/costingPayloads.ts) |
| `csvCell` | Function binding | [apps/web/src/utils/csvGenerator.ts:2](../../apps/web/src/utils/csvGenerator.ts) |
| `buildCSV` | Function binding | [apps/web/src/utils/csvGenerator.ts:10](../../apps/web/src/utils/csvGenerator.ts) |
| `generateCSV` | Function binding | [apps/web/src/utils/csvGenerator.ts:16](../../apps/web/src/utils/csvGenerator.ts) |
| `tableToCSV` | Function binding | [apps/web/src/utils/csvGenerator.ts:28](../../apps/web/src/utils/csvGenerator.ts) |
| `DateRange` | InterfaceDeclaration | [apps/web/src/utils/dateFilters.ts:14](../../apps/web/src/utils/dateFilters.ts) |
| `getDateRange` | FunctionDeclaration | [apps/web/src/utils/dateFilters.ts:28](../../apps/web/src/utils/dateFilters.ts) |
| `dateKey` | FunctionDeclaration | [apps/web/src/utils/dateKey.ts:4](../../apps/web/src/utils/dateKey.ts) |
| `DeleteGuardTrace` | InterfaceDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:5](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `DeleteGuardErrorPayload` | InterfaceDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:19](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `navigateToTab` | FunctionDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:34](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `handleDeleteGuardError` | FunctionDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:45](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `generateExcel` | Function binding | [apps/web/src/utils/excelGenerator.ts:4](../../apps/web/src/utils/excelGenerator.ts) |
| `downloadInvoicePdf` | FunctionDeclaration | [apps/web/src/utils/invoiceDocument.ts:13](../../apps/web/src/utils/invoiceDocument.ts) |
| `date` | Function binding | [apps/web/src/utils/invoiceDocument.ts:16](../../apps/web/src/utils/invoiceDocument.ts) |
| `didParseCell` | MethodDeclaration | [apps/web/src/utils/invoiceDocument.ts:54](../../apps/web/src/utils/invoiceDocument.ts) |
| `formatApiError` | Function binding | [apps/web/src/utils/messages.ts:221](../../apps/web/src/utils/messages.ts) |
| `translatedError` | Function binding | [apps/web/src/utils/messages.ts:223](../../apps/web/src/utils/messages.ts) |
| `formatSuccessMessage` | Function binding | [apps/web/src/utils/messages.ts:252](../../apps/web/src/utils/messages.ts) |
| `getCrudMessages` | Function binding | [apps/web/src/utils/messages.ts:263](../../apps/web/src/utils/messages.ts) |
| `canonicalPage` | FunctionDeclaration | [apps/web/src/utils/navigation.ts:2](../../apps/web/src/utils/navigation.ts) |
| `settingsTabFor` | FunctionDeclaration | [apps/web/src/utils/navigation.ts:18](../../apps/web/src/utils/navigation.ts) |
| `generatePDF` | Function binding | [apps/web/src/utils/pdfGenerator.ts:12](../../apps/web/src/utils/pdfGenerator.ts) |
| `localTimeValue` | FunctionDeclaration | [apps/web/src/utils/productionTiming.ts:1](../../apps/web/src/utils/productionTiming.ts) |
| `productionTimestamp` | FunctionDeclaration | [apps/web/src/utils/productionTiming.ts:5](../../apps/web/src/utils/productionTiming.ts) |
| `formatProductionTime` | FunctionDeclaration | [apps/web/src/utils/productionTiming.ts:11](../../apps/web/src/utils/productionTiming.ts) |
| `canAccessRole` | Function binding | [apps/web/src/utils/rbac.ts:7](../../apps/web/src/utils/rbac.ts) |
| `canManageUsers` | Function binding | [apps/web/src/utils/rbac.ts:16](../../apps/web/src/utils/rbac.ts) |
| `SoundEffectsManager` | ClassDeclaration | [apps/web/src/utils/sfx.ts:6](../../apps/web/src/utils/sfx.ts) |
| `isEnabled` | MethodDeclaration | [apps/web/src/utils/sfx.ts:17](../../apps/web/src/utils/sfx.ts) |
| `toggle` | MethodDeclaration | [apps/web/src/utils/sfx.ts:21](../../apps/web/src/utils/sfx.ts) |
| `setEnabled` | MethodDeclaration | [apps/web/src/utils/sfx.ts:32](../../apps/web/src/utils/sfx.ts) |
| `getContext` | MethodDeclaration | [apps/web/src/utils/sfx.ts:39](../../apps/web/src/utils/sfx.ts) |
| `playClick` | MethodDeclaration | [apps/web/src/utils/sfx.ts:56](../../apps/web/src/utils/sfx.ts) |
| `playChirp` | MethodDeclaration | [apps/web/src/utils/sfx.ts:79](../../apps/web/src/utils/sfx.ts) |
| `playModeSwitch` | MethodDeclaration | [apps/web/src/utils/sfx.ts:102](../../apps/web/src/utils/sfx.ts) |
| `playAlert` | MethodDeclaration | [apps/web/src/utils/sfx.ts:127](../../apps/web/src/utils/sfx.ts) |
| `ValidationResult` | InterfaceDeclaration | [apps/web/src/utils/validators.ts:9](../../apps/web/src/utils/validators.ts) |
| `isEmptyOrWhitespace` | Function binding | [apps/web/src/utils/validators.ts:16](../../apps/web/src/utils/validators.ts) |
| `clamp` | Function binding | [apps/web/src/utils/validators.ts:19](../../apps/web/src/utils/validators.ts) |
| `safeParseFloat` | Function binding | [apps/web/src/utils/validators.ts:22](../../apps/web/src/utils/validators.ts) |
| `todayStr` | Function binding | [apps/web/src/utils/validators.ts:31](../../apps/web/src/utils/validators.ts) |
| `isFutureDate` | Function binding | [apps/web/src/utils/validators.ts:35](../../apps/web/src/utils/validators.ts) |
| `isValidDate` | Function binding | [apps/web/src/utils/validators.ts:40](../../apps/web/src/utils/validators.ts) |
| `validateDate` | Function binding | [apps/web/src/utils/validators.ts:58](../../apps/web/src/utils/validators.ts) |
| `validateBale` | Function binding | [apps/web/src/utils/validators.ts:67](../../apps/web/src/utils/validators.ts) |
| `validateWeight` | Function binding | [apps/web/src/utils/validators.ts:76](../../apps/web/src/utils/validators.ts) |
| `validateBaleAndWeight` | Function binding | [apps/web/src/utils/validators.ts:84](../../apps/web/src/utils/validators.ts) |
| `validateSupplier` | Function binding | [apps/web/src/utils/validators.ts:95](../../apps/web/src/utils/validators.ts) |
| `validateVehicleNo` | Function binding | [apps/web/src/utils/validators.ts:107](../../apps/web/src/utils/validators.ts) |
| `validateProductionBalance` | Function binding | [apps/web/src/utils/validators.ts:119](../../apps/web/src/utils/validators.ts) |
| `validateBatchConsumption` | Function binding | [apps/web/src/utils/validators.ts:138](../../apps/web/src/utils/validators.ts) |
| `validateEfficiency` | Function binding | [apps/web/src/utils/validators.ts:151](../../apps/web/src/utils/validators.ts) |
| `validateBagCount` | Function binding | [apps/web/src/utils/validators.ts:161](../../apps/web/src/utils/validators.ts) |
| `validateCustomerName` | Function binding | [apps/web/src/utils/validators.ts:169](../../apps/web/src/utils/validators.ts) |
| `validatePaymentAmount` | Function binding | [apps/web/src/utils/validators.ts:179](../../apps/web/src/utils/validators.ts) |
| `validateGST` | Function binding | [apps/web/src/utils/validators.ts:188](../../apps/web/src/utils/validators.ts) |
| `validateRate` | Function binding | [apps/web/src/utils/validators.ts:195](../../apps/web/src/utils/validators.ts) |
| `validateUsername` | Function binding | [apps/web/src/utils/validators.ts:205](../../apps/web/src/utils/validators.ts) |
| `validatePassword` | Function binding | [apps/web/src/utils/validators.ts:217](../../apps/web/src/utils/validators.ts) |
| `validateCostAmount` | Function binding | [apps/web/src/utils/validators.ts:226](../../apps/web/src/utils/validators.ts) |
| `validateWorkingDays` | Function binding | [apps/web/src/utils/validators.ts:233](../../apps/web/src/utils/validators.ts) |
| `collectErrors` | Function binding | [apps/web/src/utils/validators.ts:244](../../apps/web/src/utils/validators.ts) |
| `hasErrors` | Function binding | [apps/web/src/utils/validators.ts:256](../../apps/web/src/utils/validators.ts) |
| `downloadWorkflowDocument` | FunctionDeclaration | [apps/web/src/utils/workflowDocument.ts:4](../../apps/web/src/utils/workflowDocument.ts) |
| `amount` | Function binding | [apps/web/src/utils/workflowDocument.ts:6](../../apps/web/src/utils/workflowDocument.ts) |
| `ImportMetaEnv` | InterfaceDeclaration | [apps/web/src/vite-env.d.ts:6](../../apps/web/src/vite-env.d.ts) |
| `ownerGroqEnvironment` | FunctionDeclaration | [packages/types/ai-server.ts:7](../../packages/types/ai-server.ts) |
| `AgentError` | ClassDeclaration | [packages/types/ai-server.ts:28](../../packages/types/ai-server.ts) |
| `systemPrompt` | Function binding | [packages/types/ai-server.ts:66](../../packages/types/ai-server.ts) |
| `GroqAgents` | ClassDeclaration | [packages/types/ai-server.ts:73](../../packages/types/ai-server.ts) |
| `key` | MethodDeclaration | [packages/types/ai-server.ts:81](../../packages/types/ai-server.ts) |
| `status` | MethodDeclaration | [packages/types/ai-server.ts:87](../../packages/types/ai-server.ts) |
| `limit` | MethodDeclaration | [packages/types/ai-server.ts:96](../../packages/types/ai-server.ts) |
| `chat` | MethodDeclaration | [packages/types/ai-server.ts:119](../../packages/types/ai-server.ts) |
| `CompanyProfile` | InterfaceDeclaration | [packages/types/company-profile.ts:7](../../packages/types/company-profile.ts) |
| `normalizeCompanyProfile` | FunctionDeclaration | [packages/types/company-profile.ts:48](../../packages/types/company-profile.ts) |
| `isCompanyPageVisible` | FunctionDeclaration | [packages/types/company-profile.ts:66](../../packages/types/company-profile.ts) |
| `GeoCoordinate` | InterfaceDeclaration | [packages/types/geo.ts:6](../../packages/types/geo.ts) |
| `GeoFence` | InterfaceDeclaration | [packages/types/geo.ts:14](../../packages/types/geo.ts) |
| `GeoVerificationRecord` | InterfaceDeclaration | [packages/types/geo.ts:21](../../packages/types/geo.ts) |
| `toRadians` | FunctionDeclaration | [packages/types/geo.ts:32](../../packages/types/geo.ts) |
| `calculateHaversineDistance` | FunctionDeclaration | [packages/types/geo.ts:40](../../packages/types/geo.ts) |
| `isWithinGeoFence` | FunctionDeclaration | [packages/types/geo.ts:82](../../packages/types/geo.ts) |
| `verifyGeoLocation` | FunctionDeclaration | [packages/types/geo.ts:96](../../packages/types/geo.ts) |
| `normalizeGstin` | Function binding | [packages/types/gst.ts:33](../../packages/types/gst.ts) |
| `isValidGstin` | Function binding | [packages/types/gst.ts:35](../../packages/types/gst.ts) |
| `gstinStateName` | FunctionDeclaration | [packages/types/gst.ts:38](../../packages/types/gst.ts) |
| `canonicalIndianState` | FunctionDeclaration | [packages/types/gst.ts:44](../../packages/types/gst.ts) |
| `isValidPhone` | FunctionDeclaration | [packages/types/gst.ts:52](../../packages/types/gst.ts) |
| `PartyContactInput` | InterfaceDeclaration | [packages/types/gst.ts:58](../../packages/types/gst.ts) |
| `PartyContactResult` | InterfaceDeclaration | [packages/types/gst.ts:59](../../packages/types/gst.ts) |
| `validatePartyContact` | FunctionDeclaration | [packages/types/gst.ts:67](../../packages/types/gst.ts) |
| `has` | Function binding | [packages/types/gst.ts:72](../../packages/types/gst.ts) |
| `blank` | Function binding | [packages/types/gst.ts:73](../../packages/types/gst.ts) |
| `ApiError` | InterfaceDeclaration | [packages/types/index.ts:14](../../packages/types/index.ts) |
| `SelectOption` | InterfaceDeclaration | [packages/types/index.ts:20](../../packages/types/index.ts) |
| `AuthenticatedUser` | InterfaceDeclaration | [packages/types/index.ts:25](../../packages/types/index.ts) |
| `SessionRecord` | InterfaceDeclaration | [packages/types/index.ts:33](../../packages/types/index.ts) |
| `StockMovement` | InterfaceDeclaration | [packages/types/index.ts:45](../../packages/types/index.ts) |
| `InvoiceLine` | InterfaceDeclaration | [packages/types/index.ts:57](../../packages/types/index.ts) |
| `InvoiceTotals` | InterfaceDeclaration | [packages/types/index.ts:68](../../packages/types/index.ts) |
| `CustomerSummary` | InterfaceDeclaration | [packages/types/index.ts:79](../../packages/types/index.ts) |
| `TodayDashboardSummary` | InterfaceDeclaration | [packages/types/index.ts:88](../../packages/types/index.ts) |
| `LeaseRequest` | InterfaceDeclaration | [packages/types/licensing-online.ts:26](../../packages/types/licensing-online.ts) |
| `OnlineGrant` | InterfaceDeclaration | [packages/types/licensing-online.ts:33](../../packages/types/licensing-online.ts) |
| `message` | Function binding | [packages/types/licensing-online.ts:38](../../packages/types/licensing-online.ts) |
| `renewalClaims` | FunctionDeclaration | [packages/types/licensing-online.ts:42](../../packages/types/licensing-online.ts) |
| `validateLeaseRequest` | FunctionDeclaration | [packages/types/licensing-online.ts:67](../../packages/types/licensing-online.ts) |
| `sealLease` | FunctionDeclaration | [packages/types/licensing-online.ts:111](../../packages/types/licensing-online.ts) |
| `issueOnlineLease` | FunctionDeclaration | [packages/types/licensing-online.ts:149](../../packages/types/licensing-online.ts) |
| `refreshInstallationLease` | FunctionDeclaration | [packages/types/licensing-online.ts:207](../../packages/types/licensing-online.ts) |
| `InstallationLicence` | InterfaceDeclaration | [packages/types/licensing.ts:16](../../packages/types/licensing.ts) |
| `installationId` | FunctionDeclaration | [packages/types/licensing.ts:30](../../packages/types/licensing.ts) |
| `verifyInstallationLicence` | FunctionDeclaration | [packages/types/licensing.ts:36](../../packages/types/licensing.ts) |
| `unprotectOwnerData` | FunctionDeclaration | [packages/types/licensing.ts:111](../../packages/types/licensing.ts) |
| `readInstallationPrivateKey` | FunctionDeclaration | [packages/types/licensing.ts:131](../../packages/types/licensing.ts) |
| `decodeEncryptedLicence` | FunctionDeclaration | [packages/types/licensing.ts:151](../../packages/types/licensing.ts) |
| `readProtectedLicence` | FunctionDeclaration | [packages/types/licensing.ts:198](../../packages/types/licensing.ts) |
| `readLicenceEnvelope` | FunctionDeclaration | [packages/types/licensing.ts:213](../../packages/types/licensing.ts) |
| `requireInstallationLicence` | FunctionDeclaration | [packages/types/licensing.ts:221](../../packages/types/licensing.ts) |
| `ownerHostEnvironment` | FunctionDeclaration | [packages/types/licensing.ts:240](../../packages/types/licensing.ts) |
| `ImportInput` | InterfaceDeclaration | [packages/types/migration.ts:9](../../packages/types/migration.ts) |
| `ImportIssue` | InterfaceDeclaration | [packages/types/migration.ts:10](../../packages/types/migration.ts) |
| `ImportPreview` | InterfaceDeclaration | [packages/types/migration.ts:11](../../packages/types/migration.ts) |
| `parseImportCsv` | FunctionDeclaration | [packages/types/migration.ts:15](../../packages/types/migration.ts) |
| `pushRow` | Function binding | [packages/types/migration.ts:19](../../packages/types/migration.ts) |
| `previewImport` | FunctionDeclaration | [packages/types/migration.ts:45](../../packages/types/migration.ts) |
| `issue` | Function binding | [packages/types/migration.ts:61](../../packages/types/migration.ts) |
| `WeighbridgeMeasurement` | InterfaceDeclaration | [packages/types/weighbridge.ts:3](../../packages/types/weighbridge.ts) |
| `WeighbridgeReceipt` | InterfaceDeclaration | [packages/types/weighbridge.ts:12](../../packages/types/weighbridge.ts) |
| `calculateWeighbridge` | FunctionDeclaration | [packages/types/weighbridge.ts:24](../../packages/types/weighbridge.ts) |
| `validNumber` | Function binding | [packages/types/weighbridge.ts:26](../../packages/types/weighbridge.ts) |
| `round` | Function binding | [packages/types/weighbridge.ts:33](../../packages/types/weighbridge.ts) |
