import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, AvatarGroup } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, WbSunny, NightsStay, AccessTime } from '@mui/icons-material';

const SHIFTS = [
  { id: 1, name: 'Morning Shift', time: '6:00 AM - 2:00 PM', supervisor: 'Rajesh K.', workers: ['Arun', 'Selvam', 'Murugan', 'Kumar', 'Priya', 'Suresh', 'Ravi', 'Senthil'], status: 'Active', efficiency: 89 },
  { id: 2, name: 'Afternoon Shift', time: '2:00 PM - 10:00 PM', supervisor: 'Anand S.', workers: ['Karthik', 'Balu', 'Velmurugan', 'Devi', 'Sakthi', 'Mani', 'Pandi', 'Gopi'], status: 'Active', efficiency: 84 },
  { id: 3, name: 'Night Shift', time: '10:00 PM - 6:00 AM', supervisor: 'Krishnan R.', workers: ['Ramesh', 'Babu', 'Saravanan', 'Thilak', 'Siva', 'Dinesh', 'Prasad', 'Arjun'], status: 'Scheduled', efficiency: 92 },
];
const ATTENDANCE = [
  { id: 1, name: 'Arun S.', shift: 'Morning', date: '2026-09-23', in: '5:58 AM', out: '2:02 PM', status: 'Present', ot: '0h' },
  { id: 2, name: 'Selvam K.', shift: 'Morning', date: '2026-09-23', in: '6:15 AM', out: '2:10 PM', status: 'Late', ot: '0h' },
  { id: 3, name: 'Karthik V.', shift: 'Afternoon', date: '2026-09-23', in: '1:55 PM', out: '\u2014', status: 'Active', ot: '0h' },
  { id: 4, name: 'Mani B.', shift: 'Morning', date: '2026-09-23', in: '\u2014', out: '\u2014', status: 'Absent', ot: '0h' },
];
const ShiftManagement: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box><Typography variant="h4" fontWeight={800}>Shift Management</Typography><Typography color="text.secondary">Shift scheduling, attendance & efficiency</Typography></Box>
      <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button><Button variant="contained" startIcon={<AddIcon />} size="small">Add Shift</Button></Box>
    </Box>
    <Grid container spacing={2.5} sx={{ mb: 3 }}>
      {SHIFTS.map(s => (
        <Grid key={s.id} size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, borderLeft: `3px solid ${s.id===1?'#f59e0b':s.id===2?'#3b82f6':'#6b7280'}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {s.id===1?<WbSunny sx={{color:'#f59e0b'}} />:s.id===2?<AccessTime sx={{color:'#3b82f6'}} />:<NightsStay sx={{color:'#6b7280'}} />}
                <Typography fontWeight={800}>{s.name}</Typography>
              </Box>
              <Chip label={s.status} size="small" color={s.status==='Active'?'success':'default'} variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{s.time}</Typography>
            <Typography variant="caption" color="text.secondary">Supervisor: <b>{s.supervisor}</b></Typography>
            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {s.workers.map(w => <Avatar key={w} sx={{ bgcolor: 'primary.main', width: 28, height: 28, fontSize: '0.7rem' }}>{w.charAt(0)}</Avatar>)}
              </Box>
              <Chip label={`${s.efficiency}% eff`} size="small" color={s.efficiency>85?'success':'warning'} />
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}><Typography fontWeight={700}>Today{"\u0027"}s Attendance</Typography></Box>
      <TableContainer><Table size="small">
        <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
          <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell sx={{ fontWeight: 700 }}>Shift</TableCell><TableCell sx={{ fontWeight: 700 }}>In</TableCell><TableCell sx={{ fontWeight: 700 }}>Out</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
        </TableRow></TableHead>
        <TableBody>{ATTENDANCE.map(a=>(
          <TableRow key={a.id} hover>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{a.name.charAt(0)}</Avatar><Typography variant="body2" fontWeight={600}>{a.name}</Typography></Box></TableCell>
            <TableCell>{a.shift}</TableCell>
            <TableCell>{a.in}</TableCell>
            <TableCell>{a.out}</TableCell>
            <TableCell><Chip label={a.status} size="small" color={a.status==='Present'?'success':a.status==='Active'?'info':a.status==='Late'?'warning':'error'} variant="outlined" /></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table></TableContainer>
    </Paper>
  </Box>
);
export default ShiftManagement;
