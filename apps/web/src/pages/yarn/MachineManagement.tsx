import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Avatar, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Build as BuildIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

interface Machine {
  id: number;
  code: string;
  name: string;
  type: string;
  brand?: string;
  spindles?: number;
  status?: string;
  installDate?: string;
  inspections?: { type: string; inspectedAt: string; technician?: string }[];
}

interface MachineInspection {
  id: number;
  machineId: number;
  machine: { code: string; name: string };
  type: string;
  description?: string;
  technician?: string;
  inspectedAt: string;
  nextDueAt?: string;
}

const MachineManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  const qc = useQueryClient();

  const { data: machines = [], isLoading: loadingMachines, error } = useQuery<Machine[]>({
    queryKey: ['machines'],
    queryFn: () => api.get('/machines').then(r => r.data),
  });

  const { data: inspections = [], isLoading: loadingInsp } = useQuery<MachineInspection[]>({
    queryKey: ['machine-inspections'],
    queryFn: () => api.get('/machines/inspections').then(r => r.data),
  });

  const active = machines.filter(m => m.status === 'Active').length;
  const underMaint = machines.filter(m => m.status === 'Under Maintenance').length;
  const totalSpindles = machines.reduce((s, m) => s + (m.spindles ?? 0), 0);

  if (error) return <Alert severity="error">Failed to load machine data</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>Machine Management</Typography><Typography color="text.secondary">Machine registry, capacity & maintenance</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={() => { qc.invalidateQueries({ queryKey: ['machines'] }); qc.invalidateQueries({ queryKey: ['machine-inspections'] }); }}>Refresh</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loadingMachines ? <Grid size={{ xs: 12 }}><CircularProgress size={24} /></Grid> : (
          [['Total Machines', machines.length, '#3b82f6'], ['Active', active, '#059669'], ['Under Maintenance', underMaint, '#ef4444'], ['Total Spindles', totalSpindles, '#8b5cf6']].map(([l, v, c]) => (
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
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell><TableCell sx={{ fontWeight: 700 }}>Name</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Brand</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Spindles</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingMachines ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                ) : machines.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>No machines registered yet</TableCell></TableRow>
                ) : machines.map(m => (
                  <TableRow key={m.id} hover>
                    <TableCell><Chip label={m.code} size="small" variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{m.name}</Typography></TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.brand ?? '—'}</TableCell>
                    <TableCell align="right">{m.spindles?.toLocaleString('en-IN') ?? '—'}</TableCell>
                    <TableCell><Chip label={m.status ?? 'Active'} size="small" color={m.status === 'Active' ? 'success' : m.status === 'Under Maintenance' ? 'warning' : 'default'} variant="outlined" /></TableCell>
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
                  <TableCell sx={{ fontWeight: 700 }}>Machine</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Description</TableCell><TableCell sx={{ fontWeight: 700 }}>Technician</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Next Due</TableCell>
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
                    <TableCell><Chip label={i.type} size="small" color={i.type === 'Breakdown' ? 'error' : 'info'} variant="outlined" /></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{i.description ?? '—'}</Typography></TableCell>
                    <TableCell>{i.technician ?? '—'}</TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{new Date(i.inspectedAt).toLocaleDateString('en-IN')}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color={i.nextDueAt && new Date(i.nextDueAt) < new Date() ? 'error.main' : 'text.secondary'}>{i.nextDueAt ? new Date(i.nextDueAt).toLocaleDateString('en-IN') : '—'}</Typography></TableCell>
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
