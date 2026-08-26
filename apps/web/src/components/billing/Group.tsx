import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Tooltip, Avatar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { usePersist } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface Group { id: string; name: string; description: string; discount: number; }
const EMPTY: Omit<Group,'id'> = { name: '', description: '', discount: 0 };

const Group: React.FC = () => {
    const { items, add, update, remove } = usePersist<Group>('product_groups', [
        { id: 'grp-1', name: 'Carded Yarn', description: 'Carded counts: 4s, 6s, 8s, 10s, 20s', discount: 0 },
        { id: 'grp-2', name: 'Combed Yarn', description: 'Combed counts: 30s, 40s, 60s, 80s', discount: 2 },
        { id: 'grp-3', name: 'Bulk Buyers', description: 'Customers buying 10+ tons per month', discount: 3 },
    ]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Group | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setOpen(true); };
    const openEdit = (g: Group) => { setForm({ ...g }); setEditing(g); setOpen(true); };
    const handleSave = () => {
        if (!form.name.trim()) { toast.error('Group name is required'); return; }
        if (editing) { update(editing.id, form); toast.success('Group updated'); }
        else { add(form); toast.success('Group created'); }
        setOpen(false);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Groups</Typography>
                    <Typography variant="body2" color="text.secondary">Create product groups and assign group-level discounts</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Group</Button>
            </Box>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Group Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Discount (%)</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.disabled' }}>No groups yet.</TableCell></TableRow>}
                            {items.map(g => (
                                <TableRow key={g.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>{g.name[0]}</Avatar>
                                            <Typography variant="body2" fontWeight={600}>{g.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell><Typography variant="body2" color="text.secondary">{g.description}</Typography></TableCell>
                                    <TableCell align="center"><Chip label={g.discount > 0 ? `-${g.discount}%` : 'No discount'} size="small" color={g.discount > 0 ? 'success' : 'default'} variant="outlined" /></TableCell>
                                    <TableCell>
                                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(g)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => { if (confirm('Delete group?')) { remove(g.id); toast.success('Deleted'); } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>{editing ? 'Edit Group' : 'Add Group'}</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField label="Group Name" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        <TextField label="Description" fullWidth size="small" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        <TextField type="number" label="Group Discount (%)" fullWidth size="small" value={form.discount || ''} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} helperText="Applied to all members of this group" />
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

export default Group;
