import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Divider,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    IconButton,
    Tooltip,
    LinearProgress,
    Button,
} from '@mui/material';
import {
    AccountBalance,
    Category,
    Opacity,
    Refresh as RefreshIcon,
    Grass as CottonIcon,
    ElectricBolt as EbIcon,
    People as EmployeeIcon,
    Inventory2 as PackagingIcon,
    Build as MaintenanceIcon,
    MoreHoriz as OtherIcon,
    ArrowForward as ArrowForwardIcon,
    Factory as FactoryIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

const WASTE_COLORS: Record<string, string> = {
    'Blow Room': '#fdd835',
    'Carding': '#fb8c00',
    'OE Waste': '#e53935',
    'Others': '#757575',
};

const CATEGORY_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
    'EB (Electricity)': { icon: <EbIcon fontSize="small" />, color: '#059669' },
    'Employee': { icon: <EmployeeIcon fontSize="small" />, color: '#6366f1' },
    'Packaging': { icon: <PackagingIcon fontSize="small" />, color: '#0ea5e9' },
    'Maintenance': { icon: <MaintenanceIcon fontSize="small" />, color: '#f59e0b' },
};

interface TodayDashboardProps {
    onNavigate?: (page: string) => void;
}

const TodayDashboard: React.FC<TodayDashboardProps> = ({ onNavigate }) => {
    const today = new Date().toISOString().split('T')[0];
    const queryClient = useQueryClient();
    const navigate = (page: string) => onNavigate?.(page);

    // Fetch Production Data
    const { data: productionHistory, isLoading: loadingProd, dataUpdatedAt: prodUpdated } = useQuery({
        queryKey: ['productionHistory'],
        queryFn: async () => {
            const res = await api.get('/production');
            return res.data;
        }
    });

    // Fetch Costing Data
    const { data: costingEntries, isLoading: loadingCost } = useQuery({
        queryKey: ['costingEntries'],
        queryFn: async () => {
            const res = await api.get('/costing/entries');
            return res.data;
        }
    });

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['productionHistory'] });
        queryClient.invalidateQueries({ queryKey: ['costingEntries'] });
    };

    const todayProduction = productionHistory?.find((p: any) => p.date?.startsWith(today));
    const todayCosts = costingEntries?.filter((c: any) => c.date === today) || [];
    const totalCost = todayCosts.reduce((sum: number, c: any) => sum + (c.totalCost || 0), 0);
    const totalProduced = todayProduction?.totalProduced || 0;
    const totalConsumed = (todayProduction?.consumedBatches?.reduce((sum: number, b: any) => sum + (b.weight || 0), 0)) || (todayProduction?.totalConsumed || 0);
    const avgCostPerKg = totalProduced > 0 ? totalCost / totalProduced : 0;

    // Calculate yield efficiency
    const efficiency = totalConsumed > 0 ? (totalProduced / totalConsumed) * 100 : 0;

    if (loadingProd || loadingCost) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress color="primary" />
                <Typography color="text.secondary" variant="body2">Loading today's data...</Typography>
            </Box>
        );
    }

    const lastUpdated = prodUpdated ? new Date(prodUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--';

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Today's Summary</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                        Last updated: {lastUpdated}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                        label={todayProduction ? "Production Recorded" : "Production Pending"}
                        color={todayProduction ? "success" : "warning"}
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                    />
                    <Tooltip title="Refresh data">
                        <IconButton onClick={handleRefresh} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Big KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Total Cost */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: 'primary.dark', color: 'white' }}>
                        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, bgcolor: 'primary.light', opacity: 0.08, borderRadius: '50%' }} />
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, backdropFilter: 'blur(4px)', flexShrink: 0 }}>
                                <AccountBalance fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em', display: 'block' }}>TOTAL COST</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>₹{totalCost.toLocaleString('en-IN')}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>{todayCosts.length} entries</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Total Produced */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: 'secondary.dark', color: 'white' }}>
                        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, bgcolor: 'secondary.light', opacity: 0.08, borderRadius: '50%' }} />
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, backdropFilter: 'blur(4px)', flexShrink: 0 }}>
                                <Category fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em', display: 'block' }}>YARN PRODUCED</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                    {totalProduced.toLocaleString()}
                                    <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500, opacity: 0.8, ml: 0.5 }}>kg</Box>
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    {Math.floor(totalProduced / 60)} bags + {(totalProduced % 60).toFixed(1)} kg
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Cotton Consumed */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#1e40af' : '#1d4ed8', color: 'white' }}>
                        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, bgcolor: 'white', opacity: 0.05, borderRadius: '50%' }} />
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, backdropFilter: 'blur(4px)', flexShrink: 0 }}>
                                <CottonIcon fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em', display: 'block' }}>COTTON CONSUMED</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                                    {totalConsumed.toLocaleString()}
                                    <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500, opacity: 0.8, ml: 0.5 }}>kg</Box>
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    Yield: {efficiency.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Avg Cost/kg */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 3, position: 'relative', overflow: 'hidden', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#047857' : '#059669', color: 'white' }}>
                        <Box sx={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, bgcolor: 'white', opacity: 0.05, borderRadius: '50%' }} />
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 3, backdropFilter: 'blur(4px)', flexShrink: 0 }}>
                                <Opacity fontSize="medium" />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, letterSpacing: '0.08em', display: 'block' }}>AVG COST / KG</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 800 }}>₹{avgCostPerKg.toFixed(2)}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                    {totalProduced > 0 ? 'actual' : 'no production'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {(!todayProduction && todayCosts.length === 0) && (
                <Paper sx={{ p: 4, mb: 4, borderRadius: 4, bgcolor: 'primary.dark', color: 'primary.contrastText', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, bgcolor: 'primary.main', opacity: 0.1, borderRadius: '50%' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 300 }}>
                            <Typography variant="h5" fontWeight={800} gutterBottom>Ready to start your day?</Typography>
                            <Typography variant="body1" sx={{ opacity: 0.8, mb: 0 }}>
                                No activity has been recorded for today yet. Start by recording production or adding your daily expenses.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="inherit"
                                sx={{ color: 'primary.dark', fontWeight: 700, px: 3, bgcolor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                                onClick={() => navigate('production')}
                                startIcon={<FactoryIcon />}
                            >
                                Record Production
                            </Button>
                            <Button
                                variant="outlined"
                                color="inherit"
                                sx={{ fontWeight: 700, px: 3, borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                onClick={() => navigate('costing')}
                            >
                                Add Costs
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            )}

            {/* Efficiency bar */}
            {totalConsumed > 0 && (
                <Paper sx={{ p: 2.5, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Production Efficiency</Typography>
                        <Typography variant="body2" fontWeight={800} color={efficiency >= 90 ? 'success.main' : efficiency >= 80 ? 'warning.main' : 'error.main'}>
                            {efficiency.toFixed(1)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(100, efficiency)}
                        color={efficiency >= 90 ? 'success' : efficiency >= 80 ? 'warning' : 'error'}
                        sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">Consumed: {totalConsumed.toFixed(1)} kg</Typography>
                        <Typography variant="caption" color="text.secondary">Waste: {(todayProduction?.totalWaste || 0).toFixed(1)} kg</Typography>
                        <Typography variant="caption" color="text.secondary">Produced: {totalProduced.toFixed(1)} kg</Typography>
                    </Box>
                </Paper>
            )}

            <Grid container spacing={3}>
                {/* Yarn Breakdown */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category color="primary" /> Yarn Production by Count
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Count</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bags (60kg)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Weight (kg)</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Remaining Log (kg)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {todayProduction?.producedYarn?.length > 0 ? (
                                        todayProduction.producedYarn.map((p: any) => (
                                            <TableRow key={p.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell component="th" scope="row">
                                                    <Chip label={`Count ${p.count}`} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>{p.bags || 0}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>{parseFloat(p.weight || 0).toFixed(2)}</TableCell>
                                                <TableCell align="right" sx={{ color: (p.remainingLog || 0) > 0 ? 'warning.main' : 'text.secondary', fontWeight: 500 }}>
                                                    {parseFloat(p.remainingLog || 0).toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                                <Category sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                                <Typography color="text.secondary" display="block">No production data for today</Typography>
                                                <Typography variant="caption" color="text.disabled">Add a production entry to see data here</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Waste Breakdown */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Opacity color="error" /> Waste Breakdown
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 2 }}>
                            {[
                                { label: 'Blow Room', val: todayProduction?.wasteBlowRoom || 0, color: WASTE_COLORS['Blow Room'] },
                                { label: 'Carding', val: todayProduction?.wasteCarding || 0, color: WASTE_COLORS['Carding'] },
                                { label: 'OE Waste', val: todayProduction?.wasteOE || 0, color: WASTE_COLORS['OE Waste'] },
                                { label: 'Others', val: todayProduction?.wasteOthers || 0, color: WASTE_COLORS['Others'] },
                            ].map((w, i) => (
                                <Box key={i}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: w.color, flexShrink: 0 }} />
                                            <Typography variant="body2" fontWeight="medium">{w.label}</Typography>
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold">{parseFloat(String(w.val)).toFixed(2)} kg</Typography>
                                    </Box>
                                    <Box sx={{ width: '100%', height: 8, bgcolor: 'action.hover', borderRadius: 4, overflow: 'hidden' }}>
                                        <Box sx={{
                                            width: `${todayProduction?.totalWaste > 0 ? (parseFloat(String(w.val)) / todayProduction.totalWaste * 100) : 0}%`,
                                            height: '100%',
                                            bgcolor: w.color,
                                            transition: 'width 0.5s ease',
                                        }} />
                                    </Box>
                                </Box>
                            ))}
                            <Divider sx={{ my: 0.5 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" fontWeight="bold">Total Waste</Typography>
                                <Typography variant="subtitle2" fontWeight="bold" color="error.main">
                                    {(todayProduction?.totalWaste || 0).toFixed(2)} kg
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Cost Breakdown Details */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, borderRadius: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Costing Entries (Today)</Typography>
                        <Grid container spacing={2}>
                            {todayCosts.length > 0 ? todayCosts.map((c: any) => {
                                const catConfig = CATEGORY_ICONS[c.category] || { icon: <OtherIcon fontSize="small" />, color: '#64748b' };
                                return (
                                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={c.id}>
                                        <Card variant="outlined" sx={{ borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: catConfig.color }} />
                                            <CardContent sx={{ pl: 2.5 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Box sx={{ color: catConfig.color }}>{catConfig.icon}</Box>
                                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                                        {c.category}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h6" fontWeight="bold">₹{parseFloat(c.totalCost || 0).toLocaleString('en-IN')}</Typography>
                                                <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }} noWrap>
                                                    {c.details || c.description || '—'}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            }) : (
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ py: 5, textAlign: 'center' }}>
                                        <AccountBalance sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                                        <Typography color="text.secondary">No costing entries for today</Typography>
                                        <Typography variant="caption" color="text.disabled">Navigate to Costing to add today's expenses</Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TodayDashboard;
