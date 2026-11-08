CREATE TABLE "CompanyDomain" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "hostname" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'SUBDOMAIN',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "verifiedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CompanyDomain_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CompanyDomain_hostname_key" ON "CompanyDomain"("hostname");
CREATE INDEX "CompanyDomain_companyId_idx" ON "CompanyDomain"("companyId");
