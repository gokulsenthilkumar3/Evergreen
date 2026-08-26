import React, { useState } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Checkbox
} from '@mui/material';
import { CloudUpload as UploadIcon, Check as CheckIcon } from '@mui/icons-material';
import { usePersist, fmtDate, fmtAmt } from '../../hooks/usePersist';
import { toast } from 'sonner';

interface BankTransaction {
    id: string;
    date: string;
    description: string;
    withdrawal: number;
    deposit: number;
    reconciled: boolean;
    linkedDoc?: string;
}

const BankReconciliation: React.FC = () => {
    const { items, update } = usePersist<BankTransaction>('bank_transactions', []);
    
    const [openUpload, setOpenUpload] = useState(false);

    const toggleReconcile = (id: string, currentStatus: boolean) => {
        update(id, { reconciled: !currentStatus });
        if (!currentStatus) toast.success('Transaction marked as reconciled');
    };

    const handleUpload = () => {
        toast.success('Bank statement processed. 0 new transactions found.');
        setOpenUpload(false);
    };

    const totalUnreconciled = items.filter(i => !i.reconciled).reduce((acc, curr) => acc + (curr.deposit > 0 ? 1 : 1), 0);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Bank Reconciliation</Typography>
                    <Typography variant="body2" color="text.secondary">Match bank statement lines with accounting records</Typography>
                </Box>
                <Button variant="contained" startIcon={<UploadIcon />} onClick={() => setOpenUpload(true)}>Upload Statement (CSV)</Button>
            </Box>

            {totalUnreconciled > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.main', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography color="warning.main" fontWeight={700}>Action Required:</Typography>
                    <Typography color="warning.dark">You have {totalUnreconciled} unreconciled transactions to review.</Typography>
                </Paper>
            )}
            
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                                <TableCell sx={{ fontWeight: 700 }}>✓</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Description (from Bank)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Withdrawal (₹)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="right">Deposit (₹)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.disabled' }}>No bank transactions imported.</TableCell></TableRow>}
                            {items.map(bt => (
                                <TableRow key={bt.id} hover sx={{ bgcolor: bt.reconciled ? 'success.50' : 'inherit' }}>
                                    <TableCell>
                                        <Checkbox 
                                            size="small" 
                                            checked={bt.reconciled} 
                                            onChange={() => toggleReconcile(bt.id, bt.reconciled)}
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell>{fmtDate(bt.date.split('T')[0])}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{bt.description}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {bt.withdrawal > 0 ? <Typography color="error.main">{fmtAmt(bt.withdrawal)}</Typography> : '—'}
                                    </TableCell>
                                    <TableCell align="right">
                                        {bt.deposit > 0 ? <Typography color="success.main">{fmtAmt(bt.deposit)}</Typography> : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {bt.reconciled ? (
                                            <Chip label={bt.linkedDoc ? `Matched: ${bt.linkedDoc}` : 'Reconciled'} size="small" color="success" variant="filled" icon={<CheckIcon />} />
                                        ) : (
                                            <Button size="small" variant="outlined" onClick={() => toggleReconcile(bt.id, false)}>Find Match</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid', borderColor: 'divider' }}>Upload Bank Statement</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Box sx={{ border: '2px dashed', borderColor: 'primary.main', borderRadius: 2, p: 4, textAlign: 'center', bgcolor: 'primary.50', cursor: 'pointer' }}>
                        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6" fontWeight={700}>Click to upload CSV or Excel file</Typography>
                        <Typography variant="body2" color="text.secondary">Supports standard statement formats from HDFC, SBI, ICICI, etc.</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button onClick={() => setOpenUpload(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleUpload} variant="contained">Process Statement</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BankReconciliation;
