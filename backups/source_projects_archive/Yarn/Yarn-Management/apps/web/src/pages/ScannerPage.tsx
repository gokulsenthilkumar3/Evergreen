import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Card, CardContent, Chip, CircularProgress } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { http } from '../lib/http';
import { useThemeContext } from '../context/ThemeContext';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';

export default function ScannerPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [itemDetails, setItemDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { mode } = useThemeContext();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            scanner.clear();
            setScanResult(decodedText);
            fetchDetails(decodedText);
        }

        function onScanFailure(error: any) {
            // console.warn(`Code scan error = ${error}`);
        }

        return () => {
            scanner.clear().catch(e => console.error("Failed to clear scanner", e));
        };
    }, []);

    const fetchDetails = async (id: string) => {
        setLoading(true);
        try {
            // Try Raw Material first, then Finished Good
            let res;
            try {
                res = await http.get(`/raw-materials/${id}`);
                setItemDetails({ ...res.data.rawMaterial, type: 'RAW_MATERIAL' });
            } catch (e) {
                res = await http.get(`/finished-goods/${id}`);
                setItemDetails({ ...res.data.finishedGood, type: 'FINISHED_GOOD' });
            }
        } catch (error) {
            alert('Item not found or invalid QR code');
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanResult(null);
        setItemDetails(null);
        window.location.reload(); // Simplest way to re-init the scanner div
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <QrCodeScannerIcon fontSize="large" />
                Inventory Scanner
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>Live Scanner</Typography>
                        {!scanResult && (
                            <div id="reader" style={{ width: '100%' }}></div>
                        )}
                        {scanResult && (
                            <Box sx={{ p: 2, textAlign: 'center' }}>
                                <Typography color="success.main" variant="h6">Scan Successful!</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>ID: {scanResult}</Typography>
                                <Button variant="outlined" onClick={resetScanner}>Scan Another</Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, minHeight: 400, bgcolor: mode === 'light' ? '#fff' : '#1e293b' }}>
                        <Typography variant="h6" gutterBottom>Item Details</Typography>
                        {loading && <CircularProgress />}
                        {!itemDetails && !loading && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10, opacity: 0.5 }}>
                                <InventoryIcon sx={{ fontSize: 60, mb: 2 }} />
                                <Typography>Scan a QR code to view details</Typography>
                            </Box>
                        )}
                        {itemDetails && (
                            <Card variant="outlined" sx={{ bgcolor: 'transparent' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h5">{itemDetails.batchNo || itemDetails.batch?.batchNumber}</Typography>
                                        <Chip label={itemDetails.type} color="primary" />
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Quantity</Typography>
                                            <Typography variant="body1">{itemDetails.quantity || itemDetails.producedQuantity} {itemDetails.unit || 'kg'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Status</Typography>
                                            <Typography variant="body1">{itemDetails.status || 'Packed'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Location</Typography>
                                            <Typography variant="body1">{itemDetails.warehouseLocation || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Date</Typography>
                                            <Typography variant="body1">{new Date(itemDetails.receivedDate || itemDetails.packingDate).toLocaleDateString()}</Typography>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                                        <Button variant="contained" startIcon={<HistoryIcon />}>View History</Button>
                                        <Button variant="outlined">Transfer Item</Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
