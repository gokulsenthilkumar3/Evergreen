import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Tabs, Tab } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
const EMPLOYEES = [
  { id: 1, name: 'Suresh Kumar', empNo: 'EG-001', dept: 'Production', designation: 'Senior Operator', doj: '2019-03-01', status: 'Active', salary: 18000 },
  { id: 2, name: 'Murugan S.', empNo: 'EG-002', dept: 'Quality', designation: 'QC Inspector', doj: '2020-07-15', status: 'Active', salary: 16500 },
  { id: 3, name: 'Priya R.', empNo: 'EG-003', dept: 'HR', designation: 'HR Executive', doj: '2022-01-10', status: 'Active', salary: 22000 },
  { id: 4, name: 'Karthik B.', empNo: 'EG-004', dept: 'Production', designation: 'Shift Incharge', doj: '2018-08-20', status: 'Active', salary: 28000 },
  { id: 5, name: 'Suba D.', empNo: 'EG-005', dept: 'Finance', designation: 'Accountant', doj: '2021-04-05', status: 'On Leave', salary: 24000 },
];
const PAYROLL = EMPLOYEES.map(e => ({ ...e, days: 26, ot: Math.floor(Math.random()*20), basic: Math.round(e.salary*0.6), hra: Math.round(e.salary*0.2), da: Math.round(e.salary*0.1), deductions: 1800, net: e.salary - 1800 + Math.floor(Math.random()*1000) }));
const HRManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>HR & Payroll</Typography><Typography color="text.secondary">Employee records, attendance & salary processing</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button><Button variant="contained" startIcon={<AddIcon />} size="small">Add Employee</Button></Box>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Total Employees', EMPLOYEES.length, '#3b82f6'],['Active', EMPLOYEES.filter(e=>e.status==='Active').length, '#059669'],['On Leave', EMPLOYEES.filter(e=>e.status==='On Leave').length, '#f59e0b'],['Payroll (Monthly)', `\u20b9${EMPLOYEES.reduce((s,e)=>s+e.salary,0).toLocaleString('en-IN')}`, '#8b5cf6']].map(([l,v,c])=>(
          <Grid key={String(l)} size={{ xs: 6, md: 3 }}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent sx={{ py: 1.5 }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={800} color={c as string}>{v}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
          <Tab label="Employee Directory" /><Tab label="Payroll Processing" />
        </Tabs>
        {tab === 0 && (
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell sx={{ fontWeight: 700 }}>Emp No</TableCell><TableCell sx={{ fontWeight: 700 }}>Department</TableCell><TableCell sx={{ fontWeight: 700 }}>Designation</TableCell><TableCell sx={{ fontWeight: 700 }}>DOJ</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell></TableRow></TableHead>
            <TableBody>{EMPLOYEES.map(e=>(
              <TableRow key={e.id} hover>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{e.name.charAt(0)}</Avatar><Typography variant="body2" fontWeight={600}>{e.name}</Typography></Box></TableCell>
                <TableCell><Chip label={e.empNo} size="small" variant="outlined" /></TableCell>
                <TableCell>{e.dept}</TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{e.designation}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{new Date(e.doj).toLocaleDateString('en-IN')}</Typography></TableCell>
                <TableCell><Chip label={e.status} size="small" color={e.status==='Active'?'success':'warning'} variant="outlined" /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></TableContainer>
        )}
        {tab === 1 && (
          <TableContainer><Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Basic</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>HRA</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>DA</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Deductions</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Net Pay</TableCell></TableRow></TableHead>
            <TableBody>{PAYROLL.map(e=>(
              <TableRow key={e.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{e.name}</Typography></TableCell>
                <TableCell align="right">\u20b9{e.basic.toLocaleString('en-IN')}</TableCell>
                <TableCell align="right">\u20b9{e.hra.toLocaleString('en-IN')}</TableCell>
                <TableCell align="right">\u20b9{e.da.toLocaleString('en-IN')}</TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>-\u20b9{e.deductions.toLocaleString('en-IN')}</TableCell>
                <TableCell align="right"><Typography variant="body2" fontWeight={800} color="success.main">\u20b9{e.net.toLocaleString('en-IN')}</Typography></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table></TableContainer>
        )}
      </Paper>
    </Box>
  );
};
export default HRManagement;
