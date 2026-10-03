import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Alert,
  AlertTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { http } from '../lib/http';
import WastageForm from '../components/manufacturing/WastageForm';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function WastagePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    count: 0,
    mostWastefulStage: '-'
  });

  async function loadData() {
    setLoading(true);
    try {
      // Parallel fetch
      const [logsRes, analyticsRes, optimizeRes] = await Promise.all([
        http.get('/manufacturing/wastage'),
        http.get('/manufacturing/wastage/analytics-v2'),
        http.get('/manufacturing/wastage/optimization-v2')
      ]);

      const data = logsRes.data?.wastage || [];
      setLogs(data);
      setAnalytics(analyticsRes.data?.analytics || null);
      setRecommendations(optimizeRes.data?.recommendations || []);

      // Calculate Stats
      const total = data.reduce((sum: number, log: any) => sum + Number(log.quantity || 0), 0);
      const stageMap: Record<string, number> = {};
      data.forEach((log: any) => {
        if (log.stage) {
          stageMap[log.stage] = (stageMap[log.stage] || 0) + Number(log.quantity || 0);
        }
      });
      let maxStage = '-';
      let maxVal = 0;
      Object.entries(stageMap).forEach(([stage, val]) => {
        if (val > maxVal) {
          maxVal = val;
          maxStage = stage;
        }
      });
      setStats({
        total,
        count: data.length,
        mostWastefulStage: maxStage
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const KPICard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color, mr: 2 }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Wastage Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          color="error"
        >
          Log Wastage
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Total Wastage (kg)"
            value={stats.total.toFixed(2)}
            icon={<DeleteIcon fontSize="large" />}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Most Wasteful Stage"
            value={stats.mostWastefulStage}
            icon={<WarningAmberIcon fontSize="large" />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Total Logs"
            value={stats.count}
            icon={<RecyclingIcon fontSize="large" />}
            color="#3b82f6"
          />
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Wastage Logs" />
          <Tab label="Analysis & Optimization" />
        </Tabs>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tab 0: Logs Table */}
      {activeTab === 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
          <TableContainer>
            <Table size="medium">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Batch No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Stage</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantity (kg)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!logs || logs.length === 0) && !loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No wastage logged yet</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{new Date(log.loggedAt).toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{log.batch?.batchNumber || 'Unknown'}</TableCell>
                      <TableCell><Chip label={log.stage} size="small" variant="outlined" /></TableCell>
                      <TableCell>{log.wasteType}</TableCell>
                      <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>{Number(log.quantity).toFixed(2)}</TableCell>
                      <TableCell>{log.reason || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tab 1: Analysis & Optimization */}
      {activeTab === 1 && analytics && (
        <Grid container spacing={3}>
          {/* Charts Row */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Wastage by Stage</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.byStage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#8884d8" name="Quantity (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>Type Distribution</Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.byType}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="quantity"
                      nameKey="type"
                      label
                    >
                      {analytics.byType.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>7-Day Trend</Typography>
              <Box sx={{ height: 280, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="quantity" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Recommendations Section */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightbulbIcon color="warning" /> Smart Recommendations
            </Typography>
            <Grid container spacing={2}>
              {recommendations.map((rec: any, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Alert
                    severity={rec.type.toLowerCase() === 'critical' ? 'error' : rec.type.toLowerCase()}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                    action={
                      <Button color="inherit" size="small">
                        Apply Fix
                      </Button>
                    }
                  >
                    <AlertTitle sx={{ fontWeight: 'bold' }}>{rec.message}</AlertTitle>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Action:</strong> {rec.action}
                    </Typography>
                    <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1 }}>
                      <TrendingUpIcon fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                      Impact: {rec.impact}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}

      <WastageForm open={openForm} onClose={() => setOpenForm(false)} onSave={loadData} />
    </Box>
  );
}
