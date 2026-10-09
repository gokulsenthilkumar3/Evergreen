import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadWorkflowDocument(document: any) {
  const meta = JSON.parse(document.metadata || '{}'), pdf = new jsPDF();
  const amount = (n: any) => `INR ${Number(n || 0).toFixed(2)}`;
  pdf.setFontSize(18); pdf.text(document.kind === 'SALES_RETURN' ? 'CREDIT NOTE' : document.kind.replaceAll('_', ' '), 14, 18);
  pdf.setFontSize(10);
  pdf.text(pdf.splitTextToSize([meta.sellerName || '', meta.sellerAddress || '', meta.sellerGSTIN ? `GSTIN: ${meta.sellerGSTIN}` : '', document.documentNo, `Date: ${new Date(document.date).toLocaleDateString('en-IN')}`, meta.invoiceNo ? `Against invoice: ${meta.invoiceNo}` : '', meta.customerName || document.supplier?.name || '', meta.customerAddress || '', meta.customerGSTIN ? `GSTIN: ${meta.customerGSTIN}` : ''].filter(Boolean).join('\n'), 180), 14, 27);
  autoTable(pdf, { startY: 88, head: [['Item / HSN', 'Quantity', 'Rate', 'GST %', 'Net', 'Tax']], body: document.lines.map((l: any) => [`${l.item?.name || ''} / ${l.item?.hsnSac || ''}`, `${l.quantity} ${l.item?.uom || ''}`, amount(l.rate), `${l.gstRate}%`, amount(l.net), amount(l.tax)]), styles: { fontSize: 8 }, headStyles: { fillColor: [28, 83, 57] } });
  let y = (pdf as any).lastAutoTable.finalY + 10;
  const summary = [`Net: ${amount(document.subtotal)}`, `Tax: ${amount(document.tax)}`, ...(document.kind === 'SALES_RETURN' ? [`CGST: ${amount(meta.cgst)}  SGST: ${amount(meta.sgst)}  IGST: ${amount(meta.igst)}`] : []), `Total: ${amount(document.total)}`, `Reason: ${document.notes || '—'}`, `Posted by: ${document.createdBy}`];
  for (const text of summary) { if (y > 270) { pdf.addPage(); y = 18; } const wrapped = pdf.splitTextToSize(text, 180); pdf.text(wrapped, 14, y); y += wrapped.length * 5 + 3; }
  pdf.save(`${document.documentNo.replace(/[^\w.-]/g, '_')}.pdf`);
}
