-- AlterTable
ALTER TABLE "User" ADD COLUMN "createdBy" TEXT;
ALTER TABLE "User" ADD COLUMN "updatedBy" TEXT;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "token" TEXT,
    "ipAddress" TEXT,
    "location" TEXT,
    "device" TEXT,
    "userAgent" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SystemSettings" (
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
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "CostingEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "details" TEXT,
    "totalCost" REAL NOT NULL,
    "unitsConsumed" REAL,
    "ratePerUnit" REAL,
    "noOfShifts" INTEGER,
    "workers" INTEGER,
    "yarnProduced" REAL,
    "rate" REAL,
    "description" TEXT,
    "type" TEXT,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT,
    "customerGSTIN" TEXT,
    "transportMode" TEXT,
    "vehicleNo" TEXT,
    "subtotal" REAL NOT NULL,
    "cgst" REAL NOT NULL,
    "sgst" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "yarnCount" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "rate" REAL NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'CASH',
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CottonInventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
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
INSERT INTO "new_CottonInventory" ("balance", "batchId", "createdAt", "date", "id", "productionId", "quantity", "reference", "type", "updatedAt") SELECT "balance", "batchId", "createdAt", "date", "id", "productionId", "quantity", "reference", "type", "updatedAt" FROM "CottonInventory";
DROP TABLE "CottonInventory";
ALTER TABLE "new_CottonInventory" RENAME TO "CottonInventory";
CREATE TABLE "new_InwardBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "supplier" TEXT NOT NULL,
    "bale" INTEGER NOT NULL,
    "kg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_InwardBatch" ("bale", "batchId", "createdAt", "date", "id", "kg", "supplier", "updatedAt") SELECT "bale", "batchId", "createdAt", "date", "id", "kg", "supplier", "updatedAt" FROM "InwardBatch";
DROP TABLE "InwardBatch";
ALTER TABLE "new_InwardBatch" RENAME TO "InwardBatch";
CREATE UNIQUE INDEX "InwardBatch_batchId_key" ON "InwardBatch"("batchId");
CREATE TABLE "new_Outward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "customerName" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "driverName" TEXT,
    "totalBags" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_Outward" ("createdAt", "customerName", "date", "driverName", "id", "totalBags", "totalWeight", "updatedAt", "vehicleNo") SELECT "createdAt", "customerName", "date", "driverName", "id", "totalBags", "totalWeight", "updatedAt", "vehicleNo" FROM "Outward";
DROP TABLE "Outward";
ALTER TABLE "new_Outward" RENAME TO "Outward";
CREATE TABLE "new_OutwardItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outwardId" INTEGER NOT NULL,
    "count" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "OutwardItem_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "Outward" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OutwardItem" ("bags", "count", "createdAt", "id", "outwardId", "weight") SELECT "bags", "count", "createdAt", "id", "outwardId", "weight" FROM "OutwardItem";
DROP TABLE "OutwardItem";
ALTER TABLE "new_OutwardItem" RENAME TO "OutwardItem";
CREATE TABLE "new_Production" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "totalConsumed" REAL NOT NULL,
    "totalProduced" REAL NOT NULL,
    "totalWaste" REAL NOT NULL,
    "wasteBlowRoom" REAL NOT NULL DEFAULT 0,
    "wasteCarding" REAL NOT NULL DEFAULT 0,
    "wasteOE" REAL NOT NULL DEFAULT 0,
    "wasteOthers" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_Production" ("createdAt", "date", "id", "totalConsumed", "totalProduced", "totalWaste", "updatedAt", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers") SELECT "createdAt", "date", "id", "totalConsumed", "totalProduced", "totalWaste", "updatedAt", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers" FROM "Production";
DROP TABLE "Production";
ALTER TABLE "new_Production" RENAME TO "Production";
CREATE TABLE "new_ProductionConsumption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionId" INTEGER NOT NULL,
    "batchNo" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "ProductionConsumption_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductionConsumption" ("batchNo", "createdAt", "id", "productionId", "weight") SELECT "batchNo", "createdAt", "id", "productionId", "weight" FROM "ProductionConsumption";
DROP TABLE "ProductionConsumption";
ALTER TABLE "new_ProductionConsumption" RENAME TO "ProductionConsumption";
CREATE TABLE "new_ProductionOutput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionId" INTEGER NOT NULL,
    "count" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "bags" INTEGER NOT NULL,
    "remainingLog" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "ProductionOutput_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductionOutput" ("bags", "count", "createdAt", "id", "productionId", "remainingLog", "weight") SELECT "bags", "count", "createdAt", "id", "productionId", "remainingLog", "weight" FROM "ProductionOutput";
DROP TABLE "ProductionOutput";
ALTER TABLE "new_ProductionOutput" RENAME TO "ProductionOutput";
CREATE TABLE "new_WasteInventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "reference" TEXT NOT NULL,
    "wasteBlowRoom" REAL NOT NULL DEFAULT 0,
    "wasteCarding" REAL NOT NULL DEFAULT 0,
    "wasteOE" REAL NOT NULL DEFAULT 0,
    "wasteOthers" REAL NOT NULL DEFAULT 0,
    "productionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "WasteInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WasteInventory" ("balance", "createdAt", "date", "id", "productionId", "quantity", "reference", "type", "updatedAt", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers") SELECT "balance", "createdAt", "date", "id", "productionId", "quantity", "reference", "type", "updatedAt", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers" FROM "WasteInventory";
DROP TABLE "WasteInventory";
ALTER TABLE "new_WasteInventory" RENAME TO "WasteInventory";
CREATE TABLE "new_YarnInventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "balance" REAL NOT NULL,
    "reference" TEXT NOT NULL,
    "count" TEXT,
    "productionId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "YarnInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_YarnInventory" ("balance", "count", "createdAt", "date", "id", "productionId", "quantity", "reference", "type", "updatedAt") SELECT "balance", "count", "createdAt", "date", "id", "productionId", "quantity", "reference", "type", "updatedAt" FROM "YarnInventory";
DROP TABLE "YarnInventory";
ALTER TABLE "new_YarnInventory" RENAME TO "YarnInventory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");
