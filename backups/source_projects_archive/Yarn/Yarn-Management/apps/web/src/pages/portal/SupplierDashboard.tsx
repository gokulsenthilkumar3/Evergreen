import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { apiClient } from '../../lib/api';

export default function SupplierDashboard() {
    const [stats, setStats] = useState({
        pending: 0,
        confirmed: 0,
        shipped: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        // Fetch dashboard stats (we might need a dedicated endpoint, but let's derive from orders for now)
        // Actually we will just fetch recent orders and count from there for simplicity, 
        // or add a ?limit=50 to list endpoint.
        // Ideally backend should provide stats. Let's start simple.
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await apiClient.get('/portal/orders?limit=100');
            const orders = res.data.orders;
            setRecentOrders(orders.slice(0, 5));

            const pending = orders.filter((o: any) => o.status === 'SENT').length;
            const confirmed = orders.filter((o: any) => o.status === 'CONFIRMED').length;
            const shipped = orders.filter((o: any) => o.status === 'SHIPPED').length;

            setStats({ pending, confirmed, shipped });
        } catch (error) {
            console.error("Failed to load dashboard", error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Supplier Dashboard</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e3f2fd' }}>
                        <AssignmentIcon fontSize="large" color="primary" />
                        <Box>
                            <Typography variant="h4">{stats.pending}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">Pending Acknowledgement</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#e8f5e9' }}>
                        <CheckCircleIcon fontSize="large" color="success" />
                        <Box>
                            <Typography variant="h4">{stats.confirmed}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">Ready to Ship</Typography>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff3e0' }}>
                        <LocalShippingIcon fontSize="large" color="warning" />
                        <Box>
                            <Typography variant="h4">{stats.shipped}</Typography>
                            <Typography variant="subtitle1" color="text.secondary">In Transit</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Recent Orders</Typography>
            {recentOrders.map((order: any) => (
                <Paper key={order.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="subtitle1">{order.poNumber}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2" color="primary">
                            {order.status}
                        </Typography>
                        <Typography variant="body2">
                            {order._count?.items || 0} Items
                        </Typography>
                    </Box>
                </Paper>
            ))}
        </Box>
    );
}
