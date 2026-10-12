import { describe, expect, it } from 'vitest';
import { buildCSV, csvCell } from './csvGenerator';

describe('CSV export safety and cell fidelity', () => {
  it.each(['=1+1', '+SUM(A1)', '-CMD()', '@SUM(A1)', '  =HYPERLINK("https://example.test")', '\t=1', '\r=1'])('exports formula-like text as text: %s', value => {
    expect(csvCell(value)).toBe(`"'${value.replace(/"/g, '""')}"`);
  });

  it('preserves quotes, commas, newlines, Tamil and signed numeric amounts', () => {
    expect(buildCSV(['Party "name"', '=Header'], [['தமிழ், Mill\n"A"', -12.5]]))
      .toBe('\uFEFF"Party ""name""","\'=Header"\r\n"தமிழ், Mill\n""A""",-12.5');
  });

  it('places the BOM directly before the header and preserves empty values', () => {
    expect(buildCSV(['First', 'Second'], [[null, undefined], [0, false]]))
      .toBe('\uFEFF"First","Second"\r\n,\r\n0,"false"');
  });
});
