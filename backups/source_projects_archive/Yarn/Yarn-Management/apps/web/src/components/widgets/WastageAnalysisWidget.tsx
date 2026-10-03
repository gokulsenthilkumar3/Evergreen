import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Tabs, Tab, useTheme } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../../lib/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

interface WastageData {
    byStage: Array<{ stage: string; quantity: string }>;
    byType: Array<{ type: string; quantity: string }>;
    trends: Array<{ date: string; quantity: string }>;
}

export default function WastageAnalysisWidget() {
    const theme = useTheme();
    const [data, setData] = useState<WastageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/wastage-analysis');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load wastage analysis');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        borderRadius: 8
    };

    return (
        <DashboardWidget
            title="Wastage Analysis"
            icon={<DeleteIcon color="error" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            {data && (
                <Box>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Tab label="By Stage" />
                        <Tab label="By Type" />
                        <Tab label="Trends" />
                    </Tabs>

                    {/* By Stage - Pie Chart */}
                    {activeTab === 0 && (
                        <Box>
                            {data.byStage && data.byStage.length > 0 ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={7}>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={data.byStage}
                                                    dataKey="quantity"
                                                    nameKey="stage"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    label={props => `${props.payload?.stage || props.name}: ${Number(props.payload?.quantity || 0).toFixed(1)}kg`}
                                                    labelLine={{ stroke: theme.palette.text.secondary }}
                                                >
                                                    {data.byStage.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kg`} contentStyle={tooltipStyle} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <Box sx={{ mt: 2 }}>
                                            {data.byStage.map((item, index) => (
                                                <Box key={item.stage} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Box
                                                        sx={{
                                                            width: 16,
                                                            height: 16,
                                                            borderRadius: '50%',
                                                            bgcolor: COLORS[index % COLORS.length],
                                                            mr: 1,
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                                        {item.stage}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {Number(item.quantity).toFixed(1)} kg
                                                    </Typography>
                                                </Box>
                                            ))}
                                            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Total Wastage
                                                </Typography>
                                                <Typography variant="h5" color="error.main">
                                                    {data.byStage.reduce((sum, item) => sum + Number(item.quantity), 0).toFixed(2)} kg
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    No wastage data by stage
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* By Type - Bar Chart */}
                    {activeTab === 1 && (
                        <Box>
                            {data.byType && data.byType.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.byType}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis dataKey="type" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                        <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }} />
                                        <Tooltip formatter={(value: any) => `${Number(value).toFixed(2)} kg`} contentStyle={tooltipStyle} />
                                        <Bar dataKey="quantity" fill="#ef4444" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    No wastage data by type
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Trends - Area Chart */}
                    {activeTab === 2 && (
                        <Box>
                            {data.trends && data.trends.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.trends}>
                                        <defs>
                                            <linearGradient id="colorWastage" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                            tickFormatter={(value) => {
                                                const date = new Date(value);
                                                return `${date.getMonth() + 1}/${date.getDate()}`;
                                            }}
                                        />
                                        <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} label={{ value: 'Quantity (kg)', angle: -90, position: 'insideLeft', fill: theme.palette.text.secondary }} />
                                        <Tooltip
                                            labelFormatter={(value) => typeof value === 'string' || typeof value === 'number' ? new Date(value).toLocaleDateString() : ''}
                                            formatter={(value: any) => [`${Number(value).toFixed(2)} kg`, 'Wastage']}
                                            contentStyle={tooltipStyle}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="quantity"
                                            stroke="#ef4444"
                                            fillOpacity={1}
                                            fill="url(#colorWastage)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center">
                                    No wastage trend data available
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            )}
        </DashboardWidget>
    );
}
