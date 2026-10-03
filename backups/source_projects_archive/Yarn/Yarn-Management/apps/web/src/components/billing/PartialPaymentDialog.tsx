import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Alert,
    Box,
    Typography,
    InputAdornment,
} from '@mui/material';
import { http } from '../../lib/http';

interface PartialPaymentDialogProps {
    open: boolean;
    onClose: () => void;
    invoice: {
        id: string;
        invoiceNumber: string;
        totalAmount: number;
        paidAmount: number;
        balance: number;
        customerName: string;
    };
    onSuccess: () => void;
}

const PAYMENT_METHODS = [
    'Cash',
    'Cheque',
    'Bank Transfer',
    'UPI',
    'Credit Card',
    'Debit Card',
    'Net Banking',
    'Other',
];

export default function PartialPaymentDialog({
    open,
    onClose,
    invoice,
    onSuccess,
}: PartialPaymentDialogProps) {
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [paymentDate, setPaymentDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [reference, setReference] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (paymentAmount > invoice.balance) {
            setError(`Payment amount cannot exceed balance of ₹${invoice.balance.toLocaleString()}`);
            return;
        }

        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        setLoading(true);
        try {
            await http.post(`/billing/invoices/${invoice.id}/payments`, {
                amount: paymentAmount,
                paymentMethod,
                paymentDate,
                reference: reference || undefined,
                notes: notes || undefined,
            });

            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setAmount('');
        setPaymentMethod('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setReference('');
        setNotes('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Invoice: {invoice.invoiceNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Customer: {invoice.customerName}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total Amount:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    ₹{invoice.totalAmount.toLocaleString()}
                                </Typography>
                            </Box>
                            {invoice.paidAmount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="success.main">
                                        Paid Amount:
                                    </Typography>
                                    <Typography variant="body2" color="success.main">
                                        ₹{invoice.paidAmount.toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="error.main" fontWeight="bold">
                                    Balance Due:
                                </Typography>
                                <Typography variant="body2" color="error.main" fontWeight="bold">
                                    ₹{invoice.balance.toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            label="Payment Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            inputProps={{ step: '0.01', min: '0.01', max: invoice.balance }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            select
                            label="Payment Method"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        >
                            {PAYMENT_METHODS.map((method) => (
                                <MenuItem key={method} value={method}>
                                    {method}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            label="Payment Date"
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Reference Number"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Cheque/Transaction number"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            multiline
                            rows={2}
                            placeholder="Additional payment notes..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Recording...' : 'Record Payment'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
