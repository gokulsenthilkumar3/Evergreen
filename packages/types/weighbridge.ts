export type MoistureMethod = 'PENDING' | 'EXCESS_PERCENTAGE';

export interface WeighbridgeMeasurement {
  grossWeightKg: number;
  tareWeightKg: number;
  moisturePercent: number;
  method: MoistureMethod;
  standardMoistureBase?: number;
  contractReference?: string;
}

export interface WeighbridgeReceipt extends WeighbridgeMeasurement {
  version: 1;
  netWeightKg: number;
  moistureDeductionKg: number | null;
  finalBillableKg: number | null;
  deviceSerial: string | null;
  verificationStatus: 'UNVERIFIED';
}

/** Contract-specific, deduction-only policy. Not a universal CCI/CAI rule.
 * Physical stock stays at net received weight, irrespective of settlement.
 */
export function calculateWeighbridge(input: WeighbridgeMeasurement) {
  const { grossWeightKg: gross, tareWeightKg: tare, moisturePercent: moisture } = input;
  const validNumber = (value: number) => typeof value === 'number' && Number.isFinite(value);
  if (!validNumber(gross) || !validNumber(tare) || gross <= 0 || gross > 999999 || tare < 0 || tare >= gross)
    throw new Error('Gross must exceed tare; enter weights between 0 and 999,999 kg.');
  if (!validNumber(moisture) || moisture < 0 || moisture >= 100)
    throw new Error('Moisture content must be at least 0% and below 100%.');
  if (!['PENDING', 'EXCESS_PERCENTAGE'].includes(input.method))
    throw new Error('Select a supported moisture deduction method.');
  const round = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
  const netWeightKg = round(gross - tare);
  if (netWeightKg <= 0) throw new Error('Net weight must be at least 0.01 kg.');
  if (input.method === 'PENDING')
    return { netWeightKg, moistureDeductionKg: null, finalBillableKg: null };
  const base = input.standardMoistureBase;
  if (typeof base !== 'number' || !validNumber(base) || base < 0 || base >= 100)
    throw new Error('Enter the agreed moisture baseline, at least 0% and below 100%.');
  if (!input.contractReference?.trim()) throw new Error('Enter the contract reference for this deduction rule.');
  const moistureDeductionKg = round(netWeightKg * Math.max(0, moisture - base) / 100);
  return { netWeightKg, moistureDeductionKg, finalBillableKg: round(netWeightKg - moistureDeductionKg) };
}
