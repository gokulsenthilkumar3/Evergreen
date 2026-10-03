import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    TextField,
    MenuItem,
    Paper,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const SalesOrderForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDeliveryDate: '',
        notes: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    });

    useEffect(() => {
        fetchCustomers();
        if (isEdit) {
            fetchOrder();
        }
    }, [id]);

    const fetchCustomers = async () => {
        try {
            const response = await http.get('/customers');
            setCustomers(response.data.customers);
        } catch (error) {
            notify.showError('Failed to fetch customers');
        }
    };

    const fetchOrder = async () => {
        try {
            const response = await http.get(`/sales/orders/${id}`);
            const order = response.data.order;
            setFormData({
                ...order,
                orderDate: new Date(order.orderDate).toISOString().split('T')[0],
                expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : '',
                items: order.items.map((item: any) => ({
                    ...item,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice)
                }))
            });
        } catch (error) {
            notify.showError('Failed to fetch order details');
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems: any = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].totalPrice = Number(newItems[index].quantity) * Number(newItems[index].unitPrice);
        }

        setFormData({ ...formData, items: newItems });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                ...formData,
                totalAmount: calculateTotal()
            };

            if (isEdit) {
                await http.patch(`/sales/orders/${id}`, payload);
                notify.showSuccess('Order updated successfully');
            } else {
                await http.post('/sales/orders', payload);
                notify.showSuccess('Order created successfully');
            }
            navigate('/sales/orders');
        } catch (error: any) {
            notify.showError(error.message || 'Failed to save order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">{isEdit ? 'Edit Sales Order' : 'New Sales Order'}</Typography>
                <Box>
                    <Button startIcon={<X size={18} />} onClick={() => navigate('/sales/orders')} sx={{ mr: 1 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save size={18} />}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Order'}
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Order Info</Typography>
                            <TextField
                                fullWidth
                                select
                                label="Customer"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                margin="normal"
                                required
                            >
                                {customers.map((c: any) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                type="date"
                                label="Order Date"
                                value={formData.orderDate}
                                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                            <TextField
                                fullWidth
                                type="date"
                                label="Expected Delivery"
                                value={formData.expectedDeliveryDate}
                                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                margin="normal"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6">Order Items</Typography>
                                <Button startIcon={<Plus size={18} />} onClick={addItem}>Add Item</Button>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product Name</TableCell>
                                            <TableCell width={120}>Quantity</TableCell>
                                            <TableCell width={150}>Unit Price (₹)</TableCell>
                                            <TableCell width={150}>Total (₹)</TableCell>
                                            <TableCell width={50}></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={item.productName}
                                                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                                        placeholder="Enter product name..."
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        ₹{(item.totalPrice).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {formData.items.length > 1 && (
                                                        <IconButton size="small" color="error" onClick={() => removeItem(index)}>
                                                            <Trash2 size={16} />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="flex-end">
                                <Typography variant="h5">Total: ₹{calculateTotal().toLocaleString()}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SalesOrderForm;
