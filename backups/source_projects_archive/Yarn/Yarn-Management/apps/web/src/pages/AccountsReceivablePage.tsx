import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import { http } from '../lib/http';
import { notify } from '../context/NotificationContext';

type ArCustomer = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  creditLimit?: any;
  totalOutstanding: number;
  aging: {
    d30: number;
    d60: number;
    d90: number;
  };
};

type FollowUp = {
  id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate?: string | null;
  notes?: string | null;
  customer?: { id: string; name: string };
  invoice?: { id: string; invoiceNumber: string } | null;
  createdAt: string;
};

export default function AccountsReceivablePage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<ArCustomer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const [openFollowUp, setOpenFollowUp] = useState(false);
  const [newFollowUp, setNewFollowUp] = useState({
    customerId: '',
    dueDate: '',
    notes: '',
    invoiceId: '',
  });

  async function load() {
    setLoading(true);
    try {
      const [custRes, fuRes] = await Promise.all([
        http.get('/billing/ar/customers'),
        http.get('/billing/ar/follow-ups', { params: { status: 'OPEN' } }),
      ]);
      setCustomers(custRes.data.customers || []);
      setFollowUps(fuRes.data.followUps || []);
    } catch (e) {
      console.error(e);
      notify.showError('Failed to load Accounts Receivable data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const totalOutstanding = customers.reduce((sum, c) => sum + Number(c.totalOutstanding || 0), 0);
    const d30 = customers.reduce((sum, c) => sum + Number(c.aging?.d30 || 0), 0);
    const d60 = customers.reduce((sum, c) => sum + Number(c.aging?.d60 || 0), 0);
    const d90 = customers.reduce((sum, c) => sum + Number(c.aging?.d90 || 0), 0);
    return { totalOutstanding, d30, d60, d90 };
  }, [customers]);

  async function handleCreateFollowUp() {
    if (!newFollowUp.customerId) {
      notify.showError('Please select a customer');
      return;
    }

    try {
      await http.post('/billing/ar/follow-ups', {
        customerId: newFollowUp.customerId,
        invoiceId: newFollowUp.invoiceId || undefined,
        dueDate: newFollowUp.dueDate ? new Date(newFollowUp.dueDate).toISOString() : undefined,
        notes: newFollowUp.notes || undefined,
      });
      notify.showSuccess('Follow-up task created');
      setOpenFollowUp(false);
      setNewFollowUp({ customerId: '', dueDate: '', notes: '', invoiceId: '' });
      load();
    } catch (e) {
      console.error(e);
      notify.showError('Failed to create follow-up');
    }
  }

  const statusColor = (status: FollowUp['status']) => {
    switch (status) {
      case 'OPEN':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Accounts Receivable</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={load}>Refresh</Button>
          <Button variant="contained" onClick={() => setOpenFollowUp(true)}>Create Follow-up</Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL OUTSTANDING</Typography>
          <Typography variant="h6" fontWeight="bold">₹{totals.totalOutstanding.toLocaleString()}</Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">0-30 DAYS</Typography>
          <Typography variant="h6" fontWeight="bold">₹{totals.d30.toLocaleString()}</Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">31-60 DAYS</Typography>
          <Typography variant="h6" fontWeight="bold">₹{totals.d60.toLocaleString()}</Typography>
        </Card>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">61+ DAYS</Typography>
          <Typography variant="h6" fontWeight="bold">₹{totals.d90.toLocaleString()}</Typography>
        </Card>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Typography variant="h6" sx={{ mb: 1 }}>Customer Ledger Summary</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0', mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Outstanding</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>0-30</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>31-60</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>61+</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Credit Limit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No customers found</TableCell></TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Box>
                      <Typography fontWeight={600}>{c.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.phone || c.email || '-'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>₹{Number(c.totalOutstanding || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(c.aging?.d30 || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(c.aging?.d60 || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(c.aging?.d90 || 0).toLocaleString()}</TableCell>
                  <TableCell>{c.creditLimit ? `₹${Number(c.creditLimit).toLocaleString()}` : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mb: 1 }}>Open Follow-ups</Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {followUps.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">No open follow-ups</TableCell></TableRow>
            ) : (
              followUps.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell>{f.customer?.name || '-'}</TableCell>
                  <TableCell>{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={f.status} color={statusColor(f.status) as any} />
                  </TableCell>
                  <TableCell>{f.notes || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openFollowUp} onClose={() => setOpenFollowUp(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Follow-up Task</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Customer"
              value={newFollowUp.customerId}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, customerId: e.target.value })}
              fullWidth
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Due Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={newFollowUp.dueDate}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })}
              fullWidth
            />
            <TextField
              label="Invoice ID (Optional)"
              value={newFollowUp.invoiceId}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, invoiceId: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={newFollowUp.notes}
              onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFollowUp(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateFollowUp}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
