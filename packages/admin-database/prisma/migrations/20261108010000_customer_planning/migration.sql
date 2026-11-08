CREATE TABLE "CustomerPlanTemplate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "kind" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "CustomerPlanTemplate_key_key" ON "CustomerPlanTemplate"("key");

CREATE TABLE "CustomerPlanTemplateMilestone" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "templateId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "daysFromStart" INTEGER NOT NULL DEFAULT 0,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerPlanTemplateMilestone_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CustomerPlanTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CustomerPlanTemplateMilestone_templateId_idx" ON "CustomerPlanTemplateMilestone"("templateId");

CREATE TABLE "CustomerAccountPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "templateId" TEXT,
  "lifecycleStage" TEXT NOT NULL DEFAULT 'ONBOARDING',
  "summary" TEXT,
  "nextReviewAt" DATETIME,
  "healthScore" INTEGER NOT NULL DEFAULT 0,
  "healthBand" TEXT NOT NULL DEFAULT 'AT_RISK',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CustomerAccountPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CustomerAccountPlan_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CustomerPlanTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CustomerAccountPlan_companyId_key" ON "CustomerAccountPlan"("companyId");
CREATE INDEX "CustomerAccountPlan_lifecycleStage_healthBand_idx" ON "CustomerAccountPlan"("lifecycleStage", "healthBand");

CREATE TABLE "CustomerPlanMilestone" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "phase" TEXT NOT NULL,
  "owner" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "dueAt" DATETIME,
  "completedAt" DATETIME,
  "blocker" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CustomerPlanMilestone_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CustomerAccountPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CustomerPlanMilestone_planId_status_dueAt_idx" ON "CustomerPlanMilestone"("planId", "status", "dueAt");

CREATE TABLE "CustomerPlanRisk" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "mitigation" TEXT,
  "dueAt" DATETIME,
  "resolvedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CustomerPlanRisk_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CustomerAccountPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CustomerPlanRisk_planId_status_severity_idx" ON "CustomerPlanRisk"("planId", "status", "severity");

CREATE TABLE "CustomerAlert" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "title" TEXT NOT NULL,
  "details" TEXT,
  "acknowledgedAt" DATETIME,
  "resolvedAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CustomerAlert_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CustomerAccountPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CustomerAlert_fingerprint_key" ON "CustomerAlert"("fingerprint");
CREATE INDEX "CustomerAlert_planId_status_severity_idx" ON "CustomerAlert"("planId", "status", "severity");

CREATE TABLE "CustomerPlanActivity" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "planId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerPlanActivity_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CustomerAccountPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "CustomerPlanActivity_planId_createdAt_idx" ON "CustomerPlanActivity"("planId", "createdAt");

INSERT INTO "CustomerPlanTemplate" ("id", "key", "name", "description", "kind", "active", "updatedAt") VALUES
  ('template-onboarding', 'ONBOARDING', 'Customer onboarding', 'Implementation, access, data readiness, and launch acceptance.', 'ONBOARDING', 1, CURRENT_TIMESTAMP),
  ('template-expansion', 'EXPANSION', 'Expansion planning', 'New modules, capacity, integrations, and rollout validation.', 'EXPANSION', 1, CURRENT_TIMESTAMP),
  ('template-renewal', 'RENEWAL', 'Renewal readiness', 'Renewal scope, usage review, commercial confirmation, and continuity.', 'RENEWAL', 1, CURRENT_TIMESTAMP),
  ('template-recovery', 'RECOVERY', 'Recovery plan', 'Stabilize service, resolve risks, and restore customer confidence.', 'RECOVERY', 1, CURRENT_TIMESTAMP);

INSERT INTO "CustomerPlanTemplateMilestone" ("id", "templateId", "title", "phase", "daysFromStart", "priority") VALUES
  ('milestone-onboarding-1', 'template-onboarding', 'Confirm customer owner and success criteria', 'DISCOVERY', 0, 'HIGH'),
  ('milestone-onboarding-2', 'template-onboarding', 'Complete access and domain setup', 'FOUNDATION', 7, 'HIGH'),
  ('milestone-onboarding-3', 'template-onboarding', 'Validate data and integration readiness', 'FOUNDATION', 14, 'NORMAL'),
  ('milestone-onboarding-4', 'template-onboarding', 'Run launch acceptance review', 'LAUNCH', 30, 'HIGH'),
  ('milestone-expansion-1', 'template-expansion', 'Confirm expansion outcomes', 'DISCOVERY', 0, 'HIGH'),
  ('milestone-expansion-2', 'template-expansion', 'Approve technical rollout plan', 'PLANNING', 14, 'HIGH'),
  ('milestone-expansion-3', 'template-expansion', 'Complete rollout evidence review', 'LAUNCH', 30, 'NORMAL'),
  ('milestone-renewal-1', 'template-renewal', 'Review usage and customer outcomes', 'REVIEW', 0, 'HIGH'),
  ('milestone-renewal-2', 'template-renewal', 'Confirm renewal scope and seats', 'COMMERCIAL', 14, 'HIGH'),
  ('milestone-renewal-3', 'template-renewal', 'Complete renewal decision', 'COMMERCIAL', 30, 'HIGH'),
  ('milestone-recovery-1', 'template-recovery', 'Agree on recovery owner and success criteria', 'STABILIZE', 0, 'HIGH'),
  ('milestone-recovery-2', 'template-recovery', 'Resolve highest-severity service risk', 'STABILIZE', 7, 'HIGH'),
  ('milestone-recovery-3', 'template-recovery', 'Complete recovery review', 'RECOVER', 21, 'HIGH');
