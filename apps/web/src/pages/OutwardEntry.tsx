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
    Grid,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Email as EmailIcon,
    TableView as ExcelIcon,
    PictureAsPdf as PdfIcon,
    FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { generateExcel } from '../utils/excelGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';

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
    const [filterType, setFilterType] = useState('all');
    const [showErrors, setShowErrors] = useState(false);
    const { confirm: confirmDialog } = useConfirm();

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const type = e.target.value;
        setFilterType(type);
        const today = new Date();

        if (type === 'today') {
            const str = today.toISOString().split('T')[0];
            setHistoryFrom(str);
            setHistoryTo(str);
        } else if (type === 'week') {
            const past = new Date(today);
            past.setDate(today.getDate() - 7);
            setHistoryFrom(past.toISOString().split('T')[0]);
            setHistoryTo(today.toISOString().split('T')[0]);
        } else if (type === 'month') {
            const past = new Date(today);
            past.setMonth(today.getMonth() - 1);
            setHistoryFrom(past.toISOString().split('T')[0]);
            setHistoryTo(today.toISOString().split('T')[0]);
        } else if (type === 'all') {
            setHistoryFrom('');
            setHistoryTo('');
        }
    };

    const handleExportAction = (type: 'email' | 'excel' | 'pdf') => {
        handleExport(type);
        handleMenuClose();
    };

    const { data: outwardHistory, refetch: refetchHistory } = useQuery({
        queryKey: ['outwardHistory', historyFrom, historyTo],
        queryFn: async () => {
            const params: any = {};
            if (historyFrom) params.from = historyFrom;
            if (historyTo) params.to = historyTo;
            const response = await api.get('/inventory/outward', { params });
            return response.data;
        },
    });

    const { data: yarnStock = {}, refetch: refetchStock } = useQuery<{ [key: string]: number }>({
        queryKey: ['yarnStock'],
        queryFn: async () => {
            const res = await api.get('/inventory/yarn-stock');
            return res.data;
        }
    });

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [customerName, setCustomerName] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
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
        if (!customerName || !vehicleNo || !driverName) {
            toast.error('Please fill Customer Name, Vehicle No, and Driver Name');
            return;
        }

        // Vehicle Number Validation (Basic Indian Format)
        const vehicleRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}(?:[ -]?[A-Z]{1,2})?[ -]?[0-9]{4}$/i;
        if (!vehicleRegex.test(vehicleNo)) {
            toast.error('Invalid Vehicle Number format (e.g., TN 01 AB 1234)');
            return;
        }

        const validItems = items.filter(i => Number(i.bags) > 0);
        if (validItems.length === 0) {
            toast.error('Please add at least one item with bags');
            return;
        }

        // Validate Stock Availability
        for (const item of validItems) {
            const currentStock = yarnStock[item.count] || 0;
            if (Number(item.weight) > currentStock) {
                toast.error(`Insufficient stock for Count ${item.count}. Available: ${(currentStock / 60).toFixed(0)} bags (${currentStock.toFixed(2)}kg)`);
                return;
            }
        }

        try {
            await api.post('/inventory/outward', {
                date,
                customerName,
                vehicleNo,
                driverName,
                createdBy: username,
                items: validItems.map(item => ({
                    ...item,
                    bags: Number(item.bags),
                    weight: Number(item.weight)
                }))
            });
            toast.success('Outward entry saved successfully!');
            setCustomerName('');
            setVehicleNo('');
            setDriverName('');
            setItems([{ id: 1, count: '2', bags: 0, weight: 0 }]);
            refetchHistory();
            refetchStock();
            setOpenDialog(false);
            setShowErrors(false);
        } catch (error) {
            toast.error('Failed to save outward entry');
        }
    };

    const handleDeleteOutward = async (id: number) => {
        if (!await confirmDialog({ title: 'Delete Outward Entry', message: 'Are you sure you want to delete this outward entry? This will also revert inventory changes.', severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) return;

        try {
            await api.delete(`/inventory/outward/${id}`);
            toast.success('Outward entry deleted successfully');
            refetchHistory();
            refetchStock();
        } catch (error) {
            toast.error('Failed to delete outward entry');
        }
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        const data = outwardHistory || [];
        if (data.length === 0) {
            toast.error('No data to export');
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
                    Outward History
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
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">Past Week</MenuItem>
                        <MenuItem value="month">Past Month</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                    </TextField>

                    {filterType === 'custom' && (
                        <>
                            <TextField
                                label="From"
                                type="date"
                                size="small"
                                value={historyFrom}
                                onChange={(e) => setHistoryFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: 140 }}
                            />
                            <TextField
                                label="To"
                                type="date"
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
                        onClick={() => setOpenDialog(true)}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        Add Outward
                    </Button>

                    <Divider orientation="vertical" flexItem sx={{ mx: 1, display: { xs: 'none', md: 'block' } }} />

                    <Button
                        startIcon={<ExportIcon />}
                        variant="outlined"
                        color="info"
                        onClick={handleMenuOpen}
                        sx={{ borderRadius: '20px', textTransform: 'none' }}
                    >
                        Export
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={() => handleExportAction('email')}>
                            <ListItemIcon><EmailIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Email</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleExportAction('excel')}>
                            <ListItemIcon><ExcelIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>Excel</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleExportAction('pdf')}>
                            <ListItemIcon><PdfIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>PDF</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {/* History Table */}
            <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Vehicle / Driver</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Total Bags</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Total Weight</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
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
                                    <TableCell sx={{ fontWeight: 'bold' }}>{row.customerName}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{row.vehicleNo}</Typography>
                                        <Typography variant="caption" color="text.secondary">{row.driverName}</Typography>
                                    </TableCell>
                                    <TableCell align="center">{row.totalBags}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{row.totalWeight} kg</TableCell>
                                    <TableCell align="center">
                                        {(userRole === 'ADMIN' || userRole === 'AUTHOR') && (
                                            <IconButton color="error" onClick={() => handleDeleteOutward(row.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!outwardHistory || outwardHistory.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography variant="h6" color="text.secondary">No Outwards Found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setShowErrors(false); }} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'divider' }}>
                    New Outward Entry
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Box sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Date"
                                    type="date"
                                    fullWidth
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Customer Name"
                                    fullWidth
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    required
                                    error={showErrors && !customerName}
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
                                    error={showErrors && !vehicleNo}
                                    helperText="Format: TN 01 AB 1234"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Driver Name"
                                    fullWidth
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
                                    required
                                    error={showErrors && !driverName}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Items (Yarn Bags)
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
                                                    disabled // Auto-calculated
                                                    sx={{ bgcolor: 'action.hover' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => removeItemRow(item.id)} disabled={items.length === 1}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={addItemRow}
                                variant="outlined"
                            >
                                Add Row
                            </Button>
                            <Box sx={{
                                textAlign: 'right',
                                p: 2,
                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.03)',
                                borderRadius: 3,
                                minWidth: 200,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="body2" color="text.secondary">Total Bags: <strong>{getTotalBags()}</strong></Typography>
                                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
                                    {getTotalWeight().toFixed(1)} <Box component="span" sx={{ fontSize: '0.9rem', fontWeight: 500 }}>kg</Box>
                                </Typography>
                            </Box>
                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={() => { setOpenDialog(false); setShowErrors(false); }} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        startIcon={<SaveIcon />}
                    >
                        Save Entry
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default OutwardEntry;
