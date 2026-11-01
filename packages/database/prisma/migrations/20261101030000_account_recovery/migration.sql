BEGIN TRANSACTION;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "failedLogins" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil" DATETIME;
CREATE TABLE "AccountActionToken" (
  "id" TEXT NOT NULL PRIMARY KEY, "tokenHash" TEXT NOT NULL, "userId" INTEGER NOT NULL,
  "purpose" TEXT NOT NULL, "email" TEXT NOT NULL, "expiresAt" DATETIME NOT NULL,
  "usedAt" DATETIME, "revokedAt" DATETIME, "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "messageId" TEXT, "createdBy" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AccountActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "AccountActionToken_tokenHash_key" ON "AccountActionToken"("tokenHash");
CREATE INDEX "AccountActionToken_userId_purpose_createdAt_idx" ON "AccountActionToken"("userId", "purpose", "createdAt");
CREATE TABLE "UserRecoveryCode" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" INTEGER NOT NULL, "codeHash" TEXT NOT NULL,
  "usedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserRecoveryCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "UserRecoveryCode_codeHash_key" ON "UserRecoveryCode"("codeHash");
CREATE INDEX "UserRecoveryCode_userId_usedAt_idx" ON "UserRecoveryCode"("userId", "usedAt");
COMMIT;
