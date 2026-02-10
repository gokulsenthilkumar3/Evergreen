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
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface OutwardItem {
    id: number;
    count: string;
    bags: number;
    weight: number;
}

interface OutwardEntryProps {
    userRole?: string;
}

const OutwardEntry: React.FC<OutwardEntryProps> = ({ userRole }) => {
    const { data: outwardHistory, refetch: refetchHistory } = useQuery({
        queryKey: ['outwardHistory'],
        queryFn: async () => {
            const response = await api.get('/inventory/outward');
            return response.data;
        },
    });

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [customerName, setCustomerName] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [driverName, setDriverName] = useState('');
    const [items, setItems] = useState<OutwardItem[]>([
        { id: 1, count: '2', bags: 0, weight: 0 },
    ]);

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const handleItemChange = (id: number, field: keyof OutwardItem, value: any) => {
        setItems(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
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
        if (!customerName || !vehicleNo) {
            setNotification({ open: true, message: 'Please fill Customer Name and Vehicle No', severity: 'error' });
            return;
        }

        const validItems = items.filter(i => Number(i.bags) > 0 || Number(i.weight) > 0);
        if (validItems.length === 0) {
            setNotification({ open: true, message: 'Please add at least one item with bags/weight', severity: 'error' });
            return;
        }

        try {
            await api.post('/inventory/outward', {
                date,
                customerName,
                vehicleNo,
                driverName,
                items: validItems
            });
            setNotification({ open: true, message: 'Outward entry saved successfully!', severity: 'success' });
            // Reset form
            setCustomerName('');
            setVehicleNo('');
            setDriverName('');
            setItems([{ id: 1, count: '2', bags: 0, weight: 0 }]);
            refetchHistory();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to save outward entry', severity: 'error' });
        }
    };

    const handleDeleteOutward = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this outward entry? This will also revert inventory changes.')) return;

        try {
            await api.delete(`/inventory/outward/${id}`);
            setNotification({ open: true, message: 'Outward entry deleted successfully', severity: 'success' });
            refetchHistory();
        } catch (error) {
            setNotification({ open: true, message: 'Failed to delete outward entry', severity: 'error' });
        }
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
                Outward (Sales)
            </Typography>

            <Grid container spacing={3}>
                {/* Entry Form */}
                <Grid size={{ xs: 12, lg: 7 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            New Outward Entry
                        </Typography>
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
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Vehicle No"
                                    fullWidth
                                    value={vehicleNo}
                                    onChange={(e) => setVehicleNo(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Driver Name"
                                    fullWidth
                                    value={driverName}
                                    onChange={(e) => setDriverName(e.target.value)}
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
                                        <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Bags</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Weight (kg)</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} width={50}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <TextField
                                                    select
                                                    size="small"
                                                    fullWidth
                                                    value={item.count}
                                                    onChange={(e) => handleItemChange(item.id, 'count', e.target.value)}
                                                >
                                                    {['2', '4', '6', '8', '10'].map(c => (
                                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={item.bags}
                                                    onChange={(e) => handleItemChange(item.id, 'bags', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    value={item.weight}
                                                    onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
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

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button startIcon={<AddIcon />} onClick={addItemRow}>
                                Add Row
                            </Button>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="body2" color="text.secondary">Total Bags: {getTotalBags()}</Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total Weight: {getTotalWeight().toFixed(2)} kg</Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                        >
                            Save Outward Entry
                        </Button>
                    </Paper>
                </Grid>

                {/* History */}
                <Grid size={{ xs: 12, lg: 5 }}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Recent History
                        </Typography>
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {outwardHistory?.map((row: any) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold">{row.customerName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{row.vehicleNo}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{row.totalBags} Bags</Typography>
                                                <Typography variant="body2" fontWeight="bold">{row.totalWeight} kg</Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                {(userRole === 'ADMIN' || userRole === 'AUTHOR') && (
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDeleteOutward(row.id)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!outwardHistory || outwardHistory.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                                No history found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default OutwardEntry;
