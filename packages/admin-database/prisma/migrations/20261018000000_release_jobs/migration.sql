CREATE TABLE "ReleaseJob" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "requestKey" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "companyId" TEXT,
  "target" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "commit" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'REQUESTED',
  "activeTarget" TEXT,
  "runId" TEXT,
  "runUrl" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "ReleaseJob_requestKey_key" ON "ReleaseJob"("requestKey");
CREATE UNIQUE INDEX "ReleaseJob_activeTarget_key" ON "ReleaseJob"("activeTarget");
CREATE INDEX "ReleaseJob_kind_createdAt_idx" ON "ReleaseJob"("kind", "createdAt");
