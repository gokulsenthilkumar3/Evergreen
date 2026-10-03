import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';
import { useThemeContext } from '../context/ThemeContext';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function InventoryOptimizationPage() {
    const [analysis, setAnalysis] = useState<any>(null);
    const [settings, setSettings] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [form, setForm] = useState({ materialType: '', reorderPoint: 0, safetyStock: 0, leadTimeDays: 7 });
    const { mode } = useThemeContext();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [analysisRes, settingsRes] = await Promise.all([
                http.get('/inventory/optimization/analysis'),
                http.get('/inventory/optimization/settings')
            ]);
            setAnalysis(analysisRes.data);
            setSettings(settingsRes.data.settings);
        } catch (e) {
            notify.showError('Failed to load optimization data');
        }
    };

    const handleSaveSettings = async () => {
        try {
            await http.patch('/inventory/optimization/settings', form);
            notify.showSuccess('Settings updated successfully');
            setOpenModal(false);
            loadData();
        } catch (e) {
            notify.showError('Failed to update settings');
        }
    };

    const StatCard = ({ title, value, subValue, icon, color }: any) => (
        <Paper sx={{ p: 3, height: '100%', bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}15`, color: color, mr: 2 }}>
                    {icon}
                </Box>
                <Typography variant="subtitle1" fontWeight="bold">{title}</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">{value}</Typography>
            {subValue && <Typography variant="body2" color="text.secondary">{subValue}</Typography>}
        </Paper>
    );

    if (!analysis) return <Typography>Loading analysis...</Typography>;

    const pieData = [
        { name: 'Category A (High Value)', value: analysis.abcAnalysis.filter((x: any) => x.category === 'A').length },
        { name: 'Category B (Medium Value)', value: analysis.abcAnalysis.filter((x: any) => x.category === 'B').length },
        { name: 'Category C (Low Value)', value: analysis.abcAnalysis.filter((x: any) => x.category === 'C').length },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Inventory Optimization</Typography>
                <Button
                    variant="contained"
                    startIcon={<SettingsIcon />}
                    onClick={() => setOpenModal(true)}
                >
                    Optimization Settings
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Reorder Alerts"
                        value={analysis.alerts.length}
                        subValue={`${analysis.alerts.filter((a: any) => a.status === 'CRITICAL').length} Critical`}
                        icon={<WarningIcon />}
                        color="#ef4444"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Inventory Turnover"
                        value={analysis.turnoverRatio}
                        subValue="Last 30 Days"
                        icon={<TrendingUpIcon />}
                        color="#3b82f6"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Dead Stock Items"
                        value={analysis.deadStockCount}
                        subValue={`Value: ₹${analysis.deadStockValue.toLocaleString()}`}
                        icon={<DeleteSweepIcon />}
                        color="#f59e0b"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, height: '100%', bgcolor: mode === 'light' ? '#fff' : '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>ABC Analysis Distribution</Typography>
                        <Box sx={{ height: 100 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={30} outerRadius={45} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>Reorder Alerts</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Material Type</TableCell>
                                    <TableCell>Current Stock</TableCell>
                                    <TableCell>Reorder Point</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {analysis.alerts.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, opacity: 0.5 }}>All stock levels are optimal</TableCell></TableRow>
                                ) : (
                                    analysis.alerts.map((alert: any) => (
                                        <TableRow key={alert.materialType}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>{alert.materialType}</TableCell>
                                            <TableCell>{alert.currentStock} kg</TableCell>
                                            <TableCell>{alert.reorderPoint} kg</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={alert.status}
                                                    color={alert.status === 'CRITICAL' ? 'error' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button size="small" variant="outlined">Create PO</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>ABC Analysis (By Value)</Typography>
                        <Box sx={{ height: 300, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analysis.abcAnalysis.slice(0, 5)}>
                                    <XAxis dataKey="materialType" fontSize={10} />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            {['A', 'B', 'C'].map(cat => (
                                <Box key={cat} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">{cat} Category Items:</Typography>
                                    <Typography variant="body2" fontWeight="bold">{analysis.abcAnalysis.filter((x: any) => x.category === cat).length}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Settings Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Optimization Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Material Type"
                            fullWidth
                            value={form.materialType}
                            onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                            placeholder="e.g. Cotton Waste, Polyester"
                        />
                        <TextField
                            label="Reorder Point (kg)"
                            type="number"
                            fullWidth
                            value={form.reorderPoint}
                            onChange={(e) => setForm({ ...form, reorderPoint: Number(e.target.value) })}
                        />
                        <TextField
                            label="Safety Stock (kg)"
                            type="number"
                            fullWidth
                            value={form.safetyStock}
                            onChange={(e) => setForm({ ...form, safetyStock: Number(e.target.value) })}
                        />
                        <TextField
                            label="Lead Time (Days)"
                            type="number"
                            fullWidth
                            value={form.leadTimeDays}
                            onChange={(e) => setForm({ ...form, leadTimeDays: Number(e.target.value) })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveSettings}>Save Settings</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
