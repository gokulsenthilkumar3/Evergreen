-- AlterTable
ALTER TABLE "CompanyMetrics" ADD COLUMN "additionalMetrics" TEXT;

-- RedefineTables
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
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("activeStaff", "apiKey", "businessMode", "createdAt", "deploymentUrl", "docsPosted", "id", "lastSyncAt", "name", "plan", "status", "updatedAt", "workspaceMode") SELECT "activeStaff", "apiKey", "businessMode", "createdAt", "deploymentUrl", "docsPosted", "id", "lastSyncAt", "name", "plan", "status", "updatedAt", "workspaceMode" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_apiKey_key" ON "Company"("apiKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
