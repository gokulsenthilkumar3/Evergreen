import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Avatar } from '@mui/material';
import { Add as AddIcon, Build as BuildIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const MACHINES = [
  { id: 'MC-01', name: 'Ring Frame A-01', type: 'Ring Frame', brand: 'LMW', spindles: 400, count: '40s / 30s', status: 'Active', installDate: '2020-03-15', lastMaint: '2026-08-01', nextMaint: '2026-11-01' },
  { id: 'MC-02', name: 'Ring Frame A-02', type: 'Ring Frame', brand: 'Rieter', spindles: 400, count: '30s / 40s', status: 'Active', installDate: '2021-06-10', lastMaint: '2026-07-15', nextMaint: '2026-10-15' },
  { id: 'MC-03', name: 'Ring Frame B-01', type: 'Ring Frame', brand: 'LMW', spindles: 360, count: '60s', status: 'Under Maintenance', installDate: '2019-01-20', lastMaint: '2026-09-20', nextMaint: '2026-12-20' },
  { id: 'MC-04', name: 'Winding M-01', type: 'Winder', brand: 'Savio', spindles: 120, count: 'All counts', status: 'Active', installDate: '2022-02-28', lastMaint: '2026-09-01', nextMaint: '2026-12-01' },
  { id: 'MC-05', name: 'TFO Machine-01', type: 'TFO', brand: 'Volkmann', spindles: 64, count: '2/60', status: 'Active', installDate: '2023-07-05', lastMaint: '2026-09-10', nextMaint: '2026-12-10' },
];
const MAINT_LOG = [
  { id: 1, machineId: 'MC-01', date: '2026-08-01', type: 'Preventive', desc: 'Roller change, bearing lubrication', tech: 'Suresh' },
  { id: 2, machineId: 'MC-03', date: '2026-09-20', type: 'Breakdown', desc: 'Spindle bearing replacement', tech: 'Ravi' },
  { id: 3, machineId: 'MC-02', date: '2026-07-15', type: 'Preventive', desc: 'Full spindle alignment', tech: 'Murugan' },
];

const MachineManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>Machine Management</Typography><Typography color="text.secondary">Machine registry, capacity & maintenance</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button><Button variant="contained" startIcon={<AddIcon />} size="small">Add Machine</Button></Box>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Total Machines', MACHINES.length, '#3b82f6'],['Active', MACHINES.filter(m=>m.status==='Active').length, '#059669'],['Under Maintenance', MACHINES.filter(m=>m.status==='Under Maintenance').length, '#ef4444'],['Total Spindles', MACHINES.reduce((s,m)=>s+m.spindles,0), '#8b5cf6']].map(([l,v,c])=>(
          <Grid key={String(l)} size={{ xs: 6, md: 3 }}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent sx={{ py: 1.5 }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={800} color={c as string}>{v}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          <Tab label="Machine List" /><Tab label="Maintenance Log" />
        </Tabs>
        {tab === 0 && (
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Machine</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Brand</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Spindles</TableCell><TableCell sx={{ fontWeight: 700 }}>Counts</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell><TableCell sx={{ fontWeight: 700 }}>Next Maintenance</TableCell>
            </TableRow></TableHead>
            <TableBody>{MACHINES.map(m=>(
              <TableRow key={m.id} hover>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.7rem', fontWeight: 700 }}>{m.id.split('-')[1]}</Avatar><Box><Typography variant="body2" fontWeight={700}>{m.name}</Typography><Typography variant="caption" color="text.secondary">{m.id}</Typography></Box></Box></TableCell>
                <TableCell>{m.type}</TableCell>
                <TableCell>{m.brand}</TableCell>
                <TableCell align="right">{m.spindles}</TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{m.count}</Typography></TableCell>
                <TableCell><Chip label={m.status} size="small" color={m.status==='Active'?'success':'error'} variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" color={new Date(m.nextMaint) < new Date() ? 'error.main' : 'text.secondary'}>{new Date(m.nextMaint).toLocaleDateString('en-IN')}</Typography></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></TableContainer>
        )}
        {tab === 1 && (
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Machine</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Type</TableCell><TableCell sx={{ fontWeight: 700 }}>Description</TableCell><TableCell sx={{ fontWeight: 700 }}>Technician</TableCell>
            </TableRow></TableHead>
            <TableBody>{MAINT_LOG.map(l=>(
              <TableRow key={l.id} hover>
                <TableCell><Typography variant="body2" fontWeight={700} color="primary.main">{l.machineId}</Typography></TableCell>
                <TableCell>{new Date(l.date).toLocaleDateString('en-IN')}</TableCell>
                <TableCell><Chip label={l.type} size="small" color={l.type==='Breakdown'?'error':'info'} variant="outlined" /></TableCell>
                <TableCell>{l.desc}</TableCell>
                <TableCell>{l.tech}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></TableContainer>
        )}
      </Paper>
    </Box>
  );
};
export default MachineManagement;
