import { uiText, useUiLanguage } from "../i18n";
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
import { BUSINESS_MODES, BUSINESS_MODE_LABELS, normalizeCompanyProfile, type BusinessMode, type WorkspaceMode } from '@evergreen/types';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '../utils/messages';
import { validateRate, validateGST } from '../utils/validators';
import type { ThemeName } from '../theme';

import Logs from './Logs';
import { SETTINGS_AUDIT_TAB } from '../utils/navigation';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
  useUiLanguage();
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
    /** Tab to open on; the audit-log link uses this. */
    initialTab?: number;
}

const THEME_OPTIONS: { name: ThemeName; label: string; color: string; dark?: string }[] = [
    { name: 'emerald', get label() { return uiText("Emerald"); },  color: '#059669', dark: '#34d399' },
    { name: 'forest',  get label() { return uiText("Forest"); },   color: '#2d6a4f', dark: '#52b788' },
    { name: 'mint',    get label() { return uiText("Mint"); },     color: '#00897b', dark: '#4db6ac' },
    { name: 'sage',    get label() { return uiText("Sage"); },     color: '#558b6e', dark: '#87bba2' },
    { name: 'olive',   get label() { return uiText("Olive"); },    color: '#6a7c59', dark: '#9aad84' },
];

const Settings: React.FC<SettingsProps> = ({
    username,
    themeName = 'emerald',
    onThemeChange,
    initialTab = 0,
}) => {
  useUiLanguage();
    const [tabValue, setTabValue] = useState(initialTab);


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
        businessMode: 'INTEGRATED' as BusinessMode,
        workspaceMode: 'FULL' as WorkspaceMode,
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
        ebRate: '',
        packageRate: '',
        maintenanceRate: '',
        gstPercent: '',
        supportedCounts: '',
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
                ...normalizeCompanyProfile(settings),
            });
            setSystemSettings({
                autoBackup: settings.autoBackup ?? true,
                emailNotifications: settings.emailNotifications ?? true,
                lowStockAlert: settings.lowStockAlert ?? true,
                lowStockThreshold: settings.lowStockThreshold || '500',
                defaultInvoiceTheme: settings.defaultInvoiceTheme || 'CLASSIC',
            });
            setRateSettings({
                ebRate: String(settings.ebRate ?? ''),
                packageRate: String(settings.packageRate ?? ''),
                maintenanceRate: String(settings.maintenanceRate ?? ''),
                gstPercent: String(settings.gstPercent ?? ''),
                supportedCounts: settings.supportedCounts ?? '',
            });
        }
    }, [settings]);

    // Update Settings Mutation
    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => api.put('/settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success(uiText('Settings saved successfully!', 'feedback'));
        },
        onError: () => {
            toast.error(uiText('Failed to save settings', 'feedback'));
        }
    });

    const handleSaveCompanySettings = () => {
        // Validation
        if (!companySettings.companyName.trim()) {
            toast.error(uiText('Company name is required', 'feedback'));
            return;
        }
        if (companySettings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companySettings.email)) {
            toast.error(uiText('Invalid email format', 'feedback'));
            return;
        }
        if (companySettings.phone && !/^[0-9+\-\s()]{6,15}$/.test(companySettings.phone)) {
            toast.error(uiText('Invalid phone number format', 'feedback'));
            return;
        }
        if (companySettings.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(companySettings.gstin)) {
            toast.warning(uiText('GSTIN format may be incorrect. Saving anyway.', 'feedback'));
        }

        updateSettingsMutation.mutate({
            ...companySettings,
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
        });
    };



    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">{uiText("Settings")}</Typography>
                    <Typography color="text.secondary">
                        {uiText("Manage profile, security, appearance, and operational defaults. ")}</Typography>
                </Box>
                {currentUser && (
                    <Paper sx={{ px: 2, py: 1.5, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{currentUser.name?.[0] || currentUser.username?.[0] || 'U'}</Avatar>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700}>{currentUser.name || currentUser.username}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={currentUser.role} size="small" />
                                <Chip label={currentUser.isTotpEnabled ? uiText("2FA on") : uiText("2FA off")} size="small" color={currentUser.isTotpEnabled ? 'success' : 'default'} />
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>

            <Paper>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ px: 2, pt: 1 }}>
                    <Tab label={uiText("Company Info", 'tabs')} />
                    <Tab label={uiText("System Settings", 'tabs')} />
                    <Tab label={uiText("Rates & Defaults", 'tabs')} />
                    <Tab label={uiText("Appearance", 'tabs')} />
                    <Tab label={uiText("Audit Logs", 'tabs')} />
                </Tabs>

                {/* Company Info Tab */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            {uiText("Company Information ")}</Typography>
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
                                        <img src={companySettings.logo} alt={uiText("Logo")} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">{uiText("No Logo")}</Typography>
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
                                        {uiText("Upload Logo ")}<input
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
                                            {uiText("Remove ")}</Button>
                                    )}
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {uiText("Max 500KB. ")}</Typography>
                                </Box>
                            </Box>

                            <TextField
                                label={uiText("Company Name", 'forms')}
                                value={companySettings.companyName}
                                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                                fullWidth
                            />
                            <TextField select label={uiText("Business activities", 'forms')} value={companySettings.businessMode}
                                onChange={event => setCompanySettings({ ...companySettings, businessMode: event.target.value as BusinessMode })}
                                helperText={uiText("Choose the work your company does. You can change this as you grow.", 'forms')} fullWidth>
                                {BUSINESS_MODES.map(mode => <MenuItem key={mode} value={mode}>{BUSINESS_MODE_LABELS[mode]}</MenuItem>)}
                            </TextField>
                            <TextField select label={uiText("Workspace complexity", 'forms')} value={companySettings.workspaceMode}
                                onChange={event => setCompanySettings({ ...companySettings, workspaceMode: event.target.value as WorkspaceMode })}
                                helperText={uiText("Guided shows essential navigation. Full exposes all modules. Existing records remain accessible.", 'forms')} fullWidth>
                                <MenuItem value="GUIDED">{uiText("Guided — essential daily work", 'forms')}</MenuItem>
                                <MenuItem value="FULL">{uiText("Full — all operations", 'forms')}</MenuItem>
                            </TextField>
                            <TextField
                                label={uiText("Address", 'forms')}
                                value={companySettings.address}
                                onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                label={uiText("GSTIN", 'forms')}
                                value={companySettings.gstin}
                                onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label={uiText("Phone", 'forms')}
                                value={companySettings.phone}
                                onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label={uiText("Email", 'forms')}
                                type="email"
                                value={companySettings.email}
                                onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                                fullWidth
                            />
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCompanySettings} sx={{ mt: 2 }}>
                                {uiText("Save Company Info ")}</Button>
                        </Box>
                    </Box>
                </TabPanel>

                {/* System Settings Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            {uiText("System Configuration ")}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={systemSettings.autoBackup}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
                                        />
                                    }
                                    label={uiText("Enable Auto Backup", 'forms')}
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                                    {uiText("Automatically backs up the database at regular intervals. Ensures data safety in case of system failure. ")}</Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={systemSettings.emailNotifications}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                                        />
                                    }
                                    label={uiText("Email Notifications", 'forms')}
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                                    {uiText("Sends email alerts for important events such as low stock warnings, new orders, and system errors. ")}</Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={systemSettings.lowStockAlert}
                                            onChange={(e) => setSystemSettings({ ...systemSettings, lowStockAlert: e.target.checked })}
                                        />
                                    }
                                    label={uiText("Low Stock Alerts", 'forms')}
                                />
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 6 }}>
                                    {uiText("Triggers alerts when cotton or yarn inventory falls below the configured threshold. ")}</Typography>
                                {systemSettings.lowStockAlert && (
                                    <TextField
                                        label={uiText("Low Stock Threshold (kg)", 'forms')}
                                        type="number"
                                        value={systemSettings.lowStockThreshold}
                                        onChange={(e) => setSystemSettings({ ...systemSettings, lowStockThreshold: e.target.value })}
                                        fullWidth
                                        size="small"
                                        sx={{ mt: 2, ml: 6, maxWidth: 300 }}
                                        helperText={uiText("Alert when stock falls below this value", 'forms')}
                                        error={systemSettings.lowStockThreshold === '' || isNaN(parseFloat(systemSettings.lowStockThreshold)) || parseFloat(systemSettings.lowStockThreshold) <= 0}
                                    />
                                )}
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'background.default', border: '1px dashed grey' }}>
                                <Typography variant="subtitle1" fontWeight="bold">{uiText("Default Currency: INR (₹)")}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {uiText("Base currency is fixed to Indian Rupee. ")}</Typography>
                            </Paper>

                            <Paper sx={{ p: 2, bgcolor: 'rgba(14, 165, 233, 0.08)', border: '1px solid', borderColor: 'info.main', borderRadius: 1 }}>
                                <Typography variant="body2" color="info.main">
                                    {uiText("💡 EB Rate, Packaging Rate, and Maintenance Rate are now managed in the ")}<strong>{uiText("Costing module")}</strong>.
                                </Typography>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} mb={2}>{uiText("Invoice Appearance")}</Typography>
                                <TextField
                                    select
                                    label={uiText("Default Invoice Theme", 'forms')}
                                    value={systemSettings.defaultInvoiceTheme}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, defaultInvoiceTheme: e.target.value })}
                                    fullWidth
                                    size="small"
                                    helperText={uiText("Select the default visual theme for newly created invoices.", 'forms')}
                                >
                                    <MenuItem value="CLASSIC">{uiText("Classic (A4 Format)", 'forms')}</MenuItem>
                                    <MenuItem value="MODERN">{uiText("Modern (Color Header)", 'forms')}</MenuItem>
                                    <MenuItem value="MINIMAL">{uiText("Minimal (Clean Layout)", 'forms')}</MenuItem>
                                </TextField>
                            </Paper>

                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSystemSettings} sx={{ mt: 1 }}>
                                {uiText("Save System Settings ")}</Button>
                        </Box>
                    </Box>
                </TabPanel>



                {/* Rates Tab */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>{uiText("Operational Rates")}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {uiText("These rates are used for auto-calculation of packaging and maintenance costs in the Costing module. ")}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="primary.main">{uiText("⚡ Electricity")}</Typography>
                                <TextField
                                    label={uiText("EB Rate per Unit (₹ / kWh)", 'forms')}
                                    type="number"
                                    fullWidth
                                    value={rateSettings.ebRate}
                                    onChange={(e) => setRateSettings({ ...rateSettings, ebRate: e.target.value })}
                                    helperText={uiText("Cost per kilowatt-hour of electricity consumed", 'forms')}
                                    inputProps={{ step: 0.01, min: 0 }}
                                />
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="info.main">{uiText("📦 Packaging")}</Typography>
                                <TextField
                                    label={uiText("Packaging Rate (₹ / kg yarn)", 'forms')}
                                    type="number"
                                    fullWidth
                                    value={rateSettings.packageRate}
                                    onChange={(e) => setRateSettings({ ...rateSettings, packageRate: e.target.value })}
                                    helperText={uiText("Auto-calculated: yarn produced (kg) × this rate", 'forms')}
                                    inputProps={{ step: 0.01, min: 0 }}
                                />
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="warning.main">{uiText("🔧 Maintenance")}</Typography>
                                <TextField
                                    label={uiText("Maintenance Rate (₹ / kg yarn)", 'forms')}
                                    type="number"
                                    fullWidth
                                    value={rateSettings.maintenanceRate}
                                    onChange={(e) => setRateSettings({ ...rateSettings, maintenanceRate: e.target.value })}
                                    helperText={uiText("Auto-calculated: yarn produced (kg) × this rate", 'forms')}
                                    inputProps={{ step: 0.01, min: 0 }}
                                />
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="subtitle2" fontWeight={700} mb={2} color="secondary.main">{uiText("🧶 Production Setup")}</Typography>
                                <TextField
                                    label={uiText("Supported Yarn Counts", 'forms')}
                                    fullWidth
                                    value={rateSettings.supportedCounts}
                                    onChange={(e) => setRateSettings({ ...rateSettings, supportedCounts: e.target.value })}
                                    helperText={uiText("Enter comma-separated yarn counts (e.g., 2,4,6,10,20). These will appear in production and sales dropdowns.", 'forms')}
                                    placeholder="2,4,6,8,10"
                                />
                            </Paper>
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveRates}>
                                    {uiText("Save Operational Rates ")}</Button>
                            </Box>
                        </Box>
                    </Box>
                </TabPanel>

                {/* Appearance Tab */}
                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ maxWidth: 620 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>{uiText("Appearance")}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                            {uiText("Customize the look and feel of your EverGreen workspace. Changes apply instantly. ")}</Typography>

                        {/* Theme Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                {uiText("🎨 Green Theme ")}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                                {uiText("5 handcrafted green palettes — pick your vibe ")}</Typography>
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
                                                {uiText(opt.label, 'forms')}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>

                    </Box>
                </TabPanel>

                {/* Audit Logs Tab */}
                <TabPanel value={tabValue} index={SETTINGS_AUDIT_TAB}>
                    <Logs />
                </TabPanel>
            </Paper>



        </Box>
    );
};

export default Settings;
