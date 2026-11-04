BEGIN TRANSACTION;
ALTER TABLE "User" ADD COLUMN "scopedAccess" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE "UserAccessRule" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" INTEGER NOT NULL, "method" TEXT NOT NULL, "path" TEXT NOT NULL,
  "effect" TEXT NOT NULL, "expiresAt" DATETIME, "revokedAt" DATETIME, "createdBy" TEXT NOT NULL,
  "reason" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserAccessRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "UserAccessRule_userId_revokedAt_idx" ON "UserAccessRule"("userId", "revokedAt");
COMMIT;
