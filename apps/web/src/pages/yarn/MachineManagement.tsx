import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, CircularProgress, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

interface Machine {
  id: number;
  serialNo?: string;
  name: string;
  type: string;
  manufacturer?: string;
  active: boolean;
  purchasedAt?: string;
  inspections?: { type: string; date: string; createdBy?: string }[];
}

interface MachineInspection {
  id: number;
  machineId: number;
  machine: { name: string; type: string };
  type: string;
  description?: string;
  status: string;
  createdBy?: string;
  date: string;
  resolvedAt?: string;
}

const MachineManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  const qc = useQueryClient();

  const { data: machines = [], isLoading: loadingMachines, error } = useQuery<Machine[]>({
    queryKey: ['machines'],
    queryFn: () => api.get('/machines').then(r => r.data),
  });

  const { data: inspections = [], isLoading: loadingInsp, error: inspectionError } = useQuery<MachineInspection[]>({
    queryKey: ['machine-inspections'],
    queryFn: () => api.get('/machines/inspections').then(r => r.data),
  });

  const active = machines.filter(m => m.active).length;
  const underMaint = inspections.filter(i => i.status !== 'COMPLETED').length;
  const inactive = machines.filter(m => !m.active).length;

  if (error || inspectionError) return <Alert severity="error">Failed to load machine data</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>Machine Management</Typography><Typography color="text.secondary">Machine registry & maintenance</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={() => { qc.invalidateQueries({ queryKey: ['machines'] }); qc.invalidateQueries({ queryKey: ['machine-inspections'] }); }}>Refresh</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loadingMachines ? <Grid size={{ xs: 12 }}><CircularProgress size={24} /></Grid> : (
          [['Total Machines', machines.length, '#3b82f6'], ['Active', active, '#059669'], ['Open Inspections', underMaint, '#ef4444'], ['Inactive', inactive, '#8b5cf6']].map(([l, v, c]) => (
            <Grid key={String(l)} size={{ xs: 6, md: 3 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">{l}</Typography>
                  <Typography variant="h5" fontWeight={800} color={c as string}>{v}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          <Tab label="Machine Registry" /><Tab label="Maintenance Log" />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Serial No</TableCell><TableCell sx={{ fontWeight: 700 }}>Name</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Manufacturer</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Purchased</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingMachines ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                ) : machines.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>No machines registered yet</TableCell></TableRow>
                ) : machines.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell><Chip label={m.serialNo ?? '?'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{m.name}</Typography></TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.manufacturer ?? '—'}</TableCell>
                    <TableCell align="right">{m.purchasedAt ? new Date(m.purchasedAt).toLocaleDateString('en-IN') : '—'}</TableCell>
                    <TableCell><Chip label={m.active ? 'Active' : 'Inactive'} size="small" color={m.active ? 'success' : 'default'} variant="outlined" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {tab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Machine</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Description</TableCell><TableCell sx={{ fontWeight: 700 }}>Recorded By</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Resolved</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingInsp ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                ) : inspections.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>No maintenance records yet</TableCell></TableRow>
                ) : inspections.map(i => (
                  <TableRow key={i.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{i.machine?.name}</Typography></TableCell>
                    <TableCell><Chip label={i.type} size="small" color={i.type === 'BREAKDOWN' ? 'error' : 'info'} variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{i.description ?? '—'}</Typography></TableCell>
                    <TableCell>{i.createdBy ?? '—'}</TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{new Date(i.date).toLocaleDateString('en-IN')}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{i.resolvedAt ? new Date(i.resolvedAt).toLocaleDateString('en-IN') : '—'}</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
export default MachineManagement;
