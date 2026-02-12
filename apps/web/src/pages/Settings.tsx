import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    Save as SaveIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

import Logs from './Logs';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const Settings: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const queryClient = useQueryClient();

    // Fetch Settings
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data;
        }
    });

    // Company Settings State
    const [companySettings, setCompanySettings] = useState({
        companyName: '',
        address: '',
        gstin: '',
        phone: '',
        email: '',
    });

    // System Settings State
    const [systemSettings, setSystemSettings] = useState({
        autoBackup: true,
        emailNotifications: true,
        lowStockAlert: true,
        lowStockThreshold: '',
        maintenanceRate: '',
        ebRate: '',
        packageRate: '',
    });

    // Populate state when data is fetched
    useEffect(() => {
        if (settings) {
            setCompanySettings({
                companyName: settings.companyName || '',
                address: settings.address || '',
                gstin: settings.gstin || '',
                phone: settings.phone || '',
                email: settings.email || '',
            });
            setSystemSettings({
                autoBackup: settings.autoBackup ?? true,
                emailNotifications: settings.emailNotifications ?? true,
                lowStockAlert: settings.lowStockAlert ?? true,
                lowStockThreshold: settings.lowStockThreshold || '500',
                maintenanceRate: settings.maintenanceRate || '4',
                ebRate: settings.ebRate || '10',
                packageRate: settings.packageRate || '1.6',
            });
        }
    }, [settings]);

    // Update Settings Mutation
    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.put('/settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            setNotification({ open: true, message: 'Settings saved successfully!', severity: 'success' });
        },
        onError: () => {
            setNotification({ open: true, message: 'Failed to save settings', severity: 'error' });
        }
    });

    const handleSaveCompanySettings = () => {
        updateSettingsMutation.mutate({
            ...companySettings
        });
    };

    const handleSaveSystemSettings = () => {
        updateSettingsMutation.mutate({
            ...systemSettings
        });
    };



    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
                Settings
            </Typography>

            <Paper>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Company Info" />
                    <Tab label="System Settings" />

                    <Tab label="Audit Logs" />
                </Tabs>

                {/* Company Info Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Company Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Company Name"
                                value={companySettings.companyName}
                                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Address"
                                value={companySettings.address}
                                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                label="GSTIN"
                                value={companySettings.gstin}
                                onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Phone"
                                value={companySettings.phone}
                                onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Email"
                                type="email"
                                value={companySettings.email}
                                onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                fullWidth
                            />
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCompanySettings} sx={{ mt: 2 }}>
                                Save Company Info
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* System Settings Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            System Configuration
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={systemSettings.autoBackup}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
                                    />
                                }
                                label="Enable Auto Backup"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={systemSettings.emailNotifications}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                                    />
                                }
                                label="Email Notifications"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={systemSettings.lowStockAlert}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, lowStockAlert: e.target.checked })}
                                    />
                                }
                                label="Low Stock Alerts"
                            />
                            <TextField
                                label="Low Stock Threshold (kg)"
                                type="number"
                                value={systemSettings.lowStockThreshold}
                                onChange={(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="EB Rate (₹/unit)"
                                type="number"
                                value={systemSettings.ebRate}
                                onChange={(e) => setSystemSettings({ ...systemSettings, ebRate: e.target.value })}
                                fullWidth
                                helperText="Electricity cost per unit (kWh)"
                            />
                            <TextField
                                label="Package Rate (₹/kg)"
                                type="number"
                                value={systemSettings.packageRate}
                                onChange={(e) => setSystemSettings({ ...systemSettings, packageRate: e.target.value })}
                                fullWidth
                                helperText="Packaging cost per kg of yarn"
                            />
                            <TextField
                                label="Maintenance Rate (₹/kg)"
                                type="number"
                                value={systemSettings.maintenanceRate}
                                onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceRate: e.target.value })}
                                fullWidth
                                helperText="Maintenance cost per kg of yarn"
                            />

                            <Paper sx={{ p: 2, bgcolor: 'background.default', border: '1px dashed grey' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Default Currency: INR (₹)</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Base currency is fixed to Indian Rupee.
                                </Typography>
                            </Paper>

                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSystemSettings} sx={{ mt: 2 }}>
                                Save System Settings
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>



                {/* Audit Logs Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Logs />
                </TabPanel>
            </Paper>

            <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
                <Alert severity={notification.severity}>{notification.message}</Alert>
            </Snackbar>


        </Box>
    );
};

export default Settings;
