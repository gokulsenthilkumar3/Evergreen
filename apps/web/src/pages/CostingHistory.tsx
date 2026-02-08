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
    Tabs,
    Tab,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    type SelectChangeEvent,
} from '@mui/material';
import {
    ArrowUpward,
    ArrowDownward,
    Email as EmailIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
// import api from '../utils/api';

interface CostingKPI {
    label: string;
    value: string;
    subValue?: string;
    color: string;
    trend?: string;
    hasData: boolean;
}

interface CostingHistoryEntry {
    id: string;
    date: string;
    category: 'ELECTRICITY' | 'EMPLOYEE' | 'PACKAGING' | 'MAINTENANCE' | 'EXPENSE';
    description: string;
    amount: number;
    details: string;
}

const CostingHistory: React.FC = () => {
    const [dateFilter, setDateFilter] = useState<string>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [viewTab, setViewTab] = useState(0); // 0: Dashboard, 1: History

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

    const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
        queryKey: ['costingDashboard', dateRange.from, dateRange.to],
        queryFn: async () => {
            // Mock data
            return {
                kpis: [
                    { label: 'Electricity (EB)', value: '₹0', color: '#f59e0b', hasData: false, trend: '0%' },
                    { label: 'Employee Costs', value: '₹0', color: '#3b82f6', hasData: false },
                    { label: 'Packaging', value: '₹0', color: '#10b981', hasData: false },
                    { label: 'Maintenance', value: '₹0', color: '#ef4444', hasData: false },
                ],
                breakdown: [],
                dailyTrend: [],
                maintenanceTrend: [],
                packagingTrend: [],
                expensesTrend: []
            };
        },
    });

    const { data: historyList, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['costingHistoryList', dateRange.from, dateRange.to],
        queryFn: async () => {
            // Mock data
            return [] as CostingHistoryEntry[];
        },
    });

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value);
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        console.log(`Exporting costing history as ${type}`);
        alert(`Exporting as ${type}... (Implementation Pending)`);
    };

    if (isLoadingDashboard || isLoadingHistory) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <Typography>Loading costing data...</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    Costing History
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

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={viewTab} onChange={(_, newValue) => setViewTab(newValue)}>
                    <Tab label="Dashboard" />
                    <Tab label="History" />
                </Tabs>
            </Box>

            {viewTab === 0 && (
                <Box>
                    {/* KPI Cards */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                        {dashboardData?.kpis?.map((kpi: CostingKPI, index: number) => (
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
                                            {kpi.trend && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: kpi.trend.startsWith('+') ? 'success.main' : 'error.main' }}>
                                                    {kpi.trend.startsWith('+') ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                                    <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'medium' }}>{kpi.trend}</Typography>
                                                </Box>
                                            )}
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

                    {/* Charts Grid */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {/* Cost Breakdown Pie Chart */}
                        <Box sx={{ flex: '1 1 400px' }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Cost Distribution</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={dashboardData?.breakdown}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={(entry) => entry.name}
                                        >
                                            {dashboardData?.breakdown?.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>

                        {/* Daily Trend Area Chart */}
                        <Box sx={{ flex: '1 1 400px' }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Daily Cost Trend</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData?.dailyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="cost" stroke="#3b82f6" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>

                        {/* Packaging Trend */}
                        <Box sx={{ flex: '1 1 400px' }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Packaging Costs</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData?.packagingTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
                                        <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>

                        {/* Maintenance Trend */}
                        <Box sx={{ flex: '1 1 400px' }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Maintenance Costs</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData?.maintenanceTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
                                        <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>

                        {/* Other Expenses Trend - Added as requested */}
                        <Box sx={{ flex: '1 1 400px' }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Other Expenses</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData?.expensesTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#b2bac2' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
                                        <Bar dataKey="cost" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>
                    </Box>
                </Box>
            )}

            {viewTab === 1 && (
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
                        <Button startIcon={<EmailIcon />} variant="outlined" onClick={() => handleExport('email')}>Email</Button>
                        <Button startIcon={<ExcelIcon />} variant="outlined" onClick={() => handleExport('excel')}>Excel</Button>
                        <Button startIcon={<PdfIcon />} variant="outlined" onClick={() => handleExport('pdf')}>PDF</Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount (₹)</TableCell>
                                    <TableCell>Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyList?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No costing data found for this period</TableCell>
                                    </TableRow>
                                ) : (
                                    historyList?.map((row: CostingHistoryEntry) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.category}
                                                    size="small"
                                                    color={
                                                        row.category === 'ELECTRICITY' ? 'warning' :
                                                            row.category === 'EMPLOYEE' ? 'primary' :
                                                                row.category === 'PACKAGING' ? 'success' :
                                                                    row.category === 'MAINTENANCE' ? 'error' : 'default'
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>{row.description}</TableCell>
                                            <TableCell align="right">₹{row.amount.toLocaleString()}</TableCell>
                                            <TableCell>{row.details}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
        </Box>
    );
};

export default CostingHistory;
