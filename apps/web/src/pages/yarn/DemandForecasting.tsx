import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Refresh as RefreshIcon, AutoAwesome as AIIcon } from '@mui/icons-material';
const FORECAST_DATA = [
  { month: 'Oct', demand: 42000, actual: null, orders: 38000 },
  { month: 'Nov', demand: 45000, actual: null, orders: 41000 },
  { month: 'Dec', demand: 52000, actual: null, orders: 48000 },
];
const HISTORICAL = [
  { month: 'Apr', actual: 35000 },{ month: 'May', actual: 38000 },{ month: 'Jun', actual: 41000 },
  { month: 'Jul', actual: 39000 },{ month: 'Aug', actual: 43000 },{ month: 'Sep', actual: 44000 },
];
const RECO = [
  { count: '40s', currentStock: 1200, forecastDemand: 2800, recommendation: 'Order 1600 kg', urgency: 'High' },
  { count: '30s', currentStock: 800, forecastDemand: 1500, recommendation: 'Order 700 kg', urgency: 'Medium' },
  { count: '60s', currentStock: 2100, forecastDemand: 1800, recommendation: 'Sufficient stock', urgency: 'Low' },
];
const DemandForecasting: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><AIIcon color="primary" sx={{ fontSize: 32 }} /><Box><Typography variant="h4" fontWeight={800}>Demand Forecasting</Typography><Typography color="text.secondary">AI-powered demand analysis & procurement recommendations</Typography></Box></Box>
      <Button variant="outlined" startIcon={<RefreshIcon />} size="small">Regenerate</Button>
    </Box>
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography fontWeight={700} sx={{ mb: 2 }}>3-Month Demand Forecast</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={FORECAST_DATA}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><RTooltip formatter={(v: any) => `${Number(v).toLocaleString('en-IN')} kg`} /><Bar dataKey="demand" fill="#059669" radius={[4,4,0,0]} name="Forecast" /><Bar dataKey="orders" fill="#3b82f6" radius={[4,4,0,0]} name="Confirmed Orders" /></BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography fontWeight={700} sx={{ mb: 2 }}>Historical Trend (Apr–Sep)</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={HISTORICAL}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><RTooltip formatter={(v: any) => `${Number(v).toLocaleString('en-IN')} kg`} /><Line type="monotone" dataKey="actual" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} name="Actual" /></LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
    <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}><AIIcon color="primary" fontSize="small" /><Typography fontWeight={700}>AI Procurement Recommendations</Typography></Box>
      <TableContainer><Table size="small">
        <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}>
          <TableCell sx={{ fontWeight: 700 }}>Yarn Count</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Current Stock</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Forecast Demand</TableCell><TableCell sx={{ fontWeight: 700 }}>Recommendation</TableCell><TableCell sx={{ fontWeight: 700 }}>Urgency</TableCell>
        </TableRow></TableHead>
        <TableBody>{RECO.map(r=>(
          <TableRow key={r.count} hover>
            <TableCell><Typography variant="body2" fontWeight={700}>{r.count}</Typography></TableCell>
            <TableCell align="right">{r.currentStock.toLocaleString('en-IN')} kg</TableCell>
            <TableCell align="right">{r.forecastDemand.toLocaleString('en-IN')} kg</TableCell>
            <TableCell><Typography variant="body2" fontWeight={600} color={r.urgency==='High'?'error.main':r.urgency==='Medium'?'warning.main':'text.secondary'}>{r.recommendation}</Typography></TableCell>
            <TableCell><Chip label={r.urgency} size="small" color={r.urgency==='High'?'error':r.urgency==='Medium'?'warning':'success'} variant="outlined" /></TableCell>
          </TableRow>
        ))}</TableBody>
      </Table></TableContainer>
    </Paper>
  </Box>
);
export default DemandForecasting;
