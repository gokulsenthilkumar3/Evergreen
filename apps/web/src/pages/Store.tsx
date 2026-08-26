import React from 'react';
import { Box, Typography, Paper, Grid, Button, Chip } from '@mui/material';
import { Store as StoreIcon, PhoneAndroid as MobileIcon, Language as WebIcon, ShoppingCart as CartIcon, Sync as SyncIcon } from '@mui/icons-material';

const Store: React.FC = () => {
    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                    Launch Your Online Store
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Take your wholesale and retail business online in minutes. Fully integrated with your EverGreen inventory and billing.
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.50', mb: 4 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Chip icon={<MobileIcon />} label="Mobile App" color="primary" />
                            <Chip icon={<WebIcon />} label="B2B Web Portal" color="primary" variant="outlined" />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            Sell 24/7 without lifting a finger
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Allow your customers to view your live catalogue, place orders, and track shipments directly from their mobile app or web browser.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                            {[
                                'Live Inventory Sync (No more stock-outs)',
                                'Customer-specific Pricelists automatically applied',
                                'Instant WhatsApp & Email order confirmations',
                                'Secure UPI & Payment Gateway integrations'
                            ].map(feature => (
                                <Box key={feature} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <SyncIcon color="success" fontSize="small" />
                                    <Typography variant="body2" fontWeight={500}>{feature}</Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained" size="large" startIcon={<StoreIcon />} onClick={() => alert('Store setup initiated!')}>
                                Set Up Your Store
                            </Button>
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 5 }} sx={{ textAlign: 'center' }}>
                        <CartIcon sx={{ fontSize: 200, color: 'primary.light', opacity: 0.5 }} />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default Store;
