import React from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

const ComplianceReports: React.FC = () => {
  const queryClient = useQueryClient();
  const month = new Date().toISOString().slice(0, 7);
  const report = useQuery({ queryKey: ['commerce-report'], queryFn: () => api.get('/commerce/report').then(response => response.data) });
  const payroll = useQuery<any[]>({ queryKey: ['hr-payroll', month], queryFn: () => api.get('/hr/payroll', { params: { month } }).then(response => response.data) });
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ['commerce-report'] }); void queryClient.invalidateQueries({ queryKey: ['hr-payroll', month] }); };
  const loading = report.isLoading || payroll.isLoading;
  return <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3 }}><Box><Typography variant="h4" fontWeight={800}>Compliance Readiness</Typography><Typography color="text.secondary">Operational source records that may support your filings.</Typography></Box><Button startIcon={<RefreshIcon />} onClick={refresh}>Refresh</Button></Box>
    {(report.error || payroll.error) && <Alert severity="error" sx={{ mb: 2 }}>Some readiness data could not be loaded.</Alert>}
    <Alert severity="warning" sx={{ mb: 2 }}>No statutory filing provider is connected. These figures show internal records only; they do not indicate that a return was prepared, submitted, or accepted.</Alert>
    {loading ? <CircularProgress aria-label="Loading readiness data" /> : <Grid container spacing={2}>
      {[
        { label: 'Recorded invoiced value', value: `₹${Number(report.data?.invoicedValue || 0).toLocaleString('en-IN')}`, detail: 'Internal invoice records' },
        { label: 'Current receivables', value: `₹${Number(report.data?.receivables || 0).toLocaleString('en-IN')}`, detail: 'Internal ledger balance' },
        { label: `Payroll entries · ${month}`, value: payroll.data?.length ?? 0, detail: 'Saved payroll records' },
      ].map(card => <Grid key={card.label} size={{ xs: 12, md: 4 }}><Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}><Typography variant="body2" color="text.secondary">{card.label}</Typography><Typography variant="h5" fontWeight={800} sx={{ my: 1 }}>{card.value}</Typography><Typography variant="caption" color="text.secondary">{card.detail}</Typography></Paper></Grid>)}
    </Grid>}
  </Box>;
};

export default ComplianceReports;
