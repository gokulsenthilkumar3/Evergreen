import { uiText, useUiLanguage } from "../../i18n";
import React from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';

type Machine = {
  id: number;
  name: string;
  type: string;
  serialNo?: string | null;
  active: boolean;
};

type Inspection = {
  id: number;
  machine: { name: string };
  type: string;
  status: string;
  date: string;
};

const STAT_CARDS = (data: Machine[], openInspections: Inspection[]) => [
  { label: 'Registered machines', value: data.length },
  { label: 'Active', value: data.filter((m) => m.active).length },
  { label: 'Inactive', value: data.filter((m) => !m.active).length },
  { label: 'Open inspections', value: openInspections.length },
];

const LiveDashboard: React.FC = () => {
  useUiLanguage();
  const queryClient = useQueryClient();

  const machines = useQuery<Machine[]>({
    queryKey: ['machines'],
    queryFn: () => api.get('/machines').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const inspections = useQuery<Inspection[]>({
    queryKey: ['machine-inspections'],
    queryFn: () => api.get('/machines/inspections').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const data = machines.data ?? [];
  const openInspections = (inspections.data ?? []).filter(
    (item) => !['RESOLVED', 'CLOSED'].includes(item.status.toUpperCase()),
  );

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['machines'] });
    void queryClient.invalidateQueries({ queryKey: ['machine-inspections'] });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            {uiText("Machine Status Overview ")}</Typography>
          <Typography color="text.secondary">
            {uiText("Current machine registry and recorded inspection status. Auto-refreshes every 30 s. ")}</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={handleRefresh}>
          {uiText("Refresh ")}</Button>
      </Box>

      {/* Error state */}
      {(machines.error || inspections.error) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uiText("Could not load all machine status data. ")}</Alert>
      )}

      {/* Loading / data */}
      {machines.isLoading || inspections.isLoading ? (
        <CircularProgress aria-label={uiText("Loading machine data")} />
      ) : (
        <>
          {/* KPI cards */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {STAT_CARDS(data, openInspections).map(({ label, value }) => (
              <Grid key={label} size={{ xs: 6, md: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {uiText(label, 'forms')}
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      {value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Machine table */}
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{uiText("Machine", 'tables')}</TableCell>
                  <TableCell>{uiText("Type", 'tables')}</TableCell>
                  <TableCell>{uiText("Serial no.", 'tables')}</TableCell>
                  <TableCell>{uiText("Status", 'tables')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell>{machine.type}</TableCell>
                    <TableCell>{machine.serialNo ?? '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={machine.active ? uiText("Active", 'tables') : uiText("Inactive", 'tables')}
                        color={machine.active ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!data.length && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      {uiText("No machines have been registered. ", 'tables')}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography variant="caption" color="text.secondary">
            {uiText("This overview reflects the latest loaded records. Runtime telemetry, OEE, spindle counts are not yet connected. ")}</Typography>
        </>
      )}
    </Box>
  );
};

export default LiveDashboard;
