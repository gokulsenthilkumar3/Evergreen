import React from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Chip, Tooltip
} from '@mui/material';
import { Restore as RestoreIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import { usePersist, fmtDate } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface DeletedItem {
    id: string;
    type: string;
    reference: string;
    deletedAt: string;
    deletedBy: string;
}

const DeletedView: React.FC = () => {
    // In a real app this would fetch from a soft-delete API endpoint
    const { items, remove } = usePersist<DeletedItem>('deleted_items', [
        { id: 'del-1', type: 'Invoice', reference: 'INV-398492', deletedAt: new Date().toISOString(), deletedBy: 'Admin' },
        { id: 'del-2', type: 'Customer', reference: 'Global Textiles Ltd', deletedAt: new Date(Date.now() - 86400000).toISOString(), deletedBy: 'Admin' },
        { id: 'del-3', type: 'Quotation', reference: 'QT-99120', deletedAt: new Date(Date.now() - 86400000 * 2).toISOString(), deletedBy: 'User' },
    ]);

    const handleRestore = (id: string) => {
        remove(id);
        toast.success('Item restored successfully');
    };

    const handlePermDelete = (id: string) => {
        if (confirm('Permanently delete this item? This action cannot be undone.')) {
            remove(id);
            toast.success('Item permanently deleted');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700} color="error.main">Recycle Bin / Deleted Items</Typography>
                <Typography variant="body2" color="text.secondary">View and restore recently deleted records. Items are permanently deleted after 30 days.</Typography>
            </Box>
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Item Type</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Deleted At</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Deleted By</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>Recycle bin is empty.</TableCell></TableRow>}
                            {items.map(item => (
                                <TableRow key={item.id} hover>
                                    <TableCell><Chip label={item.type} size="small" variant="outlined" /></TableCell>
                                    <TableCell><Typography fontWeight={600}>{item.reference}</Typography></TableCell>
                                    <TableCell>{fmtDate(item.deletedAt.split('T')[0])} {new Date(item.deletedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                                    <TableCell>{item.deletedBy}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Restore"><IconButton size="small" color="primary" onClick={() => handleRestore(item.id)}><RestoreIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Delete Permanently"><IconButton size="small" color="error" onClick={() => handlePermDelete(item.id)}><DeleteForeverIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default DeletedView;
