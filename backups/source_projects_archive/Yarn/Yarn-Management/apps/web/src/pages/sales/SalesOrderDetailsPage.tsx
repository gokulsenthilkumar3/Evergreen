import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Stack,
    CircularProgress,
    IconButton
} from '@mui/material';
import { ArrowLeft, Package, Truck, Printer, CheckCircle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const SalesOrderDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await http.get(`/sales/orders/${id}`);
            setOrder(response.data.order);
        } catch (error) {
            notify.showError('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        try {
            await http.patch(`/sales/orders/${id}/status`, { status: newStatus });
            notify.showSuccess(`Order status updated to ${newStatus}`);
            fetchOrder();
        } catch (error) {
            notify.showError('Failed to update status');
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

    if (loading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
    if (!order) return <Box p={5} textAlign="center"><Typography>Order not found</Typography></Box>;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => navigate('/sales/orders')} sx={{ mr: 2 }}>
                        <ArrowLeft size={20} />
                    </IconButton>
                    <Typography variant="h4">Order {order.orderNumber}</Typography>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        sx={{ ml: 2 }}
                    />
                </Box>
                <Box>
                    <Button startIcon={<Printer size={18} />} sx={{ mr: 1 }}>Print</Button>
                    {order.status === 'DRAFT' && (
                        <Button variant="contained" color="primary" onClick={() => updateStatus('CONFIRMED')}>
                            Confirm Order
                        </Button>
                    )}
                    {order.status === 'CONFIRMED' && (
                        <Button variant="contained" color="info" onClick={() => updateStatus('PROCESSING')}>
                            Start Processing
                        </Button>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Order Items</Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell align="right">Quantity</TableCell>
                                            <TableCell align="right">Unit Price</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.items.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell align="right">{Number(item.quantity).toLocaleString()}</TableCell>
                                                <TableCell align="right">₹{Number(item.unitPrice).toLocaleString()}</TableCell>
                                                <TableCell align="right">₹{Number(item.totalPrice).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right"><Typography fontWeight="bold">Grand Total</Typography></TableCell>
                                            <TableCell align="right"><Typography fontWeight="bold" variant="h6">₹{Number(order.totalAmount).toLocaleString()}</Typography></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Fulfillment History</Typography>
                            <Stack spacing={2}>
                                {order.packingLists.length === 0 && order.deliveryNotes.length === 0 && (
                                    <Typography color="textSecondary">No fulfillment activity yet</Typography>
                                )}
                                {order.packingLists.map((pl: any) => (
                                    <Box key={pl.id} display="flex" alignItems="center" p={1} bgcolor="#f5f5f5" borderRadius={1}>
                                        <Package size={20} style={{ marginRight: 12, color: '#1976d2' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Packing List {pl.packingListNumber}</Typography>
                                            <Typography variant="caption" color="textSecondary">Packed on {new Date(pl.packedAt).toLocaleDateString()}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                                {order.deliveryNotes.map((dn: any) => (
                                    <Box key={dn.id} display="flex" alignItems="center" p={1} bgcolor="#e8f5e9" borderRadius={1}>
                                        <Truck size={20} style={{ marginRight: 12, color: '#2e7d32' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Delivery Note {dn.deliveryNoteNumber}</Typography>
                                            <Typography variant="caption" color="textSecondary">Delivered on {new Date(dn.deliveryDate).toLocaleDateString()}</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Customer Details</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">{order.customer?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">{order.customer?.email}</Typography>
                            <Typography variant="body2" color="textSecondary">{order.customer?.phone}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" display="block">GSTIN</Typography>
                            <Typography variant="body2" gutterBottom>{order.customer?.gstin || 'N/A'}</Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Timeline</Typography>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="flex-start">
                                    <CheckCircle size={16} style={{ color: '#2e7d32', marginTop: 4, marginRight: 8 }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Order Created</Typography>
                                        <Typography variant="caption" color="textSecondary">{new Date(order.createdAt).toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                                <Box display="flex" alignItems="flex-start">
                                    <Clock size={16} style={{ color: '#1976d2', marginTop: 4, marginRight: 8 }} />
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Expected Delivery</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'Not set'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SalesOrderDetailsPage;
