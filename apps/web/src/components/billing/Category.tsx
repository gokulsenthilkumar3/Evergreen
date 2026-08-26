import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Tooltip, Avatar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist } from '../../hooks/usePersist';
import { toast } from 'sonner';

const COLORS = ['#059669','#0284c7','#7c3aed','#d97706','#dc2626','#0891b2','#64748b'];

interface Category { id: string; name: string; description: string; color: string; }
const EMPTY: Omit<Category,'id'> = { name: '', description: '', color: COLORS[0] };

const Category: React.FC = () => {
    const { items, add, update, remove } = usePersist<Category>('categories', [
        { id: 'cat-1', name: 'Yarn', description: 'All yarn products by count', color: '#059669' },
        { id: 'cat-2', name: 'Cotton', description: 'Raw cotton and bales', color: '#d97706' },
        { id: 'cat-3', name: 'Packaging', description: 'Bags, labels, boxes', color: '#7c3aed' },
        { id: 'cat-4', name: 'Services', description: 'Job work and testing services', color: '#0284c7' },
    ]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setOpen(true); };
    const openEdit = (c: Category) => { setForm({ ...c }); setEditing(c); setOpen(true); };
    const handleSave = () => {
        if (!form.name.trim()) { toast.error('Name is required'); return; }
        if (editing) { update(editing.id, form); toast.success('Category updated'); }
        else { add(form); toast.success('Category created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Categories</Typography>
                    <Typography variant="body2" color="text.secondary">Organise your products and services into categories</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Category</Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {items.length === 0 && <Typography color="text.disabled">No categories yet.</Typography>}
                {items.map(c => (
                    <Paper key={c.id} elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `2px solid ${c.color}30`, bgcolor: `${c.color}08`, minWidth: 200, position: 'relative' }}>
                        <Avatar sx={{ bgcolor: c.color, width: 40, height: 40, mb: 1.5, fontSize: '1rem' }}>{c.name[0]}</Avatar>
                        <Typography fontWeight={700}>{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.description}</Typography>
                        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => openEdit(c)}><EditIcon fontSize="small" /></IconButton>
                            <IconButton size="small" color="error" onClick={() => { if (confirm('Delete category?')) { remove(c.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton>
                        </Box>
                    </Paper>
                ))}
            </Box>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Category Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        <TextField label="Description" fullWidth size="small" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        <Box>
                            <Typography variant="caption" color="text.secondary" gutterBottom>Colour</Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                {COLORS.map(col => (
                                    <Box key={col} onClick={() => setForm({ ...form, color: col })}
                                        sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: col, cursor: 'pointer', border: form.color === col ? '3px solid #000' : '3px solid transparent', transition: 'border 0.1s' }} />
                                ))}
                            </Box>
                        </Box>
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

export default Category;
