import { useEffect, useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, useTheme } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import TimelineIcon from '@mui/icons-material/Timeline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../lib/api';

export default function ProductionEfficiencyChart() {
    const theme = useTheme();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState(7);

    const fetchData = async (days: number) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/dashboard/production-efficiency?days=${days}`);
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load production efficiency data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(timeRange);
    }, [timeRange]);

    const handleTimeRangeChange = (_event: React.MouseEvent<HTMLElement>, newRange: number | null) => {
        if (newRange !== null) {
            setTimeRange(newRange);
        }
    };

    return (
        <DashboardWidget
            title="Production Efficiency"
            icon={<TimelineIcon color="primary" />}
            loading={loading}
            error={error}
            onRefresh={() => fetchData(timeRange)}
        >
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <ToggleButtonGroup
                        value={timeRange}
                        exclusive
                        onChange={handleTimeRangeChange}
                        size="small"
                    >
                        <ToggleButton value={7}>7 Days</ToggleButton>
                        <ToggleButton value={14}>14 Days</ToggleButton>
                        <ToggleButton value={30}>30 Days</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getMonth() + 1}/${date.getDate()}`;
                                }}
                            />
                            <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                            <Tooltip
                                labelFormatter={(value) => typeof value === 'string' || typeof value === 'number' ? new Date(value).toLocaleDateString() : ''}
                                contentStyle={{
                                    borderRadius: 8,
                                    border: `1px solid ${theme.palette.divider}`,
                                    backgroundColor: theme.palette.background.paper,
                                    color: theme.palette.text.primary,
                                    boxShadow: theme.shadows[3]
                                }}
                            />
                            <Legend wrapperStyle={{ color: theme.palette.text.primary }} />
                            <Line
                                type="monotone"
                                dataKey="planned"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Planned Batches"
                                dot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="actual"
                                stroke="#10b981"
                                strokeWidth={2}
                                name="Completed Batches"
                                dot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="efficiency"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="Efficiency %"
                                dot={{ r: 4 }}
                                yAxisId="right"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                        No production data available for the selected period
                    </Box>
                )}
            </Box>
        </DashboardWidget>
    );
}
