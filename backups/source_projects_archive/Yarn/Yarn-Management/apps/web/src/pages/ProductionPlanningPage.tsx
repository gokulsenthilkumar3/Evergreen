import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { http } from '../lib/http';
import ScheduleGantt from '../components/production/ScheduleGantt';

interface Plan {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    _count?: { batches: number };
}

interface Forecast {
    id: string;
    month: number;
    year: number;
    productType: string;
    forecastedQuantity: number;
    confidenceLevel: number;
}

interface Machine {
    id: string;
    name: string;
    type: string;
    capacityPerHour: number;
    _count?: { batches: number };
}

export default function ProductionPlanningPage() {
    const [tabIndex, setTabIndex] = useState(0);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Production Planning</Typography>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
                <Tab label="Production Plans" />
                <Tab label="Demand Forecast" />
                <Tab label="Capacity & Resources" />
                <Tab label="Schedule" />
            </Tabs>

            {tabIndex === 0 && <ProductionPlansTab />}
            {tabIndex === 1 && <DemandForecastTab />}
            {tabIndex === 2 && <CapacityTab />}
            {tabIndex === 3 && <ScheduleGantt />}
        </Box>
    );
}

function ProductionPlansTab() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [open, setOpen] = useState(false);
    const [newPlan, setNewPlan] = useState({ name: '', startDate: '', endDate: '' });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const res = await http.get('/production/plans');
            setPlans(res.data.plans);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async () => {
        try {
            await http.post('/production/plans', newPlan);
            setOpen(false);
            loadPlans();
        } catch (err) {
            alert('Failed to create plan');
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Production Schedules</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Create Plan</Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Batches</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map(plan => (
                            <TableRow key={plan.id}>
                                <TableCell>{plan.name}</TableCell>
                                <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(plan.endDate).toLocaleDateString()}</TableCell>
                                <TableCell>{plan.status}</TableCell>
                                <TableCell>{plan._count?.batches || 0}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>New Production Plan</DialogTitle>
                <DialogContent>
                    <TextField label="Name" fullWidth margin="dense" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
                    <TextField label="Start Date" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={newPlan.startDate} onChange={e => setNewPlan({ ...newPlan, startDate: e.target.value })} />
                    <TextField label="End Date" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={newPlan.endDate} onChange={e => setNewPlan({ ...newPlan, endDate: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

function DemandForecastTab() {
    const [forecasts, setForecasts] = useState<Forecast[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), productType: '', forecastedQuantity: '', confidenceLevel: 80 });

    useEffect(() => { loadForecasts(); }, []);

    const loadForecasts = async () => {
        try {
            const res = await http.get('/production/forecasts');
            setForecasts(res.data.forecasts);
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/forecasts', {
                ...form,
                forecastedQuantity: Number(form.forecastedQuantity),
                month: Number(form.month),
                year: Number(form.year)
            });
            setOpen(false);
            loadForecasts();
        } catch (err) { alert('Failed to save forecast'); }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Demand Forecasts</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Add Forecast</Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Period</TableCell>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Confidence</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {forecasts.map(f => (
                            <TableRow key={f.id}>
                                <TableCell>{f.month}/{f.year}</TableCell>
                                <TableCell>{f.productType}</TableCell>
                                <TableCell>{f.forecastedQuantity}</TableCell>
                                <TableCell>{f.confidenceLevel}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Forecast</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                            <TextField label="Month" type="number" fullWidth value={form.month} onChange={e => setForm({ ...form, month: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Year" type="number" fullWidth value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Product Type" fullWidth value={form.productType} onChange={e => setForm({ ...form, productType: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Quantity" type="number" fullWidth value={form.forecastedQuantity} onChange={e => setForm({ ...form, forecastedQuantity: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Confidence %" type="number" fullWidth value={form.confidenceLevel} onChange={e => setForm({ ...form, confidenceLevel: Number(e.target.value) })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}

function CapacityTab() {
    const [machines, setMachines] = useState<Machine[]>([]);

    useEffect(() => {
        http.get('/production/machines').then(res => setMachines(res.data.machines)).catch(console.error);
    }, []);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Machine Capacity</Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Machine</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Capacity/Hr</TableCell>
                            <TableCell>Assigned Batches</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {machines.map(m => (
                            <TableRow key={m.id}>
                                <TableCell>{m.name}</TableCell>
                                <TableCell>{m.type}</TableCell>
                                <TableCell>{m.capacityPerHour}</TableCell>
                                <TableCell>{m._count?.batches || 0}</TableCell>
                            </TableRow>
                        ))}
                        {machines.length === 0 && <TableRow><TableCell colSpan={4}>No machines found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
