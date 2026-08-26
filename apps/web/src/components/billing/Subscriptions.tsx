import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, PlayArrow as StartIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface Subscription {
    id: string;
    name: string;
    customer: string;
    startDate: string;
    frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
    amount: number;
    status: 'Active' | 'Paused' | 'Cancelled';
}

const EMPTY: Omit<Subscription, 'id'> = { name: '', customer: '', startDate: today(), frequency: 'Monthly', amount: 0, status: 'Active' };

const Subscriptions: React.FC = () => {
    const { items, add, update, remove } = usePersist<Subscription>('subscriptions');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Subscription | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setOpen(true); };
    const openEdit = (sub: Subscription) => { setForm({ ...sub }); setEditing(sub); setOpen(true); };

    const handleSave = () => {
        if (!form.name.trim() || !form.customer.trim()) { toast.error('Name and Customer are required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Subscription updated'); }
        else { add(form); toast.success('Subscription created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Recurring Subscriptions</Typography>
                    <Typography variant="body2" color="text.secondary">Automate recurring invoices for ongoing services or regular deliveries</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>New Subscription</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Plan Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No active subscriptions.</TableCell></TableRow>}
                            {items.slice().reverse().map(sub => (
                                <TableRow key={sub.id} hover>
                                    <TableCell><Typography fontWeight={600}>{sub.name}</Typography></TableCell>
                                    <TableCell>{sub.customer}</TableCell>
                                    <TableCell>{fmtDate(sub.startDate)}</TableCell>
                                    <TableCell>{sub.frequency}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={sub.status} 
                                            size="small" 
                                            color={sub.status === 'Active' ? 'success' : sub.status === 'Cancelled' ? 'error' : 'warning'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(sub.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Generate Now"><IconButton size="small" color="primary"><StartIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(sub)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete subscription?')) { remove(sub.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Subscription' : 'New Subscription'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Subscription Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Monthly Maintenance Fee" /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Customer Name" fullWidth size="small" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="date" label="Start Date" fullWidth size="small" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Frequency" fullWidth size="small" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as any })} SelectProps={{ native: true }}>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Yearly">Yearly</option>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label="Amount (₹) per billing cycle" fullWidth size="small" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Status" fullWidth size="small" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} SelectProps={{ native: true }}>
                                <option value="Active">Active</option>
                                <option value="Paused">Paused</option>
                                <option value="Cancelled">Cancelled</option>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Subscriptions;
