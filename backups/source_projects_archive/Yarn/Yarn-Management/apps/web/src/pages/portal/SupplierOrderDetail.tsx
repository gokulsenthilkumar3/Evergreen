import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Grid, Divider, Button,
    Table, TableBody, TableCell, TableHead, TableRow,
    TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import { apiClient } from '../../lib/api';

export default function SupplierOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await apiClient.get(`/portal/orders/${id}`);
            setOrder(res.data.order);
        } catch (error) {
            console.error("Failed to fetch order", error);
        }
    };

    const handleAcknowledge = async () => {
        if (!confirm('Acknowledge this order?')) return;
        try {
            await apiClient.post(`/portal/orders/${id}/acknowledge`, {});
            fetchOrder();
        } catch (e) { alert('Failed to acknowledge'); }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        try {
            await apiClient.post(`/portal/orders/${id}/comments`, { message: comment });
            setComment('');
            fetchOrder();
        } catch (e) { alert('Failed to post comment'); }
    };

    if (!order) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Button onClick={() => navigate('/portal/orders')} sx={{ mb: 2 }}>Back to List</Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">{order.poNumber}</Typography>
                <Box>
                    {order.status === 'SENT' && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={handleAcknowledge}
                            sx={{ mr: 2 }}
                        >
                            Acknowledge Order
                        </Button>
                    )}
                    {order.status === 'CONFIRMED' && (
                        <Button
                            variant="contained"
                            endIcon={<LocalShippingIcon />}
                            sx={{ mr: 2 }}
                            disabled // Implementing Ship later
                        >
                            Mark Shipped
                        </Button>
                    )}
                    <Button variant="outlined" startIcon={<AttachFileIcon />}>
                        Upload Invoice
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Items</Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Unit Price</TableCell>
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.items.map((item: any) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Typography variant="subtitle2">{item.materialType}</Typography>
                                            <Typography variant="caption">{item.description}</Typography>
                                        </TableCell>
                                        <TableCell>{item.quantity} {item.unit}</TableCell>
                                        <TableCell>₹{item.unitPrice}</TableCell>
                                        <TableCell>₹{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Typography variant="h6">Total: ₹{Number(order.totalAmount).toLocaleString()}</Typography>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Communication</Typography>
                        <List sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                            {order.comments?.map((c: any) => (
                                <ListItem key={c.id}>
                                    <ListItemAvatar>
                                        <Avatar><PersonIcon /></Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={c.user?.name || 'Unknown'}
                                        secondary={<>
                                            <Typography variant="caption" display="block">{new Date(c.createdAt).toLocaleString()}</Typography>
                                            {c.message}
                                        </>}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Add a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleComment}><SendIcon /></Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="subtitle2" color="text.secondary">Order Status</Typography>
                        <Typography variant="h6" sx={{ mb: 2 }}>{order.status}</Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">Order Date</Typography>
                        <Typography variant="body1">{new Date(order.createdAt).toLocaleDateString()}</Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="text.secondary">Expected Delivery</Typography>
                        <Typography variant="body1">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'TBD'}</Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
