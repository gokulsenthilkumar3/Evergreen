import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, MenuItem, TableContainer, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';
import { useThemeContext } from '../context/ThemeContext';

export default function InventoryReconciliationPage() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [openModal, setOpenModal] = useState(false);
    const [newAudit, setNewAudit] = useState({ warehouseId: '', notes: '' });
    const navigate = useNavigate();
    const { mode } = useThemeContext();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sessionsRes, warehousesRes] = await Promise.all([
                http.get('/inventory/reconciliation'),
                http.get('/inventory/warehouses')
            ]);
            setSessions(sessionsRes.data.sessions);
            setWarehouses(warehousesRes.data.warehouses);
        } catch (e) {
            notify.showError('Failed to load reconciliation data');
        }
    };

    const handleStartAudit = async () => {
        if (!newAudit.warehouseId) {
            notify.showError('Please select a warehouse');
            return;
        }
        try {
            const res = await http.post('/inventory/reconciliation', newAudit);
            notify.showSuccess('Audit session started');
            setOpenModal(false);
            navigate(`/warehouse/reconciliation/${res.data.session.id}`);
        } catch (e) {
            notify.showError('Failed to start audit');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Inventory Reconciliation</Typography>
                <Button variant="contained" startIcon={<AssessmentIcon />} onClick={() => setOpenModal(true)}>
                    New Audit Session
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>Audit History</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Session No.</TableCell>
                                        <TableCell>Warehouse</TableCell>
                                        <TableCell>Items</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sessions.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, opacity: 0.5 }}>No audit sessions found</TableCell></TableRow>
                                    ) : (
                                        sessions.map((s) => (
                                            <TableRow key={s.id} hover onClick={() => navigate(`/warehouse/reconciliation/${s.id}`)} sx={{ cursor: 'pointer' }}>
                                                <TableCell sx={{ fontWeight: 'bold' }}>{s.reconcileNo}</TableCell>
                                                <TableCell>{s.warehouse.name}</TableCell>
                                                <TableCell>{s._count?.items || 0} items</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={s.status}
                                                        color={s.status === 'COMPLETED' ? 'success' : s.status === 'PENDING' ? 'warning' : 'default'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Button size="small">View Details</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Start Audit Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Start New Audit Session</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            select
                            label="Target Warehouse"
                            fullWidth
                            value={newAudit.warehouseId}
                            onChange={(e) => setNewAudit({ ...newAudit, warehouseId: e.target.value })}
                        >
                            {warehouses.map(w => (
                                <MenuItem key={w.id} value={w.id}>{w.name} ({w.code})</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Audit Notes"
                            fullWidth
                            multiline
                            rows={3}
                            value={newAudit.notes}
                            onChange={(e) => setNewAudit({ ...newAudit, notes: e.target.value })}
                            placeholder="e.g. Monthly stock take Jan 2026"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleStartAudit}>Initialize Session</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
