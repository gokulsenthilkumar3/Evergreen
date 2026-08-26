import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip, InputAdornment
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as CopyIcon, Share as ShareIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface PaymentLink {
    id: string;
    customer: string;
    amount: number;
    description: string;
    expiryDate: string;
    linkUrl: string;
    status: 'Active' | 'Paid' | 'Expired';
}

const EMPTY: Omit<PaymentLink, 'id'> = { customer: '', amount: 0, description: '', expiryDate: '', linkUrl: '', status: 'Active' };

const PaymentLinks: React.FC = () => {
    const { items, add, remove } = usePersist<PaymentLink>('payment_links');
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { 
        const date = new Date();
        const expiryDate = new Date(date.setDate(date.getDate() + 3)).toLocaleDateString('en-CA');
        setForm({ ...EMPTY, expiryDate }); 
        setOpen(true); 
    };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        
        const newLink = {
            ...form,
            linkUrl: `https://pay.evergreen.com/link/${Date.now().toString(36)}`
        };
        add(newLink);
        toast.success('Payment Link generated');
        setOpen(false);
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Payment Links</Typography>
                    <Typography variant="body2" color="text.secondary">Generate shareable UPI/Payment links to collect payments instantly</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Generate Link</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Expiry</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Link</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No active payment links.</TableCell></TableRow>}
                            {items.slice().reverse().map(pl => (
                                <TableRow key={pl.id} hover>
                                    <TableCell><Typography fontWeight={600}>{pl.customer}</Typography></TableCell>
                                    <TableCell>{pl.description || '—'}</TableCell>
                                    <TableCell>{fmtDate(pl.expiryDate)}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={pl.status} 
                                            size="small" 
                                            color={pl.status === 'Paid' ? 'success' : pl.status === 'Expired' ? 'error' : 'primary'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(pl.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="caption" sx={{ fontFamily: 'monospace', maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {pl.linkUrl}
                                            </Typography>
                                            <IconButton size="small" onClick={() => handleCopy(pl.linkUrl)}><CopyIcon sx={{ fontSize: 14 }} /></IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Share via WhatsApp"><IconButton size="small" color="success"><ShareIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete link?')) { remove(pl.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Generate Payment Link</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Customer Name" fullWidth size="small" value={form.customer} onChange={e => setForm({ ...form, customer: e.target.value })} required /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField 
                                type="number" label="Amount (₹)" fullWidth size="small" 
                                value={form.amount || ''} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} required 
                                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField label="Purpose / Description" fullWidth size="small" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Advance for Order #123" /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField type="date" label="Link Expiry Date" fullWidth size="small" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">Generate</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PaymentLinks;
