import { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  TrendingDown as WasteIcon,
  AccountBalanceWallet as CostIcon,
  Receipt as BillingIcon,
  TrendingUp,
  TrendingUp as OutwardIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import { getTheme } from './theme';

import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InwardEntry from './pages/InwardEntry';
import ProductionEntry from './pages/ProductionEntry';
import Costing from './pages/Costing';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import TodayDashboard from './pages/TodayDashboard';
import OutwardEntry from './pages/OutwardEntry';

const drawerWidth = 260;

const App = () => {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [mode, setMode] = useState<'light' | 'dark'>((localStorage.getItem('themeMode') as 'light' | 'dark') || 'light');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = getTheme(mode);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };
  const profileMenuOpen = Boolean(anchorEl);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    handleProfileClose();
  };

  const handleLogin = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'Today Summary', icon: <TrendingUp fontSize="small" />, page: 'today' },
    { text: 'Inventory', icon: <InventoryIcon />, page: 'inventory' },
    { text: 'Costing', icon: <CostIcon />, page: 'costing' },
    { text: 'Inward / Batch', icon: <InventoryIcon />, page: 'inward' },
    { text: 'Outward (Sales)', icon: <OutwardIcon fontSize="small" />, page: 'outward' },
    { text: 'Production', icon: <WasteIcon />, page: 'production' },

    { text: 'Billing', icon: <BillingIcon />, page: 'billing' },
    { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
  ];

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            boxShadow: mode === 'light' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => setDrawerOpen(!drawerOpen)}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
              EVER GREEN <span style={{ color: mode === 'light' ? '#64748b' : '#94a3b8' }}>YARN SMS</span>
            </Typography>

            <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 2 }}>
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            <Tooltip title="Profile">
              <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                <Avatar alt="Admin User" sx={{ bgcolor: 'primary.main' }}>{user.username?.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={profileMenuOpen}
              onClose={handleProfileClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight="bold">{user.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.role || 'Admin'}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? drawerWidth : 70,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerOpen ? drawerWidth : 70,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
              transition: 'width 0.2s ease-in-out',
              overflowX: 'hidden'
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', py: 2 }}>
            <List>
              {menuItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                  <ListItemButton
                    selected={currentPage === item.page}
                    onClick={() => setCurrentPage(item.page)}
                    sx={{
                      minHeight: 48,
                      justifyContent: drawerOpen ? 'initial' : 'center',
                      px: 2.5,
                      mx: 1,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: drawerOpen ? 2 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && <ListItemText primary={item.text} primaryTypographyProps={{ variant: 'body2', fontWeight: currentPage === item.page ? 600 : 500 }} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
          <Toolbar />
          <Container maxWidth={false} sx={{ width: '100%', maxWidth: '100%' }}>
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'today' && <TodayDashboard />}

            {currentPage === 'inventory' && <Inventory />}
            {currentPage === 'costing' && <Costing userRole={user.role} />}
            {currentPage === 'inward' && <InwardEntry />}
            {currentPage === 'outward' && <OutwardEntry />}
            {currentPage === 'production' && <ProductionEntry />}

            {currentPage === 'billing' && <Billing />}
            {currentPage === 'settings' && <Settings />}

            {!['dashboard', 'today', 'inventory', 'costing', 'inward', 'outward', 'production', 'billing', 'settings'].includes(currentPage) && (
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} - Coming Soon
              </Typography>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
