import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Select, MenuItem, Button, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import { http } from '../../lib/http';

interface Batch {
    id: string;
    batchNumber: string;
    startDate?: string;
    endDate?: string;
    machineId?: string;
    machine?: { id: string; name: string };
    plan?: { name: string };
    rawMaterial?: { materialType: string };
    status: string;
}

interface Machine {
    id: string;
    name: string;
    capacityPerHour: number;
}

export default function ScheduleGantt() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
    const [form, setForm] = useState({ startDate: '', endDate: '', machineId: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bRes, mRes] = await Promise.all([
                http.get('/production/schedule'),
                http.get('/production/machines')
            ]);
            setBatches(bRes.data.batches);
            setMachines(mRes.data.machines);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (batch: Batch) => {
        setSelectedBatch(batch);
        setForm({
            startDate: batch.startDate ? batch.startDate.split('T')[0] : '',
            endDate: batch.endDate ? batch.endDate.split('T')[0] : '',
            machineId: batch.machineId || ''
        });
        setOpen(true);
    };

    const handleSave = async () => {
        if (!selectedBatch) return;
        try {
            await http.patch(`/production/batches/${selectedBatch.id}/schedule`, form);
            setOpen(false);
            loadData();
        } catch (err) {
            alert('Failed to update schedule');
        }
    };

    // Group batches by machine
    const machineGroups: Record<string, Batch[]> = {};
    const unassignedBatches: Batch[] = [];

    batches.forEach(b => {
        if (b.machineId) {
            if (!machineGroups[b.machineId]) machineGroups[b.machineId] = [];
            machineGroups[b.machineId].push(b);
        } else {
            unassignedBatches.push(b);
        }
    });

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Production Schedule</Typography>

            <Grid container spacing={2}>
                {/* Unassigned Batches List */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
                        <Typography variant="subtitle1" gutterBottom color="error">Unassigned Batches</Typography>
                        {unassignedBatches.map(b => (
                            <Paper key={b.id} sx={{ p: 1, mb: 1, cursor: 'pointer', border: '1px solid #ddd' }} onClick={() => handleEdit(b)}>
                                <Typography variant="body2" fontWeight="bold">{b.batchNumber}</Typography>
                                <Typography variant="caption">{b.plan?.name}</Typography>
                            </Paper>
                        ))}
                        {unassignedBatches.length === 0 && <Typography variant="caption" color="textSecondary">No unassigned batches</Typography>}
                    </Paper>
                </Grid>

                {/* Machine Schedule Visualization */}
                <Grid item xs={12} md={9}>
                    <Paper sx={{ p: 2, overflowX: 'auto' }}>
                        <Typography variant="subtitle1" gutterBottom>Machine Timeline</Typography>
                        {machines.map(m => (
                            <Box key={m.id} sx={{ mb: 3 }}>
                                <Typography variant="subtitle2">{m.name}</Typography>
                                <Box sx={{ display: 'flex', gap: 1, p: 1, bgcolor: '#f5f5f5', minHeight: 60, alignItems: 'center', overflowX: 'auto' }}>
                                    {(machineGroups[m.id] || []).map(b => (
                                        <Paper key={b.id}
                                            sx={{
                                                p: 1,
                                                minWidth: 100,
                                                bgcolor: 'primary.light',
                                                color: 'white',
                                                cursor: 'pointer',
                                                zIndex: 1
                                            }}
                                            onClick={() => handleEdit(b)}
                                        >
                                            <Typography variant="caption" display="block">{b.batchNumber}</Typography>
                                            <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                                                {new Date(b.startDate!).toLocaleDateString()} - {new Date(b.endDate!).toLocaleDateString()}
                                            </Typography>
                                        </Paper>
                                    ))}
                                    {(!machineGroups[m.id] || machineGroups[m.id].length === 0) && (
                                        <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', px: 2 }}>Idle</Typography>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>

            {/* Edit Schedule Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Schedule Batch {selectedBatch?.batchNumber}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Machine</InputLabel>
                        <Select label="Machine" value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })}>
                            {machines.map(m => <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField label="Start Date" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                    <TextField label="End Date" type="date" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Save Schedule</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
