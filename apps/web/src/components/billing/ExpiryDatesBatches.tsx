import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Warning as WarningIcon } from '@mui/icons-material';
import { usePersist, fmtDate } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface Batch {
    id: string;
    batchNo: string;
    product: string;
    mfgDate: string;
    expiryDate: string;
    quantity: number;
    status: 'Active' | 'Expired' | 'Recalled' | 'Consumed';
}

const EMPTY: Omit<Batch, 'id'> = { batchNo: '', product: '', mfgDate: '', expiryDate: '', quantity: 0, status: 'Active' };

const ExpiryDatesBatches: React.FC = () => {
    const { items, add, update, remove } = usePersist<Batch>('batches');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Batch | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { 
        setForm({ ...EMPTY, batchNo: `BCH-${Date.now().toString().slice(-5)}` }); 
        setEditing(null); 
        setOpen(true); 
    };
    const openEdit = (b: Batch) => { setForm({ ...b }); setEditing(b); setOpen(true); };

    const handleSave = () => {
        if (!form.product.trim()) { toast.error('Product name is required'); return; }
        if (form.quantity <= 0) { toast.error('Quantity must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Batch updated'); }
        else { add(form); toast.success('Batch created'); }
        setOpen(false);
    };

    const isExpiringSoon = (expiryDate: string) => {
        if (!expiryDate) return false;
        const daysToExpiry = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
        return daysToExpiry > 0 && daysToExpiry <= 30;
    };

    const isExpired = (expiryDate: string) => {
        if (!expiryDate) return false;
        return new Date(expiryDate).getTime() < new Date().getTime();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Expiry Dates & Batches</Typography>
                    <Typography variant="body2" color="text.secondary">Track product batches, manufacturing dates, and manage expirations</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Batch</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Batch No</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Mfg Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Qty Available</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No batches recorded.</TableCell></TableRow>}
                            {items.map(b => {
                                const expired = isExpired(b.expiryDate);
                                const expiringSoon = !expired && isExpiringSoon(b.expiryDate);
                                
                                return (
                                    <TableRow key={b.id} hover sx={{ bgcolor: expired ? 'error.50' : expiringSoon ? 'warning.50' : 'inherit' }}>
                                        <TableCell><Typography fontWeight={600} fontFamily="monospace">{b.batchNo}</Typography></TableCell>
                                        <TableCell>{b.product}</TableCell>
                                        <TableCell>{b.mfgDate ? fmtDate(b.mfgDate) : '—'}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {b.expiryDate ? fmtDate(b.expiryDate) : '—'}
                                                {expired && <Tooltip title="Expired"><WarningIcon color="error" fontSize="small" /></Tooltip>}
                                                {expiringSoon && <Tooltip title="Expiring within 30 days"><WarningIcon color="warning" fontSize="small" /></Tooltip>}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{b.quantity}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={expired && b.status === 'Active' ? 'Expired' : b.status} 
                                                size="small" 
                                                color={(expired || b.status === 'Expired' || b.status === 'Recalled') ? 'error' : b.status === 'Consumed' ? 'default' : 'success'} 
                                                variant="outlined" 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(b)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete batch?')) { remove(b.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Batch' : 'Add Batch'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Batch No" fullWidth size="small" value={form.batchNo} onChange={e => setForm({ ...form, batchNo: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Product Name" fullWidth size="small" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="date" label="Manufacturing Date" fullWidth size="small" value={form.mfgDate} onChange={e => setForm({ ...form, mfgDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="date" label="Expiry Date" fullWidth size="small" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label="Quantity Available" fullWidth size="small" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Status" fullWidth size="small" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} SelectProps={{ native: true }}>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="Recalled">Recalled</option>
                                <option value="Consumed">Consumed</option>
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

export default ExpiryDatesBatches;
