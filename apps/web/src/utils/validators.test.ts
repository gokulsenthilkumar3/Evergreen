import { describe, expect, it } from 'vitest';
import {
  collectErrors,
  hasErrors,
  isValidDate,
  safeParseFloat,
  validateBagCount,
  validateBale,
  validateBatchConsumption,
  validateCostAmount,
  validateCustomerName,
  validateDate,
  validateGST,
  validatePassword,
  validatePaymentAmount,
  validateProductionBalance,
  validateSupplier,
  validateUsername,
  validateVehicleNo,
  validateWeight,
  validateWorkingDays,
} from './validators';

describe('numeric input validation', () => {
  it.each([
    ['', 0],
    ['12.5', 12.5],
    [' 12.5 ', 12.5],
    ['12kg', 0],
    ['Infinity', 0],
    [Number.POSITIVE_INFINITY, 0],
  ])('parses %j as %s without accepting partial or non-finite values', (input, expected) => {
    expect(safeParseFloat(input)).toBe(expected);
  });

  it('enforces bale, weight, bag, cost, and working-day boundaries', () => {
    expect(validateBale(1).valid).toBe(true);
    expect(validateBale(1.5).valid).toBe(false);
    expect(validateBale(10_000).valid).toBe(false);
    expect(validateWeight('12kg').valid).toBe(false);
    expect(validateWeight(1_000_000).valid).toBe(false);
    expect(validateBagCount(2.5).valid).toBe(false);
    expect(validateBagCount(11, 10).valid).toBe(false);
    expect(validateCostAmount(9_999_999).valid).toBe(true);
    expect(validateCostAmount(10_000_000).valid).toBe(false);
    expect(validateWorkingDays(31).valid).toBe(true);
    expect(validateWorkingDays(32).valid).toBe(false);
  });
});

describe('calendar validation', () => {
  it.each(['2026-01-01', '2024-02-29'])('accepts real ISO dates: %s', (date) => {
    expect(isValidDate(date)).toBe(true);
  });

  it.each(['', '2026-2-01', '2026-02-29', '2026-02-31', 'not-a-date'])('rejects malformed or impossible dates: %s', (date) => {
    expect(isValidDate(date)).toBe(false);
  });

  it('rejects a future date unless explicitly allowed', () => {
    expect(validateDate('2999-01-01').valid).toBe(false);
    expect(validateDate('2999-01-01', true).valid).toBe(true);
  });
});

describe('production and stock invariants', () => {
  it('allows the documented 0.01 kg material-balance tolerance', () => {
    expect(validateProductionBalance(100, 89.99, 10, 0).valid).toBe(true);
    expect(validateProductionBalance(100, 89.98, 10, 0).valid).toBe(false);
  });

  it('prevents zero and over-consumption of a batch', () => {
    expect(validateBatchConsumption(0, 100).valid).toBe(false);
    expect(validateBatchConsumption(100.01, 100, 'LOT-1').message).toContain('LOT-1');
    expect(validateBatchConsumption(100, 100).valid).toBe(true);
  });
});

describe('commerce, identity, and form validation', () => {
  it('validates vehicle registration formats', () => {
    expect(validateVehicleNo('TN 01 AB 1234').valid).toBe(true);
    expect(validateVehicleNo('TN01AB1234').valid).toBe(true);
    expect(validateVehicleNo('XXXX-000').valid).toBe(false);
  });

  it('validates names and credentials after trimming', () => {
    expect(validateSupplier('  ').valid).toBe(false);
    expect(validateCustomerName('A').valid).toBe(false);
    expect(validateUsername('valid.user-1').valid).toBe(true);
    expect(validateUsername('<admin>').valid).toBe(false);
    expect(validatePassword('12345').valid).toBe(false);
  });

  it('enforces GST and payment limits', () => {
    expect(validateGST(28).valid).toBe(true);
    expect(validateGST(28.01).valid).toBe(false);
    expect(validatePaymentAmount(100.01, 100).valid).toBe(true);
    expect(validatePaymentAmount(100.02, 100).valid).toBe(false);
  });

  it('collects only actionable form errors', () => {
    const errors = collectErrors({
      supplier: { valid: false, message: 'Required' },
      weight: { valid: true },
      silent: { valid: false },
    });
    expect(errors).toEqual({ supplier: 'Required' });
    expect(hasErrors(errors)).toBe(true);
    expect(hasErrors({})).toBe(false);
  });
});
