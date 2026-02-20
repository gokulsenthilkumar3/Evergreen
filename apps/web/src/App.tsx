import { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { SUCCESS_MESSAGES } from './utils/messages';
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
  Badge,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  type PaletteMode,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
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
  MoveToInbox as InwardIcon,
  BarChart as SummaryIcon,
  ChevronLeft as CollapseIcon,
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
import { KeyboardShortcutsProvider } from './context/KeyboardShortcutsContext';
import { ScreenReaderAnnouncer } from './components/common/ScreenReaderAnnouncer';
import Breadcrumbs from './components/common/Breadcrumbs';
import ErrorBoundary from './components/common/ErrorBoundary';
import { NotificationsProvider, NotificationsBell } from './context/NotificationsContext';

const drawerWidth = 260;
const drawerCollapsedWidth = 72;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  page: string;
  requiredRole?: string;
  badge?: number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

interface SearchResultItem {
  type: string;
  title: string;
  subtitle: string;
  id: string;
  page: string;
  date: string;
}

import { printStyles } from './utils/printStyles';

const PrintStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: printStyles }} />
);

// --- Search Component ---
const GlobalSearch = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    setSelectedIndex(-1);
    if (val.length < 2) {
      setResults([]);
      setAnchorEl(null);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/search?q=${val}`);
      setResults(res.data);
      if (res.data.length > 0) setAnchorEl(document.getElementById('global-search-input'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const item = results[selectedIndex];
          onNavigate(item.page);
          addToHistory(query);
          setResults([]);
          setQuery('');
        }
        break;
      case 'Escape':
        setResults([]);
        setAnchorEl(null);
        break;
    }
  };

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(h => h !== term).slice(0, 9)];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ background: '#ffd700', fontWeight: 700 }}>{part}</mark> : part
    );
  };

  return (
    <Box sx={{ position: 'relative', mx: 2, flex: 1, maxWidth: 400 }}>
      <TextField
        id="global-search-input"
        placeholder="Search invoices, batches (Ctrl+K)..."
        fullWidth
        size="small"
        autoComplete="off"
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? <SyncIcon fontSize="small" className="spin-icon" /> : <SearchIcon sx={{ color: 'text.secondary' }} />}
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => { setQuery(''); setResults([]); }}>
                <CollapseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            bgcolor: 'background.paper',
            borderRadius: '12px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }
        }}
      />
      {results.length > 0 && query.length >= 2 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '120%',
            left: 0,
            right: 0,
            zIndex: 1500,
            maxHeight: 400,
            overflowY: 'auto',
            boxShadow: (theme: any) => theme.shadows[10],
            borderRadius: '12px',
            p: 1
          }}
        >
          {results.map((item: SearchResultItem, idx) => (
            <MenuItem
              key={idx}
              selected={idx === selectedIndex}
              onClick={() => {
                onNavigate(item.page);
                addToHistory(query);
                setResults([]);
                setQuery('');
              }}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                display: 'flex',
                justifyContent: 'space-between',
                py: 1.5,
                bgcolor: idx === selectedIndex ? 'action.hover' : 'transparent'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.75rem',
                  bgcolor: item.type === 'Invoice' ? 'primary.main' : (item.type === 'Batch' ? 'success.main' : 'warning.main'),
                  fontWeight: 'bold'
                }}>
                  {item.type[0]}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {highlightMatch(item.title, query)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {highlightMatch(item.subtitle, query)}
                  </Typography>
                </Box>
              </Box>
              <Chip label={item.type} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
            </MenuItem>
          ))}
        </Paper>
      )}
    </Box>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      return null;
    }
  });
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

  // Update document title
  useEffect(() => {
    if (settings?.companyName) {
      document.title = settings.companyName;
    }
  }, [settings]);

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

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Get breadcrumb items based on current page
  const getBreadcrumbItems = () => {
    const items: import('./components/common/Breadcrumbs').BreadcrumbItem[] = [{ label: 'Home', path: 'dashboard', icon: <DashboardIcon fontSize="small" /> }];

    const pageNames: Record<string, string> = {
      dashboard: 'Dashboard',
      today: "Today's Summary",
      inventory: 'Inventory',
      inward: 'Inward Entry',
      outward: 'Outward Entry',
      production: 'Production',
      costing: 'Costing',
      billing: 'Billing',
      users: 'User Management',
      settings: 'Settings',
    };

    if (currentPage !== 'dashboard') {
      items.push({ label: pageNames[currentPage] || currentPage });
    }

    return items;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => {
      setIsSyncing(false);
      toast.success(SUCCESS_MESSAGES.SYNC);
    }, 500);
  };

  // Fetch low stock count for badge
  const { data: lowStockCount = 0 } = useQuery({
    queryKey: ['lowStockCount'],
    queryFn: async () => {
      try {
        const response = await api.get('/inventory/yarn-stock');
        const stock = response.data;
        // Count items with low stock (threshold from settings or default 10)
        const threshold = settings?.lowStockThreshold || 10;
        return Object.values(stock).filter((qty: any) => qty < threshold).length;
      } catch {
        return 0;
      }
    },
    enabled: !!settings,
  });

  const navGroups: NavGroup[] = [
    {
      label: 'Overview',
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
        { text: "Today's Summary", icon: <SummaryIcon />, page: 'today' },
      ]
    },
    {
      label: 'Operations',
      items: [
        { text: 'Inward / Batch', icon: <InwardIcon />, page: 'inward' },
        { text: 'Inventory', icon: <InventoryIcon />, page: 'inventory', badge: lowStockCount > 0 ? lowStockCount : undefined },
        { text: 'Production', icon: <WasteIcon />, page: 'production' },
        { text: 'Outwards', icon: <OutwardIcon fontSize="small" />, page: 'outward' },
      ]
    },
    {
      label: 'Finance',
      items: [
        { text: 'Costing', icon: <CostIcon />, page: 'costing' },
        { text: 'Billing', icon: <BillingIcon />, page: 'billing' },
      ]
    },
    {
      label: 'Admin',
      items: [
        { text: 'User Management', icon: <UsersIcon />, page: 'users', requiredRole: 'AUTHOR' },
        { text: 'Settings', icon: <SettingsIcon />, page: 'settings' },
      ]
    },
  ];

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLogin} settings={settings} />
      </ThemeProvider>
    );
  }

  const allPages = navGroups.flatMap(g => g.items).map(i => i.page);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <NotificationsProvider>
          <KeyboardShortcutsProvider>
            <ConfirmProvider>
              <CssBaseline />
              <PrintStyles />
              <ScreenReaderAnnouncer />
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
                  <Toolbar sx={{ gap: 2 }}>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>

                    <Typography
                      variant="h6"
                      noWrap
                      component="div"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: '-0.5px',
                        display: { xs: 'none', sm: 'block' }
                      }}
                    >
                      {settings?.companyName || 'EverGreen'}
                    </Typography>

                    <GlobalSearch onNavigate={setCurrentPage} />

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NotificationsBell />

                      <Tooltip title="Sync All Data" arrow>
                        <IconButton onClick={handleSync} color="primary" sx={{
                          bgcolor: 'rgba(46, 125, 50, 0.08)',
                          '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.15)' }
                        }}>
                          <SyncIcon className={isSyncing ? 'spin-icon' : ''} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Toggle Theme" arrow>
                        <IconButton onClick={toggleTheme} color="inherit">
                          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Account Settings" arrow>
                        <IconButton onClick={handleProfileClick} sx={{ p: 0.5, ml: 1 }}>
                          <Avatar
                            alt={user.name || user.username}
                            sx={{
                              bgcolor: 'primary.main',
                              width: 36,
                              height: 36,
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              border: '2px solid rgba(255,255,255,0.1)'
                            }}
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
                        slotProps={{ paper: { sx: { mt: 1.5, minWidth: 200, borderRadius: '12px', boxShadow: (theme) => theme.shadows[10] } } }}
                      >
                        <Box sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.name || user.username}</Typography>
                          <Typography variant="caption" color="text.secondary">{user.role || 'Admin'}</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5, m: 0.5, borderRadius: '8px' }}>
                          <ListItemIcon sx={{ color: 'error.main' }}>
                            <LogoutIcon fontSize="small" />
                          </ListItemIcon>
                          Logout
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Toolbar>
                </AppBar>
                <Drawer
                  variant="permanent"
                  sx={{
                    width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                      width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
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
                  {/* Company Logo Header */}
                  {drawerOpen && (
                    <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {settings?.companyName?.charAt(0) || 'E'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {settings?.companyName || 'EverGreen'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Inventory System
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ overflow: 'auto', flexGrow: 1, py: 2 }}>
                    {navGroups.map((group, gIdx) => {
                      const filteredItems = group.items.filter(item => !item.requiredRole || item.requiredRole === user.role);
                      if (filteredItems.length === 0) return null;
                      return (
                        <Box key={gIdx}>
                          {drawerOpen && group.label && (
                            <Typography
                              variant="overline"
                              sx={{
                                px: 3, py: 0.5, display: 'block',
                                color: 'text.disabled', fontWeight: 700,
                                fontSize: '0.65rem', letterSpacing: '0.12em'
                              }}
                            >
                              {group.label}
                            </Typography>
                          )}
                          {!drawerOpen && gIdx > 0 && (
                            <Divider sx={{ my: 1, mx: 1.5, opacity: 0.4 }} />
                          )}
                          <List disablePadding>
                            {filteredItems.map((item) => (
                              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <Tooltip title={!drawerOpen ? item.text : ''} placement="right" arrow>
                                  <ListItemButton
                                    selected={currentPage === item.page}
                                    onClick={() => setCurrentPage(item.page)}
                                    sx={{
                                      minHeight: 44,
                                      justifyContent: drawerOpen ? 'initial' : 'center',
                                      px: 2,
                                      mx: 1,
                                      borderRadius: '12px',
                                      transition: 'all 0.18s ease',
                                      '&.Mui-selected': {
                                        bgcolor: mode === 'dark'
                                          ? 'rgba(16, 185, 129, 0.12)'
                                          : 'rgba(16, 185, 129, 0.1)',
                                        color: 'primary.main',
                                        '& .MuiListItemIcon-root': {
                                          color: 'primary.main',
                                        },
                                        '&:hover': {
                                          bgcolor: mode === 'dark'
                                            ? 'rgba(16, 185, 129, 0.18)'
                                            : 'rgba(16, 185, 129, 0.15)',
                                        }
                                      },
                                      '&:hover': {
                                        bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                                        transform: drawerOpen ? 'translateX(3px)' : 'none',
                                      }
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{
                                        minWidth: 0,
                                        mr: drawerOpen ? 1.5 : 'auto',
                                        justifyContent: 'center',
                                        color: currentPage === item.page ? 'primary.main' : 'text.secondary',
                                        transition: 'color 0.2s ease',
                                      }}
                                    >
                                      {item.badge ? (
                                        <Badge badgeContent={item.badge} color="error" variant="dot">
                                          {item.icon}
                                        </Badge>
                                      ) : (
                                        item.icon
                                      )}
                                    </ListItemIcon>
                                    {drawerOpen && (
                                      <ListItemText
                                        primary={item.text}
                                        primaryTypographyProps={{
                                          variant: 'body2',
                                          fontWeight: currentPage === item.page ? 700 : 500,
                                          color: currentPage === item.page ? 'text.primary' : 'text.secondary',
                                          sx: { transition: 'color 0.2s ease', fontSize: '0.87rem' }
                                        }}
                                      />
                                    )}
                                  </ListItemButton>
                                </Tooltip>
                              </ListItem>
                            ))}
                          </List>
                          {gIdx < navGroups.length - 1 && drawerOpen && (
                            <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* User info at bottom of sidebar */}
                  {drawerOpen && (
                    <Box sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {(user.name || user.username)?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{user.name || user.username}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{user.role}</Typography>
                      </Box>
                    </Box>
                  )}
                </Drawer>
                <Box
                  component="main"
                  sx={{
                    flexGrow: 1,
                    p: { xs: 2.5, md: 4 },
                    width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : drawerCollapsedWidth}px)` },
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0f172a' : '#f1f5f9',
                    backgroundImage: (theme) => theme.palette.mode === 'dark'
                      ? 'radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.04) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.04) 0, transparent 50%)'
                      : 'none',
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                      easing: theme.transitions.easing.sharp,
                      duration: theme.transitions.duration.enteringScreen,
                    }),
                  }}
                >
                  <Toolbar sx={{ mb: 1 }} />
                  <Breadcrumbs
                    items={getBreadcrumbItems()}
                    onNavigate={(path) => setCurrentPage(path)}
                  />
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
                    {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
                    {currentPage === 'today' && <TodayDashboard onNavigate={setCurrentPage} />}
                    {currentPage === 'inventory' && <Inventory userRole={user.role} username={user.username} />}
                    {currentPage === 'costing' && <Costing userRole={user.role} username={user.username} />}
                    {currentPage === 'inward' && <InwardEntry userRole={user.role} username={user.username} />}
                    {currentPage === 'outward' && <OutwardEntry userRole={user.role} username={user.username} />}
                    {currentPage === 'production' && <ProductionEntry userRole={user.role} username={user.username} />}
                    {currentPage === 'billing' && <Billing userRole={user.role} username={user.username} />}
                    {currentPage === 'users' && <UserManagement currentUserRole={user.role} username={user.username} />}
                    {currentPage === 'settings' && <Settings username={user.username} />}

                    {!allPages.includes(currentPage) && (
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
          </KeyboardShortcutsProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
