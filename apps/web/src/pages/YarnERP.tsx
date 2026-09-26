import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Chip } from '@mui/material';
import {
  Speed as SpeedIcon, PrecisionManufacturing as MachineIcon, VerifiedUser as QualityIcon,
  Schedule as ShiftIcon, Warehouse as WarehouseIcon, People as HRIcon,
  TrendingUp as ForecastIcon, LocalShipping as SupplierIcon, Gavel as ComplianceIcon,
  Factory as FactoryIcon,
} from '@mui/icons-material';

interface YarnModule {
  title: string;
  description: string;
  icon: React.ReactNode;
  page: string;
  color: string;
  badge?: string;
}

const MODULES: YarnModule[] = [
  { title: 'Production Dashboard Preview', description: 'Sample machine OEE, spindle status and batch tracking layout', icon: <SpeedIcon sx={{ fontSize: 36 }} />, page: 'yarnlive', color: '#059669', badge: 'Preview' },
  { title: 'Machine Management', description: 'Machine registry, maintenance log, capacity planning', icon: <MachineIcon sx={{ fontSize: 36 }} />, page: 'yarnmachine', color: '#3b82f6' },
  { title: 'Quality Control', description: 'Inspection workflows, rejection tracking, analytics', icon: <QualityIcon sx={{ fontSize: 36 }} />, page: 'yarnquality', color: '#8b5cf6' },
  { title: 'Shift Management', description: 'Shift scheduling, attendance, efficiency tracking', icon: <ShiftIcon sx={{ fontSize: 36 }} />, page: 'yarnshift', color: '#f59e0b' },
  { title: 'Warehouse Management', description: 'Multi-location stock, bin tracking, stock transfer', icon: <WarehouseIcon sx={{ fontSize: 36 }} />, page: 'yarnwarehouse', color: '#0ea5e9' },
  { title: 'HR & Payroll', description: 'Employee records, attendance, salary processing', icon: <HRIcon sx={{ fontSize: 36 }} />, page: 'yarnhr', color: '#ec4899' },
  { title: 'Demand Forecasting Preview', description: 'Sample demand analysis and procurement recommendations layout', icon: <ForecastIcon sx={{ fontSize: 36 }} />, page: 'yarnforecast', color: '#14b8a6', badge: 'Preview' },
  { title: 'Supplier Portal', description: 'Supplier onboarding, performance rating, PO management', icon: <SupplierIcon sx={{ fontSize: 36 }} />, page: 'yarnsupplier', color: '#f97316' },
  { title: 'Compliance Reports', description: 'Labour law, environmental, statutory filings', icon: <ComplianceIcon sx={{ fontSize: 36 }} />, page: 'yarncompliance', color: '#6b7280' },
];

const YarnERP: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <FactoryIcon color="primary" sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h4" fontWeight={800}>Yarn ERP</Typography>
          <Typography color="text.secondary">Yarn capability previews; operational integration is still in progress.</Typography>
        </Box>
      </Box>
    </Box>

    <Grid container spacing={2.5}>
      {MODULES.map(m => (
        <Grid key={m.page} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, height: '100%', border: `1.5px solid`, borderColor: 'divider', transition: 'all 0.22s', '&:hover': { borderColor: m.color, boxShadow: `0 4px 20px ${m.color}30`, transform: 'translateY(-3px)' } }}>
            <CardActionArea sx={{ height: '100%', p: 0.5 }} onClick={() => onNavigate?.(m.page)}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ color: m.color, bgcolor: `${m.color}18`, borderRadius: 2.5, p: 1.5, display: 'flex' }}>{m.icon}</Box>
                  {m.badge && <Chip label={m.badge} size="small" sx={{ bgcolor: m.color, color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />}
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>{m.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>{m.description}</Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);
export default YarnERP;
