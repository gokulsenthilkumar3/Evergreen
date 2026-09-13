// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  computeInvoiceLine,
  computeInvoiceTotals,
  formatINR,
  INDIAN_STATES_WITH_CODE,
  stateCodeFor,
} from '@/lib/business/invoice-tax';

describe('invoice GST math', () => {
  describe('intra-state (sellerState === buyerState)', () => {
    it('splits 18% evenly into CGST + SGST at half-rate (9% each)', () => {
      const line = computeInvoiceLine({
        qty: 10,
        unitRate: 100,
        gstRate: 18,
        sellerState: 'Tamil Nadu',
        buyerState: 'Tamil Nadu',
      });
      expect(line.split).toBe('CGST_SGST');
      expect(line.taxable).toBe(1000);
      // 1000 * 18 / 200 = 90 each side
      expect(line.cgst).toBe(90);
      expect(line.sgst).toBe(90);
      expect(line.igst).toBe(0);
      expect(line.lineTotal).toBe(1180);
    });

    it('handles 5% GST correctly (default rate)', () => {
      const line = computeInvoiceLine({
        qty: 50,
        unitRate: 180,
        gstRate: 5,
        sellerState: 'Tamil Nadu',
        buyerState: 'Tamil Nadu',
      });
      expect(line.taxable).toBe(9000);
      // 9000 * 5 / 200 = 225 each side
      expect(line.cgst).toBe(225);
      expect(line.sgst).toBe(225);
      expect(line.lineTotal).toBe(9450);
    });

    it('handles 28% GST correctly', () => {
      const line = computeInvoiceLine({
        qty: 1,
        unitRate: 1000,
        gstRate: 28,
        sellerState: 'Maharashtra',
        buyerState: 'Maharashtra',
      });
      expect(line.taxable).toBe(1000);
      expect(line.cgst).toBe(140);
      expect(line.sgst).toBe(140);
      expect(line.lineTotal).toBe(1280);
    });
  });

  describe('inter-state (sellerState !== buyerState)', () => {
    it('collects full 18% as IGST', () => {
      const line = computeInvoiceLine({
        qty: 10,
        unitRate: 100,
        gstRate: 18,
        sellerState: 'Tamil Nadu',
        buyerState: 'Karnataka',
      });
      expect(line.split).toBe('IGST');
      expect(line.taxable).toBe(1000);
      expect(line.cgst).toBe(0);
      expect(line.sgst).toBe(0);
      expect(line.igst).toBe(180);
      expect(line.lineTotal).toBe(1180);
    });

    it('inter-state 5% GST', () => {
      const line = computeInvoiceLine({
        qty: 50,
        unitRate: 180,
        gstRate: 5,
        sellerState: 'Tamil Nadu',
        buyerState: 'Karnataka',
      });
      expect(line.taxable).toBe(9000);
      expect(line.igst).toBe(450);
      expect(line.lineTotal).toBe(9450);
    });
  });

  describe('rounding', () => {
    it('rounds 1.235 to 1.24 (half-away-from-zero, not bankers)', () => {
      const line = computeInvoiceLine({
        qty: 1,
        unitRate: 12.35,
        gstRate: 0,
        sellerState: 'Tamil Nadu',
        buyerState: 'Tamil Nadu',
      });
      expect(line.taxable).toBe(12.35);
    });

    it('handles three-decimal qty without float drift', () => {
      const line = computeInvoiceLine({
        qty: 1.5,
        unitRate: 100.33,
        gstRate: 18,
        sellerState: 'Tamil Nadu',
        buyerState: 'Tamil Nadu',
      });
      // 1.5 * 100.33 = 150.495 -> round2 -> 150.50 (half-away-from-zero)
      expect(line.taxable).toBe(150.5);
    });
  });

  describe('totals', () => {
    it('totals equal sum of rounded line totals', () => {
      const lines = [
        computeInvoiceLine({
          qty: 50,
          unitRate: 180,
          gstRate: 5,
          sellerState: 'Tamil Nadu',
          buyerState: 'Karnataka',
        }),
        computeInvoiceLine({
          qty: 20,
          unitRate: 240,
          gstRate: 5,
          sellerState: 'Tamil Nadu',
          buyerState: 'Karnataka',
        }),
      ];
      const totals = computeInvoiceTotals(lines);
      // Line 1: 50*180 = 9000 taxable, 450 IGST, lineTotal = 9450
      // Line 2: 20*240 = 4800 taxable, 240 IGST, lineTotal = 5040
      // Sum taxable: 13800; sum IGST: 690; grand total: 9450 + 5040 = 14490.
      expect(totals.totalTaxable).toBe(13800);
      expect(totals.totalIgst).toBe(690);
      expect(totals.totalCgst).toBe(0);
      expect(totals.totalSgst).toBe(0);
      expect(totals.grandTotal).toBe(14490);
    });
  });

  describe('INR + state list', () => {
    it('formats positive amounts as en-IN currency', () => {
      const s = formatINR(1234567.5);
      // en-IN uses the lakh/crore grouping with ₹ prefix.
      expect(s).toContain('12,34,567.50');
    });

    it('maps a known state name to its 2-digit GST code', () => {
      expect(stateCodeFor('Tamil Nadu')).toBe('33');
      expect(stateCodeFor('Karnataka')).toBe('29');
      expect(stateCodeFor('Delhi')).toBe('07');
      expect(stateCodeFor('Maharashtra')).toBe('27');
    });

    it('returns em-dash for an unknown state name', () => {
      expect(stateCodeFor('Atlantis')).toBe('–');
    });

    it('exposes exactly 36 entries (28 states + 8 UTs)', () => {
      // 28 states + 8 UTs documented on the India GST portal.
      expect(INDIAN_STATES_WITH_CODE.length).toBe(36);
    });
  });
});
