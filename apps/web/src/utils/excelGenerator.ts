import * as XLSX from 'xlsx';

/**
 * Generates and downloads an Excel file
 * @param data Array of objects (key-value pairs)
 * @param filename Name of the file to download (without extension)
 * @param sheetName Name of the worksheet (default: 'Sheet1')
 */
export const generateExcel = (
    data: any[],
    filename: string,
    sheetName: string = 'Sheet1'
) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${filename}.xlsx`);
};
