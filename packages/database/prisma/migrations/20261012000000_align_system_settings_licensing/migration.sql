-- Keep the licensing projection in sync with the current tenant Prisma model.
-- These additive columns are safe for existing SQLite customer databases and
-- are also replayable on a clean database after the earlier settings tables.
ALTER TABLE "SystemSettings" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'SEED';
ALTER TABLE "SystemSettings" ADD COLUMN "pricingModel" TEXT NOT NULL DEFAULT 'TIERED';
ALTER TABLE "SystemSettings" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "SystemSettings" ADD COLUMN "licenseExpiresAt" DATETIME;
ALTER TABLE "SystemSettings" ADD COLUMN "gracePeriodDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "SystemSettings" ADD COLUMN "graceExpiresAt" DATETIME;
ALTER TABLE "SystemSettings" ADD COLUMN "maxUsers" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "SystemSettings" ADD COLUMN "maxMachines" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "SystemSettings" ADD COLUMN "maxDocsPerMonth" INTEGER NOT NULL DEFAULT 500;
ALTER TABLE "SystemSettings" ADD COLUMN "allowedModules" TEXT NOT NULL DEFAULT 'CORE,INVENTORY,COMMERCE';
ALTER TABLE "SystemSettings" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'TIER_2_CITY';
ALTER TABLE "SystemSettings" ADD COLUMN "state" TEXT NOT NULL DEFAULT 'Tamil Nadu';
ALTER TABLE "SystemSettings" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'IN';
ALTER TABLE "SystemSettings" ADD COLUMN "isMaintenance" BOOLEAN NOT NULL DEFAULT false;
