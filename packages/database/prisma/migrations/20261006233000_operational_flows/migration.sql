-- AlterTable
ALTER TABLE "QualityInspection" ADD COLUMN "holdQuantity" REAL;
ALTER TABLE "QualityInspection" ADD COLUMN "lotId" INTEGER;

-- CreateTable
CREATE TABLE "WorkflowDocument" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentNo" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestKey" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "customerId" INTEGER,
    "supplierId" INTEGER,
    "invoiceId" INTEGER,
    "orderId" INTEGER,
    "originId" INTEGER,
    "subtotal" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "total" REAL NOT NULL DEFAULT 0,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowDocument_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkflowDocument_originId_fkey" FOREIGN KEY ("originId") REFERENCES "WorkflowDocument" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "documentId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "sourceLineId" INTEGER,
    "invoiceItemId" INTEGER,
    "lotId" INTEGER,
    "quantity" REAL NOT NULL,
    "rejectedQty" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL DEFAULT 0,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "net" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "direction" TEXT NOT NULL DEFAULT 'IN',
    CONSTRAINT "WorkflowLine_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "WorkflowDocument" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkflowLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "StockLot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "grade" TEXT,
    "colour" TEXT,
    "owner" TEXT NOT NULL DEFAULT 'COMPANY',
    "origin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockLot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockHold" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lotId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "inspectionId" INTEGER,
    "createdBy" TEXT NOT NULL,
    "releasedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" DATETIME,
    CONSTRAINT "StockHold_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "StockLot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WipLot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "remaining" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN'
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceKey" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JournalLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "account" TEXT NOT NULL,
    "party" TEXT,
    "debit" REAL NOT NULL DEFAULT 0,
    "credit" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockValuation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "movementId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "unitCost" REAL,
    "value" REAL,
    "status" TEXT NOT NULL DEFAULT 'UNVALUED',
    CONSTRAINT "StockValuation_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "StockMovement" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountingPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "through" DATETIME NOT NULL,
    "closedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    "sellerName" TEXT,
    "sellerAddress" TEXT,
    "sellerGSTIN" TEXT,
    "customerId" INTEGER,
    "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "buyerState" TEXT,
    "dueDate" DATETIME,
    "discount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "documentHash" TEXT,
    "verificationKey" TEXT,
    "salesOrderId" INTEGER,
    "outwardId" INTEGER,
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
    "creditTotal" REAL NOT NULL DEFAULT 0,
    "requestKey" TEXT,
    "requestHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "Outward" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amountPaid", "authorizedSignatory", "buyerState", "cgst", "createdAt", "createdBy", "currency", "customerAddress", "customerGSTIN", "customerId", "customerName", "customerSignature", "date", "discount", "documentHash", "dueDate", "entryTimestamp", "id", "igst", "invoiceNo", "issuerSignature", "notes", "outwardId", "salesOrderId", "sellerAddress", "sellerGSTIN", "sellerName", "sellerState", "senderName", "sgst", "status", "subtotal", "terms", "theme", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo", "verificationKey") SELECT "amountPaid", "authorizedSignatory", "buyerState", "cgst", "createdAt", "createdBy", "currency", "customerAddress", "customerGSTIN", "customerId", "customerName", "customerSignature", "date", "discount", "documentHash", "dueDate", "entryTimestamp", "id", "igst", "invoiceNo", "issuerSignature", "notes", "outwardId", "salesOrderId", "sellerAddress", "sellerGSTIN", "sellerName", "sellerState", "senderName", "sgst", "status", "subtotal", "terms", "theme", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo", "verificationKey" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");
CREATE UNIQUE INDEX "Invoice_requestKey_key" ON "Invoice"("requestKey");
CREATE TABLE "new_SalesOrderLine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "invoicedQty" REAL NOT NULL DEFAULT 0,
    "dispatchedQty" REAL NOT NULL DEFAULT 0,
    "rate" REAL NOT NULL,
    "gstRate" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "SalesOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SalesOrderLine" ("discount", "gstRate", "id", "invoicedQty", "itemId", "orderId", "quantity", "rate") SELECT "discount", "gstRate", "id", "invoicedQty", "itemId", "orderId", "quantity", "rate" FROM "SalesOrderLine";
DROP TABLE "SalesOrderLine";
ALTER TABLE "new_SalesOrderLine" RENAME TO "SalesOrderLine";
CREATE TABLE "new_StockMovement" (
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
    "lotId" INTEGER,
    "unitCost" REAL,
    CONSTRAINT "StockMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "CatalogueItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "StockLot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StockMovement" ("createdAt", "createdBy", "date", "id", "itemId", "legacySource", "movementType", "notes", "quantity", "referenceId", "referenceType", "reservedQty") SELECT "createdAt", "createdBy", "date", "id", "itemId", "legacySource", "movementType", "notes", "quantity", "referenceId", "referenceType", "reservedQty" FROM "StockMovement";
DROP TABLE "StockMovement";
ALTER TABLE "new_StockMovement" RENAME TO "StockMovement";
CREATE INDEX "StockMovement_itemId_date_idx" ON "StockMovement"("itemId", "date");
CREATE INDEX "StockMovement_referenceType_referenceId_idx" ON "StockMovement"("referenceType", "referenceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDocument_documentNo_key" ON "WorkflowDocument"("documentNo");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowDocument_requestKey_key" ON "WorkflowDocument"("requestKey");

-- CreateIndex
CREATE INDEX "WorkflowDocument_kind_date_idx" ON "WorkflowDocument"("kind", "date");

-- CreateIndex
CREATE INDEX "WorkflowDocument_invoiceId_idx" ON "WorkflowDocument"("invoiceId");

-- CreateIndex
CREATE INDEX "WorkflowDocument_originId_idx" ON "WorkflowDocument"("originId");

-- CreateIndex
CREATE INDEX "WorkflowLine_sourceLineId_idx" ON "WorkflowLine"("sourceLineId");

-- CreateIndex
CREATE INDEX "WorkflowLine_invoiceItemId_idx" ON "WorkflowLine"("invoiceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StockLot_code_key" ON "StockLot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "WipLot_productionId_key" ON "WipLot"("productionId");

-- CreateIndex
CREATE UNIQUE INDEX "WipLot_code_key" ON "WipLot"("code");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_sourceKey_key" ON "JournalEntry"("sourceKey");

-- CreateIndex
CREATE INDEX "JournalLine_account_idx" ON "JournalLine"("account");

-- CreateIndex
CREATE UNIQUE INDEX "StockValuation_movementId_key" ON "StockValuation"("movementId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingPeriod_through_key" ON "AccountingPeriod"("through");
