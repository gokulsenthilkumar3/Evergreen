-- Preserve original measurements and the selected deduction policy with the lot.
-- Historical lots remain NULL; their original measurements cannot be inferred.
ALTER TABLE "InwardBatch" ADD COLUMN "weighbridgeReceipt" TEXT;
