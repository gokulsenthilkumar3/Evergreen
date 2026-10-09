import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import { apiClient } from '../../lib/api';

const orderSteps = ['Draft', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function CustomerOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/customer-portal/orders/${id}`);
            setOrder(res.data.order);
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActiveStep = (status: string) => {
        const stepMap: Record<string, number> = {
            DRAFT: 0,
            CONFIRMED: 1,
            PROCESSING: 2,
            SHIPPED: 3,
            DELIVERED: 4,
        };
        return stepMap[status] || 0;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!order) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Order not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/customer-portal/orders')}
                sx={{ mb: 2 }}
            >
                Back to Orders
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">{order.orderNumber}</Typography>
                <Chip label={order.status} color="primary" />
            </Box>

            {/* Order Status Timeline */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Order Progress
                </Typography>
                <Stepper activeStep={getActiveStep(order.status)} alternativeLabel sx={{ mt: 2 }}>
                    {orderSteps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* Order Items */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.items?.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{item.productName}</Typography>
                                        </TableCell>
                                        <TableCell align="right">{Number(item.quantity).toFixed(2)}</TableCell>
                                        <TableCell align="right">₹{Number(item.unitPrice).toLocaleString()}</TableCell>
                                        <TableCell align="right">₹{Number(item.totalPrice).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="h6">
                                Total: ₹{Number(order.totalAmount).toLocaleString()}
                            </Typography>
                        </Box>
                    </Paper>

                    {/* Delivery Information */}
                    {order.deliveryNotes && order.deliveryNotes.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Delivery Information
                            </Typography>
                            {order.deliveryNotes.map((note: any) => (
                                <Box key={note.id} sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        <strong>Delivery Note:</strong> {note.deliveryNoteNumber}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Date:</strong> {new Date(note.deliveryDate).toLocaleDateString()}
                                    </Typography>
                                    {note.deliveredBy && (
                                        <Typography variant="body2">
                                            <strong>Delivered By:</strong> {note.deliveredBy}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        <strong>Status:</strong> {note.status}
                                    </Typography>
                                </Box>
                            ))}
                        </Paper>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    {/* Order Summary */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Details
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">
                            Order Date
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {new Date(order.orderDate).toLocaleDateString()}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {order.expectedDeliveryDate && (
                            <>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Expected Delivery
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                            </>
                        )}

                        {order.notes && (
                            <>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Notes
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {order.notes}
                                </Typography>
                            </>
                        )}
                    </Paper>

                    {/* Action Buttons */}
                    <Paper sx={{ p: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            sx={{ mb: 1 }}
                            disabled
                        >
                            Download Packing List
                        </Button>
                        <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} disabled>
                            Download Delivery Note
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
