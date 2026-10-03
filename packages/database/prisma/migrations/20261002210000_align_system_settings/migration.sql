-- Rebuild rather than ADD COLUMN so databases previously synchronized with
-- `prisma db push` (where these columns already exist) can be baselined safely.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "language" TEXT NOT NULL DEFAULT 'en',
    "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "supportedCounts" TEXT DEFAULT '2,4,6,8,10',
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT
);
INSERT INTO "new_SystemSettings" ("address", "autoBackup", "companyName", "createdBy", "defaultInvoiceTheme", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "supportedCounts", "updatedAt", "updatedBy") SELECT "address", "autoBackup", "companyName", "createdBy", "defaultInvoiceTheme", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "supportedCounts", "updatedAt", "updatedBy" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Replace the former broad sample list only when it still has the legacy default.
UPDATE "SystemSettings"
SET "supportedCounts" = '2,4,6,8,10'
WHERE "supportedCounts" = '2,4,6,8,10,12,14,16,20';
