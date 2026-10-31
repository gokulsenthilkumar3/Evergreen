import { describe, expect, it } from 'vitest';
import { parseImportCsv, previewImport, type ImportInput } from '@evergreen/types';

describe('legacy CSV migration', () => {
  it('reads BOM, CRLF, commas, multiline fields and escaped quotes without losing text', () => {
    expect(parseImportCsv('\uFEFFParty,Address\r\n"A, B","Line 1\nLine ""2"""\r\n')).toEqual({ headers: ['Party', 'Address'], rows: [['A, B', 'Line 1\nLine "2"']] });
  });
  it.each(['A,A\n1,2', 'A,B\n1', 'A\n"unclosed', 'A\n"x"bad', 'A\n', 'A,\n1,2'])('rejects malformed or ambiguous CSV: %s', text => {
    expect(() => parseImportCsv(text)).toThrow();
  });
  it('does not guess unknown headings and reports ignored columns', () => {
    const file = parseImportCsv('Odd heading,Old phone,Ignore this\nCustomer One,0123456789,legacy');
    const input: ImportInput = { entity: 'customers', ...file, mapping: { name: 0, phone: 1 } };
    expect(previewImport(input)).toEqual({ records: [{ name: 'Customer One', phone: '0123456789' }], issues: [], ignoredHeaders: ['Ignore this'] });
  });
  it('reports row-specific errors and canonicalizes catalogue identifiers', () => {
    const result = previewImport({ entity: 'items', headers: ['code', 'description', 'category', 'unit', 'tax'], rows: [['a', 'Yarn', 'yarn', 'KG', '101'], ['A', 'Yarn', 'BAD', 'KG', 'NaN']], mapping: { sku: 0, name: 1, type: 2, uom: 3, gstRate: 4 } });
    expect(result.records[0]).toMatchObject({ sku: 'A', type: 'YARN' });
    expect(result.issues).toEqual(expect.arrayContaining([expect.objectContaining({ row: 2, field: 'gstRate' }), expect.objectContaining({ row: 3, field: 'sku' }), expect.objectContaining({ row: 3, field: 'type' })]));
  });
  it.each([{ name: 4 }, { name: 0, email: 0 }, { name: 0, stock: 1 }, {}])('rejects unsafe mappings %j', mapping => {
    expect(() => previewImport({ entity: 'customers', headers: ['Party', 'Value'], rows: [['A', 'B']], mapping } as ImportInput)).toThrow();
  });
  it('rejects oversized batches before persistence', () => {
    expect(() => previewImport({ entity: 'customers', headers: ['Name'], rows: Array.from({ length: 501 }, () => ['A']), mapping: { name: 0 } })).toThrow('1–500');
  });
});
