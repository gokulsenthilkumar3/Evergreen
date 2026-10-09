import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { http } from '../../lib/http';

interface InvoiceHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    invoiceId: string;
    invoiceNumber: string;
}

interface HistoryEntry {
    id: string;
    action: string;
    description: string | null;
    performedBy: string | null;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: any }> = {
    CREATED: { label: 'Created', color: 'success' },
    UPDATED: { label: 'Updated', color: 'info' },
    STATUS_CHANGED: { label: 'Status Changed', color: 'warning' },
    PAYMENT_RECEIVED: { label: 'Payment Received', color: 'success' },
    VIEWED: { label: 'Viewed', color: 'default' },
    DOWNLOADED: { label: 'Downloaded', color: 'primary' },
    SENT: { label: 'Sent', color: 'info' },
    REMINDER_SENT: { label: 'Reminder Sent', color: 'warning' },
};

export default function InvoiceHistoryDialog({
    open,
    onClose,
    invoiceId,
    invoiceNumber,
}: InvoiceHistoryDialogProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (open && invoiceId) {
            fetchHistory();
        }
    }, [open, invoiceId]);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await http.get(`/billing/invoices/${invoiceId}/history`);
            setHistory(response.data.history);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const getActionConfig = (action: string) => {
        return ACTION_LABELS[action] || { label: action, color: 'default' };
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Invoice History
                <Typography variant="body2" color="text.secondary">
                    {invoiceNumber}
                </Typography>
            </DialogTitle>
            <DialogContent>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && history.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                        No history available for this invoice
                    </Typography>
                )}

                {!loading && !error && history.length > 0 && (
                    <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date & Time</TableCell>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Performed By</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((entry) => {
                                    const actionConfig = getActionConfig(entry.action);
                                    return (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                                                    {formatDate(entry.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={actionConfig.label}
                                                    color={actionConfig.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {entry.description || '-'}
                                                </Typography>
                                                {entry.oldValue && entry.newValue && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Changed from "{entry.oldValue}" to "{entry.newValue}"
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {entry.performedBy || 'System'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
