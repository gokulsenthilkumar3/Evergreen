-- Additive changes only; historical invoices remain unlinked until explicitly reconciled.
ALTER TABLE "Outward" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DISPATCHED';
ALTER TABLE "Invoice" ADD COLUMN "outwardId" INTEGER REFERENCES "Outward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
