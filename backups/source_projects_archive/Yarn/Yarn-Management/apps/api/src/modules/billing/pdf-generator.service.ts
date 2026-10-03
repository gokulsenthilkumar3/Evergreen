import { prisma } from '../../prisma/client';
import puppeteer from 'puppeteer';

// PDF Generation Service with multiple invoice templates

export async function generateInvoicePDF(invoiceId: string, templateName: string = 'STANDARD'): Promise<Buffer> {
  let browser;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        customer: true,
        template: true,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Select template renderer based on templateName
    let htmlContent: string;
    switch (templateName.toUpperCase()) {
      case 'MODERN':
        htmlContent = renderModernTemplate(invoice);
        break;
      case 'COMPACT':
        htmlContent = renderCompactTemplate(invoice);
        break;
      case 'PROFESSIONAL':
        htmlContent = renderProfessionalTemplate(invoice);
        break;
      case 'STANDARD':
      default:
        htmlContent = renderStandardTemplate(invoice);
        break;
    }

    // Generate PDF from HTML (using puppeteer)
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-software-rasterizer',
      ]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load', timeout: 10000 });
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
    });

    // Record history
    await recordInvoiceHistory(invoiceId, 'DOWNLOADED', 'Invoice PDF downloaded');

    return Buffer.from(pdfData);
  } catch (error: any) {
    console.error('PDF Generation Error:', error.message);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

export async function generateReceiptPDF(paymentId: string): Promise<Buffer> {
  const payment = await prisma.invoicePayment.findUnique({
    where: { id: paymentId },
    include: {
      invoice: {
        include: {
          items: true,
          customer: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const htmlContent = renderReceiptTemplate(payment);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote', '--single-process']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    return Buffer.from(pdfData);
  } finally {
    await browser.close();
  }
}

export async function generatePartialPaymentReceipt(paymentId: string): Promise<Buffer> {
  const payment = await prisma.invoicePayment.findUnique({
    where: { id: paymentId },
    include: {
      invoice: {
        include: {
          items: true,
          invoicePayments: {
            orderBy: { paymentDate: 'asc' },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  const htmlContent = renderPartialPaymentReceipt(payment);
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--no-first-run', '--no-zygote', '--single-process']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'load' });
    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
    });
    return Buffer.from(pdfData);
  } finally {
    await browser.close();
  }
}

/****************************
 * INVOICE TEMPLATE RENDERERS
 ****************************/

function renderStandardTemplate(invoice: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #1976d2; padding-bottom: 20px; }
        .company { font-size: 24px; font-weight: bold; color: #1976d2; }
        .invoice-title { font-size: 32px; font-weight: bold; color: #666; }
        .invoice-meta { margin-bottom: 30px; }
        .invoice-meta table { width: 100%; }
        .invoice-meta td { padding: 5px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .items-table th { background: #1976d2; color: white; padding: 12px; text-align: left; }
        .items-table td { padding: 12px; border-bottom: 1px solid #ddd; }
        .totals { text-align: right; margin-top: 20px; }
        .totals table { margin-left: auto; width: 300px; }
        .totals td { padding: 8px; }
        .total-row { font-size: 18px; font-weight: bold; background: #f5f5f5; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-PAID { background: #4caf50; color: white; }
        .status-PENDING { background: #ff9800; color: white; }
        .status-OVERDUE { background: #f44336; color: white; }
        .status-PARTIALLY_PAID { background: #2196f3; color: white; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="company">Yarn Management System</div>
          <div>123 Business Street<br>City, State 12345<br>Phone: (555) 123-4567</div>
        </div>
        <div style="text-align: right;">
          <div class="invoice-title">INVOICE</div>
          <div style="margin-top: 10px;">
            <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
            <strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}<br>
            <span class="status-badge status-${invoice.status}">${invoice.status}</span>
          </div>
        </div>
      </div>

      <div class="invoice-meta">
        <table>
          <tr>
            <td><strong>Bill To:</strong></td>
            <td style="text-align: right;"><strong>Payment Info:</strong></td>
          </tr>
          <tr>
            <td>${invoice.customerName}<br>${invoice.customer?.email || ''}</td>
            <td style="text-align: right;">
              <strong>Total:</strong> ₹${Number(invoice.totalAmount).toLocaleString()}<br>
              ${Number(invoice.paidAmount || 0) > 0 ? `<strong>Paid:</strong> ₹${Number(invoice.paidAmount).toLocaleString()}<br>` : ''}
              ${Number(invoice.balance || 0) > 0 ? `<strong>Balance:</strong> ₹${Number(invoice.balance).toLocaleString()}<br>` : ''}
            </td>
          </tr>
        </table>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th style="text-align: right;">QUANTITY</th>
            <th style="text-align: right;">UNIT PRICE</th>
            <th style="text-align: right;">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any) => `
            <tr>
              <td>${item.description}</td>
              <td style="text-align: right;">${Number(item.quantity).toFixed(2)}</td>
              <td style="text-align: right;">₹${Number(item.unitPrice).toLocaleString()}</td>
              <td style="text-align: right;">₹${Number(item.totalPrice).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">₹${(Number(invoice.totalAmount) - Number(invoice.taxAmount || 0)).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Tax (18%):</td>
            <td style="text-align: right;">₹${Number(invoice.taxAmount || 0).toLocaleString()}</td>
          </tr>
          <tr class="total-row">
            <td>TOTAL:</td>
            <td style="text-align: right;">₹${Number(invoice.totalAmount).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      ${invoice.notes ? `<div style="margin-top: 30px;"><strong>Notes:</strong><br>${invoice.notes}</div>` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>For questions about this invoice, please contact us.</p>
      </div>
    </body>
    </html>
  `;
}

function renderModernTemplate(invoice: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', sans-serif; padding: 60px; background: #fafafa; color: #333; }
        .container { background: white; padding: 60px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .header { margin-bottom: 60px; }
        .invoice-number { font-size: 14px; color: #999; letter-spacing: 2px; }
        .invoice-title { font-size: 48px; font-weight: 200; margin: 10px 0; }
        .party-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .party-box { flex: 1; }
        .party-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .items { margin: 40px 0; }
        .item-row { display: flex; padding: 20px 0; border-bottom: 1px solid #f0f0f0; }
        .item-desc { flex: 2; }
        .item-qty, .item-price, .item-total { flex: 1; text-align: right; color: #666; }
        .summary { text-align: right; margin-top: 40px; }
        .summary-row { padding: 10px 0; font-size: 14px; }
        .summary-total { font-size: 24px; font-weight: bold; padding-top: 20px; border-top: 2px solid #000; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="invoice-number">${invoice.invoiceNumber}</div>
          <div class="invoice-title">Invoice</div>
          <div style="color: #666;">${new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>

        <div class="party-info">
          <div class="party-box">
            <div class="party-label">From</div>
            <strong>Yarn Management System</strong><br>
            123 Business Street<br>
            City, State 12345
          </div>
          <div class="party-box">
            <div class="party-label">To</div>
            <strong>${invoice.customerName}</strong><br>
            ${invoice.customer?.email || ''}
          </div>
        </div>

        <div class="items">
          <div class="item-row" style="border-bottom: 2px solid #000; font-weight: bold;">
            <div class="item-desc">DESCRIPTION</div>
            <div class="item-qty">QTY</div>
            <div class="item-price">PRICE</div>
            <div class="item-total">AMOUNT</div>
          </div>
          ${invoice.items.map((item: any) => `
            <div class="item-row">
              <div class="item-desc">${item.description}</div>
              <div class="item-qty">${Number(item.quantity).toFixed(0)}</div>
              <div class="item-price">₹${Number(item.unitPrice).toLocaleString()}</div>
              <div class="item-total">₹${Number(item.totalPrice).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>

        <div class="summary">
          <div class="summary-row">
            <span style="margin-right: 40px;">Subtotal</span>
            <span>₹${(Number(invoice.totalAmount) - Number(invoice.taxAmount || 0)).toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span style="margin-right: 40px;">Tax</span>
            <span>₹${Number(invoice.taxAmount || 0).toLocaleString()}</span>
          </div>
          <div class="summary-total">
            <span style="margin-right: 40px;">Total</span>
            <span>₹${Number(invoice.totalAmount).toLocaleString()}</span>
          </div>
          ${Number(invoice.paidAmount || 0) > 0 ? `
            <div class="summary-row" style="color: #4caf50; font-weight: bold; margin-top: 10px;">
              <span style="margin-right: 40px;">Paid</span>
              <span>₹${Number(invoice.paidAmount).toLocaleString()}</span>
            </div>
          ` : ''}
          ${Number(invoice.balance || 0) > 0 ? `
            <div class="summary-row" style="color: #f44336; font-weight: bold;">
              <span style="margin-right: 40px;">Balance Due</span>
              <span>₹${Number(invoice.balance).toLocaleString()}</span>
            </div>
          ` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
}

function renderCompactTemplate(invoice: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; padding: 20px; font-size: 12px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #000; padding-bottom: 10px; }
        .company { font-size: 16px; font-weight: bold; }
        table { width: 100%; margin: 10px 0; }
        table td { padding: 3px 0; }
        .items td { border-bottom: 1px dashed #ccc; padding: 5px 0; }
        .total { font-weight: bold; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 2px dashed #000; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">YARN MANAGEMENT SYSTEM</div>
        <div>Ph: (555) 123-4567</div>
      </div>
      
      <table>
        <tr><td>Invoice #:</td><td style="text-align: right;"><strong>${invoice.invoiceNumber}</strong></td></tr>
        <tr><td>Date:</td><td style="text-align: right;">${new Date(invoice.date).toLocaleDateString()}</td></tr>
        <tr><td>Customer:</td><td style="text-align: right;">${invoice.customerName}</td></tr>
      </table>

      <table class="items">
        ${invoice.items.map((item: any) => `
          <tr>
            <td>${item.description}</td>
            <td style="text-align: right;">${Number(item.quantity).toFixed(0)} x ₹${Number(item.unitPrice).toFixed(2)}</td>
            <td style="text-align: right; min-width: 80px;">₹${Number(item.totalPrice).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>

      <div class="total">
        <table>
          <tr><td>TOTAL:</td><td style="text-align: right;">₹${Number(invoice.totalAmount).toFixed(2)}</td></tr>
          ${Number(invoice.paidAmount || 0) > 0 ? `<tr><td>PAID:</td><td style="text-align: right;">₹${Number(invoice.paidAmount).toFixed(2)}</td></tr>` : ''}
          ${Number(invoice.balance || 0) > 0 ? `<tr><td>BALANCE:</td><td style="text-align: right;">₹${Number(invoice.balance).toFixed(2)}</td></tr>` : ''}
        </table>
      </div>

      <div class="footer">
        Thank you for your business!
      </div>
    </body>
    </html>
  `;
}

function renderProfessionalTemplate(invoice: any): string {
  // Reuse standard template with different color
  return renderStandardTemplate(invoice).replace(/#1976d2/g, '#2c3e50');
}

function renderReceiptTemplate(payment: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .receipt-title { font-size: 28px; font-weight: bold; color: #4caf50; }
        .receipt-number { font-size: 14px; color: #666; margin-top: 5px; }
        .info-box { background: #f5f5f5; padding: 20px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .amount-paid { font-size: 32px; font-weight: bold; color: #4caf50; text-align: center; margin: 30px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="receipt-title">PAYMENT RECEIPT</div>
        <div class="receipt-number">Receipt #: ${payment.receiptNumber}</div>
      </div>

      <div class="info-box">
        <div class="info-row">
          <strong>Payment Date:</strong>
          <span>${new Date(payment.paymentDate).toLocaleDateString()}</span>
        </div>
        <div class="info-row">
          <strong>Invoice Number:</strong>
          <span>${payment.invoice.invoiceNumber}</span>
        </div>
        <div class="info-row">
          <strong>Customer:</strong>
          <span>${payment.invoice.customerName}</span>
        </div>
        <div class="info-row">
          <strong>Payment Method:</strong>
          <span>${payment.paymentMethod}</span>
        </div>
        ${payment.reference ? `
          <div class="info-row">
            <strong>Reference:</strong>
            <span>${payment.reference}</span>
          </div>
        ` : ''}
      </div>

      <div class="amount-paid">
        ₹${Number(payment.amount).toLocaleString()}
      </div>

      <div style="text-align: center; margin-top: 40px; color: #666;">
        <p>Thank you for your payment!</p>
        ${Number(payment.invoice.balance || 0) > 0 ? `
          <p style="margin-top: 10px;">Remaining Balance: ₹${Number(payment.invoice.balance).toLocaleString()}</p>
        ` : '<p style="color: #4caf50; font-weight: bold;">Invoice Fully Paid</p>'}
      </div>
    </body>
    </html>
  `;
}

function renderPartialPaymentReceipt(payment: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2196f3; padding-bottom: 20px; }
        .receipt-title { font-size: 28px; font-weight: bold; color: #2196f3; }
        .payment-summary { background: #e3f2fd; padding: 20px; margin: 20px 0; border-left: 4px solid #2196f3; }
        .payment-history { margin-top: 30px; }
        .payment-history table { width: 100%; border-collapse: collapse; }
        .payment-history th { background: #2196f3; color: white; padding: 10px; text-align: left; }
        .payment-history td { padding: 10px; border-bottom: 1px solid #ddd; }
        .highlight { background: #fff9c4; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="receipt-title">PARTIAL PAYMENT RECEIPT</div>
        <div style="margin-top: 10px;">Receipt #: ${payment.receiptNumber}</div>
      </div>

      <div class="payment-summary">
        <h3>Current Payment</h3>
        <p><strong>Amount Paid:</strong> ₹${Number(payment.amount).toLocaleString()}</p>
        <p><strong>Payment Date:</strong> ${new Date(payment.paymentDate).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
        ${payment.reference ? `<p><strong>Reference:</strong> ${payment.reference}</p>` : ''}
      </div>

      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <p><strong>Invoice:</strong> ${payment.invoice.invoiceNumber}</p>
        <p><strong>Customer:</strong> ${payment.invoice.customerName}</p>
        <p><strong>Total Invoice Amount:</strong> ₹${Number(payment.invoice.totalAmount).toLocaleString()}</p>
        <p><strong>Total Paid:</strong> ₹${Number(payment.invoice.paidAmount || 0).toLocaleString()}</p>
        <p style="font-size: 18px; font-weight: bold; color: ${Number(payment.invoice.balance || 0) > 0 ? '#f44336' : '#4caf50'};">
          <strong>Remaining Balance:</strong> ₹${Number(payment.invoice.balance || 0).toLocaleString()}</p>
      </div>

      <div class="payment-history">
        <h3>Payment History</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Receipt #</th>
              <th>Method</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${payment.invoice.invoicePayments.map((p: any) => `
              <tr class="${p.id === payment.id ? 'highlight' : ''}">
                <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
                <td>${p.receiptNumber}${p.id === payment.id ? ' (Current)' : ''}</td>
                <td>${p.paymentMethod}</td>
                <td style="text-align: right;">₹${Number(p.amount).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
}

// Helper function to record invoice history
async function recordInvoiceHistory(invoiceId: string, action: string, description?: string, performedBy?: string) {
  await prisma.invoiceHistory.create({
    data: {
      invoiceId,
      action,
      description,
      performedBy,
    },
  });
}
