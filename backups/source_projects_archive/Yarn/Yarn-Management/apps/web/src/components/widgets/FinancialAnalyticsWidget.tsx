import { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Typography, Grid, Chip } from '@mui/material';
import DashboardWidget from '../DashboardWidget';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    ComposedChart,
    Line,
    LineChart,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import api from '../../lib/api';

interface FinancialAnalyticsData {
    revenueVsCost: {
        monthly: Array<{
            month: string;
            revenue: number;
            cost: number;
            profit: number;
        }>;
        summary: {
            totalRevenue: number;
            totalCost: number;
            totalProfit: number;
            averageProfitMargin: number;
        };
    };
    profitMargins: {
        trends: Array<{
            month: string;
            profitMargin: number;
            grossMargin: number;
            revenue: number;
            cost: number;
        }>;
        summary: {
            averageProfitMargin: number;
            trend: 'UP' | 'DOWN' | 'STABLE';
            trendValue: number;
            monthsAnalyzed: number;
        };
    };
    paymentBehavior?: {
        trends: Array<{
            month: string;
            avgDaysToPay: number;
            standardTerms: number;
        }>;
        distribution: Array<{
            name: string;
            value: number;
            color: string;
        }>;
        summary: {
            onTimePercentage: number;
            avgCollectionPeriod: number;
            totalProcessed: number;
        };
    };
}

// Format large numbers as currency
function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `₹${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `₹${(value / 1000).toFixed(0)}K`;
    }
    return `₹${value}`;
}

export default function FinancialAnalyticsWidget() {
    const [data, setData] = useState<FinancialAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/dashboard/financial-analytics');
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load financial analytics');
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

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'UP':
                return <TrendingUpIcon sx={{ color: '#10b981', fontSize: 20 }} />;
            case 'DOWN':
                return <TrendingDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />;
            default:
                return <TrendingFlatIcon sx={{ color: '#6b7280', fontSize: 20 }} />;
        }
    };

    const renderRevenueVsCost = () => {
        if (!data?.revenueVsCost) return null;
        const { monthly, summary } = data.revenueVsCost;

        return (
            <Box>
                {/* Summary KPIs */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#10b981">
                                {formatCurrency(summary.totalRevenue)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Revenue
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 1.5, bgcolor: '#fef2f2', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#ef4444">
                                {formatCurrency(summary.totalCost)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Cost
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#3b82f6">
                                {formatCurrency(summary.totalProfit)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Profit
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ p: 1.5, bgcolor: '#faf5ff', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#8b5cf6">
                                {summary.averageProfitMargin}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Avg Margin
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Bar Chart */}
                <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={monthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                            formatter={(value, name) => [
                                formatCurrency(Number(value)),
                                String(name).charAt(0).toUpperCase() + String(name).slice(1),
                            ]}
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend />
                        <Bar
                            dataKey="revenue"
                            fill="#10b981"
                            name="Revenue"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="cost"
                            fill="#ef4444"
                            name="Cost"
                            radius={[4, 4, 0, 0]}
                        />
                        <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            name="Profit"
                            dot={{ r: 4 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const renderProfitMarginTrends = () => {
        if (!data?.profitMargins) return null;
        const { trends, summary } = data.profitMargins;

        // Filter out months with no data for cleaner visualization
        const validTrends = trends.filter(t => t.revenue > 0);

        if (validTrends.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    No profit margin data available
                </Box>
            );
        }

        return (
            <Box>
                {/* Summary Stats */}
                <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Box sx={{ p: 1.5, bgcolor: '#faf5ff', borderRadius: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="#8b5cf6">
                            {summary.averageProfitMargin}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Avg Profit Margin
                        </Typography>
                    </Box>
                    <Box sx={{
                        p: 1.5,
                        bgcolor: summary.trend === 'UP' ? '#f0fdf4' : summary.trend === 'DOWN' ? '#fef2f2' : '#f8fafc',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}>
                        {getTrendIcon(summary.trend)}
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={summary.trend === 'UP' ? '#10b981' : summary.trend === 'DOWN' ? '#ef4444' : '#6b7280'}
                            >
                                {summary.trendValue > 0 ? '+' : ''}{summary.trendValue}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Trend
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        label={`${summary.monthsAnalyzed} months analyzed`}
                        size="small"
                        sx={{ bgcolor: '#f1f5f9' }}
                    />
                </Box>

                {/* Area Chart */}
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={validTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="profitMarginGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="grossMarginGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            formatter={(value, name) => [
                                `${value}%`,
                                name === 'profitMargin' ? 'Profit Margin' : 'Gross Margin',
                            ]}
                            contentStyle={{
                                borderRadius: 8,
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Legend
                            formatter={(value) => value === 'profitMargin' ? 'Profit Margin' : 'Gross Margin'}
                        />
                        <Area
                            type="monotone"
                            dataKey="grossMargin"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#grossMarginGradient)"
                        />
                        <Area
                            type="monotone"
                            dataKey="profitMargin"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            fill="url(#profitMarginGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        );
    };

    const renderPaymentBehavior = () => {
        if (!data?.paymentBehavior) return null;
        const { trends, distribution, summary } = data.paymentBehavior;

        return (
            <Box>
                {/* Summary KPIs */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#10b981">
                                {summary.onTimePercentage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                On-Time Payments
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: '#fffbed', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#f59e0b">
                                {summary.avgCollectionPeriod} Days
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Avg Collection Period
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight="bold" color="#64748b">
                                {summary.totalProcessed}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Invoices Analyzed
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Average Days to Pay Trend</Typography>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={trends} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="avgDaysToPay" name="Avg Days" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="step" dataKey="standardTerms" name="Standard Terms (30)" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Payment Status Distribution</Typography>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <DashboardWidget
            title="Financial Analytics"
            icon={<AttachMoneyIcon color="success" />}
            loading={loading}
            error={error}
            onRefresh={fetchData}
        >
            <Box>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Revenue vs Cost" sx={{ textTransform: 'none' }} />
                    <Tab label="Profit Margins" sx={{ textTransform: 'none' }} />
                    <Tab label="Payment Behavior" sx={{ textTransform: 'none' }} />
                </Tabs>
                {activeTab === 0 && renderRevenueVsCost()}
                {activeTab === 1 && renderProfitMarginTrends()}
                {activeTab === 2 && renderPaymentBehavior()}
            </Box>
        </DashboardWidget>
    );
}
