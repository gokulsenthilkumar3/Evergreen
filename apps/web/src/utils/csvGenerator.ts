/** Quote text and neutralize spreadsheet formulas without changing numeric cells. */
export const csvCell = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  let text = value instanceof Date ? value.toISOString() : String(value);
  if (/^\s*[=+\-@]|^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

export const buildCSV = (headers: string[], rows: unknown[][]): string =>
  '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');

/**
 * Generate CSV content from data
 */
export const generateCSV = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  tableToCSV(headers, data.map(row => headers.map(header => row[header])), filename);
};

/** Download a table without collapsing duplicate column names. */
export const tableToCSV = (headers: string[], rows: unknown[][], filename: string): void => {
  // Create blob and download
  const csvContent = buildCSV(headers, rows);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  URL.revokeObjectURL(url);
};

export default generateCSV;
