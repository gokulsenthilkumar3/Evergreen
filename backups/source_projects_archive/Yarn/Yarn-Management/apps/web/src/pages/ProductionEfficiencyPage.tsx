import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Tabs, Tab, CircularProgress, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { http } from '../lib/http';
import OEEGaugeChart from '../components/manufacturing/OEEGaugeChart';
import CycleTimeChart from '../components/manufacturing/CycleTimeChart';
import BottleneckAnalysis from '../components/manufacturing/BottleneckAnalysis';
import { notify } from '../context/NotificationContext';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ProductionEfficiencyPage() {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [oeeTrends, setOeeTrends] = useState<any>(null);
    const [bottlenecks, setBottlenecks] = useState<any>(null);
    const [cycleTimeTrends, setCycleTimeTrends] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [oeeRes, bottlenecksRes, cycleRes] = await Promise.all([
                http.get('/manufacturing/efficiency/oee/trends'),
                http.get('/manufacturing/efficiency/bottlenecks'),
                http.get('/manufacturing/efficiency/cycle-time/trends'),
            ]);

            setOeeTrends(oeeRes.data);
            setBottlenecks(bottlenecksRes.data);
            setCycleTimeTrends(cycleRes.data.trends);
        } catch (error) {
            console.error('Failed to load efficiency data:', error);
            notify.showError('Failed to load efficiency data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const avgOEE = oeeTrends?.averages?.oee || 0;
    const oeeLevel = avgOEE >= 85 ? 'WORLD CLASS' : avgOEE >= 60 ? 'GOOD' : avgOEE >= 40 ? 'FAIR' : 'POOR';
    const oeeColor = avgOEE >= 85 ? 'success' : avgOEE >= 60 ? 'info' : avgOEE >= 40 ? 'warning' : 'error';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Production Efficiency
                </Typography>
                <Button variant="outlined" onClick={loadData}>
                    Refresh Data
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#eff6ff' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp size={20} color="#3b82f6" />
                                <Typography variant="caption" fontWeight="bold" color="primary">
                                    AVERAGE OEE
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {avgOEE.toFixed(1)}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {oeeLevel} Performance
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#f0fdf4' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Activity size={20} color="#22c55e" />
                                <Typography variant="caption" fontWeight="bold" color="success.main">
                                    AVAILABILITY
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {oeeTrends?.averages?.availability?.toFixed(1) || 0}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Machine Uptime
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#fef3c7' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TrendingUp size={20} color="#f59e0b" />
                                <Typography variant="caption" fontWeight="bold" color="warning.main">
                                    PERFORMANCE
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {oeeTrends?.averages?.performance?.toFixed(1) || 0}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Speed Efficiency
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : '#fef2f2' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AlertTriangle size={20} color="#ef4444" />
                                <Typography variant="caption" fontWeight="bold" color="error.main">
                                    BOTTLENECKS
                                </Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {bottlenecks?.allBottlenecks?.length || 0}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Active Issues
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                    <Tab label="OEE Overview" />
                    <Tab label="Cycle Time Analysis" />
                    <Tab label="Bottlenecks" />
                </Tabs>
            </Box>

            {/* Tab Content */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <OEEGaugeChart oee={avgOEE} label="Overall OEE" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    OEE Components
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    {['availability', 'performance', 'quality'].map((metric) => (
                                        <Box key={metric} sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {metric}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {oeeTrends?.averages?.[metric]?.toFixed(1) || 0}%
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    height: 8,
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 1,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        height: '100%',
                                                        width: `${oeeTrends?.averages?.[metric] || 0}%`,
                                                        bgcolor: metric === 'availability' ? 'success.main' : metric === 'performance' ? 'warning.main' : 'info.main',
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && (
                <CycleTimeChart trends={cycleTimeTrends} />
            )}

            {activeTab === 2 && (
                <BottleneckAnalysis bottlenecks={bottlenecks} />
            )}
        </Box>
    );
}
