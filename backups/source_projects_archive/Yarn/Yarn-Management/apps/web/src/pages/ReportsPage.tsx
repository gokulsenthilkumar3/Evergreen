import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { http } from '../lib/http';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    monthlyRevenue: [],
    wasteByStage: [],
    productionTrend: []
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [billingRes, wasteRes, goodsRes] = await Promise.all([
          http.get('/billing/invoices'),
          http.get('/manufacturing/wastage'),
          http.get('/finished-goods'),
        ]);
        const revenueByMonth: Record<string, number> = {};
        (billingRes.data.invoices || []).forEach((invoice: { date: string; totalAmount: number | string }) => {
          const date = new Date(invoice.date);
          if (Number.isNaN(date.getTime())) return;
          const key = date.toLocaleString('en', { month: 'short', year: '2-digit' });
          revenueByMonth[key] = (revenueByMonth[key] || 0) + Number(invoice.totalAmount);
        });
        const revenueData = Object.entries(revenueByMonth).map(([name, amount]) => ({ name, amount }));
        const wasteMap: Record<string, number> = {};
        (wasteRes.data.wastage || []).forEach((w: any) => {
          wasteMap[w.stage] = (wasteMap[w.stage] || 0) + Number(w.quantity);
        });
        const wasteData = Object.entries(wasteMap).map(([name, value]) => ({ name, value }));

        const productionByWeek: Record<string, number> = {};
        (goodsRes.data.finishedGoods || []).forEach((good: { packingDate: string; producedQuantity: number | string }) => {
          const date = new Date(good.packingDate);
          if (Number.isNaN(date.getTime())) return;
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const key = weekStart.toISOString().slice(0, 10);
          productionByWeek[key] = (productionByWeek[key] || 0) + Number(good.producedQuantity);
        });
        const prodData = Object.entries(productionByWeek).sort(([a], [b]) => a.localeCompare(b)).map(([name, output]) => ({ name, output }));

        setData({
          monthlyRevenue: revenueData,
          wasteByStage: wasteData,
          productionTrend: prodData
        });
      } catch (err) {
        console.error(err);
        setError('Reports are unavailable right now. No sample values are shown.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Reports & Analytics</Typography>

      <Grid container spacing={3}>
        {/* Financial Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Monthly Invoiced Amount</Typography>
            {data.monthlyRevenue.length === 0 ? <Alert severity="info">No invoices to chart yet.</Alert> :
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>}
          </Paper>
        </Grid>

        {/* Waste Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Wastage Distribution</Typography>
            {data.wasteByStage.length === 0 ? <Alert severity="info">No wastage records to chart yet.</Alert> : <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.wasteByStage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {data.wasteByStage.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>}
          </Paper>
        </Grid>

        {/* Production Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2, height: 350 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Weekly Production Output</Typography>
            {data.productionTrend.length === 0 ? <Alert severity="info">No finished-goods records to chart yet.</Alert> : <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.productionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="output" fill="#82ca9d" name="Yarn Output (kg)" />
              </BarChart>
            </ResponsiveContainer>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
