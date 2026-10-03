import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { http } from '../lib/http';

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

export default function ShiftManagementPage() {
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', startTime: '', endTime: '' });

    useEffect(() => { loadShifts(); }, []);

    const loadShifts = async () => {
        try {
            const res = await http.get('/production/shifts');
            setShifts(res.data.shifts);
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        try {
            await http.post('/production/shifts', form);
            setOpen(false);
            setForm({ name: '', startTime: '', endTime: '' });
            loadShifts();
        } catch (err) {
            alert('Failed to save shift');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Shift Management</Typography>
                <Button variant="contained" onClick={() => setOpen(true)}>Add Shift</Button>
            </Box>

            <Paper sx={{ p: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Start Time</TableCell>
                                <TableCell>End Time</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {shifts.map(shift => (
                                <TableRow key={shift.id}>
                                    <TableCell>{shift.name}</TableCell>
                                    <TableCell>{shift.startTime}</TableCell>
                                    <TableCell>{shift.endTime}</TableCell>
                                    <TableCell>{shift.isActive ? 'Active' : 'Inactive'}</TableCell>
                                </TableRow>
                            ))}
                            {shifts.length === 0 && <TableRow><TableCell colSpan={4}>No shifts definition found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Shift</DialogTitle>
                <DialogContent>
                    <TextField label="Shift Name" fullWidth margin="dense" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField label="Start Time" type="time" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="End Time" type="time" fullWidth margin="dense" InputLabelProps={{ shrink: true }} value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                        </Grid>
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
