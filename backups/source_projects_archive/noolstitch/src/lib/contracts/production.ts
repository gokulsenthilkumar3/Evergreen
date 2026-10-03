import { z } from 'zod';

export const JobWorkDispatchLineCreate = z.object({
  itemId: z.string().min(1, 'Please select a raw material'),
  qtyDispatched: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .refine((val) => Number(val) > 0, 'Must be greater than 0'),
});

export const JobWorkChallanCreate = z.object({
  challanDate: z.string().min(1, 'Challan date is required'),
  jobWorkerName: z.string().min(1, 'Job worker name is required'),
  processType: z.string().min(1, 'Process type is required'),
  notes: z.string().optional(),
  dispatchLines: z.array(JobWorkDispatchLineCreate).min(1, 'At least one line is required'),
});

export const JobWorkReceiptLineCreate = z.object({
  itemId: z.string().min(1, 'Please select a processed material'),
  qtyReceived: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .refine((val) => Number(val) > 0, 'Must be greater than 0'),
  scrapQty: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid number')
    .optional(),
});

export const JobWorkReceiveCreate = z.object({
  receiptLines: z.array(JobWorkReceiptLineCreate).min(1, 'At least one line is required'),
});
