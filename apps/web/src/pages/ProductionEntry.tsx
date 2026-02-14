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
    const { data: recentProduction, refetch: refetchProduction } = useQuery({
        queryKey: ['productionHistory'],
        queryFn: async () => {
            const response = await api.get('/production');
            return response.data;
        },
    });

    const { data: availableBatches = [] } = useQuery({
        queryKey: ['availableBatches'],
        queryFn: async () => {
            const response = await api.get('/inventory/available-batches');
            return response.data;
        },
    });

    const { data: yarnStock } = useQuery({
        queryKey: ['yarnStock'],
        queryFn: async () => {
            const response = await api.get('/inventory/yarn-stock');
            return response.data;
        },
    });

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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

    const handleNext = () => {
        if (activeStep === 0) {
            // Validate input
            const hasValidInput = consumed.some(item => item.batchNo && parseFloat(item.weight) > 0 && parseFloat(item.bale) > 0);
            if (!hasValidInput) {
                toast.error('Please add at least one valid consumption entry with batch, bale, and weight');
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
                    toast.error(`Total bales for batch ${batchNo} (${consumption.totalBales}) exceeds available bales (${maxBale})`);
                    return;
                }

                if (consumption.totalWeight <= 0 || consumption.totalWeight > maxWeight) {
                    toast.error(`Total weight for batch ${batchNo} (${consumption.totalWeight} kg) exceeds available weight (${maxWeight} kg)`);
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
            const balance = totalConsumed - totalProduced - totalWaste;

            if (Math.abs(balance) > 0.01) {
                toast.error(`Material balance mismatch: ${balance.toFixed(2)} kg difference`);
                return;
            }

            const productionData = {
                date,
                consumed: consumed.filter(item => item.batchNo && parseFloat(item.weight) > 0),
                produced: produced.filter(item => parseFloat(item.weight) > 0),
                waste,
                totalConsumed,
                totalProduced,
                totalWaste,
                createdBy: username,
            };

            await api.post('/production', productionData);
            toast.success('Production entry saved successfully!');
            refetchProduction();
            handleCloseWizard();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to save production entry';
            toast.error(Array.isArray(message) ? message.join(', ') : message);
        }
    };

    const handleDeleteProduction = async (id: number) => {
        if (!await confirmDialog({ title: 'Delete Production Entry', message: 'Are you sure you want to delete this production entry? This will also revert inventory changes.', severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) return;

        try {
            await api.delete(`/production/${id}`);
            toast.success('Production entry deleted successfully');
            refetchProduction();
        } catch (error) {
            toast.error('Failed to delete production entry');
        }
    };

    const handleCloseWizard = () => {
        setOpenWizard(false);
        setActiveStep(0);
        setOutputTab(0);
        setConsumed([{ id: 1, batchNo: '', bale: '', weight: '' }]);
        setProduced([{ id: 1, count: '2', weight: '', bags: 0, remainingLog: 0 }]);
        setWaste({ blowRoom: '', carding: '', oe: '', others: '' });
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        const data = recentProduction || [];
        if (data.length === 0) {
            toast.error('No data to export');
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
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button startIcon={<EmailIcon />} variant="outlined" color="info" onClick={() => handleExport('email')}>Email</Button>
                    <Button startIcon={<ExcelIcon />} variant="outlined" color="info" onClick={() => handleExport('excel')}>Excel</Button>
                    <Button startIcon={<PdfIcon />} variant="outlined" color="info" onClick={() => handleExport('pdf')}>PDF</Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenWizard(true)}
                    >
                        Add Production
                    </Button>
                </Box>
            </Box>

            {/* Production History Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Consumed (kg)</TableCell>
                            <TableCell align="right">Produced (kg)</TableCell>
                            <TableCell align="right">Waste (kg)</TableCell>
                            <TableCell align="right">Efficiency (%)</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {recentProduction?.map((row: any) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    <Tooltip title={row.entryTimestamp ? new Date(row.entryTimestamp).toLocaleString() : new Date(row.date).toLocaleString()} arrow placement="top">
                                        <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                            {new Date(row.date).toLocaleDateString()}
                                        </Box>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="right">{row.totalConsumed}</TableCell>
                                <TableCell align="right">{row.totalProduced}</TableCell>
                                <TableCell align="right">{row.totalWaste}</TableCell>
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
                        ))}
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
                                                        <TableCell>
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
                                                                        {b.batchId} ({b.supplier} - {b.kg}kg)
                                                                    </MenuItem>
                                                                ))}
                                                            </TextField>
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
                                                                    {Object.keys(yarnStock || {}).length > 0 ? (
                                                                        Object.keys(yarnStock || {}).sort((a, b) => Number(a) - Number(b)).map(c => (
                                                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                                                        ))
                                                                    ) : (
                                                                        ['2', '4', '6', '8', '10', '12', '14', '16', '20'].map(c => (
                                                                            <MenuItem key={c} value={c}>{c}</MenuItem>
                                                                        ))
                                                                    )}
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
                                </Paper>

                                {/* Summary */}
                                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Summary</Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
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
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary">Balance</Typography>
                                        <Typography
                                            variant="h6"
                                            color={Math.abs(getTotalConsumed() - getTotalProduced() - getTotalWaste()) < 0.01 ? 'success.main' : 'error.main'}
                                        >
                                            {(getTotalConsumed() - getTotalProduced() - getTotalWaste()).toFixed(2)} kg
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
