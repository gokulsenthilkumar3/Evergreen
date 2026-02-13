import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Chip,
    Snackbar,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import CostingEntry from './CostingEntry';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

interface CostingKPI {
    label: string;
    value: string;
    subValue?: string;
    color: string;
    trend?: string;
    hasData: boolean;
}

const Costing: React.FC<{ userRole?: string }> = ({ userRole = 'admin' }) => {
    const [tabValue, setTabValue] = useState(0); // 0 = Dashboard
    const [openWizard, setOpenWizard] = useState(false);
    const queryClient = useQueryClient();

    // Dashboard Filter State
    const [dateFilter, setDateFilter] = useState<string>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info',
    });

    // Fetch Entries List
    const { data: entries } = useQuery({
        queryKey: ['costingEntries'],
        queryFn: async () => {
            const response = await api.get('/costing/entries');
            return response.data;
        },
    });

    // Dashboard Date Range Calculation
    const getDateRange = () => {
        const today = new Date();
        let from = new Date();
        let to = new Date();

        switch (dateFilter) {
            case 'today': from = to = today; break;
            case 'yesterday': from = to = new Date(today.setDate(today.getDate() - 1)); break;
            case 'week': from = new Date(today.setDate(today.getDate() - 7)); to = new Date(); break;
            case 'month': from = new Date(today.setMonth(today.getMonth() - 1)); to = new Date(); break;
            case '3months': from = new Date(today.setMonth(today.getMonth() - 3)); to = new Date(); break;
            case '6months': from = new Date(today.setMonth(today.getMonth() - 6)); to = new Date(); break;
            case 'year': from = new Date(today.setFullYear(today.getFullYear() - 1)); to = new Date(); break;
            case 'custom':
                if (customFrom && customTo) {
                    from = new Date(customFrom);
                    to = new Date(customTo);
                }
                break;
        }
        return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
    };

    const dateRange = getDateRange();

    // Fetch Summary for Production Data (to calculate Avg Cost/Kg)
    const { data: summaryData } = useQuery({
        queryKey: ['dashboardSummary', dateRange],
        queryFn: async () => {
            const response = await api.get(`/dashboard/summary?from=${dateRange.from}&to=${dateRange.to}`);
            return response.data;
        },
        enabled: tabValue === 0 // Only fetch on Dashboard tab
    });

    // Fetch Dashboard Data
    // Compute Dashboard Data from Entries
    const dashboardData = React.useMemo(() => {
        if (!entries || entries.length === 0) return null;

        const fromDate = new Date(dateRange.from);
        const toDate = new Date(dateRange.to);

        // Filter by Date Range
        const filtered = entries.filter((e: any) => {
            const d = new Date(e.date);
            return d >= fromDate && d <= toDate;
        });

        // Calculate Category Totals
        const totals = {
            eb: 0,
            employee: 0,
            packaging: 0,
            maintenance: 0,
            expense: 0
        };

        const dailyMap = new Map<string, any>();

        filtered.forEach((e: any) => {
            const cost = parseFloat(e.totalCost) || 0;
            const dateStr = e.date.split('T')[0];

            // Category Totals
            if (e.category === 'EB (Electricity)') totals.eb += cost;
            else if (e.category === 'Employee') totals.employee += cost;
            else if (e.category === 'Packaging') totals.packaging += cost;
            else if (e.category === 'Maintenance') totals.maintenance += cost;
            else totals.expense += cost;

            // Daily Trend Aggregation
            if (!dailyMap.has(dateStr)) {
                dailyMap.set(dateStr, { date: dateStr, cost: 0, packaging: 0, maintenance: 0, expense: 0 });
            }
            const day = dailyMap.get(dateStr);
            day.cost += cost;
            if (e.category === 'Packaging') day.packaging += cost;
            if (e.category === 'Maintenance') day.maintenance += cost;
            if (e.category !== 'EB (Electricity)' && e.category !== 'Employee' && e.category !== 'Packaging' && e.category !== 'Maintenance') day.expense += cost;
        });

        const sortedDaily = Array.from(dailyMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const grandTotal = totals.eb + totals.employee + totals.packaging + totals.maintenance + totals.expense;
        const production = summaryData?.meta?.periodProduction || 0;
        const avgCostPerKg = production > 0 ? grandTotal / production : 0;

        return {
            kpis: [
                { label: 'Total Cost', value: `₹${grandTotal.toLocaleString()}`, color: '#000000', hasData: grandTotal > 0 },
                { label: 'Avg Cost/Kg', value: `₹${avgCostPerKg.toFixed(2)}`, color: '#7c3aed', hasData: avgCostPerKg > 0, subValue: production > 0 ? `${production.toLocaleString()} kg` : '' },
                { label: 'Electricity (EB)', value: `₹${totals.eb.toLocaleString()}`, color: '#f59e0b', hasData: totals.eb > 0 },
                { label: 'Employee Costs', value: `₹${totals.employee.toLocaleString()}`, color: '#3b82f6', hasData: totals.employee > 0 },
                { label: 'Packaging', value: `₹${totals.packaging.toLocaleString()}`, color: '#10b981', hasData: totals.packaging > 0 },
                { label: 'Maintenance', value: `₹${totals.maintenance.toLocaleString()}`, color: '#ef4444', hasData: totals.maintenance > 0 },
            ],
            breakdown: [
                { name: 'EB', value: totals.eb, color: '#f59e0b' },
                { name: 'Employee', value: totals.employee, color: '#3b82f6' },
                { name: 'Packaging', value: totals.packaging, color: '#10b981' },
                { name: 'Maintenance', value: totals.maintenance, color: '#ef4444' },
                { name: 'Expenses', value: totals.expense, color: '#8b5cf6' },
            ].filter(i => i.value > 0),
            dailyTrend: sortedDaily,
            packagingTrend: sortedDaily.map(d => ({ date: d.date, cost: d.packaging })),
            maintenanceTrend: sortedDaily.map(d => ({ date: d.date, cost: d.maintenance })),
            expensesTrend: sortedDaily.map(d => ({ date: d.date, cost: d.expense })),
        };
    }, [entries, dateRange, summaryData]);

    const categories = ['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance', 'Expense'];

    const getFilteredEntries = (category: string) => {
        if (!entries) return [];
        return entries
            .filter((e: any) => e.category === category || (category === 'Expense' && !['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance'].includes(e.category)))
            .slice().reverse();
    };

    const handleSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['costingEntries'] });
        setOpenWizard(false);
        setNotification({ open: true, message: 'Entry saved successfully', severity: 'success' });
    };

    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this costing entry?')) return;

        try {
            await api.delete(`/costing/${id}`);
            queryClient.invalidateQueries({ queryKey: ['costingEntries'] });
            setNotification({ open: true, message: 'Entry deleted successfully', severity: 'success' });
        } catch (error) {
            setNotification({ open: true, message: 'Failed to delete cost entry', severity: 'error' });
        }
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Costing Module
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Date Filter</InputLabel>
                            <Select
                                value={dateFilter}
                                label="Date Filter"
                                onChange={(e) => setDateFilter(e.target.value)}
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

                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenWizard(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Cost
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                    <Tab label="Dashboard" />
                    <Tab label="EB (Electricity)" />
                    <Tab label="Employee" />
                    <Tab label="Packaging" />
                    <Tab label="Maintenance" />
                    <Tab label="Expenses" />
                </Tabs>

                {/* Tab 0: Dashboard */}
                <TabPanel value={tabValue} index={0}>
                    <Box>
                        {/* KPI Cards */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                            {dashboardData?.kpis?.map((kpi: CostingKPI, index: number) => (
                                <Box key={index} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
                                    <Paper sx={{ p: 3, borderRadius: 2, borderLeft: `6px solid ${kpi.color}`, height: '100%' }}>
                                        <Typography variant="subtitle2" color="text.secondary">{kpi.label}</Typography>
                                        {kpi.hasData ? (
                                            <>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{kpi.value}</Typography>
                                                    {kpi.subValue && <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>{kpi.subValue}</Typography>}
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
                            {/* Cost Breakdown */}
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

                            {/* Daily Trend */}
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

                            {/* Other Expenses Trend */}
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
                </TabPanel>

                {/* Tabs 1-5: Costing Lists */}
                {categories.map((category, index) => {
                    const currentEntries = getFilteredEntries(category);
                    return (
                        <TabPanel key={index} value={tabValue} index={index + 1}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {index === 0 ? (
                                                // EB (Electricity) columns
                                                <>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell align="right">Units Usage (kWh)</TableCell>
                                                    <TableCell align="right">Cost of 1 Unit (₹)</TableCell>
                                                    <TableCell align="center">Shifts</TableCell>
                                                    <TableCell align="right">Amount (₹)</TableCell>
                                                </>
                                            ) : (
                                                // Other categories
                                                <>
                                                    <TableCell>Date</TableCell>
                                                    <TableCell>Details</TableCell>
                                                    <TableCell align="right">Amount (₹)</TableCell>
                                                    {index === 4 && <TableCell>Type</TableCell>}
                                                    <TableCell align="center">Actions</TableCell>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {currentEntries.map((entry: any) => (
                                            <TableRow key={entry.id}>
                                                {index === 0 ? (
                                                    // EB (Electricity) data
                                                    <>
                                                        <TableCell>{new Date(entry.date || entry.createdAt).toLocaleDateString()}</TableCell>
                                                        <TableCell align="right">{entry.unitsConsumed || '-'}</TableCell>
                                                        <TableCell align="right">₹{entry.ratePerUnit || '-'}</TableCell>
                                                        <TableCell align="center">{entry.noOfShifts || '-'}</TableCell>
                                                        <TableCell align="right">₹{entry.totalCost?.toLocaleString()}</TableCell>
                                                    </>
                                                ) : (
                                                    // Other categories data
                                                    <>
                                                        <TableCell>{new Date(entry.date || entry.createdAt).toLocaleDateString()}</TableCell>
                                                        <TableCell>{entry.details}</TableCell>
                                                        <TableCell align="right">₹{entry.totalCost?.toLocaleString()}</TableCell>
                                                        {index === 4 && (
                                                            <TableCell>
                                                                <Chip label={entry.type || 'Expense'} size="small" />
                                                            </TableCell>
                                                        )}
                                                        <TableCell align="center">
                                                            {(userRole === 'ADMIN' || userRole === 'AUTHOR') && (
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            )}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </TableRow>
                                        ))}
                                        {(!currentEntries || currentEntries.length === 0) && (
                                            <TableRow>
                                                <TableCell colSpan={index === 0 ? 5 : (index === 4 ? 4 : 3)} align="center">No entries found</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                    );
                })}
            </Paper>

            <Dialog
                open={openWizard}
                onClose={() => setOpenWizard(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">Add Costing Entry</Typography>
                    <IconButton onClick={() => setOpenWizard(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <CostingEntry
                        userRole={userRole}
                        onSuccess={handleSuccess}
                        initialTab={tabValue > 0 ? tabValue - 1 : 0}
                    />
                </DialogContent>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotification({ ...notification, open: false })}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box >
    );
};

export default Costing;
