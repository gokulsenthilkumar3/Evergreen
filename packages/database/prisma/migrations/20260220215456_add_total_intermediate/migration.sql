-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Production" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "totalConsumed" REAL NOT NULL,
    "totalProduced" REAL NOT NULL,
    "totalWaste" REAL NOT NULL,
    "totalIntermediate" REAL NOT NULL DEFAULT 0,
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
INSERT INTO "new_Production" ("createdAt", "createdBy", "date", "entryTimestamp", "id", "totalConsumed", "totalProduced", "totalWaste", "updatedAt", "updatedBy", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers") SELECT "createdAt", "createdBy", "date", "entryTimestamp", "id", "totalConsumed", "totalProduced", "totalWaste", "updatedAt", "updatedBy", "wasteBlowRoom", "wasteCarding", "wasteOE", "wasteOthers" FROM "Production";
DROP TABLE "Production";
ALTER TABLE "new_Production" RENAME TO "Production";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
