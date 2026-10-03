import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    Mail,
    Phone,
    MapPin,
    CreditCard,
    TrendingUp,
    History,
    Info,
    Edit,
    ArrowLeft,
    ChevronRight
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cusRes, anaRes, hisRes] = await Promise.all([
                http.get(`/customers/${id}`),
                http.get(`/customers/${id}/analytics`),
                http.get(`/customers/${id}/revenue-history`)
            ]);
            setCustomer(cusRes.data.customer);
            setAnalytics(anaRes.data.analytics);
            setHistory(hisRes.data.history);
        } catch (error) {
            notify.showError('Failed to fetch customer details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
    if (!customer) return <Box p={5} textAlign="center"><Typography>Customer not found</Typography></Box>;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <Box p={3}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => navigate('/customers')} sx={{ mr: 2 }}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Box>
                        <Typography variant="h4">{customer.name}</Typography>
                        <Box display="flex" gap={1} mt={0.5}>
                            <Chip label={customer.category} size="small" variant="outlined" />
                            <Chip
                                label={customer.lifecycleStage}
                                size="small"
                                color={customer.lifecycleStage === 'ACTIVE' ? 'success' : 'info'}
                            />
                            <Chip label={customer.valueClass + ' VALUE'} size="small" sx={{ bgcolor: 'secondary.light' }} />
                        </Box>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Edit size={18} />}
                    onClick={() => navigate(`/customers/${customer.id}/edit`)}
                >
                    Edit Profile
                </Button>
            </Box>

            {/* Top Stats */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Total Revenue</Typography>
                            <Typography variant="h5">{formatCurrency(analytics?.totalRevenue || 0)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Outstanding</Typography>
                            <Typography variant="h5" color="error">{formatCurrency(analytics?.outstanding || 0)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Avg Order Value</Typography>
                            <Typography variant="h5">{formatCurrency(analytics?.avgOrderValue || 0)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" variant="subtitle2">Total Orders</Typography>
                            <Typography variant="h5">{analytics?.purchaseCount || 0}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Left Column - Details */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <Info size={18} style={{ marginRight: 8 }} /> Master Data
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">GSTIN</Typography>
                                    <Typography variant="body1">{customer.gstin || 'Not provided'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Credit Limit</Typography>
                                    <Typography variant="body1">{formatCurrency(Number(customer.creditLimit) || 0)}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Payment Terms</Typography>
                                    <Typography variant="body1">{customer.creditTerms || 'Standard'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Email</Typography>
                                    <Typography variant="body1" display="flex" alignItems="center">
                                        <Mail size={14} style={{ marginRight: 6 }} /> {customer.email || 'N/A'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Phone</Typography>
                                    <Typography variant="body1" display="flex" alignItems="center">
                                        <Phone size={14} style={{ marginRight: 6 }} /> {customer.phone || 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <MapPin size={18} style={{ marginRight: 8 }} /> Addresses
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {customer.addresses?.map((addr: any) => (
                                <Box key={addr.id} mb={2}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Typography variant="subtitle2">{addr.type}</Typography>
                                        {addr.isDefault && <Chip label="Primary" size="small" color="primary" variant="outlined" />}
                                    </Box>
                                    <Typography variant="body2" color="textSecondary">
                                        {addr.line1}, {addr.line2 && addr.line2 + ', '}{addr.city}, {addr.state} - {addr.pincode}
                                    </Typography>
                                </Box>
                            ))}
                            {(!customer.addresses || customer.addresses.length === 0) && (
                                <Typography variant="body2" color="textSecondary">No addresses recorded</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Charts & Tabs */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                                <TrendingUp size={18} style={{ marginRight: 8 }} /> Revenue Trend (Last 6 Months)
                            </Typography>
                            <Box height={300} mt={2}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                                        <Bar dataKey="amount" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>

                    <Paper>
                        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tab label="Recent Transactions" />
                            <Tab label="Contacts" />
                            <Tab label="Notes" />
                        </Tabs>
                        <Box p={2}>
                            {tabValue === 0 && (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="right">Amount</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {customer.invoices?.map((inv: any) => (
                                                <TableRow key={inv.id}>
                                                    <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>Invoice #{inv.invoiceNumber}</TableCell>
                                                    <TableCell>
                                                        <Chip label={inv.status} size="small" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell align="right">{formatCurrency(Number(inv.totalAmount))}</TableCell>
                                                </TableRow>
                                            ))}
                                            {customer.payments?.map((pay: any) => (
                                                <TableRow key={pay.id}>
                                                    <TableCell>{new Date(pay.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>Payment</TableCell>
                                                    <TableCell><Chip label="PAID" size="small" color="success" variant="outlined" /></TableCell>
                                                    <TableCell align="right" sx={{ color: 'success.main' }}>
                                                        - {formatCurrency(Number(pay.amount))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            {tabValue === 1 && (
                                <Grid container spacing={2}>
                                    {customer.contacts?.map((contact: any) => (
                                        <Grid item xs={12} sm={6} key={contact.id}>
                                            <Card variant="outlined">
                                                <CardContent sx={{ p: '12px !important' }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{contact.name}</Typography>
                                                    <Typography variant="body2" color="textSecondary" gutterBottom>{contact.designation}</Typography>
                                                    <Typography variant="body2" display="flex" alignItems="center">
                                                        <Mail size={14} style={{ marginRight: 6 }} /> {contact.email || 'N/A'}
                                                    </Typography>
                                                    <Typography variant="body2" display="flex" alignItems="center" mt={0.5}>
                                                        <Phone size={14} style={{ marginRight: 6 }} /> {contact.phone || 'N/A'}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                            {tabValue === 2 && (
                                <Typography variant="body1">{customer.notes || 'No notes available.'}</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CustomerDetailsPage;
