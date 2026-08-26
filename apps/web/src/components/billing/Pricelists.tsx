import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface PriceEntry { yarnCount: string; rate: number; }
interface Pricelist {
    id: string;
    name: string;
    customer: string;
    validFrom: string;
    validTo: string;
    discount: number;
    entries: PriceEntry[];
    notes: string;
}

const COUNTS = ['4s','8s','10s','20s','30s','40s','60s','80s'];
const EMPTY: Omit<Pricelist,'id'> = { name: '', customer: '', validFrom: today(), validTo: '', discount: 0, entries: COUNTS.map(c => ({ yarnCount: c, rate: 0 })), notes: '' };

const Pricelists: React.FC = () => {
    const { items, add, update, remove } = usePersist<Pricelist>('pricelists');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Pricelist | null>(null);
    const [form, setForm] = useState<Omit<Pricelist,'id'>>({ ...EMPTY, entries: COUNTS.map(c => ({ yarnCount: c, rate: 0 })) });

    const openAdd = () => { setForm({ ...EMPTY, entries: COUNTS.map(c => ({ yarnCount: c, rate: 0 })) }); setEditing(null); setOpen(true); };
    const openEdit = (p: Pricelist) => { setForm({ ...p }); setEditing(p); setOpen(true); };

    const setEntry = (count: string, rate: number) => {
        setForm(f => ({ ...f, entries: f.entries.map(e => e.yarnCount === count ? { ...e, rate } : e) }));
    };

    const handleSave = () => {
        if (!form.name.trim()) { toast.error('Pricelist name is required'); return; }
        if (editing) { update(editing.id, form); toast.success('Pricelist updated'); }
        else { add(form); toast.success('Pricelist created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Pricelists</Typography>
                    <Typography variant="body2" color="text.secondary">Define customer-specific or date-range pricing for yarn counts</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>New Pricelist</Button>
            </Box>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Valid From</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Valid To</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Discount</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Counts</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No pricelists yet.</TableCell></TableRow>}
                            {items.map(p => (
                                <TableRow key={p.id} hover>
                                    <TableCell><Typography variant="body2" fontWeight={600}>{p.name}</Typography></TableCell>
                                    <TableCell>{p.customer || <Typography variant="caption" color="text.disabled">All Customers</Typography>}</TableCell>
                                    <TableCell>{fmtDate(p.validFrom)}</TableCell>
                                    <TableCell>{p.validTo ? fmtDate(p.validTo) : <Chip label="No Expiry" size="small" color="success" variant="outlined" />}</TableCell>
                                    <TableCell>{p.discount > 0 ? <Chip label={`-${p.discount}%`} size="small" color="success" /> : '—'}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {p.entries.filter(e => e.rate > 0).slice(0, 4).map(e => (
                                                <Chip key={e.yarnCount} label={`${e.yarnCount}: ₹${e.rate}`} size="small" />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete pricelist?')) { remove(p.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Pricelist' : 'New Pricelist'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Pricelist Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Ramesh Textiles — Q3 2025" />
                        <TextField label="Customer (optional)" fullWidth size="small" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="Leave blank to apply to all" />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}><TextField type="date" label="Valid From" fullWidth size="small" value={form.validFrom} onChange={e => setForm({ ...form, validFrom: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid size={{ xs: 6 }}><TextField type="date" label="Valid To (optional)" fullWidth size="small" value={form.validTo} onChange={e => setForm({ ...form, validTo: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        </Grid>
                        <TextField type="number" label="Overall Discount (%)" fullWidth size="small" value={form.discount || ''} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Rate per Count (₹/kg)</Typography>
                        <Grid container spacing={1.5}>
                            {form.entries.map(e => (
                                <Grid size={{ xs: 6, sm: 3 }} key={e.yarnCount}>
                                    <TextField type="number" label={`${e.yarnCount}`} fullWidth size="small" value={e.rate || ''} onChange={ev => setEntry(e.yarnCount, parseFloat(ev.target.value) || 0)} />
                                </Grid>
                            ))}
                        </Grid>
                        <TextField label="Notes" fullWidth size="small" multiline rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Pricelists;
