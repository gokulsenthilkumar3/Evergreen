import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Grid,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import { Plus, Eye, Edit, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const SalesOrderPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        fetchOrders();
        fetchAnalytics();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await http.get('/sales/orders');
            setOrders(response.data.orders);
        } catch (error) {
            notify.showError('Failed to fetch sales orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await http.get('/sales/orders/analytics');
            setAnalytics(response.data.analytics);
        } catch (error) {
            console.error('Failed to fetch sales analytics');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'default';
            case 'CONFIRMED': return 'primary';
            case 'PROCESSING': return 'info';
            case 'SHIPPED': return 'warning';
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'error';
            default: return 'default';
        }
    };

    if (loading && orders.length === 0) {
        return <Box p={5} textAlign="center"><CircularProgress /></Box>;
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <ClipboardList size={28} style={{ marginRight: 12 }} />
                    <Typography variant="h4">Sales Orders</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={() => navigate('/sales/orders/new')}
                >
                    New Sales Order
                </Button>
            </Box>

            {analytics && (
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={4}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                            <CardContent>
                                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Revenue</Typography>
                                <Typography variant="h3">₹{(analytics.totalRevenue || 0).toLocaleString()}</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.7 }}>Across {analytics.orderCount} orders</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" variant="subtitle2">Pending Confirmation</Typography>
                                <Typography variant="h3">{analytics.byStatus?.DRAFT || 0}</Typography>
                                <Typography variant="caption" color="textSecondary">Awaiting customer approval</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" variant="subtitle2">In Fulfillment</Typography>
                                <Typography variant="h3">
                                    {(analytics.byStatus?.CONFIRMED || 0) + (analytics.byStatus?.PROCESSING || 0)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">Orders being processed or packed</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order #</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((order: any) => (
                            <TableRow key={order.id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{order.orderNumber}</TableCell>
                                <TableCell>{order.customer?.name}</TableCell>
                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                <TableCell>₹{Number(order.totalAmount).toLocaleString()}</TableCell>
                                <TableCell>{order._count?.items || 0} items</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        color={getStatusColor(order.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => navigate(`/sales/orders/${order.id}`)}>
                                        <Eye size={18} />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => navigate(`/sales/orders/${order.id}/edit`)}>
                                        <Edit size={18} />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Box p={3}>
                                        <Typography color="textSecondary">No sales orders found</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SalesOrderPage;
