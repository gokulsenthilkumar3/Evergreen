import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Paper, useTheme } from '@mui/material';
import { http } from '../../lib/http';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

export default function ManufacturingDashboard() {
    const theme = useTheme();
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        completed: 0,
        planned: 0
    });
    const [chartData, setChartData] = useState<{ stageConf: any[], outputConf: any[] }>({ stageConf: [], outputConf: [] });
    const [loading, setLoading] = useState(true);

    async function loadData() {
        setLoading(true);
        try {
            const res = await http.get('/manufacturing/batches');
            const batches: any[] = res.data.batches;

            const total = batches.length;
            const completed = batches.filter(b => b.currentStage === 'COMPLETED').length;
            const planned = batches.filter(b => b.currentStage === 'PLANNED').length;
            const inProgress = total - completed - planned;

            setStats({ total, inProgress, completed, planned });

            // Prepare Chart Data
            const stages = ['PLANNED', 'MIXING', 'CARDING', 'DRAWING', 'ROVING', 'SPINNING', 'WINDING', 'COMPLETED'];
            const stageData = stages.map(stage => ({
                name: stage,
                count: batches.filter(b => b.currentStage === stage).length
            }));

            // Mock Monthly Output (since we don't have historical data store easily accessible)
            // In a real app, this would come from an analytics endpoint
            const outputData = [
                { name: 'Jan', output: 4000 },
                { name: 'Feb', output: 3000 },
                { name: 'Mar', output: 2000 },
                { name: 'Apr', output: 2780 },
                { name: 'May', output: 1890 },
                { name: 'Jun', output: 2390 },
                { name: 'Jul', output: 3490 },
            ];

            setChartData({ stageConf: stageData, outputConf: outputData });

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const MetricCard = ({ title, value, icon, color }: any) => (
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: `${color}15`,
                    color: color,
                    mr: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </Box>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary' }}>{value}</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="500">{title}</Typography>
                </Box>
            </CardContent>
        </Card>
    );

    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        borderRadius: 8,
        boxShadow: theme.shadows[3]
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: '800', color: 'text.primary' }}>Manufacturing Overview</Typography>

            {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Total Batches"
                        value={stats.total}
                        icon={<AssignmentIcon fontSize="large" />}
                        color="#2563eb"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="In Progress"
                        value={stats.inProgress}
                        icon={<PrecisionManufacturingIcon fontSize="large" />}
                        color="#f59e0b"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Completed"
                        value={stats.completed}
                        icon={<CheckCircleIcon fontSize="large" />}
                        color="#10b981"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <MetricCard
                        title="Planned"
                        value={stats.planned}
                        icon={<AssignmentIcon fontSize="large" />}
                        color="#6366f1"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: '700', color: 'text.primary' }}>Batches by Stage</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.stageConf}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                <Tooltip
                                    cursor={{ fill: theme.palette.action.hover }}
                                    contentStyle={tooltipStyle}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 400 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: '700', color: 'text.primary' }}>Output Trend</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData.outputConf}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                />
                                <Line type="monotone" dataKey="output" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
