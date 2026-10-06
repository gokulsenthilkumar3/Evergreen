-- AlterTable
ALTER TABLE "WipLot" ADD COLUMN "unitCost" REAL;

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
    "fulfilmentId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entryTimestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "Outward" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_fulfilmentId_fkey" FOREIGN KEY ("fulfilmentId") REFERENCES "WorkflowDocument" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("amountPaid", "authorizedSignatory", "buyerState", "cgst", "createdAt", "createdBy", "creditTotal", "currency", "customerAddress", "customerGSTIN", "customerId", "customerName", "customerSignature", "date", "discount", "documentHash", "dueDate", "entryTimestamp", "id", "igst", "invoiceNo", "issuerSignature", "notes", "outwardId", "requestHash", "requestKey", "salesOrderId", "sellerAddress", "sellerGSTIN", "sellerName", "sellerState", "senderName", "sgst", "status", "subtotal", "terms", "theme", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo", "verificationKey") SELECT "amountPaid", "authorizedSignatory", "buyerState", "cgst", "createdAt", "createdBy", "creditTotal", "currency", "customerAddress", "customerGSTIN", "customerId", "customerName", "customerSignature", "date", "discount", "documentHash", "dueDate", "entryTimestamp", "id", "igst", "invoiceNo", "issuerSignature", "notes", "outwardId", "requestHash", "requestKey", "salesOrderId", "sellerAddress", "sellerGSTIN", "sellerName", "sellerState", "senderName", "sgst", "status", "subtotal", "terms", "theme", "total", "transportMode", "updatedAt", "updatedBy", "vehicleNo", "verificationKey" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_invoiceNo_key" ON "Invoice"("invoiceNo");
CREATE UNIQUE INDEX "Invoice_requestKey_key" ON "Invoice"("requestKey");
CREATE TABLE "new_Production" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "totalConsumed" REAL NOT NULL,
    "totalProduced" REAL NOT NULL,
    "totalWaste" REAL NOT NULL,
    "totalIntermediate" REAL NOT NULL DEFAULT 0,
    "processingCost" REAL NOT NULL DEFAULT 0,
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
INSERT INTO "new_Production" ("createdAt", "createdBy", "date", "entryTimestamp", "id", "totalConsumed", "totalIntermediate", "totalProduced", "totalWaste", "updatedAt", "updatedBy", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers") SELECT "createdAt", "createdBy", "date", "entryTimestamp", "id", "totalConsumed", "totalIntermediate", "totalProduced", "totalWaste", "updatedAt", "updatedBy", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers" FROM "Production";
DROP TABLE "Production";
ALTER TABLE "new_Production" RENAME TO "Production";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
