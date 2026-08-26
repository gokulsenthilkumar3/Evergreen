import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip, Grid, Tooltip, Avatar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

const UNITS = ['Kg', 'Bags', 'Bales', 'Meters', 'Nos', 'Litre', 'Box', 'Set'];
const GST_RATES = [0, 5, 12, 18, 28];
const PRODUCT_TYPES = ['Product', 'Service'];
const YARN_COUNTS = ['2s','4s','6s','8s','10s','12s','16s','20s','24s','30s','40s','60s','80s','100s'];

interface Product {
    id: string;
    name: string;
    type: string;
    hsnCode: string;
    unit: string;
    salePrice: number;
    purchasePrice: number;
    gstRate: number;
    category: string;
    description: string;
}

const EMPTY: Omit<Product, 'id'> = { name: '', type: 'Product', hsnCode: '5205', unit: 'Kg', salePrice: 0, purchasePrice: 0, gstRate: 18, category: 'Yarn', description: '' };

const typeColor = (t: string) => t === 'Product' ? 'primary' : 'secondary';

const ProductsServices: React.FC = () => {
    const { items, add, update, remove } = usePersist<Product>('products_services', [
        { id: 'ps-default-1', name: 'Cotton Yarn 20s', type: 'Product', hsnCode: '5205', unit: 'Kg', salePrice: 145, purchasePrice: 120, gstRate: 18, category: 'Yarn', description: 'Carded cotton yarn, 20 count' },
        { id: 'ps-default-2', name: 'Cotton Yarn 40s', type: 'Product', hsnCode: '5205', unit: 'Kg', salePrice: 210, purchasePrice: 175, gstRate: 18, category: 'Yarn', description: 'Combed cotton yarn, 40 count' },
        { id: 'ps-default-3', name: 'Cotton Yarn 30s', type: 'Product', hsnCode: '5205', unit: 'Kg', salePrice: 180, purchasePrice: 150, gstRate: 18, category: 'Yarn', description: 'Cotton yarn, 30 count' },
    ]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [search, setSearch] = useState('');

    const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setOpen(true); };
    const openEdit = (p: Product) => { setForm({ ...p }); setEditing(p); setOpen(true); };

    const handleSave = () => {
        if (!form.name.trim()) { toast.error('Product name is required'); return; }
        if (editing) { update(editing.id, form); toast.success('Product updated'); }
        else { add(form); toast.success('Product added'); }
        setOpen(false);
    };

    const filtered = items.filter(p =>
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.hsnCode.includes(search) || p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Products & Services</Typography>
                    <Typography variant="body2" color="text.secondary">Manage your product/service catalogue with HSN codes and pricing</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Product</Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                <TextField size="small" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} sx={{ width: 280 }} />
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>HSN Code</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>GST %</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Sale Price (₹)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Purchase Price (₹)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filtered.length === 0 && (
                                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.disabled' }}>No products found.</TableCell></TableRow>
                            )}
                            {filtered.map(p => (
                                <TableRow key={p.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.7rem', fontWeight: 700 }}>{p.name[0]}</Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{p.category}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Chip label={p.type} size="small" color={typeColor(p.type)} variant="outlined" /></TableCell>
                                    <TableCell><Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{p.hsnCode}</Typography></TableCell>
                                    <TableCell>{p.unit}</TableCell>
                                    <TableCell><Chip label={`${p.gstRate}%`} size="small" /></TableCell>
                                    <TableCell align="right"><Typography fontWeight={600} color="success.main">{fmtAmt(p.salePrice)}</Typography></TableCell>
                                    <TableCell align="right"><Typography variant="caption">{fmtAmt(p.purchasePrice)}</Typography></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete product?')) { remove(p.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Product' : 'Add Product / Service'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 8 }}><TextField label="Product / Service Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField select label="Type" fullWidth size="small" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    {PRODUCT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 4 }}><TextField label="HSN / SAC Code" fullWidth size="small" value={form.hsnCode} onChange={e => setForm({ ...form, hsnCode: e.target.value })} /></Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField select label="Unit" fullWidth size="small" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                    {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 4 }}>
                                <TextField select label="GST Rate (%)" fullWidth size="small" value={form.gstRate} onChange={e => setForm({ ...form, gstRate: Number(e.target.value) })}>
                                    {GST_RATES.map(r => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}><TextField type="number" label="Sale Price (₹/unit)" fullWidth size="small" value={form.salePrice || ''} onChange={e => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} /></Grid>
                            <Grid size={{ xs: 6 }}><TextField type="number" label="Purchase Price (₹/unit)" fullWidth size="small" value={form.purchasePrice || ''} onChange={e => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} /></Grid>
                        </Grid>
                        <TextField label="Category" fullWidth size="small" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Yarn, Cotton, Service" />
                        <TextField label="Description (optional)" fullWidth size="small" multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleSave} variant="contained">{editing ? 'Update' : 'Add'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProductsServices;
