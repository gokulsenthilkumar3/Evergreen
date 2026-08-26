import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface PurchaseOrder {
    id: string;
    poNumber: string;
    date: string;
    expectedDelivery: string;
    vendor: string;
    amount: number;
    status: 'Draft' | 'Sent' | 'Partially Received' | 'Received' | 'Cancelled';
    notes: string;
}

const EMPTY: Omit<PurchaseOrder, 'id'> = { poNumber: '', date: today(), expectedDelivery: '', vendor: '', amount: 0, status: 'Draft', notes: '' };

const PurchaseOrders: React.FC = () => {
    const { items, add, update, remove } = usePersist<PurchaseOrder>('purchase_orders');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<PurchaseOrder | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { 
        const date = new Date();
        const expectedDelivery = new Date(date.setDate(date.getDate() + 10)).toLocaleDateString('en-CA');
        setForm({ ...EMPTY, poNumber: `PO-${Date.now().toString().slice(-6)}`, expectedDelivery }); 
        setEditing(null); 
        setOpen(true); 
    };
    const openEdit = (po: PurchaseOrder) => { setForm({ ...po }); setEditing(po); setOpen(true); };

    const handleSave = () => {
        if (!form.vendor.trim()) { toast.error('Vendor name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Purchase Order updated'); }
        else { add(form); toast.success('Purchase Order created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Purchase Orders</Typography>
                    <Typography variant="body2" color="text.secondary">Create and manage purchase orders for your vendors</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Purchase Order</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Expected Delivery</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Vendor</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No purchase orders yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(po => (
                                <TableRow key={po.id} hover>
                                    <TableCell><Typography fontWeight={600}>{po.poNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(po.date)}</TableCell>
                                    <TableCell>{fmtDate(po.expectedDelivery)}</TableCell>
                                    <TableCell>{po.vendor}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={po.status} 
                                            size="small" 
                                            color={po.status === 'Received' ? 'success' : po.status === 'Cancelled' ? 'error' : po.status === 'Draft' ? 'default' : 'warning'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(po.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(po)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete purchase order?')) { remove(po.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Purchase Order' : 'Create Purchase Order'}</DialogTitle>
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

export default PurchaseOrders;
