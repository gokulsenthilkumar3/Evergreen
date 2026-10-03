import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { http } from '../lib/http';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { notify } from '../context/NotificationContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function WarehousePage() {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', type: 'GENERAL', address: '' });
    const navigate = useNavigate();
    const { mode } = useThemeContext();

    useEffect(() => { loadWarehouses(); }, []);

    const loadWarehouses = async () => {
        try {
            const [whRes, stRes] = await Promise.all([
                http.get('/inventory/warehouses'),
                http.get('/inventory/analysis/aging')
            ]);
            setWarehouses(whRes.data.warehouses);
            setStats(stRes.data.aging);
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        try {
            await http.post('/inventory/warehouses', form);
            setOpen(false);
            loadWarehouses();
            notify.showSuccess('Warehouse created successfully');
        } catch (e) {
            notify.showError('Failed to create warehouse');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Warehouse Management</Typography>
                <Box>
                    <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/warehouse/transfer')}>Stock Transfer</Button>
                    <Button variant="contained" onClick={() => setOpen(true)}>Add Warehouse</Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        {warehouses.map(w => (
                            <Grid item xs={12} md={6} key={w.id}>
                                <Paper sx={{ p: 2, cursor: 'pointer', bgcolor: mode === 'light' ? '#fff' : '#1e293b' }} onClick={() => navigate(`/warehouse/warehouses/${w.id}`)}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="h6">{w.name}</Typography>
                                        <Chip label={w.type} size="small" color="primary" />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">{w.code}</Typography>
                                    <Typography variant="body2" sx={{ mt: 1 }}>Address: {w.address || 'N/A'}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%', bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>Stock Aging (kg)</Typography>
                        {stats && (
                            <Box sx={{ height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: '0-30 Days', value: stats['0-30'] },
                                                { name: '31-60 Days', value: stats['31-60'] },
                                                { name: '61-90 Days', value: stats['61-90'] },
                                                { name: '90+ Days', value: stats['90+'] },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#ef4444" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                        {!stats && <Typography align="center" sx={{ mt: 10, opacity: 0.5 }}>No data available</Typography>}
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Warehouse</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField label="Name" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField label="Code" fullWidth value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></Grid>
                        <Grid item xs={6}>
                            <TextField select label="Type" fullWidth SelectProps={{ native: true }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="GENERAL">General</option>
                                <option value="RAW_MATERIAL">Raw Material</option>
                                <option value="FINISHED_GOODS">Finished Goods</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}><TextField label="Address" fullWidth multiline rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
