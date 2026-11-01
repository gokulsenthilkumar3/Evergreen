import { uiText, useUiLanguage, uiLocale, uiMetric } from "../../i18n";
import React from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

interface CommerceReport {
  invoicedValue?: number;
  receivables?: number;
}

interface PayrollEntry {
  id: number;
}

const ComplianceReports: React.FC = () => {
  useUiLanguage();
  const queryClient = useQueryClient();
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const report = useQuery<CommerceReport>({
    queryKey: ['commerce-report'],
    queryFn: () => api.get('/commerce/report').then((r) => r.data),
  });

  const payroll = useQuery<PayrollEntry[]>({
    queryKey: ['hr-payroll', month],
    queryFn: () => api.get('/hr/payroll', { params: { month } }).then((r) => r.data),
  });

  const loading = report.isLoading || payroll.isLoading;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['commerce-report'] });
    void queryClient.invalidateQueries({ queryKey: ['hr-payroll', month] });
  };

  const cards = [
    {
      label: 'Recorded invoiced value',
      value: `₹${Number(report.data?.invoicedValue ?? 0).toLocaleString(uiLocale())}`,
      detail: 'Internal invoice records',
    },
    {
      label: 'Current receivables',
      value: `₹${Number(report.data?.receivables ?? 0).toLocaleString(uiLocale())}`,
      detail: 'Internal ledger balance',
    },
    {
      label: `Payroll entries · ${month}`,
      value: payroll.data?.length ?? 0,
      detail: 'Saved payroll records',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {uiText("Compliance Readiness ")}</Typography>
          <Typography color="text.secondary">
            {uiText("Operational source records that may support your filings. ")}</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={refresh}>
          {uiText("Refresh ")}</Button>
      </Box>

      {(report.error || payroll.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uiText("Some readiness data could not be loaded. ")}</Alert>
      )}

      <Alert severity="warning" sx={{ mb: 2 }}>
        {uiText("No statutory filing provider is connected. These figures show internal records only; they do not indicate that a return was prepared, submitted, or accepted. ")}</Alert>

      {loading ? (
        <CircularProgress aria-label={uiText("Loading readiness data")} />
      ) : (
        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid key={card.label} size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  {uiText(card.label, 'metrics')}
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ my: 1 }}>
                  {uiMetric(card.value)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.detail}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ComplianceReports;
