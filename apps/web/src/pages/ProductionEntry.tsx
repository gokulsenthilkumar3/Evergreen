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
    DialogTitle,
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
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    ArrowBack as BackIcon,
    ArrowForward as NextIcon,
    Email as EmailIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { generateExcel } from '../utils/excelGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES, formatApiError } from '../utils/messages';
import EmptyState from '../components/common/EmptyState';
import TableSkeleton from '../components/common/TableSkeleton';

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
    const { data: recentProduction, refetch: refetchProduction, isLoading } = useQuery({
        queryKey: ['productionHistory'],
        queryFn: async () => {
            const response = await api.get('/production');
            return response.data;
        },
    });

    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));

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

    const handleNext = () => {
        if (activeStep === 0) {
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

                if (consumption.totalBales <= 0 || consumption.totalBales > maxBale) {
                    toast.error(ERROR_MESSAGES.EXCEEDS_AVAILABLE_BALES);
                    return;
                }

                if (consumption.totalWeight <= 0 || consumption.totalWeight > maxWeight) {
                    toast.error(ERROR_MESSAGES.EXCEEDS_AVAILABLE_WEIGHT);
                    return;
                }
            }
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleSave = async () => {
        try {
            const totalConsumed = getTotalConsumed();
            const totalProduced = getTotalProduced();
            const totalWaste = getTotalWaste();
            const totalIntermediate = getTotalIntermediate();
            const balance = totalConsumed - totalProduced - totalWaste - totalIntermediate;

            if (Math.abs(balance) > 0.01) {
                toast.error(ERROR_MESSAGES.MATERIAL_BALANCE_MISMATCH);
                return;
            }

            const productionData = {
                date,
                consumed: consumed.filter(item => item.batchNo && parseFloat(item.weight) > 0),
                produced: produced.filter(item => parseFloat(item.weight) > 0),
                waste,
                intermediate: getTotalIntermediate(),
                totalConsumed,
                totalProduced,
                totalWaste,
                totalIntermediate,
                createdBy: username,
            };

            await api.post('/production', productionData);
            toast.success(SUCCESS_MESSAGES.PRODUCTION_SAVED);
            refetchProduction();
            handleCloseWizard();
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.SAVE_FAILED));
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
        } catch (error: any) {
            toast.error(formatApiError(error, ERROR_MESSAGES.DELETE_FAILED));
        }
    };

    const handleCloseWizard = () => {
        setOpenWizard(false);
        setActiveStep(0);
        setOutputTab(0);
        setConsumed([{ id: 1, batchNo: '', bale: '', weight: '' }]);
        setProduced([{ id: 1, count: '2', weight: '', bags: 0, remainingLog: 0 }]);
        setWaste({ blowRoom: '', carding: '', oe: '', others: '' });
        setIntermediate('');
        setDate(new Date().toLocaleDateString('en-CA'));
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        const data = recentProduction || [];
        if (data.length === 0) {
            toast.error(ERROR_MESSAGES.NO_DATA);
            return;
        }

        const filename = `Production_Report_${new Date().toISOString().split('T')[0]}`;

        if (type === 'pdf') {
            const headers = ['Date', 'Consumed (kg)', 'Produced (kg)', 'Waste (kg)', 'Efficiency (%)'];
            const rows = data.map((row: any) => [
                new Date(row.date).toLocaleDateString(),
                row.totalConsumed,
                row.totalProduced,
                row.totalWaste,
                ((row.totalProduced / row.totalConsumed) * 100).toFixed(2) + '%'
            ]);
            generatePDF('Production Report', headers, rows, filename);
        } else if (type === 'excel') {
            const excelData = data.map((row: any) => ({
                Date: new Date(row.date).toLocaleDateString(),
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
                    Production / Mixing
                    {isLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button startIcon={<EmailIcon />} variant="outlined" color="info" onClick={() => handleExport('email')}>Email</Button>
                    <Button startIcon={<ExcelIcon />} variant="outlined" color="info" onClick={() => handleExport('excel')}>Excel</Button>
                    <Button startIcon={<PdfIcon />} variant="outlined" color="info" onClick={() => handleExport('pdf')}>PDF</Button>
                    {userRole !== 'VIEWER' && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenWizard(true)}
                        >
                            Add Production
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Production History Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Batch ID(s)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Consumed (kg)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Produced (kg)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Waste (kg)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Intermediate (kg)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Efficiency (%)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Actions</TableCell>
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
                                        title="No Production Entries"
                                        message="No production entries found. Start by adding a new production entry."
                                        actionLabel={userRole !== 'VIEWER' ? "Add Production" : undefined}
                                        onAction={userRole !== 'VIEWER' ? () => setOpenWizard(true) : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            recentProduction.map((row: any) => (
                                <TableRow key={row.id} hover>
                                    <TableCell>
                                        <Tooltip title={row.entryTimestamp ? new Date(row.entryTimestamp).toLocaleString() : new Date(row.date).toLocaleString()} arrow placement="top">
                                            <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                {new Date(row.date).toLocaleDateString()}
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
                                        {((row.totalProduced / row.totalConsumed) * 100).toFixed(2)}%
                                    </TableCell>
                                    <TableCell align="center">
                                        {(userRole === 'ADMIN' || userRole === 'AUTHOR') && (
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteProduction(row.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
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
            >
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Production Entry
                    <IconButton
                        onClick={handleCloseWizard}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {/* Step 1: Input (Cotton Consumption) */}
                        {activeStep === 0 && (
                            <Box>
                                <TextField
                                    label="Production Date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    fullWidth
                                    sx={{ mb: 3 }}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    Cotton Consumption
                                </Typography>

                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Batch No</TableCell>
                                                <TableCell>Bale</TableCell>
                                                <TableCell>Weight (kg)</TableCell>
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
                                                                label="Select Batch"
                                                            >
                                                                {availableBatches.map((b: any) => (
                                                                    <MenuItem key={b.batchId} value={b.batchId}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                                                                            <span><strong>{b.batchId}</strong> — {b.supplier}</span>
                                                                            <Chip label={`${b.kg.toFixed(0)} kg left`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
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
                                                                                <Typography variant="caption" color="text.secondary" display="block">Original</Typography>
                                                                                <Typography variant="caption" fontWeight={700}>{b.originalBale} bales / {b.originalKg} kg</Typography>
                                                                            </Box>
                                                                            <Box sx={{ textAlign: 'center' }}>
                                                                                <Typography variant="caption" color="warning.main" display="block">Used</Typography>
                                                                                <Typography variant="caption" fontWeight={700} color="warning.main">{b.usedBale} bales / {b.usedKg} kg</Typography>
                                                                            </Box>
                                                                            <Box sx={{ textAlign: 'center' }}>
                                                                                <Typography variant="caption" color="success.main" display="block">Remaining</Typography>
                                                                                <Typography variant="caption" fontWeight={700} color="success.main">{b.bale} bales / {b.kg.toFixed(2)} kg</Typography>
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
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    if (val <= maxBale) {
                                                                        handleConsumedChange(item.id, 'bale', e.target.value);
                                                                    }
                                                                }}
                                                                fullWidth
                                                                error={baleVal > maxBale || baleVal <= 0}
                                                                helperText={item.batchNo ? `Max: ${maxBale}` : ''}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                value={item.weight}
                                                                onChange={(e) => {
                                                                    const val = parseFloat(e.target.value) || 0;
                                                                    if (val <= maxWeight) {
                                                                        handleConsumedChange(item.id, 'weight', e.target.value);
                                                                    }
                                                                }}
                                                                fullWidth
                                                                error={weightVal > maxWeight || weightVal <= 0}
                                                                helperText={item.batchNo ? `Max: ${maxWeight} kg` : ''}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
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
                                    Add Row
                                </Button>

                                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                                    <Typography variant="h6">
                                        Total Consumed: <strong>{getTotalConsumed().toFixed(2)} kg</strong>
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {/* Step 2: Output (Yarn Production & Waste) */}
                        {activeStep === 1 && (
                            <Box>
                                <Paper sx={{ mb: 3 }}>
                                    <Tabs value={outputTab} onChange={(_, v) => setOutputTab(v)}>
                                        <Tab label="Yarn Production" />
                                        <Tab label="Waste Breakdown" />
                                        <Tab label="Intermediate" />
                                    </Tabs>

                                    <TabPanel value={outputTab} index={0}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            Yarn Production
                                        </Typography>

                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Count</TableCell>
                                                        <TableCell>Weight (kg)</TableCell>
                                                        <TableCell>Bags (60kg)</TableCell>
                                                        <TableCell>Remaining (kg)</TableCell>
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
                                                                    onChange={(e) => handleProducedChange(item.id, 'weight', e.target.value)}
                                                                    fullWidth
                                                                />
                                                            </TableCell>
                                                            <TableCell>{item.bags}</TableCell>
                                                            <TableCell>{item.remainingLog.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    size="small"
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
                                            Add Count
                                        </Button>

                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                                            <Typography variant="h6">
                                                Total Produced: <strong>{getTotalProduced().toFixed(2)} kg</strong>
                                            </Typography>
                                        </Box>
                                    </TabPanel>

                                    <TabPanel value={outputTab} index={1}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            Waste Breakdown
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <TextField
                                                label="Blow Room Waste (kg)"
                                                type="number"
                                                value={waste.blowRoom}
                                                onChange={(e) => handleWasteChange('blowRoom', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Carding Waste (kg)"
                                                type="number"
                                                value={waste.carding}
                                                onChange={(e) => handleWasteChange('carding', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label="OE Waste (kg)"
                                                type="number"
                                                value={waste.oe}
                                                onChange={(e) => handleWasteChange('oe', e.target.value)}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Others (kg)"
                                                type="number"
                                                value={waste.others}
                                                onChange={(e) => handleWasteChange('others', e.target.value)}
                                                fullWidth
                                            />
                                        </Box>

                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                                            <Typography variant="h6">
                                                Total Waste: <strong>{getTotalWaste().toFixed(2)} kg</strong>
                                            </Typography>
                                        </Box>
                                    </TabPanel>

                                    <TabPanel value={outputTab} index={2}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            Intermediate Material
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            Material still in process (sliver, roving, etc.) that has not yet been converted to finished yarn or classified as waste.
                                        </Typography>

                                        <TextField
                                            label="Intermediate Weight (kg)"
                                            type="number"
                                            value={intermediate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || parseFloat(val) >= 0) {
                                                    setIntermediate(val);
                                                }
                                            }}
                                            fullWidth
                                            helperText="This material will carry forward and can be processed in future production entries."
                                        />

                                        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                                            <Typography variant="h6">
                                                Total Intermediate: <strong>{getTotalIntermediate().toFixed(2)} kg</strong>
                                            </Typography>
                                        </Box>
                                    </TabPanel>
                                </Paper>

                                {/* Summary */}
                                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Input</Typography>
                                            <Typography variant="h6">{getTotalConsumed().toFixed(2)} kg</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Output (Yarn)</Typography>
                                            <Typography variant="h6" color="success.main">{getTotalProduced().toFixed(2)} kg</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Waste</Typography>
                                            <Typography variant="h6" color="warning.main">{getTotalWaste().toFixed(2)} kg</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">Intermediate</Typography>
                                            <Typography variant="h6" color="info.main">{getTotalIntermediate().toFixed(2)} kg</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Balance (should be 0)</Typography>
                                        <Typography
                                            variant="h6"
                                            color={Math.abs(getTotalConsumed() - getTotalProduced() - getTotalWaste() - getTotalIntermediate()) < 0.01 ? 'success.main' : 'error.main'}
                                        >
                                            {(getTotalConsumed() - getTotalProduced() - getTotalWaste() - getTotalIntermediate()).toFixed(2)} kg
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        )}

                        {/* Navigation Buttons */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                startIcon={<BackIcon />}
                            >
                                Back
                            </Button>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        startIcon={<SaveIcon />}
                                    >
                                        Save Production
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        endIcon={<NextIcon />}
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>

        </Box>
    );
};

export default ProductionEntry;
