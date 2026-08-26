import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip
} from '@mui/material';
import { Add as AddIcon, Refresh as SyncIcon, Visibility as ViewIcon, Close as CancelIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface EwayBill {
    id: string;
    ewbNo: string;
    date: string;
    invoiceNo: string;
    customer: string;
    amount: number;
    status: 'Active' | 'Cancelled' | 'Expired';
    validUpto: string;
}

const EwayBills: React.FC = () => {
    const { items, add, update } = usePersist<EwayBill>('eway_bills');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ invoiceNo: '', customer: '', amount: 0, distance: 0 });

    const handleGenerate = () => {
        if (!form.invoiceNo || !form.customer || form.amount <= 0) {
            toast.error('Please fill all fields'); return;
        }

        const dateObj = new Date();
        const validObj = new Date(dateObj);
        validObj.setDate(validObj.getDate() + Math.max(1, Math.ceil(form.distance / 200)));

        add({
            ewbNo: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
            date: dateObj.toISOString(),
            invoiceNo: form.invoiceNo,
            customer: form.customer,
            amount: form.amount,
            status: 'Active',
            validUpto: validObj.toISOString()
        });
        
        toast.success('E-Way Bill generated successfully');
        setOpen(false);
    };

    const handleCancel = (id: string) => {
        if (confirm('Are you sure you want to cancel this E-Way Bill?')) {
            update(id, { status: 'Cancelled' });
            toast.success('E-Way Bill cancelled on NIC portal');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>E-Way Bills</Typography>
                    <Typography variant="body2" color="text.secondary">Generate and manage GST E-Way Bills for goods in transit</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<SyncIcon />} onClick={() => toast.success('Synced with NIC Portal')}>Sync NIC</Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ invoiceNo: '', customer: '', amount: 0, distance: 0 }); setOpen(true); }}>Generate EWB</Button>
                </Box>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>EWB No</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Generated On</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Invoice No</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Doc Value (₹)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Valid Upto</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>No E-Way Bills found.</TableCell></TableRow>}
                            {items.slice().reverse().map(ewb => (
                                <TableRow key={ewb.id} hover>
                                    <TableCell><Typography fontWeight={600} sx={{ fontFamily: 'monospace' }}>{ewb.ewbNo}</Typography></TableCell>
                                    <TableCell>{fmtDate(ewb.date.split('T')[0])}</TableCell>
                                    <TableCell>{ewb.invoiceNo}</TableCell>
                                    <TableCell>{ewb.customer}</TableCell>
                                    <TableCell align="right">{fmtAmt(ewb.amount)}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color={new Date(ewb.validUpto) < new Date() && ewb.status === 'Active' ? 'error.main' : 'inherit'}>
                                            {fmtDate(ewb.validUpto.split('T')[0])}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={ewb.status} 
                                            size="small" 
                                            color={ewb.status === 'Active' ? 'success' : ewb.status === 'Cancelled' ? 'error' : 'warning'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Print/View EWB"><IconButton size="small" color="primary"><ViewIcon fontSize="small" /></IconButton></Tooltip>
                                        {ewb.status === 'Active' && (
                                            <Tooltip title="Cancel EWB"><IconButton size="small" color="error" onClick={() => handleCancel(ewb.id)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Generate New E-Way Bill</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Invoice No" fullWidth size="small" value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Customer Name" fullWidth size="small" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label="Document Value (₹)" fullWidth size="small" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label="Approx Distance (km)" fullWidth size="small" value={form.distance || ''} onChange={e => setForm({ ...form, distance: parseInt(e.target.value) || 0 })} required helperText="Determines validity period" /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleGenerate} variant="contained">Generate</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EwayBills;
