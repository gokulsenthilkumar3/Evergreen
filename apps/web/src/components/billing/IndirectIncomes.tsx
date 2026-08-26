import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

const INCOME_CATEGORIES = ['Interest Received', 'Rent Received', 'Scrap Sale', 'Commission', 'Dividend', 'Grant', 'Other Income'];

interface IndirectIncome {
    id: string;
    date: string;
    category: string;
    source: string;
    amount: number;
    notes: string;
}

const EMPTY: Omit<IndirectIncome, 'id'> = { date: today(), category: 'Other Income', source: '', amount: 0, notes: '' };

const IndirectIncomes: React.FC = () => {
    const { items, add, update, remove } = usePersist<IndirectIncome>('indirect_incomes');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<IndirectIncome | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const total = items.reduce((s, i) => s + i.amount, 0);

    const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setOpen(true); };
    const openEdit = (item: IndirectIncome) => { setForm({ ...item }); setEditing(item); setOpen(true); };

    const handleSave = () => {
        if (!form.source.trim()) { toast.error('Source is required'); return; }
        if (!form.amount || form.amount <= 0) { toast.error('Amount must be > 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Updated'); }
        else { add(form); toast.success('Income recorded'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Indirect Incomes</Typography>
                    <Typography variant="body2" color="text.secondary">Record non-sales income such as interest, rent, and scrap sales</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} color="success">Add Income</Button>
            </Box>

            {total > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '2px solid', borderColor: 'success.main', bgcolor: 'success.50', display: 'inline-flex', gap: 2, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL INDIRECT INCOME</Typography>
                    <Typography variant="h5" fontWeight={800} color="success.main">{fmtAmt(total)}</Typography>
                </Paper>
            )}

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && (
                                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>No indirect incomes recorded yet.</TableCell></TableRow>
                            )}
                            {[...items].reverse().map(item => (
                                <TableRow key={item.id} hover>
                                    <TableCell>{fmtDate(item.date)}</TableCell>
                                    <TableCell><Chip label={item.category} size="small" color="success" variant="outlined" /></TableCell>
                                    <TableCell>{item.source}</TableCell>
                                    <TableCell><Typography variant="caption" color="text.secondary">{item.notes || '—'}</Typography></TableCell>
                                    <TableCell align="right"><Typography fontWeight={700} color="success.main">{fmtAmt(item.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete?')) { remove(item.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Income' : 'Record Indirect Income'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField type="date" label="Date" fullWidth size="small" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField select label="Category" fullWidth size="small" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {INCOME_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField label="Source / Description" fullWidth size="small" value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required />
                        <TextField type="number" label="Amount (₹)" fullWidth size="small" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                        <TextField label="Notes (optional)" fullWidth size="small" multiline rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained" color="success">{editing ? 'Update' : 'Add Income'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IndirectIncomes;
