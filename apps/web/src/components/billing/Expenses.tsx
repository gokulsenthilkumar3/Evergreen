import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Grid,
    InputAdornment, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Search as SearchIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = [
    'EB Bill', 'Employee Wages', 'Maintenance', 'Packaging', 'Transport', 'Office', 'Rent', 'Insurance', 'Other',
];

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque'];

interface Expense {
    id: string;
    date: string;
    category: string;
    description: string;
    amount: number;
    method: string;
    reference: string;
}

const EMPTY: Omit<Expense, 'id'> = { date: today(), category: 'Other', description: '', amount: 0, method: 'Cash', reference: '' };

const Expenses: React.FC = () => {
    const { items, add, update, remove } = usePersist<Expense>('expenses');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null>(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [search, setSearch] = useState('');

    const totals = EXPENSE_CATEGORIES.map(cat => ({
        cat,
        total: items.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    })).filter(t => t.total > 0).sort((a, b) => b.total - a.total);

    const grandTotal = items.reduce((s, e) => s + e.amount, 0);

    const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setOpen(true); };
    const openEdit = (e: Expense) => { setForm({ ...e }); setEditing(e); setOpen(true); };

    const handleSave = () => {
        if (!form.description.trim()) { toast.error('Description is required'); return; }
        if (!form.amount || form.amount <= 0) { toast.error('Amount must be > 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Expense updated'); }
        else { add(form); toast.success('Expense added'); }
        setOpen(false);
    };

    const filtered = items.filter(e =>
        !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())
    ).slice().reverse();

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Expenses</Typography>
                    <Typography variant="body2" color="text.secondary">Track all your business expenses by category</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Expense</Button>
            </Box>

            {/* Category totals */}
            {totals.length > 0 && (
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '2px solid', borderColor: 'error.main', bgcolor: 'error.50' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL EXPENSES</Typography>
                            <Typography variant="h5" fontWeight={800} color="error.main">{fmtAmt(grandTotal)}</Typography>
                        </Paper>
                    </Grid>
                    {totals.slice(0, 4).map(t => (
                        <Grid size={{ xs: 6, md: 2 }} key={t.cat}>
                            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">{t.cat}</Typography>
                                <Typography variant="body2" fontWeight={700}>{fmtAmt(t.total)}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Search + Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        size="small" placeholder="Search expenses..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                        sx={{ width: 280 }}
                    />
                </Box>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                        No expenses yet. Click "Add Expense" to record one.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filtered.map(e => (
                                <TableRow key={e.id} hover>
                                    <TableCell>{fmtDate(e.date)}</TableCell>
                                    <TableCell><Chip label={e.category} size="small" variant="outlined" /></TableCell>
                                    <TableCell>{e.description}</TableCell>
                                    <TableCell><Typography variant="caption">{e.method}</Typography></TableCell>
                                    <TableCell align="right"><Typography fontWeight={700} color="error.main">{fmtAmt(e.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(e)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete this expense?')) { remove(e.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>
                    {editing ? 'Edit Expense' : 'Add Expense'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField type="date" label="Date" fullWidth size="small" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField select label="Category" fullWidth size="small" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {EXPENSE_CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField label="Description" fullWidth size="small" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField type="number" label="Amount (₹)" fullWidth size="small" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField select label="Payment Method" fullWidth size="small" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                                    {PAYMENT_METHODS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                        <TextField label="Reference (optional)" fullWidth size="small" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Cheque no, UTR, etc." />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Add Expense'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Expenses;
