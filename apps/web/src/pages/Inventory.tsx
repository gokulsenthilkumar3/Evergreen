import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
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
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend
} from 'recharts';
import api from '../utils/api';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`inventory-tabpanel-${index}`}
            aria-labelledby={`inventory-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

interface InventoryKPI {
    label: string;
    value: string;
    subValue?: string;
    color: string;
    trend?: string;
    hasData: boolean;
}

interface InventoryItem {
    id: string;
    date: string;
    type: 'INWARD' | 'OUTWARD' | 'PRODUCTION' | 'WASTE';
    item?: string;
    quantity: number;
    balance?: number;
    unit?: string;
    reference: string;
    details?: string;
}

const Inventory: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [dateFilter, setDateFilter] = useState<string>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value);
    };

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        console.log(`Exporting inventory as ${type}`);
        alert(`Exporting as ${type}... (Implementation Pending)`);
    };

    const getDateRange = () => {
        const today = new Date();
        let from = new Date();
        let to = new Date();

        switch (dateFilter) {
            case 'today':
                from = to = today;
                break;
            case 'yesterday':
                from = to = new Date(new Date().setDate(today.getDate() - 1));
                break;
            case 'week':
                from = new Date(new Date().setDate(today.getDate() - 7));
                to = new Date();
                break;
            case 'month':
                from = new Date(new Date().setMonth(today.getMonth() - 1));
                to = new Date();
                break;
            case '3months':
                from = new Date(new Date().setMonth(today.getMonth() - 3));
                to = new Date();
                break;
            case '6months':
                from = new Date(new Date().setMonth(today.getMonth() - 6));
                to = new Date();
                break;
            case 'year':
                from = new Date(new Date().setFullYear(today.getFullYear() - 1));
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

    const { data: dashboardData } = useQuery({
        queryKey: ['inventoryDashboard', dateRange.from, dateRange.to],
        queryFn: async () => {
            const response = await api.get('/inventory/history', {
                params: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            });
            return response.data;
        },
    });

    const fullHistory: InventoryItem[] = [
        ...(dashboardData?.history || []).map((h: any) => ({
            id: h.id || Math.random().toString(),
            date: new Date(h.date).toISOString().split('T')[0],
            type: h.type === 'INWARD' ? 'INWARD' : (h.type === 'OUTWARD' ? 'OUTWARD' : 'PRODUCTION'),
            item: h.material,
            quantity: h.quantity || 0,
            balance: h.balance || 0,
            reference: h.reference || 'N/A'
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const filteredFullHistory = fullHistory.filter(item => {
        if (historyTypeFilter === 'all') return true;
        if (historyTypeFilter === 'cotton') return item.item?.toLowerCase().includes('cotton');
        if (historyTypeFilter === 'yarn') return item.item?.toLowerCase().includes('yarn');
        return true;
    });

    const renderMovementTable = (data: InventoryItem[], title: string) => (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{title}</Typography>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Quantity (kg)</TableCell>
                            <TableCell align="right">Balance (kg)</TableCell>
                            <TableCell>Reference</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No data found</TableCell></TableRow>
                        ) : (
                            data.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={row.quantity >= 0 ? <ArrowUpward /> : <ArrowDownward />}
                                            label={row.type}
                                            color={row.quantity >= 0 ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right" sx={{ color: row.quantity >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                        {row.quantity >= 0 ? '+' : ''}{row.quantity}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.balance}</TableCell>
                                    <TableCell>{row.reference}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Box sx={{ maxWidth: '100%', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Inventory</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Date Filter</InputLabel>
                        <Select value={dateFilter} label="Date Filter" onChange={handleDateFilterChange}>
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="yesterday">Yesterday</MenuItem>
                            <MenuItem value="week">Past Week</MenuItem>
                            <MenuItem value="month">Past Month</MenuItem>
                            <MenuItem value="3months">Past 3 Months</MenuItem>
                            <MenuItem value="year">Past Year</MenuItem>
                            <MenuItem value="custom">Custom Range</MenuItem>
                        </Select>
                    </FormControl>
                    {dateFilter === 'custom' && (
                        <>
                            <TextField type="date" label="From" size="small" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
                            <TextField type="date" label="To" size="small" value={customTo} onChange={(e) => setCustomTo(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </>
                    )}
                </Box>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Dashboard" />
                    <Tab label="Cotton Inventory" />
                    <Tab label="Yarn Inventory" />
                    <Tab label="All History" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
                        {dashboardData?.kpis?.map((kpi: InventoryKPI, index: number) => (
                            <Box key={index} sx={{ flex: '1 1 calc(25% - 18px)', minWidth: 250 }}>
                                <Paper sx={{ p: 3, borderRadius: 2, borderLeft: `6px solid ${kpi.color}` }}>
                                    <Typography variant="subtitle2" color="text.secondary">{kpi.label}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{kpi.value || '0'}</Typography>
                                        {kpi.subValue && <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>{kpi.subValue}</Typography>}
                                    </Box>
                                </Paper>
                            </Box>
                        )) || (
                                <Box sx={{ p: 3 }}><Typography>No dashboard stats available.</Typography></Box>
                            )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ flex: '1 1 100%', minWidth: 500 }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Yarn Inventory by Count</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dashboardData?.yarnStockByCount || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="bags" fill="#2e7d32" name="Bags in Stock" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>
                        <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 400 }}>
                            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Inward vs Outward Trends</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dashboardData?.inwardHistory || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="kg" stroke="#ed6c02" name="Inward (kg)" />
                                        <Line type="monotone" dataKey="outward" stroke="#2e7d32" name="Outward (kg)" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Box>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>{renderMovementTable(fullHistory.filter(i => i.item === 'Cotton'), 'Cotton Stock Movement')}</TabPanel>
                <TabPanel value={tabValue} index={2}>{renderMovementTable(fullHistory.filter(i => i.item === 'Yarn'), 'Yarn Stock Movement')}</TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <FormControl sx={{ minWidth: 200 }} size="small">
                            <InputLabel>Type Filter</InputLabel>
                            <Select value={historyTypeFilter} label="Type Filter" onChange={(e) => setHistoryTypeFilter(e.target.value)}>
                                <MenuItem value="all">All Movements</MenuItem>
                                <MenuItem value="cotton">Cotton Only</MenuItem>
                                <MenuItem value="yarn">Yarn Only</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button startIcon={<EmailIcon />} variant="outlined" onClick={() => handleExport('email')}>Email</Button>
                            <Button startIcon={<ExcelIcon />} variant="outlined" onClick={() => handleExport('excel')}>Excel</Button>
                            <Button startIcon={<PdfIcon />} variant="outlined" onClick={() => handleExport('pdf')}>PDF</Button>
                        </Box>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Material</TableCell>
                                    <TableCell align="right">Quantity (kg)</TableCell>
                                    <TableCell>Reference</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFullHistory.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell><Chip label={row.type} size="small" color={row.type === 'INWARD' ? 'success' : 'info'} /></TableCell>
                                        <TableCell><Chip label={row.item || 'N/A'} size="small" variant="outlined" /></TableCell>
                                        <TableCell align="right" sx={{ color: row.quantity >= 0 ? 'success.main' : 'error.main' }}>
                                            {row.quantity >= 0 ? '+' : ''}{row.quantity}
                                        </TableCell>
                                        <TableCell>{row.reference}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default Inventory;
