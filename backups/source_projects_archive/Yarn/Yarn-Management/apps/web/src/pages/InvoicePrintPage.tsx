import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Divider, Button, Grid } from '@mui/material';
import { http } from '../lib/http';
import PrintIcon from '@mui/icons-material/Print';

export default function InvoicePrintPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await http.get('/billing/invoices');
                // In a real app we would get by ID, but we have filtered list in mock
                const found = res.data.invoices.find((i: any) => i.id === id);
                setInvoice(found);

                // Auto print removed based on user feedback
                // if (found) {
                //    setTimeout(() => window.print(), 500);
                // }
            } catch (e) {
                console.error(e);
            }
        }
        load();
    }, [id]);

    if (!invoice) return <Box p={4}>Loading invoice...</Box>;

    const isModern = invoice.templateName === 'MODERN';
    const isCompact = invoice.templateName === 'COMPACT';

    return (
        <Box sx={{
            p: isCompact ? 2 : 4,
            maxWidth: '800px',
            mx: 'auto',
            bgcolor: 'white',
            color: 'black',
            fontFamily: isModern ? '"Inter", "Roboto", sans-serif' : 'serif',
            fontSize: isCompact ? '0.85rem' : '1rem'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, '@media print': { display: 'none' } }}>
                <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
                    Print / Save as PDF
                </Button>
            </Box>

            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 4,
                p: isModern ? 3 : 0,
                bgcolor: isModern ? '#f8fafc' : 'transparent',
                borderLeft: isModern ? '6px solid #2563eb' : 'none'
            }}>
                <Box>
                    <Typography variant={isCompact ? "h6" : "h4"} fontWeight="bold" sx={{ color: isModern ? '#2563eb' : 'black' }}>
                        INVOICE
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>#{invoice.invoiceNumber}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant={isCompact ? "body1" : "h6"} fontWeight="bold">Yarn Master Ltd.</Typography>
                    <Typography variant="body2">123 Textile Avenue</Typography>
                    <Typography variant="body2">Coimbatore, TN, 641001</Typography>
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Middle Section */}
            <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>Bill To</Typography>
                    <Typography variant={isCompact ? "body1" : "h6"} fontWeight="bold" sx={{ mt: 1 }}>{invoice.customerName}</Typography>
                    <Typography variant="body2">Authorized Customer</Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'inline-block', textAlign: 'left' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">DATE</Typography>
                            <Typography variant="body2">{new Date(invoice.date).toLocaleDateString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">STATUS</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ color: invoice.status === 'PAID' ? 'success.main' : 'warning.main' }}>
                                {invoice.status}
                            </Typography>
                        </Box>
                        {invoice.billingCycle && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">CYCLE</Typography>
                                <Typography variant="body2">{invoice.billingCycle}</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Items */}
            <Table size={isCompact ? "small" : "medium"} sx={{ mb: 4 }}>
                <TableHead sx={{ bgcolor: isModern ? '#f1f5f9' : 'transparent' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {invoice.items && invoice.items.map((item: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">₹{Number(item.unitPrice || item.price).toLocaleString()}</TableCell>
                            <TableCell align="right">₹{Number(item.totalPrice || (item.quantity * item.price)).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Totals & Notes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ maxWidth: '50%' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: 'block', mb: 1 }}>NOTES</Typography>
                    <Typography variant="body2">{invoice.notes || 'Thank you for your business. Please pay within 15 days.'}</Typography>
                </Box>
                <Box sx={{ width: '250px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">₹{(Number(invoice.totalAmount) - Number(invoice.taxAmount || 0)).toLocaleString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">GST (18%):</Typography>
                        <Typography variant="body2">₹{Number(invoice.taxAmount || 0).toLocaleString()}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="h6" fontWeight="bold">Total Amount:</Typography>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: isModern ? '#2563eb' : 'black' }}>
                            ₹{Number(invoice.totalAmount).toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 10, pt: 2, borderTop: '1px solid #e2e8f0', textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="caption">
                    This is a computer generated invoice. No signature required.
                    {isModern && ' | Printed using Modern Template'}
                    {isCompact && ' | Compact Mode'}
                </Typography>
            </Box>
        </Box>
    );
}
