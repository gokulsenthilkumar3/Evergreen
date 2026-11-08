ALTER TABLE "CompanyDomain" ADD COLUMN "verificationToken" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "CompanyDomain_verificationToken_key" ON "CompanyDomain"("verificationToken");
