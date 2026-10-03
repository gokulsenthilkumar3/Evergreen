import React, { useMemo } from 'react';
import { AutoAwesome as ForecastIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../utils/api';

type SalesOrder = { date: string; total: number; status: string };

const DemandForecasting: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading, error } = useQuery<SalesOrder[]>({
    queryKey: ['commerce-orders'],
    queryFn: () => api.get('/commerce/orders').then(response => response.data),
  });
  const forecast = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const historical = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth() - 6 + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const value = orders.filter(order => order.status !== 'CANCELLED' && order.date?.slice(0, 7) === key)
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      return { key, month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), actual: value, projected: null as number | null };
    });
    const trailing = historical.slice(-3).map(row => row.actual);
    const avg = trailing.some(value => value > 0) ? trailing.reduce((sum, value) => sum + value, 0) / trailing.length : null;
    const future = Array.from({ length: 3 }, (_, index) => {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth() + index, 1);
      return { key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), actual: null as number | null, projected: avg };
    });
    return { rows: [...historical, ...future], avg };
  }, [orders]);

  return <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}><ForecastIcon color="primary" /><Box><Typography variant="h4" fontWeight={800}>Demand Forecasting</Typography><Typography color="text.secondary">Order-value outlook calculated from saved sales orders.</Typography></Box></Box>
      <Button startIcon={<RefreshIcon />} onClick={() => queryClient.invalidateQueries({ queryKey: ['commerce-orders'] })}>Refresh</Button>
    </Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>Could not load sales orders for the forecast.</Alert>}
    <Alert severity="info" sx={{ mb: 2 }}>Projection method: average of the previous three calendar months of non-cancelled sales order value. This is a simple baseline, not an AI forecast or purchase recommendation.</Alert>
    {isLoading ? <CircularProgress aria-label="Loading sales history" /> : forecast.avg === null ? <Alert severity="warning">There is not enough recorded sales history to calculate a projection yet.</Alert> : <>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}><Typography variant="body2" color="text.secondary">Baseline monthly order value</Typography><Typography variant="h4" fontWeight={800}>₹{forecast.avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Typography></Paper>
      <Paper variant="outlined" sx={{ p: 2.5 }}><Box sx={{ width: '100%', height: 330 }}><ResponsiveContainer><LineChart data={forecast.rows} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis tickFormatter={value => `₹${Number(value).toLocaleString('en-IN')}`} /><Tooltip formatter={value => value == null ? '—' : `₹${Number(value).toLocaleString('en-IN')}`} /><Legend /><Line type="monotone" dataKey="actual" name="Recorded order value" stroke="#059669" strokeWidth={2} connectNulls={false} /><Line type="monotone" dataKey="projected" name="Average baseline" stroke="#2563eb" strokeWidth={2} strokeDasharray="6 4" connectNulls={false} /></LineChart></ResponsiveContainer></Box></Paper>
    </>}
  </Box>;
};

export default DemandForecasting;
