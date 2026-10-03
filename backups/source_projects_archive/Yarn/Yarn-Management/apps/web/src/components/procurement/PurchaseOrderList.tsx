import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { apiClient } from '../../lib/api';
import PurchaseOrderForm from './PurchaseOrderForm';

export default function PurchaseOrderList() {
    const [poList, setPoList] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedPo, setSelectedPo] = useState<any>(null);

    const fetchPOs = async () => {
        try {
            const res = await apiClient.get('/procurement/purchase-orders');
            setPoList(res.data.purchaseOrders);
        } catch (error) {
            console.error('Failed to fetch POs', error);
        }
    };

    useEffect(() => {
        fetchPOs();
    }, []);

    const handleCreate = () => {
        setSelectedPo(null);
        setOpenForm(true);
    };

    const handleView = (po: any) => {
        // Ideally open a details view, for now we might reuse form or just show details
        setSelectedPo(po);
        setOpenForm(true); // Using form in read-only or edit mode? simplified for now
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Purchase Orders</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                    Create PO
                </Button>
            </Box>

            {openForm ? (
                <PurchaseOrderForm
                    onClose={() => {
                        setOpenForm(false);
                        fetchPOs();
                    }}
                    initialData={selectedPo}
                />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>PO Number</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {poList.map((po: any) => (
                                <TableRow key={po.id}>
                                    <TableCell>{po.poNumber}</TableCell>
                                    <TableCell>{po.supplier?.name}</TableCell>
                                    <TableCell>{format(new Date(po.createdAt), 'dd MMM yyyy')}</TableCell>
                                    <TableCell>₹{Number(po.totalAmount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={po.status}
                                            color={po.status === 'CONFIRMED' ? 'success' : po.status === 'DRAFT' ? 'default' : 'primary'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{po._count?.items || 0}</TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => handleView(po)}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {poList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No Purchase Orders found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
