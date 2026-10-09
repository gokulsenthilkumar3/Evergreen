import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { apiClient } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function CustomerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/customer-portal/dashboard');
            setStats(res.data.stats);
            setRecentOrders(res.data.recentOrders);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Customer Dashboard
            </Typography>

            {/* Order Statistics */}
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Order Status
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff3e0' }}>
                        <ShoppingCartIcon fontSize="large" color="warning" />
                        <Box>
                            <Typography variant="h4">{stats?.orders?.pending || 0}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Pending Orders
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e3f2fd' }}>
                        <LocalShippingIcon fontSize="large" color="primary" />
                        <Box>
                            <Typography variant="h4">{stats?.orders?.processing || 0}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                In Processing
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}>
                        <CheckCircleIcon fontSize="large" color="success" />
                        <Box>
                            <Typography variant="h4">{stats?.orders?.delivered || 0}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Delivered
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fce4ec' }}>
                        <ShoppingCartIcon fontSize="large" color="error" />
                        <Box>
                            <Typography variant="h4">{stats?.orders?.total || 0}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Total Orders
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Invoice & Payment Statistics */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Invoices & Payments
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}>
                        <ReceiptIcon fontSize="large" color="success" />
                        <Box>
                            <Typography variant="h4">{stats?.invoices?.paid || 0}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Paid Invoices
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff3e0' }}>
                        <ReceiptIcon fontSize="large" color="warning" />
                        <Box>
                            <Typography variant="h4">{stats?.invoices?.outstanding || 0}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Outstanding Invoices
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: '#fce4ec' }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Total Outstanding
                        </Typography>
                        <Typography variant="h4">
                            ₹{Number(stats?.financials?.totalOutstanding || 0).toLocaleString()}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Orders */}
            <Typography variant="h6" gutterBottom>
                Recent Orders
            </Typography>
            {recentOrders.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No orders found</Typography>
                </Paper>
            ) : (
                recentOrders.map((order: any) => (
                    <Paper
                        key={order.id}
                        sx={{
                            p: 2,
                            mb: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                        }}
                        onClick={() => navigate(`/customer-portal/orders/${order.id}`)}
                    >
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {order.orderNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Date: {new Date(order.createdAt).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" color="primary">
                                {order.status}
                            </Typography>
                            <Typography variant="body2">₹{Number(order.totalAmount).toLocaleString()}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {order._count?.items || 0} Items
                            </Typography>
                        </Box>
                    </Paper>
                ))
            )}
        </Box>
    );
}
