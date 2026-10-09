import React from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

type Receipt = {
  id: number;
  receiptNo: string;
  supplierName: string;
  date: string;
  total: number;
  referenceNumber?: string | null;
};

const SupplierPortal: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: receipts = [], isLoading, error } = useQuery<Receipt[]>({
    queryKey: ['inward-receipts'],
    queryFn: () => api.get('/commerce/inward-receipts').then((r) => r.data),
  });

  const suppliers = [...new Set(receipts.map((r) => r.supplierName).filter(Boolean))].sort();
  const totalReceived = receipts.reduce((sum, r) => sum + Number(r.total ?? 0), 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Supplier Activity
          </Typography>
          <Typography color="text.secondary">
            Supplier names and receipt values from posted inward receipts.
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          onClick={() => queryClient.invalidateQueries({ queryKey: ['inward-receipts'] })}
        >
          Refresh
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        This view uses saved receipt records. Supplier scoring, onboarding and purchase orders
        are not provided by the current API. Post or correct receipts in Operations Desk.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load supplier receipts.
        </Alert>
      )}

      {isLoading ? (
        <CircularProgress aria-label="Loading supplier receipts" />
      ) : (
        <>
          {/* Summary cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Paper variant="outlined" sx={{ p: 2, minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary">
                Suppliers in receipts
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {suppliers.length}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary">
                Posted receipts
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {receipts.length}
              </Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, minWidth: 180 }}>
              <Typography variant="caption" color="text.secondary">
                Recorded receipt value
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                ₹{totalReceived.toLocaleString('en-IN')}
              </Typography>
            </Paper>
          </Box>

          {/* Receipts table */}
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Supplier</TableCell>
                  <TableCell>Receipt</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{receipt.supplierName}</TableCell>
                    <TableCell>{receipt.receiptNo}</TableCell>
                    <TableCell>
                      {new Date(receipt.date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>{receipt.referenceNumber ?? '—'}</TableCell>
                    <TableCell align="right">
                      ₹{Number(receipt.total).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
                {!receipts.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      No supplier receipts have been recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default SupplierPortal;
