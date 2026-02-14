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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Tooltip as MuiTooltip,
    type SelectChangeEvent,
} from '@mui/material';
import {
    ArrowUpward,
    ArrowDownward,
    Email as EmailIcon,
    PictureAsPdf as PdfIcon,
    TableView as ExcelIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
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
    Tooltip as RechartsTooltip,
    CartesianGrid,
    Legend
} from 'recharts';
import { generateExcel } from '../utils/excelGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import api from '../utils/api';
import { toast } from 'sonner';
import { useConfirm } from '../context/ConfirmContext';

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
    originalDate?: Date;
    count?: string;
    quantity: number;
    balance?: number;
    bale?: number;
    unit?: string;
    reference: string;
    details?: string;
}

interface InventoryProps {
    userRole?: string;
    username?: string;
}

const Inventory: React.FC<InventoryProps> = ({ userRole, username }) => {
    const [tabValue, setTabValue] = useState(0);
    const [dateFilter, setDateFilter] = useState<string>('month');
    const [customFrom, setCustomFrom] = useState<string>('');
    const [customTo, setCustomTo] = useState<string>('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState<string>('all');
    const { confirm: confirmDialog } = useConfirm();

    // Waste Management State
    const [wasteModalOpen, setWasteModalOpen] = useState(false);
    const [wasteAction, setWasteAction] = useState<'recycle' | 'export'>('recycle');
    const [wasteForm, setWasteForm] = useState({ date: new Date().toISOString().split('T')[0], quantity: '', buyer: '', price: '' });

    const handleDeleteWaste = async (id: number) => {
        if (!await confirmDialog({
            title: 'Delete Waste Entry',
            message: 'Are you sure you want to delete this waste entry? If it was a recycle action, the corresponding cotton stock will also be reverted.',
            severity: 'error',
            confirmText: 'Delete',
            cancelText: 'Cancel'
        })) return;

        try {
            await api.delete(`/inventory/waste/${id}`);
            toast.success('Waste entry deleted');
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete waste entry');
        }
    };

    const handleWasteSubmit = async () => {
        try {
            if (!wasteForm.quantity || parseFloat(wasteForm.quantity) <= 0) {
                toast.error('Invalid quantity');
                return;
            }
            if (wasteAction === 'export') {
                await api.post('/inventory/waste/export', { ...wasteForm, quantity: parseFloat(wasteForm.quantity), createdBy: username });
            } else {
                await api.post('/inventory/waste/recycle', { date: wasteForm.date, quantity: parseFloat(wasteForm.quantity), createdBy: username });
            }
            toast.success('Waste processed successfully');
            setWasteModalOpen(false);
            setWasteForm({ date: new Date().toISOString().split('T')[0], quantity: '', buyer: '', price: '' });
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to process waste');
        }
    };

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

    const { data: dashboardData, refetch } = useQuery({
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
            originalDate: h.entryTimestamp ? new Date(h.entryTimestamp) : (h.createdAt ? new Date(h.createdAt) : new Date(h.date)),
            type: h.type as 'INWARD' | 'OUTWARD' | 'PRODUCTION' | 'WASTE',
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
        if (historyTypeFilter === 'waste') return item.type === 'WASTE' || item.item?.toLowerCase().includes('waste');
        return true;
    });

    const handleExport = (type: 'email' | 'excel' | 'pdf') => {
        const dataToExport = filteredFullHistory.map(row => ({
            Date: row.date,
            Type: row.type,
            Item: row.item || '-',
            'Quantity (kg)': row.quantity,
            'Balance (kg)': row.balance ?? 0,
            Reference: row.reference || '-'
        }));

        if (type === 'excel') {
            generateExcel(dataToExport, "Inventory_Report");
            toast.success('Exported as Excel');
        } else if (type === 'pdf') {
            const headers = ['Date', 'Type', 'Item', 'Quantity (kg)', 'Balance (kg)', 'Reference'];
            const data = dataToExport.map(row => Object.values(row));
            generatePDF("Inventory Report", headers, data, "Inventory_Report");
            toast.success('Exported as PDF');
        } else if (type === 'email') {
            const subject = encodeURIComponent("Inventory Report");
            const body = encodeURIComponent("Please attach the exported report manually.");
            window.location.href = `mailto:?subject=${subject}&body=${body}`;
            toast.info('Opening email client...');
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
            const counts = Array.from(new Set(data.map(d => d.count || (d.reference?.match(/Count (\d+)/)?.[1])).filter((c): c is string => Boolean(c)))).sort((a, b) => parseInt(a) - parseInt(b));

            counts.forEach(count => {
                const countData = data.filter(d => (d.count === count) || (d.reference && d.reference.includes(`Count ${count}`)) || (d.details && d.details.includes(count)));
                const latestCountEntry = countData.length > 0 ? countData[0] : null;
                const totalKg = latestCountEntry?.balance || 0;
                const bags = Math.floor(totalKg / 60);
                const remainder = totalKg % 60;
                yarnByCount[count as string] = { bags, kg: totalKg, remainder };

                totalBagsFromCounts += bags;
                totalRemainderFromCounts += remainder;
                totalKgFromAllCounts += totalKg;
            });
            currentBalance = totalKgFromAllCounts;
        }

        const currentBaleBalance = isCotton ? data.reduce((sum, item) => sum + (item.bale || 0), 0) : 0;
        if (isCotton) {
            currentBalance = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
        }

        const totalBales = isCotton ? currentBaleBalance : 0;
        const totalBags = isYarn ? totalBagsFromCounts : 0;
        const remainderKg = isYarn ? totalRemainderFromCounts : 0;

        return (
            <Box sx={{ maxWidth: '100%', width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>{title}</Typography>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'primary.dark' }}>
                    {isCotton && (
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
                    )}
                    {isYarn && (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Balance Yarn Bags</Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.light', mb: 2 }}>
                                    {totalBags.toLocaleString()} bags
                                    {remainderKg > 0 && (
                                        <Typography component="span" variant="h6" sx={{ ml: 2, color: 'warning.light' }}>
                                            (+ {remainderKg.toFixed(2)} kg loose)
                                        </Typography>
                                    )}
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
                                    const baleCount = isCotton ? (row.bale || 0) : 0;
                                    const bagCount = isYarn ? Math.floor(Math.abs(row.quantity) / 60) : 0;

                                    return (
                                        <TableRow key={row.id}>
                                            <TableCell>
                                                <MuiTooltip title={row.originalDate ? row.originalDate.toLocaleString() : row.date} arrow placement="top">
                                                    <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                        {row.date}
                                                    </Box>
                                                </MuiTooltip>
                                            </TableCell>
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
                                                    {row.quantity >= 0 ? '+' : '-'}{Math.abs(baleCount)}
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
                                        <RechartsTooltip />
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
                                        <RechartsTooltip />
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Waste Logs</Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => setWasteModalOpen(true)}
                                sx={{ px: 4 }}
                            >
                                Manage Waste stock
                            </Button>
                        </Box>

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
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(dashboardData?.wasteHistory || []).length === 0 ? (
                                        <TableRow><TableCell colSpan={8} align="center">No waste data found</TableCell></TableRow>
                                    ) : (
                                        (dashboardData?.wasteHistory || []).map((row: any) => (
                                            <TableRow key={row.id}>
                                                <TableCell>
                                                    <MuiTooltip title={new Date(row.date).toLocaleString()} arrow placement="top">
                                                        <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                            {new Date(row.date).toISOString().split('T')[0]}
                                                        </Box>
                                                    </MuiTooltip>
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                                    {row.quantity}
                                                </TableCell>
                                                <TableCell align="right">{row.wasteBlowRoom || 0}</TableCell>
                                                <TableCell align="right">{row.wasteCarding || 0}</TableCell>
                                                <TableCell align="right">{row.wasteOE || 0}</TableCell>
                                                <TableCell align="right">{row.wasteOthers || 0}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.balance}</TableCell>
                                                <TableCell>{row.reference}</TableCell>
                                                <TableCell align="center">
                                                    {row.type !== 'PRODUCTION' && (userRole === 'ADMIN' || userRole === 'AUTHOR') && (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => {
                                                                    setWasteAction(row.type === 'EXPORT' ? 'export' : 'recycle');
                                                                    setWasteForm({
                                                                        date: new Date(row.date).toISOString().split('T')[0],
                                                                        quantity: Math.abs(row.quantity).toString(),
                                                                        buyer: row.reference.startsWith('SOLD-') ? row.reference.replace('SOLD-', '') : '',
                                                                        price: '' // Price is not stored in inventory log currently
                                                                    });
                                                                    // Since we don't have PUT, we'll suggest deleting and re-adding
                                                                    toast.info('Editing will delete the old entry and create a new one');
                                                                    setWasteModalOpen(true);
                                                                    // We could set editingWasteId here if we wanted to handle it in submit
                                                                }}
                                                                sx={{ mr: 1 }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteWaste(row.id)}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                    {row.type === 'PRODUCTION' && (
                                                        <MuiTooltip title="Derived from Production. Edit production entry to change.">
                                                            <Typography variant="caption" color="text.disabled">Derived</Typography>
                                                        </MuiTooltip>
                                                    )}
                                                </TableCell>
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
                                <MenuItem value="waste">Waste Movements</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button startIcon={<EmailIcon />} variant="outlined" color="info" onClick={() => handleExport('email')}>Email</Button>
                            <Button startIcon={<ExcelIcon />} variant="outlined" color="info" onClick={() => handleExport('excel')}>Excel</Button>
                            <Button startIcon={<PdfIcon />} variant="outlined" color="info" onClick={() => handleExport('pdf')}>PDF</Button>
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
                                        <TableCell>
                                            <MuiTooltip title={row.originalDate ? row.originalDate.toLocaleString() : row.date} arrow placement="top">
                                                <Box component="span" sx={{ cursor: 'help', borderBottom: '1px dotted', borderColor: 'divider' }}>
                                                    {row.date}
                                                </Box>
                                            </MuiTooltip>
                                        </TableCell>
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



            {/* Waste Management Dialog */}
            <Dialog open={wasteModalOpen} onClose={() => setWasteModalOpen(false)}>
                <DialogTitle>Manage Waste</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Select whether to recycle waste (add back to cotton stock) or export/sell it.
                    </DialogContentText>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Action</InputLabel>
                        <Select
                            value={wasteAction}
                            label="Action"
                            onChange={(e) => setWasteAction(e.target.value as 'recycle' | 'export')}
                        >
                            <MenuItem value="recycle">Recycle (Add to Cotton Stock)</MenuItem>
                            <MenuItem value="export">Export / Sell</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        type="date"
                        label="Date"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={wasteForm.date}
                        onChange={(e) => setWasteForm({ ...wasteForm, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        type="number"
                        label="Quantity (kg)"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={wasteForm.quantity}
                        onChange={(e) => setWasteForm({ ...wasteForm, quantity: e.target.value })}
                    />

                    {wasteAction === 'export' && (
                        <>
                            <TextField
                                label="Buyer Name"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={wasteForm.buyer}
                                onChange={(e) => setWasteForm({ ...wasteForm, buyer: e.target.value })}
                            />
                            <TextField
                                type="number"
                                label="Price (Total)"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={wasteForm.price}
                                onChange={(e) => setWasteForm({ ...wasteForm, price: e.target.value })}
                            />
                        </>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWasteModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleWasteSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default Inventory;
