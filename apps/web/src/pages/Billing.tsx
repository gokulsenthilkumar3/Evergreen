import React, { useState, useMemo, useRef } from 'react';
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
    Tooltip,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    InputAdornment,
    Chip,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Print as PrintIcon,
    Search as SearchIcon,
    ArrowBack as ArrowBackIcon,
    Receipt as ReceiptIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// @ts-ignore
import { useReactToPrint } from 'react-to-print';
import api from '../utils/api';

// --- Types ---
interface InvoiceItem {
    id: number;
    yarnCount: string;
    bags: string;
    weight: string;
    rate: string;
}

interface BillingProps {
    userRole?: string;
    username?: string;
}

// --- Invoice Editor Component ---
const InvoiceEditor = ({
    onCancel,
    onSave,
    initialData,
    settings,
    yarnStock
}: {
    onCancel: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
    settings?: any;
    yarnStock?: any;
}) => {
    const componentRef = useRef<HTMLDivElement>(null);

    // Form State
    const [invoiceData, setInvoiceData] = useState({
        invoiceNo: initialData?.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
        date: initialData?.date || new Date().toISOString().split('T')[0],
        customerName: initialData?.customerName || '',
        customerAddress: initialData?.customerAddress || '',
        customerGSTIN: initialData?.customerGSTIN || '',
        transportMode: initialData?.transportMode || 'Road',
        vehicleNo: initialData?.vehicleNo || '',
    });

    const [items, setItems] = useState<InvoiceItem[]>(initialData?.items || [
        { id: 1, yarnCount: '4', bags: '', weight: '', rate: '' },
    ]);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Invoice-${invoiceData.invoiceNo}`,
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

    // Calculations
    const totals = useMemo(() => {
        const subtotal = items.reduce((sum, item) => {
            const weight = parseFloat(item.weight) || 0;
            const rate = parseFloat(item.rate) || 0;
            return sum + weight * rate;
        }, 0);

        const cgst = subtotal * 0.09; // 9%
        const sgst = subtotal * 0.09; // 9%
        const total = subtotal + cgst + sgst;

        return { subtotal, cgst, sgst, total };
    }, [items]);

    const handleSave = () => {
        if (!invoiceData.customerName) return;
        onSave({
            ...invoiceData,
            items: items.map(i => ({ ...i, bags: Number(i.bags), weight: Number(i.weight), rate: Number(i.rate) })),
            ...totals
        });
    };

    return (
        <Box sx={{ maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'transparent' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ color: 'text.secondary' }}>
                    Back to List
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                        Print / PDF
                    </Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!invoiceData.customerName}>
                        Save Invoice
                    </Button>
                </Box>
            </Paper>

            {/* Editable Invoice Paper (A4-ish look) */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', pb: 5 }}>
                <Paper
                    ref={componentRef}
                    elevation={3}
                    sx={{
                        width: '210mm', // A4 width
                        minHeight: '297mm', // A4 height
                        p: '15mm',
                        bgcolor: 'background.paper',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        '@media print': {
                            boxShadow: 'none',
                            margin: 0,
                            padding: '10mm',
                        }
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '2px solid #eee', pb: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {settings?.logo && (
                                <img src={settings.logo} alt="Company Logo" style={{ height: 60, width: 'auto', marginBottom: 8, objectFit: 'contain', alignSelf: 'flex-start' }} />
                            )}
                            <Typography variant="h5" fontWeight="900" color="primary.main" sx={{ textTransform: 'uppercase' }}>
                                {settings?.companyName || 'EVER GREEN YARN MILLS'}
                            </Typography>
                            <Typography variant="body2" sx={{ maxWidth: 300, whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                                {settings?.address || 'Industrial Area,\nCoimbatore, Tamil Nadu'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                GSTIN: <b>{settings?.gstin || '33XXXXX1234X1Z5'}</b> | Phone: {settings?.phone}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h3" color="text.disabled" fontWeight={800} sx={{ letterSpacing: 2, mb: 1 }}>
                                INVOICE
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <TextField
                                    label="Invoice No" size="small" variant="standard"
                                    value={invoiceData.invoiceNo}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNo: e.target.value })}
                                    sx={{ width: 150, '& input': { textAlign: 'right', fontWeight: 'bold' } }}
                                />
                                <TextField
                                    type="date" size="small" variant="standard"
                                    value={invoiceData.date}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                                    sx={{ width: 150, '& input': { textAlign: 'right' } }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Customer Details */}
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">Bill To:</Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                <TextField
                                    placeholder="Customer Name" fullWidth variant="standard" sx={{ mb: 1, '& input': { fontWeight: 600 } }}
                                    value={invoiceData.customerName}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
                                />
                                <TextField
                                    placeholder="Address" fullWidth multiline rows={2} variant="standard" sx={{ mb: 1 }}
                                    value={invoiceData.customerAddress}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, customerAddress: e.target.value })}
                                />
                                <TextField
                                    placeholder="GSTIN" fullWidth variant="standard"
                                    value={invoiceData.customerGSTIN}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, customerGSTIN: e.target.value })}
                                />
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <Typography variant="overline" color="text.secondary" fontWeight="bold">Transport Details:</Typography>
                            <Box sx={{ mt: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            select label="Mode" fullWidth size="small" variant="standard"
                                            value={invoiceData.transportMode}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, transportMode: e.target.value })}
                                        >
                                            <MenuItem value="Road">Road</MenuItem>
                                            <MenuItem value="Rail">Rail</MenuItem>
                                            <MenuItem value="Air">Air</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <TextField
                                            label="Vehicle No" fullWidth size="small" variant="standard"
                                            value={invoiceData.vehicleNo}
                                            onChange={(e) => setInvoiceData({ ...invoiceData, vehicleNo: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Items Table */}
                    <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ mb: 4 }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: 'grey.100' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Description (Yarn Count)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bags</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Weight (kg)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rate (₹)</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount (₹)</TableCell>
                                    <TableCell sx={{ width: 50, '@media print': { display: 'none' } }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item, index) => {
                                    const amount = (parseFloat(item.weight) || 0) * (parseFloat(item.rate) || 0);
                                    return (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    select variant="standard" fullWidth size="small"
                                                    value={item.yarnCount}
                                                    onChange={(e) => handleItemChange(item.id, 'yarnCount', e.target.value)}
                                                    InputProps={{ disableUnderline: true }}
                                                >
                                                    {Object.keys(yarnStock || {}).length > 0 ? (
                                                        Object.keys(yarnStock || {}).sort((a, b) => Number(a) - Number(b)).map(c => (
                                                            <MenuItem key={c} value={c}>Count {c}</MenuItem>
                                                        ))
                                                    ) : (
                                                        ['20', '30', '40', '60'].map(c => <MenuItem key={c} value={c}>Count {c}</MenuItem>)
                                                    )}
                                                </TextField>
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number" variant="standard" fullWidth size="small" inputProps={{ style: { textAlign: 'right' } }}
                                                    value={item.bags}
                                                    onChange={(e) => handleItemChange(item.id, 'bags', e.target.value)}
                                                    InputProps={{ disableUnderline: true }}
                                                    placeholder="0"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number" variant="standard" fullWidth size="small" inputProps={{ style: { textAlign: 'right' } }}
                                                    value={item.weight}
                                                    onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                                                    InputProps={{ disableUnderline: true }}
                                                    placeholder="0.00"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number" variant="standard" fullWidth size="small" inputProps={{ style: { textAlign: 'right' } }}
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                    InputProps={{ disableUnderline: true }}
                                                    placeholder="0.00"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {amount > 0 ? `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                                            </TableCell>
                                            <TableCell sx={{ '@media print': { display: 'none' } }}>
                                                <IconButton size="small" color="error" onClick={() => removeItem(item.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow sx={{ '@media print': { display: 'none' } }}>
                                    <TableCell colSpan={7}>
                                        <Button startIcon={<AddIcon />} size="small" onClick={addItem}>Add Line Item</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Footer / Totals */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto', pt: 4 }}>
                        <Box sx={{ width: 300 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography fontWeight="600">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">CGST (9%)</Typography>
                                <Typography>₹{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">SGST (9%)</Typography>
                                <Typography>₹{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" fontWeight="bold">Total</Typography>
                                <Typography variant="h5" color="primary.main" fontWeight="bold">
                                    ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Bottom Signatures */}
                    <Box sx={{ mt: 8, pt: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <Box sx={{ borderTop: '1px solid #ccc', px: 2, pt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Receiver's Signature</Typography>
                        </Box>
                        <Box sx={{ borderTop: '1px solid #ccc', px: 2, pt: 1, textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Authorized Signatory</Typography>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 0.5 }}>{settings?.companyName}</Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

// --- Billing Dashboard Component ---
const BillingDashboard = ({ invoices, onCreateNew, onDelete }: { invoices: any[], onCreateNew: () => void, onDelete: (id: string) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const stats = useMemo(() => {
        const total = invoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const count = invoices.length;
        return { total, count };
    }, [invoices]);

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}><MoneyIcon /></Avatar>
                                <Typography variant="h6">Total Revenue</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>Lifetime Billed Amount</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText', mr: 2 }}><ReceiptIcon /></Avatar>
                                <Typography variant="h6">Total Invoices</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold">{stats.count}</Typography>
                            <Typography variant="caption" color="text.secondary">Invoices Generated</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'success.light', color: 'success.contrastText', mr: 2 }}><TrendingIcon /></Avatar>
                                <Typography variant="h6">This Month</Typography>
                            </Box>
                            {/* Mock Data for now */}
                            <Typography variant="h3" fontWeight="bold">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography>
                            <Typography variant="caption" color="text.secondary">Current Financial Period</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Invoices List */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Recent Invoices</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search invoices..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                            }}
                        />
                        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateNew}>
                            Create Invoice
                        </Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Invoice No</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Created By</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.slice().reverse().map((invoice) => (
                                    <TableRow key={invoice.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{invoice.invoiceNo}</TableCell>
                                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{invoice.customerName}</TableCell>
                                        <TableCell align="right">₹{invoice.total?.toLocaleString('en-IN')}</TableCell>
                                        <TableCell align="center">
                                            <Chip label="Paid" color="success" size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                                                {invoice.createdBy || 'Unknown'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Delete">
                                                <IconButton size="small" color="error" onClick={() => onDelete(invoice.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No invoices found matching your search.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

// --- Main Page Component ---
const Billing: React.FC<BillingProps> = ({ userRole, username }) => {
    const queryClient = useQueryClient();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Queries
    const { data: invoices = [] } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => (await api.get('/billing/invoices')).data,
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => (await api.get('/settings')).data,
    });

    const { data: yarnStock } = useQuery({
        queryKey: ['yarnStock'],
        queryFn: async () => (await api.get('/inventory/yarn-stock')).data,
    });

    const handleSaveInvoice = async (data: any) => {
        try {
            await api.post('/billing/invoice', { ...data, createdBy: username });
            setNotification({ open: true, message: 'Invoice created successfully', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setView('list');
        } catch (error) {
            setNotification({ open: true, message: 'Failed to create invoice', severity: 'error' });
        }
    };

    const handleDeleteInvoice = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await api.delete(`/billing/invoice/${id}`);
            setNotification({ open: true, message: 'Invoice deleted', severity: 'success' });
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        } catch (error) {
            setNotification({ open: true, message: 'Failed to delete invoice', severity: 'error' });
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '100%', height: 'calc(100vh - 100px)' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Billing & Invoicing</Typography>
                <Typography variant="body2" color="text.secondary">Manage sales, invoices, and revenue.</Typography>
            </Box>

            {view === 'list' ? (
                <BillingDashboard
                    invoices={invoices}
                    onCreateNew={() => setView('create')}
                    onDelete={handleDeleteInvoice}
                />
            ) : (
                <InvoiceEditor
                    onCancel={() => setView('list')}
                    onSave={handleSaveInvoice}
                    settings={settings}
                    yarnStock={yarnStock}
                />
            )}

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Billing;
