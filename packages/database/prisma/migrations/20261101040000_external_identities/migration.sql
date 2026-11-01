CREATE TABLE "UserExternalIdentity" (
  "id" TEXT NOT NULL PRIMARY KEY, "userId" INTEGER NOT NULL, "issuer" TEXT NOT NULL, "subject" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserExternalIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "UserExternalIdentity_issuer_subject_key" ON "UserExternalIdentity"("issuer", "subject");
CREATE INDEX "UserExternalIdentity_userId_idx" ON "UserExternalIdentity"("userId");
