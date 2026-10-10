CREATE TABLE "ImportBatch" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "requestKey" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "rowCount" INTEGER NOT NULL,
  "recordIds" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ImportBatch_requestKey_key" ON "ImportBatch"("requestKey");
CREATE UNIQUE INDEX "ImportBatch_fingerprint_key" ON "ImportBatch"("fingerprint");
