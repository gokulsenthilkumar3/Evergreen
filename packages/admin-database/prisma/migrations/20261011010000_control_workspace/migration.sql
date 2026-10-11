CREATE TABLE "ControlRecord" (
 "id" TEXT NOT NULL PRIMARY KEY, "kind" TEXT NOT NULL, "title" TEXT NOT NULL, "companyId" TEXT,
 "status" TEXT NOT NULL DEFAULT 'DRAFT', "priority" TEXT NOT NULL DEFAULT 'NORMAL', "owner" TEXT NOT NULL DEFAULT 'Unassigned',
 "dueAt" DATETIME, "payload" TEXT NOT NULL DEFAULT '{}', "version" INTEGER NOT NULL DEFAULT 1, "requestKey" TEXT,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "ControlRecord_requestKey_key" ON "ControlRecord"("requestKey");
CREATE INDEX "ControlRecord_kind_status_idx" ON "ControlRecord"("kind", "status");
CREATE TABLE "ControlAudit" (
 "id" TEXT NOT NULL PRIMARY KEY, "recordId" TEXT, "actor" TEXT NOT NULL, "action" TEXT NOT NULL, "details" TEXT NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "ControlAudit_createdAt_idx" ON "ControlAudit"("createdAt");
