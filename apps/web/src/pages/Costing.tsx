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
    DialogActions,
    LinearProgress,
    Tooltip as MuiTooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import CostingEntry from './CostingEntry';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, formatApiError } from '../utils/messages';
import { getDateRange as getStandardDateRange, DATE_FILTER_OPTIONS, type DateFilterType } from '../utils/dateFilters';

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

const Costing: React.FC<{ userRole?: string; username?: string }> = ({ userRole = 'admin', username }) => {
    const [tabValue, setTabValue] = useState(0); // 0 = Dashboard
    const [openWizard, setOpenWizard] = useState(false);
    const queryClient = useQueryClient();
    const { confirm: confirmDialog } = useConfirm();

    // Dashboard Filter State
    const [dateFilter, setDateFilter] = useState<DateFilterType>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');

    const dateRange = React.useMemo(() => getStandardDateRange(dateFilter, customFrom, customTo), [dateFilter, customFrom, customTo]);

    const { data: costingData = [], isLoading } = useQuery({
        queryKey: ['costingEntries', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get('/costing/entries', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            });
            return response.data;
        },
    });

    const categories = ['EB (Electricity)', 'Employee', 'Packaging', 'Maintenance', 'Expenses'];

    const getFilteredEntries = (category: string) => {
        return costingData.filter((entry: any) => entry.category === category);
    };

    const kpis: CostingKPI[] = React.useMemo(() => {
        if (!costingData.length) return [
            { label: 'Total Cost', value: '₹0', color: 'primary.main', hasData: false },
            { label: 'Avg Cost/Kg', value: '₹0', color: 'secondary.main', hasData: false },
            { label: 'Electricity Cost', value: '₹0', color: 'warning.main', hasData: false },
            { label: 'Labor Cost', value: '₹0', color: 'success.main', hasData: false },
        ];

        const totalCost = costingData.reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);
        // Assuming we can derive production from somewhere, or just show total costs for now
        const ebCost = costingData.filter((i: any) => i.category === 'EB (Electricity)').reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);
        const laborCost = costingData.filter((i: any) => i.category === 'Employee').reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);

        return [
            { label: 'Total Cost', value: `₹${totalCost.toLocaleString()}`, color: 'primary.main', hasData: true },
            { label: 'Avg Cost/Kg', value: '-', color: 'secondary.main', hasData: true }, // Placeholder
            { label: 'Electricity Cost', value: `₹${ebCost.toLocaleString()}`, color: 'warning.main', hasData: true },
            { label: 'Labor Cost', value: `₹${laborCost.toLocaleString()}`, color: 'success.main', hasData: true },
        ];
    }, [costingData]);

    const chartData = React.useMemo(() => {
        if (!costingData.length) return [];
        const grouped: Record<string, any> = {};
        costingData.forEach((item: any) => {
            const d = new Date(item.date).toLocaleDateString();
            if (!grouped[d]) grouped[d] = { date: d, cost: 0 };
            grouped[d].cost += (parseFloat(item.totalCost || item.amount) || 0);
        });
        return Object.values(grouped).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [costingData]);

    const dashboardData = React.useMemo(() => {
        const eb = costingData.filter((i: any) => i.category === 'EB (Electricity)').reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);
        const labor = costingData.filter((i: any) => i.category === 'Employee').reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);
        const pkg = costingData.filter((i: any) => i.category === 'Packaging').reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);
        const maint = costingData.filter((i: any) => i.category === 'Maintenance').reduce((sum: number, item: any) => sum + (parseFloat(item.totalCost || item.amount) || 0), 0);

        const breakdown = [
            { name: 'Electricity', value: eb, color: '#FF9800' }, // Orange
            { name: 'Labor', value: labor, color: '#4CAF50' }, // Green
            { name: 'Packaging', value: pkg, color: '#03A9F4' }, // Light Blue
            { name: 'Maintenance', value: maint, color: '#F44336' }, // Red
        ].filter(i => i.value > 0);

        const packagingTrend = costingData.filter((i: any) => i.category === 'Packaging').map((item: any) => ({
            date: new Date(item.date).toLocaleDateString(),
            cost: parseFloat(item.totalCost || item.amount) || 0
        })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const maintenanceTrend = costingData.filter((i: any) => i.category === 'Maintenance').map((item: any) => ({
            date: new Date(item.date).toLocaleDateString(),
            cost: parseFloat(item.totalCost || item.amount) || 0
        })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const expensesTrend = costingData.filter((i: any) => i.category === 'Expenses').map((item: any) => ({
            date: new Date(item.date).toLocaleDateString(),
            cost: parseFloat(item.totalCost || item.amount) || 0
        })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            kpis,
            breakdown,
            dailyTrend: chartData,
            packagingTrend,
            maintenanceTrend,
            expensesTrend
        };
    }, [kpis, costingData, chartData]);

    const handleSuccess = () => {
        setOpenWizard(false);
        queryClient.invalidateQueries({ queryKey: ['costingEntries'] });
    };

    const handleItemSaved = () => {
        queryClient.invalidateQueries({ queryKey: ['costingEntries'] });
    };

    const handleDeleteEntry = async (id: string) => {
        if (!await confirmDialog({ title: 'Delete Entry', message: 'Are you sure you want to delete this entry?', severity: 'error', confirmText: 'Delete', cancelText: 'Cancel' })) return;

        try {
            await api.delete(`/costing/${id}`);
            queryClient.invalidateQueries({ queryKey: ['costingEntries'] });
            toast.success(SUCCESS_MESSAGES.DELETE);
        } catch (error) {
            toast.error(ERROR_MESSAGES.DELETE_FAILED);
        }
    };

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Costing Module
                    {isLoading && <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Date Filter</InputLabel>
                            <Select
                                value={dateFilter}
                                label="Date Filter"
                                onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                            >
                                {DATE_FILTER_OPTIONS.map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
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
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setOpenWizard(true);
                        }}
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
                                            <RechartsTooltip />
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
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
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
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
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
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
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
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#132f4c', border: 'none', borderRadius: 8 }} itemStyle={{ color: '#f3f6f9' }} />
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
                                                    <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Date</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Units Usage (kWh)</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Cost/Unit (₹)</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Shifts</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Amount (₹)</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Actions</TableCell>
                                                </>
                                            ) : (
                                                // Other categories
                                                <>
                                                    <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Details</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Amount (₹)</TableCell>
                                                    {index === 4 && <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Type</TableCell>}
                                                    <TableCell align="center" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: 0.5 }}>Actions</TableCell>
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
                                                        <TableCell>
                                                            <MuiTooltip title={entry.entryTimestamp ? new Date(entry.entryTimestamp).toLocaleString() : (entry.createdAt ? new Date(entry.createdAt).toLocaleString() : new Date(entry.date).toLocaleString())} arrow placement="top">
                                                                <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                                    {new Date(entry.date || entry.createdAt).toLocaleDateString()}
                                                                </Box>
                                                            </MuiTooltip>
                                                        </TableCell>
                                                        <TableCell align="right">{entry.unitsConsumed || '-'}</TableCell>
                                                        <TableCell align="right">₹{entry.ratePerUnit || '-'}</TableCell>
                                                        <TableCell align="center">{entry.noOfShifts || '-'}</TableCell>
                                                        <TableCell align="right">₹{entry.totalCost?.toLocaleString()}</TableCell>
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
                                                ) : (
                                                    // Other categories data
                                                    <>
                                                        <TableCell>
                                                            <MuiTooltip title={entry.entryTimestamp ? new Date(entry.entryTimestamp).toLocaleString() : (entry.createdAt ? new Date(entry.createdAt).toLocaleString() : new Date(entry.date).toLocaleString())} arrow placement="top">
                                                                <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                                    {new Date(entry.date || entry.createdAt).toLocaleDateString()}
                                                                </Box>
                                                            </MuiTooltip>
                                                        </TableCell>
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
                                                <TableCell colSpan={index === 0 ? 6 : (index === 4 ? 5 : 4)} align="center" sx={{ py: 8 }}>
                                                    <Typography color="text.secondary" variant="body1">No {category} entries found</Typography>
                                                    <Typography color="text.secondary" variant="caption">Start by adding a new costing record using the button above</Typography>
                                                </TableCell>
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
                        username={username}
                        onSuccess={handleSuccess}
                        onItemSaved={handleItemSaved}
                        initialTab={tabValue > 0 ? tabValue - 1 : 0}
                    />
                </DialogContent>
            </Dialog>

        </Box>
    );
};

export default Costing;
