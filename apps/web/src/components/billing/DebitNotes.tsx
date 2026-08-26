import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface DebitNote {
    id: string;
    dnNumber: string;
    date: string;
    vendor: string;
    billRef: string;
    amount: number;
    reason: string;
    status: 'Draft' | 'Issued' | 'Settled';
}

const EMPTY: Omit<DebitNote, 'id'> = { dnNumber: '', date: today(), vendor: '', billRef: '', amount: 0, reason: '', status: 'Draft' };

const DebitNotes: React.FC = () => {
    const { items, add, update, remove } = usePersist<DebitNote>('debit_notes');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<DebitNote | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, dnNumber: `DN-${Date.now().toString().slice(-6)}` }); setEditing(null); setOpen(true); };
    const openEdit = (dn: DebitNote) => { setForm({ ...dn }); setEditing(dn); setOpen(true); };

    const handleSave = () => {
        if (!form.vendor.trim()) { toast.error('Vendor name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Debit Note updated'); }
        else { add(form); toast.success('Debit Note created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Debit Notes</Typography>
                    <Typography variant="body2" color="text.secondary">Issue debit notes for purchase returns or adjustments</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Debit Note</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>DN Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Bill Ref</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>No debit notes yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(dn => (
                                <TableRow key={dn.id} hover>
                                    <TableCell><Typography fontWeight={600}>{dn.dnNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(dn.date)}</TableCell>
                                    <TableCell>{dn.vendor}</TableCell>
                                    <TableCell>{dn.billRef || '—'}</TableCell>
                                    <TableCell>{dn.reason}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={dn.status} 
                                            size="small" 
                                            color={dn.status === 'Settled' ? 'success' : dn.status === 'Issued' ? 'warning' : 'default'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700} color="success.main">{fmtAmt(dn.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(dn)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete debit note?')) { remove(dn.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Debit Note' : 'Create Debit Note'}</DialogTitle>
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

export default DebitNotes;
