import { dateKey } from '../utils/dateKey';
import { uiText, useUiLanguage, uiLocale, formatUiDecimal, uiTemplate, uiDateLocale, uiScopedTemplate } from "../i18n";
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
    Dialog,
    DialogContent,
    Stepper,
    Step,
    StepLabel,
    Tabs,
    Tab,
    Tooltip,
    LinearProgress,
    Chip,
    Stack,
    Divider,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    ArrowBack as BackIcon,
    ArrowForward as NextIcon,
    Email as EmailIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon,
    QrCode2 as QrIcon,
    PrecisionManufacturingOutlined,
} from '@mui/icons-material';
import BarcodeQRModal from '../components/common/BarcodeQRModal';
import { formatBagCode, formatDateCompact, padZero } from '../utils/codeFormatters';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { generateExcel } from '../utils/excelGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';
import { handleDeleteGuardError, type DeleteGuardErrorPayload } from '../utils/deleteGuardHandler';
import { localTimeValue, productionTimestamp } from '../utils/productionTiming';
import ProductionTimingAlert from '../components/common/ProductionTimingAlert';
import { validateDate } from '../utils/validators';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';
import GlassDatePicker from '../components/common/GlassDatePicker';
import ExportButtons from '../components/common/ExportButtons';
import EntryWizardHeader, { EntrySummary, SummaryValue } from '../components/common/EntryWizardHeader';
import { getDateRange as getStandardDateRange, DATE_FILTER_OPTIONS_WITH_ALL, type DateFilterType } from '../utils/dateFilters';

interface ConsumptionItem {
    id: number;
    batchNo: string;
    bale: string;
    weight: string;
}

interface ProductionItem {
    id: number;
    count: string;
    weight: string;
    bags: number;
    remainingLog: number;
}

interface WasteBreakdown {
    blowRoom: string;
    carding: string;
    oe: string;
    others: string;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
  useUiLanguage();
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

const BAG_WEIGHT_KG = 60;

interface ProductionEntryProps {
    userRole?: string;
    username?: string;
}

const ProductionEntry: React.FC<ProductionEntryProps> = ({ userRole, username }) => {
  useUiLanguage();
    const queryClient = useQueryClient();

    // Date Filtering State
    const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const dateRange = React.useMemo(() => getStandardDateRange(dateFilter, customFrom, customTo), [dateFilter, customFrom, customTo]);

    const { data: recentProduction, refetch: refetchProduction, isLoading } = useQuery({
        queryKey: ['productionHistory', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get('/production', {
                params: { from: dateRange.from, to: dateRange.to }
            });
            return response.data;
        },
    });

    const [date, setDate] = useState(dateKey());
    const [startTime, setStartTime] = useState(() => localTimeValue());
    const [timingError, setTimingError] = useState<DeleteGuardErrorPayload | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const startTimeInput = React.useRef<HTMLInputElement>(null);
    const [editStartRequest, setEditStartRequest] = useState(0);
    const [labelProduction, setLabelProduction] = useState<any | null>(null);

    const { data: availableBatches = [], isFetching: isFetchingBatches } = useQuery({
        queryKey: ['availableBatches', date],
        queryFn: async () => {
            const response = await api.get('/inventory/available-batches', { params: { date } });
            return response.data;
        },
    });

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data;
        }
    });

    const { data: yarnStock } = useQuery({
        queryKey: ['yarnStock', date],
        queryFn: async () => {
            const response = await api.get('/inventory/yarn-stock', { params: { date } });
            return response.data;
        },
    });
    const [openWizard, setOpenWizard] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [outputTab, setOutputTab] = useState(0);

    React.useEffect(() => {
        if (activeStep === 0 && editStartRequest > 0) startTimeInput.current?.focus();
    }, [activeStep, editStartRequest]);

    const [consumed, setConsumed] = useState<ConsumptionItem[]>([
        { id: 1, batchNo: '', bale: '', weight: '' },
    ]);

    const [produced, setProduced] = useState<ProductionItem[]>([
        { id: 1, count: '2', weight: '', bags: 0, remainingLog: 0 },
    ]);

    const [waste, setWaste] = useState<WasteBreakdown>({
        blowRoom: '',
        carding: '',
        oe: '',
        others: '',
    });

    // Intermediate material (sliver, roving, etc. — not finished yarn, not waste)
    const [intermediate, setIntermediate] = useState<string>('');
    const [processingCost, setProcessingCost] = useState('');
    const { confirm: confirmDialog } = useConfirm();


    const getAvailableConsumption = (batchNo: string) => {
        const batch = availableBatches.find((b: any) => b.batchId === batchNo);
        return {
            bale: batch?.bale || 0,
            weight: batch?.kg || 0,
        };
    };

    const steps = ['Input (Cotton Consumption)', 'Output (Yarn & Waste)'];

    // Consumed handlers
    const handleConsumedChange = (id: number, field: keyof ConsumptionItem, value: any) => {
        if (field === 'batchNo') setTimingError(null);
        setConsumed(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                // Auto validation logic can go here if needed per field change
                return updatedItem;
            }
            return item;
        }));
    };

    const addConsumed = () => {
        const nextId = Math.max(...consumed.map(i => i.id), 0) + 1;
        setConsumed([...consumed, { id: nextId, batchNo: '', bale: '', weight: '' }]);
    };

    const removeConsumed = (id: number) => {
        if (consumed.length > 1) {
            setConsumed(prev => prev.filter(item => item.id !== id));
        }
    };

    // Produced handlers
    const handleProducedChange = (id: number, field: keyof ProductionItem, value: any) => {
        setProduced(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'weight') {
                    const weightNum = parseFloat(value) || 0;
                    updated.bags = Math.floor(weightNum / BAG_WEIGHT_KG);
                    updated.remainingLog = weightNum % BAG_WEIGHT_KG;
                }
                return updated;
            }
            return item;
        }));
    };

    const addProduced = () => {
        const nextId = Math.max(...produced.map(i => i.id), 0) + 1;
        setProduced([...produced, { id: nextId, count: '2', weight: '', bags: 0, remainingLog: 0 }]);
    };

    const removeProduced = (id: number) => {
        if (produced.length > 1) {
            setProduced(prev => prev.filter(item => item.id !== id));
        }
    };

    // Waste handlers
    const handleWasteChange = (field: keyof WasteBreakdown, value: string) => {
        setWaste(prev => ({ ...prev, [field]: value }));
    };

    const getTotalConsumed = () => {
        return consumed.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
    };

    const getTotalProduced = () => {
        return produced.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
    };

    const getTotalWaste = () => {
        return Object.values(waste).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    };

    const getTotalIntermediate = () => parseFloat(intermediate) || 0;

    const validateStart = () => {
        const timestamp = productionTimestamp(date, startTime);
        if (!timestamp) { toast.error(uiText('Enter a valid production date and start time', 'feedback')); return null; }
        if (new Date(timestamp).getTime() > Date.now()) { toast.error(uiText('Production cannot start in the future', 'feedback'), { description: 'Choose the time the run actually started.' }); return null; }
        return timestamp;
    };

    const checkBatchTiming = (timestamp: string) => {
        for (const item of consumed) {
            const batch = availableBatches.find((b: any) => b.batchId === item.batchNo);
            const earliest = batch?.earliestStartAt;
            if (earliest && new Date(timestamp).getTime() < new Date(earliest).getTime()) {
                setTimingError({ code: 'PRODUCTION_TOO_EARLY', trace: { batchNo: item.batchNo }, inwardReceivedAt: batch.receivedAt, earliestStartAt: earliest });
                return false;
            }
        }
        setTimingError(null);
        setEditStartRequest(0);
        return true;
    };

    const handleNext = () => {
        if (activeStep === 0) {
            const dateCheck = validateDate(date, false);
            if (!dateCheck.valid) { toast.error(dateCheck.message); return; }
            const timestamp = validateStart();
            if (!timestamp) return;

            // Validate input
            const hasValidInput = consumed.some(item => item.batchNo && parseFloat(item.weight) > 0 && parseFloat(item.bale) > 0);
            if (!hasValidInput) {
                toast.error(ERROR_MESSAGES.INVALID_INPUT);
                return;
            }

            // Track cumulative consumption per batch
            const batchConsumption: Record<string, { totalBales: number; totalWeight: number }> = {};

            // Calculate total consumption for each batch
            consumed.forEach(item => {
                if (item.batchNo) {
                    if (!batchConsumption[item.batchNo]) {
                        batchConsumption[item.batchNo] = { totalBales: 0, totalWeight: 0 };
                    }
                    batchConsumption[item.batchNo].totalBales += parseFloat(item.bale) || 0;
                    batchConsumption[item.batchNo].totalWeight += parseFloat(item.weight) || 0;
                }
            });

            // Validate cumulative consumption against batch limits
            for (const [batchNo, consumption] of Object.entries(batchConsumption)) {
                const selectedBatch = availableBatches.find((b: any) => b.batchId === batchNo);
                const maxBale = selectedBatch?.bale || 0;
                const maxWeight = selectedBatch?.kg || 0;

                if (maxBale > 0 ? consumption.totalBales <= 0 || consumption.totalBales > maxBale : consumption.totalBales !== 0) {
                    toast.error(`Batch ${batchNo}: ${consumption.totalBales} bales entered; ${maxBale} available. Enter a positive quantity within the available stock.`);
                    return;
                }

                if (consumption.totalWeight <= 0 || consumption.totalWeight > maxWeight) {
                    toast.error(`Batch ${batchNo}: ${consumption.totalWeight.toFixed(2)} kg entered; ${maxWeight.toFixed(2)} kg available. Enter a positive weight within the available stock.`);
                    return;
                }
            }
            if (!checkBatchTiming(timestamp)) return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSave = async () => {
        if (isSaving) return;
        const timestamp = validateStart();
        if (!timestamp || !checkBatchTiming(timestamp)) return;
        try {
            const totalConsumed = getTotalConsumed();
            const totalProduced = getTotalProduced();
            const totalWaste = getTotalWaste();
            const totalIntermediate = getTotalIntermediate();
            const balance = totalConsumed - totalProduced - totalWaste - totalIntermediate;

            if (Math.abs(balance) > 0.01) {
                toast.error(`Material balance differs by ${balance.toFixed(2)} kg. Cotton must equal yarn + waste + intermediate, within 0.01 kg.`);
                return;
            }

            const productionData = {
                date: timestamp,
                consumed: consumed.filter(item => item.batchNo && parseFloat(item.weight) > 0),
                produced: produced.filter(item => parseFloat(item.weight) > 0),
                waste,
                intermediate: getTotalIntermediate(),
                totalConsumed,
                totalProduced,
                totalWaste,
                totalIntermediate,
                processingCost: Number(processingCost || 0),
                createdBy: username,
            };

            setIsSaving(true);
            await api.post('/production', productionData);
            toast.success(SUCCESS_MESSAGES.PRODUCTION_SAVED);
            refetchProduction();
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryHistory'] });
            queryClient.invalidateQueries({ queryKey: ['yarnStock'] });
            queryClient.invalidateQueries({ queryKey: ['cottonInventory'] });
            handleCloseWizard();
        } catch (error: any) {
            if (error?.response?.data?.code === 'PRODUCTION_TOO_EARLY') {
                setTimingError(error.response.data);
            } else {
                handleDeleteGuardError(error, ERROR_MESSAGES.SAVE_FAILED);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduction = async (id: number) => {
        const confirmed = await confirmDialog({
            title: CONFIRM_TITLES.DELETE_PRODUCTION,
            message: CONFIRM_MESSAGES.DELETE_PRODUCTION,
            severity: 'error',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (!confirmed) return;

        try {
            await api.delete(`/production/${id}`);
            toast.success(SUCCESS_MESSAGES.DELETE);
            refetchProduction();
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryHistory'] });
            queryClient.invalidateQueries({ queryKey: ['yarnStock'] });
            queryClient.invalidateQueries({ queryKey: ['cottonInventory'] });
        } catch (error: any) {
            handleDeleteGuardError(error, ERROR_MESSAGES.DELETE_FAILED);
        }
    };

    const handleCloseWizard = () => {
        if (isSaving) return;
        setOpenWizard(false);
        setActiveStep(0);
        setOutputTab(0);
        setConsumed([{ id: 1, batchNo: '', bale: '', weight: '' }]);
        setProduced([{ id: 1, count: '2', weight: '', bags: 0, remainingLog: 0 }]);
        setWaste({ blowRoom: '', carding: '', oe: '', others: '' });
        setIntermediate('');
        setProcessingCost('');
        setDate(dateKey());
        setStartTime(localTimeValue());
        setTimingError(null);
        setEditStartRequest(0);
    };

    const handleOpenWizard = () => {
        setStartTime(localTimeValue());
        setTimingError(null);
        setOpenWizard(true);
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf' | 'image') => {
        const data = recentProduction || [];
        if (data.length === 0) {
            toast.error(ERROR_MESSAGES.NO_DATA);
            return;
        }

        const filename = `Production_Report_${new Date().toISOString().split('T')[0]}`;

        if (type === 'pdf') {
            const headers = ['Date', 'Consumed (kg)', 'Produced (kg)', 'Waste (kg)', 'Efficiency (%)'];
            const rows = data.map((row: any) => [
                new Date(row.date).toLocaleDateString(uiDateLocale()),
                row.totalConsumed,
                row.totalProduced,
                row.totalWaste,
                ((row.totalProduced / row.totalConsumed) * 100).toFixed(2) + '%'
            ]);
            generatePDF('Production Report', headers, rows, filename);
        } else if (type === 'excel') {
            const excelData = data.map((row: any) => ({
                Date: new Date(row.date).toLocaleDateString(uiDateLocale()),
                'Consumed (kg)': row.totalConsumed,
                'Produced (kg)': row.totalProduced,
                'Waste (kg)': row.totalWaste,
                'Efficiency (%)': ((row.totalProduced / row.totalConsumed) * 100).toFixed(2) + '%'
            }));
            generateExcel(excelData, filename);
        } else if (type === 'email') {
            const subject = encodeURIComponent(`Production Report: ${new Date().toISOString().split('T')[0]}`);
            const body = encodeURIComponent(`Please find the attached Production Report.\n\n(Note: Please export and attach the PDF/Excel file manually)`);
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
        }
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {uiText("Production / Mixing ")}{isLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>{uiText("Date Filter", 'forms')}</InputLabel>
                        <Select
                            value={dateFilter}
                            label={uiText("Date Filter", 'forms')}
                            onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                        >
                            {DATE_FILTER_OPTIONS_WITH_ALL.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{uiText(opt.label, 'forms')}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {dateFilter === 'custom' && (
                        <>
                            <GlassDatePicker
                                label={uiText("From", 'forms')}
                                size="small"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                            />
                            <GlassDatePicker
                                label={uiText("To", 'forms')}
                                size="small"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                            />
                        </>
                    )}

                    <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', md: 'block' } }} />

                    <ExportButtons onExport={handleExport} />
                    {userRole !== 'VIEWER' && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenWizard}
                        >
                            {uiText("Add Production ")}</Button>
                    )}
                </Box>
            </Box>

            {/* Production History Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Date", 'tables')}</TableCell>
                            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Batch ID(s)", 'tables')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Consumed (kg)", 'tables')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Produced (kg)", 'tables')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Waste (kg)", 'tables')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Intermediate (kg)", 'tables')}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Efficiency (%)", 'tables')}</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>{uiText("Actions", 'tables')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <TableSkeleton columns={8} />
                                </TableCell>
                            </TableRow>
                        ) : !recentProduction || recentProduction.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} sx={{ py: 4 }}>
                                    <EmptyState
                                        type="empty"
                                        title={uiText("No Production Entries", 'tables')}
                                        message="No production entries found. Start by adding a new production entry."
                                        actionLabel={userRole !== 'VIEWER' ? "Add Production" : undefined}
                                        onAction={userRole !== 'VIEWER' ? handleOpenWizard : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            recentProduction.map((row: any) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Tooltip title={row.entryTimestamp ? new Date(row.entryTimestamp).toLocaleString(uiLocale()) : new Date(row.date).toLocaleString(uiLocale())} arrow placement="top">
                                            <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                {new Date(row.date).toLocaleDateString(uiDateLocale())}
                                            </Box>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {(row.consumedBatches || []).map((b: any) => (
                                                <Chip
                                                    key={b.batchNo}
                                                    label={b.batchNo}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem', height: 20, fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{row.totalConsumed}</TableCell>
                                    <TableCell align="right">{row.totalProduced}</TableCell>
                                    <TableCell align="right">{row.totalWaste}</TableCell>
                                    <TableCell align="right">{row.totalIntermediate || 0}</TableCell>
                                    <TableCell align="right">
                                        {formatUiDecimal(((row.totalProduced / row.totalConsumed) * 100), 2)}%
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                            <Tooltip title={uiText("Print Production & Yarn Label (Barcode & QR)", 'tables')}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => setLabelProduction(row)}
                                                    aria-label={uiText("Generate QR and Barcode Label", 'tables')}
                                                >
                                                    <QrIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {(userRole === 'ADMIN') && (
                                                <Tooltip title={uiText("Delete Entry", 'tables')}>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteProduction(row.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Production Entry Wizard */}
            <Dialog
                open={openWizard}
                onClose={handleCloseWizard}
                maxWidth="lg"
                fullWidth
                aria-labelledby="production-wizard-title"
                aria-describedby="production-wizard-title-description"
            >
                <EntryWizardHeader id="production-wizard-title" stage="02 · Production" title={uiText("Production Entry")}
                    description="Follow cotton from the selected batches through yarn, waste, and material still in process."
                    icon={<PrecisionManufacturingOutlined />} busy={isSaving} onClose={handleCloseWizard} />
                <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box component="fieldset" disabled={isSaving} sx={{ mt: 2, mx: 0, p: 0, border: 0, minWidth: 0 }}>
                        {isSaving && <LinearProgress sx={{ mb: 2 }} />}
                        {timingError && <ProductionTimingAlert error={timingError} busy={isSaving} onEdit={() => { setActiveStep(0); setEditStartRequest(request => request + 1); }} />}
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{uiText(label, 'forms')}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Step 1: Input (Cotton Consumption) */}
                        {activeStep === 0 && (
                            <Box>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                                    <TextField type="date" label={uiText("Production Date", 'forms')} value={date} size="small" fullWidth
                                        onChange={e => { setDate(e.target.value); setTimingError(null); }} InputLabelProps={{ shrink: true }} />
                                    <TextField type="time" label={uiText("Production start time", 'forms')} value={startTime} size="small" fullWidth
                                        inputRef={startTimeInput}
                                        onChange={e => { setStartTime(e.target.value); setTimingError(null); }} InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 1 }} helperText={uiText("Local time the run started; checked against batch receipt.", 'forms')} />
                                </Stack>

                                <Alert severity="info" sx={{ mb: 3, borderRadius: '12px', fontSize: '0.85rem' }}>
                                    {uiText("Choose cotton available on the production date and allow at least 61 seconds after receipt before starting production. Before saving, account for the full input as yarn, waste, or intermediate material; the balance must be within 0.01 kg. ")}</Alert>

                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    {uiText("Cotton Consumption ")}</Typography>

                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{uiText("Batch No", 'tables')}</TableCell>
                                                <TableCell>{uiText("Bale", 'tables')}</TableCell>
                                                <TableCell>{uiText("Weight (kg)", 'tables')}</TableCell>
                                                <TableCell width={50}></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {consumed.map((item) => {
                                                const selectedBatch = availableBatches.find((b: any) => b.batchId === item.batchNo);
                                                const maxBale = selectedBatch?.bale || 0;
                                                const maxWeight = selectedBatch?.kg || 0;
                                                const baleVal = parseFloat(item.bale) || 0;
                                                const weightVal = parseFloat(item.weight) || 0;

                                                return (
                                                    <TableRow key={item.id}>
                                                        <TableCell sx={{ minWidth: 200 }}>
                                                            <TextField
                                                                select
                                                                size="small"
                                                                value={item.batchNo}
                                                                onChange={(e) => handleConsumedChange(item.id, 'batchNo', e.target.value)}
                                                                fullWidth
                                                                label={uiText("Select Batch", 'forms')}
                                                            >
                                                                {availableBatches.map((b: any) => (
                                                                    <MenuItem key={b.batchId} value={b.batchId}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                                                            <span><strong>{b.batchId}</strong> — {b.supplier}</span>
                                                                            <Chip label={uiScopedTemplate('forms')`${formatUiDecimal(b.kg, 0)} kg left`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                                                                        </Box>
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
                                                            {/* Per-batch usage info card */}
                                                            {item.batchNo && (() => {
                                                                const b = availableBatches.find((x: any) => x.batchId === item.batchNo);
                                                                if (!b) return null;
                                                                const usedPct = b.originalKg > 0 ? ((b.usedKg / b.originalKg) * 100) : 0;
                                                                return (
                                                                    <Box sx={{
                                                                        mt: 0.75, p: 1, borderRadius: 1,
                                                                        bgcolor: 'action.hover',
                                                                        border: '1px solid',
                                                                        borderColor: 'divider',
                                                                        fontSize: '0.72rem'
                                                                    }}>
                                                                        <Stack direction="row" spacing={1.5} divider={<Divider orientation="vertical" flexItem />}>
                                                                            <Box sx={{ textAlign: 'center' }}>
                                                                                <Typography variant="caption" color="text.secondary" display="block">{uiText("Original")}</Typography>
                                                                                <Typography variant="caption" fontWeight={700}>{b.originalBale} {uiText(" bales / ")}{b.originalKg} {uiText(" kg")}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ textAlign: 'center' }}>
                                                                                <Typography variant="caption" color="warning.main" display="block">{uiText("Used")}</Typography>
                                                                                <Typography variant="caption" fontWeight={700} color="warning.main">{b.usedBale} {uiText(" bales / ")}{b.usedKg} {uiText(" kg")}</Typography>
                                                                            </Box>
                                                                            <Box sx={{ textAlign: 'center' }}>
                                                                                <Typography variant="caption" color="success.main" display="block">{uiText("Remaining")}</Typography>
                                                                                <Typography variant="caption" fontWeight={700} color="success.main">{b.bale} {uiText(" bales / ")}{formatUiDecimal(b.kg, 2)} {uiText(" kg")}</Typography>
                                                                            </Box>
                                                                        </Stack>
                                                                    </Box>
                                                                );
                                                            })()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={item.bale}
                                                                onChange={(e) => handleConsumedChange(item.id, 'bale', e.target.value)}
                                                                label={uiText("Bales consumed", 'forms')}
                                                                InputProps={{ endAdornment: <InputAdornment position="end">{uiText("bales", 'forms')}</InputAdornment> }}
                                                                fullWidth
                                                                error={baleVal > maxBale || baleVal <= 0}
                                                                helperText={item.batchNo ? uiScopedTemplate('forms')`Max: ${maxBale}` : ''}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={item.weight}
                                                                onChange={(e) => handleConsumedChange(item.id, 'weight', e.target.value)}
                                                                label={uiText("Cotton weight", 'forms')}
                                                                InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                                                fullWidth
                                                                error={weightVal > maxWeight || weightVal <= 0}
                                                                helperText={item.batchNo ? uiScopedTemplate('forms')`Max: ${maxWeight} kg` : ''}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                aria-label={uiText("Remove cotton row", 'tables')}
                                                                onClick={() => removeConsumed(item.id)}
                                                                disabled={consumed.length === 1}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addConsumed}
                                    sx={{ mt: 2 }}
                                >
                                    {uiText("Add Row ")}</Button>

                                <EntrySummary title={uiText("Cotton selected for this run")}>
                                    <SummaryValue label={uiText("Batches")} value={new Set(consumed.filter(item => item.batchNo).map(item => item.batchNo)).size} />
                                    <SummaryValue label={uiText("Bales consumed")} value={consumed.reduce((sum, item) => sum + (parseFloat(item.bale) || 0), 0)} />
                                    <SummaryValue label={uiText("Total consumed")} value={`${getTotalConsumed().toFixed(2)} kg`} />
                                </EntrySummary>
                            </Box>
                        )}

                        {/* Step 2: Output (Yarn Production & Waste) */}
                        {activeStep === 1 && (
                            <Box>
                                <Paper sx={{ mb: 3 }}>
                                    <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)} variant="scrollable" scrollButtons="auto" aria-label={uiText("Production output categories")}>
                                        <Tab label={uiText("Yarn Production", 'tabs')} />
                                        <Tab label={uiText("Waste Breakdown", 'tabs')} />
                                        <Tab label={uiText("Intermediate", 'tabs')} />
                                    </Tabs>

                                    <TabPanel value={outputTab} index={0}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            {uiText("Yarn Production ")}</Typography>

                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>{uiText("Count", 'tables')}</TableCell>
                                                        <TableCell>{uiText("Weight (kg)", 'tables')}</TableCell>
                                                        <TableCell>{uiText("Bags (60kg)", 'tables')}</TableCell>
                                                        <TableCell>{uiText("Remaining (kg)", 'tables')}</TableCell>
                                                        <TableCell width={50}></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {produced.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>
                                                                <TextField
                                                                    select
                                                                    size="small"
                                                                    value={item.count}
                                                                    label={uiText("Yarn count", 'forms')}
                                                                    onChange={(e) => handleProducedChange(item.id, 'count', e.target.value)}
                                                                    fullWidth
                                                                >
                                                                    {(() => {
                                                                        const counts = settings?.supportedCounts
                                                                            ? settings.supportedCounts.split(',').map((c: string) => c.trim()).filter(Boolean)
                                                                            : ['2', '4', '6', '8', '10', '12', '14', '16', '20'];

                                                                        return counts.map((c: string) => (
                                                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                                                        ));
                                                                    })()}
                                                                </TextField>
                                                            </TableCell>
                                                            <TableCell>
                                                                <TextField
                                                                    size="small"
                                                                    type="number"
                                                                    value={item.weight}
                                                                    label={uiText("Yarn weight", 'forms')}
                                                                    InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                                                    onChange={(e) => handleProducedChange(item.id, 'weight', e.target.value)}
                                                                    fullWidth
                                                                />
                                                            </TableCell>
                                                            <TableCell>{item.bags}</TableCell>
                                                            <TableCell>{formatUiDecimal(item.remainingLog, 2)}</TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    size="small"
                                                                    aria-label={uiText("Remove yarn row", 'tables')}
                                                                    onClick={() => removeProduced(item.id)}
                                                                    disabled={produced.length === 1}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={addProduced}
                                            sx={{ mt: 2 }}
                                        >
                                            {uiText("Add Count ")}</Button>

                                        <EntrySummary title={uiText("Finished yarn")}>
                                            <SummaryValue label={uiText("Total produced")} value={`${getTotalProduced().toFixed(2)} kg`} />
                                            <SummaryValue label={uiText("Full bags")} value={produced.reduce((sum, item) => sum + item.bags, 0)} />
                                        </EntrySummary>
                                    </TabPanel>

                                    <TabPanel value={outputTab} index={1}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            {uiText("Waste Breakdown ")}</Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <TextField
                                                label={uiText("Blow Room Waste (kg)", 'forms')}
                                                InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                                type="number"
                                                value={waste.blowRoom}
                                                onChange={(e) => handleWasteChange('blowRoom', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label={uiText("Carding Waste (kg)", 'forms')}
                                                InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                                type="number"
                                                value={waste.carding}
                                                onChange={(e) => handleWasteChange('carding', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label={uiText("OE Waste (kg)", 'forms')}
                                                InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                                type="number"
                                                value={waste.oe}
                                                onChange={(e) => handleWasteChange('oe', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label={uiText("Others (kg)", 'forms')}
                                                InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                                type="number"
                                                value={waste.others}
                                                onChange={(e) => handleWasteChange('others', e.target.value)}
                                                fullWidth
                                            />
                                        </Box>

                                        <EntrySummary title={uiText("Waste accounted for")}>
                                            <SummaryValue label={uiText("Total waste")} value={`${getTotalWaste().toFixed(2)} kg`} />
                                        </EntrySummary>
                                    </TabPanel>

                                    <TabPanel value={outputTab} index={2}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            {uiText("Intermediate Material ")}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {uiText("Material still in process (sliver, roving, etc.) that has not yet been converted to finished yarn or classified as waste. ")}</Typography>

                                        <TextField
                                            label={uiText("Intermediate Weight (kg)", 'forms')}
                                            InputProps={{ endAdornment: <InputAdornment position="end">{uiText("kg", 'forms')}</InputAdornment> }}
                                            type="number"
                                            value={intermediate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || parseFloat(val) >= 0) {
                                                    setIntermediate(val);
                                                }
                                            }}
                                            fullWidth
                                            helperText={uiText("This creates a traceable WIP lot. Complete it later in Business flows.", 'forms')}
                                        />
                                        <TextField sx={{ mt: 2 }} fullWidth label={uiText("Allocated processing cost (₹)", 'forms')} type="number" value={processingCost} onChange={e => setProcessingCost(e.target.value)} helperText={uiText("Verified labour, power and overhead allocated to this run. Raw-material cost comes from its receipt.", 'forms')} />

                                        <EntrySummary title={uiText("Material still in process")}>
                                            <SummaryValue label={uiText("Total intermediate")} value={`${getTotalIntermediate().toFixed(2)} kg`} />
                                        </EntrySummary>
                                    </TabPanel>
                                </Paper>

                                {/* Summary */}
                                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>{uiText("Material balance")}</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{uiText("Input")}</Typography>
                                            <Typography variant="h6">{formatUiDecimal(getTotalConsumed(), 2)} {uiText(" kg")}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{uiText("Output (Yarn)")}</Typography>
                                            <Typography variant="h6" color="success.main">{formatUiDecimal(getTotalProduced(), 2)} {uiText(" kg")}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{uiText("Waste")}</Typography>
                                            <Typography variant="h6" color="warning.main">{formatUiDecimal(getTotalWaste(), 2)} {uiText(" kg")}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">{uiText("Intermediate")}</Typography>
                                            <Typography variant="h6" color="info.main">{formatUiDecimal(getTotalIntermediate(), 2)} {uiText(" kg")}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">{uiText("Balance (should be 0)")}</Typography>
                                        <Typography
                                            variant="h6"
                                            color={Math.abs(getTotalConsumed() - getTotalProduced() - getTotalWaste() - getTotalIntermediate()) <= 0.01 ? 'success.main' : 'error.main'}
                                        >
                                            {formatUiDecimal((getTotalConsumed() - getTotalProduced() - getTotalWaste() - getTotalIntermediate()), 2)} {uiText(" kg ")}</Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                disabled={activeStep === 0 || isSaving}
                                onClick={handleBack}
                                startIcon={<BackIcon />}
                            >
                                {uiText("Back ")}</Button>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        startIcon={<SaveIcon />}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? uiText("Saving…") : uiText("Save Production")}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        endIcon={<NextIcon />}
                                    >
                                        {uiText("Next ")}</Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

            {labelProduction && (
                <BarcodeQRModal
                    open={Boolean(labelProduction)}
                    onClose={() => setLabelProduction(null)}
                    type="BAG"
                    title={uiTemplate`Production Label: PRD-${padZero(labelProduction.id, 4)}`}
                    code={formatBagCode(
                        labelProduction.producedYarn?.[0]?.count || 'MIX',
                        labelProduction.date,
                        labelProduction.id
                    )}
                    qrPayload={JSON.stringify({
                        type: 'PRODUCTION_RUN',
                        id: labelProduction.id,
                        code: `PRD-${padZero(labelProduction.id, 4)}`,
                        date: labelProduction.date ? new Date(labelProduction.date).toISOString().split('T')[0] : '',
                        consumedKg: labelProduction.totalConsumed,
                        producedKg: labelProduction.totalProduced,
                        wasteKg: labelProduction.totalWaste,
                        batches: (labelProduction.consumedBatches || []).map((b: any) => b.batchNo),
                        system: 'EverGreen One',
                        v: 1
                    })}
                    metadata={[
                        { label: 'Date', value: new Date(labelProduction.date).toLocaleDateString(uiDateLocale()) },
                        { label: 'Consumed Batches', value: (labelProduction.consumedBatches || []).map((b: any) => b.batchNo).join(', ') || 'N/A' },
                        { label: 'Total Input', value: `${labelProduction.totalConsumed.toLocaleString(uiLocale())} kg` },
                        { label: 'Total Produced', value: `${labelProduction.totalProduced.toLocaleString(uiLocale())} kg` },
                        { label: 'Total Waste', value: `${labelProduction.totalWaste.toLocaleString(uiLocale())} kg` },
                        { label: 'Efficiency', value: `${((labelProduction.totalProduced / labelProduction.totalConsumed) * 100).toFixed(2)}%` },
                    ]}
                />
            )}
        </Box>
    );
};

export default ProductionEntry;
