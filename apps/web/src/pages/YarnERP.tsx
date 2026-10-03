import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Paper,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  PrecisionManufacturing as MachineIcon,
  VerifiedUser as QualityIcon,
  Schedule as ShiftIcon,
  Warehouse as WarehouseIcon,
  People as HRIcon,
  TrendingUp as ForecastIcon,
  LocalShipping as SupplierIcon,
  Gavel as ComplianceIcon,
  Factory as FactoryIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface YarnModule {
  title: string;
  description: string;
  icon: React.ReactNode;
  page: string;
  color: string;
  category: string;
}

const MODULES: YarnModule[] = [
  {
    title: 'Machine Status Overview',
    description: 'Live machine status, spindle speed, output rate & telemetry breakdown',
    icon: <SpeedIcon sx={{ fontSize: 32 }} />,
    page: 'yarnlive',
    color: '#059669',
    category: 'Production',
  },
  {
    title: 'Machine Management',
    description: 'Asset registry, preventive maintenance schedules & breakdown logging',
    icon: <MachineIcon sx={{ fontSize: 32 }} />,
    page: 'yarnmachine',
    color: '#3b82f6',
    category: 'Plant Maintenance',
  },
  {
    title: 'Quality Control',
    description: 'Lab test logs, yarn count verification, RKM tenacity & imperfection audits',
    icon: <QualityIcon sx={{ fontSize: 32 }} />,
    page: 'yarnquality',
    color: '#8b5cf6',
    category: 'Quality Assurance',
  },
  {
    title: 'Shift Management',
    description: 'Roster planning, shift timing configurations & attendance tracking',
    icon: <ShiftIcon sx={{ fontSize: 32 }} />,
    page: 'yarnshift',
    color: '#f59e0b',
    category: 'Operations',
  },
  {
    title: 'Warehouse & Godown Management',
    description: 'Multi-location storage, zone tracking, internal transfers & stock movement',
    icon: <WarehouseIcon sx={{ fontSize: 32 }} />,
    page: 'yarnwarehouse',
    color: '#0ea5e9',
    category: 'Inventory',
  },
  {
    title: 'HR & Payroll',
    description: 'Staff directory, wage structures, attendance records & monthly payroll',
    icon: <HRIcon sx={{ fontSize: 32 }} />,
    page: 'yarnhr',
    color: '#ec4899',
    category: 'Human Resources',
  },
  {
    title: 'Demand Forecasting',
    description: 'Sales order moving averages, order projections & spinning planning',
    icon: <ForecastIcon sx={{ fontSize: 32 }} />,
    page: 'yarnforecast',
    color: '#14b8a6',
    category: 'Analytics',
  },
  {
    title: 'Supplier Portal',
    description: 'Vendor directory, purchase order status, delivery challans & payments',
    icon: <SupplierIcon sx={{ fontSize: 32 }} />,
    page: 'yarnsupplier',
    color: '#f97316',
    category: 'Procurement',
  },
  {
    title: 'Compliance Readiness',
    description: 'Labour standards, environmental clearance & factory audit readiness',
    icon: <ComplianceIcon sx={{ fontSize: 32 }} />,
    page: 'yarncompliance',
    color: '#6b7280',
    category: 'Statutory',
  },
];

interface YarnERPProps {
  onNavigate?: (page: string) => void;
}

const YarnERP: React.FC<YarnERPProps> = ({ onNavigate }) => (
  <Box sx={{ width: '100%' }}>
    {/* Banner */}
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        mb: 4,
        borderRadius: 4,
        color: 'common.white',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <FactoryIcon sx={{ fontSize: 40, color: '#10b981' }} />
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
            Yarn ERP Suite
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
            Comprehensive textile manufacturing operations: spinning, machines, QA, shifts, warehouse, and compliance.
          </Typography>
        </Box>
      </Box>
    </Paper>

    {/* Module Grid */}
    <Grid container spacing={2.5}>
      {MODULES.map((m) => (
        <Grid key={m.page} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              transition: 'all 0.22s ease-in-out',
              '&:hover': {
                borderColor: m.color,
                boxShadow: `0 8px 24px ${m.color}25`,
                transform: 'translateY(-3px)',
              },
            }}
          >
            <CardActionArea
              sx={{ height: '100%', p: 1 }}
              onClick={() => onNavigate?.(m.page)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      color: m.color,
                      bgcolor: `${m.color}16`,
                      borderRadius: 2.5,
                      p: 1.25,
                      display: 'flex',
                    }}
                  >
                    {m.icon}
                  </Box>
                  <Chip
                    label={m.category}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderColor: `${m.color}40`,
                      color: m.color,
                    }}
                  />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                    {m.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, lineHeight: 1.5 }}
                  >
                    {m.description}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: m.color,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    pt: 1,
                  }}
                >
                  Launch Workspace <ArrowForwardIcon fontSize="small" />
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
