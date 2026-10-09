import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress
} from '@mui/material';
import { Sync, Settings, CheckCircle, Error as ErrorIcon, CloudOff } from '@mui/icons-material';
import { http } from '../lib/http';

const PROVIDERS = [
    { id: 'TALLY', name: 'Tally Prime', type: 'Accounting' },
    { id: 'QUICKBOOKS', name: 'QuickBooks Online', type: 'Accounting' },
    { id: 'DELHIVERY', name: 'Delhivery', type: 'Logistics' },
    { id: 'SHOPIFY', name: 'Shopify', type: 'E-commerce' }
];

export default function IntegrationPage() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [credentials, setCredentials] = useState<any>({});
    const [syncLogs, setSyncLogs] = useState<any[]>([]);
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const res = await http.get('/integrations/configs');
            setConfigs(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (provider: any) => {
        setSelectedProvider(provider);
        setCredentials({});
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            await http.post('/integrations/connect', {
                provider: selectedProvider.id,
                name: selectedProvider.name,
                credentials
            });
            setDialogOpen(false);
            loadConfigs();
        } catch (e) {
            console.error(e);
            alert('Connection failed');
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await http.patch(`/integrations/${id}/toggle`, { isEnabled: !currentStatus });
            loadConfigs();
        } catch (e) {
            console.error(e);
        }
    };

    const handleSync = async (id: string) => {
        try {
            await http.post(`/integrations/${id}/sync`, { entityType: 'ALL' });
            alert('Sync started');
            loadLogs(id);
        } catch (e) {
            alert('Sync failed check console');
            console.error(e);
        }
    };

    const loadLogs = async (id: string) => {
        const res = await http.get(`/integrations/${id}/logs`);
        setSyncLogs(res.data);
        setTabIndex(1); // Switch to logs tab
    };

    if (loading) return <LinearProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Integrations & API Ecosystem</Typography>

            <Tabs value={tabIndex} onChange={(e, v) => setTabIndex(v)} sx={{ mb: 3 }}>
                <Tab label="Connected Services" />
                <Tab label="Sync Activity Logs" />
            </Tabs>

            {tabIndex === 0 && (
                <Grid container spacing={3}>
                    {PROVIDERS.map(provider => {
                        const config = configs.find(c => c.provider === provider.id);
                        const isConnected = !!config;
                        const isEnabled = config?.isEnabled;

                        return (
                            <Grid item xs={12} md={4} key={provider.id}>
                                <Card sx={{ opacity: isConnected && !isEnabled ? 0.7 : 1 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Chip label={provider.type} size="small" />
                                            {isConnected ? (
                                                <Chip
                                                    icon={isEnabled ? <CheckCircle /> : <CloudOff />}
                                                    label={isEnabled ? 'Active' : 'Disabled'}
                                                    color={isEnabled ? 'success' : 'default'}
                                                />
                                            ) : (
                                                <Chip label="Not Connected" />
                                            )}
                                        </Box>
                                        <Typography variant="h6">{provider.name}</Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {isConnected
                                                ? `Last synced: ${config.lastSyncAt ? new Date(config.lastSyncAt).toLocaleString() : 'Never'}`
                                                : 'Connect to sync data automatically.'}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        {isConnected ? (
                                            <>
                                                <Button size="small" onClick={() => handleToggle(config.id, isEnabled)}>
                                                    {isEnabled ? 'Disable' : 'Enable'}
                                                </Button>
                                                <Button size="small" startIcon={<Sync />} onClick={() => handleSync(config.id)} disabled={!isEnabled}>
                                                    Sync Now
                                                </Button>
                                                <Button size="small" onClick={() => loadLogs(config.id)}>Logs</Button>
                                            </>
                                        ) : (
                                            <Button variant="contained" size="small" onClick={() => handleConnect(provider)}>
                                                Connect
                                            </Button>
                                        )}
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {tabIndex === 1 && (
                <Paper>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Time</TableCell>
                                    <TableCell>Integration</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Records</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {syncLogs.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} align="center">Select an integration log to view history</TableCell></TableRow>
                                ) : (
                                    syncLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.startedAt).toLocaleString()}</TableCell>
                                            <TableCell>{log.integrationId.substring(0, 8)}...</TableCell>
                                            <TableCell>{log.action} ({log.entityType})</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.status}
                                                    size="small"
                                                    color={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'error' : 'warning'}
                                                />
                                            </TableCell>
                                            <TableCell>{log.recordsCount}</TableCell>
                                            <TableCell>{JSON.stringify(log.details)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Connection Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Connect {selectedProvider?.name}</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Since this is a demo, enter any dummy API Key. Use "fail" to test error handling.
                    </Alert>
                    <TextField
                        fullWidth
                        label="API Key / Client ID"
                        sx={{ mb: 2, mt: 1 }}
                        value={credentials.apiKey || ''}
                        onChange={e => setCredentials({ ...credentials, apiKey: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="API Secret / URL"
                        type="password"
                        value={credentials.secret || ''}
                        onChange={e => setCredentials({ ...credentials, secret: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Connect</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
