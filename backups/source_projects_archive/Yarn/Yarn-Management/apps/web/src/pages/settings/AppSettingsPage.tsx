import {
    Box,
    Typography,
    Paper,
    Switch,
    FormControlLabel,
    Divider,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAppSettings } from '../../context/AppSettingsContext';

interface ModuleConfig {
    key: string;
    label: string;
    description: string;
    category: string;
}

const MODULES_CONFIG: ModuleConfig[] = [
    // Core Operations
    { key: 'procurement', label: 'Procurement', description: 'Supplier management, POs, RFQs', category: 'Operations' },
    { key: 'inventory', label: 'Inventory', description: 'Raw materials, stock tracking', category: 'Operations' },
    { key: 'warehouse', label: 'Warehouse', description: 'Warehouse management, transfers', category: 'Operations' },
    { key: 'manufacturing', label: 'Manufacturing', description: 'Production planning, batches', category: 'Operations' },
    { key: 'quality', label: 'Quality Control', description: 'Quality checks, inspections', category: 'Operations' },

    // Business
    { key: 'sales', label: 'Sales & Orders', description: 'Customer orders, sales tracking', category: 'Business' },
    { key: 'customers', label: 'Customers', description: 'CRM, customer profiles', category: 'Business' },
    { key: 'finance', label: 'Finance & Billing', description: 'Invoicing, AR/AP, ledgers', category: 'Business' },
    { key: 'hr', label: 'HR & Payroll', description: 'Employee management, payroll', category: 'Business' },

    // Support & Tools
    { key: 'documents', label: 'Documents', description: 'Document management system', category: 'Tools' },
    { key: 'communication', label: 'Communication', description: 'Internal messaging, chats', category: 'Tools' },
    { key: 'reports', label: 'Reports', description: 'Analytics and reporting', category: 'Tools' },
    { key: 'integrations', label: 'Integrations', description: 'Third-party connections', category: 'Tools' },
    { key: 'developer', label: 'Developer Portal', description: 'API access, webhooks', category: 'Tools' },
];

export default function AppSettingsPage() {
    const { modules, isLoading, updateModules } = useAppSettings();

    const handleToggle = (key: string, checked: boolean) => {
        // Clone and update
        const newModules = { ...modules, [key]: checked };
        updateModules(newModules);
    };

    if (isLoading) {
        return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    }

    // Group by category
    const categories = ['Operations', 'Business', 'Tools'];

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Module Management</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                Enable or disable modules to customize your sidebar and workspace. Changes apply immediately for all users.
            </Alert>

            {categories.map((category) => (
                <Paper key={category} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {category}
                    </Typography>
                    <Grid container spacing={3}>
                        {MODULES_CONFIG.filter(m => m.category === category).map((module) => (
                            <Grid item xs={12} sm={6} md={4} key={module.key}>
                                <Box sx={{
                                    p: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    bgcolor: modules[module.key] ? 'background.paper' : 'action.hover',
                                    opacity: modules[module.key] ? 1 : 0.7
                                }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={!!modules[module.key]}
                                                onChange={(e) => handleToggle(module.key, e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {module.label}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {module.description}
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ width: '100%', m: 0, alignItems: 'flex-start' }}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            ))}
        </Box>
    );
}
