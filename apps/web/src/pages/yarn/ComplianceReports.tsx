import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress } from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon, CheckCircle, Warning, Error } from '@mui/icons-material';
const REPORTS = [
  { id: 1, name: 'ESI Monthly Return', authority: 'ESIC', period: 'September 2026', dueDate: '2026-10-15', status: 'Pending', completeness: 75 },
  { id: 2, name: 'PF Monthly Return', authority: 'EPFO', period: 'September 2026', dueDate: '2026-10-25', status: 'In Progress', completeness: 90 },
  { id: 3, name: 'GST GSTR-1', authority: 'GST Dept', period: 'September 2026', dueDate: '2026-10-11', status: 'Submitted', completeness: 100 },
  { id: 4, name: 'Labour Inspection Register', authority: 'Labour Dept', period: 'Q2 2026', dueDate: '2026-10-01', status: 'Overdue', completeness: 30 },
  { id: 5, name: 'Pollution Control Board Report', authority: 'PCB', period: 'Half Year 2026', dueDate: '2026-11-30', status: 'Not Started', completeness: 0 },
  { id: 6, name: 'Factory Act Annual Return', authority: 'Factory Inspectorate', period: '2026', dueDate: '2026-12-31', status: 'Not Started', completeness: 0 },
];
const statusIcon = (s: string) => s === 'Submitted' ? <CheckCircle sx={{ fontSize: 16, color: '#059669' }} /> : s === 'Overdue' ? <Error sx={{ fontSize: 16, color: '#ef4444' }} /> : <Warning sx={{ fontSize: 16, color: '#f59e0b' }} />;
const statusColor = (s: string): 'success' | 'error' | 'warning' | 'info' | 'default' => s === 'Submitted' ? 'success' : s === 'Overdue' ? 'error' : s === 'In Progress' ? 'info' : 'warning';
const ComplianceReports: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box><Typography variant="h4" fontWeight={800}>Compliance Reports</Typography><Typography color="text.secondary">Statutory filings, labour law & regulatory compliance</Typography></Box>
      <Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button>
    </Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[['Submitted', REPORTS.filter(r=>r.status==='Submitted').length, '#059669'],['In Progress', REPORTS.filter(r=>r.status==='In Progress').length, '#3b82f6'],['Overdue', REPORTS.filter(r=>r.status==='Overdue').length, '#ef4444'],['Pending', REPORTS.filter(r=>['Pending','Not Started'].includes(r.status)).length, '#f59e0b']].map(([l,v,c])=>(
        <Grid key={String(l)} size={{ xs: 6, md: 3 }}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent sx={{ py: 1.5 }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={800} color={c as string}>{v}</Typography></CardContent></Card></Grid>
      ))}
    </Grid>
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}><Typography fontWeight={700}>Compliance Calendar</Typography></Box>
      <TableContainer><Table size="small">
        <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
          <TableCell sx={{ fontWeight: 700 }}>Report</TableCell><TableCell sx={{ fontWeight: 700 }}>Authority</TableCell><TableCell sx={{ fontWeight: 700 }}>Period</TableCell><TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell><TableCell sx={{ fontWeight: 700 }}>Completeness</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell><TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
        </TableRow></TableHead>
        <TableBody>{REPORTS.map(r=>(
          <TableRow key={r.id} hover sx={{ bgcolor: r.status==='Overdue'?'error.main':'transparent', '& td': { color: r.status==='Overdue'?'error.contrastText':'inherit' } }}>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{statusIcon(r.status)}<Typography variant="body2" fontWeight={700}>{r.name}</Typography></Box></TableCell>
            <TableCell><Typography variant="body2">{r.authority}</Typography></TableCell>
            <TableCell><Typography variant="body2" color="text.secondary">{r.period}</Typography></TableCell>
            <TableCell><Typography variant="body2" color={r.status==='Overdue'?'error.main':'text.secondary'}>{new Date(r.dueDate).toLocaleDateString('en-IN')}</Typography></TableCell>
            <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinearProgress variant="determinate" value={r.completeness} color={r.completeness===100?'success':r.completeness>50?'info':'warning'} sx={{ flex: 1, borderRadius: 2, maxWidth: 80 }} /><Typography variant="caption">{r.completeness}%</Typography></Box></TableCell>
            <TableCell><Chip label={r.status} size="small" color={statusColor(r.status)} variant="outlined" /></TableCell>
            <TableCell>{r.status==='Submitted' && <Button size="small" startIcon={<DownloadIcon />} variant="text">Download</Button>}</TableCell>
          </TableRow>
        ))}</TableBody>
      </Table></TableContainer>
    </Paper>
  </Box>
);
export default ComplianceReports;
