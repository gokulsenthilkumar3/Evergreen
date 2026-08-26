import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Grid, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, LocalShipping as ShippingIcon } from '@mui/icons-material';
import { usePersist, today, fmtDate } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface DeliveryChallan {
    id: string;
    dcNumber: string;
    date: string;
    customer: string;
    vehicleNo: string;
    transportMode: string;
    status: 'In Transit' | 'Delivered' | 'Returned';
    notes: string;
}

const EMPTY: Omit<DeliveryChallan, 'id'> = { dcNumber: '', date: today(), customer: '', vehicleNo: '', transportMode: 'Road', status: 'In Transit', notes: '' };

const DeliveryChallans: React.FC = () => {
    const { items, add, update, remove } = usePersist<DeliveryChallan>('delivery_challans');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<DeliveryChallan | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY, dcNumber: `DC-${Date.now().toString().slice(-6)}` }); setEditing(null); setOpen(true); };
    const openEdit = (dc: DeliveryChallan) => { setForm({ ...dc }); setEditing(dc); setOpen(true); };

    const handleSave = () => {
        if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
        if (editing) { update(editing.id, form); toast.success('Delivery Challan updated'); }
        else { add(form); toast.success('Delivery Challan created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Delivery Challans</Typography>
                    <Typography variant="body2" color="text.secondary">Create and manage delivery challans for material dispatch</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Create Challan</Button>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>DC Number</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Vehicle</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>No delivery challans yet.</TableCell></TableRow>}
                            {items.slice().reverse().map(dc => (
                                <TableRow key={dc.id} hover>
                                    <TableCell><Typography fontWeight={600}>{dc.dcNumber}</Typography></TableCell>
                                    <TableCell>{fmtDate(dc.date)}</TableCell>
                                    <TableCell>{dc.customer}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ShippingIcon fontSize="small" color="action" />
                                            <Typography variant="body2">{dc.vehicleNo || '—'}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={dc.status} 
                                            size="small" 
                                            color={dc.status === 'Delivered' ? 'success' : dc.status === 'Returned' ? 'error' : 'warning'} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(dc)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete delivery challan?')) { remove(dc.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Delivery Challan' : 'Create Delivery Challan'}</DialogTitle>
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

export default DeliveryChallans;
