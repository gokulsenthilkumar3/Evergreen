import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Avatar } from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, CheckCircle, Cancel, Warning } from '@mui/icons-material';

const QC_RECORDS = [
  { id: 1, batchNo: 'BT-2026-0921', count: '40s', date: '2026-09-21', samples: 10, passed: 9, failed: 1, csp: 2180, tpi: 15.2, u: 12.1, status: 'Passed' },
  { id: 2, batchNo: 'BT-2026-0920', count: '30s', date: '2026-09-20', samples: 10, passed: 10, failed: 0, csp: 2350, tpi: 13.8, u: 11.5, status: 'Passed' },
  { id: 3, batchNo: 'BT-2026-0919', count: '60s', date: '2026-09-19', samples: 8, passed: 5, failed: 3, csp: 2050, tpi: 20.1, u: 14.8, status: 'Failed' },
  { id: 4, batchNo: 'BT-2026-0918', count: '40s', date: '2026-09-18', samples: 10, passed: 8, failed: 2, csp: 2100, tpi: 15.5, u: 12.9, status: 'Warning' },
];

const QualityControl: React.FC = () => {
  const [tab, setTab] = useState<'list'|'defect'>('list');
  const passRate = Math.round(QC_RECORDS.reduce((s,r)=>s+(r.passed/r.samples)*100, 0) / QC_RECORDS.length);
  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box><Typography variant="h4" fontWeight={800}>Quality Control</Typography><Typography color="text.secondary">Inspection results, defect tracking, analytics</Typography></Box>
        <Box sx={{ display: 'flex', gap: 1 }}><Button variant="outlined" startIcon={<RefreshIcon />} size="small">Refresh</Button><Button variant="contained" startIcon={<AddIcon />} size="small">New Inspection</Button></Box>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[['Batches Inspected', QC_RECORDS.length, '#3b82f6', null],['Overall Pass Rate', `${passRate}%`, passRate>85?'#059669':'#f59e0b', null],['Failed Batches', QC_RECORDS.filter(r=>r.status==='Failed').length, '#ef4444', null],['Warning Batches', QC_RECORDS.filter(r=>r.status==='Warning').length, '#f59e0b', null]].map(([l,v,c])=>(
          <Grid key={String(l)} size={{ xs: 6, md: 3 }}><Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent sx={{ py: 1.5 }}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography variant="h5" fontWeight={800} color={c as string}>{v}</Typography></CardContent></Card></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Typography fontWeight={700}>Inspection Records</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {(['list','defect'] as const).map(t => <Chip key={t} label={t === 'list' ? 'All Records' : 'Defect Analysis'} onClick={() => setTab(t)} color={tab === t ? 'primary' : 'default'} variant={tab === t ? 'filled' : 'outlined'} size="small" />)}
          </Box>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Batch No</TableCell><TableCell sx={{ fontWeight: 700 }}>Count</TableCell><TableCell sx={{ fontWeight: 700 }}>Date</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>CSP</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>TPI</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>U%</TableCell><TableCell sx={{ fontWeight: 700 }}>Pass Rate</TableCell><TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            </TableRow></TableHead>
            <TableBody>{QC_RECORDS.map(r=>(
              <TableRow key={r.id} hover>
                <TableCell><Typography variant="body2" fontWeight={700} color="primary.main">{r.batchNo}</Typography></TableCell>
                <TableCell>{r.count}</TableCell>
                <TableCell>{new Date(r.date).toLocaleDateString('en-IN')}</TableCell>
                <TableCell align="right">{r.csp}</TableCell>
                <TableCell align="right">{r.tpi}</TableCell>
                <TableCell align="right">{r.u}</TableCell>
                <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LinearProgress variant="determinate" value={(r.passed/r.samples)*100} color={r.status==='Passed'?'success':r.status==='Failed'?'error':'warning'} sx={{ flex: 1, borderRadius: 2 }} /><Typography variant="caption">{r.passed}/{r.samples}</Typography></Box></TableCell>
                <TableCell><Chip label={r.status} size="small" icon={r.status==='Passed'?<CheckCircle sx={{fontSize:14}}/>:r.status==='Failed'?<Cancel sx={{fontSize:14}}/>:<Warning sx={{fontSize:14}}/>} color={r.status==='Passed'?'success':r.status==='Failed'?'error':'warning'} variant="outlined" /></TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
export default QualityControl;
