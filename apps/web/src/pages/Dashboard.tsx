import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import {
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

interface KPI {
    label: string;
    value: string;
    subValue?: string;
    color: string;
    trend: string;
    comparison: string;
    hasData: boolean;
}

interface DashboardSummary {
    kpis: KPI[];
}

const Dashboard: React.FC = () => {
    const [dateFilter, setDateFilter] = useState<string>('today');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');

    // Calculate date range based on filter
    const getDateRange = () => {
        const today = new Date();
        let from = new Date();
        let to = new Date();

        switch (dateFilter) {
            case 'today':
                from = to = today;
                break;
            case 'yesterday':
                from = to = new Date(today.setDate(today.getDate() - 1));
                break;
            case 'week':
                from = new Date(today.setDate(today.getDate() - 7));
                to = new Date();
                break;
            case 'month':
                from = new Date(today.setMonth(today.getMonth() - 1));
                to = new Date();
                break;
            case '3months':
                from = new Date(today.setMonth(today.getMonth() - 3));
                to = new Date();
                break;
            case '6months':
                from = new Date(today.setMonth(today.getMonth() - 6));
                to = new Date();
                break;
            case 'year':
                from = new Date(today.setFullYear(today.getFullYear() - 1));
                to = new Date();
                break;
            case 'custom':
                if (customFrom && customTo) {
                    from = new Date(customFrom);
                    to = new Date(customTo);
                }
                break;
        }

        return {
            from: from.toISOString().split('T')[0],
            to: to.toISOString().split('T')[0]
        };
    };

    const dateRange = getDateRange();

    const { data: summary, isLoading } = useQuery<DashboardSummary>({
        queryKey: ['dashboardSummary', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get(`/dashboard/summary?from=${dateRange.from}&to=${dateRange.to}`);
            return response.data;
        },
    });

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Typography>Loading dashboard...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Dashboard Overview
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Date Filter</InputLabel>
                        <Select
                            value={dateFilter}
                            label="Date Filter"
                            onChange={handleDateFilterChange}
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="yesterday">Yesterday</MenuItem>
                            <MenuItem value="week">Past Week</MenuItem>
                            <MenuItem value="month">Past Month</MenuItem>
                            <MenuItem value="3months">Past 3 Months</MenuItem>
                            <MenuItem value="6months">Past 6 Months</MenuItem>
                            <MenuItem value="year">Past Year</MenuItem>
                            <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                    </FormControl>

                    {dateFilter === 'custom' && (
                        <>
                            <TextField
                                type="date"
                                label="From"
                                size="small"
                                value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="date"
                                label="To"
                                size="small"
                                value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </>
                    )}
                </Box>
            </Box>

            {/* KPI Cards */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {summary?.kpis?.map((kpi: KPI, index: number) => (
                    <Box key={index} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
                        <Paper sx={{ p: 3, borderRadius: 2, borderLeft: `6px solid ${kpi.color}` }}>
                            <Typography variant="subtitle2" color="text.secondary">{kpi.label}</Typography>
                            {kpi.hasData ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{kpi.value}</Typography>
                                        {kpi.subValue && (
                                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                                {kpi.subValue}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: kpi.trend.startsWith('+') ? 'success.main' : 'error.main' }}>
                                        {kpi.trend.startsWith('+') ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'medium' }}>{kpi.trend}</Typography>
                                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>{kpi.comparison}</Typography>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">No data available</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default Dashboard;
