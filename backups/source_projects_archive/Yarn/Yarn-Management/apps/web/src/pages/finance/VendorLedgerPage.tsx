import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Stack,
    Divider
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    AccountBalance as BankIcon,
    Description as FileIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { http } from '../../lib/http';
import { notify } from '../../context/NotificationContext';

const VendorLedgerPage: React.FC = () => {
    const { supplierId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        if (supplierId) {
            loadLedger(supplierId);
        }
    }, [supplierId]);

    const loadLedger = async (id: string) => {
        setLoading(true);
        try {
            const { data } = await http.get(`/ap/ledger/${id}`);
            setData(data);
        } catch (error) {
            console.error(error);
            notify.showError('Failed to load vendor ledger');
        } finally {
            setLoading(false);
        }
    };

    if (!data) return <Box p={3}><Typography>Loading...</Typography></Box>;

    return (
        <Box p={3}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/finance/ap')}
                sx={{ mb: 2 }}
            >
                Back to AP Dashboard
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">{data.supplier.name}</Typography>
                    <Typography color="textSecondary">Vendor Ledger</Typography>
                    <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                        <Typography variant="body2"><strong>Email:</strong> {data.supplier.email || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Phone:</strong> {data.supplier.phone || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Address:</strong> {data.supplier.address || 'N/A'}</Typography>
                    </Stack>
                </Box>
                <Button variant="contained" startIcon={<BankIcon />}>Make Payment</Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Current Balance (Payable)</Typography>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                ₹{Number(data.balance).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Invoiced</Typography>
                            <Typography variant="h4">
                                ₹{Number(data.stats.totalInvoiced).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>Total Paid</Typography>
                            <Typography variant="h4" color="success.main">
                                ₹{Number(data.stats.totalPaid).toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Transactions</Typography>
                    <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Reference / Bill #</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.ledger.map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={row.type === 'INVOICE' ? <FileIcon /> : <BankIcon />}
                                                label={row.type}
                                                color={row.type === 'INVOICE' ? 'primary' : 'success'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {row.invoiceNumber || row.reference || '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                color={row.type === 'INVOICE' ? 'error.main' : 'success.main'}
                                                fontWeight="bold"
                                            >
                                                {row.type === 'INVOICE' ? '+' : '-'} ₹{Math.abs(row.amount).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {row.status ? (
                                                <Chip label={row.status} size="small" />
                                            ) : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.ledger.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No transactions found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default VendorLedgerPage;
