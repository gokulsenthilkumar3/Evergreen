import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface JournalEntry {
    id: string;
    entryNo: string;
    date: string;
    accountDebit: string;
    accountCredit: string;
    amount: number;
    narration: string;
}

const EMPTY: Omit<JournalEntry, 'id'> = { entryNo: '', date: today(), accountDebit: '', accountCredit: '', amount: 0, narration: '' };

const Journals: React.FC = () => {
    const { items, add, update, remove } = usePersist<JournalEntry>('journals');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<JournalEntry | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, entryNo: `JV-${Date.now().toString().slice(-5)}` }); setEditing(null); setOpen(true); };
    const openEdit = (jv: JournalEntry) => { setForm({ ...jv }); setEditing(jv); setOpen(true); };

    const handleSave = () => {
        if (!form.accountDebit.trim() || !form.accountCredit.trim()) { toast.error('Both Debit and Credit accounts are required'); return; }
        if (form.accountDebit === form.accountCredit) { toast.error('Debit and Credit accounts must be different'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Journal Entry updated'); }
        else { add(form); toast.success('Journal Entry created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Journals</Typography>
                    <Typography variant="body2" color="text.secondary">Record manual double-entry accounting transactions</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Journal Entry</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>JV No</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Debit Account</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Credit Account</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Narration</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No journal entries yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(jv => (
                                <TableRow key={jv.id} hover>
                                    <TableCell><Typography fontWeight={600}>{jv.entryNo}</Typography></TableCell>
                                    <TableCell>{fmtDate(jv.date)}</TableCell>
                                    <TableCell><Chip label={jv.accountDebit} size="small" color="primary" variant="outlined" /></TableCell>
                                    <TableCell><Chip label={jv.accountCredit} size="small" color="secondary" variant="outlined" /></TableCell>
                                    <TableCell><Typography variant="body2">{jv.narration}</Typography></TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(jv.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(jv)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete entry?')) { remove(jv.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Journal Entry' : 'New Journal Entry'}</DialogTitle>
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

export default Journals;
