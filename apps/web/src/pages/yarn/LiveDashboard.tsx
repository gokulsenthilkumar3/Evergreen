import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, LinearProgress } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const PageBody = () => {
  const machines = [
    { id: 'MC-01', name: 'Ring Frame A-01', status: 'Running', oee: 87, spindles: 400, active: 392, count: '40s' },
    { id: 'MC-02', name: 'Ring Frame A-02', status: 'Running', oee: 91, spindles: 400, active: 400, count: '30s' },
    { id: 'MC-03', name: 'Ring Frame B-01', status: 'Idle', oee: 0, spindles: 360, active: 0, count: '60s' },
    { id: 'MC-04', name: 'Ring Frame B-02', status: 'Alert', oee: 45, spindles: 400, active: 180, count: '40s' },
    { id: 'MC-05', name: 'Winding M-01', status: 'Running', oee: 79, spindles: 120, active: 95, count: '' },
    { id: 'MC-06', name: 'TFO Machine-01', status: 'Running', oee: 94, spindles: 64, active: 64, count: '2/60' },
  ];
  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Running', machines.filter(m=>m.status==='Running').length, '#059669'], ['Idle', machines.filter(m=>m.status==='Idle').length, '#6b7280'], ['Alert', machines.filter(m=>m.status==='Alert').length, '#ef4444'], ['Avg OEE', Math.round(machines.filter(m=>m.oee>0).reduce((s,m)=>s+m.oee,0)/machines.filter(m=>m.oee>0).length)+'%', '#3b82f6']].map(([l, v, c]) => (
          <Grid key={l as string} size={{ xs: 6, sm: 3 }}><Card variant="outlined" sx={{ borderRadius: 3, borderLeft: `3px solid ${c}` }}><CardContent sx={{ py: 1.5 }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={800} sx={{ color: c as string }}>{v}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        {machines.map(m => (
          <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: `3px solid ${m.status==='Running'?'#059669':m.status==='Alert'?'#ef4444':'#9ca3af'}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography fontWeight={700}>{m.name}</Typography>
                <Chip label={m.status} size="small" color={m.status==='Running'?'success':m.status==='Alert'?'error':'default'} variant="outlined" />
              </Box>
              {m.count && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Count: {m.count}</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}><Typography variant="caption">OEE</Typography><Typography variant="caption" fontWeight={700}>{m.oee}%</Typography></Box>
              <LinearProgress variant="determinate" value={m.oee} color={m.oee>80?'success':m.oee>50?'warning':'error'} sx={{ borderRadius: 2, mb: 1 }} />
              <Typography variant="caption" color="text.secondary">Spindles: {m.active}/{m.spindles} active</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const LiveDashboard: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" fontWeight={800}>Live Production Dashboard</Typography>
        <Typography color="text.secondary">Real-time machine OEE, spindle status & batch monitoring</Typography>
      </Box>
      <Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button>
    </Box>
    <PageBody />
  </Box>
);
export default LiveDashboard;
