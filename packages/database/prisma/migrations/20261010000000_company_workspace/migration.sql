-- Additive preferences preserve the navigation of existing installations.
ALTER TABLE "SystemSettings" ADD COLUMN "businessMode" TEXT NOT NULL DEFAULT 'INTEGRATED';
ALTER TABLE "SystemSettings" ADD COLUMN "workspaceMode" TEXT NOT NULL DEFAULT 'FULL';
