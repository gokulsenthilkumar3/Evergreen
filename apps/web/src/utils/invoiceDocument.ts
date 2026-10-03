import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type InvoiceDocumentData = {
  invoiceNo: string; date: string; dueDate?: string | null; currency?: string;
  sellerName?: string | null; sellerAddress?: string | null; sellerGSTIN?: string | null; sellerState?: string;
  customerName: string; customerAddress?: string | null; customerGSTIN?: string | null; buyerState?: string | null;
  subtotal: number; discount: number; cgst: number; sgst: number; igst: number; total: number; amountPaid: number;
  status: string; notes?: string | null; terms?: string | null; transportMode?: string | null; vehicleNo?: string | null;
  documentHash?: string | null; items: Array<{ description?: string | null; hsnSac?: string | null; quantity?: number | null; weight?: number; uom?: string | null; rate: number; discount: number; gstRate: number }>;
};

export function downloadInvoicePdf(invoice: InvoiceDocumentData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency || 'INR', maximumFractionDigits: 2 });
  const date = (value?: string | null) => value ? new Date(value).toLocaleDateString('en-IN') : '—';
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(28, 83, 57); doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(19);
  doc.text(invoice.sellerName || 'Company details unavailable', 14, 15, { maxWidth: pageWidth - 28 });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text([invoice.sellerAddress || '', invoice.sellerGSTIN ? `GSTIN: ${invoice.sellerGSTIN}` : '', invoice.sellerState || ''].filter(Boolean).join('  ·  '), 14, 25, { maxWidth: pageWidth - 28 });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text('TAX INVOICE', pageWidth - 14, 34, { align: 'right' });

  doc.setTextColor(35); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text(`Invoice: ${invoice.invoiceNo}`, 14, 49); doc.text(`Status: ${invoice.status}`, pageWidth - 14, 49, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice date: ${date(invoice.date)}     Due date: ${date(invoice.dueDate)}`, 14, 56);
  doc.setFont('helvetica', 'bold'); doc.text('Bill to', 14, 68); doc.setFont('helvetica', 'normal');
  const customerLines = [invoice.customerName, invoice.customerAddress || '', invoice.customerGSTIN ? `GSTIN: ${invoice.customerGSTIN}` : '', invoice.buyerState || ''].filter(Boolean);
  doc.text(customerLines, 14, 74, { maxWidth: 105 });
  if (invoice.transportMode || invoice.vehicleNo) doc.text([invoice.transportMode, invoice.vehicleNo].filter(Boolean).join(' · '), pageWidth - 14, 74, { align: 'right' });

  autoTable(doc, {
    startY: 96, head: [['Description', 'HSN/SAC', 'Qty', 'Rate', 'Discount', 'GST %', 'Amount']],
    body: invoice.items.map((item) => {
      const qty = Number(item.quantity ?? item.weight ?? 0);
      const taxable = Math.max(0, qty * Number(item.rate) - Number(item.discount || 0));
      return [item.description || 'Item', item.hsnSac || '—', `${qty} ${item.uom || ''}`.trim(), currency.format(item.rate), currency.format(item.discount || 0), `${item.gstRate}%`, currency.format(taxable + taxable * item.gstRate / 100)];
    }),
    theme: 'grid', headStyles: { fillColor: [28, 83, 57] }, styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 19 }, 2: { cellWidth: 20 }, 3: { cellWidth: 24 }, 4: { cellWidth: 22 }, 5: { cellWidth: 15 }, 6: { cellWidth: 30, halign: 'right' } },
  });
  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 100;
  const summaryY = finalY + 10;
  const rows: Array<[string, string]> = [['Taxable subtotal', currency.format(invoice.subtotal)]];
  if (invoice.discount) rows.push(['Discount', `−${currency.format(invoice.discount)}`]);
  if (invoice.cgst) rows.push(['CGST', currency.format(invoice.cgst)]);
  if (invoice.sgst) rows.push(['SGST', currency.format(invoice.sgst)]);
  if (invoice.igst) rows.push(['IGST', currency.format(invoice.igst)]);
  rows.push(['Invoice total', currency.format(invoice.total)], ['Amount paid', currency.format(invoice.amountPaid)], ['Balance due', currency.format(Math.max(0, invoice.total - invoice.amountPaid))]);
  autoTable(doc, { startY: summaryY, body: rows, theme: 'plain', tableWidth: 85, margin: { left: pageWidth - 99 }, styles: { fontSize: 9, cellPadding: 2 }, columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }, didParseCell(data) { if (data.row.index === rows.length - 3) data.cell.styles.fontStyle = 'bold'; } });
  const footerY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || summaryY;
  if (invoice.notes || invoice.terms) {
    const y = footerY + 8; doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.text('Notes and terms', 14, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text([invoice.notes, invoice.terms].filter(Boolean).join('\n'), 14, y + 5, { maxWidth: pageWidth - 28 });
  }
  if (invoice.documentHash) {
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) { doc.setPage(page); doc.setFontSize(7); doc.setTextColor(100); doc.text(`Verification fingerprint: ${invoice.documentHash}`, 14, doc.internal.pageSize.getHeight() - 8, { maxWidth: pageWidth - 28 }); }
  }
  doc.save(`${invoice.invoiceNo.replace(/[^a-z0-9-_]/gi, '_')}.pdf`);
}
