import { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Typography,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { http } from '../../lib/http';

export default function FinishedGoodsList() {
    const [goods, setGoods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [qrOpen, setQrOpen] = useState(false);
    const [qrData, setQrData] = useState<string | null>(null);
    const [qrTitle, setQrTitle] = useState('');

    useEffect(() => {
        load();
    }, []);

    async function load() {
        setLoading(true);
        try {
            const res = await http.get('/finished-goods');
            setGoods(res.data.finishedGoods);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <LinearProgress />;

    const handleShowQr = async (text: string, title: string) => {
        try {
            const res = await http.get(`/inventory/qrcode?text=${encodeURIComponent(text)}`);
            setQrData(res.data.dataUrl);
            setQrTitle(title);
            setQrOpen(true);
        } catch (e) { console.error('Failed to generate QR', e); }
    };

    return (
        <Box>
            <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Batch No</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Yarn Count</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Quantity (kg)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Packed Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Days in Stock</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {goods.length === 0 ? (
                            <TableRow><TableCell colSpan={8} align="center">No finished goods in stock</TableCell></TableRow>
                        ) : (
                            goods.map((item) => {
                                const daysInStock = Math.floor((new Date().getTime() - new Date(item.packingDate).getTime()) / (1000 * 3600 * 24));
                                return (
                                    <TableRow key={item.id} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>{item.batch?.batchNumber}</TableCell>
                                        <TableCell>{item.batch?.rawMaterial?.materialType}</TableCell>
                                        <TableCell><Chip label={item.yarnCount} size="small" color="primary" variant="outlined" /></TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{item.producedQuantity}</TableCell>
                                        <TableCell>{item.qualityGrade || '-'}</TableCell>
                                        <TableCell>{new Date(item.packingDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.warehouseLocation?.code ? `${item.warehouseLocation.warehouse?.name} - ${item.warehouseLocation.code}` : item.legacyLocation || 'Main Warehouse'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${daysInStock} days`}
                                                size="small"
                                                color={daysInStock > 30 ? 'warning' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" color="primary" onClick={() => handleShowQr(item.id, `Product: ${item.batch?.batchNumber}`)}>
                                                <QrCodeIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={qrOpen} onClose={() => setQrOpen(false)}>
                <DialogTitle>{qrTitle}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
                    {qrData ? <img src={qrData} alt="QR Code" style={{ width: 250, height: 250 }} /> : <Typography>Generating...</Typography>}
                    <Typography variant="caption" sx={{ mt: 2, fontFamily: 'monospace' }}>Product Batch Identification QR</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQrOpen(false)}>Close</Button>
                    <Button onClick={() => window.print()} variant="outlined">Print</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
