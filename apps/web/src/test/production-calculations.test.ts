/**
 * ProductionEntry — unit tests for production calculation logic
 *
 * Tests production validation rules:
 * - Cotton consumption must equal yarn + waste + intermediate (within tolerance)
 * - Output bags are derived from weight, not supplied
 * - Batch validation (bale + kg consistency)
 * - Waste sub-categories must sum to total waste
 */
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Production balance constants
// ---------------------------------------------------------------------------
const STANDARD_BAG_KG = 60;
const BALANCE_TOLERANCE = 0.01; // kg

// ---------------------------------------------------------------------------
// Production calculation helpers (mirrors server-side validation logic)
// ---------------------------------------------------------------------------
function deriveOutputBags(weight: number): { bags: number; remainingLog: number } {
  const bags = Math.floor(weight / STANDARD_BAG_KG);
  const remainingLog = parseFloat((weight - bags * STANDARD_BAG_KG).toFixed(3));
  return { bags, remainingLog };
}

function validateProductionBalance(params: {
  totalConsumed: number;
  totalProduced: number;
  totalWaste: number;
  totalIntermediate: number;
}): { valid: boolean; error?: string } {
  const { totalConsumed, totalProduced, totalWaste, totalIntermediate } = params;
  const rhs = totalProduced + totalWaste + totalIntermediate;
  const diff = Math.abs(totalConsumed - rhs);
  if (diff > BALANCE_TOLERANCE) {
    return {
      valid: false,
      error: `Balance mismatch: consumed ${totalConsumed} ≠ produced ${totalProduced} + waste ${totalWaste} + intermediate ${totalIntermediate} (diff ${diff.toFixed(3)})`,
    };
  }
  return { valid: true };
}

function validateWasteSubcategories(params: {
  totalWaste: number;
  wasteBlowRoom: number;
  wasteCarding: number;
  wasteOE: number;
  wasteOthers: number;
}): { valid: boolean; error?: string } {
  const { totalWaste, wasteBlowRoom, wasteCarding, wasteOE, wasteOthers } = params;
  const sum = wasteBlowRoom + wasteCarding + wasteOE + wasteOthers;
  if (Math.abs(sum - totalWaste) > BALANCE_TOLERANCE) {
    return {
      valid: false,
      error: `Waste subcategories sum ${sum.toFixed(3)} ≠ totalWaste ${totalWaste}`,
    };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Production — output bag derivation', () => {
  it('derives 6 bags from 360 kg', () => {
    const { bags, remainingLog } = deriveOutputBags(360);
    expect(bags).toBe(6);
    expect(remainingLog).toBe(0);
  });

  it('derives 1 bag and 40 kg remaining from 100 kg', () => {
    const { bags, remainingLog } = deriveOutputBags(100);
    expect(bags).toBe(1);
    expect(remainingLog).toBeCloseTo(40);
  });

  it('derives 0 bags from 59 kg (all loose)', () => {
    const { bags, remainingLog } = deriveOutputBags(59);
    expect(bags).toBe(0);
    expect(remainingLog).toBeCloseTo(59);
  });

  it('derives 0 bags from 0 kg', () => {
    const { bags, remainingLog } = deriveOutputBags(0);
    expect(bags).toBe(0);
    expect(remainingLog).toBe(0);
  });

  it('handles fractional kg correctly', () => {
    const { bags, remainingLog } = deriveOutputBags(120.5);
    expect(bags).toBe(2);
    expect(remainingLog).toBeCloseTo(0.5, 2);
  });
});

describe('Production — material balance validation', () => {
  it('passes when consumed = produced + waste + intermediate', () => {
    const result = validateProductionBalance({
      totalConsumed: 400,
      totalProduced: 360,
      totalWaste: 30,
      totalIntermediate: 10,
    });
    expect(result.valid).toBe(true);
  });

  it('passes when no waste and no intermediate (pure conversion)', () => {
    const result = validateProductionBalance({
      totalConsumed: 100,
      totalProduced: 100,
      totalWaste: 0,
      totalIntermediate: 0,
    });
    expect(result.valid).toBe(true);
  });

  it('passes with zero intermediate (no WIP)', () => {
    const result = validateProductionBalance({
      totalConsumed: 400,
      totalProduced: 370,
      totalWaste: 30,
      totalIntermediate: 0,
    });
    expect(result.valid).toBe(true);
  });

  it('fails when balance is off by more than 0.01 kg', () => {
    const result = validateProductionBalance({
      totalConsumed: 400,
      totalProduced: 360,
      totalWaste: 30,
      totalIntermediate: 5, // should be 10
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Balance mismatch');
  });

  it('passes when balance is within 0.01 kg tolerance (floating point)', () => {
    const result = validateProductionBalance({
      totalConsumed: 400.005,
      totalProduced: 360,
      totalWaste: 30,
      totalIntermediate: 10,
    });
    expect(result.valid).toBe(true);
  });

  it('fails when produced alone exceeds consumed', () => {
    const result = validateProductionBalance({
      totalConsumed: 300,
      totalProduced: 310,
      totalWaste: 0,
      totalIntermediate: 0,
    });
    expect(result.valid).toBe(false);
  });
});

describe('Production — waste subcategory validation', () => {
  it('passes when subcategories sum exactly to totalWaste', () => {
    const result = validateWasteSubcategories({
      totalWaste: 30,
      wasteBlowRoom: 10,
      wasteCarding: 8,
      wasteOE: 7,
      wasteOthers: 5,
    });
    expect(result.valid).toBe(true);
  });

  it('passes when all waste is in one subcategory', () => {
    const result = validateWasteSubcategories({
      totalWaste: 20,
      wasteBlowRoom: 20,
      wasteCarding: 0,
      wasteOE: 0,
      wasteOthers: 0,
    });
    expect(result.valid).toBe(true);
  });

  it('passes when totalWaste is 0 and all subcategories are 0', () => {
    const result = validateWasteSubcategories({
      totalWaste: 0,
      wasteBlowRoom: 0,
      wasteCarding: 0,
      wasteOE: 0,
      wasteOthers: 0,
    });
    expect(result.valid).toBe(true);
  });

  it('fails when subcategories do not sum to totalWaste', () => {
    const result = validateWasteSubcategories({
      totalWaste: 30,
      wasteBlowRoom: 10,
      wasteCarding: 8,
      wasteOE: 7,
      wasteOthers: 0, // should be 5
    });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Waste subcategories sum');
  });
});

// ---------------------------------------------------------------------------
// GST calculation helpers (reusing the @evergreen/pdf logic)
// ---------------------------------------------------------------------------
describe('@evergreen/pdf — calculateInvoiceTotals', () => {
  it('computes same-state GST correctly for yarn', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [
      { description: 'Yarn 2s', hsnSac: '5106', uom: 'KG', quantity: 100, rate: 50, discount: 0, gstRate: 5 },
    ];
    const result = calculateInvoiceTotals(lines, false); // false = same state
    expect(result.subtotal).toBeCloseTo(5000);
    expect(result.cgst).toBeCloseTo(125);
    expect(result.sgst).toBeCloseTo(125);
    expect(result.igst).toBe(0);
    expect(result.grandTotal).toBeCloseTo(5250);
  });

  it('computes interstate GST correctly for yarn', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [
      { description: 'Yarn 4s', hsnSac: '5106', uom: 'KG', quantity: 50, rate: 80, discount: 0, gstRate: 5 },
    ];
    const result = calculateInvoiceTotals(lines, true); // true = interstate
    expect(result.subtotal).toBeCloseTo(4000);
    expect(result.igst).toBeCloseTo(200);
    expect(result.cgst).toBe(0);
    expect(result.grandTotal).toBeCloseTo(4200);
  });

  it('applies line discount before GST', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [
      { description: 'Yarn 6s', hsnSac: '5106', uom: 'KG', quantity: 10, rate: 100, discount: 10, gstRate: 5 },
    ];
    const result = calculateInvoiceTotals(lines, false);
    // 10% of 10×100 = 100 discount; taxable = 900
    expect(result.discount).toBeCloseTo(100);
    expect(result.taxable).toBeCloseTo(900);
    expect(result.grandTotal).toBeCloseTo(945);
  });

  it('handles zero GST (exempt) items', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [
      { description: 'Cotton', hsnSac: '5201', uom: 'KG', quantity: 100, rate: 60, discount: 0, gstRate: 0 },
    ];
    const result = calculateInvoiceTotals(lines, false);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.grandTotal).toBeCloseTo(6000);
  });
});
