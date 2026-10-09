import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton, Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';

export default function SupplierOrderList() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await apiClient.get('/portal/orders');
            setOrders(res.data.orders);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>My Orders</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>PO Number</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((po: any) => (
                            <TableRow key={po.id}>
                                <TableCell>{po.poNumber}</TableCell>
                                <TableCell>{new Date(po.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>₹{Number(po.totalAmount).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip label={po.status} color={po.status === 'SENT' ? 'warning' : 'default'} size="small" />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => navigate(`/portal/orders/${po.id}`)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No orders found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
