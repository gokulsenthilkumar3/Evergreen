import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccountBalance as FinanceIcon,
  ArrowForward as ArrowIcon,
  Build as MaintenanceIcon,
  Description as InvoiceIcon,
  Factory as ProductionIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  PrecisionManufacturing as MachineIcon,
  ReceiptLong as ReceiptIcon,
  Speed as LiveIcon,
  Storefront as StoreIcon,
  TrendingUp as InsightsIcon,
  VerifiedUser as QualityIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

type WorkspaceModule = {
  title: string;
  category: string;
  description: string;
  page: string;
  action: string;
  icon: React.ReactNode;
  color: string;
};

const modules: WorkspaceModule[] = [
  {
    title: 'Yarn Operations & Mill Floor',
    category: 'Production & Waste',
    description: 'Track inward yarn lots, spinning production, count-wise output, and waste dispatch in one integrated flow.',
    page: 'dashboard',
    action: 'Open operations',
    icon: <ProductionIcon />,
    color: '#059669',
  },
  {
    title: 'Yarn ERP Suite (9 Dedicated Hubs)',
    category: 'Enterprise Mill Suite',
    description: 'Central management for Machines, Lab Quality Control, Warehouses, Staff & Payroll, Shifts, and AI Forecasting.',
    page: 'yarnerp',
    action: 'Launch Yarn ERP Hub',
    icon: <MachineIcon />,
    color: '#0ea5e9',
  },
  {
    title: 'Business & Commerce Desk',
    category: 'Sales & Invoicing',
    description: 'Manage the unified item catalogue, registered customers, GST compliant invoices, and customer ledgers.',
    page: 'business',
    action: 'Open Business Desk',
    icon: <InvoiceIcon />,
    color: '#7c3aed',
  },
  {
    title: 'Job Work & Processing Control',
    category: 'External Challans',
    description: 'Plan material dispatches to external dyers, knitters, and finishers; reconcile processed goods and scrap.',
    page: 'jobwork',
    action: 'Manage Job Work',
    icon: <ShippingIcon />,
    color: '#d97706',
  },
  {
    title: 'Store & Inventory Management',
    category: 'Stock Control',
    description: 'Monitor count-wise yarn stocks, bag weights, location bins, and automatic low-stock reorder thresholds.',
    page: 'inventory',
    action: 'View Inventory',
    icon: <InventoryIcon />,
    color: '#dc2626',
  },
  {
    title: 'Financial & Commerce Reports',
    category: 'Intelligence',
    description: 'Real-time sales invoices, receivables ageing, debtor ledgers, and operational exposure from the unified ledger.',
    page: 'reports',
    action: 'View Business Reports',
    icon: <FinanceIcon />,
    color: '#0284c7',
  },
];

interface UnifiedWorkspaceProps {
  onNavigate: (page: string) => void;
}

const UnifiedWorkspace: React.FC<UnifiedWorkspaceProps> = ({ onNavigate }) => {
  const { data: reportData } = useQuery({
    queryKey: ['commerce-report'],
    queryFn: async () => (await api.get('/commerce/report')).data,
  });

  const { data: machineStats } = useQuery({
    queryKey: ['machines-stats'],
    queryFn: async () => {
      try {
        return (await api.get('/machines/stats')).data;
      } catch {
        return null;
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', width: '100%' }}>
      {/* Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          mb: 3,
          overflow: 'hidden',
          position: 'relative',
          borderRadius: 4,
          color: 'common.white',
          background: 'linear-gradient(125deg, #064e3b 0%, #047857 45%, #0f766e 100%)',
          boxShadow: '0 10px 30px -10px rgba(5, 150, 105, 0.4)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            right: -100,
            top: -180,
            bgcolor: 'rgba(255,255,255,0.08)',
          }}
        />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label="ENTERPRISE WORKSPACE"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              color: 'common.white',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          />
          <Chip
            label="ALL SYSTEMS OPERATIONAL"
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.3)',
              color: 'common.white',
              fontWeight: 700,
            }}
          />
        </Stack>

        <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 700, mb: 1.5 }}>
          EverGreen One Business Suite
        </Typography>

        <Typography
          variant="h6"
          sx={{
            maxWidth: 780,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          Unified textile & yarn ERP connecting yarn spinning, external job work, warehouse logistics, GST invoicing, and financial ledgers into one central source of truth.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => onNavigate('dashboard')}
            endIcon={<ArrowIcon />}
            sx={{ color: '#065f46', fontWeight: 800, px: 3, py: 1 }}
          >
            Open Mill Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => onNavigate('yarnerp')}
            sx={{
              color: 'common.white',
              borderColor: 'rgba(255,255,255,0.65)',
              fontWeight: 700,
              px: 3,
            }}
          >
            Yarn ERP Hub (9 Modules)
          </Button>
          <Button
            variant="outlined"
            onClick={() => onNavigate('business')}
            sx={{
              color: 'common.white',
              borderColor: 'rgba(255,255,255,0.65)',
              fontWeight: 700,
              px: 3,
            }}
          >
            Business Desk & Invoices
          </Button>
        </Stack>
      </Paper>

      {/* Live System KPIs Strip */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                INVOICED VALUE
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'success.main', mt: 0.5 }}>
                ₹{Number(reportData?.invoicedValue ?? 0).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Consolidated sales revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                RECEIVABLES DUE
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'error.main', mt: 0.5 }}>
                ₹{Number(reportData?.receivables ?? 0).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending customer balances
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                OPEN SALES ORDERS
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'primary.main', mt: 0.5 }}>
                {reportData?.openOrders ?? 0} Orders
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending dispatch / delivery
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                MILL MACHINES RUNNING
              </Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'info.main', mt: 0.5 }}>
                {machineStats?.running ?? machineStats?.total ?? 'Active'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Production equipment online
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Primary Workspace Modules */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        Integrated Workspaces
      </Typography>

      <Grid container spacing={2.5}>
        {modules.map((module) => (
          <Grid key={module.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: 4,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    color: module.color,
                    bgcolor: `${module.color}15`,
                    display: 'flex',
                  }}
                >
                  {module.icon}
                </Box>
                <Chip
                  label={module.category}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: `${module.color}44`,
                    color: module.color,
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Typography variant="h6" fontWeight={800}>
                {module.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.65, flexGrow: 1 }}
              >
                {module.description}
              </Typography>

              <Button
                onClick={() => onNavigate(module.page)}
                endIcon={<ArrowIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  mt: 2,
                  px: 0,
                  color: module.color,
                  fontWeight: 800,
                }}
              >
                {module.action}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions Footer */}
      <Paper
        variant="outlined"
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
          <StoreIcon />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography fontWeight={800}>Unified Inventory, Customers & Ledgers</Typography>
          <Typography variant="body2" color="text.secondary">
            Shared stock records ensure zero discrepancies between shop orders, warehouse lots, and GST invoices.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LiveIcon />}
            onClick={() => onNavigate('yarnlive')}
          >
            Live Monitor
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<QualityIcon />}
            onClick={() => onNavigate('yarnquality')}
          >
            Quality Lab
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<InsightsIcon />}
            onClick={() => onNavigate('reports')}
          >
            Financials
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UnifiedWorkspace;
