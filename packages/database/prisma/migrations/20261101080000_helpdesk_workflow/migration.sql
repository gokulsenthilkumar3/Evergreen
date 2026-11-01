ALTER TABLE "SupportTicket" ADD COLUMN "requesterId" INTEGER;
ALTER TABLE "SupportTicket" ADD COLUMN "assigneeId" INTEGER;
ALTER TABLE "SupportTicket" ADD COLUMN "queue" TEXT NOT NULL DEFAULT 'TRIAGE';
ALTER TABLE "SupportTicket" ADD COLUMN "resolvedById" INTEGER;
ALTER TABLE "SupportTicket" ADD COLUMN "resolvedAt" DATETIME;
ALTER TABLE "SupportTicket" ADD COLUMN "confirmedById" INTEGER;
ALTER TABLE "SupportTicket" ADD COLUMN "confirmedAt" DATETIME;
ALTER TABLE "SupportTicket" ADD COLUMN "closedAt" DATETIME;
UPDATE "SupportTicket" SET "requesterId" = (SELECT "id" FROM "User" WHERE "User"."username" = "SupportTicket"."createdBy");
CREATE INDEX "SupportTicket_assigneeId_status_idx" ON "SupportTicket"("assigneeId", "status");
CREATE TABLE "SupportTicketEvent" (
 "id" TEXT NOT NULL PRIMARY KEY, "ticketId" TEXT NOT NULL, "version" INTEGER NOT NULL,
 "requestKey" TEXT, "actorId" INTEGER NOT NULL, "actorPublicId" TEXT, "actorUsername" TEXT NOT NULL,
 "kind" TEXT NOT NULL, "visibility" TEXT NOT NULL DEFAULT 'PUBLIC', "payload" TEXT NOT NULL,
 "previousHash" TEXT NOT NULL, "hash" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SupportTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SupportTicketEvent_requestKey_key" ON "SupportTicketEvent"("requestKey");
CREATE UNIQUE INDEX "SupportTicketEvent_hash_key" ON "SupportTicketEvent"("hash");
CREATE UNIQUE INDEX "SupportTicketEvent_ticketId_version_key" ON "SupportTicketEvent"("ticketId", "version");
CREATE UNIQUE INDEX "SupportTicketEvent_ticketId_previousHash_key" ON "SupportTicketEvent"("ticketId", "previousHash");
CREATE INDEX "SupportTicketEvent_ticketId_createdAt_idx" ON "SupportTicketEvent"("ticketId", "createdAt");
