-- CreateTable
CREATE TABLE IF NOT EXISTS "Brand" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CatalogueCategory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CatalogueItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "uom" TEXT NOT NULL DEFAULT 'KG',
    "hsnSac" TEXT,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "salePrice" REAL NOT NULL DEFAULT 0,
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "costPrice" REAL NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "shopVisible" BOOLEAN NOT NULL DEFAULT false,
    "legacySource" TEXT,
    "legacyId" TEXT,
    "brandId" INTEGER,
    "categoryId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CatalogueItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CatalogueItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CatalogueCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InwardReceipt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplierName" TEXT NOT NULL,
    "referenceNumber" TEXT,
    "notes" TEXT,
    "total" REAL NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "InwardReceiptLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "unitCost" REAL NOT NULL,
    CONSTRAINT "InwardReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "InwardReceipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InwardReceiptLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CostingSheet" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "styleCode" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "total" REAL NOT NULL DEFAULT 0,
    "components" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StockMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "itemId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" REAL NOT NULL,
    "reservedQty" REAL NOT NULL DEFAULT 0,
    "movementType" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "legacySource" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "state" TEXT DEFAULT 'Tamil Nadu',
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CustomerLedgerEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0,
    "credit" REAL NOT NULL DEFAULT 0,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerLedgerEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "JobWorker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "gstin" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "JobWorkChallan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challanNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "jobWorkerId" INTEGER NOT NULL,
    "processType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobWorkChallan_jobWorkerId_fkey" FOREIGN KEY ("jobWorkerId") REFERENCES "JobWorker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "JobWorkDispatchLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challanId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobWorkDispatchLine_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "JobWorkChallan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JobWorkDispatchLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "JobWorkReceiptLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challanId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "scrapQty" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobWorkReceiptLine_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "JobWorkChallan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JobWorkReceiptLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SalesOrder" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderNo" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subtotal" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SalesOrderLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "invoicedQty" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "SalesOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "customerId" INTEGER,
    "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "buyerState" TEXT,
    "dueDate" DATETIME,
    "discount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "documentHash" TEXT,
    "verificationKey" TEXT,
    "salesOrderId" INTEGER,
    "transportMode" TEXT,
    "vehicleNo" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'CLASSIC',
    "subtotal" REAL NOT NULL,
    "cgst" REAL NOT NULL,
    "sgst" REAL NOT NULL,
    "igst" REAL NOT NULL DEFAULT 0,
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
    "updatedBy" TEXT,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amountPaid", "authorizedSignatory", "buyerState", "cgst", "createdAt", "createdBy", "currency", "customerAddress", "customerGSTIN", "customerId", "customerName", "customerSignature", "date", "discount", "documentHash", "dueDate", "entryTimestamp", "id", "igst", "invoiceNo", "issuerSignature", "notes", "salesOrderId", "sellerState", "senderName", "sgst", "status", "subtotal", "terms", "theme", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo", "verificationKey") SELECT "amountPaid", "authorizedSignatory", NULL, "cgst", "createdAt", "createdBy", 'INR', "customerAddress", "customerGSTIN", NULL, "customerName", "customerSignature", "date", 0, NULL, NULL, "entryTimestamp", "id", 0, "invoiceNo", "issuerSignature", "notes", NULL, 'Tamil Nadu', "senderName", "sgst", "status", "subtotal", "terms", "theme", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo", NULL FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");
CREATE TABLE "new_InvoiceItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "invoiceId" INTEGER NOT NULL,
    "yarnCount" TEXT NOT NULL DEFAULT '',
    "bags" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL,
    "itemId" INTEGER,
    "description" TEXT,
    "hsnSac" TEXT,
    "uom" TEXT,
    "quantity" REAL,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_InvoiceItem" ("bags", "id", "invoiceId", "rate", "weight", "yarnCount") SELECT "bags", "id", "invoiceId", "rate", "weight", "yarnCount" FROM "InvoiceItem";
DROP TABLE "InvoiceItem";
ALTER TABLE "new_InvoiceItem" RENAME TO "InvoiceItem";
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
INSERT INTO "new_SystemSettings" ("address", "autoBackup", "companyName", "createdBy", "defaultInvoiceTheme", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "language", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "sellerState", "supportedCounts", "updatedAt", "updatedBy") SELECT "address", "autoBackup", "companyName", "createdBy", "defaultInvoiceTheme", "ebRate", "email", "emailNotifications", "entryTimestamp", "gstPercent", "gstin", "id", "language", "logo", "lowStockAlert", "lowStockThreshold", "maintenanceRate", "packageRate", "phone", "sellerState", "supportedCounts", "updatedAt", "updatedBy" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CatalogueCategory_name_key" ON "CatalogueCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CatalogueItem_sku_key" ON "CatalogueItem"("sku");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CatalogueItem_type_idx" ON "CatalogueItem"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CatalogueItem_name_idx" ON "CatalogueItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "InwardReceipt_receiptNo_key" ON "InwardReceipt"("receiptNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CostingSheet_styleCode_key" ON "CostingSheet"("styleCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockMovement_itemId_date_idx" ON "StockMovement"("itemId", "date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StockMovement_referenceType_referenceId_idx" ON "StockMovement"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CustomerLedgerEntry_customerId_date_idx" ON "CustomerLedgerEntry"("customerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "JobWorker_name_key" ON "JobWorker"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "JobWorkChallan_challanNo_key" ON "JobWorkChallan"("challanNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SalesOrder_orderNo_key" ON "SalesOrder"("orderNo");
