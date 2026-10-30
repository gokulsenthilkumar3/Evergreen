import { useState, useMemo, useEffect, useRef, lazy, Suspense } from 'react';
import { Toaster, toast } from 'sonner';
import { SUCCESS_MESSAGES } from './utils/messages';
import { ConfirmProvider } from './context/ConfirmContext';
import {
  Box,
  Button,
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
  useMediaQuery,
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
  TrendingUp as OutwardIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  People as UsersIcon,
  Sync as SyncIcon,
  MoveToInbox as InwardIcon,
  BarChart as SummaryIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  VpnKey as SessionsIcon,
  Storefront as StoreIcon,
  Insights as InsightsIcon,
  SupportAgent as HelpdeskIcon,
  School as TutorialIcon,
  Translate as TranslateIcon,
  Factory as FactoryIcon,
  Speed as SpeedIcon,
  PrecisionManufacturing as MachineIcon,
  VerifiedUser as QualityIcon,
  Schedule as ShiftIcon,
  Warehouse as WarehouseIcon,
  Badge as StaffIcon,
  AutoAwesome as ForecastIcon,
  LocalShipping as SupplierIcon,
  Gavel as ComplianceIcon,
  Payments as PaymentOpsIcon,
  Person as PersonIcon,
  MenuBook as BookIcon,
} from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from './utils/api';
import { isCompanyPageVisible } from '@evergreen/types';
import { canonicalPage, settingsTabFor } from './utils/navigation';
import { lowStockThreshold } from './utils/alerts';
import getTheme from './theme';
import type { ThemeName } from './theme';
import Login from './components/Login';
import ProfileModal from './components/ProfileModal';
import { KeyboardShortcutsProvider } from './context/KeyboardShortcutsContext';
import { ScreenReaderAnnouncer } from './components/common/ScreenReaderAnnouncer';
import Breadcrumbs from './components/common/Breadcrumbs';
import ErrorBoundary from './components/common/ErrorBoundary';
import { NotificationsProvider, NotificationsBell } from './context/NotificationsContext';
import { useNotificationSync } from './hooks/useNotificationSync';
import { useDebounce } from './hooks/useDebounce';
import { LinearProgress } from '@mui/material';
import NotFound404 from './components/common/NotFound404';

const NotificationSyncRunner = ({ settings }: { settings: any }) => {
  useNotificationSync(settings);
  return null;
};

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const InwardEntry = lazy(() => import('./pages/InwardEntry'));
const ProductionEntry = lazy(() => import('./pages/ProductionEntry'));
const Costing = lazy(() => import('./pages/Costing'));
const Settings = lazy(() => import('./pages/Settings'));
const TodayDashboard = lazy(() => import('./pages/TodayDashboard'));
const OutwardEntry = lazy(() => import('./pages/OutwardEntry'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const SessionManagement = lazy(() => import('./pages/SessionManagement'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'));
const Store = lazy(() => import('./pages/Store'));
const Insights = lazy(() => import('./pages/Insights'));
const Payments = lazy(() => import('./pages/SharedPayments'));
const Helpdesk = lazy(() => import('./pages/Helpdesk'));
const Tutorial = lazy(() => import('./pages/Tutorial'));
const UnifiedWorkspace = lazy(() => import('./pages/UnifiedWorkspace'));
const JobWork = lazy(() => import('./pages/JobWork'));
const CommerceDesk = lazy(() => import('./pages/CommerceDesk'));
const CommerceReports = lazy(() => import('./pages/CommerceReports'));
const OperationsDesk = lazy(() => import('./pages/OperationsDesk'));
const WorkflowDesk = lazy(() => import('./pages/WorkflowDesk'));
// ── Merged sub-project pages ──
const YarnMachineManagement = lazy(() => import('./pages/yarn/MachineManagement'));
const YarnQualityControl = lazy(() => import('./pages/yarn/QualityControl'));
const YarnWarehouseManagement = lazy(() => import('./pages/yarn/WarehouseManagement'));
const YarnHRManagement = lazy(() => import('./pages/yarn/HRManagement'));
const YarnLiveDashboard = lazy(() => import('./pages/yarn/LiveDashboard'));
const YarnShiftManagement = lazy(() => import('./pages/yarn/ShiftManagement'));
const YarnDemandForecasting = lazy(() => import('./pages/yarn/DemandForecasting'));
const YarnSupplierPortal = lazy(() => import('./pages/yarn/SupplierPortal'));
const YarnComplianceReports = lazy(() => import('./pages/yarn/ComplianceReports'));
const CommandCenter = lazy(() => import('./pages/CommandCenter'));
const Integrations = lazy(() => import('./pages/Integrations'));
const BookEllam = lazy(() => import('./pages/BookEllam'));

/** Provider support number in international digits, e.g. 919800000000. Set VITE_SUPPORT_PHONE when packaging. */
const SUPPORT_PHONE = /^\d{8,15}$/.test(String(import.meta.env.VITE_SUPPORT_PHONE ?? '')) ? String(import.meta.env.VITE_SUPPORT_PHONE) : '';

const drawerWidth = 260;
const drawerCollapsedWidth = 72;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  page: string;
  requiredRole?: string;
  badge?: number;
  description?: string;
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  // The query the current results (or failure) belong to; drives the "no matches" and error states.
  const [searchedQuery, setSearchedQuery] = useState('');
  const [searchFailed, setSearchFailed] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      return Array.isArray(saved) ? saved.filter((term): term is string => typeof term === 'string') : [];
    } catch {
      return [];
    }
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

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    // A slower earlier request must not replace the results of a newer query.
    let current = true;
    const fetchResults = async () => {
      setSelectedIndex(-1);
      if (debouncedQuery.length < 2) {
        setResults([]);
        setSearchedQuery('');
        setSearchFailed(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get('/search', { params: { q: debouncedQuery } });
        if (!current) return;
        setResults(Array.isArray(res.data) ? res.data : []);
        setSearchFailed(false);
      } catch {
        if (!current) return;
        setResults([]);
        setSearchFailed(true);
      } finally {
        if (current) {
          setSearchedQuery(debouncedQuery);
          setLoading(false);
        }
      }
    };

    fetchResults();
    return () => { current = false; };
  }, [debouncedQuery]);

  const handleSearch = (val: string) => {
    setQuery(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeResults();
      return;
    }
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
    }
  };
  const closeResults = () => { setResults([]); setSearchedQuery(''); setSearchFailed(false); };

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(h => h !== term).slice(0, 9)];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    // B-11: Escape regex special characters so user input like '(', '.', '*' doesn't crash the regex
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    // Compare text rather than calling regex.test: a global regex keeps lastIndex and skips every other match.
    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? <mark key={i} style={{ background: '#ffd700', fontWeight: 700 }}>{part}</mark> : part
    );
  };

  return (
    <Box sx={{ position: 'relative', mx: 2, flex: 1, maxWidth: 400 }}>
      <TextField
        id="global-search-input"
        placeholder="Search invoices, stock, customers (Ctrl+K)..."
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
              {/* B-08: Use CloseIcon (not CollapseIcon/chevron) for semantic correctness */}
              <IconButton size="small" aria-label="Clear search" onClick={() => { setQuery(''); setResults([]); }}>
                <CloseIcon fontSize="small" />
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
      {results.length === 0 && !loading && query.length >= 2 && searchedQuery === query && (
        <Paper
          role="status"
          className="anim-fade-scale"
          sx={{ position: 'absolute', top: '120%', left: 0, right: 0, zIndex: 1500, borderRadius: '12px', p: 2, boxShadow: (theme: any) => theme.shadows[10] }}
        >
          <Typography variant="body2" color={searchFailed ? 'error' : 'text.secondary'}>
            {searchFailed
              ? 'Search is unavailable right now. Check the connection and try again.'
              : `No invoices, stock or customers match “${query}”.`}
          </Typography>
        </Paper>
      )}
      {results.length > 0 && query.length >= 2 && (
        <Paper
          className="anim-fade-scale"
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
  const [themeName, setThemeName] = useState<ThemeName>((localStorage.getItem('themeName') as ThemeName) || 'emerald');
  const [floatingNav, setFloatingNav] = useState<boolean>(() => localStorage.getItem('floatingNav') === 'true');
  const [language, setLanguage] = useState<'en' | 'ta'>((localStorage.getItem('language') as 'en' | 'ta') || 'en');
  const getInitialPage = () => {
    const path = window.location.pathname.replace(/^\//, '').trim();
    if (!path || path === 'index.html') return 'dashboard';
    return canonicalPage(path);
  };
  const [currentPage, setPageState] = useState<string>(getInitialPage);
  const [settingsTab, setSettingsTab] = useState<number>(() => settingsTabFor(window.location.pathname.replace(/^\//, '').trim()));

  const setCurrentPage = (page: string) => {
    setSettingsTab(settingsTabFor(page));
    page = canonicalPage(page);
    setPageState(page);
    setMobileNavOpen(false);
    const targetPath = page === 'dashboard' ? '/' : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };
  const navigateTo = setCurrentPage;

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').trim();
      setSettingsTab(settingsTabFor(path));
      setPageState(canonicalPage(path || 'dashboard'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [drawerOpen, setDrawerOpen] = useState(true);
  // Below 900px the navigation is an overlay that starts closed; a permanent 260px rail left phones about 130px of content.
  const isCompact = useMediaQuery('(max-width:899.95px)');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navExpanded = isCompact || drawerOpen;
  // Each screen opens at its top instead of the previous screen's scroll position.
  const mainRef = useRef<HTMLElement | null>(null);
  useEffect(() => { mainRef.current?.scrollTo?.({ top: 0 }); }, [currentPage]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    enabled: Boolean(user),
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    },
  });

  // Removed: hardcoded role auto-correction that overrode DB-assigned roles for
  // users named 'author' or 'admin' (B-01 security bypass). Roles are now
  // always taken directly from the JWT payload returned by the server.

  const profileMenuOpen = Boolean(anchorEl);

  const theme = useMemo(() => getTheme(mode, themeName), [mode, themeName]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Global CSS (glass cards, floating nav, native controls) follows the app theme rather than the OS.
    document.documentElement.dataset.themeMode = mode;
  }, [mode]);
  useEffect(() => { localStorage.setItem('themeName', themeName); }, [themeName]);
  useEffect(() => { localStorage.setItem('floatingNav', String(floatingNav)); }, [floatingNav]);
  useEffect(() => { localStorage.setItem('language', language); }, [language]);

  // Update document title
  useEffect(() => {
    if (settings?.companyName) {
      document.title = settings.companyName;
    }
  }, [settings]);

  // Global tab navigation listener for delete-guards and cross-module deep-links
  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<{ page?: string; params?: any }>;
      if (customEvent.detail?.page) {
        setCurrentPage(customEvent.detail.page);
      }
    };
    window.addEventListener('evergreen:navigate', handleNavigate);
    return () => window.removeEventListener('evergreen:navigate', handleNavigate);
  }, []);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const toggleLanguage = async () => {
    const next = language === 'en' ? 'ta' : 'en';
    setLanguage(next);
    try { await api.put('/settings', { language: next }); } catch { toast.error('Language changed on this device only; it could not be saved to your account.'); }
  };


  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Revoke the session server-side so the JWT is invalidated in the DB
      await api.delete('/auth/logout');
    } catch {
      // Best-effort: even if the server call fails, we clear local credentials
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(null);
      handleProfileClose();
    }
  };

  const handleLogin = (userData: any) => {
    queryClient.clear();
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleDrawerToggle = () => {
    if (isCompact) setMobileNavOpen(open => !open);
    else setDrawerOpen(!drawerOpen);
  };

  // Get breadcrumb items based on current page
  const getBreadcrumbItems = () => {
    const items: import('./components/common/Breadcrumbs').BreadcrumbItem[] = [{ label: 'Home', path: 'dashboard', icon: <DashboardIcon fontSize="small" /> }];

    const pageNames: Record<string, string> = {
      dashboard: 'Dashboard',
      workspace: 'EverGreen One',
      jobwork: 'Job Work',
      operations: 'Operations Desk',
      workflows: 'Business flows',
      business: 'Business Desk',
      reports: 'Business Reports',
      paymentops: 'Payment Operations',
      today: "Today's Summary",
      inventory: 'Inventory',
      inward: 'Inward Entry',
      outward: 'Outward Entry',
      production: 'Production',
      costing: 'Costing',
      users: 'User Management',
      sessions: 'Sessions & Active Devices',
      security: 'Security & 2FA Settings',
      settings: 'Settings',
      logs: 'Activity Logs',
      store: 'Store',
      insights: 'Insights & Reports',
      helpdesk: 'Helpdesk',
      tutorial: 'Tutorial',
      yarnmachine: 'Machine Management',
      yarnquality: 'Quality Control',
      yarnwarehouse: 'Warehouse Management',
      yarnhr: 'HR & Payroll',
      yarnlive: 'Machine Status Overview',
      yarnshift: 'Shift Management',
      yarnforecast: 'Demand Forecasting',
      yarnsupplier: 'Supplier Portal',
      yarncompliance: 'Compliance Reports',
      'command-center': 'Operations Command',
      bookellam: 'Book-Ellam (All Books)',
    };

    if (currentPage !== 'dashboard') {
      items.push({ label: pageNames[currentPage] || currentPage });
    }

    return items;
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Refetch all active queries and wait for completion before showing success
      await queryClient.refetchQueries({ type: 'active' });
      toast.success(SUCCESS_MESSAGES.SYNC);
    } catch {
      toast.error('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch low stock count for badge
  // B-12: Count the number of individual stock *entries* (bags) below threshold,
  // not just the number of yarn count categories.
  const { data: lowStockCount = 0 } = useQuery({
    queryKey: ['lowStockCount'],
    queryFn: async () => {
      try {
        const response = await api.get('/inventory/yarn-stock');
        const stock = response.data;
        const threshold = lowStockThreshold(settings);
        // Count how many count-types are below the threshold (the badge shows
        // the number of distinct yarn counts that need restocking)
        return Object.values(stock).filter((qty: any) => typeof qty === 'number' && qty < threshold).length;
      } catch {
        return 0;
      }
    },
    enabled: !!settings,
  });

  const navGroups: NavGroup[] = [
    {
      label: 'EverGreen One',
      items: [
        { text: 'Business Workspace', icon: <StoreIcon />, page: 'workspace' },
        { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
        { text: "Today's Summary", icon: <SummaryIcon />, page: 'today' },
        { text: 'Operations Command', icon: <SpeedIcon />, page: 'command-center', description: 'Live factory floor — strategy game view' },
      ]
    },
    {
      label: 'Operations & Job Work',
      items: [
        { text: 'Store', icon: <StoreIcon />, page: 'store', description: 'Sell from the shared catalogue and reserve stock in a sales order' },
        { text: 'Inventory', icon: <InventoryIcon />, page: 'inventory', badge: lowStockCount > 0 ? lowStockCount : undefined, description: 'Stock ledger for cotton bales, yarn bags by count, and waste inventory' },
        { text: 'Inward / Batch', icon: <InwardIcon />, page: 'inward', description: 'Cotton gate receipts, batch lot creation, bale weights, and QR sticker generation' },
        { text: 'Production & Job Work', icon: <WasteIcon />, page: 'production', description: 'Bale consumption mixing, yarn count production, waste tracking, and material balance' },
        { text: 'Job Work Register', icon: <SyncIcon />, page: 'jobwork', description: 'External job work contracts, sent material, inward yarn returns, and reconciliation' },
        { text: 'Operations Desk', icon: <InventoryIcon />, page: 'operations', description: 'Catalogue inward receipts, stock by item and garment costing sheets' },
        { text: 'Business flows', icon: <SyncIcon />, page: 'workflows', description: 'Returns, procurement, conversion, quality holds and accounting' },
        { text: 'Outwards', icon: <OutwardIcon fontSize="small" />, page: 'outward', description: 'Customer yarn dispatch gate pass, vehicle/driver logging, and barcode tags' },
        { text: 'Costing', icon: <CostIcon />, page: 'costing', description: 'Per-kg spinning cost analysis: electricity, labor, packaging, and maintenance' },
        { text: 'Business Desk', icon: <StoreIcon />, page: 'business', description: 'Catalogue, customers, sales orders, GST invoices and invoice payments' },
      ]
    },
    {
      label: 'Sales & Accounts',
      items: [
        { text: 'Book-Ellam (All Books)', icon: <BookIcon />, page: 'bookellam', description: 'Comprehensive audit research tool across Day Book, Inward, Outward, Stock and Party Ledgers' },
        { text: 'Payment Operations', icon: <PaymentOpsIcon />, page: 'paymentops', description: 'Customer receipts, supplier ledger entries, outstanding balances, and payment terms' },
        { text: 'Business Reports', icon: <InsightsIcon />, page: 'reports', description: 'Financial statements, dispatch summaries, consumption reports, and Excel/PDF exports' },
      ]
    },
    {
      label: 'Yarn ERP',
      items: [
        { text: 'Yarn ERP Hub', icon: <FactoryIcon />, page: 'yarnerp', description: 'Opens Business Workspace, which links every mill module' },
        { text: 'Machine Status Overview', icon: <SpeedIcon />, page: 'yarnlive', description: 'Registered machines and their saved status. Live sensor telemetry is not connected' },
        { text: 'Machine Management', icon: <MachineIcon />, page: 'yarnmachine', description: 'Machine registry, scheduled preventive maintenance, breakdown logs, and spares' },
        { text: 'Quality Control', icon: <QualityIcon />, page: 'yarnquality', description: 'Lab testing: CSP, count lea strength, evenness (U%), imperfections, and hairiness' },
        { text: 'Shift Management', icon: <ShiftIcon />, page: 'yarnshift', description: 'Saved shift schedules. Attendance and machine allocation are not recorded here' },
        { text: 'Warehouse', icon: <WarehouseIcon />, page: 'yarnwarehouse', description: 'Storage bay and bin rack locations for finished yarn bags and raw cotton' },
        { text: 'HR & Payroll', icon: <StaffIcon />, page: 'yarnhr', description: 'Staff directory, overtime calculations, piece-rate wages, and salary processing' },
        { text: 'Demand Forecasting', icon: <ForecastIcon />, page: 'yarnforecast', description: 'Three-month moving average of sales orders, as a planning baseline' },
        { text: 'Supplier Activity', icon: <SupplierIcon />, page: 'yarnsupplier', description: 'Supplier receipts and moisture readings from saved inward records' },
        { text: 'Compliance Readiness', icon: <ComplianceIcon />, page: 'yarncompliance', description: 'Internal record counts for compliance review. No statutory filing is connected' },
      ]
    },
    {
      label: 'Support',
      items: [
        { text: 'Helpdesk', icon: <HelpdeskIcon />, page: 'helpdesk', description: 'Frequently asked questions and ticket drafts kept in this browser' },
        { text: 'Tutorial', icon: <TutorialIcon />, page: 'tutorial', description: 'Step-by-step spinning mill workflows, standard operating procedures, and guides' },
      ]
    },
    {
      label: 'Admin',
      items: [
        { text: 'Migration & integrations', icon: <SyncIcon />, page: 'integrations', requiredRole: 'ADMIN', description: 'Import customer and catalogue data with explicit column mapping and audit history' },
        { text: 'User Management', icon: <UsersIcon />, page: 'users', requiredRole: 'ADMIN', description: 'Staff accounts and the VIEWER, MODIFIER and ADMIN roles' },
        // B-18: Sessions and Security had the same icon; Sessions now uses VpnKey
        { text: 'Sessions', icon: <SessionsIcon />, page: 'sessions', description: 'Active user login sessions, IP addresses, device types, and remote logout' },
        { text: 'Security Settings', icon: <SecurityIcon />, page: 'security', description: 'Password, two-factor sign-in and passkeys' },
        { text: 'Settings', icon: <SettingsIcon />, page: 'settings', description: 'Company details, count specifications, tare weights, and theme preferences' },
      ]
    },
  ];

  const tamilLabels: Record<string, string> = {
    'Business Workspace': 'வணிக மையம்',
    'Business Desk': 'வணிக மேசை',
    Dashboard: 'முகப்பு',
    "Today's Summary": 'இன்றைய சுருக்கம்',
    Store: 'கடை',
    Inventory: 'சரக்கு',
    'Inward / Batch': 'உள்வரவு / தொகுதி',
    'Production & Job Work': 'உற்பத்தி மற்றும் வேலை ஒப்பந்தம்',
    'Job Work Register': 'வேலை ஒப்பந்தப் பதிவு',
    'Operations Desk': 'செயல்பாடுகள் மேசை',
    Outwards: 'வெளியீடு',
    Costing: 'செலவீனம்',
    Insights: 'அறிக்கைகள்',
    Settings: 'அமைப்புகள்',
    Helpdesk: 'உதவி',
    Tutorial: 'பயிற்சி',
    'Payment Operations': 'பணப்பரிவர்த்தனை மேலாண்மை',
    'Business Reports': 'வணிக அறிக்கைகள்',
    'Yarn ERP Hub': 'நூல் ஆலை முதன்மை மையம்',
    'Machine Status Overview': 'இயந்திர நிலை மேலோட்டம்',
    'Machine Management': 'இயந்திர மேலாண்மை',
    'Quality Control': 'தரக் கட்டுப்பாடு',
    'Shift Management': 'பணி முறை மேலாண்மை',
    Warehouse: 'கிடங்கு மேலாண்மை',
    'HR & Payroll': 'பணியாளர் & ஊதிய மேலாண்மை',
    'Demand Forecasting': 'தேவை முன்கணிப்பு',
    'Supplier Activity': 'வழங்குநர் தளம்',
    'Compliance Readiness': 'இணக்க அறிக்கைகள்',
    'User Management': 'பயனர் மேலாண்மை',
    Sessions: 'அமர்வுகள்',
    'Security Settings': 'பாதுகாப்பு அமைப்புகள்',
  };
  const labelFor = (label: string) => language === 'ta' ? (tamilLabels[label] || label) : label;

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLogin} settings={settings} />
      </ThemeProvider>
    );
  }

  const allPages = navGroups.flatMap(g => g.items).map(i => i.page);

  // Security: If route is invalid, render standalone isolated 404 view
  // Zero leakage of internal sidebar modules, drawer chrome, topbar search, or user info
  if (!allPages.includes(currentPage)) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            width: '100vw',
            bgcolor: mode === 'dark' ? '#090e17' : '#f8fafc',
            backgroundImage: mode === 'dark'
              ? 'radial-gradient(at 50% 20%, rgba(244, 63, 94, 0.08) 0px, transparent 60%)'
              : 'radial-gradient(at 50% 20%, rgba(244, 63, 94, 0.04) 0px, transparent 60%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <NotFound404 pageName={currentPage} onNavigate={navigateTo} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <NotificationsProvider>
          <NotificationSyncRunner settings={settings} />
          <KeyboardShortcutsProvider>
            <ConfirmProvider>
              <CssBaseline />
              <PrintStyles />
              <ScreenReaderAnnouncer />
              <Toaster position="top-center" richColors theme={mode === 'dark' ? 'dark' : 'light'} closeButton expand
                toastOptions={{ className: 'evergreen-toast', style: { fontFamily: 'inherit', borderRadius: '12px' } }} />

              {settings?.status === 'SUSPENDED' && (
                <Box sx={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  bgcolor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <SecurityIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                  <Typography variant="h3" gutterBottom>Service Suspended</Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, textAlign: 'center' }}>
                    Your account has been temporarily suspended due to billing or licensing issues. 
                    Please contact the Provider Administrator to restore service.
                  </Typography>
                </Box>
              )}

              {settings?.isMaintenance && (
                <Box sx={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  bgcolor: 'rgba(15, 23, 42, 0.92)', zIndex: 99998, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <SyncIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h3" gutterBottom>System Under Maintenance</Typography>
                  <Typography variant="h6" sx={{ maxWidth: 600, textAlign: 'center', color: '#94a3b8' }}>
                    Scheduled upgrades and database maintenance are currently in progress. 
                    Normal operations will resume shortly.
                  </Typography>
                </Box>
              )}

              {/* 30-Day Active Grace Quota Notice Banner (Non-blocking) */}
              {settings?.status === 'GRACE_PERIOD' && (
                <Box sx={{
                  bgcolor: '#fffbeb',
                  borderBottom: '1px solid #fcd34d',
                  color: '#92400e',
                  px: 3,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                  zIndex: 1100,
                  position: 'sticky',
                  top: 0,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ⏳ 30-Day Active Grace Quota:
                    </Typography>
                    <Typography variant="body2">
                      Your license is pending renewal, but your mill operations are completely uninterrupted.
                      {settings.graceExpiresAt && ` Grace protection active until ${new Date(settings.graceExpiresAt).toLocaleDateString()}.`}
                    </Typography>
                  </Box>
                  {/* The provider's real number is set at build time; without it, never offer a made-up contact. */}
                  {SUPPORT_PHONE ? (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="warning"
                        component="a"
                        href={`https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent('Hello EverGreen licensing desk, I would like to renew our subscription.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: 1.5 }}
                      >
                        Connect with Licensing Desk (WhatsApp)
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        component="a"
                        href={`tel:+${SUPPORT_PHONE}`}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: 1.5 }}
                      >
                        Call Support
                      </Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Contact your EverGreen provider to renew.</Typography>
                  )}
                </Box>
              )}
              {/* Floating bottom nav pill */}
              {floatingNav && (
                <Box className="floating-bottom-nav" component="nav" aria-label="Bottom navigation">
                  {[
                    { text: 'Workspace', icon: <StoreIcon />, page: 'workspace' },
                    { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
                    { text: 'Inventory', icon: <InventoryIcon />, page: 'inventory' },
                    { text: 'Production',icon: <WasteIcon />,     page: 'production' },
                    { text: 'Business Desk', icon: <StoreIcon />, page: 'business' },
                  ].map(item => {
                    const active = currentPage === item.page;
                    return (
                      <Tooltip key={item.page} title={item.text} arrow placement="top">
                        <IconButton
                          onClick={() => setCurrentPage(item.page)}
                          size="small"
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '14px',
                            color: active ? 'primary.main' : 'text.secondary',
                            bgcolor: active ? (mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(5,150,105,0.1)') : 'transparent',
                            transform: active ? 'scale(1.12)' : 'scale(1)',
                            transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                            boxShadow: active ? `0 0 0 3px ${theme.palette.primary.main}33` : 'none',
                            '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', transform: 'scale(1.08)' },
                          }}
                        >
                          {item.icon}
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Box>
              )}
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
                      <NotificationsBell onNavigate={setCurrentPage} />

                      <Tooltip title={language === 'en' ? 'தமிழில் காண்க' : 'View in English'} arrow>
                        <IconButton onClick={toggleLanguage} color="inherit" aria-label="Toggle language">
                          <TranslateIcon />
                        </IconButton>
                      </Tooltip>

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
                        slotProps={{ paper: { sx: { mt: 1.5, minWidth: 230, borderRadius: '14px', p: 0.5, boxShadow: (theme) => theme.shadows[10] } } }}
                      >
                        <Box sx={{ px: 2, py: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{user.name || user.username}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">@{user.username}</Typography>
                          <Chip label={user.role || 'Admin'} size="small" color={user.role === 'ADMIN' ? 'error' : user.role === 'MODIFIER' ? 'primary' : 'default'} sx={{ mt: 0.5, height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => { handleProfileClose(); setProfileModalOpen(true); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                          My Profile & Account
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigateTo('security'); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
                          Security & 2FA
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigateTo('sessions'); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><SessionsIcon fontSize="small" /></ListItemIcon>
                          Active Sessions
                        </MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigateTo('settings'); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                          System Settings
                        </MenuItem>
                        <Divider sx={{ my: 0.5 }} />
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
                  variant={isCompact ? 'temporary' : 'permanent'}
                  open={isCompact ? mobileNavOpen : true}
                  onClose={() => setMobileNavOpen(false)}
                  ModalProps={{ keepMounted: true }}
                  sx={{
                    ...(isCompact ? {} : { width: drawerOpen ? drawerWidth : drawerCollapsedWidth, flexShrink: 0 }),
                    [`& .MuiDrawer-paper`]: {
                      width: navExpanded ? drawerWidth : drawerCollapsedWidth,
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
                  {navExpanded && (
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
                      const filteredItems = group.items.filter(item => {
                        if (!isCompanyPageVisible(item.page, settings)) return false;
                        if (!item.requiredRole) return true;
                        return item.requiredRole === user.role;
                      });
                      if (filteredItems.length === 0) return null;
                      return (
                        <Box key={gIdx}>
                          {navExpanded && group.label && (
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
                          {!navExpanded && gIdx > 0 && (
                            <Divider sx={{ my: 1, mx: 1.5, opacity: 0.4 }} />
                          )}
                          <List disablePadding>
                            {filteredItems.map((item) => (
                              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                                <Tooltip
                                  title={
                                    <Box sx={{ p: 0.5, maxWidth: 260 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>
                                        {labelFor(item.text)}
                                      </Typography>
                                      {item.description && (
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.35, lineHeight: 1.35 }}>
                                          {item.description}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                  placement="right"
                                  arrow
                                  enterDelay={250}
                                >
                                  <ListItemButton
                                    selected={currentPage === item.page}
                                    onClick={() => navigateTo(item.page)}
                                    sx={{
                                      minHeight: 44,
                                      justifyContent: navExpanded ? 'initial' : 'center',
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
                                        transform: navExpanded ? 'translateX(3px)' : 'none',
                                      }
                                    }}
                                  >
                                    <ListItemIcon
                                      sx={{
                                        minWidth: 0,
                                        mr: navExpanded ? 1.5 : 'auto',
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
                                    {navExpanded && (
                                      <ListItemText
                                        primary={labelFor(item.text)}
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
                          {gIdx < navGroups.length - 1 && navExpanded && (
                            <Divider sx={{ my: 1, mx: 2, opacity: 0.5 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  {/* User info at bottom of sidebar */}
                  {navExpanded && (
                    <Box
                      onClick={() => setProfileModalOpen(true)}
                      sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
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
                  ref={mainRef}
                  sx={{
                    flexGrow: 1,
                    p: { xs: 2.5, md: 4 },
                    width: isCompact ? '100%' : `calc(100% - ${drawerOpen ? drawerWidth : drawerCollapsedWidth}px)`,
                    minWidth: 0,
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
                    {/* Keyed by page: a crash stays inside that screen, and navigating away clears it. */}
                    <ErrorBoundary key={currentPage}>
                    <Suspense fallback={<LinearProgress />}>
                    {/* Page roots often use maxWidth with mx: auto; in a flex column that sizes them to their content, so pin them to the column width. */}
                    <Box key={currentPage} className="anim-page-in" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, '& > *': { width: '100%', minWidth: 0 } }}>
                      {currentPage === 'workspace' && <UnifiedWorkspace onNavigate={navigateTo} profile={settings} />}
                      {currentPage === 'jobwork' && <JobWork />}
                      {currentPage === 'operations' && <OperationsDesk />}
                      {currentPage === 'workflows' && <WorkflowDesk />}
                      {currentPage === 'business' && <CommerceDesk />}
                      {currentPage === 'reports' && <CommerceReports />}
                      {currentPage === 'bookellam' && <BookEllam />}
                      {currentPage === 'paymentops' && <Payments />}
                      {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
                      {currentPage === 'today' && <TodayDashboard onNavigate={setCurrentPage} />}
                      {currentPage === 'inventory' && <Inventory userRole={user.role} username={user.username} />}
                      {currentPage === 'costing' && <Costing userRole={user.role} username={user.username} />}
                      {currentPage === 'inward' && <InwardEntry userRole={user.role} username={user.username} />}
                      {currentPage === 'outward' && <OutwardEntry userRole={user.role} username={user.username} />}
                      {currentPage === 'production' && <ProductionEntry userRole={user.role} username={user.username} />}
                      {currentPage === 'store' && <Store onNavigate={setCurrentPage} />}
                      {currentPage === 'insights' && <Insights />}
                      {currentPage === 'helpdesk' && <Helpdesk />}
                      {currentPage === 'tutorial' && <Tutorial onNavigate={navigateTo} />}
                      {currentPage === 'users' && <UserManagement currentUserRole={user.role} username={user.username} />}
                      {currentPage === 'sessions' && <SessionManagement />}
                      {currentPage === 'security' && <SecuritySettings />}
                      {currentPage === 'settings' && (
                        <Settings
                          key={settingsTab}
                          initialTab={settingsTab}
                          username={user.username}
                          themeName={themeName}
                          onThemeChange={setThemeName}
                          floatingNav={floatingNav}
                          onFloatingNavChange={setFloatingNav}
                        />
                      )}
                      {/* ── Merged sub-project pages ── */}
                      {currentPage === 'yarnmachine' && <YarnMachineManagement />}
                      {currentPage === 'yarnquality' && <YarnQualityControl />}
                      {currentPage === 'yarnwarehouse' && <YarnWarehouseManagement />}
                      {currentPage === 'yarnhr' && <YarnHRManagement />}
                      {currentPage === 'yarnlive' && <YarnLiveDashboard />}
                      {currentPage === 'yarnshift' && <YarnShiftManagement />}
                      {currentPage === 'yarnforecast' && <YarnDemandForecasting />}
                      {currentPage === 'yarnsupplier' && <YarnSupplierPortal />}
                      {currentPage === 'yarncompliance' && <YarnComplianceReports />}
                      {currentPage === 'command-center' && <CommandCenter onNavigate={setCurrentPage} />}
                      {currentPage === 'integrations' && (user.role === 'ADMIN' ? <Integrations /> : <Typography role="alert">Company administrator access is required.</Typography>)}

                      {!allPages.includes(currentPage) && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                          </Typography>
                          <Typography color="text.secondary">This page is currently under development.</Typography>
                        </Box>
                      )}
                    </Box>
                    </Suspense>
                    </ErrorBoundary>
                  </Container>
                </Box>
              </Box>
              <ProfileModal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                currentUser={user}
                onUserUpdate={(updated) => {
                  const newUser = { ...user, ...updated };
                  setUser(newUser);
                  localStorage.setItem('user', JSON.stringify(newUser));
                }}
                mode={mode}
                onToggleTheme={toggleTheme}
                themeName={themeName}
                onThemeChange={setThemeName}
                language={language}
                onToggleLanguage={toggleLanguage}
                floatingNav={floatingNav}
                onFloatingNavChange={setFloatingNav}
                onNavigate={(pg) => {
                  setProfileModalOpen(false);
                  setCurrentPage(pg);
                }}
              />
            </ConfirmProvider>
          </KeyboardShortcutsProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
