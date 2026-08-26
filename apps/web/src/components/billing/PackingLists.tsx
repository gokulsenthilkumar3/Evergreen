import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface PackingList {
    id: string;
    plNumber: string;
    date: string;
    customer: string;
    invoiceRef: string;
    totalBags: number;
    totalWeight: number;
    status: 'Draft' | 'Packed' | 'Dispatched';
    notes: string;
}

const EMPTY: Omit<PackingList, 'id'> = { plNumber: '', date: today(), customer: '', invoiceRef: '', totalBags: 0, totalWeight: 0, status: 'Draft', notes: '' };

const PackingLists: React.FC = () => {
    const { items, add, update, remove } = usePersist<PackingList>('packing_lists');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<PackingList | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, plNumber: `PL-${Date.now().toString().slice(-6)}` }); setEditing(null); setOpen(true); };
    const openEdit = (pl: PackingList) => { setForm({ ...pl }); setEditing(pl); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.totalBags <= 0 || form.totalWeight <= 0) { toast.error('Bags and weight must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Packing List updated'); }
        else { add(form); toast.success('Packing List created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Packing Lists</Typography>
                    <Typography variant="body2" color="text.secondary">Create and print packing lists for shipments</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Packing List</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>PL Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Invoice Ref</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Bags</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Weight (Kg)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>No packing lists yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(pl => (
                                <TableRow key={pl.id} hover>
                                    <TableCell><Typography fontWeight={600}>{pl.plNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(pl.date)}</TableCell>
                                    <TableCell>{pl.customer}</TableCell>
                                    <TableCell>{pl.invoiceRef || '—'}</TableCell>
                                    <TableCell>{pl.totalBags}</TableCell>
                                    <TableCell>{pl.totalWeight}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={pl.status} 
                                            size="small" 
                                            color={pl.status === 'Dispatched' ? 'success' : pl.status === 'Packed' ? 'primary' : 'default'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Print/PDF"><IconButton size="small"><PrintIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(pl)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete packing list?')) { remove(pl.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Packing List' : 'Create Packing List'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}></Grid>
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

export default PackingLists;
