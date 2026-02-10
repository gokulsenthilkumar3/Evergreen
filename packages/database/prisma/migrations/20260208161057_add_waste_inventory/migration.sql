-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "CottonInventory" (
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
    CONSTRAINT "CottonInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YarnInventory" (
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
    CONSTRAINT "YarnInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WasteInventory" (
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
    CONSTRAINT "WasteInventory_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InwardBatch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batchId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "supplier" TEXT NOT NULL,
    "bale" INTEGER NOT NULL,
    "kg" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Production" (
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionConsumption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionId" INTEGER NOT NULL,
    "batchNo" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductionConsumption_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionOutput" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productionId" INTEGER NOT NULL,
    "count" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "bags" INTEGER NOT NULL,
    "remainingLog" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductionOutput_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Outward" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "customerName" TEXT NOT NULL,
    "vehicleNo" TEXT NOT NULL,
    "driverName" TEXT,
    "totalBags" INTEGER NOT NULL DEFAULT 0,
    "totalWeight" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OutwardItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "outwardId" INTEGER NOT NULL,
    "count" TEXT NOT NULL,
    "bags" INTEGER NOT NULL,
    "weight" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OutwardItem_outwardId_fkey" FOREIGN KEY ("outwardId") REFERENCES "Outward" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InwardBatch_batchId_key" ON "InwardBatch"("batchId");
