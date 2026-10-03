import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Alert, CircularProgress, IconButton, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';
import { useThemeContext } from '../context/ThemeContext';

export default function ReconciliationWorkspacePage() {
    const { id } = useParams();
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const navigate = useNavigate();
    const { mode } = useThemeContext();

    useEffect(() => { loadSession(); }, [id]);

    const loadSession = async () => {
        try {
            const res = await http.get(`/inventory/reconciliation/${id}`);
            setSession(res.data.session);
        } catch (e) {
            notify.showError('Failed to load session');
            navigate('/warehouse/reconciliation');
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index: number, value: string) => {
        const newItems = [...session.items];
        const physical = value === '' ? null : Number(value);
        newItems[index].physicalQuantity = physical;
        if (physical !== null) {
            newItems[index].difference = physical - Number(newItems[index].systemQuantity);
        } else {
            newItems[index].difference = null;
        }
        setSession({ ...session, items: newItems });
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            await http.patch(`/inventory/reconciliation/${id}/items`, {
                items: session.items.map((i: any) => ({
                    id: i.id,
                    physicalQuantity: i.physicalQuantity,
                    notes: i.notes
                }))
            });
            notify.showSuccess('Draft saved');
        } catch (e) {
            notify.showError('Failed to save draft');
        } finally {
            setSaving(false);
        }
    };

    const handleFinalize = async () => {
        if (!window.confirm('Are you sure you want to finalize this audit? Stock levels will be updated based on your physical counts.')) return;

        setFinalizing(true);
        try {
            await http.post(`/inventory/reconciliation/${id}/finalize`);
            notify.showSuccess('Audit finalized and stock adjusted');
            navigate('/warehouse/reconciliation');
        } catch (e) {
            notify.showError('Failed to finalize audit');
        } finally {
            setFinalizing(false);
        }
    };

    if (loading) return <CircularProgress />;

    const isFinalized = session.status === 'COMPLETED';

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/warehouse/reconciliation')}><ArrowBackIcon /></IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Audit Workspace</Typography>
                        <Typography color="text.secondary">{session.reconcileNo} | {session.warehouse.name}</Typography>
                    </Box>
                </Box>
                {!isFinalized && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button variant="outlined" startIcon={<SaveIcon />} onClick={handleSaveDraft} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handleFinalize} disabled={finalizing}>
                            {finalizing ? 'Finalizing...' : 'Finalize Audit'}
                        </Button>
                    </Box>
                )}
            </Box>

            {isFinalized && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    This audit was finalized on {new Date(session.finalizedAt).toLocaleString()} by {session.finalizedBy}.
                    All discrepancies have been resolved in the system inventory.
                </Alert>
            )}

            <Paper sx={{ bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">System Qty</TableCell>
                            <TableCell align="right">Physical Qty</TableCell>
                            <TableCell align="right">Difference</TableCell>
                            <TableCell>Result</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {session.items.map((item: any, idx: number) => (
                            <TableRow key={item.id} sx={item.difference !== 0 && item.difference !== null ? { bgcolor: 'error.main', opacity: 0.1 } : {}}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{item.itemName}</TableCell>
                                <TableCell><Chip label={item.itemType} size="small" /></TableCell>
                                <TableCell align="right">{item.systemQuantity} kg</TableCell>
                                <TableCell align="right">
                                    <TextField
                                        size="small"
                                        type="number"
                                        disabled={isFinalized}
                                        value={item.physicalQuantity ?? ''}
                                        onChange={(e) => handleItemChange(idx, e.target.value)}
                                        sx={{ width: 120 }}
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: item.difference < 0 ? 'error.main' : item.difference > 0 ? 'success.main' : 'inherit' }}>
                                    {item.difference !== null ? `${item.difference > 0 ? '+' : ''}${item.difference} kg` : '-'}
                                </TableCell>
                                <TableCell>
                                    {item.difference === 0 ? <Chip label="Match" color="success" size="small" /> : item.difference !== null ? <Chip label="Discrepancy" color="error" size="small" /> : <Chip label="Pending" variant="outlined" size="small" />}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}
