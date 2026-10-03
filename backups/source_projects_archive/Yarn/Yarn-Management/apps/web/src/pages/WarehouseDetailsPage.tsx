import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, TableContainer } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../lib/http';
import { useThemeContext } from '../context/ThemeContext';
import { notify } from '../context/NotificationContext';
import QrCodeIcon from '@mui/icons-material/QrCode';

export default function WarehouseDetailsPage() {
    const { id } = useParams();
    const [warehouse, setWarehouse] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [qrOpen, setQrOpen] = useState(false);
    const [qrData, setQrData] = useState<string | null>(null);
    const [qrTitle, setQrTitle] = useState('');
    const [form, setForm] = useState({ code: '', zone: '', rack: '', bin: '', capacity: '' });
    const navigate = useNavigate();
    const { mode } = useThemeContext();

    useEffect(() => { loadWarehouse(); }, [id]);

    const loadWarehouse = async () => {
        try {
            const res = await http.get(`/inventory/warehouses/${id}`);
            setWarehouse(res.data.warehouse);
        } catch (e) { console.error(e); }
    };

    const handleAddLocation = async () => {
        try {
            await http.post(`/inventory/warehouses/${id}/locations`, {
                ...form,
                capacity: form.capacity ? Number(form.capacity) : undefined
            });
            setOpen(false);
            setForm({ code: '', zone: '', rack: '', bin: '', capacity: '' });
            loadWarehouse();
            notify.showSuccess('Location added successfully');
        } catch (e) { notify.showError('Failed to add location'); }
    };

    const handleShowQr = async (text: string, title: string) => {
        try {
            const res = await http.get(`/inventory/qrcode?text=${encodeURIComponent(text)}`);
            setQrData(res.data.dataUrl);
            setQrTitle(title);
            setQrOpen(true);
        } catch (e) { notify.showError('Failed to generate QR'); }
    };

    if (!warehouse) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/warehouse')} sx={{ mb: 2 }}>Back to Warehouses</Button>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4">{warehouse.name}</Typography>
                    <Typography color="text.secondary">{warehouse.code} | {warehouse.type}</Typography>
                </Box>
                <Button variant="contained" onClick={() => setOpen(true)}>Add Location</Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>Storage Locations</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Location Code</TableCell>
                                        <TableCell>Zone/Rack/Bin</TableCell>
                                        <TableCell>Capacity (kg)</TableCell>
                                        <TableCell>Current Usage</TableCell>
                                        <TableCell>Items</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {warehouse.locations?.map((loc: any) => (
                                        <TableRow key={loc.id}>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle2">{loc.code}</Typography>
                                                    <IconButton size="small" onClick={() => handleShowQr(loc.id, `Location: ${loc.code}`)}>
                                                        <QrCodeIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>{loc.zone || '-'}{loc.rack ? ` / ${loc.rack}` : ''}{loc.bin ? ` / ${loc.bin}` : ''}</TableCell>
                                            <TableCell>{loc.capacity || 'Unlimited'}</TableCell>
                                            <TableCell>{loc.currentUsage || 0}</TableCell>
                                            <TableCell>
                                                <Chip label={`${loc._count?.rawMaterials || 0} Materials`} size="small" sx={{ mr: 1 }} />
                                                <Chip label={`${loc._count?.finishedGoods || 0} Products`} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {warehouse.locations?.length === 0 && (
                                        <TableRow><TableCell colSpan={5} align="center">No locations defined</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add New Storage Location</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}><TextField label="Location Code (e.g. Z1-R1-B1)" fullWidth value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></Grid>
                        <Grid item xs={4}><TextField label="Zone" fullWidth value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} /></Grid>
                        <Grid item xs={4}><TextField label="Rack" fullWidth value={form.rack} onChange={e => setForm({ ...form, rack: e.target.value })} /></Grid>
                        <Grid item xs={4}><TextField label="Bin" fullWidth value={form.bin} onChange={e => setForm({ ...form, bin: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField label="Capacity (kg)" type="number" fullWidth value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddLocation} variant="contained">Add</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
                <DialogTitle>{qrTitle}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                    {qrData ? <img src={qrData} alt="QR Code" style={{ width: 250, height: 250 }} /> : <Typography>Generating...</Typography>}
                    <Typography variant="caption" sx={{ mt: 2, fontFamily: 'monospace' }}>Scan to identify this location</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQrOpen(false)}>Close</Button>
                    <Button onClick={() => window.print()} variant="outlined">Print</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
