import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Avatar, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

interface Staff {
  id: number;
  empNo: string;
  name: string;
  department: string;
  designation: string;
  doj?: string;
  status?: string;
  salary: number;
}

interface PayrollEntry {
  id: number;
  staffId: number;
  staff: { empNo: string; name: string; department: string };
  month: string;
  daysWorked: number;
  otHours?: number;
  grossPay: number;
  deductions?: number;
  netPay: number;
  status?: string;
}

const HRManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  const qc = useQueryClient();

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { data: employees = [], isLoading: loadingEmp, error } = useQuery<Staff[]>({
    queryKey: ['hr-staff'],
    queryFn: () => api.get('/hr/staff').then(r => r.data),
  });

  const { data: payroll = [], isLoading: loadingPayroll } = useQuery<PayrollEntry[]>({
    queryKey: ['hr-payroll', currentMonth],
    queryFn: () => api.get(`/hr/payroll?month=${currentMonth}`).then(r => r.data),
  });

  const active = employees.filter(e => (e.status ?? 'Active') === 'Active').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;
  const totalSalary = employees.reduce((s, e) => s + e.salary, 0);

  if (error) return <Alert severity="error">Failed to load HR data</Alert>;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>HR & Payroll</Typography><Typography color="text.secondary">Employee records, attendance & salary processing</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} size="small" onClick={() => { qc.invalidateQueries({ queryKey: ['hr-staff'] }); qc.invalidateQueries({ queryKey: ['hr-payroll'] }); }}>Refresh</Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loadingEmp ? <Grid size={{ xs: 12 }}><CircularProgress size={24} /></Grid> : (
          [
            ['Total Employees', employees.length, '#3b82f6'],
            ['Active', active, '#059669'],
            ['On Leave', onLeave, '#f59e0b'],
            ['Payroll (Monthly)', `₹${totalSalary.toLocaleString('en-IN')}`, '#8b5cf6']
          ].map(([l, v, c]) => (
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
          <Tab label="Employee Directory" /><Tab label="Payroll Processing" />
        </Tabs>

        {tab === 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell sx={{ fontWeight: 700 }}>Emp No</TableCell><TableCell sx={{ fontWeight: 700 }}>Department</TableCell><TableCell sx={{ fontWeight: 700 }}>Designation</TableCell><TableCell sx={{ fontWeight: 700 }}>DOJ</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingEmp ? (
                  <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                ) : employees.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 3 }}>No staff records yet</TableCell></TableRow>
                ) : employees.map(e => (
                  <TableRow key={e.id} hover>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{e.name.charAt(0)}</Avatar><Typography variant="body2" fontWeight={600}>{e.name}</Typography></Box></TableCell>
                    <TableCell><Chip label={e.empNo} size="small" variant="outlined" /></TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{e.designation}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{e.doj ? new Date(e.doj).toLocaleDateString('en-IN') : '—'}</Typography></TableCell>
                    <TableCell><Chip label={e.status ?? 'Active'} size="small" color={(e.status ?? 'Active') === 'Active' ? 'success' : 'warning'} variant="outlined" /></TableCell>
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
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Gross Pay</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Deductions</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Net Pay</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingPayroll ? (
                  <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={20} /></TableCell></TableRow>
                ) : payroll.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3 }}>No payroll entries for {currentMonth}</TableCell></TableRow>
                ) : payroll.map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.staff?.name}</Typography><Typography variant="caption" color="text.secondary">{p.staff?.empNo}</Typography></TableCell>
                    <TableCell align="right">₹{p.grossPay.toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>-₹{(p.deductions ?? 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight={800} color="success.main">₹{p.netPay.toLocaleString('en-IN')}</Typography></TableCell>
                    <TableCell><Chip label={p.status ?? 'Pending'} size="small" color={p.status === 'Paid' ? 'success' : 'warning'} variant="outlined" /></TableCell>
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
export default HRManagement;
