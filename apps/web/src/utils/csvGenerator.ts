import React from 'react';

/**
 * Generate CSV content from data
 */
export const generateCSV = (data: any[], filename: string): void => {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows: string[] = [];
  
  // Add BOM for Excel UTF-8 support
  csvRows.push('\uFEFF');
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if contains comma
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      }
      if (typeof value === 'number') return value.toString();
      if (value instanceof Date) return value.toISOString();
      return String(value);
    });
    csvRows.push(values.join(','));
  }
  
  // Create blob and download
  const csvContent = csvRows.join('\n');
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

/**
 * Convert table data to CSV format
 */
export const tableToCSV = (
  headers: string[], 
  rows: any[][], 
  filename: string
): void => {
  const data = rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  generateCSV(data, filename);
};

export default generateCSV;
