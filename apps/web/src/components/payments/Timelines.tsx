import React from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar
} from '@mui/material';
import { usePersist, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { ArrowUpward as ArrowUpIcon, ArrowDownward as ArrowDownIcon } from '@mui/icons-material';

interface TimelineEvent {
    id: string;
    date: string;
    type: 'Payment Received' | 'Payment Sent' | 'Invoice Generated' | 'Credit Note Applied';
    amount: number;
    reference: string;
    customerOrVendor: string;
}

const Timelines: React.FC = () => {
    const { items: events } = usePersist<TimelineEvent>('payment-timelines', []);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Payment Timelines</Typography>
                <Typography variant="body2" color="text.secondary">A chronological view of all financial activities</Typography>
            </Box>

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Activity</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Party</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.disabled' }}>
                                        No timeline events recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                            {events.map(ev => {
                                const isPositive = ev.type === 'Payment Received' || ev.type === 'Invoice Generated';
                                return (
                                    <TableRow key={ev.id} hover>
                                        <TableCell>
                                            <Typography variant="body2">{fmtDate(ev.date.split('T')[0])}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(ev.date).toLocaleTimeString()}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 24, height: 24, bgcolor: isPositive ? 'success.50' : 'error.50' }}>
                                                    {isPositive ? <ArrowUpIcon color="success" sx={{ fontSize: 16 }} /> : <ArrowDownIcon color="error" sx={{ fontSize: 16 }} />}
                                                </Avatar>
                                                <Typography variant="body2" fontWeight={600}>{ev.type}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{ev.customerOrVendor}</TableCell>
                                        <TableCell><Chip label={ev.reference} size="small" variant="outlined" /></TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight={700} color={isPositive ? 'success.main' : 'error.main'}>
                                                {isPositive ? '+' : '-'}{fmtAmt(ev.amount)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default Timelines;
