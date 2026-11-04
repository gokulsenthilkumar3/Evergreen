import { uiText, useUiLanguage, uiLocale, uiTemplate, formatUiCurrency, uiDateLocale } from "../i18n";
import React, { useState } from 'react';
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
  Alert,
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import {
  AccountBalance as FinanceIcon,
  ArrowForward as ArrowIcon,
  Description as InvoiceIcon,
  Factory as ProductionIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  PrecisionManufacturing as MachineIcon,
  Speed as LiveIcon,
  Storefront as StoreIcon,
  TrendingUp as InsightsIcon,
  VerifiedUser as QualityIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { isCompanyPageVisible, type CompanyProfile } from '@evergreen/types';
import BusinessFlowGuide from '../components/BusinessFlowGuide';

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
    get title() { return uiText("Yarn Operations & Mill Floor"); },
    category: 'Production & Waste',
    get description() { return uiText("Track inward yarn lots, spinning production, count-wise output, and waste dispatch in one integrated flow."); },
    page: 'dashboard',
    get action() { return uiText("Open operations"); },
    icon: <ProductionIcon />,
    color: '#059669',
  },
  {
    get title() { return uiText("Yarn ERP Suite (9 Dedicated Hubs)"); },
    category: 'Enterprise Mill Suite',
    get description() { return uiText("Explore machines, quality control, warehouses, staff and shifts. Review module readiness before operational use."); },
    page: 'yarnerp',
    get action() { return uiText("Launch Yarn ERP Hub"); },
    icon: <MachineIcon />,
    color: '#0ea5e9',
  },
  {
    get title() { return uiText("Business & Commerce Desk"); },
    category: 'Sales & Invoicing',
    get description() { return uiText("Manage the unified item catalogue, registered customers, GST compliant invoices, and customer ledgers."); },
    page: 'business',
    get action() { return uiText("Open Business Desk"); },
    icon: <InvoiceIcon />,
    color: '#7c3aed',
  },
  {
    get title() { return uiText("Job Work & Processing Control"); },
    category: 'External Challans',
    get description() { return uiText("Plan material dispatches to external dyers, knitters, and finishers; reconcile processed goods and scrap."); },
    page: 'jobwork',
    get action() { return uiText("Manage Job Work"); },
    icon: <ShippingIcon />,
    color: '#d97706',
  },
  {
    get title() { return uiText("Store & Inventory Management"); },
    category: 'Stock Control',
    get description() { return uiText("Review count-wise yarn stock and bag weights, then reconcile available material before dispatch."); },
    page: 'inventory',
    get action() { return uiText("View Inventory"); },
    icon: <InventoryIcon />,
    color: '#dc2626',
  },
  {
    get title() { return uiText("Financial & Commerce Reports"); },
    category: 'Intelligence',
    get description() { return uiText("Real-time sales invoices, receivables ageing, debtor ledgers, and operational exposure from the unified ledger."); },
    page: 'reports',
    get action() { return uiText("View Business Reports"); },
    icon: <FinanceIcon />,
    color: '#0284c7',
  },
];

interface UnifiedWorkspaceProps {
  onNavigate: (page: string) => void;
  profile?: Partial<CompanyProfile>;
}

const UnifiedWorkspace: React.FC<UnifiedWorkspaceProps> = ({ onNavigate, profile }) => {
  useUiLanguage();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState('');
  const report = useQuery<{ invoicedValue: number; receivables: number; openOrders: number; lowStock: unknown[]; openJobWork: number }>({
    queryKey: ['commerce-report'],
    queryFn: async () => (await api.get('/commerce/report')).data,
    refetchInterval: autoRefresh ? 30000 : false,
  });
  const machines = useQuery<Array<{ id: number }>>({
    queryKey: ['workspace-machines'],
    queryFn: async () => (await api.get('/machines')).data,
    refetchInterval: autoRefresh ? 30000 : false,
  });
  const health = useQuery<{ status: string }>({
    queryKey: ['workspace-health'],
    queryFn: async () => (await api.get('/health?format=json')).data,
    refetchInterval: autoRefresh ? 30000 : false,
  });
  const reportData = report.data;
  const money = (value: number | undefined) => value === undefined ? uiText('Unavailable') : formatUiCurrency(value);
  const visibleModules = modules.filter(module => isCompanyPageVisible(module.page, profile) && `${module.title} ${module.category} ${module.description} ${uiText(module.title)} ${uiText(module.category)} ${uiText(module.description)}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));

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
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={uiText("ENTERPRISE WORKSPACE")}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              color: 'common.white',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          />
          <Chip
            label={health.isError ? uiText("HEALTH UNAVAILABLE") : health.isPending ? uiText("CHECKING HEALTH") : health.data?.status === 'ok' ? uiText("API HEALTHY") : uiText("API DEGRADED")}
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.3)',
              color: 'common.white',
              fontWeight: 700,
            }}
          />
        </Stack>

        <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 700, mb: 1.5, fontSize: { xs: '2rem', md: '3rem' } }}>
          {uiText("EverGreen One Business Suite ")}</Typography>

        <Typography
          variant="h6"
          sx={{
            maxWidth: 780,
            color: 'rgba(255,255,255,0.85)',
            fontWeight: 400,
            lineHeight: 1.6,
          }}
        >
          {uiText("Follow daily work from material receipt through production, dispatch, invoicing and collection. Review the numbers and the next handoff in one workspace. ")}</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => onNavigate('dashboard')}
            endIcon={<ArrowIcon />}
            sx={{ color: '#065f46', fontWeight: 800, px: 3, py: 1 }}
          >
            {uiText("Open Mill Dashboard ")}</Button>
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
            {uiText("Yarn ERP Hub (9 Modules) ")}</Button>
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
            {uiText("Business Desk & Invoices ")}</Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <FormControlLabel control={<Switch checked={autoRefresh} onChange={(_, checked) => setAutoRefresh(checked)} />} label={uiText("Refresh every 30 seconds", 'forms')} />
        <Button disabled={report.isFetching || machines.isFetching || health.isFetching} onClick={() => { void report.refetch(); void machines.refetch(); void health.refetch(); }}>{uiText("Refresh now")}</Button>
        <Typography variant="caption" color="text.secondary" role="status">{report.dataUpdatedAt ? uiTemplate`Business data checked ${new Date(report.dataUpdatedAt).toLocaleTimeString(uiDateLocale())}` : uiText("Waiting for business data")}</Typography>
      </Stack>
      {(report.isError || machines.isError) && <Alert severity="warning" sx={{ mb: 2 }}>{uiText("Some workspace data could not be refreshed. Existing values may be out of date; unavailable values are not zero. Use Refresh now to retry.")}</Alert>}
      {report.isPending && <Alert severity="info" sx={{ mb: 2 }}>{uiText("Loading business data…")}</Alert>}

      {/* Live System KPIs Strip */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {uiText("INVOICED VALUE ")}</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'success.main', mt: 0.5 }}>
                {money(reportData?.invoicedValue)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uiText("Invoiced sales, before payment collection ")}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {uiText("RECEIVABLES DUE ")}</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'error.main', mt: 0.5 }}>
                {money(reportData?.receivables)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uiText("Pending customer balances ")}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {uiText("OPEN SALES ORDERS ")}</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'primary.main', mt: 0.5 }}>
                {reportData ? uiTemplate`${reportData.openOrders} orders` : uiText("Unavailable")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uiText("Pending dispatch / delivery ")}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {uiText("REGISTERED MACHINES ")}</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: 'info.main', mt: 0.5 }}>
                {machines.data?.length ?? 'Unavailable'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {uiText("Equipment register, not live telemetry ")}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {reportData && <Alert severity={reportData.lowStock.length || reportData.receivables > 0 ? 'warning' : 'success'} sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => onNavigate('reports')}>{uiText("Review")}</Button>}>
        {reportData.lowStock.length} {uiText(" catalogue items at or below reorder level · ")}{reportData.openOrders} {uiText(" open orders · ")}{reportData.openJobWork} {uiText(" open job-work challans. Review receivables before closing the day. ")}</Alert>}
      <BusinessFlowGuide onNavigate={onNavigate} profile={profile} />

      {/* Primary Workspace Modules */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
        {uiText("Integrated Workspaces ")}</Typography>
      <TextField fullWidth size="small" label={uiText("Find a workspace", 'forms')} value={search} onChange={event => setSearch(event.target.value)} sx={{ mb: 2 }} />
      {!visibleModules.length && <Alert severity="info">{uiText("No matching workspaces. Try “stock”, “sales” or “production”.")}</Alert>}

      <Grid container spacing={2.5}>
        {visibleModules.map((module) => (
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
                  label={uiText(module.category)}
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
                {uiText(module.title)}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.65, flexGrow: 1 }}
              >
                {uiText(module.description)}
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
                {uiText(module.action)}
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
          <Typography fontWeight={800}>{uiText("Unified Inventory, Customers & Ledgers")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {uiText("Review stock, orders and invoice balances together. Reconcile legacy mill movements with the commerce ledger before closing the day. ")}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<LiveIcon />}
            onClick={() => onNavigate('yarnlive')}
          >
            {uiText("Live Monitor ")}</Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<QualityIcon />}
            onClick={() => onNavigate('yarnquality')}
          >
            {uiText("Quality Lab ")}</Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<InsightsIcon />}
            onClick={() => onNavigate('reports')}
          >
            {uiText("Financials ")}</Button>
        </Stack>
      </Paper>
      <Stack direction="row" spacing={2} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
        <Button onClick={() => onNavigate('tutorial')}>{uiText("Workflow documentation")}</Button>
        <Button href="/api/docs" target="_blank" rel="noopener">{uiText("API explorer (development)")}</Button>
      </Stack>
    </Box>
  );
};

export default UnifiedWorkspace;
