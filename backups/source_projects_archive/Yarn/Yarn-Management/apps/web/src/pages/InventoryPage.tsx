import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import RawMaterialList from '../components/RawMaterialList';
import FinishedGoodsList from '../components/inventory/FinishedGoodsList';
import { http } from '../lib/http';

export default function InventoryPage() {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState({
    totalRawMaterial: 0,
    totalFinishedGoods: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    // Fetch stats (Mock or simple aggregation calls)
    async function loadStats() {
      try {
        const [rmRes, fgRes] = await Promise.all([
          http.get('/raw-materials'),
          http.get('/finished-goods')
        ]);

        const rmTotal = rmRes.data.rawMaterials.reduce((sum: number, i: any) => sum + Number(i.quantity), 0);
        const fgTotal = fgRes.data.finishedGoods.reduce((sum: number, i: any) => sum + Number(i.producedQuantity), 0);
        // Assume low stock if RM < 1000kg
        const lowStock = rmRes.data.rawMaterials.filter((i: any) => Number(i.quantity) < 1000).length;

        setStats({
          totalRawMaterial: rmTotal,
          totalFinishedGoods: fgTotal,
          lowStockItems: lowStock
        });
      } catch (e) {
        console.error(e);
      }
    }
    loadStats();
  }, []);

  const KPICard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: `${color}15`,
          color: color,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: 'text.primary' }}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: '800', color: 'text.primary' }}>Inventory Overview</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Raw Material Stock (kg)"
            value={stats.totalRawMaterial.toLocaleString()}
            icon={<CategoryIcon fontSize="large" />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Finished Goods Stock (kg)"
            value={stats.totalFinishedGoods.toLocaleString()}
            icon={<InventoryIcon fontSize="large" />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <KPICard
            title="Low Stock Alerts"
            value={stats.lowStockItems}
            icon={<WarningIcon fontSize="large" />}
            color="#ef4444"
          />
        </Grid>
      </Grid>


      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Raw Materials" />
          <Tab label="Finished Goods" />
        </Tabs>
      </Box>

      <Box role="tabpanel" hidden={tab !== 0}>
        {tab === 0 && <RawMaterialList />}
      </Box>
      <Box role="tabpanel" hidden={tab !== 1}>
        {tab === 1 && <FinishedGoodsList />}
      </Box>
    </Box>
  );
}
