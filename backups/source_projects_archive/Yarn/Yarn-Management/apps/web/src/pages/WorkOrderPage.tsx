import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip, Card, CardContent } from '@mui/material';
import { http } from '../lib/http';
import { useThemeContext } from '../context/ThemeContext';

interface WorkOrder {
    id: string;
    workOrderNumber: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    startDate?: string;
    dueDate?: string;
    batches?: { rawMaterial: { materialType: string } }[];
}

export default function WorkOrderPage() {
    const [orders, setOrders] = useState<WorkOrder[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ workOrderNumber: '', priority: 'MEDIUM', startDate: '', dueDate: '' });

    useEffect(() => { loadOrders(); }, []);

    const loadOrders = async () => {
        try {
            const res = await http.get('/production/work-orders');
            setOrders(res.data.workOrders);
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/work-orders', form);
            setOpen(false);
            setForm({ workOrderNumber: '', priority: 'MEDIUM', startDate: '', dueDate: '' });
            loadOrders();
        } catch (err) {
            alert('Failed to create work order');
        }
    };

    // Kanban Columns
    const columns = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const { mode } = useThemeContext();

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Work Orders</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Create Work Order</Button>
            </Box>

            <Grid container spacing={3}>
                {columns.map(status => (
                    <Grid item xs={12} md={4} key={status}>
                        <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#f5f5f5' : 'rgba(255,255,255,0.05)', minHeight: 400 }}>
                            <Typography variant="h6" gutterBottom>{status}</Typography>
                            {orders.filter(o => o.status === status).map(order => (
                                <Card key={order.id} sx={{ mb: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="subtitle1" fontWeight="bold">{order.workOrderNumber}</Typography>
                                            <Chip label={order.priority} size="small" color={order.priority === 'URGENT' ? 'error' : 'default'} />
                                        </Box>
                                        <Typography variant="body2" color="textSecondary">Due: {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            {order.batches?.length || 0} Batches
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>New Work Order</DialogTitle>
                <DialogContent>
                    <TextField label="WO Number" fullWidth margin="dense" value={form.workOrderNumber} onChange={e => setForm({ ...form, workOrderNumber: e.target.value })} />
                    <TextField label="Priority" select SelectProps={{ native: true }} fullWidth margin="dense" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                    </TextField>
                    <TextField label="Start Date" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                    <TextField label="Due Date" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
