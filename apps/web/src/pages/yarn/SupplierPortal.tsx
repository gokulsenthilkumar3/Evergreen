import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, LinearProgress, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
const SUPPLIERS = [
  { id: 1, name: 'Sri Venkateswara Cotton', contact: 'Rajan K.', phone: '9876543210', city: 'Karur', rating: 92, onTime: 94, quality: 89, category: 'Raw Cotton', status: 'Preferred' },
  { id: 2, name: 'Murugan Fibre Traders', contact: 'Anand S.', phone: '9123456789', city: 'Coimbatore', rating: 78, onTime: 72, quality: 85, category: 'Fibre', status: 'Active' },
  { id: 3, name: 'Global Packing Solutions', contact: 'Priya M.', phone: '9988776655', city: 'Chennai', rating: 85, onTime: 88, quality: 80, category: 'Packing', status: 'Active' },
  { id: 4, name: 'Tech Spare Parts Co.', contact: 'Babu L.', phone: '9567891234', city: 'Tirupur', rating: 64, onTime: 60, quality: 70, category: 'Spares', status: 'Warning' },
];
const PO_LIST = [
  { id: 'PO-2026-001', supplier: 'Sri Venkateswara Cotton', date: '2026-09-10', item: 'Raw Cotton 28mm', qty: '2000 kg', value: 180000, status: 'Delivered' },
  { id: 'PO-2026-002', supplier: 'Murugan Fibre Traders', date: '2026-09-15', item: 'Polyester Fibre', qty: '500 kg', value: 65000, status: 'In Transit' },
  { id: 'PO-2026-003', supplier: 'Global Packing Solutions', date: '2026-09-20', item: 'BOPP Bags', qty: '200 rolls', value: 24000, status: 'Pending' },
];
const SupplierPortal: React.FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>Supplier Portal</Typography><Typography color="text.secondary">Supplier onboarding, performance tracking & PO management</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button><Button variant="contained" startIcon={<AddIcon />} size="small">Add Supplier</Button></Box>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Total Suppliers', SUPPLIERS.length, '#3b82f6'],['Preferred', SUPPLIERS.filter(s=>s.status==='Preferred').length, '#059669'],['Warning', SUPPLIERS.filter(s=>s.status==='Warning').length, '#ef4444'],['Avg Rating', `${Math.round(SUPPLIERS.reduce((s,x)=>s+x.rating,0)/SUPPLIERS.length)}%`, '#8b5cf6']].map(([l,v,c])=>(
          <Grid key={String(l)} size={{ xs: 6, md: 3 }}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent sx={{ py: 1.5 }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={800} color={c as string}>{v}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          <Tab label="Supplier Directory" /><Tab label="Purchase Orders" />
        </Tabs>
        {tab === 0 && (
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell><TableCell sx={{ fontWeight: 700 }}>Category</TableCell><TableCell sx={{ fontWeight: 700 }}>City</TableCell><TableCell sx={{ fontWeight: 700 }}>Overall Rating</TableCell><TableCell sx={{ fontWeight: 700 }}>On-Time %</TableCell><TableCell sx={{ fontWeight: 700 }}>Quality %</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
            <TableBody>{SUPPLIERS.map(s=>(
              <TableRow key={s.id} hover>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{s.name.charAt(0)}</Avatar><Box><Typography variant="body2" fontWeight={700}>{s.name}</Typography><Typography variant="caption" color="text.secondary">{s.contact} \u00b7 {s.phone}</Typography></Box></Box></TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>{s.city}</TableCell>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinearProgress variant="determinate" value={s.rating} color={s.rating>85?'success':s.rating>70?'warning':'error'} sx={{ flex: 1, borderRadius: 2, maxWidth: 80 }} /><Typography variant="caption">{s.rating}%</Typography></Box></TableCell>
                <TableCell><Chip label={`${s.onTime}%`} size="small" color={s.onTime>85?'success':s.onTime>70?'warning':'error'} variant="outlined" /></TableCell>
                <TableCell><Chip label={`${s.quality}%`} size="small" color={s.quality>85?'success':s.quality>70?'warning':'error'} variant="outlined" /></TableCell>
                <TableCell><Chip label={s.status} size="small" color={s.status==='Preferred'?'success':s.status==='Warning'?'error':'info'} variant="outlined" /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></TableContainer>
        )}
        {tab === 1 && (
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>PO Number</TableCell><TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Item</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Value</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
            <TableBody>{PO_LIST.map(p=>(
              <TableRow key={p.id} hover>
                <TableCell><Typography variant="body2" fontWeight={700} color="primary.main">{p.id}</Typography></TableCell>
                <TableCell>{p.supplier}</TableCell>
                <TableCell>{new Date(p.date).toLocaleDateString('en-IN')}</TableCell>
                <TableCell>{p.item} ({p.qty})</TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={700}>\u20b9{p.value.toLocaleString('en-IN')}</Typography></TableCell>
                <TableCell><Chip label={p.status} size="small" color={p.status==='Delivered'?'success':p.status==='In Transit'?'info':'warning'} variant="outlined" /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></TableContainer>
        )}
      </Paper>
    </Box>
  );
};
export default SupplierPortal;
