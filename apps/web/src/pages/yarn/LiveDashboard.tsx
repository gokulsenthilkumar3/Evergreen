import React from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

type Machine = { id: number; name: string; type: string; serialNo?: string | null; active: boolean };
type Inspection = { id: number; machine: { name: string }; type: string; status: string; date: string };

const LiveDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const machines = useQuery<Machine[]>({ queryKey: ['machines'], queryFn: () => api.get('/machines').then(response => response.data) });
  const inspections = useQuery<Inspection[]>({ queryKey: ['machine-inspections'], queryFn: () => api.get('/machines/inspections').then(response => response.data) });
  const data = machines.data || [];
  const openInspections = (inspections.data || []).filter(item => !['RESOLVED', 'CLOSED'].includes(item.status.toUpperCase()));
  return <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3 }}><Box><Typography variant="h4" fontWeight={800}>Machine Status Overview</Typography><Typography color="text.secondary">Current machine registry and recorded inspection status.</Typography></Box><Button startIcon={<RefreshIcon />} onClick={() => { void queryClient.invalidateQueries({ queryKey: ['machines'] }); void queryClient.invalidateQueries({ queryKey: ['machine-inspections'] }); }}>Refresh</Button></Box>
    {(machines.error || inspections.error) && <Alert severity="error" sx={{ mb: 2 }}>Could not load all machine status data.</Alert>}
    {machines.isLoading || inspections.isLoading ? <CircularProgress aria-label="Loading machine data" /> : <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[['Registered machines', data.length], ['Active', data.filter(machine => machine.active).length], ['Inactive', data.filter(machine => !machine.active).length], ['Open inspections', openInspections.length]].map(([label, value]) => <Grid key={String(label)} size={{ xs: 6, md: 3 }}><Card variant="outlined"><CardContent><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={800}>{value}</Typography></CardContent></Card></Grid>)}
      </Grid>
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}><Table size="small"><TableHead><TableRow><TableCell>Machine</TableCell><TableCell>Type</TableCell><TableCell>Serial no.</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>
        {data.map(machine => <TableRow key={machine.id}><TableCell>{machine.name}</TableCell><TableCell>{machine.type}</TableCell><TableCell>{machine.serialNo || '—'}</TableCell><TableCell><Chip size="small" label={machine.active ? 'Active' : 'Inactive'} color={machine.active ? 'success' : 'default'} /></TableCell></TableRow>)}
        {!data.length && <TableRow><TableCell colSpan={4} align="center">No machines have been registered.</TableCell></TableRow>}
      </TableBody></Table></Paper>
      <Typography variant="caption" color="text.secondary">This overview reflects the latest loaded records. Runtime telemetry, OEE, spindle counts and automatic refresh are not connected.</Typography>
    </>}
  </Box>;
};

export default LiveDashboard;
