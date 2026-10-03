
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Button,
    Chip,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { http } from '../../lib/http';

export default function CustomerLedgerPage() {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    // Payment Form State
    const [openPayment, setOpenPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
    const [paymentRef, setPaymentRef] = useState('');

    // Credit Limit & Bad Debt State
    const [openCreditLimit, setOpenCreditLimit] = useState(false);
    const [newCreditLimit, setNewCreditLimit] = useState('');
    const [openBadDebt, setOpenBadDebt] = useState(false);
    const [badDebtAmount, setBadDebtAmount] = useState('');
    const [badDebtNotes, setBadDebtNotes] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await http.get(`/ar/ledger/${customerId}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (customerId) loadData();
    }, [customerId]);

    const handleRecordPayment = async () => {
        try {
            await http.post('/ar/payment', {
                customerId,
                amount: Number(paymentAmount),
                method: paymentMethod,
                reference: paymentRef,
                notes: 'Recorded via Web Portal'
            });
            setOpenPayment(false);
            setPaymentAmount('');
            setPaymentRef('');
            loadData();
        } catch (e) {
            console.error(e);
            alert('Failed to record payment');
        }
    };

    const handleUpdateCreditLimit = async () => {
        try {
            await http.patch(`/ar/credit-limit/${customerId}`, { creditLimit: Number(newCreditLimit) });
            setOpenCreditLimit(false);
            loadData();
        } catch (e) {
            console.error(e);
            alert('Failed to update credit limit');
        }
    };

    const handleProvisionBadDebt = async () => {
        try {
            await http.post('/ar/bad-debt', {
                customerId,
                amount: Number(badDebtAmount),
                notes: badDebtNotes
            });
            setOpenBadDebt(false);
            setBadDebtAmount('');
            setBadDebtNotes('');
            // Show success, though it won't appear in ledger timeline instantly unless backend supports it
            alert('Bad Debt Provisioned');
            loadData();
        } catch (e) {
            console.error(e);
            alert('Failed to provision bad debt');
        }
    };

    if (loading) return <LinearProgress />;
    if (!data) return <Typography>No data found</Typography>;

    const { customer, currentBalance, ledger } = data;

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/finance/ar')} sx={{ mb: 2 }}>
                Back to Dashboard
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="800">{customer.name}</Typography>
                    <Typography color="text.secondary">{customer.email} • {customer.phone}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Chip
                            label={`Credit Limit: ₹${Number(customer.creditLimit || 0).toLocaleString()}`}
                            color="primary"
                            variant="outlined"
                            onClick={() => { setNewCreditLimit(customer.creditLimit || ''); setOpenCreditLimit(true); }}
                        />
                        <Button size="small" color="error" onClick={() => setOpenBadDebt(true)}>
                            Provision Bad Debt
                        </Button>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" display="block" color="text.secondary">Current Balance</Typography>
                    <Typography variant="h3" fontWeight="800" color={currentBalance > 0 ? 'error.main' : 'success.main'}>
                        ₹{currentBalance.toLocaleString()}
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ mt: 1 }} onClick={() => setOpenPayment(true)}>
                        Record Payment
                    </Button>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Reference</TableCell>
                                <TableCell align="right">Debit (+)</TableCell>
                                <TableCell align="right">Credit (-)</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ledger.map((item: any) => {
                                const isDebit = item.amount > 0;
                                return (
                                    <TableRow key={`${item.type}-${item.id}`} hover>
                                        <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="500">{item.description}</Typography>
                                            <Typography variant="caption" color="text.secondary">{item.type}</Typography>
                                        </TableCell>
                                        <TableCell>{item.reference}</TableCell>
                                        <TableCell align="right" sx={{ color: 'error.main', fontWeight: isDebit ? 'bold' : 'normal' }}>
                                            {isDebit ? `₹${item.amount.toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: !isDebit ? 'bold' : 'normal' }}>
                                            {!isDebit ? `₹${Math.abs(item.amount).toLocaleString()}` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {item.status && <Chip label={item.status} size="small" color={item.status === 'PAID' ? 'success' : item.status === 'OVERDUE' ? 'error' : 'default'} />}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Payment Dialog */}
            <Dialog open={openPayment} onClose={() => setOpenPayment(false)}>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                        <TextField
                            label="Amount"
                            type="number"
                            fullWidth
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                        <TextField
                            select
                            label="Payment Method"
                            fullWidth
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <MenuItem value="CASH">Cash</MenuItem>
                            <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                            <MenuItem value="UPI">UPI</MenuItem>
                            <MenuItem value="CHEQUE">Cheque</MenuItem>
                        </TextField>
                        <TextField
                            label="Reference / Transaction ID"
                            fullWidth
                            value={paymentRef}
                            onChange={(e) => setPaymentRef(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPayment(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRecordPayment} disabled={!paymentAmount}>
                        Save Payment
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Credit Limit Dialog */}
            <Dialog open={openCreditLimit} onClose={() => setOpenCreditLimit(false)}>
                <DialogTitle>Update Credit Limit</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Credit Limit Amount"
                        type="number"
                        fullWidth
                        value={newCreditLimit}
                        onChange={(e) => setNewCreditLimit(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreditLimit(false)}>Cancel</Button>
                    <Button onClick={handleUpdateCreditLimit} variant="contained">Update</Button>
                </DialogActions>
            </Dialog>

            {/* Bad Debt Dialog */}
            <Dialog open={openBadDebt} onClose={() => setOpenBadDebt(false)}>
                <DialogTitle>Provision Bad Debt</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
                        <TextField
                            label="Amount"
                            type="number"
                            fullWidth
                            value={badDebtAmount}
                            onChange={(e) => setBadDebtAmount(e.target.value)}
                        />
                        <TextField
                            label="Notes / Reason"
                            fullWidth
                            multiline
                            rows={2}
                            value={badDebtNotes}
                            onChange={(e) => setBadDebtNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBadDebt(false)}>Cancel</Button>
                    <Button onClick={handleProvisionBadDebt} variant="contained" color="error">Provision</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
