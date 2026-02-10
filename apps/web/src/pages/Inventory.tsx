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
    Snackbar,
    Alert,
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
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
    bale?: number;
    unit?: string;
    reference: string;
    details?: string;
}

interface InventoryProps {
    userRole?: string;
}

const Inventory: React.FC<InventoryProps> = () => {
    const [tabValue, setTabValue] = useState(0);
    const [dateFilter, setDateFilter] = useState<string>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');

    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info',
    });

    const handleDateFilterChange = (event: SelectChangeEvent) => {
        setDateFilter(event.target.value);
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
            originalDate: new Date(h.date), // Keep original date object for sorting
            type: h.type === 'INWARD' ? 'INWARD' : (h.type === 'OUTWARD' ? 'OUTWARD' : 'PRODUCTION'),
            item: h.material,
            quantity: h.quantity || 0,
            balance: h.balance || 0,
            bale: h.bale || 0,
            reference: h.reference || 'N/A'
        }))
    ].sort((a: any, b: any) => {
        const dateDiff = b.originalDate.getTime() - a.originalDate.getTime();
        if (dateDiff !== 0) return dateDiff;
        // If dates are equal, sort by ID descending (assuming larger ID is newer)
        return parseInt(b.id) - parseInt(a.id);
    });

    const filteredFullHistory = fullHistory.filter(item => {
        if (historyTypeFilter === 'all') return true;
        if (historyTypeFilter === 'cotton') return item.item?.toLowerCase().includes('cotton');
        if (historyTypeFilter === 'yarn') return item.item?.toLowerCase().includes('yarn');
        return true;
    });

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        const dataToExport = filteredFullHistory.map(row => ({
            Date: row.date,
            Type: row.type,
            Item: row.item,
            'Quantity (kg)': row.quantity,
            'Balance (kg)': row.balance,
            Reference: row.reference
        }));

        if (type === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
            XLSX.writeFile(workbook, "Inventory_Report.xlsx");
            setNotification({ open: true, message: 'Exported as Excel', severity: 'success' });
        } else if (type === 'pdf') {
            const doc = new jsPDF();
            doc.text("Inventory Report", 14, 15);
            (doc as any).autoTable({
                head: [['Date', 'Type', 'Item', 'Quantity (kg)', 'Balance (kg)', 'Reference']],
                body: dataToExport.map(row => Object.values(row)),
                startY: 20
            });
            doc.save("Inventory_Report.pdf");
            setNotification({ open: true, message: 'Exported as PDF', severity: 'success' });
        } else if (type === 'email') {
            const subject = encodeURIComponent("Inventory Report");
            const body = encodeURIComponent("Please attach the exported report manually.");
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
            setNotification({ open: true, message: 'Opening email client...', severity: 'info' });
        }
    };


    const renderMovementTable = (data: InventoryItem[], title: string) => {
        const isCotton = title.includes('Cotton');
        const isYarn = title.includes('Yarn');

        // Calculate current balance
        const latestEntry = data.length > 0 ? data[0] : null;
        let currentBalance = latestEntry?.balance || 0;

        // For yarn, calculate balance by count
        const yarnByCount: Record<string, { bags: number; kg: number; remainder: number }> = {};
        let totalBagsFromCounts = 0;
        let totalRemainderFromCounts = 0;
        let totalKgFromAllCounts = 0;

        if (isYarn) {
            // Group yarn data by count
            ['2', '4', '6', '8', '10'].forEach(count => {
                const countData = data.filter(d => d.reference?.includes(`Count ${count}`) || d.details?.includes(count));
                const latestCountEntry = countData.length > 0 ? countData[0] : null;
                const totalKg = latestCountEntry?.balance || 0;
                const bags = Math.floor(totalKg / 60);
                const remainder = totalKg % 60;
                yarnByCount[count] = { bags, kg: totalKg, remainder };

                // Sum up bags, remainders, and total kg from all counts
                totalBagsFromCounts += bags;
                totalRemainderFromCounts += remainder;
                totalKgFromAllCounts += totalKg;
            });

            // For yarn, use the sum of all count balances
            currentBalance = totalKgFromAllCounts;
        }

        // Calculate additional bags from combined remainders
        const additionalBagsFromRemainder = Math.floor(totalRemainderFromCounts / 60);
        const finalRemainder = totalRemainderFromCounts % 60;

        // Calculate bales/bags
        // For Cotton: Sum the actual bale movements from the current filtered data
        const currentBaleBalance = isCotton ? data.reduce((sum, item) => {
            // For inward, add bales. For production/outward (negative quantity), subtract bales.
            // item.bale is usually positive number representing the batch size or movement size.
            // But if we just sum them with the sign of quantity, we get the net movement.
            // Item type check is safer.
            const isPositive = item.type === 'INWARD';
            const baleAmount = item.bale || 0;
            return sum + (isPositive ? baleAmount : -baleAmount);
        }, 0) : 0;

        const totalBales = isCotton ? currentBaleBalance : 0;
        const totalBags = isYarn ? (totalBagsFromCounts + additionalBagsFromRemainder) : 0;
        const remainderKg = isYarn ? finalRemainder : 0;

        return (
            <Box sx={{ maxWidth: '100%', width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{title}</Typography>

                {/* Balance Summary Section */}
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'primary.dark' }}>
                    {isCotton && (
                        <>
                            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Balance Cotton Bales</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.light' }}>
                                        {totalBales.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Total Balance (kg)</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.light' }}>
                                        {currentBalance.toLocaleString()} kg
                                    </Typography>
                                </Box>
                            </Box>
                        </>
                    )}
                    {isYarn && (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Balance Yarn Bags</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.light', mb: 2 }}>
                                    {totalBags.toLocaleString()} bags
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                                {Object.entries(yarnByCount).map(([count, data]) => (
                                    <Box key={count} sx={{ minWidth: 120 }}>
                                        <Typography variant="caption" color="text.secondary">Count {count}</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'info.light' }}>
                                            {data.bags} bags
                                        </Typography>
                                        {data.remainder > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                +{data.remainder.toFixed(2)} kg
                                            </Typography>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary">Total Balance (kg)</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.light' }}>
                                    {currentBalance.toLocaleString()} kg
                                    {remainderKg > 0 && (
                                        <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                            (Incomplete bag: {remainderKg.toFixed(2)} kg)
                                        </Typography>
                                    )}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Paper>

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                {isCotton && <TableCell align="right">Bale</TableCell>}
                                {isYarn && <TableCell align="right">Bags</TableCell>}
                                <TableCell align="right">Quantity (kg)</TableCell>
                                <TableCell align="right">Balance (kg)</TableCell>
                                <TableCell>Reference</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow><TableCell colSpan={isCotton || isYarn ? 7 : 6} align="center">No data found</TableCell></TableRow>
                            ) : (
                                data.map((row) => {
                                    // Use actual bale data from backend for cotton
                                    const baleCount = isCotton ? (row.bale || 0) : 0;
                                    const bagCount = isYarn ? Math.floor(Math.abs(row.quantity) / 60) : 0;

                                    return (
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
                                            {isCotton && (
                                                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                                                    {row.quantity >= 0 ? '+' : '-'}{baleCount}
                                                </TableCell>
                                            )}
                                            {isYarn && (
                                                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                                                    {row.quantity >= 0 ? '+' : '-'}{bagCount}
                                                </TableCell>
                                            )}
                                            <TableCell align="right" sx={{ color: row.quantity >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                                {row.quantity >= 0 ? '+' : ''}{row.quantity}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.balance}</TableCell>
                                            <TableCell>{row.reference}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    };

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
                    <Tab label="Waste Logs" />
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
                    <Box sx={{ maxWidth: '100%', width: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Waste Logs</Typography>

                        {/* Waste Balance Summary */}
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'error.dark' }}>
                            <Box>
                                <Typography variant="subtitle2" color="rgba(255,255,255,0.7)">Total Waste Balance (kg)</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                    {(dashboardData?.wasteHistory && dashboardData.wasteHistory.length > 0)
                                        ? dashboardData.wasteHistory[0].balance.toLocaleString()
                                        : '0'} kg
                                </Typography>
                            </Box>
                        </Paper>

                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell align="right">Total Waste (kg)</TableCell>
                                        <TableCell align="right">Blow Room (kg)</TableCell>
                                        <TableCell align="right">Carding (kg)</TableCell>
                                        <TableCell align="right">OE (kg)</TableCell>
                                        <TableCell align="right">Others (kg)</TableCell>
                                        <TableCell align="right">Balance (kg)</TableCell>
                                        <TableCell>Reference</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(dashboardData?.wasteHistory || []).length === 0 ? (
                                        <TableRow><TableCell colSpan={8} align="center">No waste data found</TableCell></TableRow>
                                    ) : (
                                        (dashboardData?.wasteHistory || []).map((row: any) => (
                                            <TableRow key={row.id}>
                                                <TableCell>{new Date(row.date).toISOString().split('T')[0]}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                                    {row.quantity}
                                                </TableCell>
                                                <TableCell align="right">{row.wasteBlowRoom || 0}</TableCell>
                                                <TableCell align="right">{row.wasteCarding || 0}</TableCell>
                                                <TableCell align="right">{row.wasteOE || 0}</TableCell>
                                                <TableCell align="right">{row.wasteOthers || 0}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.balance}</TableCell>
                                                <TableCell>{row.reference}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
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
                                    <TableCell align="right">Amount (kg)</TableCell>
                                    <TableCell align="right">Balance (kg)</TableCell>
                                    <TableCell>Reference</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFullHistory.map((row) => (
                                    <TableRow key={`${row.item}-${row.id}`}>
                                        <TableCell>{row.date}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.type}
                                                size="small"
                                                color={row.type === 'INWARD' ? 'success' : (row.type === 'OUTWARD' ? 'warning' : 'info')}
                                            />
                                        </TableCell>
                                        <TableCell>{row.item}</TableCell>
                                        <TableCell align="right" sx={{ color: row.quantity >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                                            {row.quantity >= 0 ? '+' : ''}{row.quantity.toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                            {row.balance?.toLocaleString() || '-'}
                                        </TableCell>
                                        <TableCell>{row.reference}</TableCell>
                                    </TableRow>
                                ))}
                                {filteredFullHistory.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">No movement history found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>
            </Paper>

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
        </Box>
    );
};

export default Inventory;
