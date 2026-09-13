import { z } from 'zod';

export const CostingComponentSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['MATERIAL', 'PROCESS', 'OVERHEAD']),
  description: z.string().min(1, 'Description is required'),
  qty: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .refine((val) => Number(val) > 0, 'Must be greater than 0'),
  rate: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .refine((val) => Number(val) >= 0, 'Cannot be negative'),
  amount: z.string().optional(),
});

export const CostingSheetCreate = z.object({
  styleCode: z.string().min(1, 'Style code is required'),
  description: z.string().optional(),
  components: z.array(CostingComponentSchema).min(1, 'At least one component is required'),
});

export const CostingSheetSchema = CostingSheetCreate.extend({
  id: z.string(),
  totalMaterialCost: z.string(),
  totalProcessCost: z.string(),
  totalOverheads: z.string(),
  grandTotal: z.string(),
});
