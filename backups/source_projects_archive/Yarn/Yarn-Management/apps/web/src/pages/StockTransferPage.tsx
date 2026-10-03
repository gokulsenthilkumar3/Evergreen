import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { http } from '../lib/http';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { notify } from '../context/NotificationContext';

export default function StockTransferPage() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [transferItems, setTransferItems] = useState<any[]>([]);
    const [availableItems, setAvailableItems] = useState<any[]>([]);
    const [currentItem, setCurrentItem] = useState({ itemId: '', quantity: '' });
    const [form, setForm] = useState({ sourceLocationId: '', destinationLocationId: '', notes: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { mode } = useThemeContext();

    useEffect(() => { loadWarehouses(); }, []);

    // When source location changes, fetch available items there
    useEffect(() => {
        if (form.sourceLocationId) {
            loadAvailableStock(form.sourceLocationId);
        } else {
            setAvailableItems([]);
        }
    }, [form.sourceLocationId]);

    const loadWarehouses = async () => {
        try {
            const res = await http.get('/inventory/warehouses');
            setWarehouses(res.data.warehouses);
        } catch (e) {
            notify.showError('Failed to load warehouses');
        }
    };

    const loadAvailableStock = async (locationId: string) => {
        try {
            // Find the location in our local state to get its contents (or ideally a new API call)
            // But since our warehouse details API already has this, we'll use a simplified fetch here
            const res = await http.get(`/warehouse/warehouses/${locationId}`); // Note: updated path
            // Actually, we need to find the specific location's items. 
            // The API returns warehouse details. We'll filter for the specific location.
            // For now, let's assume we can fetch all raw materials/finished goods with this locationId
            const [rmRes, fgRes] = await Promise.all([
                http.get('/raw-materials'),
                http.get('/finished-goods')
            ]);

            const rms = rmRes.data.rawMaterials.filter((m: any) => m.warehouseLocationId === locationId)
                .map((m: any) => ({ id: m.id, name: `${m.materialType} (${m.batchNo})`, quantity: m.quantity, type: 'RAW_MATERIAL' }));

            const fgs = fgRes.data.finishedGoods.filter((g: any) => g.warehouseLocationId === locationId)
                .map((g: any) => ({ id: g.id, name: `FG: ${g.batch?.batchNumber || g.id}`, quantity: g.producedQuantity, type: 'FINISHED_GOOD' }));

            setAvailableItems([...rms, ...fgs]);
        } catch (e) {
            notify.showError('Failed to load available stock for this location');
        }
    };

    const handleAddItem = () => {
        const item = availableItems.find(i => i.id === currentItem.itemId);
        if (!item || !currentItem.quantity) return;

        if (Number(currentItem.quantity) > item.quantity) {
            notify.showWarning(`Maximum available quantity is ${item.quantity}`);
            return;
        }

        setTransferItems([...transferItems, { ...item, quantity: Number(currentItem.quantity) }]);
        setCurrentItem({ itemId: '', quantity: '' });
    };

    const handleSubmit = async () => {
        if (!form.destinationLocationId) {
            notify.showError('Please select a destination location');
            return;
        }
        setLoading(true);
        try {
            await http.post('/inventory/transfer', {
                ...form,
                items: transferItems.map(i => ({ itemId: i.id, itemType: i.type, quantity: i.quantity }))
            });
            notify.showSuccess('Transfer Successful');
            navigate('/warehouse');
        } catch (e) {
            notify.showError('Transfer Failed');
        } finally {
            setLoading(false);
        }
    };

    const allLocations = warehouses.flatMap(w => (w.locations || []).map((l: any) => ({
        ...l,
        warehouseName: w.name
    })));

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Stock Transfer</Typography>
            <Paper sx={{ p: 3, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                <Grid container spacing={3}>
                    <Grid item xs={6}>
                        <TextField
                            select
                            label="Source Location"
                            fullWidth
                            value={form.sourceLocationId}
                            onChange={e => setForm({ ...form, sourceLocationId: e.target.value })}
                        >
                            <MenuItem value=""><em>Select Source</em></MenuItem>
                            {warehouses.map(w => (
                                <Box key={w.id}>
                                    <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold' }}>{w.name}</MenuItem>
                                    {(w.locations || []).map((l: any) => (
                                        <MenuItem key={l.id} value={l.id} sx={{ pl: 4 }}>
                                            {l.code} ({l.zone || 'No Zone'})
                                        </MenuItem>
                                    ))}
                                </Box>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            label="Destination Location"
                            fullWidth
                            value={form.destinationLocationId}
                            onChange={e => setForm({ ...form, destinationLocationId: e.target.value })}
                        >
                            <MenuItem value=""><em>Select Destination</em></MenuItem>
                            {warehouses.map(w => (
                                <Box key={w.id}>
                                    <MenuItem disabled sx={{ opacity: 1, fontWeight: 'bold' }}>{w.name}</MenuItem>
                                    {(w.locations || []).map((l: any) => (
                                        <MenuItem key={l.id} value={l.id} sx={{ pl: 4 }}>
                                            {l.code} ({l.zone || 'No Zone'})
                                        </MenuItem>
                                    ))}
                                </Box>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Items to Transfer</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                select
                                label="Item to Move"
                                sx={{ flex: 1 }}
                                value={currentItem.itemId}
                                onChange={e => setCurrentItem({ ...currentItem, itemId: e.target.value })}
                                disabled={!form.sourceLocationId}
                            >
                                <MenuItem value=""><em>{form.sourceLocationId ? 'Select an item' : 'Select Source First'}</em></MenuItem>
                                {availableItems.map(i => (
                                    <MenuItem key={i.id} value={i.id}>
                                        {i.name} - Available: {i.quantity}kg
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                label="Quantity"
                                type="number"
                                sx={{ width: 150 }}
                                value={currentItem.quantity}
                                onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                                disabled={!currentItem.itemId}
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddItem}
                                disabled={!currentItem.itemId || !currentItem.quantity}
                            >
                                Add
                            </Button>
                        </Box>

                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item Name</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transferItems.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, opacity: 0.5 }}>No items added to transfer list</TableCell></TableRow>
                                ) : (
                                    transferItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell><Chip label={item.type.replace('_', ' ')} size="small" /></TableCell>
                                            <TableCell>{item.quantity} kg</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => setTransferItems(transferItems.filter((_, i) => i !== idx))}><DeleteIcon /></IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleSubmit}
                            disabled={transferItems.length === 0 || loading}
                        >
                            {loading ? 'Processing...' : 'Complete Transfer'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
