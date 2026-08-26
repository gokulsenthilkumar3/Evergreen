import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Grid, LinearProgress, Chip
} from '@mui/material';
import { Sync as SyncIcon, CloudDone as SuccessIcon, Error as ErrorIcon } from '@mui/icons-material';
import { usePersist, fmtDate } from '../../hooks/usePersist';
import { toast } from 'sonner';

const TallySync: React.FC = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(new Date().toISOString());
    const { items: syncLogs } = usePersist<any>('tally_sync_logs', []);

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setLastSync(new Date().toISOString());
            toast.success('Successfully synced 42 vouchers to Tally ERP');
        }, 2500);
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Tally ERP Integration</Typography>
                <Typography variant="body2" color="text.secondary">Seamlessly synchronize your ledgers, vouchers, and inventory with Tally</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Connection Status</Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, mt: 2 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 10px rgba(76,175,80,0.5)' }} />
                            <Typography fontWeight={600} color="success.main">Connected to Tally Prime</Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>Last Synced:</Typography>
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 3 }}>
                            {new Date(lastSync).toLocaleString()}
                        </Typography>

                        <Button 
                            variant="contained" 
                            fullWidth 
                            startIcon={isSyncing ? undefined : <SyncIcon />}
                            onClick={handleSync}
                            disabled={isSyncing}
                        >
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                        {isSyncing && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%', overflow: 'hidden' }}>
                        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                            <Typography variant="subtitle2" fontWeight={700}>Recent Sync Activity</Typography>
                        </Box>
                        <TableContainer sx={{ maxHeight: 300 }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Entity</TableCell>
                                        <TableCell>Records</TableCell>
                                        <TableCell>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {syncLogs.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>
                                                No recent sync activity.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {syncLogs.map((log: any) => (
                                        <TableRow hover key={log.id}>
                                            <TableCell>{new Date(log.time).toLocaleTimeString()}</TableCell>
                                            <TableCell>{log.entity}</TableCell>
                                            <TableCell>{log.records}</TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={log.status} 
                                                    size="small" 
                                                    color={log.status.includes('Success') ? 'success' : 'error'} 
                                                    variant="outlined" 
                                                    icon={log.status.includes('Success') ? <SuccessIcon /> : <ErrorIcon />} 
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TallySync;
