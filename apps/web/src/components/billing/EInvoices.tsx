import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Sync as SyncIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface EInvoice {
    id: string;
    invoiceNo: string;
    date: string;
    customer: string;
    irn: string;
    amount: number;
    status: 'Pending' | 'Generated' | 'Cancelled';
}

const EMPTY: Omit<EInvoice, 'id'> = { invoiceNo: '', date: today(), customer: '', irn: '', amount: 0, status: 'Pending' };

const EInvoices: React.FC = () => {
    const { items, add, update, remove } = usePersist<EInvoice>('einvoices');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<EInvoice | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, invoiceNo: `INV-${Date.now().toString().slice(-6)}` }); setEditing(null); setOpen(true); };
    const openEdit = (ei: EInvoice) => { setForm({ ...ei }); setEditing(ei); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('E-Invoice updated'); }
        else { add(form); toast.success('E-Invoice added to generation queue'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>E-Invoices</Typography>
                    <Typography variant="body2" color="text.secondary">Generate and manage Government E-Invoices (IRN)</Typography>
                </Box>
                <Button variant="contained" startIcon={<SyncIcon />} onClick={() => toast.success('Syncing with IRP...')}>Bulk Generate</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Invoice No</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>IRN Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No E-Invoices recorded. Click the button below to add one manually for testing.</TableCell></TableRow>}
                            {items.slice().reverse().map(ei => (
                                <TableRow key={ei.id} hover>
                                    <TableCell><Typography fontWeight={600}>{ei.invoiceNo}</Typography></TableCell>
                                    <TableCell>{fmtDate(ei.date)}</TableCell>
                                    <TableCell>{ei.customer}</TableCell>
                                    <TableCell>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 0.5, borderRadius: 1 }}>
                                            {ei.irn || 'Pending Generation'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ei.status} 
                                            size="small" 
                                            color={ei.status === 'Generated' ? 'success' : ei.status === 'Cancelled' ? 'error' : 'warning'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(ei.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(ei)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete record?')) { remove(ei.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd}>Add Manual Record (For Testing)</Button>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit E-Invoice Record' : 'Add E-Invoice Record'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Status" fullWidth size="small" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} SelectProps={{ native: true }}>
                                <option value="Pending">Pending</option>
                                <option value="Generated">Generated</option>
                                <option value="Cancelled">Cancelled</option>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Add Record'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EInvoices;
