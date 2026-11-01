ALTER TABLE "SupportTicket" ADD COLUMN "tagsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "SupportTicket" ADD COLUMN "customFieldsJson" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "SupportTicket" ADD COLUMN "watchersJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "SupportTicket" ADD COLUMN "dueAt" DATETIME;
ALTER TABLE "SupportTicket" ADD COLUMN "parentId" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN "mergedIntoId" TEXT;
ALTER TABLE "SupportTicket" ADD COLUMN "slaPolicyJson" TEXT;
CREATE TABLE "SupportResource" (
 "id" TEXT NOT NULL PRIMARY KEY, "scopeKey" TEXT NOT NULL, "kind" TEXT NOT NULL, "key" TEXT NOT NULL,
 "title" TEXT NOT NULL, "ownerId" INTEGER NOT NULL, "visibility" TEXT NOT NULL DEFAULT 'TEAM',
 "status" TEXT NOT NULL DEFAULT 'ACTIVE', "data" TEXT NOT NULL, "version" INTEGER NOT NULL DEFAULT 1,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "SupportResource_scopeKey_key" ON "SupportResource"("scopeKey");
CREATE INDEX "SupportResource_kind_status_visibility_idx" ON "SupportResource"("kind", "status", "visibility");
CREATE TABLE "SupportResourceRevision" (
 "id" TEXT NOT NULL PRIMARY KEY, "resourceId" TEXT NOT NULL, "version" INTEGER NOT NULL,
 "actorId" INTEGER NOT NULL, "actorUsername" TEXT NOT NULL, "snapshot" TEXT NOT NULL, "reason" TEXT NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SupportResourceRevision_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "SupportResource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SupportResourceRevision_resourceId_version_key" ON "SupportResourceRevision"("resourceId", "version");
