import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, Tabs, Tab, Avatar,
  InputAdornment, IconButton, Tooltip,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, AccountBalance, Receipt, People, Close } from '@mui/icons-material';

interface Vyapari { id: number; name: string; phone: string; city: string; type: 'buyer' | 'seller'; balance: number; gst: string; }
interface Transaction { id: number; vyapariId: number; date: string; type: 'debit' | 'credit'; amount: number; description: string; ref: string; }

const SAMPLE_VYAPARIS: Vyapari[] = [
  { id: 1, name: 'Sri Murugan Traders', phone: '9876543210', city: 'Tirupur', type: 'buyer', balance: 45000, gst: '33AABCM1234F1Z5' },
  { id: 2, name: 'Kamatchi Textiles', phone: '9123456789', city: 'Coimbatore', type: 'buyer', balance: -12000, gst: '33AABCK5678F1Z2' },
  { id: 3, name: 'Raja Yarn Suppliers', phone: '9988776655', city: 'Erode', type: 'seller', balance: 0, gst: '33AAABR4321G1Z9' },
];

const SAMPLE_TXN: Transaction[] = [
  { id: 1, vyapariId: 1, date: '2026-09-15', type: 'debit', amount: 85000, description: 'Yarn Supply 40s Count', ref: 'PO-2026-101' },
  { id: 2, vyapariId: 1, date: '2026-09-18', type: 'credit', amount: 40000, description: 'Payment received', ref: 'NEFT-20260918' },
  { id: 3, vyapariId: 2, date: '2026-09-10', type: 'debit', amount: 32000, description: 'Fabric Order', ref: 'PO-2026-98' },
  { id: 4, vyapariId: 2, date: '2026-09-20', type: 'credit', amount: 44000, description: 'Advance payment', ref: 'RTGS-20260920' },
];

const VyapariPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Vyapari | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vyaparis] = useState<Vyapari[]>(SAMPLE_VYAPARIS);
  const [transactions] = useState<Transaction[]>(SAMPLE_TXN);

  const filtered = vyaparis.filter(v => (tab === 0 ? true : tab === 1 ? v.type === 'buyer' : v.type === 'seller') && JSON.stringify(v).toLowerCase().includes(search.toLowerCase()));
  const ledger = selected ? transactions.filter(t => t.vyapariId === selected.id) : [];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Vyapari (B2B) Module</Typography>
          <Typography color="text.secondary">Trade partner management, ledger & payments</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>Add Vyapari</Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Vyaparis', value: vyaparis.length, icon: <People />, color: '#3b82f6' },
          { label: 'Total Receivable', value: `\u20b9${vyaparis.filter(v=>v.balance>0).reduce((s,v)=>s+v.balance,0).toLocaleString('en-IN')}`, icon: <Receipt />, color: '#ef4444' },
          { label: 'Total Payable', value: `\u20b9${Math.abs(vyaparis.filter(v=>v.balance<0).reduce((s,v)=>s+v.balance,0)).toLocaleString('en-IN')}`, icon: <AccountBalance />, color: '#059669' },
        ].map(c => (
          <Grid key={c.label} size={{ xs: 12, sm: 4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
              <Box sx={{ color: c.color, display: 'flex' }}>{c.icon}</Box>
              <Box><Typography variant="body2" color="text.secondary">{c.label}</Typography><Typography variant="h6" fontWeight={800}>{c.value}</Typography></Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: selected ? 5 : 12 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={(_, v) => { setTab(v); setSelected(null); }} sx={{ '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' } }}>
                <Tab label="All" /><Tab label="Buyers" /><Tab label="Sellers" />
              </Tabs>
              <TextField size="small" placeholder="Search\u2026" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }} sx={{ width: 200 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Vyapari</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Balance</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {filtered.map(v => (
                    <TableRow key={v.id} hover selected={selected?.id === v.id} onClick={() => setSelected(v)} sx={{ cursor: 'pointer' }}>
                      <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: v.type === 'buyer' ? 'primary.main' : 'secondary.main', fontSize: '0.8rem' }}>{v.name.charAt(0)}</Avatar><Box><Typography variant="body2" fontWeight={600}>{v.name}</Typography><Typography variant="caption" color="text.secondary">{v.phone}</Typography></Box></Box></TableCell>
                      <TableCell><Typography variant="body2">{v.city}</Typography></TableCell>
                      <TableCell><Chip label={v.type === 'buyer' ? 'Buyer' : 'Seller'} size="small" color={v.type === 'buyer' ? 'primary' : 'secondary'} variant="outlined" /></TableCell>
                      <TableCell align="right"><Typography variant="body2" fontWeight={700} color={v.balance > 0 ? 'error.main' : v.balance < 0 ? 'warning.main' : 'text.secondary'}>{v.balance === 0 ? 'Settled' : `\u20b9${Math.abs(v.balance).toLocaleString('en-IN')}`}</Typography></TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.disabled' }}>No vyaparis found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {selected && (
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box><Typography fontWeight={800}>{selected.name}</Typography><Typography variant="caption" color="text.secondary">Ledger — {selected.city} \u00b7 {selected.gst}</Typography></Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={selected.balance === 0 ? 'Settled' : selected.balance > 0 ? `Receivable \u20b9${selected.balance.toLocaleString('en-IN')}` : `Payable \u20b9${Math.abs(selected.balance).toLocaleString('en-IN')}`} color={selected.balance > 0 ? 'error' : selected.balance < 0 ? 'warning' : 'success'} size="small" />
                  <Tooltip title="Close"><IconButton size="small" onClick={() => setSelected(null)}><Close fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Description</TableCell><TableCell sx={{ fontWeight: 700 }}>Ref</TableCell><TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>Debit</TableCell><TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>Credit</TableCell></TableRow></TableHead>
                  <TableBody>
                    {ledger.map(t => (
                      <TableRow key={t.id} hover>
                        <TableCell>{new Date(t.date).toLocaleDateString('en-IN')}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell><Typography variant="caption" color="text.secondary">{t.ref}</Typography></TableCell>
                        <TableCell align="right">{t.type === 'debit' ? <Typography variant="body2" fontWeight={700} color="error.main">\u20b9{t.amount.toLocaleString('en-IN')}</Typography> : '\u2014'}</TableCell>
                        <TableCell align="right">{t.type === 'credit' ? <Typography variant="body2" fontWeight={700} color="success.main">\u20b9{t.amount.toLocaleString('en-IN')}</Typography> : '\u2014'}</TableCell>
                      </TableRow>
                    ))}
                    {ledger.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.disabled' }}>No transactions found.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', gap: 1.5 }}>
                <Button variant="outlined" size="small" startIcon={<AddIcon />}>Record Payment</Button>
                <Button variant="outlined" size="small" startIcon={<Receipt />}>New Invoice</Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Vyapari</DialogTitle>
        <DialogContent><Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}><TextField label="Name" size="small" fullWidth required /></Grid>
          <Grid size={{ xs: 6 }}><TextField label="Phone" size="small" fullWidth /></Grid>
          <Grid size={{ xs: 6 }}><TextField label="City" size="small" fullWidth /></Grid>
          <Grid size={{ xs: 12 }}><TextField label="GSTIN" size="small" fullWidth /></Grid>
        </Grid></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setDialogOpen(false)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default VyapariPage;
