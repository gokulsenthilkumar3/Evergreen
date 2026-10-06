import React, { useState } from 'react';
import { getDateRange, DATE_FILTER_OPTIONS_WITH_ALL, type DateFilterType } from '../utils/dateFilters';
import { validateVehicleNo, validateDate, validateCustomerName, isEmptyOrWhitespace } from '../utils/validators';
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
    Grid,
    Divider,
    Dialog,
    DialogContent,
    DialogActions,
    Chip,
    Menu,
    ListItemIcon,
    ListItemText,
    Tooltip,
    LinearProgress,
    Stack,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Email as EmailIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon,
    FileDownload as ExportIcon,
    QrCode2 as QrIcon,
    LocalShippingOutlined,
} from '@mui/icons-material';
import BarcodeQRModal from '../components/common/BarcodeQRModal';
import { formatOutwardCode, buildOutwardQRPayload } from '../utils/codeFormatters';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { localTimeValue, productionTimestamp } from '../utils/productionTiming';
import { generateExcel } from '../utils/excelGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, WARNING_MESSAGES, INFO_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';
import { handleDeleteGuardError } from '../utils/deleteGuardHandler';
import EmptyState from '../components/common/EmptyState';
import GlassDatePicker from '../components/common/GlassDatePicker';
import ExportButtons from '../components/common/ExportButtons';
import EntryWizardHeader, { EntrySummary, SummaryValue } from '../components/common/EntryWizardHeader';


interface OutwardItem {
    id: number;
    count: string;
    bags: number;
    weight: number;
}

interface OutwardEntryProps {
    userRole?: string;
    username?: string;
}

const OutwardEntry: React.FC<OutwardEntryProps> = ({ userRole, username }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [historyFrom, setHistoryFrom] = useState('');
    const [historyTo, setHistoryTo] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [filterType, setFilterType] = useState<DateFilterType>('all');
    const [showErrors, setShowErrors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [labelOutward, setLabelOutward] = useState<any | null>(null);
    const { confirm: confirmDialog } = useConfirm();

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const type = e.target.value as DateFilterType;
        setFilterType(type);
        const range = getDateRange(type, historyFrom, historyTo);
        setHistoryFrom(range.from);
        setHistoryTo(range.to);
    };

    const handleExportAction = (type: 'email' | 'excel' | 'pdf' | 'image') => {
        handleExport(type);
        handleMenuClose();
    };

    const { data: outwardHistory, refetch: refetchHistory, isLoading } = useQuery({
        queryKey: ['outwardHistory', historyFrom, historyTo],
        queryFn: async () => {
            const params: any = {};
            if (historyFrom) params.from = historyFrom;
            if (historyTo) params.to = historyTo;
            const response = await api.get('/inventory/outward', { params });
            return response.data;
        },
    });

    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [dispatchTime, setDispatchTime] = useState(() => localTimeValue());
    const [customerName, setCustomerName] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');

    const { data: yarnStock = {}, refetch: refetchStock, isFetching: isFetchingStock } = useQuery<{ [key: string]: number }>({
        queryKey: ['yarnStock', date, dispatchTime, 'available'],
        queryFn: async () => {
            const res = await api.get('/inventory/yarn-stock', { params: { date: productionTimestamp(date, dispatchTime) || date, available: true } });
            return res.data;
        }
    });
    const [items, setItems] = useState<OutwardItem[]>([
        { id: 1, count: '2', bags: 0, weight: 0 },
    ]);


    const handleItemChange = (id: number, field: keyof OutwardItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'bags') {
                    // Auto-calculate weight: 1 bag = 60kg
                    updatedItem.weight = (parseFloat(value) || 0) * 60;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const addItemRow = () => {
        const nextId = Math.max(...items.map(i => i.id), 0) + 1;
        setItems([...items, { id: nextId, count: '2', bags: 0, weight: 0 }]);
    };

    const removeItemRow = (id: number) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const getTotalBags = () => items.reduce((sum, item) => sum + (Number(item.bags) || 0), 0);
    const getTotalWeight = () => items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);

    const handleSave = async () => {
        setShowErrors(true);

        // ── Field Validations (centralised validators) ──────────────────────
        const customerCheck = validateCustomerName(customerName);
        if (!customerCheck.valid) { toast.error(customerCheck.message); return; }

        const vehicleCheck = validateVehicleNo(vehicleNo);
        if (!vehicleCheck.valid) { toast.error(vehicleCheck.message); return; }

        if (isEmptyOrWhitespace(driverName)) { toast.error(ERROR_MESSAGES.REQUIRED_FIELD('Driver name')); return; }

        const dateCheck = validateDate(date, false);
        if (!dateCheck.valid) { toast.error(dateCheck.message); return; }

        const todayLocal = new Date().toLocaleDateString('en-CA');
        if (date < todayLocal) {
            toast.info(INFO_MESSAGES.PAST_DATE_STOCK_INFO(date));
        }

        // Date validation: cannot be in the future
        if (date > todayLocal) {
            toast.error('Outward date cannot be in the future');
            return;
        }

        // Date validation: today's yarn production cannot go to yesterday's outward
        if (date < todayLocal) {
            toast.warning('Note: Adding outward entry for a past date. Only yarn produced on or before that date will be counted.');
        }

        const validItems = items.filter(i => Number(i.bags) > 0);
        if (validItems.length === 0) {
            toast.error(ERROR_MESSAGES.NO_DATA);
            return;
        }

        // ── Stock availability check ────────────────────────────────────────
        for (const item of validItems) {
            const currentStock = yarnStock[item.count] || 0;
            if (Number(item.weight) > currentStock) {
                toast.error(
                    WARNING_MESSAGES.INSUFFICIENT_STOCK_DETAIL(
                        `Count ${item.count}`,
                        Math.floor(currentStock / 60),
                        currentStock
                    )
                );
                return;
            }
        }

        // ── Duplicate count check ───────────────────────────────────────────
        const countValues = validItems.map(i => i.count);
        if (new Set(countValues).size !== countValues.length) {
            toast.error(WARNING_MESSAGES.DUPLICATE_COUNTS);
            return;
        }

        if (!productionTimestamp(date, dispatchTime)) { toast.error('Enter a valid dispatch time'); return; }
        setIsSubmitting(true);
        try {
            await api.post('/inventory/outward', {
                date: productionTimestamp(date, dispatchTime),
                customerName: customerName.trim(),
                vehicleNo: vehicleNo.trim().toUpperCase(),
                driverName: driverName.trim(),
                createdBy: username,
                items: validItems.map(item => ({
                    ...item,
                    bags: Number(item.bags),
                    weight: Number(item.weight)
                }))
            });
            toast.success(SUCCESS_MESSAGES.OUTWARD_SAVED);
            setCustomerName('');
            setVehicleNo('');
            setDriverName('');
            setItems([{ id: 1, count: '2', bags: 0, weight: 0 }]);
            setDate(new Date().toLocaleDateString('en-CA'));
            refetchHistory();
            refetchStock();
            setOpenDialog(false);
            setShowErrors(false);
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOutward = async (id: number) => {
        if (!await confirmDialog({ title: 'Reverse Dispatch', message: 'Confirm the yarn has returned to stock. Linked invoices must be voided first. Dispatch history will be retained.', severity: 'warning', confirmText: 'Return stock', cancelText: 'Cancel' })) return;

        try {
            await api.delete(`/inventory/outward/${id}`);
            toast.success('Dispatch reversed and yarn returned to stock');
            refetchHistory();
            refetchStock();
        } catch (error: any) {
            handleDeleteGuardError(error, ERROR_MESSAGES.DELETE_FAILED);
        }
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf' | 'image') => {
        const data = outwardHistory || [];
        if (data.length === 0) {
            toast.error(ERROR_MESSAGES.NO_DATA);
            return;
        }

        const filename = `Outward_Sales_Report_${new Date().toISOString().split('T')[0]}`;

        if (type === 'pdf') {
            const headers = ['Date', 'Customer', 'Vehicle No', 'Driver', 'T. Bags', 'T. Weight (kg)'];
            const rows = data.map((row: any) => [
                new Date(row.date).toLocaleDateString(),
                row.customerName,
                row.vehicleNo,
                row.driverName || '-',
                row.totalBags,
                row.totalWeight
            ]);
            generatePDF('Outward Sales Report', headers, rows, filename);
        } else if (type === 'excel') {
            const excelData = data.map((row: any) => ({
                Date: new Date(row.date).toLocaleDateString(),
                Customer: row.customerName,
                'Vehicle No': row.vehicleNo,
                'Driver Name': row.driverName,
                'Total Bags': row.totalBags,
                'Total Weight (kg)': row.totalWeight
            }));
            generateExcel(excelData, filename);
        } else if (type === 'email') {
            const subject = encodeURIComponent(`Outward Sales Report: ${new Date().toISOString().split('T')[0]}`);
            const body = encodeURIComponent(`Please find the attached Outward Sales Report.\n\n(Note: Please export and attach the PDF/Excel file manually)`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header and Actions */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Outward Entry
                    {isLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        select
                        label="Date Filter"
                        size="small"
                        value={filterType}
                        onChange={handleFilterChange}
                        sx={{ width: 150 }}
                    >
                        {DATE_FILTER_OPTIONS_WITH_ALL.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </TextField>

                    {filterType === 'custom' && (
                        <>
                            <GlassDatePicker
                                label="From"
                                
                                size="small"
                                value={historyFrom}
                                onChange={(e) => setHistoryFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                            />
                            <GlassDatePicker
                                label="To"
                                
                                size="small"
                                value={historyTo}
                                onChange={(e) => setHistoryTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                            />
                        </>
                    )}

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => { setDispatchTime(localTimeValue()); setOpenDialog(true); }}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Add Outward
                    </Button>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', md: 'block' } }} />

                    <ExportButtons onExport={handleExportAction} />
                </Box>
            </Box>

            {/* History Table */}
            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Vehicle / Driver</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Total Bags</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Total Weight</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {outwardHistory?.map((row: any) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Tooltip title={row.entryTimestamp ? new Date(row.entryTimestamp).toLocaleString() : new Date(row.date).toLocaleString()} arrow placement="top">
                                            <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                {new Date(row.date).toLocaleDateString()}
                                            </Box>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.customerName}{row.status === 'REVERSED' && <Chip label="Reversed" size="small" sx={{ ml: 1 }} />}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.vehicleNo}</Typography>
                                        <Typography variant="caption" color="text.secondary">{row.driverName}</Typography>
                                    </TableCell>
                                    <TableCell align="center">{row.totalBags}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.totalWeight} kg</TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                            <Tooltip title="Print Dispatch Sticker (Barcode & QR)">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => setLabelOutward(row)}
                                                    aria-label="Generate QR and Barcode Label"
                                                >
                                                    <QrIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {(userRole === 'ADMIN' && row.status !== 'REVERSED') && (
                                                <Tooltip title="Reverse dispatch and return stock">
                                                    <IconButton color="error" size="small" onClick={() => handleDeleteOutward(row.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!outwardHistory || outwardHistory.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography color="text.secondary" variant="body1">No outward records found</Typography>
                                        <Typography color="text.secondary" variant="caption">Start by recording a new outward entry using the button above</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => { if (!isSubmitting) { setOpenDialog(false); setShowErrors(false); } }} maxWidth="md" fullWidth
                aria-labelledby="outward-wizard-title" aria-describedby="outward-wizard-title-description">
                <EntryWizardHeader id="outward-wizard-title" stage="03 · Yarn dispatch" title="New Outward Entry"
                    description="Prepare the load, confirm available yarn, and record its destination."
                    icon={<LocalShippingOutlined />} busy={isSubmitting} onClose={() => { setOpenDialog(false); setShowErrors(false); }} />
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>01 / Delivery details</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField type="date" size="small"
                                    label="Date"
                                    
                                    fullWidth
                                    value={date}
                                    error={showErrors && !validateDate(date, false).valid}
                                    helperText={showErrors ? validateDate(date, false).message : undefined}
                                    onChange={(e) => setDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}><TextField type="time" label="Dispatch time" value={dispatchTime} onChange={e => setDispatchTime(e.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 1 } }} helperText="Yarn must be available at this time." /></Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Customer Name"
                                    fullWidth
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    error={showErrors && !validateCustomerName(customerName).valid}
                                    helperText={showErrors ? validateCustomerName(customerName).message : undefined}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Vehicle No"
                                    fullWidth
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                                    required
                                    placeholder="TN 01 AB 1234"
                                    error={showErrors && !validateVehicleNo(vehicleNo).valid}
                                    helperText={(showErrors && validateVehicleNo(vehicleNo).message) || 'Format: TN 01 AB 1234'}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Driver Name"
                                    fullWidth
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                    required
                                    error={showErrors && isEmptyOrWhitespace(driverName)}
                                    helperText={showErrors && isEmptyOrWhitespace(driverName) ? 'Driver name is required' : undefined}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            02 / Yarn to dispatch
                        </Typography>

                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Count</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Bags</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Weight (kg)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '10%' }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id} sx={{ '& td': { verticalAlign: 'top', py: 2 } }}>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    size="small"
                                                    fullWidth
                                                    value={item.count}
                                                    onChange={(e) => handleItemChange(item.id, 'count', e.target.value)}
                                                    label="Count"
                                                >
                                                    {Object.keys(yarnStock).length > 0 ? (
                                                        Object.keys(yarnStock).sort((a, b) => Number(a) - Number(b)).map(c => (
                                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                                        ))
                                                    ) : (
                                                        ['2', '4', '6', '8', '10'].map(c => (
                                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                                        ))
                                                    )}
                                                </TextField>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={item.bags}
                                                    label="Bags to dispatch"
                                                    InputProps={{ endAdornment: <InputAdornment position="end">bags</InputAdornment> }}
                                                    onChange={(e) => handleItemChange(item.id, 'bags', e.target.value)}
                                                    required
                                                    error={!item.bags || (yarnStock[item.count] !== undefined && item.weight > yarnStock[item.count])}
                                                    helperText={
                                                        yarnStock[item.count] !== undefined
                                                            ? `Available: ${Math.floor(yarnStock[item.count] / 60)} bags (${yarnStock[item.count].toFixed(1)}kg)`
                                                            : 'Stock unknown'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={item.weight}
                                                    label="Dispatch weight"
                                                    InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                                                    disabled // Auto-calculated
                                                    sx={{ bgcolor: 'action.hover' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" aria-label="Remove dispatch row" onClick={() => removeItemRow(item.id)} disabled={items.length === 1}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ p: 1 }}>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addItemRow}
                                variant="outlined"
                            >
                                Add Row
                            </Button>
                            <EntrySummary title="Dispatch at a glance">
                                <SummaryValue label="Customer" value={customerName.trim() || '—'} />
                                <SummaryValue label="Total bags" value={getTotalBags()} />
                                <SummaryValue label="Dispatch weight" value={`${getTotalWeight().toFixed(1)} kg`} />
                                <SummaryValue label="Packing" value="60 kg / bag" />
                            </EntrySummary>
                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={() => { setOpenDialog(false); setShowErrors(false); }} color="inherit" disabled={isSubmitting}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </Button>
                </DialogActions>
            </Dialog>

            {labelOutward && (
                <BarcodeQRModal
                    open={Boolean(labelOutward)}
                    onClose={() => setLabelOutward(null)}
                    type="OUTWARD"
                    title={`Outward Dispatch: ${formatOutwardCode(labelOutward.date, labelOutward.id)}`}
                    code={formatOutwardCode(labelOutward.date, labelOutward.id)}
                    qrPayload={buildOutwardQRPayload(labelOutward)}
                    metadata={[
                        { label: 'Customer', value: labelOutward.customerName },
                        { label: 'Vehicle No', value: labelOutward.vehicleNo },
                        { label: 'Driver', value: labelOutward.driverName || 'N/A' },
                        { label: 'Dispatch Date', value: new Date(labelOutward.date).toLocaleDateString('en-IN') },
                        { label: 'Total Bags', value: `${labelOutward.totalBags} bags` },
                        { label: 'Total Weight', value: `${labelOutward.totalWeight.toLocaleString()} kg` },
                    ]}
                />
            )}
        </Box>
    );
};

export default OutwardEntry;
