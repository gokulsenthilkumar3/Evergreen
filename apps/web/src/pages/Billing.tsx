import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    MenuItem,
    Alert,
    Snackbar,
    Divider,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Print as PrintIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface InvoiceItem {
    id: number;
    yarnCount: string;
    bags: string;
    weight: string;
    rate: string;
}

const Billing: React.FC = () => {
    const [invoiceData, setInvoiceData] = useState({
        invoiceNo: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        customerAddress: '',
        customerGSTIN: '',
        transportMode: 'Road',
        vehicleNo: '',
    });

    const [items, setItems] = useState<InvoiceItem[]>([
        { id: 1, yarnCount: '4', bags: '', weight: '', rate: '' },
    ]);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const { data: recentInvoices, refetch: refetchInvoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const response = await api.get('/billing/invoices');
            return response.data;
        },
    });

    const handleItemChange = (id: number, field: keyof InvoiceItem, value: string) => {
        setItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
    };

    const addItem = () => {
        const nextId = Math.max(...items.map(i => i.id), 0) + 1;
        setItems([...items, { id: nextId, yarnCount: '4', bags: '', weight: '', rate: '' }]);
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => {
            const weight = parseFloat(item.weight) || 0;
            const rate = parseFloat(item.rate) || 0;
            return sum + weight * rate;
        }, 0);

        const cgst = subtotal * 0.09; // 9% CGST
        const sgst = subtotal * 0.09; // 9% SGST
        const total = subtotal + cgst + sgst;

        return { subtotal, cgst, sgst, total };
    };

    const handleSaveInvoice = async () => {
        try {
            if (!invoiceData.invoiceNo || !invoiceData.customerName) {
                setNotification({ open: true, message: 'Please fill required fields', severity: 'error' });
                return;
            }

            const { subtotal, cgst, sgst, total } = calculateTotals();
            const payload = {
                ...invoiceData,
                items,
                subtotal,
                cgst,
                sgst,
                total,
            };

            await api.post('/billing/invoice', payload);
            setNotification({ open: true, message: 'Invoice saved successfully!', severity: 'success' });
            refetchInvoices();

            // Reset form
            setInvoiceData({
                invoiceNo: '',
                date: new Date().toISOString().split('T')[0],
                customerName: '',
                customerAddress: '',
                customerGSTIN: '',
                transportMode: 'Road',
                vehicleNo: '',
            });
            setItems([{ id: 1, yarnCount: '4', bags: '', weight: '', rate: '' }]);
        } catch (error) {
            setNotification({ open: true, message: 'Failed to save invoice', severity: 'error' });
        }
    };

    const { subtotal, cgst, sgst, total } = calculateTotals();

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Billing & Invoicing
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<PrintIcon />}>
                        Print Invoice
                    </Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveInvoice}>
                        Save Invoice
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Invoice Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                        label="Invoice No"
                        value={invoiceData.invoiceNo}
                        onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNo: e.target.value })}
                        required
                    />
                    <TextField
                        label="Date"
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Customer Name"
                        value={invoiceData.customerName}
                        onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                        required
                    />
                    <TextField
                        label="Customer GSTIN"
                        value={invoiceData.customerGSTIN}
                        onChange={(e) => setInvoiceData({ ...invoiceData, customerGSTIN: e.target.value })}
                    />
                    <TextField
                        label="Customer Address"
                        value={invoiceData.customerAddress}
                        onChange={(e) => setInvoiceData({ ...invoiceData, customerAddress: e.target.value })}
                        multiline
                        rows={2}
                        sx={{ gridColumn: { md: 'span 2' } }}
                    />
                    <TextField
                        select
                        label="Transport Mode"
                        value={invoiceData.transportMode}
                        onChange={(e) => setInvoiceData({ ...invoiceData, transportMode: e.target.value })}
                    >
                        <MenuItem value="Road">Road</MenuItem>
                        <MenuItem value="Rail">Rail</MenuItem>
                        <MenuItem value="Air">Air</MenuItem>
                    </TextField>
                    <TextField
                        label="Vehicle No"
                        value={invoiceData.vehicleNo}
                        onChange={(e) => setInvoiceData({ ...invoiceData, vehicleNo: e.target.value })}
                    />
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Items</Typography>
                    <Button size="small" startIcon={<AddIcon />} onClick={addItem}>
                        Add Item
                    </Button>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Yarn Count</TableCell>
                                <TableCell>Bags</TableCell>
                                <TableCell>Weight (kg)</TableCell>
                                <TableCell>Rate (₹/kg)</TableCell>
                                <TableCell align="right">Amount (₹)</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => {
                                const amount = (parseFloat(item.weight) || 0) * (parseFloat(item.rate) || 0);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <TextField
                                                select
                                                size="small"
                                                value={item.yarnCount}
                                                onChange={(e) => handleItemChange(item.id, 'yarnCount', e.target.value)}
                                                sx={{ minWidth: 100 }}
                                            >
                                                <MenuItem value="2">2</MenuItem>
                                                <MenuItem value="4">4</MenuItem>
                                                <MenuItem value="6">6</MenuItem>
                                                <MenuItem value="8">8</MenuItem>
                                                <MenuItem value="10">10</MenuItem>
                                            </TextField>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={item.bags}
                                                onChange={(e) => handleItemChange(item.id, 'bags', e.target.value)}
                                                sx={{ width: 80 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={item.weight}
                                                onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                                                sx={{ width: 100 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                sx={{ width: 100 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ maxWidth: 400, ml: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Subtotal:</Typography>
                        <Typography fontWeight="bold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>CGST (9%):</Typography>
                        <Typography>₹{cgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>SGST (9%):</Typography>
                        <Typography>₹{sgst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6">Total:</Typography>
                        <Typography variant="h6" color="primary">
                            ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Invoices
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Invoice No</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell align="right">Amount (₹)</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {recentInvoices?.slice().reverse().slice(0, 10).map((invoice: any) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{invoice.invoiceNo}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.customerName}</TableCell>
                                    <TableCell align="right">₹{invoice.total?.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ color: 'success.main' }}>
                                            Saved
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!recentInvoices?.length && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No invoices yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Billing;
