/**
 * Smoke tests for EverGreen web utility modules.
 * Phase 0 gate: Connected modules must have at least one passing test.
 */
import { describe, it, expect } from 'vitest';

// ── @evergreen/types smoke ──────────────────────────────────────────────────
describe('@evergreen/types', () => {
  it('USER_ROLES contains the three canonical roles', async () => {
    const { USER_ROLES } = await import('@evergreen/types');
    expect(USER_ROLES).toContain('VIEWER');
    expect(USER_ROLES).toContain('MODIFIER');
    expect(USER_ROLES).toContain('ADMIN');
    expect(USER_ROLES).toHaveLength(3);
  });

  it('YARN_COUNTS contains the canonical 5 counts', async () => {
    const { YARN_COUNTS } = await import('@evergreen/types');
    expect(Array.from(YARN_COUNTS)).toEqual(['2', '4', '6', '8', '10']);
  });
});

// ── @evergreen/pdf invoice calculation smoke ────────────────────────────────
describe('@evergreen/pdf — calculateInvoiceTotals', () => {
  it('computes same-state GST correctly', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [{ description: 'Yarn 2s', hsnSac: '5106', uom: 'KG', quantity: 10, rate: 200, discount: 0, gstRate: 5 }];
    const result = calculateInvoiceTotals(lines, false); // false = same state (CGST + SGST)
    expect(result.subtotal).toBeCloseTo(2000);
    expect(result.cgst).toBeCloseTo(50);
    expect(result.sgst).toBeCloseTo(50);
    expect(result.igst).toBe(0);
    expect(result.grandTotal).toBeCloseTo(2100);
  });

  it('computes interstate GST correctly', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [{ description: 'Yarn 4s', hsnSac: '5106', uom: 'KG', quantity: 5, rate: 300, discount: 0, gstRate: 12 }];
    const result = calculateInvoiceTotals(lines, true); // true = interstate (IGST)
    expect(result.subtotal).toBeCloseTo(1500);
    expect(result.igst).toBeCloseTo(180);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.grandTotal).toBeCloseTo(1680);
  });

  it('applies line discount correctly', async () => {
    const { calculateInvoiceTotals } = await import('@evergreen/pdf');
    const lines = [{ description: 'Yarn 6s', hsnSac: '5106', uom: 'KG', quantity: 10, rate: 100, discount: 10, gstRate: 5 }];
    const result = calculateInvoiceTotals(lines, false);
    expect(result.discount).toBeCloseTo(100); // 10% of 10×100
    expect(result.taxable).toBeCloseTo(900);
    expect(result.grandTotal).toBeCloseTo(945); // 900 + 5% GST
  });
});

// ── utils/messages smoke ────────────────────────────────────────────────────
describe('utils/messages', () => {
  it('SUCCESS_MESSAGES are defined strings', async () => {
    const { SUCCESS_MESSAGES } = await import('../utils/messages');
    expect(typeof SUCCESS_MESSAGES.COSTING_SAVED).toBe('string');
    expect(SUCCESS_MESSAGES.COSTING_SAVED.length).toBeGreaterThan(0);
  });

  it('ERROR_MESSAGES are defined strings', async () => {
    const { ERROR_MESSAGES } = await import('../utils/messages');
    expect(typeof ERROR_MESSAGES.SAVE_FAILED).toBe('string');
  });

  it('REQUIRED_FIELD helper returns a string with the field name', async () => {
    const { ERROR_MESSAGES } = await import('../utils/messages');
    const msg = ERROR_MESSAGES.REQUIRED_FIELD('Workers');
    expect(msg).toContain('Workers');
  });
});

// ── utils/validators smoke ──────────────────────────────────────────────────
describe('utils/validators', () => {
  it('validateRate rejects zero', async () => {
    const { validateRate } = await import('../utils/validators');
    const result = validateRate(0, 'Test Rate');
    expect(result.valid).toBe(false);
  });

  it('validateRate accepts a positive number', async () => {
    const { validateRate } = await import('../utils/validators');
    const result = validateRate(10.5, 'Test Rate');
    expect(result.valid).toBe(true);
  });

  it('validateGST rejects a value above 100', async () => {
    const { validateGST } = await import('../utils/validators');
    const result = validateGST(101);
    expect(result.valid).toBe(false);
  });

  it('validateGST accepts 18', async () => {
    const { validateGST } = await import('../utils/validators');
    const result = validateGST(18);
    expect(result.valid).toBe(true);
  });
});

// ── Phase 0 safety: no mock-only data paths ─────────────────────────────────
describe('Phase 0 — safety contracts', () => {
  it('api utility module is importable', async () => {
    // Lightweight check: the axios instance is exported
    const apiModule = await import('../utils/api');
    expect(apiModule.default).toBeDefined();
  });
});
