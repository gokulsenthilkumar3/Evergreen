import React from 'react';
import {
  Box, Button, Chip, Grid, Paper, Stack, Typography,
} from '@mui/material';
import {
  AccountBalanceWallet as AccountsIcon,
  ArrowForward as ArrowIcon,
  Description as InvoiceIcon,
  Factory as ProductionIcon,
  Inventory2 as InventoryIcon,
  PeopleAlt as CustomersIcon,
  Storefront as StoreIcon,
  TrendingUp as InsightsIcon,
} from '@mui/icons-material';

type WorkspaceModule = {
  title: string;
  description: string;
  page: string;
  action: string;
  icon: React.ReactNode;
  color: string;
};

const modules: WorkspaceModule[] = [
  {
    title: 'Yarn operations',
    description: 'Track inward lots, production, waste, stock and dispatch in one flow.',
    page: 'dashboard', action: 'Open operations', icon: <ProductionIcon />, color: '#059669',
  },
  {
    title: 'Job work & production',
    description: 'Plan material movement, job work, production receipts and count-wise output.',
    page: 'jobwork', action: 'Manage job work', icon: <InventoryIcon />, color: '#0ea5e9',
  },
  {
    title: 'GST invoicing',
    description: 'Create branded invoices, quotations, delivery challans and printable sales documents.',
    page: 'invoicestudio', action: 'Create invoice', icon: <InvoiceIcon />, color: '#7c3aed',
  },
  {
    title: 'MSME business desk',
    description: 'Keep customer and vendor ledgers, dues, payment links and bank reconciliation together.',
    page: 'customers', action: 'Open business desk', icon: <CustomersIcon />, color: '#ea580c',
  },
];

interface UnifiedWorkspaceProps {
  onNavigate: (page: string) => void;
}

const UnifiedWorkspace: React.FC<UnifiedWorkspaceProps> = ({ onNavigate }) => (
  <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 }, mb: 3, overflow: 'hidden', position: 'relative',
        borderRadius: 4, color: 'common.white',
        background: 'linear-gradient(120deg, #064e3b 0%, #047857 52%, #0f766e 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', right: -100, top: -170, bgcolor: 'rgba(255,255,255,0.08)' }} />
      <Chip label="ONE BUSINESS APP" size="small" sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.16)', color: 'common.white', fontWeight: 800, letterSpacing: '0.08em' }} />
      <Typography variant="h3" sx={{ fontWeight: 800, maxWidth: 680, mb: 1.5 }}>
        EverGreen One
      </Typography>
      <Typography variant="h6" sx={{ maxWidth: 720, color: 'rgba(255,255,255,0.82)', fontWeight: 400, lineHeight: 1.55 }}>
        Your yarn mill, shop floor, invoices and MSME accounts now work as one connected business system.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button variant="contained" color="inherit" onClick={() => onNavigate('dashboard')} endIcon={<ArrowIcon />} sx={{ color: '#065f46', fontWeight: 800 }}>
          View business dashboard
        </Button>
        <Button variant="outlined" onClick={() => onNavigate('invoicestudio')} sx={{ color: 'common.white', borderColor: 'rgba(255,255,255,.55)', fontWeight: 700 }}>
          New invoice
        </Button>
      </Stack>
    </Paper>

    <Grid container spacing={2.5}>
      {modules.map((module) => (
        <Grid key={module.title} size={{ xs: 12, sm: 6 }}>
          <Paper variant="outlined" sx={{ p: 3, height: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ p: 1.25, borderRadius: 2.5, color: module.color, bgcolor: `${module.color}18` }}>{module.icon}</Box>
              <Chip label="Integrated workflow" size="small" variant="outlined" sx={{ borderColor: `${module.color}55`, color: module.color, fontWeight: 700 }} />
            </Box>
            <Typography variant="h6" fontWeight={800}>{module.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.65, flexGrow: 1 }}>{module.description}</Typography>
            <Button onClick={() => onNavigate(module.page)} endIcon={<ArrowIcon />} sx={{ alignSelf: 'flex-start', mt: 2, px: 0, color: module.color, fontWeight: 800 }}>
              {module.action}
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>

    <Paper variant="outlined" sx={{ mt: 3, p: 2.5, borderRadius: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}><StoreIcon /></Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography fontWeight={800}>One catalogue, one source of truth</Typography>
        <Typography variant="body2" color="text.secondary">Inventory, sales documents and customer balances are available from the same navigation.</Typography>
      </Box>
      <Button variant="outlined" startIcon={<InsightsIcon />} onClick={() => onNavigate('insights')}>Business insights</Button>
      <Button variant="outlined" startIcon={<AccountsIcon />} onClick={() => onNavigate('payments')}>Payments & ledgers</Button>
    </Paper>
  </Box>
);

export default UnifiedWorkspace;
