import { uiText, useUiLanguage, setUiLanguage, uiLocale, uiTemplate, uiDateLocale, useTamilPreferences } from "./i18n";
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
  Typography,
  Divider,
  IconButton,
  ListItemIcon,
  Container,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ThemeProvider,
  CssBaseline,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  useMediaQuery,
  type PaletteMode,
} from '@mui/material';
import {
  Menu as MenuIcon,
  KeyboardArrowDownRounded,
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
import InstallationGate from './components/InstallationGate';
import ProfileModal from './components/ProfileModal';
import LanguageSelector from './components/LanguageSelector';
import WorkspaceNavigation, { type NavGroup } from './components/WorkspaceNavigation';
import { KeyboardShortcutsProvider } from './context/KeyboardShortcutsContext';
import { ScreenReaderAnnouncer } from './components/common/ScreenReaderAnnouncer';
import Breadcrumbs from './components/common/Breadcrumbs';
import ErrorBoundary from './components/common/ErrorBoundary';
import { NotificationsProvider, NotificationsBell } from './context/NotificationsContext';
import HelpdeskQuickReport from './components/HelpdeskQuickReport';
import { useNotificationSync } from './hooks/useNotificationSync';
import { useDebounce } from './hooks/useDebounce';
import { LinearProgress } from '@mui/material';
import NotFound404 from './components/common/NotFound404';
import { clearAuth, getStoredUser, saveUser } from './utils/authStorage';

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
const FloatingAgent = lazy(() => import('./components/FloatingAgent'));
const BookEllam = lazy(() => import('./pages/BookEllam'));

/** Provider support number in international digits, e.g. 919800000000. Set VITE_SUPPORT_PHONE when packaging. */
const SUPPORT_PHONE = /^\d{8,15}$/.test(String(import.meta.env.VITE_SUPPORT_PHONE ?? '')) ? String(import.meta.env.VITE_SUPPORT_PHONE) : '';

const drawerWidth = 280;
const drawerCollapsedWidth = 76;

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
  useUiLanguage();
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
    <Box sx={{ position: 'relative', width: '100%', minWidth: 0 }}>
      <TextField
        id="global-search-input"
        placeholder={uiText("Search invoices, stock, customers…", 'forms')}
        inputProps={{ 'aria-label': uiText("Search business records", 'forms') }}
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
          endAdornment: query ? (
            <InputAdornment position="end">
              {/* B-08: Use CloseIcon (not CollapseIcon/chevron) for semantic correctness */}
              <IconButton size="small" aria-label={uiText("Clear search", 'forms')} onClick={() => { setQuery(''); setResults([]); }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : <InputAdornment position="end"><Box component="kbd" sx={{ fontFamily: 'inherit', fontSize: 11, whiteSpace: 'nowrap', color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: .75, px: .75, display: { xs: 'none', md: 'block' } }}>{uiText("Ctrl K", 'forms')}</Box></InputAdornment>,
          sx: {
            bgcolor: 'action.hover',
            borderRadius: '8px',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.light' },
            transition: 'all 0.2s',
            boxShadow: 'none'
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
              ? uiText("Search is unavailable right now. Check the connection and try again.")
              : uiTemplate`No invoices, stock or customers match “${query}”.`}
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
      const savedUser = getStoredUser();
      return savedUser && savedUser !== 'undefined' ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Failed to parse user from localStorage:', e);
      return null;
    }
  });
  const [mode, setMode] = useState<PaletteMode>((localStorage.getItem('themeMode') as PaletteMode) || 'light');
  const [themeName, setThemeName] = useState<ThemeName>((localStorage.getItem('themeName') as ThemeName) || 'emerald');
  const language = useUiLanguage();
  const tamilPreferences = useTamilPreferences();
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
  const [drawerOpen, setDrawerOpen] = useState(() => localStorage.getItem('sidebarCollapsed') !== 'true');
  useEffect(() => { localStorage.setItem('sidebarCollapsed', String(!drawerOpen)); }, [drawerOpen]);
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

  const theme = useMemo(() => getTheme(mode, themeName, language, tamilPreferences), [mode, themeName, language, tamilPreferences]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Global CSS (glass cards, floating nav, native controls) follows the app theme rather than the OS.
    document.documentElement.dataset.themeMode = mode;
  }, [mode]);
  useEffect(() => { localStorage.setItem('themeName', themeName); }, [themeName]);
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

  const [languageSaving,setLanguageSaving]=useState(false);
  const languagePending=useRef(false);
  const toggleLanguage = async () => {
    if(languagePending.current)return;
    languagePending.current=true;setLanguageSaving(true);
    const next = language === 'en' ? 'ta' : 'en';
    setUiLanguage(next);
    try { await api.put('/settings', { language: next }); } catch { toast.error(uiText('Language changed on this device only; it could not be saved to your account.', 'feedback')); }finally{languagePending.current=false;setLanguageSaving(false);}
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
      clearAuth();
      await queryClient.cancelQueries();
      queryClient.clear();
      setUser(null);
      handleProfileClose();
    }
  };

  const handleLogin = (userData: any) => {
    queryClient.clear();
    saveUser(userData);
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
      toast.error(uiText('Sync failed. Please try again.', 'feedback'));
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
      label: 'Overview',
      items: [
        { text: 'Business Workspace', icon: <StoreIcon />, page: 'workspace' },
        { text: 'Dashboard', icon: <DashboardIcon />, page: 'dashboard' },
        { text: "Today's Summary", icon: <SummaryIcon />, page: 'today' },
        { text: 'Operations Command', icon: <SpeedIcon />, page: 'command-center', description: 'Interactive factory campus, recorded operations and machine inspections' },
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
        { text: 'Helpdesk', icon: <HelpdeskIcon />, page: 'helpdesk', description: 'Installation support tickets, conversations and resolution evidence' },
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

  const labelFor = (label: string) => uiText(label, 'navigation');

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLoginSuccess={handleLogin} settings={settings} />
      </ThemeProvider>
    );
  }

  const seenPages = new Set<string>();
  const visibleNavGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const page = canonicalPage(item.page);
      if (seenPages.has(page) || !isCompanyPageVisible(item.page, settings) || (item.requiredRole && item.requiredRole !== user.role)) return false;
      seenPages.add(page);
      return true;
    }),
  })).filter(group => group.items.length);
  const currentNavGroup = visibleNavGroups.find(group => group.items.some(item => item.page === currentPage));
  const currentNavItem = currentNavGroup?.items.find(item => item.page === currentPage);
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
                  <Typography variant="h3" gutterBottom>{uiText("Service Suspended")}</Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, textAlign: 'center' }}>
                    {uiText("Your account has been temporarily suspended due to billing or licensing issues. Please contact the Provider Administrator to restore service. ")}</Typography>
                </Box>
              )}

              {settings?.isMaintenance && (
                <Box sx={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  bgcolor: 'rgba(15, 23, 42, 0.92)', zIndex: 99998, display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <SyncIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h3" gutterBottom>{uiText("System Under Maintenance")}</Typography>
                  <Typography variant="h6" sx={{ maxWidth: 600, textAlign: 'center', color: '#94a3b8' }}>
                    {uiText("Scheduled upgrades and database maintenance are currently in progress. Normal operations will resume shortly. ")}</Typography>
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
                      {uiText("⏳ 30-Day Active Grace Quota: ")}</Typography>
                    <Typography variant="body2">
                      {uiText("Your license is pending renewal, but your mill operations are completely uninterrupted. ")}{settings.graceExpiresAt && uiTemplate` Grace protection active until ${new Date(settings.graceExpiresAt).toLocaleDateString(uiDateLocale())}.`}
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
                        {uiText("Connect with Licensing Desk (WhatsApp) ")}</Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        component="a"
                        href={`tel:+${SUPPORT_PHONE}`}
                        sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', borderRadius: 1.5 }}
                      >
                        {uiText("Call Support ")}</Button>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{uiText("Contact your EverGreen provider to renew.")}</Typography>
                  )}
                </Box>
              )}
              <Box sx={{
                display: 'flex',
                minHeight: '100vh',
                width: '100%',
                bgcolor: 'background.default',
                color: 'text.primary',
                overflow: 'hidden'
              }}>
                <Box component="a" href="#workspace-main" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}
                  sx={{ position: 'fixed', top: 8, left: 16, zIndex: 1500, p: 1.5, bgcolor: 'background.paper', color: 'text.primary', border: '2px solid', borderColor: 'primary.main', borderRadius: 1, transform: 'translateY(-150%)', '&:focus': { transform: 'translateY(0)' } }}>{uiText("Skip to content")}</Box>
                <AppBar
                  position="fixed"
                  sx={{
                    zIndex: (theme) => theme.zIndex.drawer - 1,
                    left: isCompact ? 0 : drawerOpen ? drawerWidth : drawerCollapsedWidth,
                    width: isCompact ? '100%' : `calc(100% - ${drawerOpen ? drawerWidth : drawerCollapsedWidth}px)`,
                    bgcolor: 'background.paper',
                    borderRadius: 0,
                    backdropFilter: 'none',
                    transition: theme => theme.transitions.create(['left', 'width']),
                  }}
                >
                  <Toolbar sx={{ gap: { xs: 1, md: 2 }, px: { xs: '16px !important', md: '24px !important' }, py: { xs: 1, sm: 0 }, minHeight: { xs: 112, sm: 72 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    {isCompact && <Tooltip title={uiText("Open navigation")}>
                      <IconButton color="inherit"
                        aria-label={isCompact ? uiText("Open navigation") : drawerOpen ? uiText("Collapse navigation") : uiText("Expand navigation")}
                        aria-expanded={isCompact ? mobileNavOpen : drawerOpen} aria-controls="workspace-navigation"
                        onClick={handleDrawerToggle} sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
                        <MenuIcon />
                      </IconButton>
                    </Tooltip>}
                    <Box sx={{ flex: { xs: 1, sm: '0 1 230px' }, minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: 10, color: 'text.secondary', letterSpacing: '.07em', textTransform: 'uppercase', display: { xs: 'none', md: 'block' } }}>{labelFor(currentNavGroup?.label || 'Workspace')}</Typography>
                      <Typography noWrap title={currentNavItem ? labelFor(currentNavItem.text) : currentPage} sx={{ fontSize: { xs: 15, md: 17 }, fontWeight: 700, lineHeight: 1.4 }}>{currentNavItem ? labelFor(currentNavItem.text) : currentPage}</Typography>
                    </Box>
                    <Box sx={{ order: { xs: 3, sm: 0 }, flex: { xs: '1 0 100%', sm: '1 1 220px' }, minWidth: 0, maxWidth: { sm: 440 }, ml: { sm: 'auto' } }}>
                      <GlobalSearch onNavigate={setCurrentPage} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: .5, ml: { sm: 'auto' }, '& > .MuiIconButton-root': { width: 40, height: 40 } }}>
                      <NotificationsBell onNavigate={setCurrentPage} />
                      <HelpdeskQuickReport page={currentPage}/>

                      <LanguageSelector language={language} disabled={languageSaving} onChange={selected=>{if(selected!==language)void toggleLanguage()}} />

                      <Tooltip title={uiText("Sync All Data")} arrow>
                        <IconButton onClick={handleSync} color="primary" disabled={isSyncing} aria-label={isSyncing ? uiText("Refreshing data") : uiText("Refresh all data")} sx={{
                          display: { xs: 'none', md: 'inline-flex' },
                          bgcolor: 'rgba(46, 125, 50, 0.08)',
                          '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.15)' }
                        }}>
                          <SyncIcon className={isSyncing ? 'spin-icon' : ''} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={uiText("Toggle Theme")} arrow>
                        <IconButton onClick={toggleTheme} color="inherit" aria-label={mode === 'dark' ? uiText("Switch to light theme") : uiText("Switch to dark theme")} sx={{ display: { xs: 'none', md: 'inline-flex' } }}>
                          {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={uiText("Account Settings")} arrow>
                        <Button onClick={handleProfileClick} color="inherit" aria-label={uiText("Account menu")} aria-haspopup="menu" aria-expanded={profileMenuOpen} aria-controls={profileMenuOpen ? 'account-menu' : undefined} sx={{ p: .5, minWidth: 0, gap: 1, ml: .5, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', textAlign: 'left', '&:hover': { transform: 'none', boxShadow: 'none' } }}>
                          <Avatar
                            alt={user.name || user.username}
                            sx={{
                              bgcolor: 'primary.dark',
                              width: 36,
                              height: 36,
                              fontSize: '0.9rem',
                              fontWeight: 'bold',
                              border: '2px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            {(user.name || user.username)?.charAt(0).toUpperCase()}
                          </Avatar>
                            <Box sx={{ display: { xs: 'none', lg: 'block' }, maxWidth: 110, minWidth: 0 }}><Typography fontSize={12} fontWeight={650} noWrap>{user.name || user.username}</Typography><Typography fontSize={10} color="text.secondary" noWrap>{(user.role || 'VIEWER').toLowerCase()}</Typography></Box>
                          <KeyboardArrowDownRounded sx={{ fontSize: 17, display: { xs: 'none', sm: 'block' } }} />
                      </Button>
                      </Tooltip>

                      <Menu
                        id="account-menu"
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
                          {uiText("My Profile & Account ", 'forms')}</MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigateTo('security'); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><SecurityIcon fontSize="small" /></ListItemIcon>
                          {uiText("Security & 2FA ", 'forms')}</MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigateTo('sessions'); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><SessionsIcon fontSize="small" /></ListItemIcon>
                          {uiText("Active Sessions ", 'forms')}</MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); navigateTo('settings'); }} sx={{ borderRadius: '8px', py: 1 }}>
                          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                          {uiText("System Settings ", 'forms')}</MenuItem>
                        <Divider sx={{ my: 0.5, display: { md: 'none' } }} />
                        <MenuItem onClick={() => { handleProfileClose(); void handleSync(); }} disabled={isSyncing} sx={{ display: { md: 'none' } }}><ListItemIcon><SyncIcon fontSize="small" /></ListItemIcon>{uiText("Refresh all data", 'forms')}</MenuItem>
                        <MenuItem onClick={() => { handleProfileClose(); toggleTheme(); }} sx={{ display: { md: 'none' } }}><ListItemIcon>{mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}</ListItemIcon>{mode === 'dark' ? uiText("Light theme", 'forms') : uiText("Dark theme", 'forms')}</MenuItem>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1.5, m: 0.5, borderRadius: '8px' }}>
                          <ListItemIcon sx={{ color: 'error.main' }}>
                            <LogoutIcon fontSize="small" />
                          </ListItemIcon>
                          {uiText("Logout ", 'forms')}</MenuItem>
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
                      overflowX: 'hidden',
                      height: '100dvh',
                      borderRadius: 0,
                      maxWidth: 'calc(100vw - 24px)',
                      backgroundImage: 'none',
                      bgcolor: 'background.paper',
                    },
                  }}
                >
                  <WorkspaceNavigation
                    groups={visibleNavGroups}
                    currentPage={currentPage} expanded={navExpanded} compact={isCompact}
                    companyName={settings?.companyName || 'EverGreen'} logo={settings?.logo}
                    username={user.name || user.username} role={user.role || 'VIEWER'}
                    labelFor={labelFor} onNavigate={navigateTo} onToggle={handleDrawerToggle}
                    onProfile={() => { setMobileNavOpen(false); setProfileModalOpen(true); }}
                    onLogout={handleLogout}
                  />
                </Drawer>
                <Box
                  component="main"
                  id="workspace-main"
                  tabIndex={-1}
                  ref={mainRef}
                  sx={{
                    flexGrow: 1,
                    p: { xs: 2, md: 3 },
                    width: isCompact ? '100%' : `calc(100% - ${drawerOpen ? drawerWidth : drawerCollapsedWidth}px)`,
                    minWidth: 0,
                    height: '100dvh',
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
                  <Box aria-hidden="true" sx={{ minHeight: { xs: 112, sm: 72 }, flexShrink: 0, mb: 1 }} />
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
                      {currentPage === 'integrations' && (user.role === 'ADMIN' ? <Integrations /> : <Typography role="alert">{uiText("Company administrator access is required.")}</Typography>)}

                      {!allPages.includes(currentPage) && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                            {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
                          </Typography>
                          <Typography color="text.secondary">{uiText("This page is currently under development.")}</Typography>
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
                  saveUser(newUser);
                }}
                language={language}
                onToggleLanguage={toggleLanguage}
                onNavigate={(pg) => {
                  setProfileModalOpen(false);
                  setCurrentPage(pg);
                }}
              />
              <Suspense fallback={null}>
                <FloatingAgent key={`${user.username}:${user.role}`} username={user.username} />
              </Suspense>
            </ConfirmProvider>
          </KeyboardShortcutsProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default function LicensedApp() {
  useUiLanguage(); return <InstallationGate url={(import.meta.env.VITE_API_URL || '/api/backend').replace(/\/+$/, '') + '/license/status'}><App /></InstallationGate>; }
