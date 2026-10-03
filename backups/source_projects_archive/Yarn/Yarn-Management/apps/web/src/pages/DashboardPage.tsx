import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import FactoryIcon from '@mui/icons-material/Factory';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { http } from '../lib/http';
import ProductionStatusWidget from '../components/widgets/ProductionStatusWidget';
import FinancialOverviewWidget from '../components/widgets/FinancialOverviewWidget';
import InventoryHealthWidget from '../components/widgets/InventoryHealthWidget';
import SupplierPerformanceWidget from '../components/widgets/SupplierPerformanceWidget';
import WastageAnalysisWidget from '../components/widgets/WastageAnalysisWidget';
import QualityMetricsWidget from '../components/widgets/QualityMetricsWidget';
import FinancialAnalyticsWidget from '../components/widgets/FinancialAnalyticsWidget';
import ProductionEfficiencyChart from '../components/charts/ProductionEfficiencyChart';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBatches: 0,
    inventoryCount: 0,
    rawMaterialCount: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [billingRes, batchesRes, fgRes, rmRes] = await Promise.all([
          http.get('/billing/invoices'),
          http.get('/manufacturing/batches'),
          http.get('/finished-goods'),
          http.get('/raw-materials'),
        ]);

        const totalRevenue = billingRes.data.invoices.reduce((acc: number, inv: any) => acc + Number(inv.totalAmount), 0);
        const activeBatches = batchesRes.data.batches.filter((b: any) => b.status !== 'COMPLETED').length;
        const inventoryCount = fgRes.data.finishedGoods.reduce((acc: number, item: any) => acc + Number(item.producedQuantity), 0);
        const rawMaterialCount = rmRes.data.rawMaterials.reduce((acc: number, item: any) => acc + Number(item.quantity), 0);

        setStats({
          totalRevenue,
          activeBatches,
          inventoryCount,
          rawMaterialCount,
        });

        const chartDataMap: Record<string, { name: string; totalInvoiced: number; paidTotal: number }> = {};
        const monthNames = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleDateString('default', { month: 'short', year: '2-digit' });
          monthNames.push(key);
          chartDataMap[key] = { name: key, totalInvoiced: 0, paidTotal: 0 };
        }

        billingRes.data.invoices.forEach((inv: any) => {
          const createDate = new Date(inv.date);
          const key = createDate.toLocaleDateString('default', { month: 'short', year: '2-digit' });
          if (chartDataMap[key]) {
            const amount = Number(inv.totalAmount);
            chartDataMap[key].totalInvoiced += amount;
            if (inv.status === 'PAID') {
              chartDataMap[key].paidTotal += amount;
            }
          }
        });

        const dynamicChartData = monthNames.map((name) => chartDataMap[name]);
        setChartData(dynamicChartData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const KPICard = ({ title, value, icon, color, subtext }: any) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', top: -10, right: -10, p: 3, bgcolor: `${color}10`, borderRadius: '50%', width: 100, height: 100 }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}15`, color: color }}>
            {icon}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#10b981', bgcolor: 'rgba(16, 185, 129, 0.15)', px: 1, py: 0.5, borderRadius: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="caption" fontWeight="bold">
              12%
            </Typography>
          </Box>
        </Box>
        <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary', mb: 0.5 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          {title}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {subtext}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary' }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, here's what's happening today.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2 }} onClick={() => navigate('/manufacturing')}>
            New Batch
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue / 1000).toFixed(1)}k`}
            icon={<AttachMoneyIcon />}
            color="#3b82f6"
            subtext="vs last month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Batches"
            value={stats.activeBatches}
            icon={<FactoryIcon />}
            color="#f59e0b"
            subtext="In production lines"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Yarn Produced"
            value={`${(stats.inventoryCount / 1000).toFixed(1)}t`}
            icon={<InventoryIcon />}
            color="#10b981"
            subtext="Finished goods"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Raw Material"
            value={`${(stats.rawMaterialCount / 1000).toFixed(1)}t`}
            icon={<InventoryIcon />}
            color="#8b5cf6"
            subtext="Available stock"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" fontWeight="700" sx={{ mb: 3, color: 'text.primary' }}>
        Advanced Analytics
      </Typography>

      {/* New Dashboard Widgets */}
      {/* New Dashboard Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Row 1: Production & Efficiency */}
        <Grid item xs={12} md={6}>
          <ProductionStatusWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <ProductionEfficiencyChart />
        </Grid>

        {/* Row 2: Inventory & Materials */}
        <Grid item xs={12} md={6}>
          <InventoryHealthWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <WastageAnalysisWidget />
        </Grid>

        {/* Row 3: Supply Chain & Quality */}
        <Grid item xs={12} md={6}>
          <SupplierPerformanceWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <QualityMetricsWidget />
        </Grid>

        {/* Row 4: Financial Deep Dive */}
        <Grid item xs={12}>
          <FinancialAnalyticsWidget />
        </Grid>
      </Grid>


      {/* Revenue Trend Chart */}
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Revenue & Collection Trend
          </Typography>
          <Chip label="Last 6 Months" size="small" color="primary" />
        </Box>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" />
            <Bar dataKey="totalInvoiced" name="Invoiced Amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
            <Bar dataKey="paidTotal" name="Collected Amount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
}
