/**
 * Web unit tests — Licensing and Business Mode logic
 *
 * Tests the company profile utilities from @evergreen/types that control
 * which pages are visible per business mode, workspace mode, and role.
 * These are pure-function tests; no network or DOM required.
 */
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Business mode page visibility
// ---------------------------------------------------------------------------
describe('@evergreen/types — isCompanyPageVisible()', () => {
  it('is importable from the types package', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    expect(typeof isCompanyPageVisible).toBe('function');
  });

  it('returns a boolean for any valid page/role/mode combination', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    const result = isCompanyPageVisible('dashboard', 'VIEWER', 'INTEGRATED', 'FULL');
    expect(typeof result).toBe('boolean');
  });

  it('dashboard is visible in every business mode', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    const modes = ['INTEGRATED', 'WAREHOUSE_ONLY', 'MILL_ONLY', 'PROCESSING_ONLY', 'TRADER'];
    for (const mode of modes) {
      expect(
        isCompanyPageVisible('dashboard', 'VIEWER', mode as any, 'FULL'),
        `dashboard should be visible in ${mode}`,
      ).toBe(true);
    }
  });

  it('production-entry is NOT visible in WAREHOUSE_ONLY mode', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    expect(
      isCompanyPageVisible('production', 'MODIFIER', 'WAREHOUSE_ONLY', 'FULL'),
    ).toBe(false);
  });

  it('production-entry IS visible in MILL_ONLY mode', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    expect(
      isCompanyPageVisible('production', 'MODIFIER', 'MILL_ONLY', 'FULL'),
    ).toBe(true);
  });

  it('production-entry IS visible in INTEGRATED mode', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    expect(
      isCompanyPageVisible('production', 'MODIFIER', 'INTEGRATED', 'FULL'),
    ).toBe(true);
  });

  it('user-management requires ADMIN role', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    expect(
      isCompanyPageVisible('users', 'VIEWER', 'INTEGRATED', 'FULL'),
    ).toBe(false);
    expect(
      isCompanyPageVisible('users', 'MODIFIER', 'INTEGRATED', 'FULL'),
    ).toBe(false);
    expect(
      isCompanyPageVisible('users', 'ADMIN', 'INTEGRATED', 'FULL'),
    ).toBe(true);
  });

  it('guided workspace hides advanced modules', async () => {
    const { isCompanyPageVisible } = await import('@evergreen/types');
    // Warehouse management should not appear in GUIDED mode
    const guidedResult = isCompanyPageVisible('warehouse', 'ADMIN', 'INTEGRATED', 'GUIDED');
    const fullResult = isCompanyPageVisible('warehouse', 'ADMIN', 'INTEGRATED', 'FULL');
    // In GUIDED mode the result should be false or equal; FULL should be true
    expect(fullResult).toBe(true);
    expect(guidedResult).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Yarn counts and catalogue constants
// ---------------------------------------------------------------------------
describe('@evergreen/types — constants', () => {
  it('YARN_COUNTS returns 5 standard counts', async () => {
    const { YARN_COUNTS } = await import('@evergreen/types');
    const counts = Array.from(YARN_COUNTS);
    expect(counts).toEqual(['2', '4', '6', '8', '10']);
  });

  it('USER_ROLES contains exactly three roles', async () => {
    const { USER_ROLES } = await import('@evergreen/types');
    expect(USER_ROLES).toHaveLength(3);
    expect(USER_ROLES).toContain('VIEWER');
    expect(USER_ROLES).toContain('MODIFIER');
    expect(USER_ROLES).toContain('ADMIN');
  });

  it('IMPORT_FIELDS contains customer and items entities', async () => {
    const { IMPORT_FIELDS } = await import('@evergreen/types');
    expect(IMPORT_FIELDS).toHaveProperty('customers');
    expect(IMPORT_FIELDS).toHaveProperty('items');
    expect(Array.isArray(IMPORT_FIELDS.customers)).toBe(true);
    expect(Array.isArray(IMPORT_FIELDS.items)).toBe(true);
  });

  it('IMPORT_FIELDS.customers includes name as required field', async () => {
    const { IMPORT_FIELDS } = await import('@evergreen/types');
    expect(IMPORT_FIELDS.customers).toContain('name');
  });

  it('IMPORT_FIELDS.items includes sku, name, type, uom as required fields', async () => {
    const { IMPORT_FIELDS } = await import('@evergreen/types');
    expect(IMPORT_FIELDS.items).toContain('sku');
    expect(IMPORT_FIELDS.items).toContain('name');
    expect(IMPORT_FIELDS.items).toContain('type');
    expect(IMPORT_FIELDS.items).toContain('uom');
  });
});

// ---------------------------------------------------------------------------
// Import CSV parsing
// ---------------------------------------------------------------------------
describe('@evergreen/types — parseImportCsv()', () => {
  it('parses a valid UTF-8 CSV with headers and rows', async () => {
    const { parseImportCsv } = await import('@evergreen/types');
    const csv = 'Name,Phone\nRamesh,9876543210\nSuresh,9123456789';
    const result = parseImportCsv(csv);
    expect(result.headers).toEqual(['Name', 'Phone']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['Ramesh', '9876543210']);
  });

  it('strips UTF-8 BOM from CSV content', async () => {
    const { parseImportCsv } = await import('@evergreen/types');
    const csvWithBom = '\uFEFFName,Phone\nTest,1234567890';
    const result = parseImportCsv(csvWithBom);
    expect(result.headers[0]).toBe('Name'); // BOM stripped
  });

  it('handles quoted fields with commas inside', async () => {
    const { parseImportCsv } = await import('@evergreen/types');
    const csv = 'Name,Address\n"Ram, Co","123 Main, Chennai"';
    const result = parseImportCsv(csv);
    expect(result.rows[0][0]).toBe('Ram, Co');
    expect(result.rows[0][1]).toBe('123 Main, Chennai');
  });

  it('throws for CSV with no headers', async () => {
    const { parseImportCsv } = await import('@evergreen/types');
    expect(() => parseImportCsv('')).toThrow();
    expect(() => parseImportCsv('\n\n')).toThrow();
  });

  it('throws for CSV exceeding 500 rows', async () => {
    const { parseImportCsv } = await import('@evergreen/types');
    const rows = Array.from({ length: 502 }, (_, i) => `Name${i},Phone${i}`);
    const csv = ['Name,Phone', ...rows].join('\n');
    expect(() => parseImportCsv(csv)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// previewImport — field mapping and validation
// ---------------------------------------------------------------------------
describe('@evergreen/types — previewImport()', () => {
  it('returns no issues for a valid customer import', async () => {
    const { previewImport } = await import('@evergreen/types');
    const result = previewImport({
      entity: 'customers',
      headers: ['Party', 'Tel'],
      rows: [['Ramesh Textiles', '9876543210']],
      mapping: { name: 0, phone: 1 },
    });
    expect(result.issues).toHaveLength(0);
    expect(result.records).toHaveLength(1);
    expect(result.records[0].name).toBe('Ramesh Textiles');
  });

  it('returns issues for missing required field (name)', async () => {
    const { previewImport } = await import('@evergreen/types');
    const result = previewImport({
      entity: 'customers',
      headers: ['Party'],
      rows: [['']],
      mapping: { name: 0 },
    });
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].field).toBe('name');
  });

  it('reports ignored headers', async () => {
    const { previewImport } = await import('@evergreen/types');
    const result = previewImport({
      entity: 'customers',
      headers: ['Party', 'UnknownCol', 'Tel'],
      rows: [['Test Co', 'somevalue', '9876543210']],
      mapping: { name: 0, phone: 2 },
    });
    expect(result.ignoredHeaders).toContain('UnknownCol');
  });

  it('validates item type must be one of the allowed values', async () => {
    const { previewImport } = await import('@evergreen/types');
    const result = previewImport({
      entity: 'items',
      headers: ['SKU', 'Name', 'Type', 'UOM'],
      rows: [['YARN-001', 'Test Yarn', 'INVALID_TYPE', 'KG']],
      mapping: { sku: 0, name: 1, type: 2, uom: 3 },
    });
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((i) => i.field === 'type')).toBe(true);
  });

  it('normalizes numeric fields and does not leave undefined', async () => {
    const { previewImport } = await import('@evergreen/types');
    const result = previewImport({
      entity: 'items',
      headers: ['SKU', 'Name', 'Type', 'UOM', 'GST'],
      rows: [['YARN-002', 'Test', 'YARN', 'KG', '']],
      mapping: { sku: 0, name: 1, type: 2, uom: 3, gstRate: 4 },
    });
    if (result.records.length > 0) {
      expect(result.records[0].gstRate).toBe(0); // defaults to 0
    }
  });
});
