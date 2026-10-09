import React, { useMemo } from 'react';
import {
  AutoAwesome as ForecastIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingBag as OrderIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../utils/api';

interface SalesOrder {
  id?: number | string;
  date: string;
  total: number;
  status: string;
}

interface ForecastRow {
  key: string;
  month: string;
  actual: number | null;
  projected: number | null;
  status: 'Historical' | 'Projected';
}

const DemandForecasting: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    isRefetching,
    error,
  } = useQuery<SalesOrder[]>({
    queryKey: ['commerce-orders'],
    queryFn: () => api.get('/commerce/orders').then((response) => response.data),
  });

  const forecast = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const historical: ForecastRow[] = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth() - 6 + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const value = orders
        .filter((order) => order.status !== 'CANCELLED' && order.date?.slice(0, 7) === key)
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

      return {
        key,
        month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        actual: value,
        projected: null,
        status: 'Historical',
      };
    });

    const nonZeroTrailing = historical.slice(-3).map((row) => row.actual ?? 0);
    const avg = nonZeroTrailing.some((val) => val > 0)
      ? nonZeroTrailing.reduce((sum, val) => sum + val, 0) / nonZeroTrailing.length
      : null;

    const future: ForecastRow[] = Array.from({ length: 3 }, (_, index) => {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth() + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      return {
        key,
        month: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        actual: null,
        projected: avg,
        status: 'Projected',
      };
    });

    const totalValidOrders = orders.filter((o) => o.status !== 'CANCELLED').length;
    const projectedThreeMonths = avg ? avg * 3 : 0;

    return {
      rows: [...historical, ...future],
      avg,
      totalValidOrders,
      projectedThreeMonths,
    };
  }, [orders]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <ForecastIcon color="primary" sx={{ fontSize: 36 }} />
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Demand Forecasting
            </Typography>
            <Typography color="text.secondary">
              Order-value outlook calculated from recorded sales order history
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          disabled={isLoading || isRefetching}
          onClick={() => queryClient.invalidateQueries({ queryKey: ['commerce-orders'] })}
        >
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load sales orders for the forecast. Please verify your connection.
        </Alert>
      )}

      {/* Baseline calculation notice */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Projection Model:</strong> 3-month trailing moving average of non-cancelled sales
        orders. Provides an operational planning baseline for procurement and spinning schedules.
      </Alert>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress aria-label="Loading sales history" />
        </Box>
      ) : forecast.avg === null ? (
        <Alert severity="warning">
          There is not enough recorded sales order history to calculate a projection yet. Once sales
          orders are placed in Business Desk, demand trajectories will populate automatically.
        </Alert>
      ) : (
        <>
          {/* Summary KPIs */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <TrendingUpIcon sx={{ color: '#059669', fontSize: 36 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      BASELINE MONTHLY DEMAND
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#059669">
                      ₹{forecast.avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <CalendarIcon sx={{ color: '#2563eb', fontSize: 36 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      3-MONTH PROJECTED VALUE
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#2563eb">
                      ₹{forecast.projectedThreeMonths.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                  <OrderIcon sx={{ color: '#8b5cf6', fontSize: 36 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      ACTIVE ORDERS ANALYZED
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#8b5cf6">
                      {forecast.totalValidOrders} Orders
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Interactive Chart */}
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              6-Month Historical Revenue vs 3-Month Projection
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.rows} margin={{ top: 10, right: 30, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#888888" />
                  <YAxis
                    stroke="#888888"
                    tickFormatter={(value) => `₹${(Number(value) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) =>
                      value == null
                        ? '—'
                        : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Recorded Sales (₹)"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    name="Projected Demand (₹)"
                    stroke="#2563eb"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          {/* Detailed breakdown table */}
          <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Monthly Demand Breakdown
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Period Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Actual Order Value
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Projected Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forecast.rows.map((row) => (
                    <TableRow key={row.key} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.month}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'Historical' ? 'success' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {row.actual !== null
                          ? `₹${row.actual.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                          : '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        {row.projected !== null
                          ? `₹${row.projected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default DemandForecasting;
