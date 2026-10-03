import { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from '@mui/material';
import { http } from '../lib/http';
import { useThemeContext } from '../context/ThemeContext';

export default function MachineManagementPage() {
    const [tabIndex, setTabIndex] = useState(0);
    const { mode } = useThemeContext();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Machine & Equipment Management</Typography>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 3 }}>
                <Tab label="Machine Registry" />
                <Tab label="Maintenance Schedules" />
                <Tab label="Downtime Logs" />
                <Tab label="Spare Parts" />
            </Tabs>

            {tabIndex === 0 && <MachineRegistryTab mode={mode} />}
            {tabIndex === 1 && <MaintenanceTab mode={mode} />}
            {tabIndex === 2 && <DowntimeTab mode={mode} />}
            {tabIndex === 3 && <SparePartsTab mode={mode} />}
        </Box>
    );
}

function MachineRegistryTab({ mode }: { mode: 'light' | 'dark' }) {
    const [machines, setMachines] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', type: 'SPINNING', capacityPerHour: '', status: 'ACTIVE' });

    useEffect(() => { loadMachines(); }, []);

    const loadMachines = async () => {
        try { const res = await http.get('/production/machines'); setMachines(res.data.machines); } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/machines', { ...form, capacityPerHour: Number(form.capacityPerHour) });
            setOpen(false);
            loadMachines();
        } catch (e) { alert('Failed to save machine'); }
    };

    return (
        <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Machine List</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Add Machine</Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Capacity/Hr</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {machines.map(m => (
                            <TableRow key={m.id}>
                                <TableCell>{m.name}</TableCell>
                                <TableCell>{m.code}</TableCell>
                                <TableCell>{m.type}</TableCell>
                                <TableCell>{m.capacityPerHour}</TableCell>
                                <TableCell>
                                    <Chip label={m.status} color={m.status === 'ACTIVE' ? 'success' : 'error'} size="small" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Machine</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField label="Name" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField label="Code" fullWidth value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></Grid>
                        <Grid item xs={6}>
                            <TextField select label="Type" fullWidth value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <MenuItem value="SPINNING">Spinning</MenuItem>
                                <MenuItem value="CARDING">Carding</MenuItem>
                                <MenuItem value="WEAVING">Weaving</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}><TextField label="Capacity" type="number" fullWidth value={form.capacityPerHour} onChange={e => setForm({ ...form, capacityPerHour: e.target.value })} /></Grid>
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

function MaintenanceTab({ mode }: { mode: 'light' | 'dark' }) {
    const [machines, setMachines] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [selectedMachine, setSelectedMachine] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ machineId: '', type: 'PREVENTIVE', date: '', technician: '', description: '', cost: '' });

    useEffect(() => { loadMachines(); }, []);
    useEffect(() => { if (selectedMachine) loadRecords(selectedMachine); }, [selectedMachine]);

    const loadMachines = async () => {
        try { const res = await http.get('/production/machines'); setMachines(res.data.machines); } catch (e) { console.error(e); }
    };

    const loadRecords = async (id: string) => {
        try { const res = await http.get(`/production/machines/${id}/maintenance`); setRecords(res.data.records); } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/maintenance', { ...form, cost: Number(form.cost) });
            setOpen(false);
            if (selectedMachine === form.machineId) loadRecords(form.machineId);
        } catch (e) { alert('Failed to save record'); }
    };

    return (
        <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField select label="Select Machine" size="small" sx={{ width: 200 }} value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)}>
                    {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                </TextField>
                <Button variant="contained" onClick={() => setOpen(true)}>Log Maintenance</Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Technician</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map(r => (
                            <TableRow key={r.id}>
                                <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                                <TableCell>{r.type}</TableCell>
                                <TableCell>{r.technician}</TableCell>
                                <TableCell>{r.description}</TableCell>
                                <TableCell>{r.cost}</TableCell>
                                <TableCell>{r.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Log Maintenance</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField select label="Machine" fullWidth value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })}>
                                {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Type" fullWidth value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <MenuItem value="PREVENTIVE">Preventive</MenuItem>
                                <MenuItem value="BREAKDOWN">Breakdown</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}><TextField type="date" label="Date" fullWidth InputLabelProps={{ shrink: true }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField label="Technician" fullWidth value={form.technician} onChange={e => setForm({ ...form, technician: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField label="Cost" type="number" fullWidth value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
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

function DowntimeTab({ mode }: { mode: 'light' | 'dark' }) {
    const [machines, setMachines] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedMachine, setSelectedMachine] = useState('');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ machineId: '', startTime: '', endTime: '', reason: '' });

    useEffect(() => { loadMachines(); }, []);
    useEffect(() => { if (selectedMachine) loadLogs(selectedMachine); }, [selectedMachine]);

    const loadMachines = async () => {
        try { const res = await http.get('/production/machines'); setMachines(res.data.machines); } catch (e) { console.error(e); }
    };

    const loadLogs = async (id: string) => {
        try { const res = await http.get(`/production/machines/${id}/downtime`); setLogs(res.data.logs); } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/downtime', form);
            setOpen(false);
            if (selectedMachine === form.machineId) loadLogs(form.machineId);
        } catch (e) { alert('Failed to log downtime'); }
    };

    return (
        <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField select label="Select Machine" size="small" sx={{ width: 200 }} value={selectedMachine} onChange={e => setSelectedMachine(e.target.value)}>
                    {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                </TextField>
                <Button variant="contained" onClick={() => setOpen(true)}>Log Downtime</Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Start Time</TableCell>
                            <TableCell>End Time</TableCell>
                            <TableCell>Duration (min)</TableCell>
                            <TableCell>Reason</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map(l => (
                            <TableRow key={l.id}>
                                <TableCell>{new Date(l.startTime).toLocaleString()}</TableCell>
                                <TableCell>{l.endTime ? new Date(l.endTime).toLocaleString() : 'Ongoing'}</TableCell>
                                <TableCell>{l.durationMinutes || '-'}</TableCell>
                                <TableCell>{l.reason}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Log Downtime</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField select label="Machine" fullWidth value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })}>
                                {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={6}><TextField type="datetime-local" label="Start Time" fullWidth InputLabelProps={{ shrink: true }} value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField type="datetime-local" label="End Time" fullWidth InputLabelProps={{ shrink: true }} value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField label="Reason" fullWidth value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></Grid>
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

function SparePartsTab({ mode }: { mode: 'light' | 'dark' }) {
    const [parts, setParts] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', partNumber: '', quantityInStock: '', minimumStockLevel: '', costPerUnit: '' });

    useEffect(() => { loadParts(); }, []);

    const loadParts = async () => {
        try { const res = await http.get('/production/spare-parts'); setParts(res.data.parts); } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/spare-parts', {
                ...form,
                quantityInStock: Number(form.quantityInStock),
                minimumStockLevel: Number(form.minimumStockLevel),
                costPerUnit: Number(form.costPerUnit)
            });
            setOpen(false);
            loadParts();
        } catch (e) { alert('Failed to save part'); }
    };

    return (
        <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Spare Parts Inventory</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Add Part</Button>
            </Box>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Part Number</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell>Min Level</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {parts.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{p.partNumber}</TableCell>
                                <TableCell>{p.quantityInStock}</TableCell>
                                <TableCell>{p.minimumStockLevel}</TableCell>
                                <TableCell>{p.costPerUnit}</TableCell>
                                <TableCell>
                                    {p.quantityInStock <= p.minimumStockLevel ?
                                        <Chip label="Low Stock" color="error" size="small" /> :
                                        <Chip label="OK" color="success" size="small" />
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Spare Part</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}><TextField label="Name" fullWidth value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField label="Part Number" fullWidth value={form.partNumber} onChange={e => setForm({ ...form, partNumber: e.target.value })} /></Grid>
                        <Grid item xs={4}><TextField label="Stock" type="number" fullWidth value={form.quantityInStock} onChange={e => setForm({ ...form, quantityInStock: e.target.value })} /></Grid>
                        <Grid item xs={4}><TextField label="Min Level" type="number" fullWidth value={form.minimumStockLevel} onChange={e => setForm({ ...form, minimumStockLevel: e.target.value })} /></Grid>
                        <Grid item xs={4}><TextField label="Cost" type="number" fullWidth value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} /></Grid>
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
