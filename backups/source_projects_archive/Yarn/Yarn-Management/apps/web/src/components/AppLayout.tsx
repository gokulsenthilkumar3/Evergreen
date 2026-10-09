import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import FactoryIcon from '@mui/icons-material/Factory';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import SettingsIcon from '@mui/icons-material/Settings';
import BusinessIcon from '@mui/icons-material/Business';
import HighQualityIcon from '@mui/icons-material/HighQuality';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import { http } from '../lib/http';
import { clearAccessToken } from '../lib/auth';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import NewsFeedWidget from './widgets/NewsFeedWidget';

const drawerWidth = 240;

type NavItem = {
  label: string;
  to: string;
  icon: React.ReactElement;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
  { label: 'News Intelligence', to: '/news-intelligence', icon: <AnnouncementIcon /> },
  { label: 'Demand Forecasting', to: '/demand-forecasting', icon: <AutoGraphIcon /> },
  { label: 'Procurement', to: '/procurement', icon: <ShoppingCartIcon /> },
  { label: 'Supplier Onboarding', to: '/suppliers/onboarding', icon: <BusinessIcon /> },
  { label: 'Manufacturing', to: '/manufacturing', icon: <FactoryIcon /> },
  { label: 'Planning', to: '/production-planning', icon: <FactoryIcon /> },
  { label: 'Work Orders', to: '/work-orders', icon: <DescriptionIcon /> },
  { label: 'Shifts', to: '/shifts', icon: <FactoryIcon /> }, // Added missing item
  { label: 'Machines', to: '/machines', icon: <FactoryIcon /> }, // Added missing item
  { label: 'Live Production', to: '/production/live', icon: <FactoryIcon /> },
  { label: 'Production Efficiency', to: '/production/efficiency', icon: <BarChartIcon /> },
  { label: 'Quality Control', to: '/quality-control', icon: <HighQualityIcon /> },
  { label: 'Quality Analytics', to: '/quality-analytics', icon: <BarChartIcon /> },
  { label: 'Wastage', to: '/wastage', icon: <DescriptionIcon /> },
  { label: 'Inventory', to: '/inventory', icon: <InventoryIcon /> },
  { label: 'Warehouse', to: '/warehouse', icon: <WarehouseIcon /> },
  { label: 'Scanner', to: '/warehouse/scanner', icon: <DescriptionIcon /> },
  { label: 'Optimization', to: '/warehouse/optimization', icon: <WarehouseIcon /> }, // Added missing item
  { label: 'Reconciliation', to: '/warehouse/reconciliation', icon: <WarehouseIcon /> }, // Added missing item
  { label: 'Customers', to: '/customers', icon: <PeopleIcon /> },
  { label: 'Sales Orders', to: '/sales/orders', icon: <ShoppingCartIcon /> },
  { label: 'Billing', to: '/billing', icon: <ReceiptIcon /> },
  { label: 'Employees', to: '/hr/employees', icon: <GroupIcon /> },
  { label: 'Payroll', to: '/hr/payroll', icon: <ReceiptIcon /> },
  { label: 'Documents', to: '/documents', icon: <DescriptionIcon /> },
  { label: 'Communication', to: '/communication', icon: <AnnouncementIcon /> },
  { label: 'Support', to: '/support', icon: <SupportAgentIcon /> },
  { label: 'Accounts Receivable', to: '/finance/ar', icon: <ReceiptIcon /> }, // Added missing item
  { label: 'Accounts Payable', to: '/finance/ap', icon: <ReceiptIcon /> }, // Added missing item
  { label: 'Reports', to: '/reports', icon: <BarChartIcon /> },
  { label: 'Integrations', to: '/integrations', icon: <SettingsIcon /> }, // Added missing item
  { label: 'Developer', to: '/developer', icon: <SettingsIcon /> }, // Added missing item
  { label: 'Users', to: '/users', icon: <GroupIcon /> }, // Added missing item
  { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
];

import { useAppSettings } from '../context/AppSettingsContext';

export default function AppLayout() {
  const { isModuleEnabled, generalSettings } = useAppSettings();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Update Favicon
  useEffect(() => {
    if (generalSettings.logoUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = generalSettings.logoUrl;
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = generalSettings.logoUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [generalSettings.logoUrl]);

  async function logout() {
    try {
      await http.post('/auth/logout');
    } finally {
      clearAccessToken();
      navigate('/login', { replace: true });
    }
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <List>
          {navItems.filter(item => {
            if (['/dashboard', '/users', '/support'].includes(item.to)) return true;
            // Hide Settings when collapsed to avoid clutter
            if (item.to === '/settings') return !isSidebarCollapsed;

            if (item.to.startsWith('/procurement') || item.to.startsWith('/suppliers')) return isModuleEnabled('procurement');
            if (['/production', '/work-orders', '/shifts', '/machines', '/manufacturing', '/wastage', '/demand-forecasting'].some(p => item.to.startsWith(p))) return isModuleEnabled('manufacturing');
            if (item.to.startsWith('/quality')) return isModuleEnabled('quality');
            if (item.to.startsWith('/inventory')) return isModuleEnabled('inventory');
            if (item.to.startsWith('/warehouse')) return isModuleEnabled('warehouse');
            if (item.to.startsWith('/customers')) return isModuleEnabled('customers');
            if (item.to.startsWith('/sales')) return isModuleEnabled('sales');
            if (item.to.startsWith('/billing') || item.to.startsWith('/finance')) return isModuleEnabled('finance');
            if (item.to.startsWith('/hr')) return isModuleEnabled('hr');
            if (item.to.startsWith('/documents')) return isModuleEnabled('documents');
            if (item.to.startsWith('/communication')) return isModuleEnabled('communication');
            if (item.to.startsWith('/reports')) return isModuleEnabled('reports');
            if (item.to.startsWith('/integrations')) return isModuleEnabled('integrations');
            if (item.to.startsWith('/developer')) return isModuleEnabled('developer');
            return true;
          }).map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                justifyContent: isSidebarCollapsed ? 'center' : 'initial',
                px: 2.5,
                [`&.active`]: {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' }
                },
                minHeight: 48,
              }}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: isSidebarCollapsed ? 0 : 1,
                  display: isSidebarCollapsed ? 'none' : 'block',
                  whiteSpace: 'nowrap'
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme: any) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={isMobile ? handleDrawerToggle : toggleSidebar}
              sx={{ mr: 1, display: { xs: 'flex', md: 'flex' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', mr: 2 }}>
              {generalSettings.logoUrl ? (
                <Box sx={{
                  bgcolor: 'white',
                  borderRadius: 1,
                  p: 0.5,
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Box
                    component="img"
                    src={generalSettings.logoUrl}
                    alt="Logo"
                    sx={{
                      height: 32,
                      width: 'auto',
                      objectFit: 'contain',
                      maxWidth: 100
                    }}
                  />
                </Box>
              ) : null}
              {generalSettings.companyName || 'Yarn Management'}
            </Typography>
            <Typography variant="h6" noWrap sx={{ display: { xs: 'block', sm: 'none' } }}>
              YM
            </Typography>
          </Box>

          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            maxWidth: { xs: 300, sm: 600 },
            mx: 'auto'
          }}>
            <GlobalSearch />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NewsFeedWidget />
            <NotificationCenter />
            <Button
              color="inherit"
              onClick={logout}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Logout
            </Button>
            <IconButton
              color="inherit"
              onClick={logout}
              sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              size="small"
            >
              <Typography variant="caption">Exit</Typography>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: isSidebarCollapsed ? 0 : drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          [`& .MuiDrawer-paper`]: {
            width: isSidebarCollapsed ? 0 : drawerWidth,
            boxSizing: 'border-box',
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            borderRight: isSidebarCollapsed ? 'none' : '1px solid rgba(0, 0, 0, 0.12)', // Hide border when collapsed
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
