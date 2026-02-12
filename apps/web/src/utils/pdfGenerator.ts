import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a PDF table
 * @param title Title of the PDF document
 * @param headers Array of column headers
 * @param data Array of row data (matched to headers)
 * @param filename Name of the file to download (without extension)
 * @param orientation 'p' or 'l' (portrait or landscape, default 'p')
 */
export const generatePDF = (
    title: string,
    headers: string[],
    data: (string | number)[][],
    filename: string,
    orientation: 'p' | 'l' = 'p'
) => {
    const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
    });

    // Add Title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(title, 14, 20);

    // Add Timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

    // Add Table
    autoTable(doc, {
        startY: 35,
        head: [headers],
        body: data,
        theme: 'striped',
        headStyles: {
            fillColor: [46, 125, 50], // Primary Green #2e7d32
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 10,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
    });

    // Save
    doc.save(`${filename}.pdf`);
};
