
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    LinearProgress
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';

export default function AccountsReceivablePage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [agingData, setAgingData] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>({ dso: 0, cei: 0 });

    useEffect(() => {
        async function loadData() {
            try {
                const res = await http.get('/ar/aging-report');
                setAgingData(res.data);
                const metricsRes = await http.get('/ar/metrics');
                setMetrics(metricsRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <LinearProgress />;

    const summary = agingData?.summary || {};
    const customers = agingData?.byCustomer || [];

    const chartData = [
        { name: '0-30 Days', value: summary['0-30'] || 0, color: '#10b981' },
        { name: '31-60 Days', value: summary['31-60'] || 0, color: '#f59e0b' },
        { name: '61-90 Days', value: summary['61-90'] || 0, color: '#f97316' },
        { name: '90+ Days', value: summary['90+'] || 0, color: '#ef4444' }
    ];

    const totalOutstanding = Object.values(summary).reduce((a: any, b: any) => a + b, 0) as number;

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800">Accounts Receivable</Typography>
                <Typography variant="body1" color="text.secondary">
                    Track outstanding payments, collection efficiency, and customer balances.
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 3, height: '100%', bgcolor: '#f8fafc' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <ReceiptLongIcon sx={{ color: '#3b82f6', mr: 1 }} />
                                <Typography variant="h6" fontWeight="bold">Total Outstanding</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="800" sx={{ color: '#0f172a' }}>
                                ₹{(totalOutstanding / 1000).toFixed(1)}k
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Current unpaid invoices</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 3, height: '100%', bgcolor: '#f0fdf4' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">DSO</Typography>
                                <Chip label="Days" size="small" sx={{ ml: 1, bgcolor: '#dcfce7', color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" fontWeight="800" sx={{ color: '#166534' }}>{metrics.dso}</Typography>
                            <Typography variant="caption" color="text.secondary">Days Sales Outstanding</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 3, height: '100%', bgcolor: '#fff7ed' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">CEI</Typography>
                                <Chip label="%" size="small" sx={{ ml: 1, bgcolor: '#ffedd5', color: '#9a3412' }} />
                            </Box>
                            <Typography variant="h3" fontWeight="800" sx={{ color: '#9a3412' }}>{metrics.cei}%</Typography>
                            <Typography variant="caption" color="text.secondary">Collection Effectiveness</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Aging Analysis</Typography>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(val) => `₹${val}`} />
                                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Customer List */}
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" fontWeight="bold">Customer Balances</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell><Typography variant="subtitle2" fontWeight="bold">Customer</Typography></TableCell>
                                <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Total Due</Typography></TableCell>
                                <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">0-30 Days</Typography></TableCell>
                                <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Overdue (30+)</Typography></TableCell>
                                <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">Actions</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {customers.map((cust: any) => {
                                const overdue = (cust.buckets['31-60'] || 0) + (cust.buckets['61-90'] || 0) + (cust.buckets['90+'] || 0);
                                return (
                                    <TableRow key={cust.id || cust.name} hover>
                                        <TableCell>
                                            <Typography fontWeight="600">{cust.name}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight="bold">₹{cust.totalOutstanding.toLocaleString()}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            ₹{(cust.buckets['0-30'] || 0).toLocaleString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography color={overdue > 0 ? 'error.main' : 'text.secondary'} fontWeight={overdue > 0 ? 'bold' : 'normal'}>
                                                ₹{overdue.toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                startIcon={<VisibilityIcon />}
                                                onClick={() => navigate(`/finance/ledger/${cust.id}`)}
                                            >
                                                Ledger
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {customers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No outstanding invoices found.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
