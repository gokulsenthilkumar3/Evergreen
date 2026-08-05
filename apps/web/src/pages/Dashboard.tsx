import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
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
    Tooltip,
    LinearProgress,
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
    TrendingFlat,
    OpenInNew as LogsIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
    ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell,
    Brush, ReferenceLine,
} from 'recharts';
import api from '../utils/api';
import GlassDatePicker from '../components/common/GlassDatePicker';
const DashboardScene = lazy(() => import('../components/DashboardScene'));

import {
    AddCircleOutline as AddIcon,
    History as HistoryIcon,
    InsertChartOutlined as ChartIcon,
    AccountBalanceWallet as WalletIcon,
    ElectricBolt as EnergyIcon,
} from '@mui/icons-material';

// ─── Constants ────────────────────────────────────────────────────────────────

const BAG_WEIGHT_KG = 60;
const PIE_COLORS = ['#059669', '#6366f1', '#0ea5e9', '#f59e0b', '#ef4444'];

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface DashboardProps {
    onNavigate?: (page: string) => void;
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900): number {
    const [value, setValue] = useState(0);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        startRef.current = null;
        const step = (timestamp: number) => {
            if (startRef.current === null) startRef.current = timestamp;
            const progress = Math.min((timestamp - startRef.current) / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) rafRef.current = requestAnimationFrame(step);
        };
        rafRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafRef.current);
    }, [target, duration]);

    return value;
}

// ─── Sparkline (tiny area chart inside KPI card) ──────────────────────────────

const Sparkline = ({ data, color, dataKey }: { data: any[]; color: string; dataKey: string }) => (
    <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
                <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={`url(#spark-${color.replace('#', '')})`}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
            />
        </AreaChart>
    </ResponsiveContainer>
);

// ─── Activity helpers ─────────────────────────────────────────────────────────

const ActivityIcon = ({ type }: { type: string }) => {
    const icons: Record<string, { icon: React.ReactNode; bg: string }> = {
        production: { icon: <FactoryIcon sx={{ fontSize: 16 }} />, bg: '#059669' },
        inward:     { icon: <DownloadIcon sx={{ fontSize: 16 }} />, bg: '#0ea5e9' },
        outward:    { icon: <UploadIcon sx={{ fontSize: 16 }} />,   bg: '#6366f1' },
        billing:    { icon: <ReceiptIcon sx={{ fontSize: 16 }} />,  bg: '#f59e0b' },
    };
    const config = icons[type] || { icon: <InventoryIcon sx={{ fontSize: 16 }} />, bg: '#64748b' };
    return (
        <Avatar sx={{ width: 32, height: 32, bgcolor: config.bg, flexShrink: 0 }}>
            {config.icon}
        </Avatar>
    );
};

function groupByDay(items: any[]): { label: string; items: any[] }[] {
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString('en-CA');
    const groups: Record<string, any[]> = {};
    items.forEach((item) => {
        const day = item.date?.slice(0, 10) ?? '';
        const label = day === today ? 'Today' : day === yesterday ? 'Yesterday' : day || 'Older';
        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
    });
    // Return in order: Today → Yesterday → others newest first
    const ordered = ['Today', 'Yesterday'];
    const rest = Object.keys(groups).filter(k => !ordered.includes(k)).sort().reverse();
    return [...ordered, ...rest].filter(k => groups[k]).map(k => ({ label: k, items: groups[k] }));
}

// ─── Tooltip components ───────────────────────────────────────────────────────

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

// ─── Donut centre label ───────────────────────────────────────────────────────

const DonutCentreLabel = ({ viewBox, total }: any) => {
    const { cx, cy } = viewBox ?? { cx: 0, cy: 0 };
    return (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
            <tspan x={cx} dy="-0.4em" fontSize="11" fill="#888">Total</tspan>
            <tspan x={cx} dy="1.4em" fontSize="13" fontWeight="700" fill="currentColor">
                ₹{Number(total / 1000).toFixed(0)}k
            </tspan>
        </text>
    );
};

// ─── Efficiency Stat Card ─────────────────────────────────────────────────────

const EfficiencyStat = ({ label, value, unit, color, tooltip }: { label: string; value: string; unit: string; color: string; tooltip: string }) => (
    <Tooltip title={tooltip} arrow placement="top">
        <Paper
            sx={{
                p: 2, flex: 1, minWidth: 130,
                borderTop: `3px solid ${color}`,
                cursor: 'help',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: (t) => t.shadows[6] },
            }}
        >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{unit}</Typography>
            </Box>
        </Paper>
    </Tooltip>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

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

    const { data: settingsData } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => (await api.get('/settings')).data,
        staleTime: 5 * 60 * 1000,
    });

    const isDashboardEmpty = !isLoading && !chartsLoading &&
        (summary?.kpis?.every(k => !k.hasData) ?? true) &&
        (!charts?.productionTrend || charts.productionTrend.length === 0 || charts.productionTrend.every((d: any) => d.produced === 0)) &&
        (!charts?.costTrend || charts.costTrend.length === 0 || charts.costTrend.every((d: any) => d.total === 0));

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value as DateFilterType);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
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
    const lowStockThreshold: number = Number(settingsData?.lowStockThreshold) || 100;
    const yarnStockData = charts?.yarnStockByCount
        ? Object.entries(charts.yarnStockByCount)
            .filter(([, v]) => (v as number) > 0)
            .map(([count, bal]) => ({
                count: `Count ${count}`,
                bags: Math.floor((bal as number) / BAG_WEIGHT_KG),
                loose: parseFloat(((bal as number) % BAG_WEIGHT_KG).toFixed(1)),
                total: parseFloat((bal as number).toFixed(1)),
                low: (bal as number) < lowStockThreshold,
            }))
        : [];

    const prodTrend = charts?.productionTrend || [];
    const costTrend = charts?.costTrend || [];
    const costPie = (charts?.costByCategory || []).filter((c: any) => c.value > 0);
    const totalCost = costPie.reduce((s: number, c: any) => s + (c.value ?? 0), 0);

    // Efficiency metrics derived from the production trend
    const totalProduced = prodTrend.reduce((s: number, d: any) => s + (d.produced ?? 0), 0);
    const totalWaste    = prodTrend.reduce((s: number, d: any) => s + (d.waste ?? 0), 0);
    const totalConsumed = totalProduced + totalWaste;
    const efficiencyPct = totalConsumed > 0 ? ((totalProduced / totalConsumed) * 100).toFixed(1) : '—';
    const wastePct      = totalConsumed > 0 ? ((totalWaste / totalConsumed) * 100).toFixed(1) : '—';
    const costPerKg     = totalProduced > 0 ? (totalCost / totalProduced).toFixed(2) : '—';
    const activeDays    = prodTrend.filter((d: any) => d.produced > 0).length;
    const avgDailyKg    = activeDays > 0 ? (totalProduced / activeDays).toFixed(0) : '—';

    // Group activity by date
    const activityGroups = activity ? groupByDay(activity) : [];

    // ── Skeletons ────────────────────────────────────────────────────────────

    const KpiSkeleton = () => (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="80%" height={40} sx={{ my: 1 }} />
            <Skeleton variant="text" width="50%" height={16} />
        </Paper>
    );

    const QuickAction = ({ icon, label, onClick, color }: { icon: React.ReactNode; label: string; onClick: () => void; color: string }) => (
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
                    transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
            }}
        >
            {label}
        </Button>
    );

    // ─── Empty state ──────────────────────────────────────────────────────────

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
                            {[
                                { label: 'Add Operational Costs', desc: 'Log EB, employee and packing costs...', page: 'costing', color: 'warning', icon: <WalletIcon /> },
                                { label: 'Record Outward', desc: 'Log yarn shipments to customers...', page: 'outward', color: 'info', icon: <UploadIcon /> },
                                { label: 'Configure Rates', desc: 'Set EB and conversion rates...', page: 'settings', color: 'success', icon: <EnergyIcon /> },
                            ].map(item => (
                                <Paper key={item.page} sx={{ p: 2.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }} onClick={() => navigate(item.page)}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Avatar sx={{ bgcolor: `${item.color}.light`, color: `${item.color}.dark` }}>{item.icon}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700}>{item.label}</Typography>
                                            <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // ─── Main render ──────────────────────────────────────────────────────────

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.15fr 0.85fr' }, gap: 3, mb: 3 }}>
                <Paper className="clay-card anim-slide-up" sx={{ p: { xs: 3, md: 4 }, overflow: 'hidden' }}>
                    <Typography variant="overline" color="primary.main">Overview</Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>
                        Live operations with a calmer, more premium flow.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
                        Track inventory, production, costing, and sales from one smooth dashboard with motion that stays light on the CPU.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Button variant="contained" onClick={() => navigate('production')} startIcon={<FactoryIcon />}>Record Production</Button>
                        <Button variant="outlined" onClick={() => navigate('inward')} startIcon={<DownloadIcon />}>Add Inward</Button>
                        <Button variant="outlined" onClick={() => navigate('inventory')} startIcon={<InventoryIcon />}>View Stock</Button>
                    </Box>
                </Paper>
                <Suspense fallback={<Paper sx={{ minHeight: 260 }} />}>
                    <DashboardScene />
                </Suspense>
            </Box>

            {/* ── Sticky header ── */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    bgcolor: 'background.default',
                    pb: 2,
                    pt: 0.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    mb: 4,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>Dashboard</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {dateRange.from === dateRange.to
                                ? formatDate(dateRange.from)
                                : `${formatDate(dateRange.from)} – ${formatDate(dateRange.to)}`}
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
                                <GlassDatePicker label="From" size="small" value={customFrom}
                                    onChange={(e) => setCustomFrom(e.target.value)} />
                                <GlassDatePicker label="To" size="small" value={customTo}
                                    onChange={(e) => setCustomTo(e.target.value)} />
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ── KPI Cards ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
                {isLoading ? (
                    [0, 1, 2, 3].map(i => <KpiSkeleton key={i} />)
                ) : (
                    summary?.kpis?.map((kpi: KPI, index: number) => {
                        const sparkKey = ['produced', 'waste', 'total', 'eb'][index] ?? 'produced';
                        const isUp = kpi.trend === 'up';
                        const isDown = kpi.trend === 'down';
                        return (
                            <Paper
                                key={index}
                                className={`clay-card anim-slide-up stagger-${index + 1}`}
                                sx={{
                                    p: 3,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: (t) => t.palette.mode === 'dark'
                                            ? `0 12px 24px -1px rgba(0,0,0,0.4), 0 0 0 1px ${kpi.color}22`
                                            : `0 12px 24px -1px rgba(0,0,0,0.08), 0 0 0 1px ${kpi.color}22`,
                                    },
                                }}
                            >
                                {/* Gradient top bar */}
                                <Box sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                    background: `linear-gradient(90deg, ${kpi.color}, ${kpi.color}55)`,
                                }} />
                                {/* Radial glow */}
                                <Box sx={{
                                    position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                                    borderRadius: '50%', bgcolor: kpi.color, opacity: 0.07, filter: 'blur(20px)',
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

                                        {/* Trend indicator */}
                                        {kpi.comparison && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                                {isUp   && <ArrowUpward   sx={{ fontSize: 14, color: 'success.main' }} />}
                                                {isDown && <ArrowDownward sx={{ fontSize: 14, color: 'error.main' }} />}
                                                {!isUp && !isDown && <TrendingFlat sx={{ fontSize: 14, color: 'text.disabled' }} />}
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: isUp ? 'success.main' : isDown ? 'error.main' : 'text.disabled',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {kpi.comparison}
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Mini sparkline */}
                                        {prodTrend.length > 2 && (
                                            <Box sx={{ mt: 1, mx: -1 }}>
                                                <Sparkline data={prodTrend} color={kpi.color} dataKey={sparkKey} />
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.disabled">No data for this period</Typography>
                                    </Box>
                                )}
                            </Paper>
                        );
                    })
                )}
            </Box>

            {/* ── Efficiency Row ── */}
            {!chartsLoading && totalProduced > 0 && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                    <EfficiencyStat
                        label="Efficiency"
                        value={efficiencyPct === '—' ? '—' : efficiencyPct}
                        unit="%"
                        color="#059669"
                        tooltip="Production efficiency = produced ÷ consumed × 100"
                    />
                    <EfficiencyStat
                        label="Waste Rate"
                        value={wastePct === '—' ? '—' : wastePct}
                        unit="%"
                        color="#ef4444"
                        tooltip="Waste rate = waste ÷ consumed × 100"
                    />
                    <EfficiencyStat
                        label="Cost / kg"
                        value={costPerKg === '—' ? '—' : `₹${costPerKg}`}
                        unit="/ kg"
                        color="#6366f1"
                        tooltip="Total cost ÷ total kg produced in the selected period"
                    />
                    <EfficiencyStat
                        label="Avg Daily Output"
                        value={avgDailyKg}
                        unit="kg"
                        color="#0ea5e9"
                        tooltip={`Average production per active day (${activeDays} active day${activeDays !== 1 ? 's' : ''})`}
                    />
                </Box>
            )}

            {/* ── Charts Row 1: Production + Cost Breakdown ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' }, gap: 3, mb: 3 }}>
                {/* Production Trend Area Chart */}
                <Paper className="clay-card anim-slide-up stagger-2" sx={{ p: 3, position: 'relative' }}>
                    <Typography variant="h6" fontWeight="bold" mb={0.5}>Production Trend</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Daily output vs. waste (kg)
                    </Typography>
                    {chartsLoading ? (
                        <Skeleton variant="rectangular" height={240} sx={{ borderRadius: 2 }} />
                    ) : prodTrend.some((d: any) => d.produced > 0) ? (
                        <ResponsiveContainer width="100%" height={240}>
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
                                <ChartTooltip content={<CustomTooltip />} />
                                <Legend />
                                {settingsData?.dailyTarget && (
                                    <ReferenceLine
                                        y={settingsData.dailyTarget}
                                        stroke="#f59e0b"
                                        strokeDasharray="5 3"
                                        label={{ value: 'Target', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b' }}
                                    />
                                )}
                                <Area type="monotone" dataKey="produced" name="Produced" stroke="#059669" fill="url(#gradProd)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="waste" name="Waste" stroke="#ef4444" fill="url(#gradWaste)" strokeWidth={2} dot={false} />
                                {prodTrend.length > 10 && (
                                    <Brush dataKey="date" height={20} stroke="rgba(128,128,128,0.2)" tickFormatter={formatDate} travellerWidth={6} />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', borderRadius: 2, border: '1px dashed', borderColor: 'divider' }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <HistoryIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 1, opacity: 0.5 }} />
                                <Typography color="text.disabled" variant="body2" display="block">No production data for this period</Typography>
                                <Typography variant="caption" color="text.disabled">Entries from Production Module will appear here</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>

                {/* Cost by Category Donut Chart */}
                <Paper className="clay-card anim-slide-up stagger-3" sx={{ p: 3, position: 'relative' }}>
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
                                    <Pie
                                        data={costPie}
                                        cx="50%" cy="50%"
                                        innerRadius={52} outerRadius={80}
                                        dataKey="value" nameKey="name"
                                        paddingAngle={3}
                                    >
                                        {costPie.map((_: any, index: number) => (
                                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                        <DonutCentreLabel viewBox={{ cx: '50%', cy: '50%' }} total={totalCost} />
                                    </Pie>
                                    <ChartTooltip formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <Box sx={{ width: '100%', mt: 1 }}>
                                {costPie.map((c: any, i: number) => (
                                    <Box key={c.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <Typography variant="caption" color="text.secondary" noWrap>{c.name}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.disabled">
                                                {totalCost > 0 ? `${((c.value / totalCost) * 100).toFixed(0)}%` : ''}
                                            </Typography>
                                            <Typography variant="caption" fontWeight={700}>
                                                ₹{Number(c.value).toLocaleString('en-IN')}
                                            </Typography>
                                        </Box>
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

            {/* ── Charts Row 2: Cost Trend + Yarn Stock ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 4fr' }, gap: 3, mb: 3 }}>
                {/* Stacked Cost Trend Bar Chart */}
                <Paper className="clay-card anim-slide-up stagger-4" sx={{ p: 3, position: 'relative' }}>
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
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                <ChartTooltip content={<CostTooltip />} />
                                <Legend />
                                <Bar dataKey="eb"          name="Electricity"  fill="#059669" stackId="cost" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="employee"    name="Employee"     fill="#6366f1" stackId="cost" />
                                <Bar dataKey="packaging"   name="Packaging"    fill="#0ea5e9" stackId="cost" />
                                <Bar dataKey="maintenance" name="Maintenance"  fill="#f59e0b" stackId="cost" />
                                <Bar dataKey="expenses"    name="Expenses"     fill="#ef4444" stackId="cost" radius={[4, 4, 0, 0]} />
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

                {/* Yarn Stock by Count — bars turn red when below threshold */}
                <Paper className="clay-card anim-slide-up stagger-5" sx={{ p: 3, position: 'relative' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="h6" fontWeight="bold">Yarn Stock</Typography>
                        {yarnStockData.some(d => d.low) && (
                            <Chip label="Low Stock" size="small" color="error" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                        )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Current balance by count (red = below {lowStockThreshold} kg threshold)
                    </Typography>
                    {chartsLoading ? (
                        <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 2 }} />
                    ) : yarnStockData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={yarnStockData} layout="vertical" barSize={16}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}kg`} />
                                <YAxis type="category" dataKey="count" tick={{ fontSize: 11 }} width={65} />
                                <ChartTooltip formatter={(val: any, name: any) => [`${val} kg`, name]} />
                                <Bar dataKey="total" name="Stock (kg)" radius={[0, 4, 4, 0]}>
                                    {yarnStockData.map((entry, index) => (
                                        <Cell key={index} fill={entry.low ? '#ef4444' : '#059669'} />
                                    ))}
                                </Bar>
                                <ReferenceLine x={lowStockThreshold} stroke="#f59e0b" strokeDasharray="4 3" />
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

            {/* ── Recent Activity ── */}
            <Paper className="clay-card anim-slide-up stagger-1" sx={{ p: 3, position: 'relative', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon color="action" fontSize="small" />
                        <Typography variant="h6" fontWeight="bold">Recent Activity</Typography>
                        <Chip label="Live" size="small" color="success" variant="outlined" sx={{ ml: 1, fontSize: '0.65rem', height: 20 }} />
                    </Box>
                    <Button
                        size="small"
                        endIcon={<LogsIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate('logs')}
                        sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary' }}
                    >
                        View all logs
                    </Button>
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
                ) : activityGroups.length > 0 ? (
                    activityGroups.map((group, gi) => (
                        <Box key={gi} sx={{ mb: 1 }}>
                            {/* Date group label */}
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color: 'text.disabled',
                                    mb: 1,
                                    mt: gi > 0 ? 2 : 0,
                                }}
                            >
                                {group.label}
                            </Typography>
                            {group.items.map((item: any, index: number) => (
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
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                                                    <Avatar sx={{ width: 14, height: 14, fontSize: '0.5rem', bgcolor: 'primary.main' }}>
                                                        {item.by.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="caption" color="text.disabled">{item.by}</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                    {index < group.items.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </Box>
                    ))
                ) : (
                    <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 2 }}>
                        <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                        <Typography color="text.disabled" display="block">No activity yet</Typography>
                        <Typography variant="caption" color="text.disabled">Transactions across all modules will show up here live</Typography>
                    </Box>
                )}
            </Paper>

            {/* ── Quick Actions ── */}
            <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon color="primary" /> Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <QuickAction icon={<FactoryIcon sx={{ color: '#059669' }} />} label="Record Production" onClick={() => navigate('production')} color="#059669" />
                    <QuickAction icon={<DownloadIcon sx={{ color: '#0ea5e9' }} />} label="Add Inward"          onClick={() => navigate('inward')}     color="#0ea5e9" />
                    <QuickAction icon={<UploadIcon   sx={{ color: '#6366f1' }} />} label="Record Outward"      onClick={() => navigate('outward')}    color="#6366f1" />
                    <QuickAction icon={<WalletIcon   sx={{ color: '#f59e0b' }} />} label="Add Costing"         onClick={() => navigate('costing')}    color="#f59e0b" />
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
