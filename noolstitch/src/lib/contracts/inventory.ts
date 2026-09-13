// @polsia:user-owned — Inventory Zod contracts for end-to-end type safety
import { z } from 'zod';

export const InventoryItemCreate = z.object({
  sku: z.string().min(1, 'SKU is required').max(50),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  currentStock: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number'),
  uom: z.string().min(1, 'UOM is required').max(20),
});

export const InventoryItemSchema = InventoryItemCreate.extend({
  id: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InwardEntryLineCreate = z.object({
  itemId: z.string().min(1, 'Please select an item'),
  qtyReceived: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .refine((val) => Number(val) > 0, 'Must be greater than 0'),
  unitCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .refine((val) => Number(val) >= 0, 'Cannot be negative'),
});

export const InwardEntryCreate = z.object({
  receiptDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  supplierName: z.string().min(1, 'Supplier name is required').max(100),
  referenceNumber: z.string().optional(),
  lines: z.array(InwardEntryLineCreate).min(1, 'At least one line item is required'),
});

export const InwardEntryLineSchema = InwardEntryLineCreate.extend({
  id: z.string().uuid(),
  inwardEntryId: z.string().uuid(),
  lineTotal: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InwardEntrySchema = InwardEntryCreate.extend({
  id: z.string().uuid(),
  totalValue: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lines: z.array(InwardEntryLineSchema),
});
