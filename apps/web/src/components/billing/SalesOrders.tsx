import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface SalesOrder {
    id: string;
    soNumber: string;
    date: string;
    deliveryDate: string;
    customer: string;
    amount: number;
    status: 'Open' | 'Partially Fulfilled' | 'Fulfilled' | 'Cancelled';
    notes: string;
}

const EMPTY: Omit<SalesOrder, 'id'> = { soNumber: '', date: today(), deliveryDate: '', customer: '', amount: 0, status: 'Open', notes: '' };

const SalesOrders: React.FC = () => {
    const { items, add, update, remove } = usePersist<SalesOrder>('sales_orders');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<SalesOrder | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { 
        const date = new Date();
        const deliveryDate = new Date(date.setDate(date.getDate() + 7)).toLocaleDateString('en-CA');
        setForm({ ...EMPTY, soNumber: `SO-${Date.now().toString().slice(-6)}`, deliveryDate }); 
        setEditing(null); 
        setOpen(true); 
    };
    const openEdit = (so: SalesOrder) => { setForm({ ...so }); setEditing(so); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (form.amount <= 0) { toast.error('Amount must be greater than 0'); return; }
        if (editing) { update(editing.id, form); toast.success('Sales Order updated'); }
        else { add(form); toast.success('Sales Order created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Sales Orders</Typography>
                    <Typography variant="body2" color="text.secondary">Track and manage customer orders before invoicing</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Sales Order</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>SO Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Delivery Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.disabled' }}>No sales orders yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(so => (
                                <TableRow key={so.id} hover>
                                    <TableCell><Typography fontWeight={600}>{so.soNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(so.date)}</TableCell>
                                    <TableCell>{fmtDate(so.deliveryDate)}</TableCell>
                                    <TableCell>{so.customer}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={so.status} 
                                            size="small" 
                                            color={so.status === 'Fulfilled' ? 'success' : so.status === 'Cancelled' ? 'error' : so.status === 'Open' ? 'primary' : 'warning'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="right"><Typography fontWeight={700}>{fmtAmt(so.amount)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Convert to Invoice"><IconButton size="small" color="primary"><CopyIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(so)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete sales order?')) { remove(so.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Sales Order' : 'Create Sales Order'}</DialogTitle>
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

export default SalesOrders;
