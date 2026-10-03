import { calculateInvoiceTotals } from './invoice-totals';

describe('GST invoice totals', () => {
  const line = { quantity: 2, rate: 100, discount: 20, gstRate: 18 };

  it('splits intra-state GST after line and document discounts', () => {
    expect(
      calculateInvoiceTotals([line], 30, 'Tamil Nadu', 'tamil nadu'),
    ).toEqual({
      subtotal: 180,
      discount: 30,
      cgst: 13.5,
      sgst: 13.5,
      igst: 0,
      total: 177,
    });
  });

  it('charges IGST for inter-state sales', () => {
    expect(calculateInvoiceTotals([line], 30, 'Tamil Nadu', 'Kerala')).toEqual({
      subtotal: 180,
      discount: 30,
      cgst: 0,
      sgst: 0,
      igst: 27,
      total: 177,
    });
  });

  it('rejects discounts larger than taxable value', () => {
    expect(() =>
      calculateInvoiceTotals([line], 181, 'Tamil Nadu', 'Kerala'),
    ).toThrow();
    expect(() =>
      calculateInvoiceTotals(
        [{ ...line, discount: 201 }],
        0,
        'Tamil Nadu',
        'Kerala',
      ),
    ).toThrow();
  });

  it('taxes each line after its own discount', () => {
    expect(
      calculateInvoiceTotals(
        [
          { quantity: 1, rate: 100, discount: 50, gstRate: 5 },
          { quantity: 1, rate: 100, discount: 0, gstRate: 18 },
        ],
        0,
        'Tamil Nadu',
        'Kerala',
      ),
    ).toEqual({
      subtotal: 150,
      discount: 0,
      cgst: 0,
      sgst: 0,
      igst: 20.5,
      total: 170.5,
    });
  });

  it.each([
    { quantity: 0, rate: 100, discount: 0, gstRate: 18 },
    { quantity: 1, rate: -1, discount: 0, gstRate: 18 },
    { quantity: 1, rate: 100, discount: -1, gstRate: 18 },
    { quantity: 1, rate: 100, discount: 0, gstRate: -1 },
    { quantity: 1, rate: 100, discount: 0, gstRate: 101 },
  ])('rejects out-of-range line values: %j', (invalidLine) => {
    expect(() =>
      calculateInvoiceTotals([invalidLine], 0, 'Tamil Nadu', 'Kerala'),
    ).toThrow();
  });
});
