CREATE TABLE "audit_ledger" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "eventId" TEXT NOT NULL,
  "actorId" INTEGER, "actorPublicId" TEXT, "actorUsername" TEXT NOT NULL,
  "subjectUserId" INTEGER, "subjectPublicId" TEXT, "action" TEXT NOT NULL, "module" TEXT NOT NULL,
  "details" TEXT NOT NULL, "previousHash" TEXT NOT NULL, "hash" TEXT NOT NULL, "createdAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "audit_ledger_eventId_key" ON "audit_ledger"("eventId");
CREATE UNIQUE INDEX "audit_ledger_previousHash_key" ON "audit_ledger"("previousHash");
CREATE UNIQUE INDEX "audit_ledger_hash_key" ON "audit_ledger"("hash");
CREATE INDEX "audit_ledger_subjectUserId_createdAt_idx" ON "audit_ledger"("subjectUserId", "createdAt");
CREATE INDEX "audit_ledger_actorId_createdAt_idx" ON "audit_ledger"("actorId", "createdAt");
