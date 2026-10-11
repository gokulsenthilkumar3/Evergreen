import { describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';
import { generateExcel } from './excelGenerator';

vi.mock('xlsx', async importOriginal => ({
  ...await importOriginal<typeof import('xlsx')>(),
  writeFile: vi.fn(),
}));

describe('Excel export', () => {
  it('downloads a named workbook with numbers and literal formula-like text', () => {
    generateExcel([{ Description: '=HYPERLINK("https://example.test")', Amount: 123.45 }], 'invoices', 'Invoices');
    expect(XLSX.writeFile).toHaveBeenCalledOnce();
    const [workbook, filename] = vi.mocked(XLSX.writeFile).mock.calls[0];
    expect(filename).toBe('invoices.xlsx');
    expect(workbook.SheetNames).toEqual(['Invoices']);
    expect(workbook.Sheets.Invoices.B2).toMatchObject({ t: 'n', v: 123.45 });
    expect(workbook.Sheets.Invoices.A2.t).toBe('s');
    expect(workbook.Sheets.Invoices.A2.f).toBeUndefined();
    const bytes = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    expect(XLSX.read(bytes, { type: 'array' }).SheetNames).toEqual(['Invoices']);
  });
});
