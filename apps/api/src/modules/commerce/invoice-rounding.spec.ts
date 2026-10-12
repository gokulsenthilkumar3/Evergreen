import { calculateInvoiceTotals } from './invoice-totals';

describe('Document discount reconciliation', () => {
  const line = (rate: number, gstRate = 100) => ({ quantity: 1, rate, discount: 0, gstRate });

  it('allocates a one-paise discount once across three tiny lines', () => {
    expect(calculateInvoiceTotals([line(0.01), line(0.01), line(0.01)], 0.01, 'TN', 'KL'))
      .toEqual({ subtotal: 0.03, discount: 0.01, cgst: 0, sgst: 0, igst: 0.02, total: 0.04 });
  });

  it('reconciles a two-paise discount without dropping a paise of taxable value', () => {
    expect(calculateInvoiceTotals([line(0.01), line(0.01), line(0.01)], 0.02, 'TN', 'TN'))
      .toMatchObject({ subtotal: 0.03, discount: 0.02, cgst: 0.01, sgst: 0, total: 0.02 });
  });

  it('allocates the residual to the largest share before calculating mixed-rate tax', () => {
    const totals = calculateInvoiceTotals([line(0.03, 0), line(0.02, 100)], 0.01, 'TN', 'KL');
    expect(totals).toMatchObject({ discount: 0.01, igst: 0.02, total: 0.06 });
  });

  it('handles fully discounted and zero-value lines without division by zero', () => {
    expect(calculateInvoiceTotals([line(0), line(1)], 1, 'TN', 'KL').total).toBe(0);
    expect(calculateInvoiceTotals([line(0)], 0, 'TN', 'KL').total).toBe(0);
  });

  it('preserves taxable paise over many lines and repeated discounts', () => {
    const lines = Array.from({ length: 101 }, () => line(0.01));
    for (let paise = 0; paise <= 101; paise++) {
      const result = calculateInvoiceTotals(lines, paise / 100, 'TN', 'KL');
      expect(Math.round(result.igst * 100)).toBe(101 - paise);
      expect(Math.round(result.total * 100)).toBe(2 * (101 - paise));
    }
  });
});
