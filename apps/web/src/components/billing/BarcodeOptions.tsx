import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, TextField, Grid, Switch, FormControlLabel,
    Divider, IconButton, InputAdornment, Card, CardContent
} from '@mui/material';
import { Print as PrintIcon, QrCode2 as BarcodeIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { toast } from 'sonner';

const BarcodeOptions: React.FC = () => {
    const [settings, setSettings] = useState({
        enableBarcodeScan: true,
        autoAddOnScan: true,
        printBarcodeOnInvoice: false,
        barcodeType: 'CODE128',
        defaultQuantity: 1
    });

    const [testInput, setTestInput] = useState('');

    const handleSave = () => {
        // In a real app, save to backend/context
        toast.success('Barcode settings saved successfully');
    };

    const handleSimulateScan = () => {
        if (!testInput) {
            toast.error('Enter a barcode to test');
            return;
        }
        toast.info(`Scanned: ${testInput}. ${settings.autoAddOnScan ? 'Item would be added to invoice.' : 'Item selected.'}`);
        setTestInput('');
    };

    return (
        <Box sx={{ maxWidth: 800 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Barcode Options</Typography>
                    <Typography variant="body2" color="text.secondary">Configure barcode scanning for fast billing</Typography>
                </Box>
                <Button variant="contained" startIcon={<SettingsIcon />} onClick={handleSave}>Save Settings</Button>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight={700} mb={2}>Scanning Preferences</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel 
                                control={<Switch checked={settings.enableBarcodeScan} onChange={e => setSettings({ ...settings, enableBarcodeScan: e.target.checked })} />} 
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Enable Barcode Scanning</Typography>
                                        <Typography variant="caption" color="text.secondary">Allow adding items to invoice via barcode scanner</Typography>
                                    </Box>
                                } 
                            />
                            <Divider />
                            <FormControlLabel 
                                control={<Switch checked={settings.autoAddOnScan} onChange={e => setSettings({ ...settings, autoAddOnScan: e.target.checked })} disabled={!settings.enableBarcodeScan} />} 
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Auto-add on scan</Typography>
                                        <Typography variant="caption" color="text.secondary">Automatically add 1 unit to the invoice when scanned (instead of just selecting the item)</Typography>
                                    </Box>
                                } 
                            />
                            <Divider />
                            <FormControlLabel 
                                control={<Switch checked={settings.printBarcodeOnInvoice} onChange={e => setSettings({ ...settings, printBarcodeOnInvoice: e.target.checked })} />} 
                                label={
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>Print Barcode on Invoice</Typography>
                                        <Typography variant="caption" color="text.secondary">Include the Invoice Number as a scannable barcode on printed invoices</Typography>
                                    </Box>
                                } 
                            />
                        </Box>

                        <Typography variant="subtitle1" fontWeight={700} mt={4} mb={2}>Advanced</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField select label="Barcode Standard" fullWidth size="small" value={settings.barcodeType} onChange={e => setSettings({ ...settings, barcodeType: e.target.value })} SelectProps={{ native: true }}>
                                    <option value="CODE128">CODE-128 (Recommended)</option>
                                    <option value="UPC">UPC</option>
                                    <option value="EAN13">EAN-13</option>
                                    <option value="QR">QR Code</option>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField type="number" label="Default Scan Quantity" fullWidth size="small" value={settings.defaultQuantity} onChange={e => setSettings({ ...settings, defaultQuantity: parseInt(e.target.value) || 1 })} disabled={!settings.autoAddOnScan} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card elevation={0} sx={{ border: '2px dashed', borderColor: 'primary.main', bgcolor: 'primary.50', borderRadius: 3 }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <BarcodeIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" fontWeight={700} gutterBottom>Test Scanner</Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                Connect your barcode scanner and scan a product, or type a code below to test.
                            </Typography>
                            <TextField 
                                fullWidth size="small" 
                                placeholder="Scan or type here..." 
                                value={testInput}
                                onChange={e => setTestInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSimulateScan()}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={handleSimulateScan} color="primary"><PrintIcon fontSize="small" /></IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BarcodeOptions;
