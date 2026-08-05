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
    MenuItem,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import {
    Save as SaveIcon,
    CloudUpload as UploadIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '../utils/messages';
import { validateRate, validateGST } from '../utils/validators';
import type { ThemeName } from '../theme';

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

interface SettingsProps {
    username?: string;
    themeName?: ThemeName;
    onThemeChange?: (name: ThemeName) => void;
    floatingNav?: boolean;
    onFloatingNavChange?: (val: boolean) => void;
}

const THEME_OPTIONS: { name: ThemeName; label: string; color: string; dark?: string }[] = [
    { name: 'emerald', label: 'Emerald',  color: '#059669', dark: '#34d399' },
    { name: 'forest',  label: 'Forest',   color: '#2d6a4f', dark: '#52b788' },
    { name: 'mint',    label: 'Mint',     color: '#00897b', dark: '#4db6ac' },
    { name: 'sage',    label: 'Sage',     color: '#558b6e', dark: '#87bba2' },
    { name: 'olive',   label: 'Olive',    color: '#6a7c59', dark: '#9aad84' },
];

const Settings: React.FC<SettingsProps> = ({
    username,
    themeName = 'emerald',
    onThemeChange,
    floatingNav = false,
    onFloatingNavChange,
}) => {
    const [tabValue, setTabValue] = useState(0);


    const queryClient = useQueryClient();

    // Fetch Settings
    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data;
        }
    });

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => (await api.get('/auth/me')).data,
    });

    // Company Settings State
    const [companySettings, setCompanySettings] = useState({
        companyName: '',
        address: '',
        gstin: '',
        phone: '',
        email: '',
        logo: '',
    });

    // System Settings State
    const [systemSettings, setSystemSettings] = useState({
        autoBackup: true,
        emailNotifications: true,
        lowStockAlert: true,
        lowStockThreshold: '',
        defaultInvoiceTheme: 'CLASSIC',
    });

    // Rates State
    const [rateSettings, setRateSettings] = useState({
        ebRate: '10',
        packageRate: '1.60',
        maintenanceRate: '4.00',
        gstPercent: '18',
        supportedCounts: '2,4,6,8,10,12,14,16,20',
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
                logo: settings.logo || '',
            });
            setSystemSettings({
                autoBackup: settings.autoBackup ?? true,
                emailNotifications: settings.emailNotifications ?? true,
                lowStockAlert: settings.lowStockAlert ?? true,
                lowStockThreshold: settings.lowStockThreshold || '500',
                defaultInvoiceTheme: settings.defaultInvoiceTheme || 'CLASSIC',
            });
            setRateSettings({
                ebRate: String(settings.ebRate || '10'),
                packageRate: String(settings.packageRate || '1.60'),
                maintenanceRate: String(settings.maintenanceRate || '4.00'),
                gstPercent: String(settings.gstPercent || '18'),
                supportedCounts: settings.supportedCounts || '2,4,6,8,10,12,14,16,20',
            });
        }
    }, [settings]);

    // Update Settings Mutation
    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.put('/settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Settings saved successfully!');
        },
        onError: () => {
            toast.error('Failed to save settings');
        }
    });

    const handleSaveCompanySettings = () => {
        // Validation
        if (!companySettings.companyName.trim()) {
            toast.error('Company name is required');
            return;
        }
        if (companySettings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companySettings.email)) {
            toast.error('Invalid email format');
            return;
        }
        if (companySettings.phone && !/^[0-9+\-\s()]{6,15}$/.test(companySettings.phone)) {
            toast.error('Invalid phone number format');
            return;
        }
        if (companySettings.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(companySettings.gstin)) {
            toast.warning('GSTIN format may be incorrect. Saving anyway.');
        }

        updateSettingsMutation.mutate({
            ...companySettings,
            updatedBy: username,
        });
    };

    const handleSaveRates = () => {
        const eb = parseFloat(rateSettings.ebRate);
        const pkg = parseFloat(rateSettings.packageRate);
        const maint = parseFloat(rateSettings.maintenanceRate);
        const gst = parseFloat(rateSettings.gstPercent);

        const ebCheck = validateRate(eb, 'EB Rate');
        if (!ebCheck.valid) { toast.error(ebCheck.message); return; }

        const pkgCheck = validateRate(pkg, 'Packaging Rate');
        if (!pkgCheck.valid) { toast.error(pkgCheck.message); return; }

        const maintCheck = validateRate(maint, 'Maintenance Rate');
        if (!maintCheck.valid) { toast.error(maintCheck.message); return; }

        const gstCheck = validateGST(gst);
        if (!gstCheck.valid) { toast.error(gstCheck.message); return; }

        updateSettingsMutation.mutate({
            ebRate: String(eb),
            packageRate: String(pkg),
            maintenanceRate: String(maint),
            gstPercent: String(gst),
            supportedCounts: rateSettings.supportedCounts,
            updatedBy: username,
        });
    };

    const handleSaveSystemSettings = () => {
        // Validate low stock threshold
        if (systemSettings.lowStockAlert) {
            const threshold = parseFloat(systemSettings.lowStockThreshold);
            if (!threshold || threshold <= 0) {
                toast.error(ERROR_MESSAGES.LOW_STOCK_THRESHOLD);
                return;
            }
        }

        updateSettingsMutation.mutate({
            ...systemSettings,
            updatedBy: username,
        });
    };



    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Settings</Typography>
                    <Typography color="text.secondary">
                        Manage profile, security, appearance, and operational defaults.
                    </Typography>
                </Box>
                {currentUser && (
                    <Paper sx={{ px: 2, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{currentUser.name?.[0] || currentUser.username?.[0] || 'U'}</Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{currentUser.name || currentUser.username}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={currentUser.role} size="small" />
                                <Chip label={currentUser.isTotpEnabled ? '2FA on' : '2FA off'} size="small" color={currentUser.isTotpEnabled ? 'success' : 'default'} />
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>

            <Paper>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ px: 2, pt: 1 }}>
                    <Tab label="Company Info" />
                    <Tab label="System Settings" />
                    <Tab label="Rates & Defaults" />
                    <Tab label="Appearance" />
                    <Tab label="Audit Logs" />
                </Tabs>

                {/* Company Info Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Company Information
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Logo Upload Section */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 2,
                                        border: '1px dashed grey',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        bgcolor: 'background.default'
                                    }}
                                >
                                    {companySettings.logo ? (
                                        <img src={companySettings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">No Logo</Typography>
                                    )}
                                </Box>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<UploadIcon />}
                                        size="small"
                                        sx={{ mb: 1 }}
                                    >
                                        Upload Logo
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 500 * 1024) { // 500KB limit
                                                        toast.error(ERROR_MESSAGES.FILE_TOO_LARGE('500KB'));
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setCompanySettings({ ...companySettings, logo: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </Button>
                                    {companySettings.logo && (
                                        <Button
                                            variant="text"
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => setCompanySettings({ ...companySettings, logo: '' })}
                                            sx={{ display: 'block' }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        Max 500KB.
                                    </Typography>
                                </Box>
                            </Box>

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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={systemSettings.autoBackup}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
                                        />
                                    }
                                    label="Enable Auto Backup"
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                                    Automatically backs up the database at regular intervals. Ensures data safety in case of system failure.
                                </Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={systemSettings.emailNotifications}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                                        />
                                    }
                                    label="Email Notifications"
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                                    Sends email alerts for important events such as low stock warnings, new orders, and system errors.
                                </Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={systemSettings.lowStockAlert}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, lowStockAlert: e.target.checked })}
                                        />
                                    }
                                    label="Low Stock Alerts"
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                                    Triggers alerts when cotton or yarn inventory falls below the configured threshold.
                                </Typography>
                                {systemSettings.lowStockAlert && (
                                    <TextField
                                        label="Low Stock Threshold (kg)"
                                        type="number"
                                        value={systemSettings.lowStockThreshold}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{ mt: 2, ml: 6, maxWidth: 300 }}
                                        helperText="Alert when stock falls below this value"
                                        error={systemSettings.lowStockThreshold === '' || isNaN(parseFloat(systemSettings.lowStockThreshold)) || parseFloat(systemSettings.lowStockThreshold) <= 0}
                                    />
                                )}
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'background.default', border: '1px dashed grey' }}>
                                <Typography variant="subtitle1" fontWeight="bold">Default Currency: INR (₹)</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Base currency is fixed to Indian Rupee.
                                </Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid', borderColor: 'info.main', borderRadius: 1 }}>
                                <Typography variant="body2" color="info.main">
                                    💡 EB Rate, Packaging Rate, and Maintenance Rate are now managed in the <strong>Costing module</strong>.
                                </Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} mb={2}>Invoice Appearance</Typography>
                                <TextField
                                    select
                                    label="Default Invoice Theme"
                                    value={systemSettings.defaultInvoiceTheme}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, defaultInvoiceTheme: e.target.value })}
                                    fullWidth
                                    size="small"
                                    helperText="Select the default visual theme for newly created invoices."
                                >
                                    <MenuItem value="CLASSIC">Classic (A4 Format)</MenuItem>
                                    <MenuItem value="MODERN">Modern (Color Header)</MenuItem>
                                    <MenuItem value="MINIMAL">Minimal (Clean Layout)</MenuItem>
                                </TextField>
                            </Paper>

                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSystemSettings} sx={{ mt: 1 }}>
                                Save System Settings
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>



                {/* Rates Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>Operational Rates</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            These rates are used for auto-calculation of packaging and maintenance costs in the Costing module.
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="primary.main">⚡ Electricity</Typography>
                                <TextField
                                    label="EB Rate per Unit (₹ / kWh)"
                                    type="number"
                                    fullWidth
                                    value={rateSettings.ebRate}
                                    onChange={(e) => setRateSettings({ ...rateSettings, ebRate: e.target.value })}
                                    helperText="Cost per kilowatt-hour of electricity consumed"
                                    inputProps={{ step: 0.01, min: 0 }}
                                />
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="info.main">📦 Packaging</Typography>
                                <TextField
                                    label="Packaging Rate (₹ / kg yarn)"
                                    type="number"
                                    fullWidth
                                    value={rateSettings.packageRate}
                                    onChange={(e) => setRateSettings({ ...rateSettings, packageRate: e.target.value })}
                                    helperText="Auto-calculated: yarn produced (kg) × this rate"
                                    inputProps={{ step: 0.01, min: 0 }}
                                />
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="warning.main">🔧 Maintenance</Typography>
                                <TextField
                                    label="Maintenance Rate (₹ / kg yarn)"
                                    type="number"
                                    fullWidth
                                    value={rateSettings.maintenanceRate}
                                    onChange={(e) => setRateSettings({ ...rateSettings, maintenanceRate: e.target.value })}
                                    helperText="Auto-calculated: yarn produced (kg) × this rate"
                                    inputProps={{ step: 0.01, min: 0 }}
                                />
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="secondary.main">🧶 Production Setup</Typography>
                                <TextField
                                    label="Supported Yarn Counts"
                                    fullWidth
                                    value={rateSettings.supportedCounts}
                                    onChange={(e) => setRateSettings({ ...rateSettings, supportedCounts: e.target.value })}
                                    helperText="Enter comma-separated yarn counts (e.g., 2,4,6,10,20). These will appear in production and sales dropdowns."
                                    placeholder="2,4,6,8,10"
                                />
                            </Paper>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveRates}>
                                    Save Operational Rates
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Appearance Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ maxWidth: 620 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>Appearance</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            Customize the look and feel of your EverGreen workspace. Changes apply instantly.
                        </Typography>

                        {/* Theme Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                🎨 Green Theme
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                                5 handcrafted green palettes — pick your vibe
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
                                {THEME_OPTIONS.map((opt, idx) => {
                                    const active = themeName === opt.name;
                                    return (
                                        <Box
                                            key={opt.name}
                                            className={`anim-slide-up stagger-${idx + 1}`}
                                            onClick={() => onThemeChange?.(opt.name)}
                                            sx={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                                                cursor: 'pointer',
                                                perspective: '600px',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 64, height: 64, borderRadius: '20px',
                                                    background: `linear-gradient(145deg, ${opt.color}, ${opt.dark || opt.color})`,
                                                    boxShadow: active
                                                        ? `0 0 0 3px #fff, 0 0 0 5px ${opt.color}, 0 8px 24px ${opt.color}66`
                                                        : `6px 6px 16px ${opt.color}44, -3px -3px 10px rgba(255,255,255,0.8)`,
                                                    transform: active ? 'scale(1.15) rotateX(0deg)' : 'scale(1)',
                                                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    '&:hover': {
                                                        transform: active ? 'scale(1.15)' : 'scale(1.1) rotateX(-5deg) rotateY(5deg)',
                                                        boxShadow: `0 0 0 2px ${opt.color}55, 0 12px 28px ${opt.color}55`,
                                                    },
                                                }}
                                            >
                                                {active && (
                                                    <Box sx={{
                                                        width: 20, height: 20, borderRadius: '50%',
                                                        bgcolor: 'rgba(255,255,255,0.9)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                    }}>
                                                        ✓
                                                    </Box>
                                                )}
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                fontWeight={active ? 800 : 500}
                                                sx={{
                                                    color: active ? opt.color : 'text.secondary',
                                                    transition: 'color 0.2s',
                                                    fontSize: '0.72rem',
                                                    letterSpacing: active ? '0.05em' : 0,
                                                }}
                                            >
                                                {opt.label}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                        {/* Divider */}
                        <Box sx={{ borderTop: 1, borderColor: 'divider', my: 3 }} />

                        {/* Floating Nav Toggle */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                📱 Navigation Style
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                Choose between sidebar navigation or a floating pill at the bottom
                            </Typography>
                            <Box
                                className="clay-card"
                                sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    p: 2.5,
                                    transition: 'box-shadow 0.2s',
                                    '&:hover': { boxShadow: '10px 10px 24px rgba(0,0,0,0.11), -5px -5px 14px rgba(255,255,255,0.97)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        width: 48, height: 48, borderRadius: '14px',
                                        background: floatingNav
                                            ? 'linear-gradient(135deg, #059669, #34d399)'
                                            : 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.4rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: floatingNav ? '0 4px 16px rgba(5,150,105,0.4)' : '0 2px 8px rgba(0,0,0,0.1)',
                                    }}>
                                        📱
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700}>Floating Bottom Navigation</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {floatingNav ? '✅ Enabled — glassmorphic pill visible at bottom' : 'Show a glassmorphic floating pill at the bottom of the screen'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Switch
                                    checked={floatingNav}
                                    onChange={(e) => onFloatingNavChange?.(e.target.checked)}
                                    color="primary"
                                    sx={{ '& .MuiSwitch-thumb': { boxShadow: '0 2px 6px rgba(0,0,0,0.2)' } }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Audit Logs Tab */}
                <TabPanel value={tabValue} index={4}>
                    <Logs />
                </TabPanel>
            </Paper>



        </Box>
    );
};

export default Settings;
