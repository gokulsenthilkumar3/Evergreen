import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Warehouse as WarehouseIcon } from '@mui/icons-material';

const WAREHOUSES = [
  { id: 'WH-A', name: 'Main Store', location: 'Building A, Ground Floor', capacity: 5000, used: 3750, type: 'Raw Material' },
  { id: 'WH-B', name: 'Finished Goods', location: 'Building B, 1st Floor', capacity: 3000, used: 1800, type: 'Finished Goods' },
  { id: 'WH-C', name: 'Transit Store', location: 'Gate 2 Area', capacity: 1000, used: 420, type: 'Transit' },
];
const STOCK = [
  { id: 1, item: 'Raw Cotton — 28mm', wh: 'WH-A', qty: 1200, uom: 'kg', minStock: 500, status: 'OK' },
  { id: 2, item: 'Yarn 40s — Cone', wh: 'WH-B', qty: 450, uom: 'cones', minStock: 200, status: 'OK' },
  { id: 3, item: 'Yarn 30s — Cone', wh: 'WH-B', qty: 120, uom: 'cones', minStock: 200, status: 'Low' },
  { id: 4, item: 'Polyester Fibre', wh: 'WH-A', qty: 800, uom: 'kg', minStock: 300, status: 'OK' },
  { id: 5, item: 'Packing Material', wh: 'WH-C', qty: 40, uom: 'rolls', minStock: 100, status: 'Critical' },
];
const WarehouseManagement: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box><Typography variant="h4" fontWeight={800}>Warehouse Management</Typography><Typography color="text.secondary">Multi-location stock, bin tracking & transfers</Typography></Box>
      <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button><Button variant="contained" startIcon={<AddIcon />} size="small">Stock Transfer</Button></Box>
    </Box>
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {WAREHOUSES.map(w => (
        <Grid key={w.id} size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarehouseIcon color="primary" /><Typography fontWeight={800}>{w.name}</Typography></Box>
              <Chip label={w.id} size="small" variant="outlined" />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{w.location}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Type: {w.type}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Capacity Used</Typography>
              <Typography variant="caption" fontWeight={700}>{w.used}/{w.capacity} kg</Typography>
            </Box>
            <LinearProgress variant="determinate" value={(w.used/w.capacity)*100} color={(w.used/w.capacity)>0.85?'error':(w.used/w.capacity)>0.7?'warning':'success'} sx={{ borderRadius: 2 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}><Typography fontWeight={700}>Current Stock Levels</Typography></Box>
      <TableContainer><Table size="small">
        <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
          <TableCell sx={{ fontWeight: 700 }}>Item</TableCell><TableCell sx={{ fontWeight: 700 }}>Warehouse</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Qty</TableCell><TableCell sx={{ fontWeight: 700 }}>UOM</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Min Stock</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
        </TableRow></TableHead>
        <TableBody>{STOCK.map(s=>(
          <TableRow key={s.id} hover>
            <TableCell><Typography variant="body2" fontWeight={600}>{s.item}</Typography></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{s.wh}</Typography></TableCell>
            <TableCell align="right"><Typography variant="body2" fontWeight={700}>{s.qty.toLocaleString('en-IN')}</Typography></TableCell>
            <TableCell>{s.uom}</TableCell>
            <TableCell align="right">{s.minStock.toLocaleString('en-IN')}</TableCell>
            <TableCell><Chip label={s.status} size="small" color={s.status==='OK'?'success':s.status==='Low'?'warning':'error'} variant="outlined" /></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table></TableContainer>
    </Paper>
  </Box>
);
export default WarehouseManagement;
