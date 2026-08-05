import React, { useState, useEffect } from 'react';
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Chip,
    InputAdornment,
    LinearProgress,
    Alert,
    Checkbox,
    type SelectChangeEvent,
} from '@mui/material';
import {
    Save as SaveIcon,
    Email as EmailIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Refresh as RefreshIcon,
    WarningAmber as WarnIcon,
    MergeType as MergeIcon,
} from '@mui/icons-material';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { generatePDF } from '../utils/pdfGenerator';
import { generateExcel } from '../utils/excelGenerator';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import {
    validateBale,
    validateWeight,
    validateSupplier,
    validateDate,
    validateBaleAndWeight,
    isFutureDate,
    safeParseFloat,
} from '../utils/validators';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';
import { getDateRange as getStandardDateRange, type DateFilterType } from '../utils/dateFilters';
import GlassDatePicker from '../components/common/GlassDatePicker';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';
import RequiredLabel from '../components/common/RequiredLabel';
import ExportButtons from '../components/common/ExportButtons';


interface BatchEntry {
    id: number;
    batchId: string;
    date: string;
    supplier: string;
    bale: number;
    kg: number;
    entryTimestamp?: string;
    remainingKg?: number;
    remainingBale?: number;
    mergedFrom?: string;
    isMerged?: boolean;
}

interface InwardEntryProps {
    userRole?: string;
    username?: string;
}

const InwardEntry: React.FC<InwardEntryProps> = ({ userRole, username }) => {
    const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [openWizard, setOpenWizard] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        date: new Date().toLocaleDateString('en-CA'),
        supplier: '',
        bale: '',
        kg: '',
    });
    const [batchSuffix, setBatchSuffix] = useState('');
    const { confirm: confirmDialog } = useConfirm();
    const queryClient = useQueryClient();

    const dateRange = React.useMemo(() => getStandardDateRange(dateFilter, customFrom, customTo), [dateFilter, customFrom, customTo]);

    const { data: batchHistory = [], isLoading } = useQuery({
        queryKey: ['inwardHistory', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get('/inventory/inward', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            });
            return response.data;
        }
    });

    const suppliers = React.useMemo(() => {
        const uniqueSuppliers = new Set<string>();
        batchHistory.forEach((batch: BatchEntry) => {
            if (batch.supplier) uniqueSuppliers.add(batch.supplier);
        });
        return Array.from(uniqueSuppliers).sort();
    }, [batchHistory]);

    useEffect(() => { generateRandomSuffix(); }, []);

    const generateRandomSuffix = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let suffix = '';
        for (let i = 0; i < 3; i++) suffix += chars.charAt(Math.floor(Math.random() * chars.length));
        setBatchSuffix(suffix);
    };

    const getBatchPrefix = () => {
        if (!formData.date) return '';
        const [y, m] = formData.date.split('-');
        return `${y}${m}`;
    };

    const handleDateFilterChange = (event: SelectChangeEvent) => setDateFilter(event.target.value as DateFilterType);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleSupplierChange = (_event: any, newValue: string | null) => {
        setFormData(prev => ({ ...prev, supplier: newValue || '' }));
        setTouched(prev => ({ ...prev, supplier: true }));
    };

    // ─── Live Validation ───────────────────────────────────────────────────────
    const validations = {
        date: validateDate(formData.date),
        supplier: validateSupplier(formData.supplier),
        bale: validateBale(formData.bale),
        weight: validateWeight(formData.kg),
    };
    const baleWeightWarn = validateBaleAndWeight(formData.bale, formData.kg);
    const isFormValid = Object.values(validations).every(v => v.valid);

    const getFieldError = (field: keyof typeof validations) => {
        if (!touched[field]) return '';
        return validations[field].valid ? '' : (validations[field].message || '');
    };

    const markAllTouched = () => {
        setTouched({ date: true, supplier: true, bale: true, weight: true });
    };

    const handleDeleteBatch = async (id: number) => {
        const confirmed = await confirmDialog({
            title: CONFIRM_TITLES.DELETE,
            message: CONFIRM_MESSAGES.DELETE,
            severity: 'error',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/inventory/inward/${id}`);
            toast.success(SUCCESS_MESSAGES.DELETE);
            queryClient.invalidateQueries({ queryKey: ['inwardHistory'] });
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.DELETE_FAILED));
        }
    };

    const handleSubmit = async () => {
        markAllTouched();
        if (!isFormValid) {
            toast.error(ERROR_MESSAGES.VALIDATION_FAILED);
            return;
        }

        setIsSubmitting(true);
        try {
            const batchId = `${getBatchPrefix()}${batchSuffix}`;
            await api.post('/inventory/inward', {
                batchId,
                date: formData.date,
                supplier: formData.supplier.trim(),
                bale: Number(formData.bale),
                kg: safeParseFloat(formData.kg),
                createdBy: username,
            });

            queryClient.invalidateQueries({ queryKey: ['inwardHistory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryHistory'] });

            toast.success(SUCCESS_MESSAGES.INWARD_SAVED);
            queryClient.invalidateQueries({ queryKey: ['inwardHistory'] });
            setOpenWizard(false);
            setFormData({
                date: new Date().toLocaleDateString('en-CA'),
                supplier: '',
                bale: '',
                kg: '',
            });
            generateRandomSuffix();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMergeBatches = async () => {
        if (selectedBatches.length < 2) {
            toast.error('Select at least 2 batches to merge');
            return;
        }

        const confirmed = await confirmDialog({
            title: 'Merge Selected Batches',
            message: `Are you sure you want to merge these ${selectedBatches.length} batches? This will create a new inward batch and zero out their remaining stock.`,
            confirmText: 'Merge',
            cancelText: 'Cancel'
        });

        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            await api.post('/inventory/inward/merge', {
                batchIds: selectedBatches,
                date: new Date().toLocaleDateString('en-CA'),
                createdBy: username
            });
            toast.success('Batches merged successfully');
            setSelectedBatches([]);
            queryClient.invalidateQueries({ queryKey: ['inwardHistory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryHistory'] });
        } catch (error: any) {
            toast.error(formatApiError(error, 'Failed to merge batches'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf' | 'image') => {
        const data = batchHistory;
        if (data.length === 0) { toast.error(ERROR_MESSAGES.NO_DATA); return; }
        const filename = `Inward_Batch_Report_${new Date().toLocaleDateString('en-CA')}`;
        if (type === 'pdf') {
            const headers = ['Batch ID', 'Date', 'Supplier', 'Bale', 'Total Kg'];
            const rows = data.map((row: BatchEntry) => [row.batchId, new Date(row.date).toLocaleDateString(), row.supplier, row.bale, row.kg?.toLocaleString() || '0']);
            generatePDF('Inward Batch History', headers, rows, filename);
            toast.success(SUCCESS_MESSAGES.EXPORT_PDF);
        } else if (type === 'excel') {
            const excelData = data.map((row: BatchEntry) => ({ 'Batch ID': row.batchId, Date: new Date(row.date).toLocaleDateString(), Supplier: row.supplier, Bale: row.bale, 'Total Kg': row.kg }));
            generateExcel(excelData, filename);
            toast.success(SUCCESS_MESSAGES.EXPORT_EXCEL);
        } else {
            window.location.href = `mailto:?subject=${encodeURIComponent(`Inward Report ${new Date().toLocaleDateString()}`)}&body=${encodeURIComponent('Please find the attached Inward Batch Report.')}`;
        }
    };

    // ─── Summary Stats ─────────────────────────────────────────────────────────
    const totalBales = batchHistory.reduce((s: number, b: BatchEntry) => s + b.bale, 0);
    const totalKg = batchHistory.reduce((s: number, b: BatchEntry) => s + b.kg, 0);

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'flex-start' },
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                        Inward Batch Entry
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Track cotton bale receipts and update inventory automatically
                    </Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' }
                }}>
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 180 } }} size="small">
                        <InputLabel>Date Filter</InputLabel>
                        <Select value={dateFilter} label="Date Filter" onChange={handleDateFilterChange}>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="yesterday">Yesterday</MenuItem>
                            <MenuItem value="week">Past Week</MenuItem>
                            <MenuItem value="month">Past Month</MenuItem>
                            <MenuItem value="3months">Past 3 Months</MenuItem>
                            <MenuItem value="6months">Past 6 Months</MenuItem>
                            <MenuItem value="year">Past Year</MenuItem>
                            <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                    </FormControl>
                    {dateFilter === 'custom' && (
                        <>
                            <GlassDatePicker
                                label="From"
                                size="small"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: { xs: '100%', sm: 145 } }}
                            />
                            <GlassDatePicker
                                label="To"
                                size="small"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: { xs: '100%', sm: 145 } }}
                            />
                        </>
                    )}
                    {(userRole === 'AUTHOR' || userRole === 'MODIFIER' || userRole === 'ADMIN') && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {selectedBatches.length > 1 && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<MergeIcon />}
                                    onClick={handleMergeBatches}
                                    sx={{ height: 40 }}
                                    disabled={isSubmitting}
                                >
                                    Merge ({selectedBatches.length})
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenWizard(true)}
                                sx={{ height: 40, width: { xs: '100%', sm: 'auto' } }}
                            >
                                Add Batch
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Summary Strip */}
            {batchHistory.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Chip label={`${batchHistory.length} Batches`} color="default" variant="outlined" />
                    <Chip label={`${totalBales.toLocaleString()} Bales`} color="primary" variant="outlined" />
                    <Chip label={`${totalKg.toLocaleString()} kg Cotton`} color="success" variant="filled" sx={{ fontWeight: 700 }} />
                </Box>
            )}

            {/* Add Batch Dialog */}
            <Dialog
                open={openWizard}
                onClose={() => { setOpenWizard(false); setTouched({}); }}
                maxWidth="sm"
                fullWidth
                aria-labelledby="add-batch-dialog-title"
                aria-describedby="add-batch-dialog-description"
            >
                <DialogTitle id="add-batch-dialog-title" sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                    <Box>
                        Add Cotton Batch
                        <Typography id="add-batch-dialog-description" variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 400 }}>
                            All fields are required. Inventory updates automatically.
                        </Typography>
                    </Box>
                    <IconButton onClick={() => { setOpenWizard(false); setTouched({}); }} aria-label="Close dialog"><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {isSubmitting && <LinearProgress sx={{ mb: 2 }} />}

                    {/* Batch ID Preview */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1 }}>
                            Batch ID Preview
                        </Typography>
                        <Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: 2, mt: 0.5 }}>
                            {getBatchPrefix()}<Box component="span" sx={{ color: 'primary.main' }}>{batchSuffix}</Box>
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <GlassDatePicker
                                label={<RequiredLabel label="Date" required />}
                                name="date"
                                value={formData.date}
                                onChange={(e: any) => handleInputChange(e)}
                                onBlur={() => setTouched(p => ({ ...p, date: true }))}
                                required
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                error={!!getFieldError('date')}
                                helperText={getFieldError('date') || (isFutureDate(formData.date) ? '⚠️ Future date not allowed' : ' ')}
                            />
                            <TextField
                                label="Batch Suffix"
                                value={batchSuffix}
                                onChange={(e) => setBatchSuffix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
                                helperText="3-char alphanumeric"
                                InputProps={{
                                    endAdornment: (
                                        <Tooltip title="Regenerate random suffix">
                                            <IconButton size="small" onClick={generateRandomSuffix}>
                                                <RefreshIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )
                                }}
                                sx={{ width: 180, flexShrink: 0 }}
                            />
                        </Box>

                        <Autocomplete
                            freeSolo
                            options={suppliers}
                            value={formData.supplier}
                            onChange={handleSupplierChange}
                            onInputChange={(_e, val) => { setFormData(p => ({ ...p, supplier: val })); setTouched(p => ({ ...p, supplier: true })); }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label={<RequiredLabel label="Supplier Name" required />}
                                    required
                                    error={!!getFieldError('supplier')}
                                    helperText={getFieldError('supplier') || 'Type to search existing suppliers or enter a new name'}
                                    onBlur={() => setTouched(p => ({ ...p, supplier: true }))}
                                />
                            )}
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label={<RequiredLabel label="Total Bales" required />}
                                name="bale"
                                type="number"
                                value={formData.bale}
                                onChange={handleInputChange}
                                onBlur={() => setTouched(p => ({ ...p, bale: true }))}
                                required
                                fullWidth
                                InputProps={{ inputProps: { min: 1, step: 1 } }}
                                error={!!getFieldError('bale')}
                                helperText={getFieldError('bale') || 'Whole number (1–9999)'}
                            />
                            <TextField
                                label={<RequiredLabel label="Total Weight (kg)" required />}
                                name="kg"
                                type="number"
                                value={formData.kg}
                                onChange={handleInputChange}
                                onBlur={() => setTouched(p => ({ ...p, weight: true }))}
                                required
                                fullWidth
                                InputProps={{
                                    inputProps: { min: 0.01, step: 0.01 },
                                    endAdornment: <InputAdornment position="end">kg</InputAdornment>
                                }}
                                error={!!getFieldError('weight')}
                                helperText={
                                    getFieldError('weight') ||
                                    (formData.bale && formData.kg
                                        ? `Avg: ${(safeParseFloat(formData.kg) / safeParseFloat(formData.bale)).toFixed(1)} kg/bale`
                                        : '0.01–999,999 kg')
                                }
                            />
                        </Box>

                        {/* Avg bale weight warning */}
                        {formData.bale && formData.kg && !baleWeightWarn.valid === false && baleWeightWarn.message && (
                            <Alert severity="warning" icon={<WarnIcon />} sx={{ mt: -1 }}>
                                {baleWeightWarn.message}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: 'divider', gap: 1 }}>
                    <Button onClick={() => { setOpenWizard(false); setTouched({}); }} color="inherit" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{ minWidth: 140 }}
                    >
                        {isSubmitting ? 'Saving...' : 'Add Batch'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Batch History Table */}
            <Paper sx={{ borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Batch History
                        {isLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <ExportButtons
                            onEmail={() => handleExport('email')}
                            onExcel={() => handleExport('excel')}
                            onPdf={() => handleExport('pdf')}
                            size="small"
                        />
                    </Box>
                </Box>

                <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
                    {isLoading ? (
                        <TableSkeleton columns={7} hasActions={userRole === 'AUTHOR'} />
                    ) : (
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            indeterminate={selectedBatches.length > 0 && selectedBatches.length < batchHistory.length}
                                            checked={batchHistory.length > 0 && selectedBatches.length === batchHistory.length}
                                            onChange={(e) => setSelectedBatches(e.target.checked ? batchHistory.map((b: any) => b.batchId) : [])}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Batch ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Supplier</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Orig Bales</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Orig Kg</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Rem Bales</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Rem Kg</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5, bgcolor: 'background.paper' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {batchHistory.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} sx={{ py: 4 }}>
                                            <EmptyState
                                                type="empty"
                                                title="No Batches Found"
                                                message="No inward batches found for the selected period. Try changing the date filter or add a new batch."
                                                actionLabel="Add First Batch"
                                                onAction={() => setOpenWizard(true)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    batchHistory.map((row: BatchEntry) => (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            className="anim-slide-fade"
                                            sx={{
                                                '&:hover': { bgcolor: 'action.hover' },
                                                animationDelay: `${Math.min(0, 0)}ms`,
                                            }}
                                            selected={selectedBatches.includes(row.batchId)}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedBatches.includes(row.batchId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setSelectedBatches([...selectedBatches, row.batchId]);
                                                        else setSelectedBatches(selectedBatches.filter(id => id !== row.batchId));
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                                    <Tooltip 
                                                        title={row.mergedFrom ? `Merged from: ${row.mergedFrom}` : ''}
                                                        arrow 
                                                        placement="top"
                                                    >
                                                        <Chip
                                                            label={row.batchId}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontFamily: 'monospace',
                                                                fontWeight: 700,
                                                                fontSize: '0.78rem',
                                                                letterSpacing: '0.02em',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                borderColor: row.isMerged || row.batchId.startsWith('MB-')
                                                                    ? 'rgba(99,102,241,0.5)'
                                                                    : 'divider',
                                                                color: row.isMerged || row.batchId.startsWith('MB-') ? '#6366f1' : 'text.primary',
                                                                transition: 'all 0.18s ease',
                                                                animation: (row.isMerged || row.batchId.startsWith('MB-')) ? 'pulse 2s infinite' : 'none',
                                                                '@keyframes pulse': {
                                                                    '0%': { boxShadow: '0 0 0 0 rgba(99,102,241, 0.4)' },
                                                                    '70%': { boxShadow: '0 0 0 6px rgba(99,102,241, 0)' },
                                                                    '100%': { boxShadow: '0 0 0 0 rgba(99,102,241, 0)' }
                                                                },
                                                                '&:hover': { transform: 'scale(1.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' },
                                                            }}
                                                            onClick={() => {
                                                                navigator.clipboard?.writeText(row.batchId);
                                                                toast.success(`Batch ID ${row.batchId} copied!`, { duration: 1500 });
                                                            }}
                                                        />
                                                    </Tooltip>
                                                    {(row.isMerged || row.batchId.startsWith('MB-')) && (
                                                        <span className="merged-badge">⊕ merged</span>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={`Entry recorded: ${row.entryTimestamp ? new Date(row.entryTimestamp).toLocaleString() : 'N/A'}`} arrow>
                                                    <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dashed', borderColor: 'text.disabled' }}>
                                                        {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{row.supplier}</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary' }}>{row.bale}</TableCell>
                                            <TableCell align="right" sx={{ color: 'text.secondary' }}>
                                                {row.kg?.toLocaleString()} kg
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {row.remainingBale ?? row.bale}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                                {(row.remainingKg ?? row.kg).toLocaleString()} kg
                                            </TableCell>
                                            <TableCell align="center">
                                                {(userRole === 'AUTHOR' || userRole === 'ADMIN') && (
                                                    <Tooltip title="Delete Batch (Admin only)">
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteBatch(row.id)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {/* Footer totals */}
                {batchHistory.length > 0 && (
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <Typography variant="body2" color="text.secondary">
                            Showing <strong>{batchHistory.length}</strong> batches
                        </Typography>
                        <Typography variant="body2">
                            Total Bales: <strong>{totalBales.toLocaleString()}</strong>
                        </Typography>
                        <Typography variant="body2" color="success.main">
                            Total Weight: <strong>{totalKg.toLocaleString()} kg</strong>
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default InwardEntry;
