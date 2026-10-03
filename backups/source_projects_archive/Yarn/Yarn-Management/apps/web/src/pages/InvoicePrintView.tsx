import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../lib/http';
import { Box, CircularProgress, Button, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';

export default function InvoicePrintView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInvoice();
    }, [id]);

    useEffect(() => {
        console.log('Current invoice state:', invoice);
    }, [invoice]);

    const loadInvoice = async () => {
        try {
            console.log('Fetching invoice detail from:', `/billing/invoices/${id}`);
            const response = await http.get(`/billing/invoices/${id}`);
            setInvoice(response.data);
            if (response.data) {
                document.title = `Invoice - ${response.data.invoiceNumber}`;
            }
        } catch (error) {
            console.error('Failed to load invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'white', color: 'black' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading Invoice Details...</Typography>
                <Typography variant="caption">{id}</Typography>
            </Box>
        );
    }

    if (!invoice) {
        return (
            <Box sx={{ p: 4, bgcolor: 'white', color: 'black', height: '100vh' }}>
                <Typography variant="h6">Invoice Not Found</Typography>
                <Typography sx={{ mb: 2 }}>We couldn't load the invoice with ID: {id}</Typography>
                <Button variant="outlined" onClick={() => navigate('/billing')}>
                    Return to Billing
                </Button>
            </Box>
        );
    }

    return (
        <>
            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white !important; -webkit-print-color-adjust: exact; }
        }
        
        body { background: white !important; color: black !important; }

        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          font-family: Arial, sans-serif;
          background: white;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 3px solid #1976d2;
          padding-bottom: 20px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #1976d2;
        }
        
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #666;
          text-align: right;
        }
        
        .invoice-meta {
          margin-bottom: 30px;
        }
        
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        
        .items-table th {
          background: #1976d2;
          color: white;
          padding: 12px;
          text-align: left;
        }
        
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        
        .totals {
          text-align: right;
          margin-top: 20px;
        }
        
        .totals table {
          margin-left: auto;
          width: 300px;
        }
        
        .totals td {
          padding: 8px;
        }
        
        .total-row {
          font-size: 18px;
          font-weight: bold;
          background: #f5f5f5;
        }
        
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-PAID { background: #4caf50; color: white; }
        .status-PENDING { background: #ff9800; color: white; }
        .status-OVERDUE { background: #f44336; color: white; }
        .status-PARTIALLY_PAID { background: #2196f3; color: white; }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      `}</style>

            <Box className="no-print" sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>
                    Print / Save as PDF
                </Button>
                <Button variant="outlined" onClick={() => navigate('/billing')}>
                    Back to Billing
                </Button>
            </Box>

            <div className="invoice-container">
                <div className="invoice-header">
                    <div>
                        <div className="company-name">Yarn Management System</div>
                        <div>123 Business Street<br />City, State 12345<br />Phone: (555) 123-4567</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="invoice-title">INVOICE</div>
                        <div style={{ marginTop: '10px' }}>
                            <strong>Invoice #:</strong> {invoice.invoiceNumber}<br />
                            <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}<br />
                            <span className={`status-badge status-${invoice.status}`}>{invoice.status}</span>
                        </div>
                    </div>
                </div>

                <div className="invoice-meta">
                    <div className="info-row">
                        <div>
                            <strong>Bill To:</strong><br />
                            {invoice.customerName}<br />
                            {invoice.customer?.email || ''}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <strong>Payment Info:</strong><br />
                            <strong>Total:</strong> ₹{Number(invoice.totalAmount).toLocaleString()}<br />
                            {Number(invoice.paidAmount || 0) > 0 && (
                                <><strong>Paid:</strong> ₹{Number(invoice.paidAmount).toLocaleString()}<br /></>
                            )}
                            {Number(invoice.balance || 0) > 0 && (
                                <><strong>Balance:</strong> ₹{Number(invoice.balance).toLocaleString()}<br /></>
                            )}
                        </div>
                    </div>
                </div>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th>DESCRIPTION</th>
                            <th style={{ textAlign: 'right' }}>QUANTITY</th>
                            <th style={{ textAlign: 'right' }}>UNIT PRICE</th>
                            <th style={{ textAlign: 'right' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'right' }}>{Number(item.quantity).toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>₹{Number(item.unitPrice).toLocaleString()}</td>
                                <td style={{ textAlign: 'right' }}>₹{Number(item.totalPrice).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="totals">
                    <table>
                        <tbody>
                            <tr>
                                <td>Subtotal:</td>
                                <td style={{ textAlign: 'right' }}>
                                    ₹{(Number(invoice.totalAmount) - Number(invoice.taxAmount || 0)).toLocaleString()}
                                </td>
                            </tr>
                            <tr>
                                <td>Tax (18%):</td>
                                <td style={{ textAlign: 'right' }}>₹{Number(invoice.taxAmount || 0).toLocaleString()}</td>
                            </tr>
                            <tr className="total-row">
                                <td>TOTAL:</td>
                                <td style={{ textAlign: 'right' }}>₹{Number(invoice.totalAmount).toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {invoice.notes && (
                    <div style={{ marginTop: '30px' }}>
                        <strong>Notes:</strong><br />
                        {invoice.notes}
                    </div>
                )}

                <div className="footer">
                    <p>Thank you for your business!</p>
                    <p>For questions about this invoice, please contact us.</p>
                </div>
            </div>
        </>
    );
}
