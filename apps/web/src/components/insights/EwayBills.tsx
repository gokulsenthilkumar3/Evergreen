import { uiText, useUiLanguage } from "../../i18n";
import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip
} from '@mui/material';
import { Add as AddIcon, Refresh as SyncIcon, Visibility as ViewIcon, Close as CancelIcon } from '@mui/icons-material';
import { usePersist, fmtDate, fmtAmt } from '../../hooks/usePersist';
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
  useUiLanguage();
    const { items } = usePersist<EwayBill>('eway_bills');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ invoiceNo: '', customer: '', amount: 0, distance: 0 });

    const handleGenerate = () => {
        toast.error(uiText('E-Way Bill issuance is unavailable until a provider is configured.', 'feedback'));
    };

    const handleCancel = (_id: string) => {
        toast.error(uiText('Portal cancellation is unavailable until a provider is configured.', 'feedback'));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>{uiText("E-Way Bills")}</Typography>
                    <Typography variant="body2" color="text.secondary">{uiText("Provider integration is not configured. Existing local records are unverified.")}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<SyncIcon />} onClick={() => toast.error(uiText('NIC synchronization is unavailable until a provider is configured.', 'feedback'))}>{uiText("Sync NIC")}</Button>
                    <Button disabled variant="contained" startIcon={<AddIcon />} onClick={() => { setForm({ invoiceNo: '', customer: '', amount: 0, distance: 0 }); setOpen(true); }}>{uiText("Generate EWB")}</Button>
                </Box>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>{uiText("EWB No", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{uiText("Generated On", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{uiText("Invoice No", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{uiText("Customer", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">{uiText("Doc Value (₹)", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{uiText("Valid Upto", 'tables')}</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>{uiText("Status", 'tables')}</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>{uiText("No E-Way Bills found.", 'tables')}</TableCell></TableRow>}
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
                                        <Tooltip title={uiText("Print/View EWB", 'tables')}><IconButton size="small" color="primary"><ViewIcon fontSize="small" /></IconButton></Tooltip>
                                        {ewb.status === 'Active' && (
                                            <Tooltip title={uiText("Cancel EWB", 'tables')}><IconButton size="small" color="error" onClick={() => handleCancel(ewb.id)}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{uiText("Generate New E-Way Bill")}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label={uiText("Invoice No", 'forms')} fullWidth size="small" value={form.invoiceNo} onChange={e => setForm({ ...form, invoiceNo: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label={uiText("Customer Name", 'forms')} fullWidth size="small" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label={uiText("Document Value (₹)", 'forms')} fullWidth size="small" value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="number" label={uiText("Approx Distance (km)", 'forms')} fullWidth size="small" value={form.distance || ''} onChange={e => setForm({ ...form, distance: parseInt(e.target.value) || 0 })} required helperText={uiText("Determines validity period", 'forms')} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">{uiText("Cancel")}</Button>
                    <Button onClick={handleGenerate} variant="contained">{uiText("Generate")}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EwayBills;
