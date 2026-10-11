import * as XLSX from 'xlsx';

/** Download a workbook, preserving numeric cells and literal user text. */
export const generateExcel = (
    data: Record<string, unknown>[],
    filename: string,
    sheetName: string = 'Sheet1'
) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
