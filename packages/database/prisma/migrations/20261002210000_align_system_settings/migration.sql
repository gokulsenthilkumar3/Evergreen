-- Persist preferences introduced by the unified settings and bilingual UI.
ALTER TABLE "SystemSettings" ADD COLUMN "language" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "SystemSettings" ADD COLUMN "sellerState" TEXT NOT NULL DEFAULT 'Tamil Nadu';

-- Replace the former broad sample list only when it still has the legacy default.
UPDATE "SystemSettings"
SET "supportedCounts" = '2,4,6,8,10'
WHERE "supportedCounts" = '2,4,6,8,10,12,14,16,20';
