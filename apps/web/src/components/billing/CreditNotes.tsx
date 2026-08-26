import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface CreditNote {
    id: string;
    cnNumber: string;
    date: string;
    customer: string;
    invoiceRef: string;
    amount: number;
    reason: string;
    status: 'Draft' | 'Issued' | 'Applied';
}

const EMPTY: Omit<CreditNote, 'id'> = { cnNumber: '', date: today(), customer: '', invoiceRef: '', amount: 0, reason: '', status: 'Draft' };

const CreditNotes: React.FC = () => {
    const { items, add, update, remove } = usePersist<CreditNote>('credit_notes');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<CreditNote | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, cnNumber: `CN-${Date.now().toString().slice(-6)}` }); setEditing(null); setOpen(true); };
    const openEdit = (cn: CreditNote) => { setForm({ ...cn }); setEditing(cn); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Credit Note updated'); }
        else { add(form); toast.success('Credit Note created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Credit Notes</Typography>
                    <Typography variant="body2" color="text.secondary">Issue credit notes for returns or overpayments</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Credit Note</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>CN Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Invoice Ref</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>No credit notes yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(cn => (
                                <TableRow key={cn.id} hover>
                                    <TableCell><Typography fontWeight={600}>{cn.cnNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(cn.date)}</TableCell>
                                    <TableCell>{cn.customer}</TableCell>
                                    <TableCell>{cn.invoiceRef || '—'}</TableCell>
                                    <TableCell>{cn.reason}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={cn.status} 
                                            size="small" 
                                            color={cn.status === 'Applied' ? 'success' : cn.status === 'Issued' ? 'primary' : 'default'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700} color="error.main">{fmtAmt(cn.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(cn)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete credit note?')) { remove(cn.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Credit Note' : 'Create Credit Note'}</DialogTitle>
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

export default CreditNotes;
