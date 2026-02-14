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
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                gap: 3
            }}>
                {summary?.kpis?.map((kpi: KPI, index: number) => (
                    <Paper
                        key={index}
                        sx={{
                            p: 3,
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: (theme) => theme.palette.mode === 'dark'
                                    ? `0 12px 24px -1px rgba(0, 0, 0, 0.4), 0 0 0 1px ${kpi.color}22`
                                    : `0 12px 24px -1px rgba(0, 0, 0, 0.08), 0 0 0 1px ${kpi.color}22`,
                            }
                        }}
                    >
                        {/* Status Bar */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            bgcolor: kpi.color,
                            opacity: 0.8
                        }} />

                        {/* Background Decoration */}
                        <Box sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            bg: kpi.color,
                            opacity: 0.03,
                            filter: 'blur(20px)'
                        }} />

                        <Typography
                            variant="overline"
                            sx={{
                                fontWeight: 700,
                                color: 'text.secondary',
                                letterSpacing: '0.1em',
                                display: 'block',
                                mb: 1,
                                opacity: 0.8
                            }}
                        >
                            {kpi.label}
                        </Typography>

                        {kpi.hasData ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 0.5, mb: 2 }}>
                                    <Typography variant="h3" sx={{ fontWeight: 800 }}>
                                        {kpi.value.split(' ')[0]}
                                    </Typography>
                                    <Typography variant="h6" sx={{ ml: 1, color: 'text.secondary', fontWeight: 500, fontSize: '0.9rem' }}>
                                        {kpi.value.split(' ').slice(1).join(' ')}
                                    </Typography>
                                </Box>

                                {kpi.subValue && (
                                    <Typography variant="caption" sx={{ display: 'block', mt: -1, mb: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                        {kpi.subValue}
                                    </Typography>
                                )}

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                                    alignSelf: 'flex-start',
                                    width: 'fit-content'
                                }}>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: kpi.trend.startsWith('+') ? 'success.main' : 'error.main',
                                        mr: 1.5
                                    }}>
                                        {kpi.trend.startsWith('+') ? <ArrowUpward sx={{ fontSize: 16 }} /> : <ArrowDownward sx={{ fontSize: 16 }} />}
                                        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 700 }}>
                                            {kpi.trend}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        {kpi.comparison}
                                    </Typography>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ mt: 2, py: 1 }}>
                                <Typography variant="body2" color="text.secondary">No data available for this period</Typography>
                            </Box>
                        )}
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

export default Dashboard;
