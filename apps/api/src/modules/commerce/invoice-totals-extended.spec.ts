/**
 * CommerceService — unit tests (extended invoice totals coverage)
 *
 * The calculateInvoiceTotals function has two modes:
 *  - Simple mode: second param is boolean (interstate flag); discount = % of line total
 *  - Full mode:   second param is number (document discount amount);
 *                 sellerState/buyerState determine CGST/SGST vs IGST
 *
 * In full mode:
 *  - subtotal = sum of (quantity × rate) MINUS line discounts (already deducted)
 *  - discount = the document-level discount amount
 *  - undefined buyerState defaults to sellerState (same-state = CGST+SGST)
 */
import { calculateInvoiceTotals } from './invoice-totals';

// ---------------------------------------------------------------------------
// Full-mode (numeric discount) tests
// ---------------------------------------------------------------------------
describe('calculateInvoiceTotals — full mode (numeric discount)', () => {
  // ── Same-state (CGST + SGST) ─────────────────────────────────────────────

  describe('intra-state (same state)', () => {
    it('correctly splits 18% GST as CGST + SGST', () => {
      const result = calculateInvoiceTotals(
        [{ quantity: 10, rate: 100, discount: 0, gstRate: 18 }],
        0,
        'Tamil Nadu',
        'Tamil Nadu',
      );
      expect(result.cgst).toBeCloseTo(90);
      expect(result.sgst).toBeCloseTo(90);
      expect(result.igst).toBe(0);
      expect(result.total).toBeCloseTo(1180);
    });

    it('handles 5% GST correctly intra-state', () => {
      const result = calculateInvoiceTotals(
        [{ quantity: 100, rate: 50, discount: 0, gstRate: 5 }],
        0,
        'Tamil Nadu',
        'Tamil Nadu',
      );
      // subtotal = after-line-discount value = 5000 (no line discount)
      expect(result.subtotal).toBeCloseTo(5000);
      expect(result.cgst).toBeCloseTo(125);
      expect(result.sgst).toBeCloseTo(125);
      expect(result.total).toBeCloseTo(5250);
    });

    it('applies 0% GST (exempt items) correctly', () => {
      const result = calculateInvoiceTotals(
        [{ quantity: 10, rate: 200, discount: 0, gstRate: 0 }],
        0,
        'Tamil Nadu',
        'Tamil Nadu',
      );
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.total).toBeCloseTo(2000);
    });
  });

  // ── Inter-state (IGST) ───────────────────────────────────────────────────

  describe('inter-state (different states)', () => {
    it('applies full IGST for Kerala buyer from Tamil Nadu seller', () => {
      const result = calculateInvoiceTotals(
        [{ quantity: 5, rate: 200, discount: 0, gstRate: 12 }],
        0,
        'Tamil Nadu',
        'Kerala',
      );
      expect(result.igst).toBeCloseTo(120);
      expect(result.cgst).toBe(0);
      expect(result.sgst).toBe(0);
      expect(result.total).toBeCloseTo(1120);
    });

    it('undefined buyerState defaults to sellerState (same-state = CGST+SGST)', () => {
      // When buyerState is undefined, it defaults to sellerState → same-state → CGST+SGST
      const result = calculateInvoiceTotals(
        [{ quantity: 1, rate: 1000, discount: 0, gstRate: 18 }],
        0,
        'Tamil Nadu',
        undefined as any,
      );
      // Same-state: CGST + SGST, not IGST
      expect(result.cgst).toBeCloseTo(90);
      expect(result.sgst).toBeCloseTo(90);
      expect(result.igst).toBe(0);
    });
  });

  // ── Discounts ────────────────────────────────────────────────────────────

  describe('discounts', () => {
    it('applies line-level discount as an amount (full mode) before tax', () => {
      // In full mode, discount on each line is an amount (not a percentage)
      const result = calculateInvoiceTotals(
        [{ quantity: 10, rate: 100, discount: 100, gstRate: 18 }],
        0,
        'Tamil Nadu',
        'Tamil Nadu',
      );
      // gross lineTotal = 1000; lineDiscount = 100 (amount); taxable = 900
      // In full mode, subtotal = sum of (lineTotal - lineDiscount) = 900
      expect(result.subtotal).toBeCloseTo(900);
      expect(result.cgst).toBeCloseTo(81); // 18% of 900 = 162, split: 81 each
      expect(result.sgst).toBeCloseTo(81);
    });

    it('applies document-level discount after summing lines', () => {
      const result = calculateInvoiceTotals(
        [
          { quantity: 1, rate: 500, discount: 0, gstRate: 18 },
          { quantity: 1, rate: 500, discount: 0, gstRate: 18 },
        ],
        100, // document-level discount
        'Tamil Nadu',
        'Tamil Nadu',
      );
      // subtotal = 1000 (after line discounts, which are 0 here)
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(100);
    });

    it('rejects document-level discount exceeding subtotal', () => {
      expect(() =>
        calculateInvoiceTotals(
          [{ quantity: 1, rate: 100, discount: 0, gstRate: 18 }],
          101,
          'Tamil Nadu',
          'Kerala',
        ),
      ).toThrow();
    });

    it('rejects line-level discount exceeding line value', () => {
      expect(() =>
        calculateInvoiceTotals(
          [{ quantity: 1, rate: 100, discount: 101, gstRate: 18 }],
          0,
          'Tamil Nadu',
          'Kerala',
        ),
      ).toThrow();
    });
  });

  // ── Multi-line invoices ──────────────────────────────────────────────────

  describe('multi-line invoices', () => {
    it('sums multiple lines with different GST rates', () => {
      const result = calculateInvoiceTotals(
        [
          { quantity: 100, rate: 50, discount: 0, gstRate: 5 },   // yarn: 5000, tax 250
          { quantity: 10, rate: 100, discount: 0, gstRate: 18 },  // services: 1000, tax 180
        ],
        0,
        'Tamil Nadu',
        'Kerala',
      );
      // Line 1: 5000 × 5% = 250 IGST; Line 2: 1000 × 18% = 180 IGST
      expect(result.igst).toBeCloseTo(430);
      expect(result.subtotal).toBe(6000);
      expect(result.total).toBeCloseTo(6430);
    });

    it('handles a large number of lines correctly', () => {
      const lines = Array.from({ length: 20 }, (_, i) => ({
        quantity: 1,
        rate: 100 + i,
        discount: 0,
        gstRate: 18,
      }));
      const result = calculateInvoiceTotals(lines, 0, 'Tamil Nadu', 'Tamil Nadu');
      const expectedSubtotal = lines.reduce((sum, l) => sum + l.rate, 0);
      expect(result.subtotal).toBeCloseTo(expectedSubtotal);
    });
  });

  // ── Validation guards ────────────────────────────────────────────────────

  describe('validation guards', () => {
    it.each([
      { quantity: 0, rate: 100, discount: 0, gstRate: 18 },
      { quantity: -1, rate: 100, discount: 0, gstRate: 18 },
      { quantity: 1, rate: -1, discount: 0, gstRate: 18 },
      { quantity: 1, rate: 100, discount: -1, gstRate: 18 },
      { quantity: 1, rate: 100, discount: 0, gstRate: -1 },
      { quantity: 1, rate: 100, discount: 0, gstRate: 101 },
    ])('rejects invalid line: %j', (line) => {
      expect(() =>
        calculateInvoiceTotals([line], 0, 'Tamil Nadu', 'Kerala'),
      ).toThrow();
    });

    it('rejects negative document-level discount', () => {
      expect(() =>
        calculateInvoiceTotals(
          [{ quantity: 1, rate: 100, discount: 0, gstRate: 18 }],
          -10,
          'Tamil Nadu',
          'Kerala',
        ),
      ).toThrow();
    });
  });

  // ── Precision and rounding ───────────────────────────────────────────────

  describe('precision', () => {
    it('returns values rounded to 2 decimal places', () => {
      const result = calculateInvoiceTotals(
        [{ quantity: 1, rate: 33.33, discount: 0, gstRate: 18 }],
        0,
        'Tamil Nadu',
        'Tamil Nadu',
      );
      // Result should not have more than 2 decimal places
      expect(Number(result.cgst.toFixed(2))).toBe(result.cgst);
      expect(Number(result.sgst.toFixed(2))).toBe(result.sgst);
      expect(Number(result.total.toFixed(2))).toBe(result.total);
    });

    it('does not introduce floating-point drift for common values', () => {
      const result = calculateInvoiceTotals(
        [
          { quantity: 3, rate: 33.33, discount: 0, gstRate: 18 },
        ],
        0,
        'Tamil Nadu',
        'Tamil Nadu',
      );
      // 3 × 33.33 = 99.99; subtotal = 99.99
      expect(result.subtotal).toBeCloseTo(99.99, 2);
    });
  });
});

// ---------------------------------------------------------------------------
// Simple-mode (boolean second param) tests — mirrors the smoke tests
// ---------------------------------------------------------------------------
describe('calculateInvoiceTotals — simple mode (boolean interstate flag)', () => {
  it('applies CGST + SGST when interstate=false', () => {
    const result = calculateInvoiceTotals(
      [{ quantity: 10, rate: 100, discount: 0, gstRate: 18 }],
      false, // same-state
    );
    expect(result.cgst).toBeCloseTo(90);
    expect(result.sgst).toBeCloseTo(90);
    expect(result.igst).toBe(0);
  });

  it('applies IGST when interstate=true', () => {
    const result = calculateInvoiceTotals(
      [{ quantity: 10, rate: 100, discount: 0, gstRate: 18 }],
      true, // interstate
    );
    expect(result.igst).toBeCloseTo(180);
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
  });

  it('treats discount as percentage in simple mode', () => {
    const result = calculateInvoiceTotals(
      [{ quantity: 10, rate: 100, discount: 10, gstRate: 18 }],
      false, // same-state
    );
    // 10% of 1000 = 100 discount
    expect(result.discount).toBeCloseTo(100);
  });
});
