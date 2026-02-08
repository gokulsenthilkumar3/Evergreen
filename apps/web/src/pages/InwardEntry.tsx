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
    Alert,
    Snackbar,
    Autocomplete,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
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
} from '@mui/icons-material';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

interface BatchEntry {
    id: string;
    batchId: string;
    date: string;
    supplier: string;
    bale: number;
    kg: number;
}

interface InwardEntryProps {
    userRole?: string;
}

const InwardEntry: React.FC<InwardEntryProps> = ({ userRole }) => {
    // Filter State
    const [dateFilter, setDateFilter] = useState<string>('today');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [openWizard, setOpenWizard] = useState(false); // Wizard State

    // Form State
    const [formData, setFormData] = useState({
        supplier: '',
        bale: '',
        kg: '',
    });
    const [generatedBatchId, setGeneratedBatchId] = useState('');

    const queryClient = useQueryClient();

    // Data State (Fetch from API)
    const { data: batchHistory = [] } = useQuery({
        queryKey: ['inwardHistory', dateFilter, customFrom, customTo],
        queryFn: async () => {
            const response = await api.get('/inventory/inward', {
                params: {
                    from: dateFilter === 'custom' ? customFrom : undefined,
                    to: dateFilter === 'custom' ? customTo : undefined
                }
            });
            return response.data;
        }
    });

    const [suppliers, setSuppliers] = useState<string[]>([]);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Generate Batch ID on component mount
    useEffect(() => {
        generateBatchId();
    }, []);

    const generateBatchId = () => {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setGeneratedBatchId(`IB-${datePart}-${randomPart}`);
    };

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSupplierChange = (_event: any, newValue: string | null) => {
        setFormData(prev => ({ ...prev, supplier: newValue || '' }));
    };

    const handleRemoveSupplier = (e: React.MouseEvent, supplierToRemove: string) => {
        e.stopPropagation();
        setSuppliers(prev => prev.filter(s => s !== supplierToRemove));
    };

    const handleDeleteBatch = (_id: string) => {
        // Implementation for delete API if needed
        alert('Delete implementation pending');
    };

    const handleSubmit = async () => {
        try {
            if (!formData.supplier || !formData.bale || !formData.kg) {
                setNotification({ open: true, message: 'Please fill in all required fields.', severity: 'error' });
                return;
            }

            // Call API to save batch
            await api.post('/inventory/inward', {
                batchId: generatedBatchId,
                date: new Date().toISOString(),
                supplier: formData.supplier,
                bale: Number(formData.bale),
                kg: Number(formData.kg),
            });

            // Invalidate queries to refresh data across the app
            queryClient.invalidateQueries({ queryKey: ['inwardHistory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryHistory'] });

            setNotification({ open: true, message: 'Batch added and inventory updated!', severity: 'success' });

            // Reset form
            setFormData({ supplier: '', bale: '', kg: '' });
            generateBatchId();
            setOpenWizard(false);

        } catch (error) {
            console.error('Error saving batch:', error);
            setNotification({ open: true, message: 'Failed to save batch to database.', severity: 'error' });
        }
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        console.log(`Exporting batches as ${type}`);
        alert(`Exporting as ${type}... (Implementation Pending)`);
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header & Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Inward Batch Entry
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* Data Filter */}
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Date Filter</InputLabel>
                        <Select
                            value={dateFilter}
                            label="Date Filter"
                            onChange={handleDateFilterChange}
                        >
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
                            <TextField
                                type="date"
                                label="From"
                                size="small"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="date"
                                label="To"
                                size="small"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </>
                    )}
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenWizard(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Batch
                    </Button>
                </Box>
            </Box>

            {/* Entry Wizard Dialog */}
            <Dialog open={openWizard} onClose={() => setOpenWizard(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Add Batches
                    <IconButton
                        onClick={() => setOpenWizard(false)}
                        sx={{ color: 'text.secondary' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', mt: 1 }}>
                        <TextField
                            label="Batch ID"
                            value={generatedBatchId}
                            disabled
                            sx={{ flex: '1 1 200px', bgcolor: 'action.hover' }}
                        />

                        <Autocomplete
                            freeSolo
                            options={suppliers}
                            value={formData.supplier}
                            onChange={handleSupplierChange}
                            onInputChange={(_e, newInputValue) => {
                                setFormData(prev => ({ ...prev, supplier: newInputValue }));
                            }}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box component="span" sx={{ flexGrow: 1 }}>{option}</Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleRemoveSupplier(e, option)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </li>
                            )}
                            sx={{ flex: '2 1 300px' }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Supplier"
                                    required
                                    name="supplier"
                                />
                            )}
                        />

                        <TextField
                            label="Total Bale"
                            name="bale"
                            type="number"
                            value={formData.bale}
                            onChange={handleInputChange}
                            required
                            InputProps={{ inputProps: { min: 0 } }}
                            sx={{ flex: '1 1 200px' }}
                        />
                        <TextField
                            label="Total Kg"
                            name="kg"
                            type="number"
                            value={formData.kg}
                            onChange={handleInputChange}
                            required
                            InputProps={{ inputProps: { min: 0 } }}
                            sx={{ flex: '1 1 200px' }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            sx={{ flex: '0 0 auto', height: 56, px: 4 }}
                        >
                            Add Batch
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* List Table */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Batch History</Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button startIcon={<EmailIcon />} variant="outlined" onClick={() => handleExport('email')}>Email</Button>
                        <Button startIcon={<ExcelIcon />} variant="outlined" onClick={() => handleExport('excel')}>Excel</Button>
                        <Button startIcon={<PdfIcon />} variant="outlined" onClick={() => handleExport('pdf')}>PDF</Button>
                    </Box>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Batch ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell align="right">Bale</TableCell>
                                <TableCell align="right">Total Kg</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {batchHistory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">No batch data found for this period</TableCell>
                                </TableRow>
                            ) : (
                                batchHistory.map((row: BatchEntry) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.batchId}</TableCell>
                                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.supplier}</TableCell>
                                        <TableCell align="right">{row.bale}</TableCell>
                                        <TableCell align="right">{row.kg?.toLocaleString()} kg</TableCell>
                                        <TableCell align="center">
                                            {(userRole === 'Admin' || userRole === 'Author') && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteBatch(row.id)}
                                                    title="Delete Batch (Admin/Author Only)"
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
            </Paper>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default InwardEntry;
