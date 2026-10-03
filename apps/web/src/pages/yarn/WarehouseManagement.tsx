import React from 'react';
import { Box, Typography, Paper, Grid, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert } from '@mui/material';
import { Refresh as RefreshIcon, Warehouse as WarehouseIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

interface WarehouseLocation {
  id: number;
  zone?: string;
  description?: string;
  active: boolean;
  name: string;
}

interface WarehouseMovement {
  id: number;
  locationId: number;
  location: { name: string };
  itemId: number;
  movementType: string;
  quantity: number;
  referenceId?: string;
  createdAt: string;
}

const WarehouseManagement: React.FC = () => {
  const qc = useQueryClient();

  const { data: locations = [], isLoading: loadingLoc, error: errorLoc } = useQuery<WarehouseLocation[]>({
    queryKey: ['warehouse-locations'],
    queryFn: () => api.get('/warehouse/locations').then(r => r.data),
  });

  const { data: movements = [], isLoading: loadingMov, error: errorMov } = useQuery<WarehouseMovement[]>({
    queryKey: ['warehouse-movements'],
    queryFn: () => api.get('/warehouse/movements').then(r => r.data),
  });

  if (loadingLoc) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (errorLoc || errorMov) return <Alert severity="error">Failed to load warehouse data</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>Warehouse Management</Typography><Typography color="text.secondary">Multi-location stock, bin tracking & transfers</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={() => { qc.invalidateQueries({ queryKey: ['warehouse-locations'] }); qc.invalidateQueries({ queryKey: ['warehouse-movements'] }); }}>Refresh</Button>
        </Box>
      </Box>

      {/* Warehouse Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {locations.length === 0 ? (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">No warehouse locations configured. Add locations via Settings or the API.</Alert>
          </Grid>
        ) : locations.map(w => {
          return (
            <Grid key={w.id} size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><WarehouseIcon color="primary" /><Typography fontWeight={800}>{w.name}</Typography></Box>
                  <Chip label={w.zone ?? 'No zone'} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary">{w.description ?? 'No description'}</Typography>
                <Typography variant="caption">{w.active ? 'Active location' : 'Inactive location'}</Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Movement Log */}
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight={700}>Recent Stock Movements</Typography>
          {loadingMov && <CircularProgress size={16} />}
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Item ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>No movement records yet</TableCell></TableRow>
              ) : movements.map(m => (
                <TableRow key={m.id} hover>
                  <TableCell><Typography variant="body2" fontWeight={600}>{m.itemId}</Typography></TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{m.location?.name}</Typography></TableCell>
                  <TableCell><Chip label={m.movementType} size="small" color={m.movementType === 'IN' ? 'success' : m.movementType === 'OUT' ? 'error' : 'default'} variant="outlined" /></TableCell>
                  <TableCell align="right"><Typography variant="body2" fontWeight={700}>{m.quantity.toLocaleString('en-IN')}</Typography></TableCell>
                  <TableCell>{m.referenceId || '—'}</TableCell>
                  <TableCell><Typography variant="body2" color="text.secondary">{new Date(m.createdAt).toLocaleDateString('en-IN')}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default WarehouseManagement;
