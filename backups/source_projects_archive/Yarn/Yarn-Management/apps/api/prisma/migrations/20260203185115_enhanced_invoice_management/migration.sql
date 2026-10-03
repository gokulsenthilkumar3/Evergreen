/*
  Warnings:

  - Added the required column `balance` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InvoiceStatus" ADD VALUE 'PARTIALLY_PAID';
ALTER TYPE "InvoiceStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "InvoiceStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "balance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "invoiceMonth" TEXT,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "InvoiceTemplate" ADD COLUMN     "customCss" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "themeColor" TEXT DEFAULT '#1976d2';

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceHistory" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "performedBy" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoiceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoicePayment_receiptNumber_key" ON "InvoicePayment"("receiptNumber");

-- CreateIndex
CREATE INDEX "InvoicePayment_invoiceId_idx" ON "InvoicePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePayment_paymentDate_idx" ON "InvoicePayment"("paymentDate");

-- CreateIndex
CREATE INDEX "InvoiceHistory_invoiceId_idx" ON "InvoiceHistory"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceHistory_action_idx" ON "InvoiceHistory"("action");

-- CreateIndex
CREATE INDEX "InvoiceHistory_createdAt_idx" ON "InvoiceHistory"("createdAt");

-- CreateIndex
CREATE INDEX "Invoice_invoiceMonth_idx" ON "Invoice"("invoiceMonth");
