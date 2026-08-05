-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT,
    "customerGSTIN" TEXT,
    "transportMode" TEXT,
    "vehicleNo" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'CLASSIC',
    "subtotal" REAL NOT NULL,
    "cgst" REAL NOT NULL,
    "sgst" REAL NOT NULL,
    "total" REAL NOT NULL,
    "issuerSignature" TEXT,
    "customerSignature" TEXT,
    "authorizedSignatory" TEXT,
    "senderName" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_Invoice" ("amountPaid", "cgst", "createdAt", "createdBy", "customerAddress", "customerGSTIN", "customerName", "date", "entryTimestamp", "id", "invoiceNo", "sgst", "status", "subtotal", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo") SELECT "amountPaid", "cgst", "createdAt", "createdBy", "customerAddress", "customerGSTIN", "customerName", "date", "entryTimestamp", "id", "invoiceNo", "sgst", "status", "subtotal", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");
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
    "updatedBy" TEXT,
    "mergedFrom" TEXT,
    "isMerged" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_InwardBatch" ("bale", "batchId", "createdAt", "createdBy", "date", "entryTimestamp", "id", "kg", "supplier", "updatedAt", "updatedBy") SELECT "bale", "batchId", "createdAt", "createdBy", "date", "entryTimestamp", "id", "kg", "supplier", "updatedAt", "updatedBy" FROM "InwardBatch";
DROP TABLE "InwardBatch";
ALTER TABLE "new_InwardBatch" RENAME TO "InwardBatch";
CREATE UNIQUE INDEX "InwardBatch_batchId_key" ON "InwardBatch"("batchId");
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
    "defaultInvoiceTheme" TEXT NOT NULL DEFAULT 'CLASSIC',
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
INSERT INTO "new_SystemSettings" ("address", "autoBackup", "companyName", "createdBy", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "supportedCounts", "updatedAt", "updatedBy") SELECT "address", "autoBackup", "companyName", "createdBy", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "supportedCounts", "updatedAt", "updatedBy" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
