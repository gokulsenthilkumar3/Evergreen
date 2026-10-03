-- Align database defaults with the Prisma schema without changing existing records.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "gstin" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
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
    "language" TEXT NOT NULL DEFAULT 'en',
    "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "supportedCounts" TEXT DEFAULT '2,4,6,8,10',
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_SystemSettings" ("address", "autoBackup", "companyName", "createdBy", "defaultInvoiceTheme", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "language", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "sellerState", "supportedCounts", "updatedAt", "updatedBy") SELECT "address", "autoBackup", "companyName", "createdBy", "defaultInvoiceTheme", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "language", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "sellerState", "supportedCounts", "updatedAt", "updatedBy" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
