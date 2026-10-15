import { createHmac } from 'crypto';

export interface WeightRecordPayload {
  deviceSerial: string;
  comPort: string;
  grossWeightKg: number;
  tareWeightKg: number;
  moisturePercent: number;
  standardMoistureBase: number; // Must come from the supplier contract; no universal baseline.
  timestamp: string;
}

export interface SignedWeighbridgeSlip {
  payload: WeightRecordPayload;
  calculations: {
    netWeightKg: number;
    excessMoisturePercent: number;
    moistureDeductionKg: number;
    finalBillableKg: number;
  };
  signature: string;
  antiFraudSeal: string;
}

export class AntiTamperEngine {
  /**
   * Simulation of a deduction-only contract rule, applied to NET weight.
   * This is not a CCI/SIMA standard and does not enforce quality rejection limits.
   * Production receipts are recalculated and recorded by the tenant API.
   */
  static calculateCottonMoisture(
    grossKg: number,
    tareKg: number,
    moisturePercent: number,
    baseMoisture: number
  ) {
    // The base comes from the supplier contract. A missing value must not fall back
    // to a regional figure and produce a plausible but wrong billable weight (BIZ-021).
    if (typeof baseMoisture !== 'number' || !Number.isFinite(baseMoisture) || baseMoisture < 0 || baseMoisture > 100) {
      throw new RangeError('Contract moisture base is required and must be a percentage between 0 and 100');
    }
    const netWeight = Math.max(0, grossKg - tareKg);
    const excessPercent = Math.max(0, moisturePercent - baseMoisture);
    const moistureDeductionKg = Math.round(((netWeight * excessPercent) / 100) * 100) / 100;
    const finalBillableKg = Math.max(0, Math.round((netWeight - moistureDeductionKg) * 100) / 100);

    return {
      netWeightKg: netWeight,
      excessMoisturePercent: Math.round(excessPercent * 100) / 100,
      moistureDeductionKg,
      finalBillableKg,
    };
  }

  /**
   * Generate an unforgeable cryptographic seal for the weighbridge reading
   */
  static signSlip(payload: WeightRecordPayload, secretKey: string): SignedWeighbridgeSlip {
    const calculations = this.calculateCottonMoisture(
      payload.grossWeightKg,
      payload.tareWeightKg,
      payload.moisturePercent,
      payload.standardMoistureBase
    );

    const canonicalString = [
      payload.deviceSerial,
      payload.comPort,
      payload.grossWeightKg.toFixed(2),
      payload.tareWeightKg.toFixed(2),
      calculations.netWeightKg.toFixed(2),
      payload.moisturePercent.toFixed(2),
      calculations.moistureDeductionKg.toFixed(2),
      calculations.finalBillableKg.toFixed(2),
      payload.timestamp,
    ].join('|');

    const signature = createHmac('sha256', secretKey)
      .update(canonicalString)
      .digest('hex');

    // Human-readable 8-char verification code for physical weigh slip printout
    const antiFraudSeal = signature.substring(0, 8).toUpperCase();

    return {
      payload,
      calculations,
      signature,
      antiFraudSeal,
    };
  }

  /**
   * Verify an incoming weighbridge slip on the Tenant API server
   */
  static verifySlip(slip: SignedWeighbridgeSlip, secretKey: string): boolean {
    let expected: SignedWeighbridgeSlip;
    try {
      expected = this.signSlip(slip.payload, secretKey);
    } catch {
      // A slip without a valid contract base cannot be recomputed, so it cannot verify.
      return false;
    }
    const signatureMatch = expected.signature === slip.signature;
    const calculationsMatch =
      Math.abs(expected.calculations.netWeightKg - (slip.calculations?.netWeightKg || 0)) < 0.01 &&
      Math.abs(expected.calculations.finalBillableKg - (slip.calculations?.finalBillableKg || 0)) < 0.01 &&
      Math.abs(expected.calculations.moistureDeductionKg - (slip.calculations?.moistureDeductionKg || 0)) < 0.01;

    return signatureMatch && calculationsMatch;
  }
}
