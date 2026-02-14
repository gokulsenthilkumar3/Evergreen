import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { ConfirmProvider } from './context/ConfirmContext';
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
  type PaletteMode,
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
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  People as UsersIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from './utils/api';
import getTheme from './theme';
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
import UserManagement from './pages/UserManagement';

const drawerWidth = 260;

const App = () => {
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
  const [mode, setMode] = useState<PaletteMode>((localStorage.getItem('themeMode') as PaletteMode) || 'light');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    },
  });

  // Fix: Ensure demo users have correct permissions even if DB is stale
  useEffect(() => {
    if (user && (user.username === 'author' || user.username === 'admin') && user.role !== 'AUTHOR') {
      console.log('🔄 Auto-correcting user role to AUTHOR');
      const updatedUser = { ...user, role: 'AUTHOR' };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const profileMenuOpen = Boolean(anchorEl);

  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

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
    { text: 'Dashboards', icon: <DashboardIcon />, page: 'dashboard' },
    { text: 'Summary', icon: <TrendingUp fontSize="small" />, page: 'today' },
    { text: 'Inward/Batch', icon: <InventoryIcon />, page: 'inward' },
    { text: 'Inventory', icon: <InventoryIcon />, page: 'inventory' },
    { text: 'Production', icon: <WasteIcon />, page: 'production' },
    { text: 'Outwards', icon: <OutwardIcon fontSize="small" />, page: 'outward' },
    { text: 'Costing', icon: <CostIcon />, page: 'costing' },
    { text: 'Billing', icon: <BillingIcon />, page: 'billing' },
    { text: 'User Management', icon: <UsersIcon />, page: 'users', requiredRole: 'AUTHOR' },
    { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
  ];

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLogin} settings={settings} />
      </ThemeProvider>
    );
  }

  // Update document title
  useEffect(() => {
    if (settings?.companyName) {
      document.title = settings.companyName;
    }
  }, [settings]);


  // ... (existing imports)

  return (
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <CssBaseline />
        <Toaster position="top-center" richColors />
        <Box sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100vw',
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden'
        }}>
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
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
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
                {settings?.logo && (
                  <Box
                    component="img"
                    src={settings.logo}
                    alt="Logo"
                    sx={{ height: 40, width: 'auto', mr: 2, borderRadius: 1 }}
                  />
                )}
                <Box component="span" sx={{ color: 'primary.main', mr: 1 }}>{settings?.companyName?.split(' ')[0] || 'EVER GREEN'}</Box>
                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>{settings?.companyName?.split(' ').slice(1).join(' ') || 'YARN SMS'}</Box>
              </Typography>

              <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <Tooltip title="Sync All Data">
                <IconButton
                  color="inherit"
                  onClick={async () => {
                    setIsSyncing(true);
                    await queryClient.invalidateQueries();
                    setTimeout(() => {
                      setIsSyncing(false);
                      toast.success('Data synchronized successfully');
                    }, 500);
                  }}
                  sx={{
                    mr: 2,
                    animation: isSyncing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    }
                  }}
                >
                  <SyncIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Profile">
                <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                  <Avatar
                    alt={user.name || user.username}
                    sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}
                  >
                    {(user.name || user.username)?.charAt(0).toUpperCase()}
                  </Avatar>
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
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">{user.name || user.username}</Typography>
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
                transition: (theme) => theme.transitions.create('width', {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
                overflowX: 'hidden'
              },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto', flexGrow: 1, py: 2 }}>
              <List>
                {menuItems.filter(item => !item.requiredRole || item.requiredRole === user.role).map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                    <ListItemButton
                      selected={currentPage === item.page}
                      onClick={() => setCurrentPage(item.page)}
                      sx={{
                        minHeight: 48,
                        justifyContent: drawerOpen ? 'initial' : 'center',
                        px: 2.5,
                        mx: 1.5,
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&.Mui-selected': {
                          bgcolor: mode === 'dark'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(16, 185, 129, 0.08)',
                          color: 'primary.main',
                          boxShadow: mode === 'dark' ? 'inset 0 0 12px rgba(16, 185, 129, 0.1)' : 'none',
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                            filter: mode === 'dark' ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' : 'none',
                          },
                          '&:hover': {
                            bgcolor: mode === 'dark'
                              ? 'rgba(16, 185, 129, 0.18)'
                              : 'rgba(16, 185, 129, 0.12)',
                          }
                        },
                        '&:hover': {
                          bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                          transform: 'translateX(4px)',
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: drawerOpen ? 2 : 'auto',
                          justifyContent: 'center',
                          color: currentPage === item.page ? 'primary.main' : 'text.secondary',
                          transition: 'color 0.2s ease',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {drawerOpen && (
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: currentPage === item.page ? 700 : 500,
                            color: currentPage === item.page ? 'text.primary' : 'text.secondary',
                            sx: { transition: 'color 0.2s ease' }
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Drawer>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2.5, md: 4 },
              width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 70}px)` },
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc',
              backgroundImage: (theme) => theme.palette.mode === 'dark'
                ? 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.03) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.03) 0, transparent 50%)'
                : 'none',
              transition: (theme) => theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            }}
          >
            <Toolbar sx={{ mb: 1 }} />
            <Container
              maxWidth="xl"
              sx={{
                flexGrow: 1,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: '0 !important',
                m: 0
              }}
            >
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'today' && <TodayDashboard />}
              {currentPage === 'inventory' && <Inventory userRole={user.role} username={user.username} />}
              {currentPage === 'costing' && <Costing userRole={user.role} username={user.username} />}
              {currentPage === 'inward' && <InwardEntry userRole={user.role} username={user.username} />}
              {currentPage === 'outward' && <OutwardEntry userRole={user.role} username={user.username} />}
              {currentPage === 'production' && <ProductionEntry userRole={user.role} username={user.username} />}
              {currentPage === 'billing' && <Billing userRole={user.role} username={user.username} />}
              {currentPage === 'users' && <UserManagement currentUserRole={user.role} username={user.username} />}
              {currentPage === 'settings' && <Settings username={user.username} />}

              {!['dashboard', 'today', 'inventory', 'costing', 'inward', 'outward', 'production', 'billing', 'settings', 'users'].includes(currentPage) && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                  </Typography>
                  <Typography color="text.secondary">This page is currently under development.</Typography>
                </Box>
              )}
            </Container>
          </Box>
        </Box>
      </ConfirmProvider>
    </ThemeProvider>
  );
};

export default App;
