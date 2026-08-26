import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface Quotation {
    id: string;
    quoteNumber: string;
    date: string;
    validUntil: string;
    customer: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
    notes: string;
}

const EMPTY: Omit<Quotation, 'id'> = { quoteNumber: '', date: today(), validUntil: '', customer: '', amount: 0, status: 'Draft', notes: '' };

const Quotations: React.FC = () => {
    const { items, add, update, remove } = usePersist<Quotation>('quotations');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Quotation | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { 
        const date = new Date();
        const validUntil = new Date(date.setDate(date.getDate() + 15)).toLocaleDateString('en-CA');
        setForm({ ...EMPTY, quoteNumber: `QT-${Date.now().toString().slice(-6)}`, validUntil }); 
        setEditing(null); 
        setOpen(true); 
    };
    const openEdit = (qt: Quotation) => { setForm({ ...qt }); setEditing(qt); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Quotation updated'); }
        else { add(form); toast.success('Quotation created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Quotations / Estimates</Typography>
                    <Typography variant="body2" color="text.secondary">Create and send price estimates to your customers</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Quotation</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Quote Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Valid Until</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No quotations yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(qt => (
                                <TableRow key={qt.id} hover>
                                    <TableCell><Typography fontWeight={600}>{qt.quoteNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(qt.date)}</TableCell>
                                    <TableCell>{fmtDate(qt.validUntil)}</TableCell>
                                    <TableCell>{qt.customer}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={qt.status} 
                                            size="small" 
                                            color={qt.status === 'Accepted' ? 'success' : qt.status === 'Rejected' ? 'error' : qt.status === 'Sent' ? 'primary' : 'default'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(qt.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Print/PDF"><IconButton size="small"><PrintIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(qt)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete quotation?')) { remove(qt.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Quotation' : 'Create Quotation'}</DialogTitle>
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

export default Quotations;
