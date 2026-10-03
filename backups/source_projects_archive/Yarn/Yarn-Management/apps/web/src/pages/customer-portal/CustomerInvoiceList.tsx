import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../lib/api';

export default function CustomerInvoiceList() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [statusFilter]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const params = statusFilter ? { status: statusFilter } : {};
            const res = await apiClient.get('/customer-portal/invoices', { params });
            setInvoices(res.data.invoices);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'default';
            case 'SENT':
                return 'info';
            case 'PAID':
                return 'success';
            case 'OVERDUE':
                return 'error';
            case 'CANCELLED':
                return 'default';
            default:
                return 'default';
        }
    };

    const isOverdue = (invoice: any) => {
        return invoice.status === 'OVERDUE';
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Invoices & Payments</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Filter by Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="DRAFT">Draft</MenuItem>
                        <MenuItem value="SENT">Sent</MenuItem>
                        <MenuItem value="PAID">Paid</MenuItem>
                        <MenuItem value="OVERDUE">Overdue</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Invoice Number</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Due/Paid Date</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No invoices found
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice: any) => (
                                <TableRow key={invoice.id} hover sx={isOverdue(invoice) ? { bgcolor: '#ffebee' } : {}}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            {invoice.invoiceNumber}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold">
                                            ₹{Number(invoice.totalAmount).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={invoice.status} color={getStatusColor(invoice.status)} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        {invoice.paidAt
                                            ? new Date(invoice.paidAt).toLocaleDateString()
                                            : invoice.status === 'OVERDUE'
                                                ? 'Overdue!'
                                                : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/customer-portal/invoices/${invoice.id}`)}
                                            size="small"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton color="default" size="small" disabled>
                                            <DownloadIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
