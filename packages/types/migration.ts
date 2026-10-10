/** Explicit column mapping for master data. Never imports stock or accounting balances. */
export const IMPORT_FIELDS = {
  customers: ['name', 'phone', 'email', 'gstin', 'state', 'address'],
  items: ['sku', 'name', 'type', 'uom', 'hsnSac', 'gstRate', 'salePrice'],
} as const;
export type ImportEntity = keyof typeof IMPORT_FIELDS;
export interface ImportInput { entity: ImportEntity; headers: string[]; rows: string[][]; mapping: Record<string, number>; }
export interface ImportIssue { row: number; field: string; message: string; }
export interface ImportPreview { records: Record<string, string | number>[]; issues: ImportIssue[]; ignoredHeaders: string[]; }
const ITEM_TYPES = ['RAW_MATERIAL', 'YARN', 'FINISHED_GOOD', 'JOB_WORK_MATERIAL', 'SERVICE'];

/** CSV supports quoted commas, embedded newlines, CRLF, escaped quotes and UTF-8 BOM. */
export function parseImportCsv(text: string): { headers: string[]; rows: string[][] } {
  if (text.length > 500_000) throw new Error('Use a CSV smaller than 500 KB.');
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false, closed = false;
  const pushRow = () => { row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = ''; closed = false; };
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else cell += ch;
    } else if (ch === '"') {
      if (cell || closed) throw new Error('Unexpected quote in CSV.');
      quoted = true;
    } else if (ch === ',') { row.push(cell); cell = ''; closed = false; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && input[i + 1] === '\n') i++; pushRow(); }
    else { if (closed) throw new Error('Unexpected text after a quoted CSV cell.'); cell += ch; }
  }
  if (quoted) throw new Error('A quoted CSV cell is not closed.');
  if (cell || row.length || closed) pushRow();
  if (rows.length < 2) throw new Error('Include a header and at least one data row.');
  const headers = rows.shift()!.map(value => value.trim());
  if (headers.length > 50 || !headers.length || headers.some(value => !value)) throw new Error('Use 1–50 non-empty column headers.');
  if (new Set(headers.map(value => value.toLowerCase())).size !== headers.length) throw new Error('Rename duplicate column headers before importing.');
  if (rows.length > 500) throw new Error('Import at most 500 records per batch.');
  if (rows.some(value => value.length !== headers.length)) throw new Error('Every CSV row must have the same number of columns as the header.');
  return { headers, rows };
}

export function previewImport(input: ImportInput): ImportPreview {
  if (!input || !Object.prototype.hasOwnProperty.call(IMPORT_FIELDS, input.entity)) throw new Error('Choose customers or items.');
  if (!Array.isArray(input.headers) || !input.headers.length || input.headers.length > 50 || input.headers.some(h => typeof h !== 'string' || !h.trim() || h.length > 200)) throw new Error('Invalid headers.');
  if (new Set(input.headers.map(h => h.trim().toLowerCase())).size !== input.headers.length) throw new Error('Column headers must be unique.');
  if (!Array.isArray(input.rows) || !input.rows.length || input.rows.length > 500) throw new Error('Import 1–500 records per batch.');
  if (!input.mapping || typeof input.mapping !== 'object' || Array.isArray(input.mapping)) throw new Error('Supply an explicit column mapping.');
  const fields: readonly string[] = IMPORT_FIELDS[input.entity];
  const used = Object.values(input.mapping);
  if (Object.keys(input.mapping).some(key => !fields.includes(key)) || used.some(index => !Number.isInteger(index) || index < 0 || index >= input.headers.length) || new Set(used).size !== used.length) throw new Error('Map each source column to at most one supported field.');
  const required = input.entity === 'items' ? ['sku', 'name', 'type', 'uom'] : ['name'];
  if (required.some(field => !Object.prototype.hasOwnProperty.call(input.mapping, field))) throw new Error(`Map required fields: ${required.join(', ')}.`);
  const issues: ImportIssue[] = [], records: ImportPreview['records'] = [];
  const identities = new Set<string>();
  input.rows.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== input.headers.length || row.some(cell => typeof cell !== 'string' || cell.length > 2000)) throw new Error(`Invalid cells in row ${index + 2}.`);
    const record: Record<string, string | number> = {};
    const issue = (field: string, message: string) => issues.push({ row: index + 2, field, message });
    for (const field of fields) if (Object.prototype.hasOwnProperty.call(input.mapping, field)) record[field] = row[input.mapping[field]!]!.trim();
    for (const field of required) if (!record[field]) issue(field, 'Required value is empty.');
    for (const field of ['name', 'sku', 'type', 'uom', 'hsnSac', 'state']) if (String(record[field] ?? '').length > 200) issue(field, 'Use at most 200 characters.');
    if (input.entity === 'items') {
      record.sku = String(record.sku ?? '').toUpperCase();
      record.type = String(record.type ?? '').toUpperCase();
      if (!ITEM_TYPES.includes(String(record.type))) issue('type', `Use ${ITEM_TYPES.join(', ')}.`);
      for (const field of ['gstRate', 'salePrice']) {
        const value = record[field] === undefined || record[field] === '' ? '0' : String(record[field]);
        if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) > (field === 'gstRate' ? 100 : 1_000_000_000)) issue(field, 'Enter a valid non-negative decimal; GST must not exceed 100.');
        record[field] = Number(value);
      }
    } else {
      if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(record.email))) issue('email', 'Invalid email.');
      if (record.gstin) {
        record.gstin = String(record.gstin).toUpperCase();
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(record.gstin))) issue('gstin', 'Invalid GSTIN format.');
      }
    }
    const identity = String(input.entity === 'items' ? record.sku : record.name).toLowerCase();
    if (identities.has(identity)) issue(input.entity === 'items' ? 'sku' : 'name', 'Duplicate identity within this batch.');
    identities.add(identity);
    records.push(record);
  });
  return { records, issues, ignoredHeaders: input.headers.filter((_, index) => !used.includes(index)) };
}
