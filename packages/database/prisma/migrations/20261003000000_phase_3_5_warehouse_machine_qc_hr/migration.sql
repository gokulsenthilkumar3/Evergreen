-- Phase 3.5: Warehouse, Machine Management, Quality Control and HR/Payroll
-- CreateTable: WarehouseLocation
CREATE TABLE "WarehouseLocation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "zone" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

CREATE UNIQUE INDEX "WarehouseLocation_name_key" ON "WarehouseLocation"("name");

-- CreateTable: WarehouseMovement
CREATE TABLE "WarehouseMovement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "locationId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "movementType" TEXT NOT NULL,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WarehouseMovement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "WarehouseLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "WarehouseMovement_locationId_idx" ON "WarehouseMovement"("locationId");

-- CreateTable: Machine
CREATE TABLE "Machine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serialNo" TEXT,
    "manufacturer" TEXT,
    "purchasedAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

CREATE UNIQUE INDEX "Machine_serialNo_key" ON "Machine"("serialNo");

-- CreateTable: MachineInspection
CREATE TABLE "MachineInspection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "machineId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "cost" REAL NOT NULL DEFAULT 0,
    "resolvedAt" DATETIME,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MachineInspection_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "MachineInspection_machineId_idx" ON "MachineInspection"("machineId");

-- CreateTable: QualityInspection
CREATE TABLE "QualityInspection" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productionId" INTEGER,
    "batchId" TEXT,
    "yarnCount" TEXT,
    "sampleWeight" REAL,
    "tenacity" REAL,
    "elongation" REAL,
    "imperfections" REAL,
    "classimateFaults" REAL,
    "unevenness" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "disposition" TEXT,
    "remarks" TEXT,
    "inspectedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "QualityInspection_date_idx" ON "QualityInspection"("date");

-- CreateTable: Staff
CREATE TABLE "Staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "phone" TEXT,
    "joinDate" DATETIME,
    "salaryType" TEXT NOT NULL DEFAULT 'DAILY',
    "dailyRate" REAL NOT NULL DEFAULT 0,
    "monthlySalary" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT
);

CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");

-- CreateTable: Shift
CREATE TABLE "Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX "Shift_name_key" ON "Shift"("name");

-- CreateTable: ShiftAssignment
CREATE TABLE "ShiftAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,
    "overtime" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    CONSTRAINT "ShiftAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShiftAssignment_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ShiftAssignment_staffId_date_idx" ON "ShiftAssignment"("staffId", "date");

-- CreateTable: PayrollEntry
CREATE TABLE "PayrollEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "daysWorked" REAL NOT NULL DEFAULT 0,
    "overtimeHrs" REAL NOT NULL DEFAULT 0,
    "basicPay" REAL NOT NULL DEFAULT 0,
    "overtime" REAL NOT NULL DEFAULT 0,
    "deductions" REAL NOT NULL DEFAULT 0,
    "netPay" REAL NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdBy" TEXT,
    CONSTRAINT "PayrollEntry_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PayrollEntry_staffId_month_key" ON "PayrollEntry"("staffId", "month");
CREATE INDEX "PayrollEntry_month_idx" ON "PayrollEntry"("month");

-- Seed default shifts
INSERT INTO "Shift" ("name", "startTime", "endTime") VALUES ('Morning', '06:00', '14:00');
INSERT INTO "Shift" ("name", "startTime", "endTime") VALUES ('Afternoon', '14:00', '22:00');
INSERT INTO "Shift" ("name", "startTime", "endTime") VALUES ('Night', '22:00', '06:00');
