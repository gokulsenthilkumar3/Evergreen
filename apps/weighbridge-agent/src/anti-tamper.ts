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
    baseMoisture: number = 8.5
  ) {
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
    const expected = this.signSlip(slip.payload, secretKey);
    return expected.signature === slip.signature;
  }
}
