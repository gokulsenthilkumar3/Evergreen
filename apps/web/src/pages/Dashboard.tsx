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
    Skeleton,
    Chip,
    Divider,
    Avatar,
    Button,
    Grid,
} from '@mui/material';
import { getDateRange as getStandardDateRange, DATE_FILTER_OPTIONS, type DateFilterType } from '../utils/dateFilters';
import {
    ArrowUpward,
    ArrowDownward,
    Factory as FactoryIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Receipt as ReceiptIcon,
    Inventory2 as InventoryIcon,
    AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import api from '../utils/api';

import {
    AddCircleOutline as AddIcon,
    ArrowForward as ArrowForwardIcon,
    History as HistoryIcon,
    InsertChartOutlined as ChartIcon,
    AccountBalanceWallet as WalletIcon,
    ElectricBolt as EnergyIcon,
} from '@mui/icons-material';

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
    meta: any;
}

const PIE_COLORS = ['#059669', '#6366f1', '#0ea5e9', '#f59e0b', '#ef4444'];

const ActivityIcon = ({ type }: { type: string }) => {
    const icons: Record<string, { icon: React.ReactNode; bg: string }> = {
        production: { icon: <FactoryIcon sx={{ fontSize: 16 }} />, bg: '#059669' },
        inward: { icon: <DownloadIcon sx={{ fontSize: 16 }} />, bg: '#0ea5e9' },
        outward: { icon: <UploadIcon sx={{ fontSize: 16 }} />, bg: '#6366f1' },
        billing: { icon: <ReceiptIcon sx={{ fontSize: 16 }} />, bg: '#f59e0b' },
    };
    const config = icons[type] || { icon: <InventoryIcon sx={{ fontSize: 16 }} />, bg: '#64748b' };
    return (
        <Avatar sx={{ width: 32, height: 32, bgcolor: config.bg, flexShrink: 0 }}>
            {config.icon}
        </Avatar>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 1.5, minWidth: 140 }} elevation={3}>
                <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>{label}</Typography>
                {payload.map((p: any) => (
                    <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">{p.name}</Typography>
                        <Typography variant="caption" fontWeight={600} color={p.color}>
                            {p.name === 'Cost' ? `₹${Number(p.value).toLocaleString('en-IN')}` : `${Number(p.value).toFixed(1)} kg`}
                        </Typography>
                    </Box>
                ))}
            </Paper>
        );
    }
    return null;
};

const CostTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <Paper sx={{ p: 1.5, minWidth: 150 }} elevation={3}>
                <Typography variant="caption" fontWeight="bold" display="block" mb={0.5}>{label}</Typography>
                {payload.map((p: any) => (
                    <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">{p.name}</Typography>
                        <Typography variant="caption" fontWeight={600} color={p.color}>
                            ₹{Number(p.value).toLocaleString('en-IN')}
                        </Typography>
                    </Box>
                ))}
            </Paper>
        );
    }
    return null;
};

interface DashboardProps {
    onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const navigate = (page: string) => onNavigate?.(page);
    const [dateFilter, setDateFilter] = useState<DateFilterType>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');

    const getDateRange = () => getStandardDateRange(dateFilter, customFrom, customTo);
    const dateRange = getDateRange();

    const { data: summary, isLoading } = useQuery<DashboardSummary>({
        queryKey: ['dashboardSummary', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get(`/dashboard/summary?from=${dateRange.from}&to=${dateRange.to}`);
            return response.data;
        },
    });

    const { data: charts, isLoading: chartsLoading } = useQuery({
        queryKey: ['dashboardCharts', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get(`/dashboard/charts?from=${dateRange.from}&to=${dateRange.to}`);
            return response.data;
        },
    });

    const { data: activity, isLoading: activityLoading } = useQuery({
        queryKey: ['recentActivity'],
        queryFn: async () => {
            const response = await api.get('/dashboard/recent-activity');
            return response.data;
        },
        refetchInterval: 60000,
    });

    const isDashboardEmpty = !isLoading && !chartsLoading &&
        (summary?.kpis?.every(k => !k.hasData) ?? true) &&
        (!charts?.productionTrend || charts.productionTrend.length === 0 || charts.productionTrend.every((d: any) => d.produced === 0)) &&
        (!charts?.costTrend || charts.costTrend.length === 0 || charts.costTrend.every((d: any) => d.total === 0));

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value as DateFilterType);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    // Yarn stock bar chart data
    const yarnStockData = charts?.yarnStockByCount
        ? Object.entries(charts.yarnStockByCount)
            .filter(([, v]) => (v as number) > 0)
            .map(([count, bal]) => ({
                count: `Count ${count}`,
                bags: Math.floor((bal as number) / 60),
                loose: parseFloat(((bal as number) % 60).toFixed(1)),
                total: parseFloat((bal as number).toFixed(1)),
            }))
        : [];

    const prodTrend = charts?.productionTrend || [];
    const costTrend = charts?.costTrend || [];
    const costPie = (charts?.costByCategory || []).filter((c: any) => c.value > 0);

    const KpiSkeleton = () => (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="text" width="50%" height={16} />
        </Paper>
    );

    const QuickAction = ({ icon, label, onClick, color }: { icon: React.ReactNode, label: string, onClick: () => void, color: string }) => (
        <Button
            variant="outlined"
            onClick={onClick}
            startIcon={icon}
            sx={{
                flex: 1,
                minWidth: 160,
                py: 2,
                borderRadius: 2,
                borderColor: 'divider',
                justifyContent: 'flex-start',
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.primary',
                '&:hover': {
                    borderColor: color,
                    bgcolor: `${color}08`,
                    transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
            }}
        >
            {label}
        </Button>
    );

    if (isDashboardEmpty && dateFilter !== 'custom') {
        return (
            <Box sx={{ maxWidth: '100%', width: '100%' }}>
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h4" fontWeight={900}>Welcome to EverGreen</Typography>
                    <Typography color="text.secondary">You're all set up! Let's start by adding some data to your workspace.</Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Paper sx={{ p: 4, borderRadius: 3, border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent', textAlign: 'center' }}>
                            <Box sx={{ py: 6 }}>
                                <ChartIcon sx={{ fontSize: 80, color: 'text.disabled', opacity: 0.3, mb: 3 }} />
                                <Typography variant="h5" fontWeight={700} gutterBottom>No data to display yet</Typography>
                                <Typography color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 4 }}>
                                    Your dashboard will come alive once you start recording production, costs, and inventory movements.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Button variant="contained" size="large" onClick={() => navigate('production')} startIcon={<FactoryIcon />}>
                                        Record Production
                                    </Button>
                                    <Button variant="outlined" size="large" onClick={() => navigate('inward')} startIcon={<DownloadIcon />}>
                                        Add Inward
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Next Steps</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Paper sx={{ p: 2.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => navigate('costing')}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}><WalletIcon /></Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700}>Add Operational Costs</Typography>
                                        <Typography variant="body2" color="text.secondary">Log EB, employee and packing costs...</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                            <Paper sx={{ p: 2.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => navigate('outward')}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}><UploadIcon /></Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700}>Record Outward</Typography>
                                        <Typography variant="body2" color="text.secondary">Log yarn shipments to customers...</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                            <Paper sx={{ p: 2.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => navigate('settings')}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'success.light', color: 'success.dark' }}><EnergyIcon /></Avatar>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700}>Configure Rates</Typography>
                                        <Typography variant="body2" color="text.secondary">Set EB and conversion rates...</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Operational overview for your selected period
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 180 }} size="small">
                        <InputLabel>Period</InputLabel>
                        <Select value={dateFilter} label="Period" onChange={handleDateFilterChange}>
                            {DATE_FILTER_OPTIONS.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {dateFilter === 'custom' && (
                        <>
                            <TextField type="date" label="From" size="small" value={customFrom}
                                onChange={(e) => setCustomFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                            <TextField type="date" label="To" size="small" value={customTo}
                                onChange={(e) => setCustomTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </>
                    )}
                </Box>
            </Box>

            {/* KPI Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
                {isLoading ? (
                    [0, 1, 2, 3].map(i => <KpiSkeleton key={i} />)
                ) : (
                    summary?.kpis?.map((kpi: KPI, index: number) => (
                        <Paper
                            key={index}
                            sx={{
                                p: 3,
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'default',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme) => theme.palette.mode === 'dark'
                                        ? `0 12px 24px -1px rgba(0, 0, 0, 0.4), 0 0 0 1px ${kpi.color}22`
                                        : `0 12px 24px -1px rgba(0, 0, 0, 0.08), 0 0 0 1px ${kpi.color}22`,
                                }
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', bgcolor: kpi.color }} />
                            <Box sx={{
                                position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                                borderRadius: '50%', bgcolor: kpi.color, opacity: 0.06, filter: 'blur(20px)'
                            }} />
                            <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.1em', display: 'block', mb: 1 }}>
                                {kpi.label}
                            </Typography>
                            {kpi.hasData ? (
                                <>
                                    <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.6rem', md: '2rem' } }}>
                                        {kpi.value.split(' ')[0]}
                                        {kpi.value.split(' ').length > 1 && (
                                            <Box component="span" sx={{ fontSize: '1rem', fontWeight: 500, color: 'text.secondary', ml: 0.5 }}>
                                                {kpi.value.split(' ').slice(1).join(' ')}
                                            </Box>
                                        )}
                                    </Typography>
                                    {kpi.subValue && (
                                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>
                                            {kpi.subValue}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.disabled">No data for this period</Typography>
                                </Box>
                            )}
                        </Paper>
                    ))
                )}
            </Box>

            {/* Charts Row 1: Production Trend + Cost Breakdown */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 3, mb: 3 }}>
                {/* Production Trend Area Chart */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={0.5}>Production Trend</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Daily output vs. waste (kg)
                    </Typography>
                    {chartsLoading ? (
                        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                    ) : prodTrend.some((d: any) => d.produced > 0) ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={prodTrend}>
                                <defs>
                                    <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradWaste" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Area type="monotone" dataKey="produced" name="Produced" stroke="#059669" fill="url(#gradProd)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="waste" name="Waste" stroke="#ef4444" fill="url(#gradWaste)" strokeWidth={2} dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <HistoryIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 1, opacity: 0.5 }} />
                                <Typography color="text.disabled" variant="body2" display="block">No production data for this period</Typography>
                                <Typography variant="caption" color="text.disabled">Entries from Production Module will appear here</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Cost by Category Pie Chart */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={0.5}>Cost Breakdown</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        By category for selected period
                    </Typography>
                    {chartsLoading ? (
                        <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
                    ) : costPie.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={costPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                                        dataKey="value" nameKey="name" paddingAngle={3}>
                                        {costPie.map((_: any, index: number) => (
                                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: any) => `\u20B9${Number(val).toLocaleString('en-IN')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ width: '100%', mt: 1 }}>
                                {costPie.map((c: any, i: number) => (
                                    <Box key={c.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <Typography variant="caption" color="text.secondary" noWrap>{c.name}</Typography>
                                        </Box>
                                        <Typography variant="caption" fontWeight={700}>
                                            \u20B9{Number(c.value).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <WalletIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 1, opacity: 0.5 }} />
                                <Typography color="text.disabled" variant="body2" display="block">No cost breakdown available</Typography>
                                <Typography variant="caption" color="text.disabled">Costing entries are required for this analysis</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Charts Row 2: Yarn Stock + Cost Trend + Activity */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 4fr' }, gap: 3, mb: 3 }}>
                {/* Stacked Cost Trend Bar Chart */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={0.5}>Cost Trend</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Daily cost breakdown by category
                    </Typography>
                    {chartsLoading ? (
                        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                    ) : costTrend.some((d: any) => d.total > 0) ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={costTrend} barSize={12}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `\u20B9${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<CostTooltip />} />
                                <Legend />
                                <Bar dataKey="eb" name="Electricity" fill="#059669" stackId="cost" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="employee" name="Employee" fill="#6366f1" stackId="cost" />
                                <Bar dataKey="packaging" name="Packaging" fill="#0ea5e9" stackId="cost" />
                                <Bar dataKey="maintenance" name="Maintenance" fill="#f59e0b" stackId="cost" />
                                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" stackId="cost" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <EnergyIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 1, opacity: 0.5 }} />
                                <Typography color="text.disabled" variant="body2" display="block">No cost trend found</Typography>
                                <Typography variant="caption" color="text.disabled">Daily costs will appear as they are recorded</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Yarn Stock by Count */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={0.5}>Yarn Stock</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Current balance by count
                    </Typography>
                    {chartsLoading ? (
                        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                    ) : yarnStockData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={yarnStockData} layout="vertical" barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}kg`} />
                                <YAxis type="category" dataKey="count" tick={{ fontSize: 11 }} width={65} />
                                <Tooltip formatter={(val: any) => `${val} kg`} />
                                <Bar dataKey="bags" name="Full Bags (\xD760kg)" fill="#059669" stackId="yarn" />
                                <Bar dataKey="loose" name="Loose kg" fill="#34d399" stackId="yarn" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider', flexDirection: 'column', gap: 1 }}>
                            <InventoryIcon sx={{ fontSize: 40, color: 'text.disabled', opacity: 0.5 }} />
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography color="text.disabled" variant="body2" display="block">Warehouse is empty</Typography>
                                <Typography variant="caption" color="text.disabled">Recorded production adds to your yarn stock</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

            {/* Recent Activity */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TimeIcon color="action" fontSize="small" />
                    <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                    <Chip label="Live" size="small" color="success" variant="outlined" sx={{ ml: 1, fontSize: '0.65rem', height: 20 }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {activityLoading ? (
                    [0, 1, 2, 3, 4].map(i => (
                        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Box sx={{ flex: 1 }}>
                                <Skeleton variant="text" width="60%" height={18} />
                                <Skeleton variant="text" width="40%" height={14} />
                            </Box>
                        </Box>
                    ))
                ) : activity && activity.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {activity.map((item: any, index: number) => (
                            <Box key={index}>
                                <Box sx={{ display: 'flex', gap: 2, py: 1.5, alignItems: 'flex-start' }}>
                                    <ActivityIcon type={item.type} />
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ ml: 2, flexShrink: 0 }}>
                                                {formatRelativeTime(item.date)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                                            {item.subtitle}
                                        </Typography>
                                        {item.by && (
                                            <Typography variant="caption" color="text.disabled">
                                                by {item.by}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                {index < activity.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                        <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                        <Typography color="text.disabled" display="block">No activity yet</Typography>
                        <Typography variant="caption" color="text.disabled">Transactions across all modules will show up here live</Typography>
                    </Box>
                )}
            </Paper>

            <Box sx={{ mt: 5, mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon color="primary" /> Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <QuickAction
                        icon={<FactoryIcon sx={{ color: '#059669' }} />}
                        label="Record Production"
                        onClick={() => navigate('production')}
                        color="#059669"
                    />
                    <QuickAction
                        icon={<DownloadIcon sx={{ color: '#0ea5e9' }} />}
                        label="Add Inward"
                        onClick={() => navigate('inward')}
                        color="#0ea5e9"
                    />
                    <QuickAction
                        icon={<UploadIcon sx={{ color: '#6366f1' }} />}
                        label="Record Outward"
                        onClick={() => navigate('outward')}
                        color="#6366f1"
                    />
                    <QuickAction
                        icon={<WalletIcon sx={{ color: '#f59e0b' }} />}
                        label="Add Costing"
                        onClick={() => navigate('costing')}
                        color="#f59e0b"
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
