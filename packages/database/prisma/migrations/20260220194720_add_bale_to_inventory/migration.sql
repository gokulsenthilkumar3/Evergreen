-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CottonInventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "bale" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL,
    "reference" TEXT NOT NULL,
    "batchId" TEXT,
    "productionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "CottonInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CottonInventory" ("balance", "batchId", "createdAt", "createdBy", "date", "entryTimestamp", "id", "productionId", "quantity", "reference", "type", "updatedAt", "updatedBy") SELECT "balance", "batchId", "createdAt", "createdBy", "date", "entryTimestamp", "id", "productionId", "quantity", "reference", "type", "updatedAt", "updatedBy" FROM "CottonInventory";
DROP TABLE "CottonInventory";
ALTER TABLE "new_CottonInventory" RENAME TO "CottonInventory";
CREATE TABLE "new_ProductionConsumption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionId" INTEGER NOT NULL,
    "batchNo" TEXT NOT NULL,
    "bale" REAL NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "ProductionConsumption_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductionConsumption" ("batchNo", "createdAt", "createdBy", "entryTimestamp", "id", "productionId", "updatedBy", "weight") SELECT "batchNo", "createdAt", "createdBy", "entryTimestamp", "id", "productionId", "updatedBy", "weight" FROM "ProductionConsumption";
DROP TABLE "ProductionConsumption";
ALTER TABLE "new_ProductionConsumption" RENAME TO "ProductionConsumption";
CREATE TABLE "new_SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT NOT NULL DEFAULT 'Ever Green Yarn Mills',
    "address" TEXT NOT NULL DEFAULT 'Industrial Area, Coimbatore',
    "gstin" TEXT NOT NULL DEFAULT '33XXXXX1234X1Z5',
    "phone" TEXT NOT NULL DEFAULT '+91 98765 43210',
    "email" TEXT NOT NULL DEFAULT 'info@evergreenyarn.com',
    "logo" TEXT,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "lowStockAlert" BOOLEAN NOT NULL DEFAULT true,
    "lowStockThreshold" TEXT NOT NULL DEFAULT '500',
    "maintenanceRate" TEXT NOT NULL DEFAULT '4',
    "ebRate" TEXT NOT NULL DEFAULT '10',
    "packageRate" TEXT NOT NULL DEFAULT '1.6',
    "gstPercent" TEXT NOT NULL DEFAULT '18',
    "supportedCounts" TEXT DEFAULT '2,4,6,8,10,12,14,16,20',
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_SystemSettings" ("address", "autoBackup", "companyName", "createdBy", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstin", "id", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "updatedAt", "updatedBy") SELECT "address", "autoBackup", "companyName", "createdBy", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstin", "id", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "updatedAt", "updatedBy" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
