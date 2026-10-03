import { useEffect, useState } from 'react';
import { Typography, Box, Grid } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';

export default function FinancialOverviewWidget() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/financial-summary');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load financial summary');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <DashboardWidget
            title="Financial Overview"
            icon={<AttachMoneyIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            {data && (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={data.monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="success.main">
                                ₹{data.outstandingTotal?.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Outstanding
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                                {data.collectionRate}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Collection Rate
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="error">
                                {data.overdueCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Overdue
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </DashboardWidget>
    );
}
