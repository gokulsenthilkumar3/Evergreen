-- Rebuild Company table to cleanly add licensing, regional tier, and quota columns
-- Works safely on both fresh deployments and databases previously synchronized with db push.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "deploymentUrl" TEXT,
    "cloudProvider" TEXT NOT NULL DEFAULT 'LOCAL_VM',
    "appVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "apiKey" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'SEED',
    "businessMode" TEXT NOT NULL DEFAULT 'INTEGRATED',
    "workspaceMode" TEXT NOT NULL DEFAULT 'GUIDED',
    "activeStaff" INTEGER NOT NULL DEFAULT 0,
    "docsPosted" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'TIER_2_CITY',
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "country" TEXT NOT NULL DEFAULT 'IN',
    "pricingModel" TEXT NOT NULL DEFAULT 'TIERED',
    "licenseKey" TEXT,
    "validFrom" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 30,
    "graceExpiresAt" DATETIME,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "maxMachines" INTEGER NOT NULL DEFAULT 5,
    "maxDocsPerMonth" INTEGER NOT NULL DEFAULT 500,
    "allowedModules" TEXT NOT NULL DEFAULT 'CORE,INVENTORY,COMMERCE',
    "isMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "lastMigrationStatus" TEXT NOT NULL DEFAULT 'UP_TO_DATE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Company" (
    "id", "name", "deploymentUrl", "cloudProvider", "appVersion", "apiKey",
    "plan", "businessMode", "workspaceMode", "activeStaff", "docsPosted",
    "status", "lastSyncAt", "createdAt", "updatedAt"
)
SELECT 
    "id", "name", "deploymentUrl", "cloudProvider", "appVersion", "apiKey",
    "plan", "businessMode", "workspaceMode", "activeStaff", "docsPosted",
    "status", "lastSyncAt", "createdAt", "updatedAt"
FROM "Company";

DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_apiKey_key" ON "Company"("apiKey");

CREATE TABLE IF NOT EXISTS "RemoteAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "RemoteAction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "RemoteAction_companyId_idx" ON "RemoteAction"("companyId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
