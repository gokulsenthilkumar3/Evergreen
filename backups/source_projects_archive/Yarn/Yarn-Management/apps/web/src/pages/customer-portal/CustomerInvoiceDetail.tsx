import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
    Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PaymentIcon from '@mui/icons-material/Payment';
import { apiClient } from '../../lib/api';

export default function CustomerInvoiceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState<any>(null);

    useEffect(() => {
        if (id) fetchInvoice();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/customer-portal/invoices/${id}`);
            setInvoice(res.data.invoice);
        } catch (error) {
            console.error('Failed to fetch invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID':
                return 'success';
            case 'SENT':
                return 'info';
            case 'OVERDUE':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!invoice) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Invoice not found</Typography>
            </Box>
        );
    }

    const totalPaid =
        invoice.payments?.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0) || 0;
    const balance = Number(invoice.totalAmount) - totalPaid;

    return (
        <Box sx={{ p: 3 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/customer-portal/invoices')}
                sx={{ mb: 2 }}
            >
                Back to Invoices
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">{invoice.invoiceNumber}</Typography>
                <Chip label={invoice.status} color={getStatusColor(invoice.status)} />
            </Box>

            {invoice.status === 'OVERDUE' && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    This invoice is overdue. Please make payment as soon as possible.
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Invoice Items */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Invoice Items
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoice.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{item.description}</Typography>
                                        </TableCell>
                                        <TableCell align="right">{Number(item.quantity).toFixed(2)}</TableCell>
                                        <TableCell align="right">₹{Number(item.unitPrice).toLocaleString()}</TableCell>
                                        <TableCell align="right">₹{Number(item.totalPrice).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 300, mb: 1 }}>
                                <Typography>Subtotal:</Typography>
                                <Typography>
                                    ₹{Number(invoice.totalAmount - invoice.taxAmount).toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 300, mb: 1 }}>
                                <Typography>Tax:</Typography>
                                <Typography>₹{Number(invoice.taxAmount).toLocaleString()}</Typography>
                            </Box>
                            <Divider sx={{ width: 300, my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">₹{Number(invoice.totalAmount).toLocaleString()}</Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Payment History */}
                    {invoice.payments && invoice.payments.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Payment History
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Payment Method</TableCell>
                                        <TableCell>Reference</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoice.payments.map((payment: any) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{payment.paymentMethod || '-'}</TableCell>
                                            <TableCell>{payment.referenceNumber || '-'}</TableCell>
                                            <TableCell align="right">₹{Number(payment.amount).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    {/* Invoice Summary */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Invoice Details
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">
                            Invoice Date
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {new Date(invoice.date).toLocaleDateString()}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">
                            Due Status
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {invoice.status === 'PAID' ? 'Paid' : `Balance: ₹${balance.toLocaleString()}`}
                        </Typography>

                        {invoice.paidAt && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Paid On
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {new Date(invoice.paidAt).toLocaleDateString()}
                                </Typography>
                            </>
                        )}
                    </Paper>

                    {/* Action Buttons */}
                    <Paper sx={{ p: 2 }}>
                        {invoice.status !== 'PAID' && invoice.paymentLink && (
                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={<PaymentIcon />}
                                color="primary"
                                sx={{ mb: 1 }}
                                onClick={() => window.open(invoice.paymentLink, '_blank')}
                            >
                                Pay Now
                            </Button>
                        )}
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            disabled
                        >
                            Download PDF
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
