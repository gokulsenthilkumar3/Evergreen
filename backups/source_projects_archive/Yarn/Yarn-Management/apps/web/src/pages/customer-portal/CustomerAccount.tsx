import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { apiClient } from '../../lib/api';

export default function CustomerAccount() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [account, setAccount] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        notes: '',
    });

    useEffect(() => {
        fetchAccount();
    }, []);

    const fetchAccount = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/customer-portal/account');
            setAccount(res.data.account);
            setFormData({
                email: res.data.account.email || '',
                phone: res.data.account.phone || '',
                notes: res.data.account.notes || '',
            });
        } catch (error) {
            console.error('Failed to fetch account:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage('');
            await apiClient.put('/customer-portal/account', formData);
            setMessage('Account updated successfully');
            fetchAccount();
        } catch (error) {
            console.error('Failed to update account:', error);
            setMessage('Failed to update account');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!account) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Account not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Account
            </Typography>

            {message && (
                <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Account Information */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Account Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Customer Name"
                                    value={account.name}
                                    disabled
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    variant="outlined"
                                />
                            </Grid>
                            {account.gstin && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="GSTIN"
                                        value={account.gstin}
                                        disabled
                                        variant="outlined"
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Addresses */}
                    {account.addresses && account.addresses.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Addresses
                            </Typography>
                            <Grid container spacing={2}>
                                {account.addresses.map((address: any, index: number) => (
                                    <Grid item xs={12} sm={6} key={address.id}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                                {address.type} Address {address.isDefault && '(Default)'}
                                            </Typography>
                                            <Typography variant="body2">{address.line1}</Typography>
                                            {address.line2 && <Typography variant="body2">{address.line2}</Typography>}
                                            <Typography variant="body2">
                                                {address.city}, {address.state} - {address.pincode}
                                            </Typography>
                                            <Typography variant="body2">{address.country}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    {/* Account Summary */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Account Summary
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">
                            Customer Category
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {account.category}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">
                            Lifecycle Stage
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {account.lifecycleStage}
                        </Typography>

                        {account.creditLimit && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Credit Limit
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    ₹{Number(account.creditLimit).toLocaleString()}
                                </Typography>
                            </>
                        )}

                        {account.creditTerms && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary">
                                    Credit Terms
                                </Typography>
                                <Typography variant="body1">{account.creditTerms}</Typography>
                            </>
                        )}
                    </Paper>

                    {/* Contacts */}
                    {account.contacts && account.contacts.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Contact Persons
                            </Typography>
                            {account.contacts.map((contact: any) => (
                                <Box key={contact.id} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2">
                                        {contact.name} {contact.isPrimary && '(Primary)'}
                                    </Typography>
                                    {contact.designation && (
                                        <Typography variant="body2" color="text.secondary">
                                            {contact.designation}
                                        </Typography>
                                    )}
                                    {contact.email && (
                                        <Typography variant="body2">{contact.email}</Typography>
                                    )}
                                    {contact.phone && (
                                        <Typography variant="body2">{contact.phone}</Typography>
                                    )}
                                    <Divider sx={{ mt: 1 }} />
                                </Box>
                            ))}
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
