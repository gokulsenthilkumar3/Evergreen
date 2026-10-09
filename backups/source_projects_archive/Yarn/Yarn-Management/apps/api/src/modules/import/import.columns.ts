export type ImportKind = 'suppliers' | 'raw-materials';
export type ImportColumn = { name: string; required: boolean };

// This registry drives blank templates, the UI column guide, and parser checks.
export const IMPORT_COLUMNS: Record<ImportKind, ImportColumn[]> = {
  suppliers: [
    { name: 'Name', required: true },
    { name: 'Email', required: false },
    { name: 'Phone', required: false },
    { name: 'Address', required: false },
    { name: 'GSTIN', required: false },
    { name: 'Payment Terms', required: false },
    { name: 'Rating', required: false },
    { name: 'Notes', required: false },
    { name: 'Status', required: false },
    { name: 'Business Type', required: false },
    { name: 'Supplier Code', required: false },
    { name: 'Supplier Type', required: false },
  ],
  'raw-materials': [
    { name: 'Batch No', required: true },
    { name: 'Supplier Name', required: true },
    { name: 'Type', required: true },
    { name: 'Quantity', required: true },
    { name: 'Unit', required: false },
    { name: 'Quality Score', required: true },
    { name: 'Received Date', required: true },
    { name: 'Cost', required: true },
    { name: 'Moisture', required: false },
    { name: 'Location', required: false },
    { name: 'Status', required: false },
    { name: 'Notes', required: false },
  ],
};

export function blankTemplate(kind: ImportKind) {
  return `${IMPORT_COLUMNS[kind].map((column) => column.name).join(',')}\r\n`;
}
