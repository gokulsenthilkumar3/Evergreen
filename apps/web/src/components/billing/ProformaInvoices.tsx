import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Print as PrintIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface ProformaInvoice {
    id: string;
    piNumber: string;
    date: string;
    customer: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Converted' | 'Cancelled';
    notes: string;
}

const EMPTY: Omit<ProformaInvoice, 'id'> = { piNumber: '', date: today(), customer: '', amount: 0, status: 'Draft', notes: '' };

const ProformaInvoices: React.FC = () => {
    const { items, add, update, remove } = usePersist<ProformaInvoice>('proforma_invoices');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<ProformaInvoice | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, piNumber: `PI-${Date.now().toString().slice(-6)}` }); setEditing(null); setOpen(true); };
    const openEdit = (pi: ProformaInvoice) => { setForm({ ...pi }); setEditing(pi); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Proforma Invoice updated'); }
        else { add(form); toast.success('Proforma Invoice created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Proforma Invoices</Typography>
                    <Typography variant="body2" color="text.secondary">Issue proforma invoices for advance payments</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Proforma</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>PI Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>No proforma invoices yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(pi => (
                                <TableRow key={pi.id} hover>
                                    <TableCell><Typography fontWeight={600}>{pi.piNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(pi.date)}</TableCell>
                                    <TableCell>{pi.customer}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={pi.status} 
                                            size="small" 
                                            color={pi.status === 'Converted' ? 'success' : pi.status === 'Cancelled' ? 'error' : pi.status === 'Sent' ? 'primary' : 'default'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(pi.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Print/PDF"><IconButton size="small"><PrintIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(pi)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete proforma invoice?')) { remove(pi.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Proforma Invoice' : 'Create Proforma Invoice'}</DialogTitle>
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

export default ProformaInvoices;
