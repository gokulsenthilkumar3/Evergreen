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
    Divider,
    Tooltip,
    Grid,
    Card,
    CardContent,
    InputAdornment,
    Chip,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Collapse,
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
    Edit as EditIcon,
    Payment as PaymentIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Share as ShareIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// @ts-ignore
import { useReactToPrint } from 'react-to-print';
import api from '../utils/api';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';
import TablePagination from '../components/common/TablePagination';
import PaymentStatusChip from '../components/common/PaymentStatusChip';
import StandardIcons from '../components/common/StandardIcons';
import ColumnFilters from '../components/common/ColumnFilters';
import { BulkActions } from '../components/common/BulkActions';

// --- Types ---
interface InvoiceItem {
    id: number;
    yarnCount: string;
    bags: string;
    weight: string;
    rate: string;
}

interface PaymentEntry {
    id: number;
    date: string;
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
    createdBy?: string;
    createdAt: string;
}

interface BillingProps {
    userRole?: string;
    username?: string;
}

// --- Payment Dialog Component ---
const PaymentDialog = ({
    open,
    onClose,
    invoice,
    username,
    onSuccess
}: {
    open: boolean;
    onClose: () => void;
    invoice: any;
    username?: string;
    onSuccess: () => void;
}) => {
    const [paymentData, setPaymentData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        method: 'CASH',
        reference: '',
        notes: '',
    });
    const [showErrors, setShowErrors] = useState(false);

    const remaining = invoice ? (invoice.total - (invoice.amountPaid || 0)) : 0;

    const handleSubmit = async () => {
        setShowErrors(true);
        const amount = parseFloat(paymentData.amount);

        if (!amount || amount <= 0) {
            toast.error('Payment amount must be greater than 0');
            return;
        }
        if (amount > remaining + 0.01) {
            toast.error(`Amount exceeds remaining balance (₹${remaining.toFixed(2)})`);
            return;
        }
        if (!paymentData.method) {
            toast.error('Payment method is required');
            return;
        }

        try {
            await api.post(`/billing/invoice/${invoice.id}/payment`, {
                ...paymentData,
                amount,
                createdBy: username,
            });
            toast.success(SUCCESS_MESSAGES.PAYMENT_RECORDED);
            setPaymentData({ date: new Date().toISOString().split('T')[0], amount: '', method: 'CASH', reference: '', notes: '' });
            setShowErrors(false);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
                Record Payment
                {invoice && (
                    <Typography variant="body2" color="text.secondary">
                        Invoice: {invoice.invoiceNo} | Remaining: ₹{remaining.toFixed(2)}
                    </Typography>
                )}
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Payment Date"
                        type="date"
                        fullWidth
                        value={paymentData.date}
                        onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Amount (₹)"
                        type="number"
                        fullWidth
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        error={showErrors && (!paymentData.amount || parseFloat(paymentData.amount) <= 0)}
                        helperText={`Max: ₹${remaining.toFixed(2)}`}
                        InputProps={{
                            endAdornment: (
                                <Button
                                    size="small"
                                    onClick={() => setPaymentData({ ...paymentData, amount: remaining.toFixed(2) })}
                                    sx={{ minWidth: 'auto', px: 1 }}
                                >
                                    Full
                                </Button>
                            )
                        }}
                    />
                    <TextField
                        select
                        label="Payment Method"
                        fullWidth
                        value={paymentData.method}
                        onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                    >
                        <MenuItem value="CASH">Cash</MenuItem>
                        <MenuItem value="BANK">Bank Transfer</MenuItem>
                        <MenuItem value="UPI">UPI</MenuItem>
                        <MenuItem value="CHEQUE">Cheque</MenuItem>
                    </TextField>
                    <TextField
                        label="Reference (Cheque/UPI Ref)"
                        fullWidth
                        value={paymentData.reference}
                        onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                        placeholder="Optional"
                    />
                    <TextField
                        label="Notes"
                        fullWidth
                        multiline
                        rows={2}
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                        placeholder="Optional"
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" startIcon={<PaymentIcon />}>
                    Record Payment
                </Button>
            </DialogActions>
        </Dialog>
    );
};


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
    const [showErrors, setShowErrors] = useState(false);

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
        contentRef: componentRef,
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
        setShowErrors(true);

        // Validation
        if (!invoiceData.customerName.trim()) {
            toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Customer name'));
            return;
        }
        if (!invoiceData.invoiceNo.trim()) {
            toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Invoice number'));
            return;
        }

        const validItems = items.filter(i => parseFloat(i.weight) > 0 && parseFloat(i.rate) > 0);
        if (validItems.length === 0) {
            toast.error(ERROR_MESSAGES.NO_DATA);
            return;
        }

        // Validate GSTIN format if provided
        if (invoiceData.customerGSTIN && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(invoiceData.customerGSTIN)) {
            toast.warning('GSTIN format may be invalid. Proceeding anyway.');
        }

        onSave({
            ...invoiceData,
            items: validItems.map(i => ({ ...i, bags: Number(i.bags), weight: Number(i.weight), rate: Number(i.rate) })),
            ...totals
        });
    };

    const handleShare = () => {
        const subject = encodeURIComponent(`Invoice ${invoiceData.invoiceNo} - ${settings?.companyName || 'Ever Green Yarn Mills'}`);
        const body = encodeURIComponent(
            `Dear ${invoiceData.customerName},\n\n` +
            `Please find the details for Invoice ${invoiceData.invoiceNo}:\n\n` +
            `Total Amount: ₹${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
            `Date: ${invoiceData.date}\n\n` +
            `Please print/download the invoice for a detailed breakdown.\n\n` +
            `Regards,\n${settings?.companyName || 'Ever Green Yarn Mills'}`
        );
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    return (
        <Box sx={{ maxWidth: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'transparent' }}>
                <Button startIcon={<ArrowBackIcon />} onClick={onCancel} sx={{ color: 'text.secondary' }}>
                    Back to List
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" startIcon={<ShareIcon />} onClick={handleShare} color="info">
                        Share
                    </Button>
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
                                    error={showErrors && !invoiceData.invoiceNo}
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
                                    error={showErrors && !invoiceData.customerName}
                                    required
                                />
                                <TextField
                                    placeholder="Address" fullWidth multiline rows={2} variant="standard" sx={{ mb: 1 }}
                                    value={invoiceData.customerAddress}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, customerAddress: e.target.value })}
                                />
                                <TextField
                                    placeholder="GSTIN" fullWidth variant="standard"
                                    value={invoiceData.customerGSTIN}
                                    onChange={(e) => setInvoiceData({ ...invoiceData, customerGSTIN: e.target.value.toUpperCase() })}
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
                                                    error={showErrors && (!item.weight || parseFloat(item.weight) <= 0)}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number" variant="standard" fullWidth size="small" inputProps={{ style: { textAlign: 'right' } }}
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                    InputProps={{ disableUnderline: true }}
                                                    placeholder="0.00"
                                                    error={showErrors && (!item.rate || parseFloat(item.rate) <= 0)}
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
const BillingDashboard = ({
    invoices,
    onCreateNew,
    onDelete,
    onAddPayment,
    username,
    userRole,
    isLoading,
}: {
    invoices: any[];
    onCreateNew: () => void;
    onDelete: (id: string) => void;
    onAddPayment: (invoice: any) => void;
    username?: string;
    userRole?: string;
    isLoading?: boolean;
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedInvoice, setExpandedInvoice] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { confirm: confirmDialog } = useConfirm();

    // Column filters state
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [activeSort, setActiveSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const stats = useMemo(() => {
        const total = invoices.reduce((acc, curr) => acc + (curr.total || 0), 0);
        const paid = invoices.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
        const unpaid = total - paid;
        const count = invoices.length;
        const paidCount = invoices.filter(i => i.status === 'PAID').length;
        const partialCount = invoices.filter(i => i.status === 'PARTIAL').length;
        const unpaidCount = invoices.filter(i => i.status === 'UNPAID').length;
        return { total, paid, unpaid, count, paidCount, partialCount, unpaidCount };
    }, [invoices]);

    // Apply filters and sorting
    let filteredInvoices = invoices.filter(inv => {
        // Text search
        const matchesSearch = !searchTerm || 
            inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.status?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Column filters
        const matchesFilters = Object.entries(activeFilters).every(([key, value]) => {
            if (!value) return true;
            if (key === 'date') {
                return inv.date?.startsWith(value);
            }
            return String(inv[key]).toLowerCase().includes(String(value).toLowerCase());
        });
        
        return matchesSearch && matchesFilters;
    });

    // Apply sorting
    if (activeSort) {
        filteredInvoices = [...filteredInvoices].sort((a, b) => {
            const aVal = a[activeSort.key];
            const bVal = b[activeSort.key];
            const comparison = String(aVal).localeCompare(String(bVal));
            return activeSort.direction === 'asc' ? comparison : -comparison;
        });
    }

    // Pagination logic
    const totalInvoices = filteredInvoices.length;
    const paginatedInvoices = filteredInvoices.slice().reverse().slice((page - 1) * pageSize, page * pageSize);

    const getStatusColor = (status: string): 'success' | 'warning' | 'error' => {
        switch (status) {
            case 'PAID': return 'success';
            case 'PARTIAL': return 'warning';
            default: return 'error';
        }
    };

    // Filter configuration
    const filterColumns = [
        { key: 'invoiceNo', label: 'Invoice No', type: 'text' as const },
        { key: 'customerName', label: 'Customer', type: 'text' as const },
        { key: 'status', label: 'Status', type: 'select' as const, options: [
            { value: 'PAID', label: 'Paid' },
            { value: 'PARTIAL', label: 'Partial' },
            { value: 'UNPAID', label: 'Unpaid' },
        ]},
        { key: 'date', label: 'Date', type: 'date' as const },
    ];

    // Bulk action handlers
    const handleBulkDelete = async (ids: string[]) => {
        if (!await confirmDialog({
            title: 'Delete Multiple Invoices',
            message: `Are you sure you want to delete ${ids.length} invoices?`,
            severity: 'error',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })) return;
        
        for (const id of ids) {
            await onDelete(id);
        }
        setSelectedIds([]);
    };

    const handleBulkExport = (ids: string[], format: 'excel' | 'pdf' | 'csv') => {
        toast.success(`Exporting ${ids.length} invoices as ${format.toUpperCase()}`);
    };

    const handleDeletePayment = async (paymentId: number) => {
        if (!await confirmDialog({
            title: 'Delete Payment',
            message: 'Are you sure you want to delete this payment? The invoice balance will be updated.',
            severity: 'error',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })) return;

        try {
            await api.delete(`/billing/payment/${paymentId}`);
            toast.success(SUCCESS_MESSAGES.DELETE);
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.DELETE_FAILED));
        }
    };

    return (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}><MoneyIcon /></Avatar>
                                <Typography variant="subtitle1">Total Billed</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">₹{stats.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{stats.count} invoices</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'success.light', color: 'success.contrastText', mr: 2 }}><TrendingIcon /></Avatar>
                                <Typography variant="subtitle1">Paid</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold" color="success.main">₹{stats.paid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography>
                            <Typography variant="caption" color="text.secondary">{stats.paidCount} fully paid</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', mr: 2 }}><PaymentIcon /></Avatar>
                                <Typography variant="subtitle1">Outstanding</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold" color="warning.main">₹{stats.unpaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography>
                            <Typography variant="caption" color="text.secondary">{stats.partialCount} partial, {stats.unpaidCount} unpaid</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText', mr: 2 }}><ReceiptIcon /></Avatar>
                                <Typography variant="subtitle1">This Month</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {invoices.filter(i => {
                                    const d = new Date(i.date);
                                    const now = new Date();
                                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                                }).length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Invoices this month</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Invoices List */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">All Invoices</Typography>
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

                <TableContainer sx={{ maxHeight: 'calc(100vh - 350px)' }}>
                    {isLoading ? (
                        <TableSkeleton columns={9} hasActions={true} />
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ width: 40, bgcolor: 'background.paper' }}></TableCell>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Invoice No</TableCell>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Customer</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Amount</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Paid</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Progress</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'background.paper' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedInvoices.length > 0 ? (
                                    paginatedInvoices.map((invoice) => {
                                        const paidPercent = invoice.total > 0 ? Math.min(100, (invoice.amountPaid / invoice.total) * 100) : 0;
                                        const isExpanded = expandedInvoice === invoice.id;
                                    return (
                                        <React.Fragment key={invoice.id}>
                                            <TableRow hover>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setExpandedInvoice(isExpanded ? null : invoice.id)}
                                                    >
                                                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{invoice.invoiceNo}</TableCell>
                                                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{invoice.customerName}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>₹{invoice.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell align="right" sx={{ color: 'success.main', fontWeight: 500 }}>
                                                    ₹{(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <PaymentStatusChip status={invoice.status} />
                                                </TableCell>
                                                <TableCell align="center" sx={{ minWidth: 120 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={paidPercent}
                                                            color={paidPercent >= 100 ? 'success' : paidPercent > 0 ? 'warning' : 'error'}
                                                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                                        />
                                                        <Typography variant="caption" sx={{ minWidth: 35 }}>{paidPercent.toFixed(0)}%</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                        {invoice.status !== 'PAID' && (
                                                            <Tooltip title="Add Payment">
                                                                <IconButton size="small" color="success" onClick={() => onAddPayment(invoice)}>
                                                                    <PaymentIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip title="Delete">
                                                            <IconButton size="small" color="error" onClick={() => onDelete(invoice.id)}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                            {/* Payment History Drill-down */}
                                            <TableRow>
                                                <TableCell colSpan={9} sx={{ py: 0, borderBottom: isExpanded ? undefined : 'none' }}>
                                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, my: 1 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                                                Payment History
                                                            </Typography>
                                                            {invoice.payments && invoice.payments.length > 0 ? (
                                                                <Table size="small">
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Date</TableCell>
                                                                            <TableCell align="right">Amount</TableCell>
                                                                            <TableCell>Method</TableCell>
                                                                            <TableCell>Reference</TableCell>
                                                                            <TableCell>Notes</TableCell>
                                                                            <TableCell>By</TableCell>
                                                                            <TableCell align="center">Action</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {invoice.payments.map((payment: PaymentEntry) => (
                                                                            <TableRow key={payment.id}>
                                                                                <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                                                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                                                    ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Chip label={payment.method} size="small" variant="outlined" />
                                                                                </TableCell>
                                                                                <TableCell>{payment.reference || '-'}</TableCell>
                                                                                <TableCell>{payment.notes || '-'}</TableCell>
                                                                                <TableCell>
                                                                                    <Typography variant="caption">{payment.createdBy || '-'}</Typography>
                                                                                </TableCell>
                                                                                <TableCell align="center">
                                                                                    {(userRole === 'ADMIN' || userRole === 'AUTHOR') && (
                                                                                        <IconButton size="small" color="error" onClick={() => handleDeletePayment(payment.id)}>
                                                                                            <DeleteIcon fontSize="small" />
                                                                                        </IconButton>
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                                                    No payments recorded yet
                                                                </Typography>
                                                            )}
                                                            {/* Summary */}
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 4, mt: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                                                                <Typography variant="body2">
                                                                    Total: <strong>₹{invoice.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                                                </Typography>
                                                                <Typography variant="body2" color="success.main">
                                                                    Paid: <strong>₹{(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                                                </Typography>
                                                                <Typography variant="body2" color={invoice.status === 'PAID' ? 'success.main' : 'error.main'}>
                                                                    Balance: <strong>₹{(invoice.total - (invoice.amountPaid || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No invoices found matching your search.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
                </TableContainer>

                {!isLoading && totalInvoices > 0 && (
                    <TablePagination
                        total={totalInvoices}
                        page={page}
                        pageSize={pageSize}
                        onPageChange={setPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </Paper>
        </Box>
    );
};

// --- Main Page Component ---
const Billing: React.FC<BillingProps> = ({ userRole, username }) => {
    const queryClient = useQueryClient();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [paymentDialogInvoice, setPaymentDialogInvoice] = useState<any>(null);
    const { confirm } = useConfirm();

    // Queries
    const { data: invoices = [], refetch: refetchInvoices } = useQuery({
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
            toast.success(SUCCESS_MESSAGES.INVOICE_CREATED);
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setView('list');
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.CREATE_FAILED));
        }
    };

    const handleDeleteInvoice = async (id: string) => {
        if (!await confirm({ title: CONFIRM_TITLES.DELETE_INVOICE, message: CONFIRM_MESSAGES.DELETE_INVOICE('this invoice'), severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) return;
        try {
            await api.delete(`/billing/invoice/${id}`);
            toast.success(SUCCESS_MESSAGES.INVOICE_DELETED);
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.DELETE_FAILED));
        }
    };

    const handlePaymentSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
    };

    return (
        <Box sx={{ width: '100%', maxWidth: '100%', height: 'calc(100vh - 100px)' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h4" fontWeight="bold">Billing & Invoicing</Typography>
                <Typography variant="body2" color="text.secondary">Manage sales, invoices, payments, and revenue.</Typography>
            </Box>

            {view === 'list' ? (
                <BillingDashboard
                    invoices={invoices}
                    onCreateNew={() => setView('create')}
                    onDelete={handleDeleteInvoice}
                    onAddPayment={(inv) => setPaymentDialogInvoice(inv)}
                    username={username}
                    userRole={userRole}
                    isLoading={!invoices}
                />
            ) : (
                <InvoiceEditor
                    onCancel={() => setView('list')}
                    onSave={handleSaveInvoice}
                    settings={settings}
                    yarnStock={yarnStock}
                />
            )}

            {/* Payment Dialog */}
            <PaymentDialog
                open={!!paymentDialogInvoice}
                onClose={() => setPaymentDialogInvoice(null)}
                invoice={paymentDialogInvoice}
                username={username}
                onSuccess={handlePaymentSuccess}
            />
        </Box>
    );
};

export default Billing;
