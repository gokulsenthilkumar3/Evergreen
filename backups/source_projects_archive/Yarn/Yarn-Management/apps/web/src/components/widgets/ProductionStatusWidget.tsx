import { useEffect, useState } from 'react';
import { Typography, Box, Grid, Chip, useTheme } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import FactoryIcon from '@mui/icons-material/Factory';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../../lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

export default function ProductionStatusWidget() {
    const theme = useTheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/production-stats');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load production stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardWidget
            title="Production Status"
            icon={<FactoryIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            {data && (
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="h3" color="text.primary">
                                {data.activeBatches}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Batches
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography variant="h4" color="success.main">
                                {data.activeOperators}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Operators
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Chip
                                label={`${data.completionRate}% Complete`}
                                color={data.completionRate >= 80 ? 'success' : data.completionRate >= 50 ? 'warning' : 'error'}
                                sx={{ fontSize: '1rem', py: 2 }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {data.stageDistribution && data.stageDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={data.stageDistribution}
                                        dataKey="count"
                                        nameKey="stage"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={70}
                                        label={{ fill: theme.palette.text.primary, fontSize: 12 }}
                                    >
                                        {data.stageDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: theme.palette.background.paper,
                                            border: `1px solid ${theme.palette.divider}`,
                                            color: theme.palette.text.primary
                                        }}
                                    />
                                    <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Typography variant="body2" color="text.secondary" align="center">
                                No active batches
                            </Typography>
                        )}
                    </Grid>
                </Grid>
            )}
        </DashboardWidget>
    );
}
