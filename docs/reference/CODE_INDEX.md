# Code ownership and function index

Generated declarations and methods from active API, web and shared source. Nested callbacks are not separate public contracts. Use this index to locate implementation; acceptance evidence lives in the tests.

| Symbol | Kind | Source |
| --- | --- | --- |
| `AppController` | ClassDeclaration | [apps/api/src/app.controller.ts:7](../../apps/api/src/app.controller.ts) |
| `index` | MethodDeclaration | [apps/api/src/app.controller.ts:11](../../apps/api/src/app.controller.ts) |
| `health` | MethodDeclaration | [apps/api/src/app.controller.ts:18](../../apps/api/src/app.controller.ts) |
| `status` | MethodDeclaration | [apps/api/src/app.controller.ts:25](../../apps/api/src/app.controller.ts) |
| `probe` | MethodDeclaration | [apps/api/src/app.controller.ts:31](../../apps/api/src/app.controller.ts) |
| `AppModule` | ClassDeclaration | [apps/api/src/app.module.ts:32](../../apps/api/src/app.module.ts) |
| `ProcessorInfo` | InterfaceDeclaration | [apps/api/src/app.service.ts:4](../../apps/api/src/app.service.ts) |
| `PublicHealth` | InterfaceDeclaration | [apps/api/src/app.service.ts:16](../../apps/api/src/app.service.ts) |
| `SystemHealthData` | InterfaceDeclaration | [apps/api/src/app.service.ts:23](../../apps/api/src/app.service.ts) |
| `AppService` | ClassDeclaration | [apps/api/src/app.service.ts:63](../../apps/api/src/app.service.ts) |
| `getHello` | MethodDeclaration | [apps/api/src/app.service.ts:69](../../apps/api/src/app.service.ts) |
| `formatUptime` | MethodDeclaration | [apps/api/src/app.service.ts:73](../../apps/api/src/app.service.ts) |
| `getPublicHealth` | MethodDeclaration | [apps/api/src/app.service.ts:90](../../apps/api/src/app.service.ts) |
| `getHealthData` | MethodDeclaration | [apps/api/src/app.service.ts:106](../../apps/api/src/app.service.ts) |
| `Public` | Function binding | [apps/api/src/decorators/public.decorator.ts:4](../../apps/api/src/decorators/public.decorator.ts) |
| `Roles` | Function binding | [apps/api/src/decorators/roles.decorator.ts:4](../../apps/api/src/decorators/roles.decorator.ts) |
| `BusinessActionFilter` | ClassDeclaration | [apps/api/src/filters/business-action.filter.ts:6](../../apps/api/src/filters/business-action.filter.ts) |
| `catch` | MethodDeclaration | [apps/api/src/filters/business-action.filter.ts:9](../../apps/api/src/filters/business-action.filter.ts) |
| `escapeHtml` | FunctionDeclaration | [apps/api/src/filters/not-found-exception.filter.ts:10](../../apps/api/src/filters/not-found-exception.filter.ts) |
| `NotFoundExceptionFilter` | ClassDeclaration | [apps/api/src/filters/not-found-exception.filter.ts:19](../../apps/api/src/filters/not-found-exception.filter.ts) |
| `catch` | MethodDeclaration | [apps/api/src/filters/not-found-exception.filter.ts:21](../../apps/api/src/filters/not-found-exception.filter.ts) |
| `JwtAuthGuard` | ClassDeclaration | [apps/api/src/guards/jwt-auth.guard.ts:10](../../apps/api/src/guards/jwt-auth.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/jwt-auth.guard.ts:16](../../apps/api/src/guards/jwt-auth.guard.ts) |
| `handleRequest` | MethodDeclaration | [apps/api/src/guards/jwt-auth.guard.ts:26](../../apps/api/src/guards/jwt-auth.guard.ts) |
| `LegacyBillingReadOnlyGuard` | ClassDeclaration | [apps/api/src/guards/legacy-billing-read-only.guard.ts:3](../../apps/api/src/guards/legacy-billing-read-only.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/legacy-billing-read-only.guard.ts:5](../../apps/api/src/guards/legacy-billing-read-only.guard.ts) |
| `ProviderAdminGuard` | ClassDeclaration | [apps/api/src/guards/provider-admin.guard.ts:3](../../apps/api/src/guards/provider-admin.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/provider-admin.guard.ts:5](../../apps/api/src/guards/provider-admin.guard.ts) |
| `SlidingWindowLimit` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:12](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `check` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:15](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `clientIp` | Function binding | [apps/api/src/guards/public-order-rate-limit.guard.ts:35](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `PublicOrderRateLimitGuard` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:44](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:48](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `PublicAuthRateLimitGuard` | ClassDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:57](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/public-order-rate-limit.guard.ts:59](../../apps/api/src/guards/public-order-rate-limit.guard.ts) |
| `RolesGuard` | ClassDeclaration | [apps/api/src/guards/roles.guard.ts:12](../../apps/api/src/guards/roles.guard.ts) |
| `canActivate` | MethodDeclaration | [apps/api/src/guards/roles.guard.ts:16](../../apps/api/src/guards/roles.guard.ts) |
| `bootstrap` | FunctionDeclaration | [apps/api/src/main.ts:13](../../apps/api/src/main.ts) |
| `AdminOpsController` | ClassDeclaration | [apps/api/src/modules/admin-ops/admin-ops.controller.ts:5](../../apps/api/src/modules/admin-ops/admin-ops.controller.ts) |
| `runMigration` | MethodDeclaration | [apps/api/src/modules/admin-ops/admin-ops.controller.ts:8](../../apps/api/src/modules/admin-ops/admin-ops.controller.ts) |
| `AdminOpsModule` | ClassDeclaration | [apps/api/src/modules/admin-ops/admin-ops.module.ts:4](../../apps/api/src/modules/admin-ops/admin-ops.module.ts) |
| `AuthController` | ClassDeclaration | [apps/api/src/modules/auth/auth.controller.ts:23](../../apps/api/src/modules/auth/auth.controller.ts) |
| `signup` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:32](../../apps/api/src/modules/auth/auth.controller.ts) |
| `login` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:38](../../apps/api/src/modules/auth/auth.controller.ts) |
| `logout` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:65](../../apps/api/src/modules/auth/auth.controller.ts) |
| `me` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:79](../../apps/api/src/modules/auth/auth.controller.ts) |
| `generateTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:115](../../apps/api/src/modules/auth/auth.controller.ts) |
| `verifyTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:124](../../apps/api/src/modules/auth/auth.controller.ts) |
| `disableTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:130](../../apps/api/src/modules/auth/auth.controller.ts) |
| `updateProfile` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:136](../../apps/api/src/modules/auth/auth.controller.ts) |
| `changePassword` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:142](../../apps/api/src/modules/auth/auth.controller.ts) |
| `generatePasskeyRegistrationOptions` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:150](../../apps/api/src/modules/auth/auth.controller.ts) |
| `verifyPasskeyRegistration` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:159](../../apps/api/src/modules/auth/auth.controller.ts) |
| `generatePasskeyAuthenticationOptions` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:165](../../apps/api/src/modules/auth/auth.controller.ts) |
| `verifyPasskeyAuthentication` | MethodDeclaration | [apps/api/src/modules/auth/auth.controller.ts:174](../../apps/api/src/modules/auth/auth.controller.ts) |
| `LoginDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:11](../../apps/api/src/modules/auth/auth.dto.ts) |
| `TotpCodeDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:28](../../apps/api/src/modules/auth/auth.dto.ts) |
| `UpdateProfileDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:34](../../apps/api/src/modules/auth/auth.dto.ts) |
| `ChangePasswordDto` | ClassDeclaration | [apps/api/src/modules/auth/auth.dto.ts:45](../../apps/api/src/modules/auth/auth.dto.ts) |
| `AuthModule` | ClassDeclaration | [apps/api/src/modules/auth/auth.module.ts:12](../../apps/api/src/modules/auth/auth.module.ts) |
| `AuthService` | ClassDeclaration | [apps/api/src/modules/auth/auth.service.ts:20](../../apps/api/src/modules/auth/auth.service.ts) |
| `onModuleInit` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:30](../../apps/api/src/modules/auth/auth.service.ts) |
| `logActivity` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:58](../../apps/api/src/modules/auth/auth.service.ts) |
| `signup` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:73](../../apps/api/src/modules/auth/auth.service.ts) |
| `validateUser` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:119](../../apps/api/src/modules/auth/auth.service.ts) |
| `login` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:151](../../apps/api/src/modules/auth/auth.service.ts) |
| `generateTotpSecret` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:239](../../apps/api/src/modules/auth/auth.service.ts) |
| `verifyAndEnableTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:259](../../apps/api/src/modules/auth/auth.service.ts) |
| `disableTotp` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:280](../../apps/api/src/modules/auth/auth.service.ts) |
| `updateProfile` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:294](../../apps/api/src/modules/auth/auth.service.ts) |
| `changePassword` | MethodDeclaration | [apps/api/src/modules/auth/auth.service.ts:325](../../apps/api/src/modules/auth/auth.service.ts) |
| `EmailService` | ClassDeclaration | [apps/api/src/modules/auth/email.service.ts:4](../../apps/api/src/modules/auth/email.service.ts) |
| `sendLoginNotification` | MethodDeclaration | [apps/api/src/modules/auth/email.service.ts:21](../../apps/api/src/modules/auth/email.service.ts) |
| `requireJwtSecret` | FunctionDeclaration | [apps/api/src/modules/auth/jwt-secret.ts:3](../../apps/api/src/modules/auth/jwt-secret.ts) |
| `JwtStrategy` | ClassDeclaration | [apps/api/src/modules/auth/jwt.strategy.ts:8](../../apps/api/src/modules/auth/jwt.strategy.ts) |
| `validate` | MethodDeclaration | [apps/api/src/modules/auth/jwt.strategy.ts:21](../../apps/api/src/modules/auth/jwt.strategy.ts) |
| `WebAuthnService` | ClassDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:14](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `getRegistrationOptions` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:18](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `verifyRegistration` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:51](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `getAuthenticationOptions` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:98](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `verifyAuthentication` | MethodDeclaration | [apps/api/src/modules/auth/webauthn.service.ts:124](../../apps/api/src/modules/auth/webauthn.service.ts) |
| `BillingController` | ClassDeclaration | [apps/api/src/modules/billing/billing.controller.ts:15](../../apps/api/src/modules/billing/billing.controller.ts) |
| `createInvoice` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:20](../../apps/api/src/modules/billing/billing.controller.ts) |
| `getInvoices` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:95](../../apps/api/src/modules/billing/billing.controller.ts) |
| `getInvoice` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:103](../../apps/api/src/modules/billing/billing.controller.ts) |
| `deleteInvoice` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:117](../../apps/api/src/modules/billing/billing.controller.ts) |
| `addPayment` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:175](../../apps/api/src/modules/billing/billing.controller.ts) |
| `getPaymentHistory` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:238](../../apps/api/src/modules/billing/billing.controller.ts) |
| `deletePayment` | MethodDeclaration | [apps/api/src/modules/billing/billing.controller.ts:249](../../apps/api/src/modules/billing/billing.controller.ts) |
| `BillingModule` | ClassDeclaration | [apps/api/src/modules/billing/billing.module.ts:4](../../apps/api/src/modules/billing/billing.module.ts) |
| `CommerceController` | ClassDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:8](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `listItems` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:15](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `createItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:16](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:17](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `archiveItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:18](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `movements` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:19](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `brands` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:20](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `brand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:21](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:22](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `archiveBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:23](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `categories` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:24](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `category` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:25](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:26](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `archiveCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:27](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `adjust` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:28](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `customers` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:29](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `customer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:30](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateCustomer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:31](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `ledger` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:32](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `whatsappStatement` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:33](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `orders` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:34](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `order` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:35](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `cancelOrder` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:36](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `inward` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:37](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `inwardList` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:38](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `costingSheets` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:39](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `costingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:40](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `updateCostingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:41](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `invoices` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:42](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `invoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:43](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `payment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:44](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `reversePayment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:45](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `voidInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:46](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `report` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:47](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `unInvoicedChallans` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.controller.ts:48](../../apps/api/src/modules/commerce/commerce.controller.ts) |
| `CommerceModule` | ClassDeclaration | [apps/api/src/modules/commerce/commerce.module.ts:9](../../apps/api/src/modules/commerce/commerce.module.ts) |
| `CommerceService` | ClassDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:11](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `stockSummary` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:15](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listItems` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:25](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:30](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:41](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `archiveItem` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:56](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `itemMovements` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:57](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listBrands` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:59](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:60](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:64](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `archiveBrand` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:68](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listCategories` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:69](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:70](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:74](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `archiveCategory` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:78](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `adjustStock` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:80](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listCustomers` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:92](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createCustomer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:100](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateCustomer` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:104](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `customerLedger` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:114](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createOrder` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:119](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listOrders` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:149](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `cancelOrder` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:151](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createInwardReceipt` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:166](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listInwardReceipts` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:178](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createCostingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:180](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listCostingSheets` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:186](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `updateCostingSheet` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:187](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `createInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:194](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `listInvoices` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:301](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `recordInvoicePayment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:303](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `reverseInvoicePayment` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:331](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `voidInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:348](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `verifyInvoice` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:374](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `report` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:380](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `getUninvoicedChallans` | MethodDeclaration | [apps/api/src/modules/commerce/commerce.service.ts:385](../../apps/api/src/modules/commerce/commerce.service.ts) |
| `calculateInvoiceTotals` | FunctionDeclaration | [apps/api/src/modules/commerce/invoice-totals.ts:11](../../apps/api/src/modules/commerce/invoice-totals.ts) |
| `InvoiceVerificationController` | ClassDeclaration | [apps/api/src/modules/commerce/invoice-verification.controller.ts:5](../../apps/api/src/modules/commerce/invoice-verification.controller.ts) |
| `verify` | MethodDeclaration | [apps/api/src/modules/commerce/invoice-verification.controller.ts:8](../../apps/api/src/modules/commerce/invoice-verification.controller.ts) |
| `StorefrontController` | ClassDeclaration | [apps/api/src/modules/commerce/storefront.controller.ts:6](../../apps/api/src/modules/commerce/storefront.controller.ts) |
| `products` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.controller.ts:9](../../apps/api/src/modules/commerce/storefront.controller.ts) |
| `order` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.controller.ts:11](../../apps/api/src/modules/commerce/storefront.controller.ts) |
| `roundMoney` | Function binding | [apps/api/src/modules/commerce/storefront.service.ts:8](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `clean` | Function binding | [apps/api/src/modules/commerce/storefront.service.ts:9](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `StorefrontService` | ClassDeclaration | [apps/api/src/modules/commerce/storefront.service.ts:11](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `products` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.service.ts:15](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `placeOrder` | MethodDeclaration | [apps/api/src/modules/commerce/storefront.service.ts:36](../../apps/api/src/modules/commerce/storefront.service.ts) |
| `WhatsAppStatementResult` | InterfaceDeclaration | [apps/api/src/modules/commerce/whatsapp-collections.service.ts:4](../../apps/api/src/modules/commerce/whatsapp-collections.service.ts) |
| `WhatsAppCollectionsService` | ClassDeclaration | [apps/api/src/modules/commerce/whatsapp-collections.service.ts:15](../../apps/api/src/modules/commerce/whatsapp-collections.service.ts) |
| `generateStatement` | MethodDeclaration | [apps/api/src/modules/commerce/whatsapp-collections.service.ts:22](../../apps/api/src/modules/commerce/whatsapp-collections.service.ts) |
| `CostingController` | ClassDeclaration | [apps/api/src/modules/costing/costing.controller.ts:31](../../apps/api/src/modules/costing/costing.controller.ts) |
| `getCostingHistory` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:35](../../apps/api/src/modules/costing/costing.controller.ts) |
| `getCostEntries` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:113](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createEBCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:118](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createEmployeeCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:123](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createPackagingCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:128](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createMaintenanceCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:133](../../apps/api/src/modules/costing/costing.controller.ts) |
| `createExpense` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:138](../../apps/api/src/modules/costing/costing.controller.ts) |
| `deleteEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:144](../../apps/api/src/modules/costing/costing.controller.ts) |
| `updateEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.controller.ts:150](../../apps/api/src/modules/costing/costing.controller.ts) |
| `CreateEbCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:20](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreateEmployeeCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:38](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreatePackagingCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:61](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreateMaintenanceCostDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:74](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CreateExpenseDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:92](../../apps/api/src/modules/costing/costing.dto.ts) |
| `UpdateCostingEntryDto` | ClassDeclaration | [apps/api/src/modules/costing/costing.dto.ts:114](../../apps/api/src/modules/costing/costing.dto.ts) |
| `CostingModule` | ClassDeclaration | [apps/api/src/modules/costing/costing.module.ts:5](../../apps/api/src/modules/costing/costing.module.ts) |
| `costNumber` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:18](../../apps/api/src/modules/costing/costing.service.ts) |
| `costDate` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:26](../../apps/api/src/modules/costing/costing.service.ts) |
| `costText` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:33](../../apps/api/src/modules/costing/costing.service.ts) |
| `costFields` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:39](../../apps/api/src/modules/costing/costing.service.ts) |
| `costDetails` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:54](../../apps/api/src/modules/costing/costing.service.ts) |
| `computedTotal` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:67](../../apps/api/src/modules/costing/costing.service.ts) |
| `definedOnly` | FunctionDeclaration | [apps/api/src/modules/costing/costing.service.ts:78](../../apps/api/src/modules/costing/costing.service.ts) |
| `CostingService` | ClassDeclaration | [apps/api/src/modules/costing/costing.service.ts:82](../../apps/api/src/modules/costing/costing.service.ts) |
| `addEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:86](../../apps/api/src/modules/costing/costing.service.ts) |
| `getCostEntries` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:111](../../apps/api/src/modules/costing/costing.service.ts) |
| `deleteEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:120](../../apps/api/src/modules/costing/costing.service.ts) |
| `updateEntry` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:136](../../apps/api/src/modules/costing/costing.service.ts) |
| `existsOn` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:166](../../apps/api/src/modules/costing/costing.service.ts) |
| `getTotalCost` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:174](../../apps/api/src/modules/costing/costing.service.ts) |
| `getCostSummary` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:194](../../apps/api/src/modules/costing/costing.service.ts) |
| `getHistoryByCategory` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:227](../../apps/api/src/modules/costing/costing.service.ts) |
| `getDailyCostSummary` | MethodDeclaration | [apps/api/src/modules/costing/costing.service.ts:264](../../apps/api/src/modules/costing/costing.service.ts) |
| `DailySummaryService` | ClassDeclaration | [apps/api/src/modules/dashboard/daily-summary.service.ts:11](../../apps/api/src/modules/dashboard/daily-summary.service.ts) |
| `sendDailySummary` | MethodDeclaration | [apps/api/src/modules/dashboard/daily-summary.service.ts:36](../../apps/api/src/modules/dashboard/daily-summary.service.ts) |
| `DashboardController` | ClassDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:6](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `getSummary` | MethodDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:14](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `getCharts` | MethodDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:93](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `getRecentActivity` | MethodDeclaration | [apps/api/src/modules/dashboard/dashboard.controller.ts:214](../../apps/api/src/modules/dashboard/dashboard.controller.ts) |
| `DashboardModule` | ClassDeclaration | [apps/api/src/modules/dashboard/dashboard.module.ts:7](../../apps/api/src/modules/dashboard/dashboard.module.ts) |
| `DatabaseModule` | ClassDeclaration | [apps/api/src/modules/database/database.module.ts:4](../../apps/api/src/modules/database/database.module.ts) |
| `HrController` | ClassDeclaration | [apps/api/src/modules/hr/hr.controller.ts:10](../../apps/api/src/modules/hr/hr.controller.ts) |
| `listStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:14](../../apps/api/src/modules/hr/hr.controller.ts) |
| `createStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:19](../../apps/api/src/modules/hr/hr.controller.ts) |
| `listShifts` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:25](../../apps/api/src/modules/hr/hr.controller.ts) |
| `createShift` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:30](../../apps/api/src/modules/hr/hr.controller.ts) |
| `listPayroll` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:36](../../apps/api/src/modules/hr/hr.controller.ts) |
| `createPayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.controller.ts:41](../../apps/api/src/modules/hr/hr.controller.ts) |
| `CreateStaffDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:14](../../apps/api/src/modules/hr/hr.dto.ts) |
| `CreateShiftDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:47](../../apps/api/src/modules/hr/hr.dto.ts) |
| `CreatePayrollEntryDto` | ClassDeclaration | [apps/api/src/modules/hr/hr.dto.ts:61](../../apps/api/src/modules/hr/hr.dto.ts) |
| `HrModule` | ClassDeclaration | [apps/api/src/modules/hr/hr.module.ts:5](../../apps/api/src/modules/hr/hr.module.ts) |
| `HrService` | ClassDeclaration | [apps/api/src/modules/hr/hr.service.ts:4](../../apps/api/src/modules/hr/hr.service.ts) |
| `listStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:9](../../apps/api/src/modules/hr/hr.service.ts) |
| `createStaff` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:13](../../apps/api/src/modules/hr/hr.service.ts) |
| `listShifts` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:28](../../apps/api/src/modules/hr/hr.service.ts) |
| `createShift` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:32](../../apps/api/src/modules/hr/hr.service.ts) |
| `listPayroll` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:37](../../apps/api/src/modules/hr/hr.service.ts) |
| `createPayrollEntry` | MethodDeclaration | [apps/api/src/modules/hr/hr.service.ts:48](../../apps/api/src/modules/hr/hr.service.ts) |
| `IntegrationsController` | ClassDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:7](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `preview` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:11](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `commit` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:12](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `history` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.controller.ts:13](../../apps/api/src/modules/integrations/integrations.controller.ts) |
| `IntegrationsModule` | ClassDeclaration | [apps/api/src/modules/integrations/integrations.module.ts:6](../../apps/api/src/modules/integrations/integrations.module.ts) |
| `IntegrationsService` | ClassDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:6](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `preview` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:10](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `commit` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:15](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `replay` | Function binding | [apps/api/src/modules/integrations/integrations.service.ts:21](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `history` | MethodDeclaration | [apps/api/src/modules/integrations/integrations.service.ts:58](../../apps/api/src/modules/integrations/integrations.service.ts) |
| `TallyExportController` | ClassDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:6](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `exportXml` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:11](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `getSummary` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.controller.ts:41](../../apps/api/src/modules/integrations/tally/tally.controller.ts) |
| `TallyModule` | ClassDeclaration | [apps/api/src/modules/integrations/tally/tally.module.ts:6](../../apps/api/src/modules/integrations/tally/tally.module.ts) |
| `TallyExportFilter` | InterfaceDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:4](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `TallyExportResult` | InterfaceDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:11](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `TallyExportService` | ClassDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:22](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `formatTallyDate` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:29](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `escapeXml` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:40](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `generateTallyXml` | MethodDeclaration | [apps/api/src/modules/integrations/tally/tally.service.ts:53](../../apps/api/src/modules/integrations/tally/tally.service.ts) |
| `InventoryController` | ClassDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:20](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getInventoryHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:24](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `createInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:119](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `syncWeighbridgeReading` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:124](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `mergeBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:129](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `createOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:137](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getOutwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:142](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getInwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:150](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getAvailableBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:158](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getCottonInventory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:163](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getStockByCount` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:173](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `getYarnInventory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:178](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `deleteInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:189](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `deleteOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:200](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `recycleWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:211](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `exportWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:216](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `deleteWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.controller.ts:221](../../apps/api/src/modules/inventory/inventory.controller.ts) |
| `InventoryModule` | ClassDeclaration | [apps/api/src/modules/inventory/inventory.module.ts:5](../../apps/api/src/modules/inventory/inventory.module.ts) |
| `InventoryService` | ClassDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:14](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getInwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:18](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getAvailableBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:69](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getOutwardHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:143](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `createOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:163](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `createInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:267](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `mergeBatches` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:348](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:482](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getDashboardMetrics` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:544](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getWasteHistory` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:617](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `deleteInward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:636](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `deleteOutward` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:759](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `getYarnStockByCount` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:852](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `recycleWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:893](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `exportWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:953](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `deleteWaste` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:998](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `syncWeighbridgeSlip` | MethodDeclaration | [apps/api/src/modules/inventory/inventory.service.ts:1121](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `number` | Function binding | [apps/api/src/modules/inventory/inventory.service.ts:1125](../../apps/api/src/modules/inventory/inventory.service.ts) |
| `JobWorkController` | ClassDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:4](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `workers` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:7](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `worker` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:8](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `list` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:9](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `summary` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:10](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `dispatch` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:11](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `receive` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:12](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `cancel` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.controller.ts:13](../../apps/api/src/modules/jobwork/jobwork.controller.ts) |
| `JobWorkModule` | ClassDeclaration | [apps/api/src/modules/jobwork/jobwork.module.ts:5](../../apps/api/src/modules/jobwork/jobwork.module.ts) |
| `JobWorkService` | ClassDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:6](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `available` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:10](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `listWorkers` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:15](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `createWorker` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:17](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `listChallans` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:22](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `dispatch` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:26](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `receive` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:46](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `cancel` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:70](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `summary` | MethodDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:87](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
| `scrapNote` | FunctionDeclaration | [apps/api/src/modules/jobwork/jobwork.service.ts:95](../../apps/api/src/modules/jobwork/jobwork.service.ts) |
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
| `ProductionController` | ClassDeclaration | [apps/api/src/modules/production/production.controller.ts:4](../../apps/api/src/modules/production/production.controller.ts) |
| `createProductionEntry` | MethodDeclaration | [apps/api/src/modules/production/production.controller.ts:8](../../apps/api/src/modules/production/production.controller.ts) |
| `getProductionHistory` | MethodDeclaration | [apps/api/src/modules/production/production.controller.ts:14](../../apps/api/src/modules/production/production.controller.ts) |
| `deleteProduction` | MethodDeclaration | [apps/api/src/modules/production/production.controller.ts:19](../../apps/api/src/modules/production/production.controller.ts) |
| `ProductionModule` | ClassDeclaration | [apps/api/src/modules/production/production.module.ts:5](../../apps/api/src/modules/production/production.module.ts) |
| `ProductionService` | ClassDeclaration | [apps/api/src/modules/production/production.service.ts:14](../../apps/api/src/modules/production/production.service.ts) |
| `create` | MethodDeclaration | [apps/api/src/modules/production/production.service.ts:18](../../apps/api/src/modules/production/production.service.ts) |
| `findAll` | MethodDeclaration | [apps/api/src/modules/production/production.service.ts:345](../../apps/api/src/modules/production/production.service.ts) |
| `delete` | MethodDeclaration | [apps/api/src/modules/production/production.service.ts:356](../../apps/api/src/modules/production/production.service.ts) |
| `QualityController` | ClassDeclaration | [apps/api/src/modules/quality/quality.controller.ts:6](../../apps/api/src/modules/quality/quality.controller.ts) |
| `listInspections` | MethodDeclaration | [apps/api/src/modules/quality/quality.controller.ts:10](../../apps/api/src/modules/quality/quality.controller.ts) |
| `createInspection` | MethodDeclaration | [apps/api/src/modules/quality/quality.controller.ts:19](../../apps/api/src/modules/quality/quality.controller.ts) |
| `CreateQualityInspectionDto` | ClassDeclaration | [apps/api/src/modules/quality/quality.dto.ts:10](../../apps/api/src/modules/quality/quality.dto.ts) |
| `QualityModule` | ClassDeclaration | [apps/api/src/modules/quality/quality.module.ts:5](../../apps/api/src/modules/quality/quality.module.ts) |
| `QualityService` | ClassDeclaration | [apps/api/src/modules/quality/quality.service.ts:5](../../apps/api/src/modules/quality/quality.service.ts) |
| `listInspections` | MethodDeclaration | [apps/api/src/modules/quality/quality.service.ts:9](../../apps/api/src/modules/quality/quality.service.ts) |
| `createInspection` | MethodDeclaration | [apps/api/src/modules/quality/quality.service.ts:24](../../apps/api/src/modules/quality/quality.service.ts) |
| `SearchController` | ClassDeclaration | [apps/api/src/modules/search/search.controller.ts:4](../../apps/api/src/modules/search/search.controller.ts) |
| `globalSearch` | MethodDeclaration | [apps/api/src/modules/search/search.controller.ts:8](../../apps/api/src/modules/search/search.controller.ts) |
| `SearchModule` | ClassDeclaration | [apps/api/src/modules/search/search.module.ts:4](../../apps/api/src/modules/search/search.module.ts) |
| `SessionsController` | ClassDeclaration | [apps/api/src/modules/sessions/sessions.controller.ts:8](../../apps/api/src/modules/sessions/sessions.controller.ts) |
| `getSessions` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.controller.ts:14](../../apps/api/src/modules/sessions/sessions.controller.ts) |
| `revokeSession` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.controller.ts:19](../../apps/api/src/modules/sessions/sessions.controller.ts) |
| `SessionsModule` | ClassDeclaration | [apps/api/src/modules/sessions/sessions.module.ts:5](../../apps/api/src/modules/sessions/sessions.module.ts) |
| `SessionsService` | ClassDeclaration | [apps/api/src/modules/sessions/sessions.service.ts:4](../../apps/api/src/modules/sessions/sessions.service.ts) |
| `findSessionsForUser` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.service.ts:8](../../apps/api/src/modules/sessions/sessions.service.ts) |
| `revokeSession` | MethodDeclaration | [apps/api/src/modules/sessions/sessions.service.ts:25](../../apps/api/src/modules/sessions/sessions.service.ts) |
| `SettingsController` | ClassDeclaration | [apps/api/src/modules/settings/settings.controller.ts:7](../../apps/api/src/modules/settings/settings.controller.ts) |
| `getSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.controller.ts:11](../../apps/api/src/modules/settings/settings.controller.ts) |
| `updateSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.controller.ts:16](../../apps/api/src/modules/settings/settings.controller.ts) |
| `supplied` | Function binding | [apps/api/src/modules/settings/settings.dto.ts:4](../../apps/api/src/modules/settings/settings.dto.ts) |
| `UpdateSettingsDto` | ClassDeclaration | [apps/api/src/modules/settings/settings.dto.ts:6](../../apps/api/src/modules/settings/settings.dto.ts) |
| `SettingsModule` | ClassDeclaration | [apps/api/src/modules/settings/settings.module.ts:5](../../apps/api/src/modules/settings/settings.module.ts) |
| `SettingsService` | ClassDeclaration | [apps/api/src/modules/settings/settings.service.ts:29](../../apps/api/src/modules/settings/settings.service.ts) |
| `getSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.service.ts:33](../../apps/api/src/modules/settings/settings.service.ts) |
| `updateSettings` | MethodDeclaration | [apps/api/src/modules/settings/settings.service.ts:44](../../apps/api/src/modules/settings/settings.service.ts) |
| `UsersController` | ClassDeclaration | [apps/api/src/modules/users/users.controller.ts:20](../../apps/api/src/modules/users/users.controller.ts) |
| `register` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:26](../../apps/api/src/modules/users/users.controller.ts) |
| `getUsers` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:32](../../apps/api/src/modules/users/users.controller.ts) |
| `updateUser` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:37](../../apps/api/src/modules/users/users.controller.ts) |
| `deleteUser` | MethodDeclaration | [apps/api/src/modules/users/users.controller.ts:43](../../apps/api/src/modules/users/users.controller.ts) |
| `CreateUserDto` | ClassDeclaration | [apps/api/src/modules/users/users.dto.ts:4](../../apps/api/src/modules/users/users.dto.ts) |
| `UpdateUserDto` | ClassDeclaration | [apps/api/src/modules/users/users.dto.ts:21](../../apps/api/src/modules/users/users.dto.ts) |
| `UsersModule` | ClassDeclaration | [apps/api/src/modules/users/users.module.ts:6](../../apps/api/src/modules/users/users.module.ts) |
| `UsersService` | ClassDeclaration | [apps/api/src/modules/users/users.service.ts:12](../../apps/api/src/modules/users/users.service.ts) |
| `hashPassword` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:16](../../apps/api/src/modules/users/users.service.ts) |
| `handleConflict` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:23](../../apps/api/src/modules/users/users.service.ts) |
| `createUser` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:30](../../apps/api/src/modules/users/users.service.ts) |
| `findAllUsers` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:44](../../apps/api/src/modules/users/users.service.ts) |
| `updateUser` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:48](../../apps/api/src/modules/users/users.service.ts) |
| `deleteUser` | MethodDeclaration | [apps/api/src/modules/users/users.service.ts:71](../../apps/api/src/modules/users/users.service.ts) |
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
| `signed` | Function binding | [apps/api/src/modules/warehouse/warehouse.service.ts:52](../../apps/api/src/modules/warehouse/warehouse.service.ts) |
| `WorkflowsController` | ClassDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:5](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `overview` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:8](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `document` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:9](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `supplier` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:10](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `post` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:11](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `release` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:15](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `close` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:16](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `amend` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.controller.ts:17](../../apps/api/src/modules/workflows/workflows.controller.ts) |
| `WorkflowsModule` | ClassDeclaration | [apps/api/src/modules/workflows/workflows.module.ts:4](../../apps/api/src/modules/workflows/workflows.module.ts) |
| `positive` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:10](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `nonnegative` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:13](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `cash` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:16](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `WorkflowsService` | ClassDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:18](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `document` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:21](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `overview` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:22](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `supplier` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:49](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `post` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:55](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `line` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:118](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `inputs` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:130](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `total` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:137](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `move` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:142](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `origin` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:149](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `salesReturn` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:156](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `setPaid` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:206](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `customerFunds` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:213](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `procurement` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:254](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `supplierFunds` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:323](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `linkCottonReceipt` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:356](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `hold` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:382](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `releaseHold` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:390](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `reclassify` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:402](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `completeWip` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:413](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `transform` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:439](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `used` | Function binding | [apps/api/src/modules/workflows/workflows.service.ts:459](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `orderDispatch` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:504](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `pick` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:534](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `valueOpening` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:553](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `closePeriod` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:565](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `amendOrder` | MethodDeclaration | [apps/api/src/modules/workflows/workflows.service.ts:579](../../apps/api/src/modules/workflows/workflows.service.ts) |
| `AdminSyncResponseDto` | ClassDeclaration | [apps/api/src/services/admin-sync-response.dto.ts:19](../../apps/api/src/services/admin-sync-response.dto.ts) |
| `parseAdminSyncResponse` | FunctionDeclaration | [apps/api/src/services/admin-sync-response.dto.ts:70](../../apps/api/src/services/admin-sync-response.dto.ts) |
| `AdminSyncService` | ClassDeclaration | [apps/api/src/services/admin-sync.service.ts:6](../../apps/api/src/services/admin-sync.service.ts) |
| `syncMetrics` | MethodDeclaration | [apps/api/src/services/admin-sync.service.ts:16](../../apps/api/src/services/admin-sync.service.ts) |
| `AuditLog` | InterfaceDeclaration | [apps/api/src/services/audit.service.ts:3](../../apps/api/src/services/audit.service.ts) |
| `AuditService` | ClassDeclaration | [apps/api/src/services/audit.service.ts:14](../../apps/api/src/services/audit.service.ts) |
| `log` | MethodDeclaration | [apps/api/src/services/audit.service.ts:18](../../apps/api/src/services/audit.service.ts) |
| `getLogs` | MethodDeclaration | [apps/api/src/services/audit.service.ts:35](../../apps/api/src/services/audit.service.ts) |
| `clearOldLogs` | MethodDeclaration | [apps/api/src/services/audit.service.ts:72](../../apps/api/src/services/audit.service.ts) |
| `money` | Function binding | [apps/api/src/services/business-ledger.ts:4](../../apps/api/src/services/business-ledger.ts) |
| `unavailableStock` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:6](../../apps/api/src/services/business-ledger.ts) |
| `freezeOrdersForHold` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:13](../../apps/api/src/services/business-ledger.ts) |
| `assertOpenPeriod` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:28](../../apps/api/src/services/business-ledger.ts) |
| `assertOverheadAvailable` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:34](../../apps/api/src/services/business-ledger.ts) |
| `journal` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:42](../../apps/api/src/services/business-ledger.ts) |
| `reconcileLots` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:54](../../apps/api/src/services/business-ledger.ts) |
| `guardLots` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:82](../../apps/api/src/services/business-ledger.ts) |
| `reconcileFinance` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:117](../../apps/api/src/services/business-ledger.ts) |
| `reconcileValuation` | FunctionDeclaration | [apps/api/src/services/business-ledger.ts:169](../../apps/api/src/services/business-ledger.ts) |
| `PrismaService` | ClassDeclaration | [apps/api/src/services/prisma.service.ts:7](../../apps/api/src/services/prisma.service.ts) |
| `onModuleInit` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:31](../../apps/api/src/services/prisma.service.ts) |
| `reconcileEverything` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:45](../../apps/api/src/services/prisma.service.ts) |
| `getStartupIssue` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:64](../../apps/api/src/services/prisma.service.ts) |
| `getDataIssues` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:69](../../apps/api/src/services/prisma.service.ts) |
| `stockTransaction` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:73](../../apps/api/src/services/prisma.service.ts) |
| `closedSnapshot` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:104](../../apps/api/src/services/prisma.service.ts) |
| `onModuleDestroy` | MethodDeclaration | [apps/api/src/services/prisma.service.ts:118](../../apps/api/src/services/prisma.service.ts) |
| `reconcileStock` | FunctionDeclaration | [apps/api/src/services/stock-bridge.ts:8](../../apps/api/src/services/stock-bridge.ts) |
| `guardManagedStock` | FunctionDeclaration | [apps/api/src/services/stock-bridge.ts:101](../../apps/api/src/services/stock-bridge.ts) |
| `getKey` | FunctionDeclaration | [apps/api/src/utils/crypto.ts:8](../../apps/api/src/utils/crypto.ts) |
| `encryptField` | FunctionDeclaration | [apps/api/src/utils/crypto.ts:17](../../apps/api/src/utils/crypto.ts) |
| `decryptField` | FunctionDeclaration | [apps/api/src/utils/crypto.ts:35](../../apps/api/src/utils/crypto.ts) |
| `TraceChain` | InterfaceDeclaration | [apps/api/src/utils/delete-guard.ts:16](../../apps/api/src/utils/delete-guard.ts) |
| `DeleteGuardErrorPayload` | InterfaceDeclaration | [apps/api/src/utils/delete-guard.ts:30](../../apps/api/src/utils/delete-guard.ts) |
| `DeleteGuardConflictException` | ClassDeclaration | [apps/api/src/utils/delete-guard.ts:42](../../apps/api/src/utils/delete-guard.ts) |
| `throwInwardUnderProduction` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:51](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionTooEarly` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:73](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionInFuture` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:100](../../apps/api/src/utils/delete-guard.ts) |
| `throwMassBalanceExceeded` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:111](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionHasBilledBags` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:129](../../apps/api/src/utils/delete-guard.ts) |
| `throwProductionHasSoldWaste` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:149](../../apps/api/src/utils/delete-guard.ts) |
| `throwWasteSoldOrLinked` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:168](../../apps/api/src/utils/delete-guard.ts) |
| `throwOutwardBilled` | FunctionDeclaration | [apps/api/src/utils/delete-guard.ts:204](../../apps/api/src/utils/delete-guard.ts) |
| `normalizeRole` | Function binding | [apps/api/src/utils/roles.ts:7](../../apps/api/src/utils/roles.ts) |
| `stockEventDate` | FunctionDeclaration | [apps/api/src/utils/stock-event-date.ts:5](../../apps/api/src/utils/stock-event-date.ts) |
| `NotificationSyncRunner` | Function binding | [apps/web/src/App.tsx:89](../../apps/web/src/App.tsx) |
| `NavItem` | InterfaceDeclaration | [apps/web/src/App.tsx:133](../../apps/web/src/App.tsx) |
| `NavGroup` | InterfaceDeclaration | [apps/web/src/App.tsx:142](../../apps/web/src/App.tsx) |
| `SearchResultItem` | InterfaceDeclaration | [apps/web/src/App.tsx:147](../../apps/web/src/App.tsx) |
| `PrintStyles` | Function binding | [apps/web/src/App.tsx:158](../../apps/web/src/App.tsx) |
| `GlobalSearch` | Function binding | [apps/web/src/App.tsx:163](../../apps/web/src/App.tsx) |
| `handleKeyDown` | Function binding | [apps/web/src/App.tsx:174](../../apps/web/src/App.tsx) |
| `fetchResults` | Function binding | [apps/web/src/App.tsx:187](../../apps/web/src/App.tsx) |
| `handleSearch` | Function binding | [apps/web/src/App.tsx:208](../../apps/web/src/App.tsx) |
| `handleKeyDown` | Function binding | [apps/web/src/App.tsx:212](../../apps/web/src/App.tsx) |
| `addToHistory` | Function binding | [apps/web/src/App.tsx:240](../../apps/web/src/App.tsx) |
| `highlightMatch` | Function binding | [apps/web/src/App.tsx:247](../../apps/web/src/App.tsx) |
| `App` | Function binding | [apps/web/src/App.tsx:355](../../apps/web/src/App.tsx) |
| `getInitialPage` | Function binding | [apps/web/src/App.tsx:369](../../apps/web/src/App.tsx) |
| `setCurrentPage` | Function binding | [apps/web/src/App.tsx:377](../../apps/web/src/App.tsx) |
| `handlePopState` | Function binding | [apps/web/src/App.tsx:389](../../apps/web/src/App.tsx) |
| `handleNavigate` | Function binding | [apps/web/src/App.tsx:434](../../apps/web/src/App.tsx) |
| `toggleTheme` | Function binding | [apps/web/src/App.tsx:444](../../apps/web/src/App.tsx) |
| `toggleLanguage` | Function binding | [apps/web/src/App.tsx:448](../../apps/web/src/App.tsx) |
| `handleProfileClick` | Function binding | [apps/web/src/App.tsx:455](../../apps/web/src/App.tsx) |
| `handleProfileClose` | Function binding | [apps/web/src/App.tsx:459](../../apps/web/src/App.tsx) |
| `handleLogout` | Function binding | [apps/web/src/App.tsx:463](../../apps/web/src/App.tsx) |
| `handleLogin` | Function binding | [apps/web/src/App.tsx:479](../../apps/web/src/App.tsx) |
| `handleDrawerToggle` | Function binding | [apps/web/src/App.tsx:485](../../apps/web/src/App.tsx) |
| `getBreadcrumbItems` | Function binding | [apps/web/src/App.tsx:490](../../apps/web/src/App.tsx) |
| `handleSync` | Function binding | [apps/web/src/App.tsx:537](../../apps/web/src/App.tsx) |
| `labelFor` | Function binding | [apps/web/src/App.tsx:671](../../apps/web/src/App.tsx) |
| `BusinessFlowGuide` | FunctionDeclaration | [apps/web/src/components/BusinessFlowGuide.tsx:16](../../apps/web/src/components/BusinessFlowGuide.tsx) |
| `YarnCore` | Function binding | [apps/web/src/components/DashboardScene.tsx:7](../../apps/web/src/components/DashboardScene.tsx) |
| `DashboardScene` | Function binding | [apps/web/src/components/DashboardScene.tsx:50](../../apps/web/src/components/DashboardScene.tsx) |
| `LoginProps` | InterfaceDeclaration | [apps/web/src/components/Login.tsx:62](../../apps/web/src/components/Login.tsx) |
| `Login` | Function binding | [apps/web/src/components/Login.tsx:68](../../apps/web/src/components/Login.tsx) |
| `handleTyping` | Function binding | [apps/web/src/components/Login.tsx:88](../../apps/web/src/components/Login.tsx) |
| `handleSubmit` | Function binding | [apps/web/src/components/Login.tsx:102](../../apps/web/src/components/Login.tsx) |
| `handlePasskeyLogin` | Function binding | [apps/web/src/components/Login.tsx:136](../../apps/web/src/components/Login.tsx) |
| `IntrinsicElements` | InterfaceDeclaration | [apps/web/src/components/LoginAvatar.tsx:11](../../apps/web/src/components/LoginAvatar.tsx) |
| `LoginAvatarProps` | InterfaceDeclaration | [apps/web/src/components/LoginAvatar.tsx:15](../../apps/web/src/components/LoginAvatar.tsx) |
| `IridescentMaterial` | Function binding | [apps/web/src/components/LoginAvatar.tsx:24](../../apps/web/src/components/LoginAvatar.tsx) |
| `Character` | Function binding | [apps/web/src/components/LoginAvatar.tsx:67](../../apps/web/src/components/LoginAvatar.tsx) |
| `LoginAvatar` | Function binding | [apps/web/src/components/LoginAvatar.tsx:175](../../apps/web/src/components/LoginAvatar.tsx) |
| `ProfileModalProps` | InterfaceDeclaration | [apps/web/src/components/ProfileModal.tsx:40](../../apps/web/src/components/ProfileModal.tsx) |
| `ProfileModal` | Function binding | [apps/web/src/components/ProfileModal.tsx:64](../../apps/web/src/components/ProfileModal.tsx) |
| `handleSaveProfile` | Function binding | [apps/web/src/components/ProfileModal.tsx:138](../../apps/web/src/components/ProfileModal.tsx) |
| `handleChangePassword` | Function binding | [apps/web/src/components/ProfileModal.tsx:149](../../apps/web/src/components/ProfileModal.tsx) |
| `getRoleColor` | Function binding | [apps/web/src/components/ProfileModal.tsx:165](../../apps/web/src/components/ProfileModal.tsx) |
| `WeighbridgeReceiptDialog` | FunctionDeclaration | [apps/web/src/components/WeighbridgeReceiptDialog.tsx:7](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) |
| `save` | Function binding | [apps/web/src/components/WeighbridgeReceiptDialog.tsx:35](../../apps/web/src/components/WeighbridgeReceiptDialog.tsx) |
| `FeedEvent` | InterfaceDeclaration | [apps/web/src/components/command-center/ActivityFeed.tsx:19](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `ActivityFeedProps` | InterfaceDeclaration | [apps/web/src/components/command-center/ActivityFeed.tsx:29](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `timeAgo` | FunctionDeclaration | [apps/web/src/components/command-center/ActivityFeed.tsx:48](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `EventRow` | Function binding | [apps/web/src/components/command-center/ActivityFeed.tsx:63](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `FeedSkeleton` | Function binding | [apps/web/src/components/command-center/ActivityFeed.tsx:153](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `ActivityFeed` | Function binding | [apps/web/src/components/command-center/ActivityFeed.tsx:207](../../apps/web/src/components/command-center/ActivityFeed.tsx) |
| `Solid` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:7](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `FactoryBuilding` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:12](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `HazardBayPad` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:46](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `DockBeacon` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:63](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `MachineModel` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:75](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `Landscape` | FunctionDeclaration | [apps/web/src/components/command-center/CampusAssets.tsx:93](../../apps/web/src/components/command-center/CampusAssets.tsx) |
| `CameraRig` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:18](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Block` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:63](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Label` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:69](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `PinCallout` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:79](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Building` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:109](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Wheel` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:116](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Stock` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:126](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Forklift` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:137](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `ParkedTruck` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:203](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `Truck` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:228](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `World` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:256](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `SceneBoundary` | ClassDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:360](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `getDerivedStateFromError` | MethodDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:362](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `render` | MethodDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:363](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `CampusScene` | FunctionDeclaration | [apps/web/src/components/command-center/CampusScene.tsx:366](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `update` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:382](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `focus` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:393](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `escape` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:397](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `selectMachine` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:406](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `number` | Function binding | [apps/web/src/components/command-center/CampusScene.tsx:417](../../apps/web/src/components/command-center/CampusScene.tsx) |
| `ZoneInfo` | InterfaceDeclaration | [apps/web/src/components/command-center/CampusWorkspace.tsx:5](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `Props` | InterfaceDeclaration | [apps/web/src/components/command-center/CampusWorkspace.tsx:6](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `CampusWorkspace` | FunctionDeclaration | [apps/web/src/components/command-center/CampusWorkspace.tsx:22](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `focus` | Function binding | [apps/web/src/components/command-center/CampusWorkspace.tsx:37](../../apps/web/src/components/command-center/CampusWorkspace.tsx) |
| `FleetDockTableHudProps` | InterfaceDeclaration | [apps/web/src/components/command-center/FleetDockTableHud.tsx:25](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) |
| `FleetDockTableHud` | Function binding | [apps/web/src/components/command-center/FleetDockTableHud.tsx:34](../../apps/web/src/components/command-center/FleetDockTableHud.tsx) |
| `MachineData` | InterfaceDeclaration | [apps/web/src/components/command-center/FloorCanvas.tsx:7](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `FloorCanvasProps` | InterfaceDeclaration | [apps/web/src/components/command-center/FloorCanvas.tsx:15](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `ZoneRect` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:65](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `MachineStatusRing` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:96](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `FlowParticle` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:142](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `BaleStack` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:160](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `BagGrid` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:204](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `TruckIcon` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:239](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `GridBackground` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:269](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `FloorCanvas` | Function binding | [apps/web/src/components/command-center/FloorCanvas.tsx:282](../../apps/web/src/components/command-center/FloorCanvas.tsx) |
| `useCountUp` | FunctionDeclaration | [apps/web/src/components/command-center/KpiRibbon.tsx:14](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `step` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:31](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `KpiCard` | InterfaceDeclaration | [apps/web/src/components/command-center/KpiRibbon.tsx:49](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `KpiRibbonProps` | InterfaceDeclaration | [apps/web/src/components/command-center/KpiRibbon.tsx:63](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `StatCard` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:70](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `SkeletonCard` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:200](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `KpiRibbon` | Function binding | [apps/web/src/components/command-center/KpiRibbon.tsx:227](../../apps/web/src/components/command-center/KpiRibbon.tsx) |
| `ActiveShipment` | InterfaceDeclaration | [apps/web/src/components/command-center/ShipmentStepperHud.tsx:25](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) |
| `ShipmentStepperHudProps` | InterfaceDeclaration | [apps/web/src/components/command-center/ShipmentStepperHud.tsx:38](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) |
| `ShipmentStepperHud` | Function binding | [apps/web/src/components/command-center/ShipmentStepperHud.tsx:43](../../apps/web/src/components/command-center/ShipmentStepperHud.tsx) |
| `WarRoomViewProps` | InterfaceDeclaration | [apps/web/src/components/command-center/WarRoomView.tsx:31](../../apps/web/src/components/command-center/WarRoomView.tsx) |
| `WarRoomView` | Function binding | [apps/web/src/components/command-center/WarRoomView.tsx:48](../../apps/web/src/components/command-center/WarRoomView.tsx) |
| `BarcodeQRModalProps` | InterfaceDeclaration | [apps/web/src/components/common/BarcodeQRModal.tsx:27](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `escapeHtml` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:39](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `labelPrintDocument` | FunctionDeclaration | [apps/web/src/components/common/BarcodeQRModal.tsx:46](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `SimpleSVGBarcode` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:130](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `BarcodeQRModal` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:186](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `handlePrint` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:198](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `handleCopy` | Function binding | [apps/web/src/components/common/BarcodeQRModal.tsx:210](../../apps/web/src/components/common/BarcodeQRModal.tsx) |
| `BatchCodeBuilderProps` | InterfaceDeclaration | [apps/web/src/components/common/BatchCodeBuilder.tsx:7](../../apps/web/src/components/common/BatchCodeBuilder.tsx) |
| `BatchCodeBuilder` | FunctionDeclaration | [apps/web/src/components/common/BatchCodeBuilder.tsx:14](../../apps/web/src/components/common/BatchCodeBuilder.tsx) |
| `BreadcrumbItem` | InterfaceDeclaration | [apps/web/src/components/common/Breadcrumbs.tsx:13](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `BreadcrumbsProps` | InterfaceDeclaration | [apps/web/src/components/common/Breadcrumbs.tsx:19](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `Breadcrumbs` | Function binding | [apps/web/src/components/common/Breadcrumbs.tsx:24](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `handleClick` | Function binding | [apps/web/src/components/common/Breadcrumbs.tsx:25](../../apps/web/src/components/common/Breadcrumbs.tsx) |
| `ConfirmDialogProps` | InterfaceDeclaration | [apps/web/src/components/common/ConfirmDialog.tsx:13](../../apps/web/src/components/common/ConfirmDialog.tsx) |
| `ConfirmDialog` | Function binding | [apps/web/src/components/common/ConfirmDialog.tsx:24](../../apps/web/src/components/common/ConfirmDialog.tsx) |
| `EmptyStateProps` | InterfaceDeclaration | [apps/web/src/components/common/EmptyState.tsx:11](../../apps/web/src/components/common/EmptyState.tsx) |
| `EmptyState` | Function binding | [apps/web/src/components/common/EmptyState.tsx:20](../../apps/web/src/components/common/EmptyState.tsx) |
| `EntryWizardHeaderProps` | InterfaceDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:6](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `EntryWizardHeader` | FunctionDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:16](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `EntrySummary` | FunctionDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:35](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `SummaryValue` | FunctionDeclaration | [apps/web/src/components/common/EntryWizardHeader.tsx:45](../../apps/web/src/components/common/EntryWizardHeader.tsx) |
| `Props` | InterfaceDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:5](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `State` | InterfaceDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:10](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `ErrorBoundary` | ClassDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:20](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `getDerivedStateFromError` | MethodDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:26](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `componentDidCatch` | MethodDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:30](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `render` | MethodDeclaration | [apps/web/src/components/common/ErrorBoundary.tsx:52](../../apps/web/src/components/common/ErrorBoundary.tsx) |
| `ExportButtonsProps` | InterfaceDeclaration | [apps/web/src/components/common/ExportButtons.tsx:10](../../apps/web/src/components/common/ExportButtons.tsx) |
| `ExportBtn` | InterfaceDeclaration | [apps/web/src/components/common/ExportButtons.tsx:24](../../apps/web/src/components/common/ExportButtons.tsx) |
| `ExportButtons` | Function binding | [apps/web/src/components/common/ExportButtons.tsx:34](../../apps/web/src/components/common/ExportButtons.tsx) |
| `parseDate` | FunctionDeclaration | [apps/web/src/components/common/GlassDatePicker.tsx:24](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `toISO` | FunctionDeclaration | [apps/web/src/components/common/GlassDatePicker.tsx:29](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `formatDisplay` | FunctionDeclaration | [apps/web/src/components/common/GlassDatePicker.tsx:32](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `GlassDatePicker` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:39](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `handler` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:55](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `isSameDay` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:84](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `isToday` | Function binding | [apps/web/src/components/common/GlassDatePicker.tsx:86](../../apps/web/src/components/common/GlassDatePicker.tsx) |
| `NotFoundProps` | InterfaceDeclaration | [apps/web/src/components/common/NotFound404.tsx:5](../../apps/web/src/components/common/NotFound404.tsx) |
| `NotFound404` | Function binding | [apps/web/src/components/common/NotFound404.tsx:10](../../apps/web/src/components/common/NotFound404.tsx) |
| `ProductionTimingAlert` | FunctionDeclaration | [apps/web/src/components/common/ProductionTimingAlert.tsx:6](../../apps/web/src/components/common/ProductionTimingAlert.tsx) |
| `RequiredLabelProps` | InterfaceDeclaration | [apps/web/src/components/common/RequiredLabel.tsx:4](../../apps/web/src/components/common/RequiredLabel.tsx) |
| `RequiredLabel` | Function binding | [apps/web/src/components/common/RequiredLabel.tsx:14](../../apps/web/src/components/common/RequiredLabel.tsx) |
| `useScreenReaderAnnouncer` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:7](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `announce` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:11](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `ScreenReaderAnnouncerProps` | InterfaceDeclaration | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:19](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `ScreenReaderAnnouncer` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:28](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `handleAnnounce` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:32](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `announceToScreenReader` | Function binding | [apps/web/src/components/common/ScreenReaderAnnouncer.tsx:85](../../apps/web/src/components/common/ScreenReaderAnnouncer.tsx) |
| `TableSkeletonProps` | InterfaceDeclaration | [apps/web/src/components/common/TableSkeleton.tsx:12](../../apps/web/src/components/common/TableSkeleton.tsx) |
| `TableSkeleton` | Function binding | [apps/web/src/components/common/TableSkeleton.tsx:18](../../apps/web/src/components/common/TableSkeleton.tsx) |
| `EwayBill` | InterfaceDeclaration | [apps/web/src/components/insights/EwayBills.tsx:10](../../apps/web/src/components/insights/EwayBills.tsx) |
| `EwayBills` | Function binding | [apps/web/src/components/insights/EwayBills.tsx:21](../../apps/web/src/components/insights/EwayBills.tsx) |
| `handleGenerate` | Function binding | [apps/web/src/components/insights/EwayBills.tsx:26](../../apps/web/src/components/insights/EwayBills.tsx) |
| `handleCancel` | Function binding | [apps/web/src/components/insights/EwayBills.tsx:30](../../apps/web/src/components/insights/EwayBills.tsx) |
| `TallySync` | Function binding | [apps/web/src/components/insights/TallySync.tsx:10](../../apps/web/src/components/insights/TallySync.tsx) |
| `handleSync` | Function binding | [apps/web/src/components/insights/TallySync.tsx:15](../../apps/web/src/components/insights/TallySync.tsx) |
| `ConfirmOptions` | InterfaceDeclaration | [apps/web/src/context/ConfirmContext.tsx:4](../../apps/web/src/context/ConfirmContext.tsx) |
| `ConfirmContextType` | InterfaceDeclaration | [apps/web/src/context/ConfirmContext.tsx:12](../../apps/web/src/context/ConfirmContext.tsx) |
| `ConfirmProvider` | Function binding | [apps/web/src/context/ConfirmContext.tsx:18](../../apps/web/src/context/ConfirmContext.tsx) |
| `useConfirm` | Function binding | [apps/web/src/context/ConfirmContext.tsx:60](../../apps/web/src/context/ConfirmContext.tsx) |
| `Shortcut` | InterfaceDeclaration | [apps/web/src/context/KeyboardShortcutsContext.tsx:4](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `KeyboardShortcutsContextType` | InterfaceDeclaration | [apps/web/src/context/KeyboardShortcutsContext.tsx:13](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `useKeyboardShortcuts` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:21](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `KeyboardShortcutsProvider` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:29](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `handleKeyDown` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:57](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `useShortcut` | Function binding | [apps/web/src/context/KeyboardShortcutsContext.tsx:90](../../apps/web/src/context/KeyboardShortcutsContext.tsx) |
| `Notification` | InterfaceDeclaration | [apps/web/src/context/NotificationsContext.tsx:23](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsContextType` | InterfaceDeclaration | [apps/web/src/context/NotificationsContext.tsx:34](../../apps/web/src/context/NotificationsContext.tsx) |
| `loadFromStorage` | FunctionDeclaration | [apps/web/src/context/NotificationsContext.tsx:49](../../apps/web/src/context/NotificationsContext.tsx) |
| `saveToStorage` | FunctionDeclaration | [apps/web/src/context/NotificationsContext.tsx:58](../../apps/web/src/context/NotificationsContext.tsx) |
| `useNotifications` | Function binding | [apps/web/src/context/NotificationsContext.tsx:68](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsProvider` | Function binding | [apps/web/src/context/NotificationsContext.tsx:74](../../apps/web/src/context/NotificationsContext.tsx) |
| `formatTime` | FunctionDeclaration | [apps/web/src/context/NotificationsContext.tsx:133](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsBellProps` | InterfaceDeclaration | [apps/web/src/context/NotificationsContext.tsx:146](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotificationsBell` | Function binding | [apps/web/src/context/NotificationsContext.tsx:150](../../apps/web/src/context/NotificationsContext.tsx) |
| `handleItemClick` | Function binding | [apps/web/src/context/NotificationsContext.tsx:157](../../apps/web/src/context/NotificationsContext.tsx) |
| `NotifItem` | Function binding | [apps/web/src/context/NotificationsContext.tsx:165](../../apps/web/src/context/NotificationsContext.tsx) |
| `useDebounce` | FunctionDeclaration | [apps/web/src/hooks/useDebounce.ts:3](../../apps/web/src/hooks/useDebounce.ts) |
| `useFullscreen` | FunctionDeclaration | [apps/web/src/hooks/useFullscreen.ts:4](../../apps/web/src/hooks/useFullscreen.ts) |
| `sync` | Function binding | [apps/web/src/hooks/useFullscreen.ts:8](../../apps/web/src/hooks/useFullscreen.ts) |
| `toggle` | Function binding | [apps/web/src/hooks/useFullscreen.ts:13](../../apps/web/src/hooks/useFullscreen.ts) |
| `useNotificationSync` | FunctionDeclaration | [apps/web/src/hooks/useNotificationSync.ts:20](../../apps/web/src/hooks/useNotificationSync.ts) |
| `usePersist` | FunctionDeclaration | [apps/web/src/hooks/usePersist.ts:4](../../apps/web/src/hooks/usePersist.ts) |
| `persist` | Function binding | [apps/web/src/hooks/usePersist.ts:14](../../apps/web/src/hooks/usePersist.ts) |
| `add` | Function binding | [apps/web/src/hooks/usePersist.ts:19](../../apps/web/src/hooks/usePersist.ts) |
| `update` | Function binding | [apps/web/src/hooks/usePersist.ts:25](../../apps/web/src/hooks/usePersist.ts) |
| `remove` | Function binding | [apps/web/src/hooks/usePersist.ts:29](../../apps/web/src/hooks/usePersist.ts) |
| `today` | Function binding | [apps/web/src/hooks/usePersist.ts:36](../../apps/web/src/hooks/usePersist.ts) |
| `fmtDate` | Function binding | [apps/web/src/hooks/usePersist.ts:37](../../apps/web/src/hooks/usePersist.ts) |
| `fmtAmt` | Function binding | [apps/web/src/hooks/usePersist.ts:38](../../apps/web/src/hooks/usePersist.ts) |
| `BookRecord` | InterfaceDeclaration | [apps/web/src/pages/BookEllam.tsx:38](../../apps/web/src/pages/BookEllam.tsx) |
| `BookEllam` | FunctionDeclaration | [apps/web/src/pages/BookEllam.tsx:51](../../apps/web/src/pages/BookEllam.tsx) |
| `exportToCSV` | Function binding | [apps/web/src/pages/BookEllam.tsx:224](../../apps/web/src/pages/BookEllam.tsx) |
| `TaxonomyEditor` | FunctionDeclaration | [apps/web/src/pages/CatalogueTaxonomy.tsx:9](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `save` | Function binding | [apps/web/src/pages/CatalogueTaxonomy.tsx:14](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `archive` | Function binding | [apps/web/src/pages/CatalogueTaxonomy.tsx:24](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `CatalogueTaxonomy` | FunctionDeclaration | [apps/web/src/pages/CatalogueTaxonomy.tsx:47](../../apps/web/src/pages/CatalogueTaxonomy.tsx) |
| `SummaryResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:39](../../apps/web/src/pages/CommandCenter.tsx) |
| `MachineResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:51](../../apps/web/src/pages/CommandCenter.tsx) |
| `InspectionResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:57](../../apps/web/src/pages/CommandCenter.tsx) |
| `InwardResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:62](../../apps/web/src/pages/CommandCenter.tsx) |
| `OutwardResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:74](../../apps/web/src/pages/CommandCenter.tsx) |
| `ProductionResponse` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:84](../../apps/web/src/pages/CommandCenter.tsx) |
| `formatQuantity` | FunctionDeclaration | [apps/web/src/pages/CommandCenter.tsx:96](../../apps/web/src/pages/CommandCenter.tsx) |
| `buildKpiCards` | FunctionDeclaration | [apps/web/src/pages/CommandCenter.tsx:102](../../apps/web/src/pages/CommandCenter.tsx) |
| `buildFeedEvents` | FunctionDeclaration | [apps/web/src/pages/CommandCenter.tsx:181](../../apps/web/src/pages/CommandCenter.tsx) |
| `MachineDetailDialog` | Function binding | [apps/web/src/pages/CommandCenter.tsx:250](../../apps/web/src/pages/CommandCenter.tsx) |
| `CommandCenterProps` | InterfaceDeclaration | [apps/web/src/pages/CommandCenter.tsx:426](../../apps/web/src/pages/CommandCenter.tsx) |
| `CommandCenter` | Function binding | [apps/web/src/pages/CommandCenter.tsx:430](../../apps/web/src/pages/CommandCenter.tsx) |
| `CommerceDesk` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:16](../../apps/web/src/pages/CommerceDesk.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:40](../../apps/web/src/pages/CommerceDesk.tsx) |
| `emptyItem` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:41](../../apps/web/src/pages/CommerceDesk.tsx) |
| `emptyCustomer` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:42](../../apps/web/src/pages/CommerceDesk.tsx) |
| `emptySales` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:45](../../apps/web/src/pages/CommerceDesk.tsx) |
| `saveItem` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:47](../../apps/web/src/pages/CommerceDesk.tsx) |
| `saveCustomer` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:48](../../apps/web/src/pages/CommerceDesk.tsx) |
| `editItem` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:49](../../apps/web/src/pages/CommerceDesk.tsx) |
| `editCustomer` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:50](../../apps/web/src/pages/CommerceDesk.tsx) |
| `submitAdjustment` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:51](../../apps/web/src/pages/CommerceDesk.tsx) |
| `submitOrder` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:52](../../apps/web/src/pages/CommerceDesk.tsx) |
| `submitInvoice` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:53](../../apps/web/src/pages/CommerceDesk.tsx) |
| `convertOrder` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:83](../../apps/web/src/pages/CommerceDesk.tsx) |
| `lineEditor` | Function binding | [apps/web/src/pages/CommerceDesk.tsx:85](../../apps/web/src/pages/CommerceDesk.tsx) |
| `CommerceReports` | Function binding | [apps/web/src/pages/CommerceReports.tsx:54](../../apps/web/src/pages/CommerceReports.tsx) |
| `handleRefresh` | Function binding | [apps/web/src/pages/CommerceReports.tsx:79](../../apps/web/src/pages/CommerceReports.tsx) |
| `handlePrint` | Function binding | [apps/web/src/pages/CommerceReports.tsx:88](../../apps/web/src/pages/CommerceReports.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Costing.tsx:49](../../apps/web/src/pages/Costing.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/Costing.tsx:55](../../apps/web/src/pages/Costing.tsx) |
| `CostingKPI` | InterfaceDeclaration | [apps/web/src/pages/Costing.tsx:64](../../apps/web/src/pages/Costing.tsx) |
| `Costing` | Function binding | [apps/web/src/pages/Costing.tsx:73](../../apps/web/src/pages/Costing.tsx) |
| `getFilteredEntries` | Function binding | [apps/web/src/pages/Costing.tsx:117](../../apps/web/src/pages/Costing.tsx) |
| `handleSuccess` | Function binding | [apps/web/src/pages/Costing.tsx:197](../../apps/web/src/pages/Costing.tsx) |
| `handleItemSaved` | Function binding | [apps/web/src/pages/Costing.tsx:202](../../apps/web/src/pages/Costing.tsx) |
| `handleDeleteEntry` | Function binding | [apps/web/src/pages/Costing.tsx:206](../../apps/web/src/pages/Costing.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/CostingEntry.tsx:23](../../apps/web/src/pages/CostingEntry.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/CostingEntry.tsx:29](../../apps/web/src/pages/CostingEntry.tsx) |
| `CostingEntryProps` | InterfaceDeclaration | [apps/web/src/pages/CostingEntry.tsx:38](../../apps/web/src/pages/CostingEntry.tsx) |
| `CostingEntry` | Function binding | [apps/web/src/pages/CostingEntry.tsx:47](../../apps/web/src/pages/CostingEntry.tsx) |
| `handleDelete` | Function binding | [apps/web/src/pages/CostingEntry.tsx:235](../../apps/web/src/pages/CostingEntry.tsx) |
| `handleEBSubmit` | Function binding | [apps/web/src/pages/CostingEntry.tsx:246](../../apps/web/src/pages/CostingEntry.tsx) |
| `handleEmployeeSubmit` | Function binding | [apps/web/src/pages/CostingEntry.tsx:269](../../apps/web/src/pages/CostingEntry.tsx) |
| `handlePackagingSubmit` | Function binding | [apps/web/src/pages/CostingEntry.tsx:292](../../apps/web/src/pages/CostingEntry.tsx) |
| `handleMaintenanceSubmit` | Function binding | [apps/web/src/pages/CostingEntry.tsx:315](../../apps/web/src/pages/CostingEntry.tsx) |
| `handleExpenseSubmit` | Function binding | [apps/web/src/pages/CostingEntry.tsx:338](../../apps/web/src/pages/CostingEntry.tsx) |
| `KPI` | InterfaceDeclaration | [apps/web/src/pages/Dashboard.tsx:60](../../apps/web/src/pages/Dashboard.tsx) |
| `DashboardSummary` | InterfaceDeclaration | [apps/web/src/pages/Dashboard.tsx:70](../../apps/web/src/pages/Dashboard.tsx) |
| `DashboardProps` | InterfaceDeclaration | [apps/web/src/pages/Dashboard.tsx:75](../../apps/web/src/pages/Dashboard.tsx) |
| `useCountUp` | FunctionDeclaration | [apps/web/src/pages/Dashboard.tsx:81](../../apps/web/src/pages/Dashboard.tsx) |
| `step` | Function binding | [apps/web/src/pages/Dashboard.tsx:88](../../apps/web/src/pages/Dashboard.tsx) |
| `Sparkline` | Function binding | [apps/web/src/pages/Dashboard.tsx:105](../../apps/web/src/pages/Dashboard.tsx) |
| `ActivityIcon` | Function binding | [apps/web/src/pages/Dashboard.tsx:129](../../apps/web/src/pages/Dashboard.tsx) |
| `groupByDay` | FunctionDeclaration | [apps/web/src/pages/Dashboard.tsx:144](../../apps/web/src/pages/Dashboard.tsx) |
| `CustomTooltip` | Function binding | [apps/web/src/pages/Dashboard.tsx:163](../../apps/web/src/pages/Dashboard.tsx) |
| `CostTooltip` | Function binding | [apps/web/src/pages/Dashboard.tsx:182](../../apps/web/src/pages/Dashboard.tsx) |
| `DonutCentreLabel` | Function binding | [apps/web/src/pages/Dashboard.tsx:203](../../apps/web/src/pages/Dashboard.tsx) |
| `EfficiencyStat` | Function binding | [apps/web/src/pages/Dashboard.tsx:217](../../apps/web/src/pages/Dashboard.tsx) |
| `Dashboard` | Function binding | [apps/web/src/pages/Dashboard.tsx:243](../../apps/web/src/pages/Dashboard.tsx) |
| `navigate` | Function binding | [apps/web/src/pages/Dashboard.tsx:244](../../apps/web/src/pages/Dashboard.tsx) |
| `getDateRange` | Function binding | [apps/web/src/pages/Dashboard.tsx:249](../../apps/web/src/pages/Dashboard.tsx) |
| `handleDateFilterChange` | Function binding | [apps/web/src/pages/Dashboard.tsx:301](../../apps/web/src/pages/Dashboard.tsx) |
| `formatDate` | Function binding | [apps/web/src/pages/Dashboard.tsx:305](../../apps/web/src/pages/Dashboard.tsx) |
| `formatRelativeTime` | Function binding | [apps/web/src/pages/Dashboard.tsx:309](../../apps/web/src/pages/Dashboard.tsx) |
| `KpiSkeleton` | Function binding | [apps/web/src/pages/Dashboard.tsx:356](../../apps/web/src/pages/Dashboard.tsx) |
| `QuickAction` | Function binding | [apps/web/src/pages/Dashboard.tsx:364](../../apps/web/src/pages/Dashboard.tsx) |
| `Helpdesk` | Function binding | [apps/web/src/pages/Helpdesk.tsx:98](../../apps/web/src/pages/Helpdesk.tsx) |
| `handleSubmitTicket` | Function binding | [apps/web/src/pages/Helpdesk.tsx:121](../../apps/web/src/pages/Helpdesk.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Insights.tsx:34](../../apps/web/src/pages/Insights.tsx) |
| `TabPanel` | Function binding | [apps/web/src/pages/Insights.tsx:40](../../apps/web/src/pages/Insights.tsx) |
| `ReportsTab` | Function binding | [apps/web/src/pages/Insights.tsx:77](../../apps/web/src/pages/Insights.tsx) |
| `InsightsTab` | Function binding | [apps/web/src/pages/Insights.tsx:121](../../apps/web/src/pages/Insights.tsx) |
| `Insights` | Function binding | [apps/web/src/pages/Insights.tsx:249](../../apps/web/src/pages/Insights.tsx) |
| `Integrations` | FunctionDeclaration | [apps/web/src/pages/Integrations.tsx:7](../../apps/web/src/pages/Integrations.tsx) |
| `invalidatePreview` | Function binding | [apps/web/src/pages/Integrations.tsx:20](../../apps/web/src/pages/Integrations.tsx) |
| `showError` | Function binding | [apps/web/src/pages/Integrations.tsx:21](../../apps/web/src/pages/Integrations.tsx) |
| `check` | Function binding | [apps/web/src/pages/Integrations.tsx:25](../../apps/web/src/pages/Integrations.tsx) |
| `commit` | Function binding | [apps/web/src/pages/Integrations.tsx:32](../../apps/web/src/pages/Integrations.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:67](../../apps/web/src/pages/Inventory.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/Inventory.tsx:73](../../apps/web/src/pages/Inventory.tsx) |
| `InventoryKPI` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:88](../../apps/web/src/pages/Inventory.tsx) |
| `InventoryItem` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:97](../../apps/web/src/pages/Inventory.tsx) |
| `InventoryProps` | InterfaceDeclaration | [apps/web/src/pages/Inventory.tsx:112](../../apps/web/src/pages/Inventory.tsx) |
| `formatRef` | FunctionDeclaration | [apps/web/src/pages/Inventory.tsx:125](../../apps/web/src/pages/Inventory.tsx) |
| `Inventory` | Function binding | [apps/web/src/pages/Inventory.tsx:143](../../apps/web/src/pages/Inventory.tsx) |
| `handleDeleteWaste` | Function binding | [apps/web/src/pages/Inventory.tsx:157](../../apps/web/src/pages/Inventory.tsx) |
| `handleWasteSubmit` | Function binding | [apps/web/src/pages/Inventory.tsx:175](../../apps/web/src/pages/Inventory.tsx) |
| `handleDateFilterChange` | Function binding | [apps/web/src/pages/Inventory.tsx:195](../../apps/web/src/pages/Inventory.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/Inventory.tsx:250](../../apps/web/src/pages/Inventory.tsx) |
| `renderMovementTable` | Function binding | [apps/web/src/pages/Inventory.tsx:277](../../apps/web/src/pages/Inventory.tsx) |
| `BatchEntry` | InterfaceDeclaration | [apps/web/src/pages/InwardEntry.tsx:77](../../apps/web/src/pages/InwardEntry.tsx) |
| `InwardEntryProps` | InterfaceDeclaration | [apps/web/src/pages/InwardEntry.tsx:92](../../apps/web/src/pages/InwardEntry.tsx) |
| `InwardEntry` | Function binding | [apps/web/src/pages/InwardEntry.tsx:97](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleDateFilterChange` | Function binding | [apps/web/src/pages/InwardEntry.tsx:142](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleInputChange` | Function binding | [apps/web/src/pages/InwardEntry.tsx:144](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleSupplierChange` | Function binding | [apps/web/src/pages/InwardEntry.tsx:150](../../apps/web/src/pages/InwardEntry.tsx) |
| `getFieldError` | Function binding | [apps/web/src/pages/InwardEntry.tsx:165](../../apps/web/src/pages/InwardEntry.tsx) |
| `markAllTouched` | Function binding | [apps/web/src/pages/InwardEntry.tsx:170](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleDeleteBatch` | Function binding | [apps/web/src/pages/InwardEntry.tsx:174](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleSubmit` | Function binding | [apps/web/src/pages/InwardEntry.tsx:193](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleMergeBatches` | Function binding | [apps/web/src/pages/InwardEntry.tsx:234](../../apps/web/src/pages/InwardEntry.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/InwardEntry.tsx:268](../../apps/web/src/pages/InwardEntry.tsx) |
| `JobWork` | Function binding | [apps/web/src/pages/JobWork.tsx:89](../../apps/web/src/pages/JobWork.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/JobWork.tsx:128](../../apps/web/src/pages/JobWork.tsx) |
| `createWorker` | Function binding | [apps/web/src/pages/JobWork.tsx:138](../../apps/web/src/pages/JobWork.tsx) |
| `dispatch` | Function binding | [apps/web/src/pages/JobWork.tsx:154](../../apps/web/src/pages/JobWork.tsx) |
| `openReceipt` | Function binding | [apps/web/src/pages/JobWork.tsx:187](../../apps/web/src/pages/JobWork.tsx) |
| `saveReceipt` | Function binding | [apps/web/src/pages/JobWork.tsx:198](../../apps/web/src/pages/JobWork.tsx) |
| `LogEntry` | InterfaceDeclaration | [apps/web/src/pages/Logs.tsx:36](../../apps/web/src/pages/Logs.tsx) |
| `LogsProps` | InterfaceDeclaration | [apps/web/src/pages/Logs.tsx:47](../../apps/web/src/pages/Logs.tsx) |
| `Logs` | Function binding | [apps/web/src/pages/Logs.tsx:79](../../apps/web/src/pages/Logs.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/Logs.tsx:119](../../apps/web/src/pages/Logs.tsx) |
| `newRow` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:58](../../apps/web/src/pages/OperationsDesk.tsx) |
| `OperationsDesk` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:60](../../apps/web/src/pages/OperationsDesk.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:116](../../apps/web/src/pages/OperationsDesk.tsx) |
| `saveInward` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:123](../../apps/web/src/pages/OperationsDesk.tsx) |
| `saveCost` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:159](../../apps/web/src/pages/OperationsDesk.tsx) |
| `print` | Function binding | [apps/web/src/pages/OperationsDesk.tsx:186](../../apps/web/src/pages/OperationsDesk.tsx) |
| `OutwardItem` | InterfaceDeclaration | [apps/web/src/pages/OutwardEntry.tsx:62](../../apps/web/src/pages/OutwardEntry.tsx) |
| `OutwardEntryProps` | InterfaceDeclaration | [apps/web/src/pages/OutwardEntry.tsx:69](../../apps/web/src/pages/OutwardEntry.tsx) |
| `OutwardEntry` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:74](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleMenuOpen` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:85](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleMenuClose` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:89](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleFilterChange` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:93](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleExportAction` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:101](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleItemChange` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:135](../../apps/web/src/pages/OutwardEntry.tsx) |
| `addItemRow` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:149](../../apps/web/src/pages/OutwardEntry.tsx) |
| `removeItemRow` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:154](../../apps/web/src/pages/OutwardEntry.tsx) |
| `getTotalBags` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:160](../../apps/web/src/pages/OutwardEntry.tsx) |
| `getTotalWeight` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:161](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleSave` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:163](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleDeleteOutward` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:254](../../apps/web/src/pages/OutwardEntry.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/OutwardEntry.tsx:267](../../apps/web/src/pages/OutwardEntry.tsx) |
| `ConsumptionItem` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:67](../../apps/web/src/pages/ProductionEntry.tsx) |
| `ProductionItem` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:74](../../apps/web/src/pages/ProductionEntry.tsx) |
| `WasteBreakdown` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:82](../../apps/web/src/pages/ProductionEntry.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:89](../../apps/web/src/pages/ProductionEntry.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/ProductionEntry.tsx:95](../../apps/web/src/pages/ProductionEntry.tsx) |
| `ProductionEntryProps` | InterfaceDeclaration | [apps/web/src/pages/ProductionEntry.tsx:110](../../apps/web/src/pages/ProductionEntry.tsx) |
| `ProductionEntry` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:115](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getAvailableConsumption` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:194](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleConsumedChange` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:205](../../apps/web/src/pages/ProductionEntry.tsx) |
| `addConsumed` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:218](../../apps/web/src/pages/ProductionEntry.tsx) |
| `removeConsumed` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:223](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleProducedChange` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:230](../../apps/web/src/pages/ProductionEntry.tsx) |
| `addProduced` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:245](../../apps/web/src/pages/ProductionEntry.tsx) |
| `removeProduced` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:250](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleWasteChange` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:257](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalConsumed` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:261](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalProduced` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:265](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalWaste` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:269](../../apps/web/src/pages/ProductionEntry.tsx) |
| `getTotalIntermediate` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:273](../../apps/web/src/pages/ProductionEntry.tsx) |
| `validateStart` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:275](../../apps/web/src/pages/ProductionEntry.tsx) |
| `checkBatchTiming` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:282](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleNext` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:296](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleBack` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:345](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleSave` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:349](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleDeleteProduction` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:399](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleCloseWizard` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:422](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleOpenWizard` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:438](../../apps/web/src/pages/ProductionEntry.tsx) |
| `handleExport` | Function binding | [apps/web/src/pages/ProductionEntry.tsx:444](../../apps/web/src/pages/ProductionEntry.tsx) |
| `SecuritySettings` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:35](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleGenerateTotp` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:60](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleVerifyTotp` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:74](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleDisableTotp` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:91](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleRegisterPasskey` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:108](../../apps/web/src/pages/SecuritySettings.tsx) |
| `handleChangePassword` | Function binding | [apps/web/src/pages/SecuritySettings.tsx:123](../../apps/web/src/pages/SecuritySettings.tsx) |
| `SessionManagement` | FunctionDeclaration | [apps/web/src/pages/SessionManagement.tsx:23](../../apps/web/src/pages/SessionManagement.tsx) |
| `TabPanelProps` | InterfaceDeclaration | [apps/web/src/pages/Settings.tsx:35](../../apps/web/src/pages/Settings.tsx) |
| `TabPanel` | FunctionDeclaration | [apps/web/src/pages/Settings.tsx:41](../../apps/web/src/pages/Settings.tsx) |
| `SettingsProps` | InterfaceDeclaration | [apps/web/src/pages/Settings.tsx:50](../../apps/web/src/pages/Settings.tsx) |
| `Settings` | Function binding | [apps/web/src/pages/Settings.tsx:68](../../apps/web/src/pages/Settings.tsx) |
| `handleSaveCompanySettings` | Function binding | [apps/web/src/pages/Settings.tsx:166](../../apps/web/src/pages/Settings.tsx) |
| `handleSaveRates` | Function binding | [apps/web/src/pages/Settings.tsx:189](../../apps/web/src/pages/Settings.tsx) |
| `handleSaveSystemSettings` | Function binding | [apps/web/src/pages/Settings.tsx:216](../../apps/web/src/pages/Settings.tsx) |
| `SharedPayments` | FunctionDeclaration | [apps/web/src/pages/SharedPayments.tsx:6](../../apps/web/src/pages/SharedPayments.tsx) |
| `download` | Function binding | [apps/web/src/pages/SharedPayments.tsx:10](../../apps/web/src/pages/SharedPayments.tsx) |
| `money` | Function binding | [apps/web/src/pages/ShopPortal.tsx:13](../../apps/web/src/pages/ShopPortal.tsx) |
| `ShopPortal` | FunctionDeclaration | [apps/web/src/pages/ShopPortal.tsx:20](../../apps/web/src/pages/ShopPortal.tsx) |
| `quantityFor` | Function binding | [apps/web/src/pages/ShopPortal.tsx:48](../../apps/web/src/pages/ShopPortal.tsx) |
| `setQuantity` | Function binding | [apps/web/src/pages/ShopPortal.tsx:49](../../apps/web/src/pages/ShopPortal.tsx) |
| `placeOrder` | Function binding | [apps/web/src/pages/ShopPortal.tsx:55](../../apps/web/src/pages/ShopPortal.tsx) |
| `switchLanguage` | Function binding | [apps/web/src/pages/ShopPortal.tsx:66](../../apps/web/src/pages/ShopPortal.tsx) |
| `money` | Function binding | [apps/web/src/pages/Store.tsx:11](../../apps/web/src/pages/Store.tsx) |
| `Store` | FunctionDeclaration | [apps/web/src/pages/Store.tsx:13](../../apps/web/src/pages/Store.tsx) |
| `changeQuantity` | Function binding | [apps/web/src/pages/Store.tsx:25](../../apps/web/src/pages/Store.tsx) |
| `reserveOrder` | Function binding | [apps/web/src/pages/Store.tsx:34](../../apps/web/src/pages/Store.tsx) |
| `TodayDashboardProps` | InterfaceDeclaration | [apps/web/src/pages/TodayDashboard.tsx:58](../../apps/web/src/pages/TodayDashboard.tsx) |
| `TodayDashboard` | Function binding | [apps/web/src/pages/TodayDashboard.tsx:62](../../apps/web/src/pages/TodayDashboard.tsx) |
| `navigate` | Function binding | [apps/web/src/pages/TodayDashboard.tsx:65](../../apps/web/src/pages/TodayDashboard.tsx) |
| `handleRefresh` | Function binding | [apps/web/src/pages/TodayDashboard.tsx:85](../../apps/web/src/pages/TodayDashboard.tsx) |
| `ChapterCard` | Function binding | [apps/web/src/pages/Tutorial.tsx:144](../../apps/web/src/pages/Tutorial.tsx) |
| `Tutorial` | Function binding | [apps/web/src/pages/Tutorial.tsx:163](../../apps/web/src/pages/Tutorial.tsx) |
| `handleStepComplete` | Function binding | [apps/web/src/pages/Tutorial.tsx:172](../../apps/web/src/pages/Tutorial.tsx) |
| `handleChapterChange` | Function binding | [apps/web/src/pages/Tutorial.tsx:182](../../apps/web/src/pages/Tutorial.tsx) |
| `UnifiedWorkspaceProps` | InterfaceDeclaration | [apps/web/src/pages/UnifiedWorkspace.tsx:102](../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| `UnifiedWorkspace` | Function binding | [apps/web/src/pages/UnifiedWorkspace.tsx:107](../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| `money` | Function binding | [apps/web/src/pages/UnifiedWorkspace.tsx:126](../../apps/web/src/pages/UnifiedWorkspace.tsx) |
| `User` | InterfaceDeclaration | [apps/web/src/pages/UserManagement.tsx:44](../../apps/web/src/pages/UserManagement.tsx) |
| `UserManagementProps` | InterfaceDeclaration | [apps/web/src/pages/UserManagement.tsx:55](../../apps/web/src/pages/UserManagement.tsx) |
| `UserManagement` | Function binding | [apps/web/src/pages/UserManagement.tsx:64](../../apps/web/src/pages/UserManagement.tsx) |
| `handleOpenDialog` | Function binding | [apps/web/src/pages/UserManagement.tsx:142](../../apps/web/src/pages/UserManagement.tsx) |
| `handleCloseDialog` | Function binding | [apps/web/src/pages/UserManagement.tsx:165](../../apps/web/src/pages/UserManagement.tsx) |
| `handleSubmit` | Function binding | [apps/web/src/pages/UserManagement.tsx:172](../../apps/web/src/pages/UserManagement.tsx) |
| `handleDelete` | Function binding | [apps/web/src/pages/UserManagement.tsx:201](../../apps/web/src/pages/UserManagement.tsx) |
| `getRoleColor` | Function binding | [apps/web/src/pages/UserManagement.tsx:207](../../apps/web/src/pages/UserManagement.tsx) |
| `field` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:12](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `titleCase` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:45](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `fmt` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:46](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `WorkflowDesk` | FunctionDeclaration | [apps/web/src/pages/WorkflowDesk.tsx:48](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `byKind` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:54](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `label` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:56](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `open` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:67](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `change` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:68](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `submit` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:75](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `changeLine` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:90](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `handleRelease` | Function binding | [apps/web/src/pages/WorkflowDesk.tsx:91](../../apps/web/src/pages/WorkflowDesk.tsx) |
| `CommerceReport` | InterfaceDeclaration | [apps/web/src/pages/yarn/ComplianceReports.tsx:15](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `PayrollEntry` | InterfaceDeclaration | [apps/web/src/pages/yarn/ComplianceReports.tsx:20](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `ComplianceReports` | Function binding | [apps/web/src/pages/yarn/ComplianceReports.tsx:24](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `refresh` | Function binding | [apps/web/src/pages/yarn/ComplianceReports.tsx:40](../../apps/web/src/pages/yarn/ComplianceReports.tsx) |
| `SalesOrder` | InterfaceDeclaration | [apps/web/src/pages/yarn/DemandForecasting.tsx:40](../../apps/web/src/pages/yarn/DemandForecasting.tsx) |
| `ForecastRow` | InterfaceDeclaration | [apps/web/src/pages/yarn/DemandForecasting.tsx:47](../../apps/web/src/pages/yarn/DemandForecasting.tsx) |
| `DemandForecasting` | Function binding | [apps/web/src/pages/yarn/DemandForecasting.tsx:55](../../apps/web/src/pages/yarn/DemandForecasting.tsx) |
| `Staff` | InterfaceDeclaration | [apps/web/src/pages/yarn/HRManagement.tsx:42](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `PayrollEntry` | InterfaceDeclaration | [apps/web/src/pages/yarn/HRManagement.tsx:56](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `HRManagement` | Function binding | [apps/web/src/pages/yarn/HRManagement.tsx:93](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `handleStaffSelectForPayroll` | Function binding | [apps/web/src/pages/yarn/HRManagement.tsx:181](../../apps/web/src/pages/yarn/HRManagement.tsx) |
| `STAT_CARDS` | Function binding | [apps/web/src/pages/yarn/LiveDashboard.tsx:39](../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| `LiveDashboard` | Function binding | [apps/web/src/pages/yarn/LiveDashboard.tsx:46](../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| `handleRefresh` | Function binding | [apps/web/src/pages/yarn/LiveDashboard.tsx:66](../../apps/web/src/pages/yarn/LiveDashboard.tsx) |
| `Machine` | InterfaceDeclaration | [apps/web/src/pages/yarn/MachineManagement.tsx:41](../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| `MachineInspection` | InterfaceDeclaration | [apps/web/src/pages/yarn/MachineManagement.tsx:53](../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| `MachineManagement` | Function binding | [apps/web/src/pages/yarn/MachineManagement.tsx:84](../../apps/web/src/pages/yarn/MachineManagement.tsx) |
| `QualityInspection` | InterfaceDeclaration | [apps/web/src/pages/yarn/QualityControl.tsx:38](../../apps/web/src/pages/yarn/QualityControl.tsx) |
| `QualityControl` | Function binding | [apps/web/src/pages/yarn/QualityControl.tsx:72](../../apps/web/src/pages/yarn/QualityControl.tsx) |
| `ShiftManagement` | Function binding | [apps/web/src/pages/yarn/ShiftManagement.tsx:32](../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| `handleOpen` | Function binding | [apps/web/src/pages/yarn/ShiftManagement.tsx:54](../../apps/web/src/pages/yarn/ShiftManagement.tsx) |
| `SupplierPortal` | Function binding | [apps/web/src/pages/yarn/SupplierPortal.tsx:28](../../apps/web/src/pages/yarn/SupplierPortal.tsx) |
| `WarehouseLocation` | InterfaceDeclaration | [apps/web/src/pages/yarn/WarehouseManagement.tsx:39](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| `WarehouseMovement` | InterfaceDeclaration | [apps/web/src/pages/yarn/WarehouseManagement.tsx:47](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| `WarehouseManagement` | Function binding | [apps/web/src/pages/yarn/WarehouseManagement.tsx:75](../../apps/web/src/pages/yarn/WarehouseManagement.tsx) |
| `IntrinsicElements` | InterfaceDeclaration | [apps/web/src/r3f-support.d.ts:5](../../apps/web/src/r3f-support.d.ts) |
| `Matchers` | InterfaceDeclaration | [apps/web/src/test/setup.ts:9](../../apps/web/src/test/setup.ts) |
| `ThemePalette` | InterfaceDeclaration | [apps/web/src/theme.ts:5](../../apps/web/src/theme.ts) |
| `getTheme` | Function binding | [apps/web/src/theme.ts:63](../../apps/web/src/theme.ts) |
| `setMutationListener` | Function binding | [apps/web/src/utils/api.ts:4](../../apps/web/src/utils/api.ts) |
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
| `DeleteGuardTrace` | InterfaceDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:5](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `DeleteGuardErrorPayload` | InterfaceDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:19](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `navigateToTab` | FunctionDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:34](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `handleDeleteGuardError` | FunctionDeclaration | [apps/web/src/utils/deleteGuardHandler.ts:45](../../apps/web/src/utils/deleteGuardHandler.ts) |
| `generateExcel` | Function binding | [apps/web/src/utils/excelGenerator.ts:4](../../apps/web/src/utils/excelGenerator.ts) |
| `downloadInvoicePdf` | FunctionDeclaration | [apps/web/src/utils/invoiceDocument.ts:13](../../apps/web/src/utils/invoiceDocument.ts) |
| `date` | Function binding | [apps/web/src/utils/invoiceDocument.ts:16](../../apps/web/src/utils/invoiceDocument.ts) |
| `didParseCell` | MethodDeclaration | [apps/web/src/utils/invoiceDocument.ts:54](../../apps/web/src/utils/invoiceDocument.ts) |
| `formatApiError` | Function binding | [apps/web/src/utils/messages.ts:220](../../apps/web/src/utils/messages.ts) |
| `formatSuccessMessage` | Function binding | [apps/web/src/utils/messages.ts:249](../../apps/web/src/utils/messages.ts) |
| `getCrudMessages` | Function binding | [apps/web/src/utils/messages.ts:260](../../apps/web/src/utils/messages.ts) |
| `canonicalPage` | FunctionDeclaration | [apps/web/src/utils/navigation.ts:2](../../apps/web/src/utils/navigation.ts) |
| `settingsTabFor` | FunctionDeclaration | [apps/web/src/utils/navigation.ts:17](../../apps/web/src/utils/navigation.ts) |
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
| `CompanyProfile` | InterfaceDeclaration | [packages/types/company-profile.ts:7](../../packages/types/company-profile.ts) |
| `normalizeCompanyProfile` | FunctionDeclaration | [packages/types/company-profile.ts:48](../../packages/types/company-profile.ts) |
| `isCompanyPageVisible` | FunctionDeclaration | [packages/types/company-profile.ts:66](../../packages/types/company-profile.ts) |
| `CompanyProfile` | InterfaceDeclaration | [packages/types/dist/company-profile.d.ts:6](../../packages/types/dist/company-profile.d.ts) |
| `normalizeCompanyProfile` | FunctionDeclaration | [packages/types/dist/company-profile.d.ts:12](../../packages/types/dist/company-profile.d.ts) |
| `isCompanyPageVisible` | FunctionDeclaration | [packages/types/dist/company-profile.d.ts:19](../../packages/types/dist/company-profile.d.ts) |
| `GeoCoordinate` | InterfaceDeclaration | [packages/types/dist/geo.d.ts:5](../../packages/types/dist/geo.d.ts) |
| `GeoFence` | InterfaceDeclaration | [packages/types/dist/geo.d.ts:12](../../packages/types/dist/geo.d.ts) |
| `GeoVerificationRecord` | InterfaceDeclaration | [packages/types/dist/geo.d.ts:18](../../packages/types/dist/geo.d.ts) |
| `calculateHaversineDistance` | FunctionDeclaration | [packages/types/dist/geo.d.ts:30](../../packages/types/dist/geo.d.ts) |
| `isWithinGeoFence` | FunctionDeclaration | [packages/types/dist/geo.d.ts:34](../../packages/types/dist/geo.d.ts) |
| `verifyGeoLocation` | FunctionDeclaration | [packages/types/dist/geo.d.ts:39](../../packages/types/dist/geo.d.ts) |
| `ApiError` | InterfaceDeclaration | [packages/types/dist/index.d.ts:9](../../packages/types/dist/index.d.ts) |
| `SelectOption` | InterfaceDeclaration | [packages/types/dist/index.d.ts:14](../../packages/types/dist/index.d.ts) |
| `AuthenticatedUser` | InterfaceDeclaration | [packages/types/dist/index.d.ts:18](../../packages/types/dist/index.d.ts) |
| `SessionRecord` | InterfaceDeclaration | [packages/types/dist/index.d.ts:25](../../packages/types/dist/index.d.ts) |
| `StockMovement` | InterfaceDeclaration | [packages/types/dist/index.d.ts:36](../../packages/types/dist/index.d.ts) |
| `InvoiceLine` | InterfaceDeclaration | [packages/types/dist/index.d.ts:47](../../packages/types/dist/index.d.ts) |
| `InvoiceTotals` | InterfaceDeclaration | [packages/types/dist/index.d.ts:57](../../packages/types/dist/index.d.ts) |
| `CustomerSummary` | InterfaceDeclaration | [packages/types/dist/index.d.ts:67](../../packages/types/dist/index.d.ts) |
| `TodayDashboardSummary` | InterfaceDeclaration | [packages/types/dist/index.d.ts:75](../../packages/types/dist/index.d.ts) |
| `ImportInput` | InterfaceDeclaration | [packages/types/dist/migration.d.ts:7](../../packages/types/dist/migration.d.ts) |
| `ImportIssue` | InterfaceDeclaration | [packages/types/dist/migration.d.ts:13](../../packages/types/dist/migration.d.ts) |
| `ImportPreview` | InterfaceDeclaration | [packages/types/dist/migration.d.ts:18](../../packages/types/dist/migration.d.ts) |
| `parseImportCsv` | FunctionDeclaration | [packages/types/dist/migration.d.ts:24](../../packages/types/dist/migration.d.ts) |
| `previewImport` | FunctionDeclaration | [packages/types/dist/migration.d.ts:28](../../packages/types/dist/migration.d.ts) |
| `WeighbridgeMeasurement` | InterfaceDeclaration | [packages/types/dist/weighbridge.d.ts:2](../../packages/types/dist/weighbridge.d.ts) |
| `WeighbridgeReceipt` | InterfaceDeclaration | [packages/types/dist/weighbridge.d.ts:10](../../packages/types/dist/weighbridge.d.ts) |
| `calculateWeighbridge` | FunctionDeclaration | [packages/types/dist/weighbridge.d.ts:21](../../packages/types/dist/weighbridge.d.ts) |
| `GeoCoordinate` | InterfaceDeclaration | [packages/types/geo.ts:6](../../packages/types/geo.ts) |
| `GeoFence` | InterfaceDeclaration | [packages/types/geo.ts:14](../../packages/types/geo.ts) |
| `GeoVerificationRecord` | InterfaceDeclaration | [packages/types/geo.ts:21](../../packages/types/geo.ts) |
| `toRadians` | FunctionDeclaration | [packages/types/geo.ts:32](../../packages/types/geo.ts) |
| `calculateHaversineDistance` | FunctionDeclaration | [packages/types/geo.ts:40](../../packages/types/geo.ts) |
| `isWithinGeoFence` | FunctionDeclaration | [packages/types/geo.ts:82](../../packages/types/geo.ts) |
| `verifyGeoLocation` | FunctionDeclaration | [packages/types/geo.ts:96](../../packages/types/geo.ts) |
| `ApiError` | InterfaceDeclaration | [packages/types/index.ts:12](../../packages/types/index.ts) |
| `SelectOption` | InterfaceDeclaration | [packages/types/index.ts:18](../../packages/types/index.ts) |
| `AuthenticatedUser` | InterfaceDeclaration | [packages/types/index.ts:23](../../packages/types/index.ts) |
| `SessionRecord` | InterfaceDeclaration | [packages/types/index.ts:31](../../packages/types/index.ts) |
| `StockMovement` | InterfaceDeclaration | [packages/types/index.ts:43](../../packages/types/index.ts) |
| `InvoiceLine` | InterfaceDeclaration | [packages/types/index.ts:55](../../packages/types/index.ts) |
| `InvoiceTotals` | InterfaceDeclaration | [packages/types/index.ts:66](../../packages/types/index.ts) |
| `CustomerSummary` | InterfaceDeclaration | [packages/types/index.ts:77](../../packages/types/index.ts) |
| `TodayDashboardSummary` | InterfaceDeclaration | [packages/types/index.ts:86](../../packages/types/index.ts) |
| `ImportInput` | InterfaceDeclaration | [packages/types/migration.ts:7](../../packages/types/migration.ts) |
| `ImportIssue` | InterfaceDeclaration | [packages/types/migration.ts:8](../../packages/types/migration.ts) |
| `ImportPreview` | InterfaceDeclaration | [packages/types/migration.ts:9](../../packages/types/migration.ts) |
| `parseImportCsv` | FunctionDeclaration | [packages/types/migration.ts:13](../../packages/types/migration.ts) |
| `pushRow` | Function binding | [packages/types/migration.ts:17](../../packages/types/migration.ts) |
| `previewImport` | FunctionDeclaration | [packages/types/migration.ts:43](../../packages/types/migration.ts) |
| `issue` | Function binding | [packages/types/migration.ts:59](../../packages/types/migration.ts) |
| `WeighbridgeMeasurement` | InterfaceDeclaration | [packages/types/weighbridge.ts:3](../../packages/types/weighbridge.ts) |
| `WeighbridgeReceipt` | InterfaceDeclaration | [packages/types/weighbridge.ts:12](../../packages/types/weighbridge.ts) |
| `calculateWeighbridge` | FunctionDeclaration | [packages/types/weighbridge.ts:24](../../packages/types/weighbridge.ts) |
| `validNumber` | Function binding | [packages/types/weighbridge.ts:26](../../packages/types/weighbridge.ts) |
| `round` | Function binding | [packages/types/weighbridge.ts:33](../../packages/types/weighbridge.ts) |
