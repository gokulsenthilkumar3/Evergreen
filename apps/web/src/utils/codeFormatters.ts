/**
 * Standardized Code Formatting & Traceability Payload Generator
 * Formats codes according to Manufacturing & Inventory standard rules:
 * - Batch: BATCH-YYYYMMDD-XXXX
 * - Bag: BAG-C{count}-YYYYMMDD-XXX
 * - Outward: OUT-YYYYMMDD-XXXX
 * - Invoice: INV-YYYYMM-XXXX
 */

export function padZero(num: number, size = 3): string {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}

export function formatDateCompact(dateInput?: Date | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function generateRandomSuffix(len = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates standardized Batch Code: BATCH-YYYYMMDD-XXXX
 */
export function formatBatchCode(date?: Date | string, suffix?: string): string {
  const dateStr = formatDateCompact(date);
  const codeSuffix = suffix ? suffix.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : generateRandomSuffix(4);
  return `BATCH-${dateStr}-${codeSuffix}`;
}

/**
 * Generates standardized Yarn Bag Code: BAG-C{count}-YYYYMMDD-XXX
 */
export function formatBagCode(count: string | number, date?: Date | string, seq = 1): string {
  const dateStr = formatDateCompact(date);
  const cleanCount = String(count).replace(/\D/g, '') || '2';
  return `BAG-C${cleanCount}-${dateStr}-${padZero(seq, 3)}`;
}

/**
 * Generates standardized Outward Code: OUT-YYYYMMDD-XXXX
 */
export function formatOutwardCode(date?: Date | string, idOrSuffix?: string | number): string {
  const dateStr = formatDateCompact(date);
  const suffix = idOrSuffix ? String(idOrSuffix).padStart(4, '0') : generateRandomSuffix(4);
  return `OUT-${dateStr}-${suffix}`;
}

/**
 * Generates standardized QR Data Payload for Inward Batch
 */
export function buildBatchQRPayload(batch: {
  batchId: string;
  supplier?: string;
  date?: string | Date;
  bale?: number;
  kg?: number;
}): string {
  return JSON.stringify({
    type: 'INWARD_BATCH',
    code: batch.batchId,
    supplier: batch.supplier || 'N/A',
    date: batch.date ? new Date(batch.date).toISOString().split('T')[0] : '',
    bales: batch.bale || 0,
    grossKg: batch.kg || 0,
    system: 'EverGreen One',
    v: 1,
  });
}

/**
 * Generates standardized QR Data Payload for Yarn Bag
 */
export function buildBagQRPayload(bag: {
  bagCode: string;
  count: string | number;
  weightKg?: number;
  productionId?: number | string;
  date?: string | Date;
}): string {
  return JSON.stringify({
    type: 'YARN_BAG',
    bagCode: bag.bagCode,
    count: String(bag.count),
    weightKg: bag.weightKg || 60,
    prodId: bag.productionId || '',
    date: bag.date ? new Date(bag.date).toISOString().split('T')[0] : '',
    system: 'EverGreen One',
    v: 1,
  });
}

/**
 * Generates standardized QR Data Payload for Outward Dispatch
 */
export function buildOutwardQRPayload(outward: {
  id?: number | string;
  customerName?: string;
  vehicleNo?: string;
  date?: string | Date;
  totalBags?: number;
  totalWeight?: number;
}): string {
  return JSON.stringify({
    type: 'OUTWARD_DISPATCH',
    ref: `OUT-${outward.id || 'GEN'}`,
    customer: outward.customerName || 'N/A',
    vehicle: outward.vehicleNo || 'N/A',
    bags: outward.totalBags || 0,
    weightKg: outward.totalWeight || 0,
    date: outward.date ? new Date(outward.date).toISOString().split('T')[0] : '',
    system: 'EverGreen One',
    v: 1,
  });
}
